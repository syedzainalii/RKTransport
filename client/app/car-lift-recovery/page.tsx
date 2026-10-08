import SeoLandingPage from "../Components/seo-landing-page";
import { generatePageMetadata } from "../../lib/seo";

export function generateMetadata() {
  return generatePageMetadata("/car-lift-recovery", {
    title: "Car Lift & Recovery in Dubai and Abu Dhabi | RK Transport",
    description: "Request car lift and vehicle recovery from RK Transport in Dubai, Abu Dhabi, and across the UAE. Share your location and vehicle condition.",
  }, "seo.car-lift-recovery");
}

export default function CarLiftRecoveryPage() {
  return <SeoLandingPage
    title="Car Lift & Recovery"
    path="/car-lift-recovery"
    intro="If your vehicle needs a lift or recovery, contact RK Transport with your current location, destination, and a brief description of the issue. Our team will review the vehicle condition and discuss the appropriate recovery arrangement."
    sections={[
      { heading: "Tell us what happened", text: "When requesting assistance, include your exact location, a safe contact number, the vehicle make and model, and whether the vehicle can roll, steer, and brake. Mention any roadside access or parking constraints that could affect loading." },
      { heading: "Recovery across the UAE", text: "Share the destination for the vehicle, such as a home, workshop, or another agreed location. Recovery timing and the equipment needed depend on the location and vehicle condition, so the details are confirmed with you before dispatch." },
    ]}
    faqs={[
      { question: "What details are needed to arrange vehicle recovery?", answer: "Provide your location, destination, vehicle make and model, a contact number, and a short description of the problem. Tell us whether the vehicle can roll, steer, and brake." },
      { question: "Can you recover a car after a breakdown?", answer: "Request recovery and explain where the vehicle is and what has happened. The team will review the situation and confirm the available service and next steps." },
      { question: "Can the vehicle be taken to a workshop?", answer: "Include the workshop address or area as the destination in your request. The delivery location and any access instructions will be confirmed with the recovery plan." },
    ]}
    links={[
      { href: "/quote", label: "Request a recovery quote" },
      { href: "/services", label: "All vehicle services" },
      { href: "/dubai-to-abu-dhabi-car-transport", label: "Dubai to Abu Dhabi transport" },
      { href: "/storage", label: "Car storage" },
    ]}
  />;
}
