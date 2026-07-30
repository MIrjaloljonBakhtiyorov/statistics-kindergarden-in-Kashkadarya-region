# Raqamli MTT Architecture

This project is organized as a modular backend with one frontend app, one shared
PostgreSQL database, and domain services that can still be mounted through the
main API for compatibility. The codebase has three product areas:

- Public statistics home page
- Regional admin panel
- Kindergarten internal portal

## Runtime Flow

```text
Browser
  -> React frontend
  -> shared API client
  -> Express backend routes or a domain microservice
  -> controller/service/repository
  -> PostgreSQL
```

## Frontend Layout

```text
frontend/src/
  app/                  Application composition and routing
    providers.tsx       Application providers such as Router and i18n
    router.tsx          Top-level route tree
  shared/
    api/                Axios client and shared endpoint wrappers
    ui/                 Reusable UI primitives
    lib/                Shared helpers
    types/              Shared TypeScript types
  features/
    home/               Public statistics and login screens
    kindergarten-admin/ Regional admin panel
    kindergarten/       Kindergarten internal portal
```

Current compatibility note: old feature-local API client files still exist as
adapters, but they delegate to `frontend/src/shared/api`.

## Backend Layout

```text
backend/src/
  app.ts                Express app composition
  index.ts              Server startup only
  config/               Environment configuration
  db/                   Future migrations and seeds
    schema.ts           Runtime schema bootstrap entrypoint
    initializeSchema.ts Backward-compatible schema initializer
  shared/               Shared backend utilities
  modules/
    admin/              Regional admin API
    kindergarten/       Kindergarten portal API
    parents-portal/     Parent portal microservice API
```

Kindergarten routes are split by domain in `backend/src/modules/kindergarten/routes`.
Each endpoint is mounted from an explicit domain route module.

The parent portal is separated into its own controller/service/repository module
and can run as a standalone service:

```bash
cd backend
pnpm run dev:parent-portal
```

Standalone parent portal endpoints are mounted under `/api` on
`PARENT_PORTAL_PORT` (default `4002`). Set
`VITE_PARENT_PORTAL_API_BASE_URL=http://localhost:4002/api` to route parent
portal API calls directly to this service. The same routes are also mounted in
the main backend so existing frontend API calls remain compatible.

## Database

The app uses PostgreSQL. The connection string comes from `DATABASE_URL`.

On startup the current schema is bootstrapped by:

```text
backend/src/db/schema.ts
backend/src/db/initializeSchema.ts
```

Future schema changes should move toward migration files:

```text
backend/src/db/migrations/
backend/src/db/seeds/
```

Run migrations before production startup:

```bash
cd backend
npm run migrate
npm run build
npm start
```

## Deploy Rule

Code can be rebuilt freely, but PostgreSQL data must live in a persistent
database or Docker volume. Do not run `docker compose down -v` in production
unless you intentionally want to remove database data.
   



### Frontend section wrote 
React.js
Typescript.js
Node.js
### dabase 
PostreSql
### API 
Typescript 
### Express.js
express.js, node.js, typescript.js
