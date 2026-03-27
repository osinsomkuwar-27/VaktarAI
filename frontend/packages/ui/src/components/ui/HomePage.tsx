import { LandingAccordionItem } from "@workspace/ui/components/ui/interactive-image-accordion"
import { SmokeBackground } from "@workspace/ui/components/ui/spooky-smoke-animation"
import { AboutSection } from "@workspace/ui/components/ui/AboutSection"
import SectorsSection from "@workspace/ui/components/ui/SectorsSection"
import GuideSection from "@workspace/ui/components/ui/GuideSection"
import TeamSection from "@workspace/ui/components/ui/TeamSection"
import FooterSection from "@workspace/ui/components/ui/FooterSection"
export default function Home() {
  return (
    <div className="relative w-full font-sans">
      <div className="relative h-screen min-h-[500px] overflow-hidden bg-[#061E29] text-[#F3F4F4] flex flex-col">
        <div className="absolute inset-0 z-0">
          <SmokeBackground smokeColor="#1D546D" />
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center px-12">
  <LandingAccordionItem />
</div>
      </div>
      <AboutSection />
      <GuideSection />
      <SectorsSection />
      <TeamSection />
      <FooterSection />
    </div>
  )
}
