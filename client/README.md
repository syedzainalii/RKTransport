# RK Transport frontend

Next.js App Router frontend for the RK Transport UAE vehicle transport, lift/recovery, and storage business.

## Local development

1. Copy `.env.example` to `.env.local`. Set `API_BASE_URL` to the FastAPI backend root (for local work, `http://localhost:8000`), and set `SECRET_KEY` to the same value as the backend JWT signing secret. Keep `COOKIE_NAME` in sync with the backend.
2. Install dependencies and start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

3. Start the backend separately using the instructions in `../server/README.md`.

Open `http://localhost:3000`. The frontend uses the same-origin `/api/v1` proxy for browser API calls so the backend's httpOnly authentication cookie is not exposed to JavaScript. Server-rendered content fetches use the private `API_BASE_URL`.

## Checks

```powershell
npm run lint
npm run type-check
npm run build
```

## Deployment

Deploy `client/` as the Vercel Next.js project. Set `API_BASE_URL` to the deployed FastAPI origin, set `SECRET_KEY` and `COOKIE_NAME` to match the backend, and set `REVALIDATE_SECRET` to the same value configured by the backend. Do not add a `/api/v1` suffix to `API_BASE_URL`.

Image URLs stored in site content should point to Vercel Blob or Cloudinary. For additional image hosts, add a narrowly scoped host to `next.config.mjs`.

See the repository's [deployment guide](../DEPLOYMENT.md) for the full two-project Vercel setup, database migration/seed sequence, cookie and CORS settings, and launch checklist.
