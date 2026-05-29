# DevOps Lab 0 - Todo List Dockerized

This project is a Dockerized full-stack Todo List application.

The stack includes:

* Frontend: Vue/Vite served by Nginx
* Backend: NestJS + Prisma
* Database: MySQL 8.0
* Reverse proxy: Nginx frontend container proxies `/api` requests to backend
* Registry: Docker Hub

## Docker Hub Images

Backend image:

```bash
lav404/todo-backend:v0.1.0
```

Frontend image:

```bash
lav404/todo-frontend:v0.1.0
```

## Project Structure

```text
devops-labs0-todolist/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── yarn.lock
│   ├── prisma/
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.container.conf
│   ├── package.json
│   ├── yarn.lock
│   └── src/
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

## Prerequisites

Make sure the following tools are installed:

```bash
docker --version
docker compose version
```

Docker must be running before starting the stack.

## Services

The application contains three main services:

| Service    | Description                                             | Port                             |
| ---------- | ------------------------------------------------------- | -------------------------------- |
| `mysql`    | MySQL 8.0 database                                      | `localhost:3307 -> mysql:3306`   |
| `backend`  | NestJS API server                                       | `localhost:3000 -> backend:3000` |
| `frontend` | Nginx serving Vue/Vite static files and proxying `/api` | `localhost:8080 -> frontend:80`  |

Internal container communication:

```text
frontend -> backend:3000
backend  -> mysql:3306
```

External access from host:

```text
Frontend: http://localhost:8080
Backend API: http://localhost:3000/api
API through frontend Nginx: http://localhost:8080/api
MySQL host port: localhost:3307
```

## Environment Variables

The backend uses the following runtime environment variables:

```env
PORT=3000
DATABASE_URL=mysql://kali:kali@mysql:3306/k8s_ingress
```

Important note:

```text
Do not copy .env into Docker images.
Runtime configuration must be passed through Docker Compose environment variables.
```

The MySQL service uses:

```env
MYSQL_ROOT_PASSWORD=kali
MYSQL_DATABASE=k8s_ingress
MYSQL_USER=kali
MYSQL_PASSWORD=kali
```

## Run in Development Mode

This mode builds backend and frontend images from local source code.

```bash
docker compose up -d --build
```

Check running containers:

```bash
docker compose ps
```

Run Prisma migration:

```bash
docker compose run --rm backend yarn prisma migrate deploy
```

Test backend API:

```bash
curl http://localhost:3000/api
```

Test frontend:

```bash
curl http://localhost:8080
```

Test API through frontend Nginx reverse proxy:

```bash
curl http://localhost:8080/api
```

Expected API result on a fresh database:

```json
[]
```

## Run from Docker Hub Images

This mode uses already pushed Docker Hub images instead of building from local source.

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --pull always
```

Check running containers:

```bash
docker compose -f docker-compose.prod.yml ps
```

Run Prisma migration:

```bash
docker compose -f docker-compose.prod.yml run --rm backend yarn prisma migrate deploy
```

Test backend API:

```bash
curl http://localhost:3000/api
```

Test frontend:

```bash
curl http://localhost:8080
```

Test API through frontend Nginx:

```bash
curl http://localhost:8080/api
```

Expected API result on a fresh database:

```json
[]
```

## Test Create Todo

The API uses `task`, `completed`, and `dueDate` fields.

Create a todo through the frontend Nginx reverse proxy:

```bash
curl -X POST http://localhost:8080/api \
  -H "Content-Type: application/json" \
  -d '{"task":"Test through frontend nginx","completed":false,"dueDate":"2026-06-01"}'
```

List todos:

```bash
curl http://localhost:8080/api
```

Expected result should include the newly created todo.

## Prisma Migration Notes

This project uses Prisma.

During Docker image build, Prisma Client is generated inside the backend image:

```dockerfile
RUN yarn prisma generate
```

Database migration is not executed inside the Dockerfile.

Correct migration command:

```bash
docker compose run --rm backend yarn prisma migrate deploy
```

or for Docker Hub image mode:

```bash
docker compose -f docker-compose.prod.yml run --rm backend yarn prisma migrate deploy
```

Reason:

```text
prisma generate creates Prisma Client for the application.
prisma migrate deploy applies database schema changes to the actual database.
Migration is a runtime database operation, not a build-time image operation.
```

## Stop the Stack

For development Compose:

```bash
docker compose down
```

For Docker Hub image Compose:

```bash
docker compose -f docker-compose.prod.yml down
```

These commands stop and remove containers and networks, but keep the database volume.

## Remove Database Volume

Use this only when you want to reset the database completely.

Development Compose:

```bash
docker compose down -v
```

Docker Hub image Compose:

```bash
docker compose -f docker-compose.prod.yml down -v
```

Warning:

```text
The -v option removes the MySQL named volume.
All database data will be deleted.
After this, migration must be run again.
```

## Docker Hub Push Commands

The images were tagged and pushed with:

```bash
docker tag todo-backend:dev lav404/todo-backend:v0.1.0
docker tag todo-frontend:dev lav404/todo-frontend:v0.1.0
```

```bash
docker push lav404/todo-backend:v0.1.0
docker push lav404/todo-frontend:v0.1.0
```

## Pull-back Validation

The Docker Hub images were validated with:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --pull always
```

Then tested with:

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000/api
curl http://localhost:8080
curl http://localhost:8080/api
```

Successful validation means:

```text
Backend image can run from Docker Hub.
Frontend image can run from Docker Hub.
MySQL starts correctly with a named volume.
Prisma migration can be applied.
Frontend Nginx can serve static files.
Frontend Nginx can proxy /api to backend.
Backend can connect to MySQL through Docker Compose network.
```

## Common Troubleshooting

### Backend cannot connect to database

Check service status:

```bash
docker compose ps
docker compose logs mysql
docker compose logs backend
```

Correct backend database URL inside Compose:

```env
DATABASE_URL=mysql://kali:kali@mysql:3306/k8s_ingress
```

Do not use:

```env
localhost:3306
host.docker.internal:3307
mysql:3307
```

Inside Docker Compose, backend must connect to MySQL by service name and container port:

```text
mysql:3306
```

### MySQL downgrade error

If MySQL reports an error like:

```text
Invalid MySQL server downgrade
```

the database volume may have been initialized by a newer MySQL version.

For this lab, use a fixed MySQL version:

```yaml
image: mysql:8.0
```

If the data is not important, reset the volume:

```bash
docker compose down -v
docker compose up -d --build
docker compose run --rm backend yarn prisma migrate deploy
```

### API says table does not exist

If the backend returns an error like:

```text
The table `todos` does not exist in the current database.
```

run migration:

```bash
docker compose run --rm backend yarn prisma migrate deploy
```

or in production Compose mode:

```bash
docker compose -f docker-compose.prod.yml run --rm backend yarn prisma migrate deploy
```

### Frontend Nginx returns 502

Check whether backend is running:

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

The frontend Nginx config should proxy API requests to:

```nginx
proxy_pass http://backend:3000/api;
```

Do not use `localhost:3000` inside the frontend container.

## Final Result

The project can be run fully with Docker Compose:

```text
Browser / curl
  -> localhost:8080
  -> frontend Nginx container
  -> /api reverse proxy
  -> backend NestJS container
  -> Prisma
  -> MySQL container
```

The project has been Dockerized and pushed to Docker Hub successfully.
