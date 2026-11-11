# Borrow My Stuff

Borrow My Stuff is a MERN campus marketplace for sharing useful items and small tasks with a domain-restricted student community.

[![CI](https://github.com/YOURUSERNAME/borrow-my-stuff/actions/workflows/ci.yml/badge.svg)](https://github.com/YOURUSERNAME/borrow-my-stuff/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Features

- Browse, search, filter, and sort item listings.
- Create borrow/rent or informational sale listings with up to six photos.
- Request items through transactional booking workflows.
- Owner booking management with explicit status transitions.
- Post and accept campus help gigs.
- HttpOnly cookie authentication, CSRF protection, security headers, and rate limiting.
- Domain-restricted signup for approved college email domains.

## Architecture

```text
client/  React + Vite + Tailwind CSS
server/  Express 5 + Mongoose + MongoDB
```

The client communicates with the server through `client/src/api`. The server exposes REST endpoints under `/api` and Swagger documentation at `/api/docs`.

## Local setup

Requirements: Node.js 20+, MongoDB replica set or MongoDB Atlas for booking transactions.

```powershell
git clone https://github.com/YOURUSERNAME/borrow-my-stuff.git
cd borrow-my-stuff
cd server
npm install
Copy-Item .env.example .env
```

Configure `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/borrowbox
JWT_SECRET=replace-with-at-least-32-random-characters
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false
UPLOAD_DIR=uploads/items
MAX_IMAGE_SIZE_MB=5
MAX_ITEM_IMAGES=6
```

Start each app in a separate terminal:

```powershell
cd server
npm run dev

cd ..\client
npm install
npm run dev
```

Open `http://localhost:5173`. API health is available at `http://localhost:5000/health`.

## Booking transaction design

Booking creation atomically claims an available item and creates its booking in one Mongoose session transaction. Booking updates use optimistic status matching and the documented state machine. Deployments without replica-set or sharded transaction support return an explicit `503 TRANSACTIONS_UNAVAILABLE`; they never fall back to unsafe updates.

## Local image storage

Uploaded JPEG, PNG, and WebP files are stored under `server/uploads/items` and referenced by permanent `/uploads/items/...` URLs. Local storage is suitable for development only; use persistent object storage before deploying multiple or ephemeral server instances.

## Tests and CI

```powershell
cd server
npm test

cd ..\client
npm run lint
npm run build
```

GitHub Actions runs server tests and client lint/build on pushes and pull requests.

## License

MIT. See [LICENSE](./LICENSE).
