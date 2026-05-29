# Todo List Web App

A Dockerized full-stack Todo List application.

Stack:

* Frontend: Vue/Vite served by Nginx
* Backend: NestJS + Prisma
* Database: MySQL 8.0
* Deployment: Docker Compose

## Architecture

```text
Browser
  -> localhost:8080
  -> Nginx frontend container
  -> /api proxy
  -> NestJS backend
  -> Prisma
  -> MySQL
```

## Quick Start

Clone the repository:

```bash
git clone https://github.com/Lav0000/devops-labs0-todolist/tree/VM
cd devops-labs0-todolist
```

Start the stack:

```bash
docker compose up -d --build
```

Run database migration:

```bash
docker compose run --rm backend yarn prisma migrate deploy
```

Open the app:

```text
http://localhost:8080
```

## URLs

Frontend:

```text
http://localhost:8080
```

Backend API:

```text
http://localhost:3000/api
```

API through Nginx:

```text
http://localhost:8080/api
```

MySQL host port:

```text
localhost:3307
```

## API Test

List todos:

```bash
curl http://localhost:8080/api
```

Create a todo:

```bash
curl -X POST http://localhost:8080/api \
  -H "Content-Type: application/json" \
  -d '{"task":"Learn Docker Compose","completed":false,"dueDate":"2026-06-01"}'
```

List again:

```bash
curl http://localhost:8080/api
```

## Runtime Configuration

Backend environment:

```env
PORT=3000
DATABASE_URL=mysql://kali:kali@mysql:3306/k8s_ingress
```

MySQL environment:

```env
MYSQL_ROOT_PASSWORD=kali
MYSQL_DATABASE=k8s_ingress
MYSQL_USER=kali
MYSQL_PASSWORD=kali
```

Inside Docker Compose, services communicate by service name:

```text
frontend -> backend:3000
backend  -> mysql:3306
```

Do not use `localhost` for container-to-container communication.

## Prisma Migration

Prisma Client is generated during backend image build.

Database migration is a runtime operation:

```bash
docker compose run --rm backend yarn prisma migrate deploy
```

Run migration when:

* starting with a fresh database volume
* new Prisma migrations are added
* the database volume was removed

If the database volume already exists and no new migration was added, migration does not need to be run again.

## Data Persistence

MySQL data is stored in a named Docker volume:

```yaml
todo_mysql_data:/var/lib/mysql
```

Stop the stack while keeping data:

```bash
docker compose down
```

Reset the database completely:

```bash
docker compose down -v
docker compose up -d --build
docker compose run --rm backend yarn prisma migrate deploy
```

## Troubleshooting

If the API reports that table `todos` does not exist, run:

```bash
docker compose run --rm backend yarn prisma migrate deploy
```

If backend cannot connect to MySQL, check that `DATABASE_URL` uses:

```text
mysql://kali:kali@mysql:3306/k8s_ingress
```

If frontend returns `502 Bad Gateway`, ensure Nginx proxies API requests to:

```nginx
proxy_pass http://backend:3000/api;
```

## Expected Result

After deployment:

```bash
curl http://localhost:8080/api
```

On a fresh database, expected response:

```json
[]
```
