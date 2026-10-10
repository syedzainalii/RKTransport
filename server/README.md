# RK Transport API

FastAPI backend for the RK Transport website, bookings, content management, and admin.

## Local development

1. Use Python 3.11 or newer.
2. Copy `.env.example` to `.env` and configure `DATABASE_URL`, `SECRET_KEY`, and the admin credentials.
3. Install and run:

   ```powershell
   pip install -r requirements.txt
   alembic upgrade head
   python scripts\seed_database.py
   uvicorn main:app --reload
   ```

The API is available at `http://localhost:8000`; OpenAPI docs are at `/docs`. The public API prefix is `/api/v1`. Schema changes are applied with Alembic, and `scripts/seed_database.py` seeds defaults explicitly. The application does not run schema creation or seeding during startup, avoiding database DDL and seed work on Vercel cold starts.

Run the seed command from the `server/` directory after migrations. It creates the configured admin user and default site settings, locations and routes, services, vehicle types, fleet cars, storage plans, hero slide, FAQs, and page copy (including the homepage section banner keys and booking steps). It is safe to run again; existing default records are not duplicated.

## Deploy

Deploy `server/` as the backend Vercel project using its `vercel.json` and `api/index.py`. Configure `DATABASE_URL` with the database provider's pooled connection string and strong secrets as Vercel environment variables. Run `alembic upgrade head` and `python scripts/seed_database.py` as a deployment task before routing traffic to the new build. For production, set `COOKIE_SECURE=true`, restrict `ALLOWED_ORIGINS` to the frontend origin, and configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for image uploads. `FRONTEND_URL` and `REVALIDATE_SECRET` must refer to the deployed frontend and match its revalidation route. Vercel's `VERCEL` environment variable selects SQLAlchemy `NullPool` for per-invocation connections.

The frontend proxies browser requests through its same-origin `/api/v1` route. Keep `API_BASE_URL` private in the frontend deployment environment; it is the backend origin, without `/api/v1`.

## Authentication and validation

Admin sessions use JWTs in httpOnly cookies. Passwords are hashed before persistence. Public booking and inquiry payloads are validated and rate limited. The settings and all editable content are persisted in PostgreSQL.

## Migrations

Alembic configuration and schema migrations are under `alembic/`. Review and apply migrations using the configured database before deploying schema changes.

See the repository's [deployment guide](../DEPLOYMENT.md) for the full Vercel, pooled-Postgres, uploads, cookie/CORS, migration, and post-launch SEO procedure.
