from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    About,
    Faq,
    HeroBanner,
    Location,
    PageCopy,
    Route,
    Service,
    SiteSettings,
    StoragePlan,
    User,
    VehicleType,
)


PAGE_COPY = {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.storage": "Storage",
    "nav.quote": "Get a quote",
    "nav.contact": "Contact",
    "quote.heading": "Request a quote",
    "quote.subheading": "Dubai ⇄ Abu Dhabi car transport, lift & recovery, and secure storage. Available 24/7.",
    "quote.success": "Quote received. We will confirm by phone shortly.",
    "home.hero.title": "Car transport, recovery & storage",
    "home.hero.description": "Vehicle transport between Dubai and Abu Dhabi, lift and recovery, and car storage.",
    "home.services.eyebrow": "How we help",
    "home.services.heading": "Transport support, when you need it",
    "home.services.link": "Explore services",
    "home.services.details": "Service details",
    "home.promise.route.title": "Dubai ⇄ Abu Dhabi",
    "home.promise.route.description": "Two-way vehicle transport between the Emirates.",
    "home.promise.recovery.title": "Lift & recovery",
    "home.promise.recovery.description": "Roadside support and vehicle recovery.",
    "home.promise.storage.title": "Car storage",
    "home.promise.storage.description": "Flexible vehicle storage options.",
    "home.faqs.eyebrow": "Answers",
    "home.faqs.heading": "Frequently asked questions",
    "services.heading": "Transport and vehicle services",
    "services.details": "Learn more",
    "services.detail.cta": "Request this service",
    "contact.heading": "Contact RK Transport",
    "contact.subheading": "Available 24/7 for transport, recovery, and storage across the UAE.",
    "storage.heading": "Car storage",
    "storage.subheading": "Choose from available vehicle storage options.",
    "storage.cta": "Ask about storage",
    "empty.storage": "Storage options are currently unavailable.",
    "track.heading": "Track your booking",
    "empty.services": "Services will appear here once published.",
    "home.booking.heading": "Request transport, recovery or storage",
    "home.booking.description": "Share your details and our team will contact you to confirm the next steps.",
    "home.steps.heading": "How booking works",
    "home.steps.eyebrow": "Simple and straightforward",
    "home.about.eyebrow": "About us",
    "home.about.link": "More about RK Transport",
    "home.testimonials.eyebrow": "Customer feedback",
    "home.testimonials.heading": "Trusted to move what matters",
    "home.routes.eyebrow": "Core corridor",
    "home.routes.heading": "Indexable routes and services",
    "booking.steps": '[{"title":"Tell us what you need","description":"Choose transport, recovery, or storage and share your vehicle details."},{"title":"Confirm your route and time","description":"Select locations and a suitable time; we will confirm the details with you."},{"title":"We get you moving","description":"Our team contacts you with next steps and your service arrangement."}]',
    "seo.home.title": "RK Transport | Dubai ⇄ Abu Dhabi Car Transport",
    "seo.home.description": "24/7 car transportation, lift & recovery, and car storage in the UAE. Core route Dubai ⇄ Abu Dhabi.",
    "seo.about.title": "About RK Transport | UAE Car Transport",
    "seo.about.description": "RK Transport moves cars between Dubai and Abu Dhabi, recovers vehicles around the clock, and offers secure storage.",
    "seo.services.title": "Car Transport, Recovery & Storage Services | RK Transport",
    "seo.services.description": "Vehicle transport on the Dubai–Abu Dhabi corridor, 24/7 lift and recovery, and flexible car storage plans.",
    "seo.quote.title": "Request a Car Transport Quote | RK Transport",
    "seo.quote.description": "Request Dubai to Abu Dhabi car transport, recovery, or storage. Available 24/7 across the UAE.",
    "seo.contact.title": "Contact RK Transport | 24/7 UAE Vehicle Support",
    "seo.contact.description": "Call or message RK Transport for car transport, lift and recovery, or storage anywhere we operate.",
    "seo.track.title": "Track Your Booking | RK Transport",
    "seo.track.description": "Enter your RK Transport booking reference to check the current status of your vehicle move.",
    "seo.storage.title": "Car Storage in the UAE | RK Transport",
    "seo.storage.description": "Covered and open car storage with collection and delivery on the Dubai ⇄ Abu Dhabi route. Flexible weekly and monthly plans.",
    "seo.dubai-to-abu-dhabi.title": "Dubai to Abu Dhabi Car Transport | RK Transport",
    "seo.dubai-to-abu-dhabi.description": "Door-to-door car transport from Dubai to Abu Dhabi, 24/7. Enclosed and open options for private and commercial vehicles.",
    "seo.abu-dhabi-to-dubai.title": "Abu Dhabi to Dubai Car Transport | RK Transport",
    "seo.abu-dhabi-to-dubai.description": "Car transport from Abu Dhabi to Dubai around the clock. Share pickup details and we confirm a same-day window.",
    "seo.car-lift-recovery.title": "Car Lift & Recovery UAE | RK Transport",
    "seo.car-lift-recovery.description": "24/7 car lift, breakdown, accident, and roadside recovery in the UAE. Flatbed and winch support for cars, SUVs, and light commercials.",
    "landing.dubai-to-abu-dhabi.h1": "Dubai to Abu Dhabi car transport",
    "landing.dubai-to-abu-dhabi.intro": "RK Transport runs a dedicated Dubai → Abu Dhabi corridor for private cars, SUVs, and light commercial vehicles. Share your pickup area and drop-off address and we confirm a collection window the same day — including overnight moves.",
    "landing.dubai-to-abu-dhabi.body": "This route is set up for one-way deliveries into Abu Dhabi: apartments, compounds, dealerships, and yards. We coordinate building access, basement height limits, and handover photos so the vehicle arrives in the condition it left Dubai. If you also need the return trip later, book Abu Dhabi to Dubai as a separate move or as a paired job.",
    "landing.abu-dhabi-to-dubai.h1": "Abu Dhabi to Dubai car transport",
    "landing.abu-dhabi-to-dubai.intro": "Moving a vehicle from Abu Dhabi into Dubai — including Dubai Marina, Downtown, Business Bay, and the northern emirates handover points we serve from the city — is a core RK Transport route, not a detour.",
    "landing.abu-dhabi-to-dubai.body": "We collect from Abu Dhabi islands, Khalifa City, Mussafah, and surrounding areas, then run a scheduled Dubai drop. Use this page if Dubai is the destination; use the Dubai to Abu Dhabi page if you are sending a car the other way. Recovery and storage can be added if the vehicle cannot be driven to the collection point.",
    "landing.car-lift-recovery.h1": "Car lift & recovery",
    "landing.car-lift-recovery.intro": "When a vehicle cannot be driven, RK Transport dispatches lift and recovery: breakdowns, accident scenes (once police release the vehicle), battery or puncture situations that need a flatbed, and basement extractions where a standard tow is unsafe.",
    "landing.car-lift-recovery.body": "Call the recovery line in the header for urgent dispatch, or request lift & recovery on the quote form if the vehicle is stable and you can wait for a confirmed window. We recover cars, SUVs, and light commercials. After recovery we can store the vehicle or continue it as a Dubai ⇄ Abu Dhabi transport job.",
    "landing.storage.h1": "Car storage",
    "landing.storage.intro": "Store a vehicle while you travel, wait on a sale, or between homes. RK Transport offers open and covered bays with collection and delivery along our Dubai ⇄ Abu Dhabi corridor.",
    "landing.storage.body": "Plans are weekly or monthly. Covered bays suit longer stays and higher-value cars; open yards suit short holds. Tell us the make, expected duration, and whether the car should be collected from Dubai or Abu Dhabi. Storage is not valet parking — access is coordinated, not walk-up 24/7 self-entry unless agreed in writing.",
}


