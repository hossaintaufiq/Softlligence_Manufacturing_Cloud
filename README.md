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
# Terminal 1 — API
npm run dev:backend

# Terminal 2 — Web
npm run dev:frontend
```

Or from each folder: `backend` → `npm run dev` (:5001), `frontend` → `npm run dev` (:3000).

- Health: http://localhost:5001/api/v1/health  
- Ready: http://localhost:5001/api/v1/ready  
- App: http://localhost:3000  

## Docs & plan

- Build sequence: [`plan.md`](./plan.md)
- Specs: [`documents/`](./documents/)
- Section as-built: [`documents/sections/`](./documents/sections/) (Section 1 Foundation)
- Deploy: [`documents/DEPLOY.md`](./documents/DEPLOY.md)
