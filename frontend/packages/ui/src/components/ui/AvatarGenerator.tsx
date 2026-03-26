import {
  useState,
  useRef,
  ReactNode,
  DragEvent,
  ChangeEvent,
} from "react";

// ─── Design tokens ─────────────────────────────────────────────────
const C = {
  bg:      "#F3F4F4",
  navy:    "#061E29",
  teal:    "#1D546D",
  muted:   "#5F9598",
  white:   "#ffffff",
  border:  "rgba(6,30,41,0.10)",
  divider: "rgba(6,30,41,0.07)",
} as const;

const LANGUAGES = ["Hindi", "English", "Spanish", "French", "German", "Japanese", "Mandarin", "Arabic", "Portuguese"] as const;
const SPEAKERS  = ["bhargavi", "tanishka", "soham", "osin", "kshitij", "shreeja"] as const;

const BG_PRESETS = [
  "#061E29",
  "#1D546D",
  "#5F9598",
  "#F3F4F4",
  "#FF6B6B",
  "#FFD166",
  "#06D6A0",
  "#118AB2",
  "#8338EC",
  "#FB5607",
  "#3A86FF",
  "#2A9D8F",
  "#E76F51",
  "#8D99AE",
];

const SCENE_BACKGROUNDS = [
  {
    name: "Modern Office",
    description: "Workspace scene with a polished professional feel",
    category: "Professional",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.02.59.jpeg",
  },
  {
    name: "Boardroom",
    description: "Executive meeting room with a premium setup",
    category: "Professional",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.02.59 (2).jpeg",
  },
  {
    name: "Classroom",
    description: "Learning environment for lessons and demos",
    category: "Educational",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.03.00.jpeg",
  },
  {
    name: "Library",
    description: "Quiet study backdrop with shelves and depth",
    category: "Educational",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.03.06.jpeg",
  },
  {
    name: "Lounge",
    description: "Soft casual interior for relaxed presentations",
    category: "Casual",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.02.59 (3).jpeg",
  },
  {
    name: "Cafe Corner",
    description: "Warm social setting for friendly conversations",
    category: "Casual",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.03.06 (1).jpeg",
  },
  {
    name: "White Studio",
    description: "Minimal clean backdrop with a production look",
    category: "Abstract",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.03.06 (2).jpeg",
  },
  {
    name: "Creative Set",
    description: "Stylized scene for a more artistic presentation",
    category: "Abstract",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.03.11.jpeg",
  },
  {
    name: "Tech Space",
    description: "Modern setup for product explainers and demos",
    category: "Professional",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.03.12.jpeg",
  },
  {
    name: "Study Nook",
    description: "Focused educational corner for tutoring content",
    category: "Educational",
    image: "/backgrounds/WhatsApp Image 2026-03-26 at 19.03.13.jpeg",
  },
] as const;

function Label({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      margin: "0 0 6px", fontSize: "9.5px", fontWeight: 700,
      letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted,
      ...style,
    }}>
      {children}
    </p>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%",
      background: C.navy, color: C.white,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 700, flexShrink: 0,
    }}>
      {n}
    </div>
  );
}

