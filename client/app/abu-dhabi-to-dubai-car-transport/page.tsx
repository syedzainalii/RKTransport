import SeoLandingPage from "../Components/seo-landing-page";
import { generatePageMetadata } from "../../lib/seo";

export function generateMetadata() {
  return generatePageMetadata("/abu-dhabi-to-dubai-car-transport", {
    title: "Abu Dhabi to Dubai Car Transport | RK Transport",
    description: "Arrange car transport from Abu Dhabi to Dubai with RK Transport. Contact our team with your vehicle, pickup, and delivery details.",
  }, "seo.abu-dhabi-to-dubai");
}

export default function AbuDhabiToDubaiPage() {
  return <SeoLandingPage
    title="Abu Dhabi to Dubai Car Transport"
    path="/abu-dhabi-to-dubai-car-transport"
    intro="Moving a car from Abu Dhabi to Dubai? RK Transport can arrange vehicle transport between the emirates. Send us your pickup and destination details, vehicle information, and preferred timing to start planning the move."
    sections={[
      { heading: "Plan your route-specific move", text: "Every move has different pickup access, delivery requirements, and vehicle needs. Share both addresses or areas and the vehicle condition when contacting us, and our team will discuss the arrangements with you." },
      { heading: "Coordinate the handover", text: "Before transport is arranged, make sure someone can provide access to the vehicle at pickup and receive it at delivery. Share gate, parking, or contact instructions so they can be considered during planning." },
    ]}
    faqs={[
      { question: "Can I arrange transport from Abu Dhabi to Dubai?", answer: "Yes. Contact RK Transport with your vehicle details, pickup and delivery areas, and preferred date. Our team will discuss the available arrangement with you." },
      { question: "Can you collect from a home or workplace?", answer: "Share the pickup location and any access restrictions when you contact us. We will review the collection details with you." },
      { question: "What if my car has a mechanical issue?", answer: "Describe the issue and whether the car can roll, steer, and brake. This helps our team assess loading requirements and discuss a suitable transport or recovery option." },
    ]}
    links={[
      { href: "/dubai-to-abu-dhabi-car-transport", label: "Dubai to Abu Dhabi car transport" },
      { href: "/services", label: "All vehicle services" },
      { href: "/car-lift-recovery", label: "Car lift and recovery" },
      { href: "/storage", label: "Car storage" },
    ]}
  />;
}
