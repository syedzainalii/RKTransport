# RK Transport admin

The admin UI uses backend JWT authentication in an httpOnly cookie. It does not rely on localStorage for an authentication token.

## Sign-in

- Open `/admin`.
- Use the admin username and password configured for the backend through `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- The backend seeds this user if it does not yet exist. Use a strong production password and `SECRET_KEY`; never put credentials in frontend source or client environment variables.

## Dashboard

- **Bookings**: review customer details and requests, update status, enter an AED quote, and add internal notes.
- **Enquiries**: review contact messages and set follow-up status.
- **Business settings**: edit business/contact details, logos, social links, opening hours, admin notification recipients, and footer copy. Upload logos directly; no URL entry is needed.
- **Website pages**: use the separate Homepage banners, Services, About page, FAQs, and Testimonials pages. Each has a plain-language editor; picture descriptions are stored with their images.
- **Booking options**: edit Locations, Routes and prices, Vehicle types, Storage plans, and Booking availability using the separate pages. Route names are selected from locations rather than entered as IDs.
- List ordering is controlled by the up/down buttons, and visibility is controlled by the **Show on website** toggle. Saves revalidate the public site.

## SEO and analytics

Set `NEXT_PUBLIC_SITE_URL` to the production website origin in the frontend environment. It is used to create canonical URLs, structured-data URLs, and `sitemap.xml`. Optionally set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the GA4 measurement ID and `GOOGLE_SITE_VERIFICATION` to the Search Console HTML verification token.

Page titles and descriptions for Google use the site's configured defaults and service metadata. The site-wide social-sharing image and favicon are intentionally managed in code.

Google Analytics is omitted unless a valid GA4 measurement ID is configured. The admin and sign-in paths are disallowed in `robots.txt` and marked noindex.

Changes are persisted in the backend database. Image upload fields save the uploaded image and its description with the selected content automatically.
