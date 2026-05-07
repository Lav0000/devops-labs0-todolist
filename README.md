# TODO App

<div align="center">
  <img src="./demo.png" />
</div>

# Local development

Run `yarn install` (or `npm install`) for both `backend` and `frontend`.

The backend expects a MySQL server to already be running outside this repo and exposed on `localhost:3307`. The current backend env is configured to connect with:

```bash
DB_HOST=localhost
DB_PORT=3307
DB_USER=kali
DB_PASSWORD=kali
DB_NAME=k8s_ingress
```

Then run the backend migrations:

```bash
cd backend
yarn migrate:deploy
```

Start the backend:

```bash
cd backend
yarn start:dev
```

Start the frontend:

```bash
cd frontend
yarn dev
```

Finally open `http://localhost:5173`.
