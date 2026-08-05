# Softlligence Manufacturing Cloud

Multi-tenant manufacturing ERP / MIS. Steel is the first industry template.

## Stack (near-term)

| Layer | Local | Deploy |
|-------|--------|--------|
| Web | `frontend/` → `:3000` | Vercel |
| API | `backend/` → `:5001` | Render |
| DB | Supabase Postgres | Supabase |

## Quick start

```bash
# API
cd backend
cp .env.example .env   # set DATABASE_URL + DIRECT_URL
npm install
npx prisma generate
npx prisma migrate deploy   # or: npm run db:migrate
npm run dev

# Web (second terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- Health: http://localhost:5001/api/v1/health  
- App: http://localhost:3000  

## Docs & plan

- Build sequence: [`plan.md`](./plan.md)
- Specs: [`documents/`](./documents/)
- Deploy: [`documents/DEPLOY.md`](./documents/DEPLOY.md)
