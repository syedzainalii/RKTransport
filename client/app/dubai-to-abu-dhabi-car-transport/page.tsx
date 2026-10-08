import SeoLandingPage from "../Components/seo-landing-page";
import { generatePageMetadata } from "../../lib/seo";

export function generateMetadata() {
  return generatePageMetadata("/dubai-to-abu-dhabi-car-transport", {
    title: "Dubai to Abu Dhabi Car Transport | RK Transport",
    description: "Arrange car transport from Dubai to Abu Dhabi with RK Transport. Contact our team with your vehicle, pickup, and delivery details.",
  }, "seo.dubai-to-abu-dhabi");
}

export default function DubaiToAbuDhabiPage() {
  return <SeoLandingPage
    title="Dubai to Abu Dhabi Car Transport"
    path="/dubai-to-abu-dhabi-car-transport"
    intro="Need to move a car from Dubai to Abu Dhabi? RK Transport arranges vehicle transport between the two emirates. Tell us where the vehicle is, where it needs to go, and when you would like it moved so our team can confirm the arrangements."
    sections={[
      { heading: "Plan your vehicle move", text: "Contact our team with the vehicle make and model, pickup and drop-off locations, and preferred date. Let us know if the vehicle is not running or needs special loading so we can discuss the suitable arrangement." },
      { heading: "A clear pickup and delivery plan", text: "We will review your route details and contact you to discuss timing and service requirements. Keep access instructions and a reachable contact number ready for both locations to help coordinate the handover." },
    ]}
    faqs={[
      { question: "How do I arrange car transport from Dubai to Abu Dhabi?", answer: "Contact RK Transport with the vehicle details, pickup and delivery locations, and preferred date. Our team will discuss the trip and arrangements with you." },
      { question: "Can you transport a car that does not start?", answer: "Tell us the vehicle is not running and describe its condition when you contact us. We will discuss the loading requirements and suitable service." },
      { question: "What information should I have ready?", answer: "Share the vehicle make and model, pickup and drop-off areas, preferred date, and any access or loading notes." },
    ]}
    links={[
      { href: "/abu-dhabi-to-dubai-car-transport", label: "Abu Dhabi to Dubai car transport" },
      { href: "/services", label: "All vehicle services" },
      { href: "/car-lift-recovery", label: "Car lift and recovery" },
      { href: "/storage", label: "Car storage" },
    ]}
  />;
}
