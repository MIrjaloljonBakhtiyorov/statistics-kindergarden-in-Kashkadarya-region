# Tizim arxitekturasi

## Backend

- Runtime: Node.js
- Framework: Express.js
- Til: TypeScript
- Database: PostgreSQL
- Kirish nuqtasi: `src/server.ts`
- Express app: `src/app.ts`
- Environment sozlamalari: `src/config/env.ts`
- PostgreSQL ulanishi: `src/db/pool.ts`
- Health API: `src/routes/health.routes.ts`

## Frontend

- Framework: React
- Til: TypeScript
- Build tool: Vite
- API manzili: `VITE_API_URL`

## Lokal ishga tushirish

Backend papkasida:

```bash
npm install
docker-compose up -d postgres
npm run dev
```

Frontend papkasida:

```bash
npm install
npm run dev
```

Backend API: `http://localhost:4000/api`
Frontend: `http://localhost:5173`
