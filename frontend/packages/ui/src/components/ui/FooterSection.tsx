import React from "react"
import { Brain } from "lucide-react"

const platformLinks = [
  "AI Avatar Generation",
  "Text-to-Video Avatars",
  "Voice Cloning",
  "Document Summaries",
]

const companyLinks = [
  "About",
  "Guide",
  "Sectors",
  "People",
]

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#061E29] px-4 pb-10 pt-20 text-[#F3F4F4] md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-[#1D546D]/35 pb-12 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1.1fr]">
          <div className="max-w-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1D546D] text-white">
                <Brain className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">VaktarAI</span>
            </div>

            <p className="text-sm leading-7 text-[#5F9598]">
              Create AI avatar videos, voice-led explainers, and interactive experiences from one streamlined workspace.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#F3F4F4]">
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-[#5F9598]">
              {platformLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#F3F4F4]">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-[#5F9598]">
              {companyLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#F3F4F4]">
              Contact
            </h4>

            <div className="space-y-3 text-sm leading-7 text-[#5F9598]">
              <p>
                <span className="text-[#F3F4F4]">Email:</span> xxxxxabcxx@gmail.com
              </p>
              <p>
                <span className="text-[#F3F4F4]">Phone:</span> +91 98XXX XXXXX
              </p>
              <p>
                <span className="text-[#F3F4F4]">Location:</span> Pune, India
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-[#5F9598] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} VaktarAI. All rights reserved.</p>
          <p>Built for avatar video creation, multilingual voice, and interactive AI experiences.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