function Chevron() {
  return (
    <svg
      style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      width="10" height="10" viewBox="0 0 10 10" fill="none"
    >
      <path d="M1.5 3.5l3.5 3.5 3.5-3.5" stroke={C.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const stepHeading: React.CSSProperties = {
  margin: 0, fontSize: "15px", fontWeight: 700, color: C.navy, letterSpacing: "-0.01em",
};
const stepSub: React.CSSProperties = {
  margin: "2px 0 0", fontSize: "12px", color: C.muted,
};
const selectStyle: React.CSSProperties = {
  width: "100%", background: "#F3F4F4",
  border: "1px solid rgba(6,30,41,0.10)", borderRadius: "9px",
  padding: "10px 30px 10px 12px",
  color: "#061E29", fontSize: "12.5px", fontFamily: "inherit",
  fontWeight: 500, outline: "none", cursor: "pointer",
  appearance: "none", transition: "border-color 0.15s",
};

// ─── Main ──────────────────────────────────────────────────────────
type GenerateAvatarFn = (
  imageFile: File,
  text: string,
  onUploadProgress?: (pct: number) => void,
  targetLanguage?: string,
  speaker?: string
) => Promise<{ video_url: string; [key: string]: unknown }>;

interface AvatarGeneratorProps {
  generateAvatar: GenerateAvatarFn;
}

export default function AvatarGenerator({ generateAvatar }: AvatarGeneratorProps) {
  const [portraitTab, setPortraitTab]     = useState<"upload" | "camera">("upload");
  const [portraitHover, setPortraitHover] = useState(false);
  const [portrait, setPortrait]           = useState<string | null>(null);
  const [portraitFile, setPortraitFile]   = useState<File | null>(null);
  const [bgRemoved, setBgRemoved]         = useState(false);
  const portraitInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode]     = useState<"type" | "document">("type");
  const [message, setMessage]         = useState("");
  const [msgFocus, setMsgFocus]       = useState(false);
  const [docFile, setDocFile]         = useState<string | null>(null);
  const [docHover, setDocHover]       = useState(false);
  const [summarized, setSummarized]   = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [speaker, setSpeaker]   = useState<typeof SPEAKERS[number]>("shreeja");
  const [language, setLanguage] = useState<typeof LANGUAGES[number]>("English");

  // Background state
  const [bgColor, setBgColor]         = useState("#0D1B2A");
  const [bgImage, setBgImage]         = useState<string | null>(null);
  const [bgImageName, setBgImageName] = useState<string | null>(null);
  const [bgHover, setBgHover]         = useState(false);
  const [scenePickerOpen, setScenePickerOpen] = useState(false);
  const [scenePickerTab, setScenePickerTab] = useState<"scenes" | "solid" | "upload">("scenes");
  const [sceneCategory, setSceneCategory] = useState<"Professional" | "Educational" | "Casual" | "Abstract">("Professional");
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [videoUrl, setVideoUrl]     = useState<string | null>(null);
  const [genError, setGenError]     = useState<string | null>(null);

  const handlePortrait = (file: File | null) => {
    if (file) {
      setPortrait(URL.createObjectURL(file));
      setPortraitFile(file);
      setBgRemoved(false);
    }
  };
  const handleDoc = (file: File | null) => {
    if (file) { setDocFile(file.name); setSummarized(false); }
  };
  const handleSummarize = () => {
    if (!docFile) return;
    setSummarizing(true);
    setTimeout(() => {
      setSummarizing(false);
      setSummarized(true);
      setMessage("This document outlines the key milestones and deliverables for the upcoming product launch. The team is expected to finalize designs by end of Q2 and begin beta testing in Q3.");
    }, 1800);
  };
  const handleBgUpload = (file: File | null) => {
    if (file) { setBgImage(URL.createObjectURL(file)); setBgImageName(file.name); }
  };
  const handleSceneSelect = (scene: typeof SCENE_BACKGROUNDS[number]) => {
    setBgImage(scene.image);
    setBgImageName(scene.name);
    setScenePickerOpen(false);
  };
  const handleColorSelect = (color: string) => {
    setBgColor(color);
    setBgImage(null);
    setBgImageName(null);
    setScenePickerOpen(false);
  };
  const handleRemoveBg = () => {
    if (portrait) setBgRemoved(true);
  };
  const handleRemovePortrait = () => {
    setPortrait(null);
    setBgRemoved(false);
  };
  const handleGenerate = async () => {
    if (!portraitFile) {
      setGenError('Please upload a portrait photo first.');
      return;
    }
    if (!message.trim()) {
      setGenError('Please enter a message or summarize a document first.');
      return;
    }

    setGenerating(true);
    setGenerated(false);
    setGenError(null);
    setVideoUrl(null);
    setProgress(0);

    const langCode: Record<string, string> = {
      English: 'en', Hindi: 'hi', Spanish: 'es',
      French: 'fr', German: 'de', Japanese: 'ja',
      Mandarin: 'zh', Arabic: 'ar', Portuguese: 'pt',
    };

    try {
      const result = await generateAvatar(
        portraitFile,
        message,
        (pct) => setProgress(pct),
        langCode[language] ?? 'en',
        speaker.toLowerCase()
      );
      setVideoUrl(result.video_url);
      setGenerated(true);
      setProgress(1);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: C.bg,
      minHeight: "100vh",
    }}>

      {/* ── Split layout: big video LEFT, steps RIGHT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "500px 1.6fr", minHeight: "100vh" }}>


        {/* ════ RIGHT — Steps ════ */}
        <div style={{
          background: C.white,
          borderLeft: `1px solid ${C.divider}`,
          padding: "44px 40px",
          overflowY: "auto",
        }}>

          {/* STEP 1 — Portrait */}
          <section style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
              <StepNumber n={1} />
              <div style={{ flex: 1 }}>
                <h2 style={stepHeading}>Portrait</h2>
                <p style={stepSub}>Upload or capture the face that will speak</p>
              </div>
              {portrait && (
                <img src={portrait} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.teal}` }} />
              )}
            </div>

            <div style={{ display: "flex", borderBottom: `1px solid ${C.divider}`, marginBottom: "18px" }}>
              {(["upload", "camera"] as const).map(tab => (
                <button key={tab} onClick={() => setPortraitTab(tab)} style={{
                  background: "none", border: "none", padding: "7px 16px 9px",
                  fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer",
                  color: portraitTab === tab ? C.teal : C.muted,
                  fontWeight: portraitTab === tab ? 600 : 400,
                  borderBottom: `2px solid ${portraitTab === tab ? C.teal : "transparent"}`,
                  marginBottom: "-1px", transition: "all 0.15s",
                }}>
                  {tab === "upload" ? "Upload photo" : "Take photo"}
                </button>
              ))}
            </div>

            {/* Portrait uploaded state with action buttons */}
            {portrait ? (
              <div style={{
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "16px 18px",
                background: C.bg,
              }}>
                {/* Top row: thumbnail + status */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img src={portrait} style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", display: "block" }} alt="portrait" />
                    {bgRemoved && (
                      <div style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                  <div>
                    {bgRemoved && (
                      <p style={{ margin: "0 0 2px", fontSize: "12.5px", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "5px" }}>
                        <span>✓</span> Background removed!
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: "11px", color: C.muted }}>
                      {bgRemoved ? "portrait_nobg.png" : "Portrait uploaded"}
                    </p>
                  </div>
                </div>

                {/* Action buttons row */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => portraitInputRef.current?.click()}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                      fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                      background: C.navy, color: C.white, border: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    Upload
                  </button>
                  <button
                    style={{
                      padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                      fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                      background: C.navy, color: C.white, border: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleRemoveBg}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                      fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                      background: bgRemoved ? C.navy : C.navy,
                      color: bgRemoved ? "#10b981" : C.white,
                      border: bgRemoved ? "1.5px solid #10b981" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {bgRemoved ? "✓ BG Removed" : "Remove BG"}
                  </button>
                  <button
                    onClick={handleRemovePortrait}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                      fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                      background: C.navy, color: "#ef4444",
                      border: "1.5px solid #ef4444",
                      transition: "all 0.15s",
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input ref={portraitInputRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handlePortrait(e.target.files?.[0] ?? null)} />
              </div>
            ) : (
              <div
                onClick={() => portraitInputRef.current?.click()}
                onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setPortraitHover(true); }}
                onDragLeave={() => setPortraitHover(false)}
                onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setPortraitHover(false); handlePortrait(e.dataTransfer.files[0] ?? null); }}
                style={{
                  border: `1.5px dashed ${portraitHover ? C.teal : C.border}`,
                  borderRadius: "12px", padding: "20px 22px",
                  display: "flex", alignItems: "center", gap: "16px",
                  cursor: "pointer",
                  background: portraitHover ? "rgba(29,84,109,0.03)" : C.bg,
                  transition: "all 0.15s",
                }}
              >
                <input ref={portraitInputRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handlePortrait(e.target.files?.[0] ?? null)} />
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: C.white, border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6.5" r="3" stroke={C.muted} strokeWidth="1.3" /><path d="M2.5 16c0-3.59 2.91-6.5 6.5-6.5S15.5 12.41 15.5 16" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" /></svg>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: C.navy }}>Drop a portrait here</p>
                  <p style={{ margin: 0, fontSize: "11.5px", color: C.muted }}>JPG · PNG · WebP — max 10 MB</p>
                </div>
                <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, color: C.teal, border: `1px solid ${C.teal}`, borderRadius: "7px", padding: "5px 14px", flexShrink: 0 }}>
                  Browse
                </span>
              </div>
            )}
          </section>

          <div style={{ height: "1px", background: C.divider, marginBottom: "48px" }} />

          {/* STEP 2 — Background */}
          <section style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
              <StepNumber n={2} />
              <div style={{ flex: 1 }}>
                <h2 style={stepHeading}>Background</h2>
                <p style={stepSub}>Set the scene behind your avatar</p>
              </div>
            </div>

            {/* Color + current bg row */}
            <div style={{
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              padding: "16px 18px",
              background: C.bg,
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}>
              {/* Color swatch preview */}
              <div
                onClick={() => setScenePickerOpen(true)}
                style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: bgImage ? "transparent" : bgColor,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer", flexShrink: 0,
                  overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {bgImage
                  ? <img src={bgImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="bg" />
                  : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                      <path d="M7 4v6M4 7h6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )
                }
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 1px", fontSize: "12.5px", fontWeight: 700, color: C.navy }}>
                  Background: <span style={{ color: C.teal }}>{bgImage ? bgImageName : bgColor.toUpperCase()}</span>
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: C.muted }}>
                  {bgImage ? "Image background set." : "Looking good! You can change it anytime."}
                </p>
              </div>

              <button
                onClick={() => setScenePickerOpen(true)}
                style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                  fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                  background: C.navy, color: C.white, border: "none",
                  transition: "all 0.15s", flexShrink: 0,
                }}
              >
                Choose Background
              </button>
            </div>

            {/* ── Remove Background ── */}
            <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
              <input
                ref={bgInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleBgUpload(e.target.files?.[0] ?? null)}
              />

              {/* Remove Background card */}
              <div
                onClick={() => { if (portrait) handleRemoveBg(); }}
                style={{
                  flex: 1,
                  minWidth: "240px",
                  border: `1.5px solid ${bgRemoved ? "rgba(16,185,129,0.4)" : C.border}`,
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: "10px",
                  cursor: portrait ? "pointer" : "not-allowed",
                  background: bgRemoved ? "rgba(16,185,129,0.04)" : C.bg,
                  opacity: portrait ? 1 : 0.5,
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: bgRemoved ? "rgba(16,185,129,0.1)" : C.white,
                  border: `1px solid ${bgRemoved ? "rgba(16,185,129,0.25)" : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 0.2s",
                }}>
                  {bgRemoved ? (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M3 7.5l3 3 6-6" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="2" y="2" width="11" height="11" rx="1.5" stroke={C.muted} strokeWidth="1.2" strokeDasharray="2.5 2" />
                      <path d="M5 5l5 5M10 5l-5 5" stroke={C.muted} strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p style={{ margin: "0 0 1px", fontSize: "12px", fontWeight: 700, color: bgRemoved ? "#10b981" : C.navy, transition: "color 0.2s" }}>
                    {bgRemoved ? "BG Removed!" : "Remove Background"}
                  </p>
                  <p style={{ margin: 0, fontSize: "10.5px", color: C.muted }}>
                    {!portrait ? "Upload portrait first" : bgRemoved ? "Portrait is transparent" : "Erase portrait BG"}
                  </p>
                </div>
              </div>

            </div>
          </section>

          {scenePickerOpen && (
            <div
              onClick={() => setScenePickerOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(6,30,41,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 100,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(980px, 100%)",
                  maxHeight: "84vh",
                  overflowY: "auto",
                  background: "#141414",
                  borderRadius: "0px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 28px 80px rgba(6,30,41,0.35)",
                }}
              >
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                      {[
                        { key: "scenes", label: "SCENES" },
                        { key: "solid", label: "SOLID COLOR" },
                        { key: "upload", label: "UPLOAD" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setScenePickerTab(tab.key as "scenes" | "solid" | "upload")}
                          style={{
                            background: "none",
                            border: "none",
                            borderBottom: scenePickerTab === tab.key ? "2px solid #D4FF4F" : "2px solid transparent",
                            color: scenePickerTab === tab.key ? "#F3F4F4" : "rgba(243,244,244,0.68)",
                            padding: "18px 6px 16px",
                            fontSize: "12px",
                            fontWeight: 500,
                            letterSpacing: "0.08em",
                            cursor: "pointer",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setScenePickerOpen(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(243,244,244,0.7)",
                        fontSize: "22px",
                        cursor: "pointer",
                        padding: "8px 0",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div style={{ padding: "22px 24px 24px" }}>
                  {scenePickerTab === "scenes" && (
                    <>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
                        {(["Professional", "Educational", "Casual", "Abstract"] as const).map((category) => (
                          <button
                            key={category}
                            onClick={() => setSceneCategory(category)}
                            style={{
                              background: sceneCategory === category ? "rgba(212,255,79,0.12)" : "rgba(255,255,255,0.03)",
                              border: sceneCategory === category ? "1px solid rgba(212,255,79,0.45)" : "1px solid rgba(255,255,255,0.10)",
                              color: sceneCategory === category ? "#D4FF4F" : "rgba(243,244,244,0.68)",
                              borderRadius: "999px",
                              padding: "10px 16px",
                              fontSize: "12px",
                              letterSpacing: "0.04em",
                              cursor: "pointer",
                            }}
                          >
                            {category.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                        {SCENE_BACKGROUNDS.filter((scene) => scene.category === sceneCategory).map((scene) => {
                          const isSelected = bgImageName === scene.name;

                          return (
                            <button
                              key={scene.name}
                              onClick={() => handleSceneSelect(scene)}
                              style={{
                                textAlign: "left",
                                background: "#1A1A1A",
                                border: isSelected ? "2px solid #D4FF4F" : "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "18px",
                                padding: "0",
                                cursor: "pointer",
                                overflow: "hidden",
                                boxShadow: isSelected ? "0 0 0 1px rgba(212,255,79,0.18)" : "none",
                                position: "relative",
                              }}
                            >
                              <img
                                src={scene.image}
                                alt={scene.name}
                                style={{
                                  width: "100%",
                                  height: "138px",
                                  objectFit: "cover",
                                  display: "block",
                                  background: "#202020",
                                }}
                              />
                              {isSelected && (
                                <div style={{
                                  position: "absolute",
                                  top: "10px",
                                  right: "10px",
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background: "#D4FF4F",
                                  color: "#061E29",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "15px",
                                }}>
                                  ✓
                                </div>
                              )}
                              <div style={{ padding: "12px 14px 14px" }}>
                                <div style={{ color: "#F3F4F4", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>{scene.name}</div>
                                <div style={{ color: "rgba(243,244,244,0.48)", fontSize: "12px" }}>{scene.description}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {scenePickerTab === "solid" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" }}>
                      {BG_PRESETS.map((color) => {
                        const isSelected = !bgImage && bgColor === color;

                        return (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            style={{
                              background: "#1A1A1A",
                              border: isSelected ? "2px solid #D4FF4F" : "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "18px",
                              padding: "12px",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div style={{
                              height: "110px",
                              borderRadius: "12px",
                              background: color,
                              border: color === "#F3F4F4" ? "1px solid rgba(255,255,255,0.14)" : "none",
                              marginBottom: "12px",
                            }} />
                            <div style={{ color: "#F3F4F4", fontSize: "13px", fontWeight: 600 }}>{color}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {scenePickerTab === "upload" && (
                    <div style={{
                      border: "1px dashed rgba(255,255,255,0.18)",
                      borderRadius: "20px",
                      padding: "28px",
                      background: "rgba(255,255,255,0.02)",
                      color: "#F3F4F4",
                    }}>
                      <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Custom uploads</div>
                      <div style={{ fontSize: "13px", color: "rgba(243,244,244,0.58)", marginBottom: "16px", lineHeight: 1.6 }}>
                        Use the existing Upload Background button in the background step to add your own photo. You can replace the scene thumbnails in this popup later with your final images.
                      </div>
                      <button
                        onClick={() => {
                          setScenePickerOpen(false)
                          bgInputRef.current?.click()
                        }}
                        style={{
                          background: "#D4FF4F",
                          color: "#061E29",
                          border: "none",
                          borderRadius: "999px",
                          padding: "10px 16px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Use Upload Background
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ height: "1px", background: C.divider, marginBottom: "48px" }} />

          {/* STEP 3 — Message */}
          <section style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
              <StepNumber n={3} />
              <div style={{ flex: 1 }}>
                <h2 style={stepHeading}>Message</h2>
                <p style={stepSub}>What will your avatar say?</p>
              </div>
              <div style={{ display: "flex", gap: "2px", background: C.bg, borderRadius: "8px", padding: "3px", border: `1px solid ${C.border}` }}>
                {(["type", "document"] as const).map(m => (
                  <button key={m} onClick={() => setInputMode(m)} style={{
                    padding: "5px 12px", borderRadius: "5px", fontSize: "11.5px",
                    fontFamily: "inherit", cursor: "pointer",
                    fontWeight: inputMode === m ? 600 : 400,
                    background: inputMode === m ? C.white : "transparent",
                    color: inputMode === m ? C.navy : C.muted,
                    border: inputMode === m ? `1px solid ${C.border}` : "1px solid transparent",
                    boxShadow: inputMode === m ? "0 1px 3px rgba(6,30,41,0.06)" : "none",
                    transition: "all 0.15s",
                  }}>
                    {m === "type" ? "Type" : "From document"}
                  </button>
                ))}
              </div>
            </div>

            {inputMode === "document" && (
              <div style={{ marginBottom: "14px" }}>
                <div
                  onClick={() => docInputRef.current?.click()}
                  onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDocHover(true); }}
                  onDragLeave={() => setDocHover(false)}
                  onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDocHover(false); handleDoc(e.dataTransfer.files[0] ?? null); }}
                  style={{
                    border: `1.5px dashed ${docHover ? C.teal : C.border}`,
                    borderRadius: "10px", padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: "14px",
                    cursor: "pointer",
                    background: docHover ? "rgba(29,84,109,0.03)" : C.bg,
                    transition: "all 0.15s", marginBottom: "8px",
                  }}
                >
                  <input ref={docInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleDoc(e.target.files?.[0] ?? null)} />
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${C.border}` }}>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="3" y="1.5" width="8" height="11" rx="1.5" stroke={C.muted} strokeWidth="1.2" /><path d="M6 5h4M6 7.5h4M6 10h2.5" stroke={C.muted} strokeWidth="1.1" strokeLinecap="round" /><path d="M9 1.5v3H12" stroke={C.muted} strokeWidth="1.1" strokeLinecap="round" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 1px", fontSize: "12.5px", fontWeight: 600, color: C.navy }}>
                      {docFile ?? "Upload a document"}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: C.muted }}>PDF · DOCX · TXT</p>
                  </div>
                  {docFile && (
                    <button
                      onClick={e => { e.stopPropagation(); handleSummarize(); }}
                      disabled={summarizing}
                      style={{ background: C.teal, border: "none", borderRadius: "7px", padding: "6px 14px", color: C.white, fontSize: "11px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", flexShrink: 0 }}
                    >
                      {summarizing ? "Summarizing…" : summarized ? "Re-summarize" : "Summarize"}
                    </button>
                  )}
                </div>
                {summarized && (
                  <p style={{ fontSize: "11px", color: "#059669", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "5px", height: "5px", background: "#10b981", borderRadius: "50%", display: "inline-block" }} />
                    Summary extracted — message updated below
                  </p>
                )}
              </div>
            )}

            <textarea
              value={message}
              maxLength={500}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              onFocus={() => setMsgFocus(true)}
              onBlur={() => setMsgFocus(false)}
              placeholder={inputMode === "document" ? "Summarized content will appear here, or edit directly…" : "Type the speech content for your avatar…"}
              style={{
                width: "100%", boxSizing: "border-box", minHeight: "130px",
                background: C.bg, border: `1px solid ${msgFocus ? C.teal : C.border}`,
                borderRadius: "10px", padding: "14px 16px",
                color: C.navy, fontSize: "14px", fontFamily: "inherit",
                lineHeight: 1.65, resize: "vertical", outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: msgFocus ? "0 0 0 3px rgba(29,84,109,0.07)" : "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "7px" }}>
              <button onClick={() => setMessage("")} style={{ background: "none", border: "none", color: C.muted, fontSize: "11.5px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                Clear
              </button>
              <span style={{ fontSize: "11px", color: C.muted }}>{wordCount} words · {message.length} / 500</span>
            </div>
          </section>

          <div style={{ height: "1px", background: C.divider, marginBottom: "48px" }} />

          {/* STEP 4 — Voice */}
          <section style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
              <StepNumber n={4} />
              <div>
                <h2 style={stepHeading}>Voice</h2>
                <p style={stepSub}>Choose how your avatar sounds</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <Label>Speaker</Label>
                <div style={{ position: "relative" }}>
                  <select value={speaker} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSpeaker(e.target.value as typeof SPEAKERS[number])} style={selectStyle}>
                    {SPEAKERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <Label>Language</Label>
                <div style={{ position: "relative" }}>
                  <select value={language} onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as typeof LANGUAGES[number])} style={selectStyle}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
            </div>
          </section>

          <div style={{ height: "1px", background: C.divider, marginBottom: "32px" }} />

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              width: "100%",
              background: generating ? "rgba(29,84,109,0.45)" : C.teal,
              border: "none", borderRadius: "10px", padding: "16px",
              color: C.white, fontSize: "13px", fontWeight: 700,
              fontFamily: "inherit", letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: generating ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: generating ? "none" : "0 4px 14px rgba(29,84,109,0.22)",
            }}
          >
            {generating ? "Generating…" : generated ? "Regenerate" : "Generate Avatar Video"}
          </button>
        </div>
        {/* ════ LEFT — Big Video Preview ════ */}
        <div style={{
          background: C.navy,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}>
          {/* Dot grid texture */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}>
            <defs>
              <pattern id="grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill={C.muted} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Label */}
          <div style={{ padding: "28px 40px 0", position: "relative" }}>
            <Label style={{ color: "rgba(255,255,255,0.3)" }}>Preview</Label>
          </div>

          {/* Centered player */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 40px",
            position: "relative",
          }}>
            {/* Video frame */}
            <div style={{
              width: "100%",
              maxWidth: "720px",
              borderRadius: "16px",
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
              position: "relative",
            }}>
              <div style={{ aspectRatio: "16/9", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

                {/* Placeholder / generating state */}
                {!generated && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: "80px", height: "80px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 18px",
                    }}>
                      <svg width="34" height="34" viewBox="0 0 30 30" fill="none">
                        <circle cx="15" cy="10" r="5.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                        <path d="M4 27c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.01em" }}>
                      {generating ? "Generating your avatar…" : genError ? "Generation failed" : "Your avatar will appear here"}
                    </p>
                    {generating && (
                      <p style={{ margin: "6px 0 0", fontSize: "11.5px", color: "rgba(255,255,255,0.18)" }}>
                        {Math.round(progress * 100)}% complete
                      </p>
                    )}
                    {genError && (
                      <p style={{ margin: "8px 0 0", fontSize: "11.5px", color: "#f87171", maxWidth: "260px" }}>
                        ⚠ {genError}
                      </p>
                    )}
                  </div>
                )}

                {/* Ready — real video player */}
                {generated && videoUrl && (
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    autoPlay
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "contain", borderRadius: "16px",
                    }}
                  />
                )}

                {/* Progress bar while generating */}
                {generating && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.06)" }}>
                    <div style={{
                      height: "100%", background: C.teal,
                      width: `${progress * 100}%`,
                      transition: "width 0.06s linear",
                      borderRadius: "0 2px 2px 0",
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "22px" }}>
              {([
                { label: "Download", href: videoUrl ?? undefined },
                { label: "Share",    href: undefined },
              ] as { label: string; href?: string }[]).map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  download={label === "Download" ? "avatar-video.mp4" : undefined}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px", padding: "9px 24px",
                    color: videoUrl ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
                    fontSize: "12px", fontFamily: "inherit", fontWeight: 500,
                    cursor: videoUrl ? "pointer" : "not-allowed",
                    textDecoration: "none", transition: "all 0.15s",
                    pointerEvents: videoUrl ? "auto" : "none",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Speaker info strip */}
          <div style={{
            padding: "18px 40px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: "12px",
            position: "relative",
          }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: C.teal, display: "flex", alignItems: "center",
              justifyContent: "center", color: C.white, fontSize: "12px", fontWeight: 700, flexShrink: 0,
            }}>
              {speaker[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                {speaker} · {language}
              </p>
              <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.28)" }}>Voice model ready</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: generated ? "#10b981" : "rgba(255,255,255,0.2)", display: "inline-block" }} />
              <span style={{ fontSize: "10px", color: generated ? "#34d399" : "rgba(255,255,255,0.28)", fontWeight: 600 }}>
                {generated ? "Ready to export" : "Awaiting generation"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
