# Fire Creative — Full Stack Website

A React (Vite + Tailwind) frontend with a Node.js (Express + PostgreSQL via Prisma) backend.

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (Docker Desktop recommended) or a managed Postgres

## Quick Start

```bash
# From the project root
npm install                         # installs root dev tools (concurrently)

# Install client & server deps
npm install --prefix client
npm install --prefix server

# Run both dev servers
npm run dev
```

## Environment
Create `server/.env` with:

```
POSTGRES_URL=postgresql://user:pass@host:5432/dbname?schema=public
PORT=5000
```

If `POSTGRES_URL` is not set, the API starts without DB connection (read/write operations will fail), which is fine for frontend scaffolding.

## Scripts
- Root `dev`: runs client (Vite) and server (nodemon) concurrently.
- Client `dev`: Vite dev server at http://localhost:5173
- Server `dev`: Express API at http://localhost:5000

## Structure

```
fire-creative/
  client/      # Vite + React + Tailwind
  server/      # Express + PostgreSQL (Prisma)
```

## Deploy
- Frontend: Build with `npm run build --prefix client` → `client/dist`
- Backend: Deploy `server` folder to your Node host with env vars
- Database: Use Docker Compose `postgres` service or point `POSTGRES_URL` to your managed database

## License
Proprietary — All rights reserved by Fire Acoustic (Pvt) Ltd.
