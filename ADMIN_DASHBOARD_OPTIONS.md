# RK Transport Admin Dashboard Guide

This guide explains what each Admin Dashboard page controls and how changes affect the public website. Sign in at `/admin` with your administrator account. The dashboard is intended for routine content and booking updates; do not share your sign-in details.

## Dashboard overview

The dashboard shows booking totals, new bookings, today's bookings, confirmed, completed and cancelled bookings, and the number of customer messages. Charts summarize recent bookings by date, route, service and status. Recent bookings are listed below the charts. The figures refresh automatically.

Use **Sign out** when you finish working.

## Dashboard

### Bookings

Use this page to follow up on customer booking requests.

- Search by customer name, booking reference, phone number or email.
- Filter by service or booking status.
- Review the customer's contact details, requested service, pickup and drop-off details, vehicle and notes.
- Use **Call**, **WhatsApp** or **Email** to contact the customer when those details are available.
- Change the booking status: New, Quoted, Confirmed, In progress, Completed or Cancelled.
- Enter or update the quote in AED and add internal admin notes.
- Select **Save booking** to keep your changes.
- Select **Export CSV** to download the bookings currently shown after filters are applied.

The **New** badge marks a booking that has not yet moved from its new status.

### Enquiries

Read messages sent through the website contact form. Each enquiry includes the sender's name and contact details, subject, message and received date. Change the status to **New**, **Read**, **Replied** or **Archived** to track follow-up.

### Notifications

Review the history of email and WhatsApp delivery attempts. Each entry shows its channel, event, recipient, status, attempt count and any reported delivery error. Use **Retry** on a failed item to try sending it again. This page refreshes automatically.

## Website pages

Most content pages have a list of entries and an **Add new** button. Open **Edit** to change an entry. **Show on website** controls whether an item is public; use the list's **Show** or **Hide** button for a quick visibility change. Use the up and down arrows to change display order where order is relevant. **Delete** permanently removes an entry after confirmation.

Images are uploaded through the image picker; you do not need to paste an image address. After uploading, add a description when useful for screen readers and search engines. Save the form to attach the uploaded image to the content.

### Homepage banners

Manage the rotating banners at the top of the home page. Each banner can have:

- A heading, sub-heading, optional short description and optional small badge.
- Button text and a destination page, or a custom link.
- A banner picture and its description.
- A **Show on website** setting.

Add multiple banners and order them with the arrows; they play in that order on the home page. Use **Live banner preview** to check the composition before saving. **View on website** opens the home page.

### Services

Create and edit the service cards and their individual detail pages. Set the service name, short card summary, full description, service type, optional starting-price note and main picture. The description editor supports bold text, bullet lists and links. The service address is generated from its name.

**Show on website** controls whether customers can browse the service. **View on website** opens the services page.

### About page

Edit the main About page in three sections:

1. **Our story** — heading, sub-heading, formatted story text, picture and whether the picture appears on the left or right.
2. **Numbers** — up to four statistic cards, each with a number, label and optional plus sign. Use the arrows to reorder them.
3. **Why choose us** — cards with an icon, title and description. Add, remove or reorder cards.
Save the page when finished. **View on website** opens the public About page.

### FAQs

Add a question and answer, choose where it appears (Home, Services, Booking, Storage or all pages), and decide whether it should be shown. Use the arrows to change the order of questions.

### Testimonials

Add a customer's name, their comment and a rating from one to five stars. Use **Show on website** to publish or hide the testimonial.

## Booking options

These pages configure choices used by customers when they request a service. Keep these options accurate so the booking form presents valid locations, routes, prices and availability.

### Locations

Add a customer-facing location name and select whether it belongs to Dubai or Abu Dhabi. Choose whether customers may use it for pickup, drop-off or both. Hidden locations are not offered as public choices.

### Routes and prices

Create a route by choosing **From** and **To** locations. Enter the base price in AED and, if useful, an estimated travel time in minutes. Route names are composed from the selected locations; you do not need to enter location IDs. Use **Show on website** to enable or hide a route.

### Vehicle types

Manage vehicle choices shown during booking. Enter a name such as SUV and an optional extra charge in AED. A charge of zero means there is no extra charge. Hide vehicle types that should no longer be selectable.

### Storage plans

Set each plan's name, description, price in AED and billing period (per day, per week or per month). **Show on website** controls whether customers can see the plan.

### Booking availability

- Turn **Available 24/7** on to indicate that bookings can be requested at any time. The time-slot list is disabled while this is on.
- Turn it off to manage available times. Add times with the time picker and remove times that should no longer be offered.
- Under **Days we are closed or fully booked**, block dates that customers should not be able to select. Remove a date chip to make that date available again.
- Select **Save availability** to apply the setting.

The 24/7 switch also controls the site's availability message; the wording for non-24/7 hours is set in Business settings.

## Settings

### Business settings

These details appear in the public site header, contact areas, footer and other business information:

- **Business details** — business name, short description, main logo and optional dark-mode logo. If a dark-mode logo is not provided, the normal logo is used in both themes.
- **Contact details** — main phone number, WhatsApp number, contact email, street address, city, emirate, country and map link. Phone numbers should use UAE international format such as `+971501234567`; links should start with `https://`.
- **Social media links** — Facebook and Instagram profile links.
- **Opening hours** — the 24/7 switch or the opening-hours text shown to customers.
- **Admin notifications** — enable or disable notification emails and WhatsApp messages, and set the team email address and phone number that receive them. Provider credentials are configured separately by the website administrator.
- **Footer text** — a short business description shown near the bottom of the public pages.

Select **Save business settings** after editing. **View website** opens the public home page.

### My account

Change the administrator password by entering the current password, a new password of at least 12 characters, and confirming the new password.

## Saving and public updates

Content pages display a success or error message after saving. Some pages warn before leaving if there are unsaved changes. For list-based content, create or edit an item and select **Save changes**; image uploads by themselves do not publish the item until it is saved.

Successful content and settings changes request a refresh of the public website's cached pages. Depending on deployment and caching, allow up to about a minute for an update to appear. Use **View on website** or refresh the public page to check it.

Hiding an item keeps it in the admin list so it can be shown again later. Deleting an item is permanent; use **Hide** instead if you may need it again.
