# RK Transport admin

The admin UI uses backend JWT authentication in an httpOnly cookie. It does not rely on localStorage for an authentication token.

## Sign-in

- Open `/admin`.
- Use the admin username and password configured for the backend through `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- The backend seeds this user if it does not yet exist. Use a strong production password and `SECRET_KEY`; never put credentials in frontend source or client environment variables.

## Dashboard

- **Bookings**: review customer details and requests, update status, enter an AED quote, and add internal notes.
- **Inquiries**: review contact messages and set follow-up status.
- **Site settings**: manage phone, WhatsApp, email, address, route label, availability, booking time slots, blocked dates, header CTA, footer copy and SEO fields. The **Admin notifications** controls select admin email/WhatsApp delivery; enabling email also sends booking confirmations to customers with an email address.
- **Website content**: edit JSON objects for hero banners, services, pickup/drop-off locations, routes, vehicle types, storage plans, FAQs, testimonials, page copy and about content. Route pricing is `base_price_aed`; vehicle-type pricing is `surcharge_aed`; storage pricing is `price_aed`. `image_url` and `image_alt` fields control image source and alternative text.

## SEO and analytics

Set `NEXT_PUBLIC_SITE_URL` to the production website origin in the frontend environment. It is used to create canonical URLs, structured-data URLs, and `sitemap.xml`. Optionally set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the GA4 measurement ID and `GOOGLE_SITE_VERIFICATION` to the Search Console HTML verification token.

The site-wide SEO title, description, and social sharing image are editable under **Site settings**. To override an individual page title or description, add a **Page copy** item with the matching key and value:

- `seo.home.title` / `seo.home.description`
- `seo.about.title` / `seo.about.description`
- `seo.services.title` / `seo.services.description`
- `seo.contact.title` / `seo.contact.description`
- `seo.quote.title` / `seo.quote.description`
- `seo.storage.title` / `seo.storage.description`
- `seo.dubai-to-abu-dhabi-car-transport.title` / `.description`
- `seo.abu-dhabi-to-dubai-car-transport.title` / `.description`
- `seo.car-lift-recovery.title` / `.description`
- `seo.service.<service-slug>.title` / `seo.service.<service-slug>.description` for an individual service

Google Analytics is omitted unless a valid GA4 measurement ID is configured. The admin and sign-in paths are disallowed in `robots.txt` and marked noindex.

Changes are persisted in the backend database. Images must first be uploaded to the configured Vercel Blob or Cloudinary provider, then their returned URL and alt text can be saved in the content item.
