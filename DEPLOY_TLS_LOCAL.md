# Local TLS Deployment Guide

Tài liệu này mô tả cách cấu hình TLS local cho frontend chạy qua Nginx, dùng self-signed certificate, reverse proxy `/api` sang backend NestJS ở `127.0.0.1:3000`.

## Mục tiêu

- Frontend static build được serve bởi Nginx
- HTTP `:80` redirect sang HTTPS `:443`
- Domain local dùng được:
  - `localhost`
  - `todolist.local`
- API `/api` được proxy sang backend local tại `http://127.0.0.1:3000`

## Điều kiện trước khi làm

- Frontend build được bằng `yarn build`
- Backend đang chạy ở port `3000`
- Nginx đã được cài trên máy
- Có quyền `sudo`

Kiểm tra backend:

```bash
curl http://127.0.0.1:3000/api
sudo ss -lntp | grep ':3000'
```

Kết quả mong đợi:

- `curl` trả về `[]`
- port `3000` đang được process `node` lắng nghe

## Bước 1: Build frontend

Chạy trong thư mục `frontend`:

```bash
yarn build
```

Sau khi build thành công, thư mục `dist/` phải tồn tại:

```bash
ls -la dist
```

Các file quan trọng thường có:

- `dist/index.html`
- `dist/assets/*`
- `dist/.vite/manifest.json`

## Bước 2: Deploy static files vào Nginx web root

Tạo thư mục đích:

```bash
sudo mkdir -p /var/www/todolist
```

Copy build output:

```bash
sudo rsync -av --delete dist/ /var/www/todolist
```

Phân quyền cho Nginx:

```bash
sudo chown -R www-data:www-data /var/www/todolist
sudo chmod -R 755 /var/www/todolist
```

## Bước 3: Khai báo hostname local

Mở file hosts:

```bash
sudo nano /etc/hosts
```

Thêm dòng:

```text
127.0.0.1 localhost todolist.local
```

Kiểm tra:

```bash
ping -c 2 todolist.local
```

Kết quả mong đợi: `todolist.local` resolve về `127.0.0.1`

## Bước 4: Tạo self-signed certificate

Tạo thư mục chứa cert:

```bash
sudo mkdir -p /etc/nginx/ssl/todolist
```

Sinh certificate và private key:

```bash
sudo openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/todolist/todolist.key \
  -out /etc/nginx/ssl/todolist/todolist.crt \
  -subj "/C=VN/ST=Local/L=Local/O=DevOpsLab/OU=TLS/CN=todolist.local" \
  -addext "subjectAltName=DNS:localhost,DNS:todolist.local,IP:127.0.0.1"
```

Set permission:

```bash
sudo chmod 600 /etc/nginx/ssl/todolist/todolist.key
sudo chmod 644 /etc/nginx/ssl/todolist/todolist.crt
```

Kiểm tra thông tin cert:

```bash
openssl x509 -in /etc/nginx/ssl/todolist/todolist.crt -noout -subject -issuer -dates
```

Kết quả mong đợi:

- `CN=todolist.local`
- `issuer` là self-signed
- `notBefore` và `notAfter` hợp lệ

## Bước 5: Cấu hình Nginx site

Tạo file `/etc/nginx/sites-available/todolist`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name localhost todolist.local;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name localhost todolist.local;

    root /var/www/todolist;
    index index.html;

    ssl_certificate     /etc/nginx/ssl/todolist/todolist.crt;
    ssl_certificate_key /etc/nginx/ssl/todolist/todolist.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;
        proxy_redirect off;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

Enable site:

```bash
sudo ln -sf /etc/nginx/sites-available/todolist /etc/nginx/sites-enabled/todolist
```

Kiểm tra symlink:

```bash
ls -la /etc/nginx/sites-enabled
```

## Bước 6: Validate và reload Nginx

Test config:

```bash
sudo nginx -t
```

Nếu hợp lệ:

```bash
sudo systemctl reload nginx
```

## Bước 7: Verify end-to-end

### HTTP redirect sang HTTPS

```bash
curl -I http://localhost
```

Kết quả mong đợi:

- status `301 Moved Permanently`
- header `Location: https://localhost/`

### HTTPS frontend

```bash
curl -k -I https://localhost
curl -k -I https://todolist.local
```

Kết quả mong đợi:

- status `200 OK`
- `Server: nginx`

### HTTPS API proxy

```bash
curl -k https://localhost/api
curl -k https://todolist.local/api
```

Kết quả mong đợi:

- response `[]`

### Kiểm tra certificate đang được serve

```bash
openssl s_client -connect localhost:443 -servername todolist.local </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer
```

Kết quả mong đợi:

- `subject` chứa `CN=todolist.local`
- `issuer` trùng subject vì đây là self-signed cert

## File và đường dẫn quan trọng

- Frontend source: [frontend/index.html](/home/kali/DevOpsLab/lab0-todolist/devops-labs0-todolist/frontend/index.html:1)
- Frontend build output: `/var/www/todolist`
- Nginx site config: `/etc/nginx/sites-available/todolist`
- TLS cert: `/etc/nginx/ssl/todolist/todolist.crt`
- TLS key: `/etc/nginx/ssl/todolist/todolist.key`

## Ghi chú vận hành

- `curl -k` được dùng vì certificate là self-signed, chưa được trust bởi OS/browser.
- Nếu muốn hết cảnh báo trình duyệt, cần import cert vào trust store local hoặc dùng local CA như `mkcert`.
- Route `/api` đang proxy trực tiếp sang backend local ở `127.0.0.1:3000`, không đi qua `host.docker.internal`.
- Nếu frontend là SPA, `try_files $uri $uri/ /index.html;` là cần thiết để reload route không bị `404`.

## Kết quả mong đợi cuối cùng

- `http://localhost` tự redirect sang HTTPS
- `https://localhost` mở được frontend
- `https://todolist.local` mở được frontend
- `https://localhost/api` và `https://todolist.local/api` trả dữ liệu từ backend
