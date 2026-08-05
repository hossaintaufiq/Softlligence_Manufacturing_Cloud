# Softlligence Manufacturing Cloud — API (`backend/`)

Express + TypeScript modular monolith (Nest-oriented folders). Deploy target: **Render**.

## Local run

```bash
cd backend
cp .env.example .env   # set DATABASE_URL + DIRECT_URL from Supabase
npm install
npx prisma generate
npx prisma migrate dev --name foundation
npm run db:seed        # optional
npm run dev            # http://localhost:5001
```

## Endpoints (Section 1)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/health` | Liveness (no DB) |
| GET | `/api/v1/ready` | Readiness (DB ping) |

Later sections mount under `/api/v1/auth`, `/tenants`, `/org`, etc. (501 stubs until built).

## Folder map

```
backend/
  prisma/           schema + seed
  src/
    config/         env, prisma client
    common/         errors, middleware, logger
    modules/        bounded contexts (health + stubs)
    routes/         API router composition
    types/
    app.ts
    index.ts
```
