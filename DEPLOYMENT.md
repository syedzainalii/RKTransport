# RK Transport deployment and release checklist

## 1. Create the database

Create a PostgreSQL database in Neon or Supabase. Copy the provider's **pooled** connection string (not the direct connection endpoint) and configure SSL. Set it as `DATABASE_URL` in the backend Vercel project's Production environment; use the same variable in a local `server/.env` only when you intend to run migrations against that database.

The backend example is `server/.env.example`. It documents every setting read by the backend. `VERCEL` is injected by Vercel and must not be set manually. Never commit real connection strings, passwords, signing keys, or provider tokens.

Before deploying the API, run these commands from `server/` using the same `DATABASE_URL` as the deployment:

```powershell
python -m alembic upgrade head
python scripts\seed_database.py
```

Run these commands from `server/` with the backend environment configured to use the production pooled `DATABASE_URL`. Migrations are ordered `001` through `004`; `head` applies the current complete schema. Run migrations as a deliberate deployment step, not from a Vercel build or function startup. The standalone seed command creates the configured admin user, site settings, services, locations and routes, booking-step page copy, FAQs, and hero slide. It is safe to rerun without duplicating default records. Verify the database backup/restore procedure before production migration.

## 2. Deploy the backend on Vercel

1. Create a Vercel project for this repository and set **Root Directory** to `server`.
2. Keep the checked-in `server/vercel.json`; `api/index.py` is the Python serverless entry point.
3. In Project Settings, select a function region close to the database. Vercel sets `VERCEL` automatically; SQLAlchemy uses `NullPool` in that environment.
4. Set these backend variables in Development, Preview, and Production as appropriate:
   - `DATABASE_URL`: pooled PostgreSQL URL with SSL.
   - `SECRET_KEY`: cryptographically random secret of at least 32 characters.
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` (at least 12 characters), `ADMIN_EMAIL`.
   - `ALLOWED_ORIGINS`: exact frontend origin(s), comma-separated; never `*`.
   - `FRONTEND_URL`: canonical frontend origin, without a trailing slash.
   - `REVALIDATE_SECRET`: random secret matching the frontend value.
   - `COOKIE_SECURE=true`, `COOKIE_SAMESITE=lax`, `COOKIE_NAME=access_token`.
   - One upload provider: `BLOB_READ_WRITE_TOKEN`, or all of `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
   - `DEBUG=false`.
5. Deploy and check `/health`. A healthy response does not replace migration/seed verification.

## 3. Deploy the frontend on Vercel

1. Create a second Vercel project for the same repository and set **Root Directory** to `client`.
2. Keep the checked-in `client/vercel.json` and Next.js framework detection.
3. Set:
   - `API_BASE_URL`: backend Vercel origin, without `/api/v1`.
   - `NEXT_PUBLIC_SITE_URL`: canonical public website origin, such as `https://www.example.com`.
   - `SECRET_KEY` and `COOKIE_NAME`: exactly match the backend.
   - `REVALIDATE_SECRET`: exactly match the backend.
   - Optional `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `GOOGLE_SITE_VERIFICATION`.
4. Deploy and test the public site, booking form, `/admin`, and `/login`.

`client/.env.example` documents frontend environment values. The browser calls the same-origin `/api/v1` proxy; keep `API_BASE_URL` server-only.

## 4. Uploads, domain, CORS, and cookies

- For Vercel Blob, create a Blob store and add its `BLOB_READ_WRITE_TOKEN` to the **backend** project. Alternatively, configure all Cloudinary values on the backend. Uploads are held in memory during processing and sent to the provider; the app does not persist uploads to local disk.
- Assign the chosen custom domain to the frontend project. Use that exact `https://` origin for `NEXT_PUBLIC_SITE_URL`, `FRONTEND_URL`, and an entry in backend `ALLOWED_ORIGINS`.
- If using a separate API subdomain, point the backend project to it and set `API_BASE_URL` to that origin. Do not add a browser CORS wildcard.
- The preferred setup leaves `COOKIE_DOMAIN` blank: the same-origin frontend proxy sets a host-only cookie on the frontend domain. If the cookie must be shared by sibling subdomains, use a parent domain such as `.example.com`; keep HTTPS and `COOKIE_SECURE=true`. Do not set `SameSite=None` unless cross-site cookie use is genuinely required; browsers require `Secure` with `None`.
- Keep `COOKIE_NAME` and `SECRET_KEY` identical between frontend proxy and backend. Rotate a secret by coordinating both deployments and invalidating existing sessions.
- Run migrations and the seed command in a controlled pre-deployment job with the production pooled URL. Do not paste production secrets into source control or chat.

## 5. Security hardening gates

- The frontend currently sets standard security headers but does not set a Content Security Policy. Choose and test a CSP strategy before claiming CSP coverage; a nonce-based policy may require dynamic rendering and affect static-page performance.
- Login and public-post rate limits are process-local and best-effort on serverless. Use a shared rate-limit store/provider before relying on them as production brute-force protection or account lockout.

## 6. Post-launch SEO checklist

- Verify the canonical domain in Google Search Console and complete HTML-token verification using `GOOGLE_SITE_VERIFICATION`.
- Submit `https://<canonical-domain>/sitemap.xml` in Search Console; confirm it lists active dynamic services after the backend is available.
- Inspect `https://<canonical-domain>/robots.txt`; check that `/admin` and `/login` remain disallowed and noindex.
- Configure GA4 with `NEXT_PUBLIC_GA_MEASUREMENT_ID`; test realtime visits and booking conversion events before relying on reports.
- Create/claim the Google Business Profile; verify the business name, service area, phone, hours, website, and category.
- Make consistent local directory/citation listings using the same name, address, and phone details.
- Ask real customers for honest reviews after completed bookings; respond promptly and never offer incentives for positive reviews.
- Validate representative pages in Search Console URL Inspection and Schema Markup Validator. Structured data describes content; it does not guarantee a rich result.

## 7. Release validation and QA record

Run from `client/`:

```powershell
npm run lint
npm run type-check
npm run build
```

Run backend unit tests from `server/`:

```powershell
python -m unittest discover -s tests -v
```

The release smoke test should cover the following at 320px, 768px, and 1440px in both light and dark themes:

- Mobile navigation opens, closes, and navigates; the bottom contact action bar does not cover content.
- Theme toggle changes theme without an initial theme flash.
- Home navigation is transparent at scroll position zero, becomes solid while scrolling, and is solid on other public pages without changing header height.
- Submit a booking and verify the success/reference screen, then find the booking in admin.
- Configure real provider credentials and verify one email and WhatsApp delivery; remove a credential in staging and confirm a recorded failure rather than a false success.
- Check the new-booking badge, readable route chart labels, dashboard charts, and CSV export.
- Edit public content and settings and confirm frontend revalidation.
- Inspect each public page's title, description, canonical, Open Graph/Twitter metadata, H1 count, links, image alt text, and JSON-LD. Include a live service detail page.

Build/type/lint and mocked backend unit-test results are recorded with the release. Browser/device checks, a Lighthouse score, external delivery, and production-database flows must be run against the deployed environment; a successful local build is not evidence of those external checks.
