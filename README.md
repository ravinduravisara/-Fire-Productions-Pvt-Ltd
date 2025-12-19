# Fire Creative — Full Stack Website

A React (Vite + Tailwind) frontend with a Node.js (Express + MongoDB) backend.

## Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas or local MongoDB (optional for UI dev)

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
MONGO_URI=your-mongodb-connection-string
PORT=5000
```

If `MONGO_URI` is not set, the API starts without DB connection (read/write operations will fail), which is fine for frontend scaffolding.

## Scripts
- Root `dev`: runs client (Vite) and server (nodemon) concurrently.
- Client `dev`: Vite dev server at http://localhost:5173
- Server `dev`: Express API at http://localhost:5000

## Structure

```
fire-creative/
  client/      # Vite + React + Tailwind
  server/      # Express + MongoDB (Mongoose)
```

## Deploy
- Frontend: Build with `npm run build --prefix client` → `client/dist`
- Backend: Deploy `server` folder to your Node host with env vars

## License
Proprietary — All rights reserved by Fire Acoustic (Pvt) Ltd.
