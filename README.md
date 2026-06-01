# Statistics Kindergarten In Kashkadarya Region

Full-stack application with a React/Vite frontend and Express/TypeScript backend.

## Project Structure

```text
frontend/          React + TypeScript + Vite app
backend/           Node.js + Express + TypeScript API
docker-compose.yml Local Docker setup for both services
```

## Local Development

Install dependencies separately:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.
Backend runs on `http://localhost:4001`.

## Docker

```bash
docker compose up --build
```
