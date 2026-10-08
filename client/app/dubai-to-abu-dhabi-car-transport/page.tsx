import SeoLandingPage from "../Components/seo-landing-page";
import { generatePageMetadata } from "../../lib/seo";

export function generateMetadata() {
  return generatePageMetadata("/dubai-to-abu-dhabi-car-transport", {
    title: "Dubai to Abu Dhabi Car Transport | RK Transport",
    description: "Arrange car transport from Dubai to Abu Dhabi with RK Transport. Share your vehicle, pickup, and delivery details to request a tailored quote.",
  });
}

export default function DubaiToAbuDhabiPage() {
  return <SeoLandingPage
    title="Dubai to Abu Dhabi Car Transport"
    path="/dubai-to-abu-dhabi-car-transport"
    intro="Need to move a car from Dubai to Abu Dhabi? RK Transport arranges vehicle transport between the two emirates. Tell us where the vehicle is, where it needs to go, and when you would like it moved so our team can confirm the arrangements."
    sections={[
      { heading: "Plan your vehicle move", text: "When requesting a quote, include the vehicle make and model, pickup and drop-off locations, and your preferred date. Let us know if the vehicle is not running or needs special loading so we can discuss the suitable arrangement before confirming." },
      { heading: "A clear pickup and delivery plan", text: "We will review your route details and contact you to discuss timing and service requirements. Keep access instructions and a reachable contact number ready for both locations to help coordinate the handover." },
    ]}
    faqs={[
      { question: "How do I request car transport from Dubai to Abu Dhabi?", answer: "Submit a quote request with the vehicle details, pickup and delivery locations, and preferred date. RK Transport will contact you to review the trip and confirm availability and pricing." },
      { question: "Can you transport a car that does not start?", answer: "Tell us in your request that the vehicle is not running and describe its condition. We will review the loading requirements with you before confirming the right service." },
      { question: "What information should I have ready for a quote?", answer: "Provide the vehicle make and model, exact pickup and drop-off areas, preferred transport date, and any access or loading notes." },
    ]}
    links={[
      { href: "/abu-dhabi-to-dubai-car-transport", label: "Abu Dhabi to Dubai car transport" },
      { href: "/services", label: "All vehicle services" },
      { href: "/car-lift-recovery", label: "Car lift and recovery" },
      { href: "/storage", label: "Car storage" },
    ]}
  />;
}
