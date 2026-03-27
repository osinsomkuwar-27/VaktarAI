import { LandingAccordionItem } from "@workspace/ui/components/ui/interactive-image-accordion"
import { SmokeBackground } from "@workspace/ui/components/ui/spooky-smoke-animation"
import { AboutSection } from "@workspace/ui/components/ui/AboutSection"
import GuideSection from "@workspace/ui/components/ui/GuideSection"
import TeamSection from "@workspace/ui/components/ui/TeamSection"
import FooterSection from "@workspace/ui/components/ui/FooterSection"
import CircularTestimonials from "@workspace/ui/components/ui/circular-tertimonials"
const sectorTestimonials = [
  {
    name: "Education",
    designation: "Interactive lessons and explainers",
    quote:
      "Teachers and trainers can turn a single portrait into clear lesson videos, multilingual explainers, and guided learning content without a studio setup.",
    src: "/sectors/education.avif",
  },
  {
    name: "Marketing",
    designation: "Campaigns with a human face",
    quote:
      "Marketing teams can create personalized launch videos, ads, and product promos faster by using AI avatars for repeatable, on-brand communication.",
    src: "/sectors/marketing.avif",
  },
  {
    name: "Customer Support",
    designation: "24/7 product guidance",
    quote:
      "Support teams can use avatar-led walkthroughs and onboarding clips to answer frequent questions and guide users in a more engaging way.",
    src: "/sectors/customer-support.avif",
  },
  {
    name: "Corporate Training",
    designation: "Internal communication at scale",
    quote:
      "From policy updates to onboarding modules, companies can deliver consistent training videos with the same presenter style across teams and locations.",
    src: "/sectors/corporate-training.jpg",
  },
  {
    name: "Healthcare",
    designation: "Clearer patient communication",
    quote:
      "Healthcare teams can simplify instructions, educational content, and repeatable communication through friendly avatar presentations in multiple languages.",
    src: "/sectors/healthcare.jpeg",
  },
]

export default function Home() {
  return (
    <div className="relative w-full font-sans">
      <div className="relative flex h-screen min-h-[500px] flex-col overflow-hidden bg-[#061E29] text-[#F3F4F4]">
        <div className="absolute inset-0 z-0">
          <SmokeBackground smokeColor="#1D546D" />
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center px-12">
          <LandingAccordionItem />
        </div>
      </div>
      <AboutSection />
      <GuideSection />
      <section
        id="sectors"
        className="relative overflow-hidden bg-[#F3F4F4] py-16 lg:py-24"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(29,84,109,0.28) 1.4px, transparent 1.4px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-[#5F9598] uppercase">
              Sectors
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#061E29] md:text-5xl">
              Where VaktarAI fits best
            </h2>
            <p className="mt-4 text-base leading-8 text-[#1D546D]">
              Explore a few ways teams can use avatar-led communication across
              education, marketing, support, training, and healthcare.
            </p>
          </div>

          <div className="mx-auto flex justify-center rounded-[32px] bg-[#F3F4F4]">
            <CircularTestimonials
              testimonials={sectorTestimonials}
              colors={{
                name: "#061E29",
                designation: "#5F9598",
                testimony: "#1D546D",
                arrowBackground: "#061E29",
                arrowForeground: "#F3F4F4",
                arrowHoverBackground: "#1D546D",
              }}
              fontSizes={{
                name: "2rem",
                designation: "0.95rem",
                quote: "1rem",
              }}
            />
          </div>
        </div>
      </section>
      <TeamSection />
      <FooterSection />
    </div>
  )
}
