# Deploy Guide — Vercel + Render + Supabase

| Field | Value |
|-------|--------|
| **Version** | 1.0.0 |
| **Status** | Active |
| **Profile** | Simple hosting (not AWS/K8s) |
| **ADR** | [`adrs/ADR-0013-vercel-render-supabase.md`](./adrs/ADR-0013-vercel-render-supabase.md) |

---

## Architecture

```
Browser
   │
   ├─► Vercel (Next.js)     FRONTEND_URL
   │         │
   │         │  NEXT_PUBLIC_API_URL
   │         ▼
   └─► Render (Node API)    /api/v1
              │
              ▼
         Supabase Postgres
```

Optional later: Render Redis (sessions/jobs), Render Worker.

---

## 1. Supabase (database)

1. Create project  
2. Copy **pooler** URL → `DATABASE_URL`  
3. Copy **direct** URL → `DIRECT_URL`  
4. Run migrations from API app when code exists: `npx prisma migrate deploy`  
5. Seed when ready: `npx prisma db seed`

---

## 2. Render (API)

1. New **Web Service** from GitHub repo  
2. Root directory: `apps/api` (or `backend` during bridge)  
3. Build: `npm install && npx prisma generate && npm run build`  
4. Start: `npm run start`  
5. Env vars:

| Key | Example |
|-----|---------|
| `DATABASE_URL` | Supabase pooler |
| `DIRECT_URL` | Supabase direct |
| `JWT_SECRET` | long random |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `CORS_ORIGINS` | same as FRONTEND_URL (comma-list if multiple) |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAME_SITE` | `none` (cross-site Vercel↔Render) |
| `PORT` | Render sets automatically |

6. Note public URL: `https://xxxx.onrender.com`

**Free tier note:** Render may sleep; first request can be slow.

---

## 3. Vercel (frontend)

1. Import GitHub repo  
2. Root: `apps/web` (or `frontend`)  
3. Framework: Next.js  
4. Env:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://xxxx.onrender.com/api/v1` |

5. Deploy  
6. Add Vercel URL to Render `CORS_ORIGINS` / `FRONTEND_URL` and **redeploy API**

---

## 4. Cookie / CORS checklist (important)

Because Vercel and Render are **different sites**:

- API: `COOKIE_SAME_SITE=none` + `COOKIE_SECURE=true`  
- Frontend fetch: `credentials: 'include'`  
- CORS must allow the exact Vercel origin  

If cookies fail, Bearer token in memory/localStorage can bridge early — prefer httpOnly long-term (ADR-0009).

---

## 5. Local development

| App | Command | URL |
|-----|---------|-----|
| API | `npm run dev` in api | `http://localhost:5001` |
| Web | `npm run dev` in web | `http://localhost:3000` |

Local env:

- `FRONTEND_URL=http://localhost:3000`  
- `CORS_ORIGINS=http://localhost:3000`  
- `COOKIE_SECURE=false`  
- `COOKIE_SAME_SITE=lax`  
- `NEXT_PUBLIC_API_URL=` empty → use Next rewrite to `localhost:5001` **or** set full local API URL  

---

## 6. Smoke test after deploy

1. Open Vercel URL  
2. API `/health` returns online  
3. Login works  
4. `/auth/me` works  
5. One create+list action works  
6. Cross-origin: no CORS errors in browser console  

---

## 7. What we are not doing now

- AWS Amplify / EKS / ECS  
- Kubernetes  
- Multi-region  
- Cloudflare enterprise WAF (optional later)  

Scale-up path remains in Review 2 §23 when needed.
