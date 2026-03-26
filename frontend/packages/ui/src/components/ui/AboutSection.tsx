import { Bot, Globe, Film } from "lucide-react";
import { Badge } from "@workspace/ui/components/ui/badge";

function AboutSection() {
  return (
<div id="about" className="w-full py-12 lg:py-20">      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8">

          {/* Header */}
          <div className="flex gap-3 flex-col items-start">
    
            <div className="flex gap-1 flex-col">
              <h2 className="text-3xl md:text-4xl tracking-tighter max-w-xl font-regular text-left">
                What <em className="not-italic font-semibold" style={{ color: "#1D546D" }}>VaktarAI</em> does
              </h2>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* AI Avatar — spans 2 cols */}
            <div className="bg-muted rounded-xl lg:col-span-2 p-5 flex flex-col justify-between gap-6 min-h-[220px]">
  
              <div className="flex flex-col gap-2">
                <h3 className="text-lg tracking-tight">
                  AI <em style={{ color: "#1D546D" }}>Avatar</em>
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                  Upload any photo and turn it into a fully animated, lip-synced video avatar. Remove backgrounds, add custom scenes, and bring your face alive.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["Photo to video", "Lip sync", "Background swap"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{ borderColor: "rgba(95,149,152,0.4)", color: "#F3F4F4F4", background: "#061E29" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* What VaktarAI does */}
            <div className="bg-muted rounded-xl p-5 flex flex-col justify-between gap-4 min-h-[220px]">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg tracking-tight">
                  What <em style={{ color: "#1D546D" }}>VaktarAI</em> does
                </h3>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "  Videos", sub: "Photo + voice = talking avatar in seconds", active: false },
                    { label: "Voice Generation", sub: "Realistic multi-language voice IDs", active: false },
                    { label: "PDF Extraction & Summary", sub: "Upload any PDF, get instant AI summary", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col px-3 py-3 rounded-lg m-1"
                      style={item.active ? { background: "#061E29" } : { background: "#5F9598" }}
                    >
                      <span className="font-medium text-xs" style={item.active ? { color: "white" } : { color: "#061E29" }}>
                        {item.label}
                      </span>
                      <span className="text-xs" style={item.active ? { color: "#061E29" } : { color: "#061E29" }}>
                        {item.sub}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["For everyone", "No skills needed"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{ borderColor: "rgba(95,149,152,0.4)", color: "#F3F4F4F4", background: "#061E29" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Voice & Speech — full width */}
            <div className="bg-muted rounded-xl lg:col-span-3 p-5 flex flex-col justify-between gap-4 min-h-[160px]">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg tracking-tight">
                  AI <em style={{ color: "#1D546D" }}>Voice & Speech</em>
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                  Choose from multiple realistic voice IDs. Type your script and your avatar speaks it out loud — in any language, any tone, anywhere in the world.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["Text to speech", "Multi-language", "Voice IDs"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{ borderColor: "rgba(95,149,152,0.4)", color: "#F3F4F4F4", background: "#061E29" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export { AboutSection };
