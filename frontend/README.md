# Softlligence Manufacturing Cloud — Web (`frontend/`)

Next.js 14 App Router. Deploy target: **Vercel**.

## Local run

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000
```

Rewrites `/api/v1/*` → `API_URL` (default `http://localhost:5001`).

## Folder map

```
frontend/
  src/
    app/                 routes + globals (Tailwind)
    components/          UI by feature
      foundation/
    lib/
      api/               fetch helpers
    features/            (Section 2+) domain UI
```

Styling: **Tailwind CSS v3** (`tailwind.config.js` theme tokens: canvas, accent, ok, bad, …).