def seed_defaults(db: Session) -> None:
    if not db.query(User).filter(User.username == settings.ADMIN_USERNAME).first():
        db.add(
            User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                is_admin=True,
                is_active=True,
            )
        )

    current_settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if not current_settings:
        db.add(
            SiteSettings(
                id=1,
                brand_name="RK Transport",
                tagline="Car transport, lift & recovery, and storage across the UAE",
                phone_primary=None,
                phone_recovery=None,
                whatsapp=None,
                email=None,
                address_line=None,
                city=None,
                emirate=None,
                country="United Arab Emirates",
                available_24_7=True,
                hours_label="Available 24/7",
                timezone="Asia/Dubai",
                currency_code="AED",
                currency_symbol="AED",
                core_route_label="Dubai ⇄ Abu Dhabi",
                header_cta_label="Get a quote",
                header_cta_href="/quote",
                seo_title="RK Transport | Dubai ⇄ Abu Dhabi Car Transport",
                seo_description="24/7 car transportation, lift & recovery, and car storage in the UAE. Core route Dubai ⇄ Abu Dhabi.",
                footer_blurb="RK Transport moves cars between Dubai and Abu Dhabi, recovers vehicles around the clock, and stores them securely.",
            )
        )
    else:
        for field in ("phone_primary", "phone_recovery", "whatsapp"):
            if getattr(current_settings, field) == "+971500000000":
                setattr(current_settings, field, None)
        if current_settings.email == "hello@rktransport.ae":
            current_settings.email = None
        if current_settings.address_line == "Dubai, United Arab Emirates":
            current_settings.address_line = None

    if not db.query(Location).first():
        dubai = Location(
            name="Dubai",
            slug="dubai",
            emirate="Dubai",
            is_hub=True,
            sort_order=1,
            is_active=True,
        )
        ad = Location(
            name="Abu Dhabi",
            slug="abu-dhabi",
            emirate="Abu Dhabi",
            is_hub=True,
            sort_order=2,
            is_active=True,
        )
        db.add_all([dubai, ad])
        db.flush()
        db.add_all(
            [
                Route(
                    origin_location_id=dubai.id,
                    destination_location_id=ad.id,
                    title="Dubai → Abu Dhabi",
                    is_core=True,
                    sort_order=1,
                    is_active=True,
                ),
                Route(
                    origin_location_id=ad.id,
                    destination_location_id=dubai.id,
                    title="Abu Dhabi → Dubai",
                    is_core=True,
                    sort_order=2,
                    is_active=True,
                ),
            ]
        )

    if not db.query(Service).first():
        db.add_all(
            [
                Service(
                    title="Car Transport",
                    slug="car-transport",
                    short_description="Enclosed and open car transportation on the core Dubai ⇄ Abu Dhabi corridor, both directions.",
                    detailed_description="RK Transport moves private and commercial vehicles between Dubai and Abu Dhabi 24/7. Share pickup and drop-off details and we confirm a window the same day.",
                    features=["Both directions", "Door-to-door options", "Available 24/7"],
                    icon="Truck",
                    category="transport",
                    seo_title="Car Transport Dubai ⇄ Abu Dhabi | RK Transport",
                    seo_description="Enclosed and open vehicle transport between Dubai and Abu Dhabi, both directions, 24/7.",
                    sort_order=1,
                    image_alt="Car transporter on a UAE highway",
                ),
                Service(
                    title="Lift & Recovery",
                    slug="lift-recovery",
                    short_description="Breakdown, accident, and roadside recovery anywhere we operate — day or night.",
                    detailed_description="Need a lift? Call our recovery line. We dispatch flatbed and winch recovery for cars, SUVs, and light commercial vehicles.",
                    features=["Flatbed recovery", "Accident lift", "Roadside support", "Available 24/7"],
                    icon="LifeBuoy",
                    category="recovery",
                    seo_title="Lift & Recovery Service | RK Transport",
                    seo_description="Flatbed and winch recovery for cars, SUVs, and light commercials. Available 24/7 across the UAE.",
                    sort_order=2,
                    image_alt="Vehicle recovery truck",
                ),
                Service(
                    title="Car Storage",
                    slug="car-storage",
                    short_description="Short and long-term vehicle storage with flexible plans.",
                    detailed_description="Store your car while you travel or between moves. Covered and open options, with collection and delivery on our Dubai ⇄ Abu Dhabi route.",
                    features=["Covered options", "Flexible terms", "Collection & delivery", "Secure yards"],
                    icon="Warehouse",
                    category="storage",
                    seo_title="Car Storage Service | RK Transport",
                    seo_description="Short and long-term vehicle storage with collection and delivery on the Dubai ⇄ Abu Dhabi route.",
                    sort_order=3,
                    image_alt="Secure car storage yard",
                ),
            ]
        )

    if not db.query(VehicleType).first():
        db.add_all(
            [
                VehicleType(name="Sedan", slug="sedan", surcharge_aed=0, sort_order=1),
                VehicleType(name="SUV", slug="suv", surcharge_aed=0, sort_order=2),
                VehicleType(name="Luxury", slug="luxury", surcharge_aed=0, sort_order=3),
                VehicleType(name="Van", slug="van", surcharge_aed=0, sort_order=4),
                VehicleType(name="Motorcycle", slug="motorcycle", surcharge_aed=0, sort_order=5),
            ]
        )

    if not db.query(StoragePlan).first():
        db.add_all(
            [
                StoragePlan(
                    title="Open storage",
                    slug="open-storage",
                    description="Secure open-air parking by the week or month.",
                    billing_period="month",
                    price_aed=0,
                    covered=False,
                    features=["24/7 access coordination", "CCTV yards"],
                    sort_order=1,
                ),
                StoragePlan(
                    title="Covered storage",
                    slug="covered-storage",
                    description="Covered bays for longer stays and premium vehicles.",
                    billing_period="month",
                    price_aed=0,
                    covered=True,
                    features=["Covered bay", "Collection available"],
                    sort_order=2,
                ),
            ]
        )

    if not db.query(HeroBanner).first():
        db.add(
            HeroBanner(
                title="Car transport Dubai ⇄ Abu Dhabi",
                subtitle="RK Transport",
                description="Car lift, recovery, and storage. Available 24/7.",
                badge_text="Available 24/7",
                button_text="Get a quote",
                button_link="/quote",
                image_alt="RK Transport car carrier",
                sort_order=1,
                is_active=True,
            )
        )

    if not db.query(About).first():
        db.add(
            About(
                title="About RK Transport",
                subtitle="Moving cars across the UAE",
                description="RK Transport is a Dubai-based car transportation, lift & recovery, and storage company. Our core corridor is Dubai ⇄ Abu Dhabi in both directions, around the clock.",
                mission="Move every vehicle safely, on time, and with clear communication.",
                vision="Be the most reliable 24/7 car-move partner in the UAE.",
                values=[
                    {"title": "Always on", "description": "Available 24/7 for transport and recovery."},
                    {"title": "Careful handling", "description": "Vehicle moves handled with care."},
                    {"title": "Clear quotes", "description": "Quotes confirmed before service."},
                ],
                images=[],
            )
        )

    default_faqs = [
        Faq(
            question="Do you operate both directions between Dubai and Abu Dhabi?",
            answer="Yes. Dubai → Abu Dhabi and Abu Dhabi → Dubai, 24/7. See the dedicated route pages for each direction.",
            page_key="home",
            sort_order=1,
        ),
        Faq(
            question="How do I request recovery?",
            answer="Call the recovery number in the header or submit a quote with type Lift & Recovery.",
            page_key="home",
            sort_order=2,
        ),
        Faq(
            question="How long does Dubai to Abu Dhabi car transport take?",
            answer="Most jobs run the same day once pickup is confirmed. Exact timing depends on pickup access, traffic, and whether the vehicle is driveable.",
            page_key="dubai-to-abu-dhabi",
            sort_order=1,
        ),
        Faq(
            question="Can you collect from a Dubai apartment tower?",
            answer="Yes, when basement height and loading rules allow. Share the building name and any security or loading-bay instructions when you request a quote.",
            page_key="dubai-to-abu-dhabi",
            sort_order=2,
        ),
        Faq(
            question="Do you transport non-running cars from Dubai to Abu Dhabi?",
            answer="Yes. We combine lift & recovery at origin with the Dubai to Abu Dhabi move so the car does not need to be driveable.",
            page_key="dubai-to-abu-dhabi",
            sort_order=3,
        ),
        Faq(
            question="Where in Dubai can you drop a car coming from Abu Dhabi?",
            answer="We drop across Dubai including Marina, Downtown, Business Bay, and other areas we confirm on the quote. Share the exact pin when you book.",
            page_key="abu-dhabi-to-dubai",
            sort_order=1,
        ),
        Faq(
            question="Can I send a car from Mussafah to Dubai?",
            answer="Yes. Mussafah, Khalifa City, and the islands are regular Abu Dhabi collection points for Dubai-bound moves.",
            page_key="abu-dhabi-to-dubai",
            sort_order=2,
        ),
        Faq(
            question="Is Abu Dhabi to Dubai available at night?",
            answer="Yes. The corridor runs 24/7. Night collections are confirmed by phone so access and security are arranged.",
            page_key="abu-dhabi-to-dubai",
            sort_order=3,
        ),
        Faq(
            question="What is the difference between a lift and a standard tow?",
            answer="A lift uses a flatbed or winch so wheels may leave the ground. That is the safer option for accident damage, seized brakes, or low cars that a wheel-lift would scrape.",
            page_key="car-lift-recovery",
            sort_order=1,
        ),
        Faq(
            question="Do you recover after an accident?",
            answer="Yes, once police have released the vehicle. Send the location pin and vehicle type so we dispatch the right bed.",
            page_key="car-lift-recovery",
            sort_order=2,
        ),
        Faq(
            question="Can recovery continue into storage or a city-to-city move?",
            answer="Yes. After the lift we can store the car or book it onto Dubai ⇄ Abu Dhabi transport instead of leaving it roadside.",
            page_key="car-lift-recovery",
            sort_order=3,
        ),
        Faq(
            question="Is storage indoor or outdoor?",
            answer="We offer open yards and covered bays. Choose covered for longer stays or higher-value cars; open storage suits short holds.",
            page_key="storage",
            sort_order=1,
        ),
        Faq(
            question="Can you collect my car for storage?",
            answer="Yes. Collection and delivery run on the Dubai ⇄ Abu Dhabi corridor. Recovery can be added if the car is not driveable.",
            page_key="storage",
            sort_order=2,
        ),
        Faq(
            question="How long can I store a vehicle?",
            answer="From a week to several months. Tell us the expected end date on the quote so we reserve the right bay type.",
            page_key="storage",
            sort_order=3,
        ),
    ]
    existing_faq_questions = {row.question for row in db.query(Faq).all()}
    for faq in default_faqs:
        if faq.question not in existing_faq_questions:
            db.add(faq)
    for row in db.query(Faq).filter(Faq.page_key.is_(None)).all():
        if row.question in {
            "Do you operate both directions between Dubai and Abu Dhabi?",
            "How do I request recovery?",
        }:
            row.page_key = "home"

    existing_keys = {row.key for row in db.query(PageCopy).all()}
    for key, value in PAGE_COPY.items():
        if key not in existing_keys:
            db.add(PageCopy(key=key, value=value))

    db.commit()
