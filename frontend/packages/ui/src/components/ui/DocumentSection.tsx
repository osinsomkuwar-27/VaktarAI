import { useState, useRef } from "react"

type InputSource = "file" | "email"
type Tone = "auto" | "formal" | "casual" | "technical"
type Language = "en" | "hi" | "mr" | "ta"
type PipelineStatus = "idle" | "running" | "done" | "error"

interface PipelineStep {
  key: string
  label: string
  status: PipelineStatus
}

const SPEAKERS = ["Aira", "Kael", "Zayn", "Nyra", "Elara", "Shreeja"]
const TONES: { value: Tone; label: string }[] = [
  { value: "auto", label: "✦ Auto detect" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
]
const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
]

const StatusDot = ({ status }: { status: PipelineStatus }) => {
  const colors: Record<PipelineStatus, string> = {
    idle: "bg-[#5F9598]/40",
    running: "bg-amber-400 animate-pulse",
    done: "bg-emerald-400",
    error: "bg-red-400",
  }
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status]}`} />
}

const CustomSelect = ({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) => {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium
          bg-white border border-[#061E29]/10 text-[#061E29]/80
          hover:border-[#1D546D]/40 transition-all duration-200"
      >
        <span>{current?.label}</span>
        <svg
          className={`w-3.5 h-3.5 text-[#5F9598] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-[#061E29]/10 bg-white shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-150
                ${opt.value === value
                  ? "bg-[#1D546D]/10 text-[#1D546D] font-semibold"
                  : "text-[#061E29]/70 hover:bg-[#F3F4F4] hover:text-[#061E29]"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1D546D] mb-2">{children}</p>
)

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-[#061E29]/8 bg-white shadow-sm p-5 ${className}`}>
    {children}
  </div>
)

export default function DocumentSection() {
  const [inputSource, setInputSource] = useState<InputSource>("file")
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [speaker, setSpeaker] = useState("Aira")
  const [language, setLanguage] = useState<Language>("en")
  const [tone, setTone] = useState<Tone>("auto")
  const [avatarText, setAvatarText] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pipeline: PipelineStep[] = [
    { key: "translation", label: "Translation", status: "idle" },
    { key: "emotion", label: "Emotion detect", status: "idle" },
    { key: "voice", label: "Voice synthesis", status: "idle" },
    { key: "render", label: "Avatar render", status: "idle" },
    { key: "captions", label: "Captions", status: "idle" },
  ]

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setFileName(file.name)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAvatarText(e.target.value)
    setWordCount(e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0)
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2500)
  }

  return (
    <section
      id="document"
      className="min-h-screen bg-[#F3F4F4] text-[#061E29] font-sans py-16 px-4 md:px-8"
      style={{ fontFamily: "'DM Sans', 'Sora', sans-serif" }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5F9598] mb-2">
          Document to Avatar
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#061E29] tracking-tight">
          Upload a PDF, DOCX or paste text —{" "}
          <span className="text-[#1D546D]">get a multilingual avatar video.</span>
        </h2>
      </div>

      {/* 3-col grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_1fr] gap-4">

        {/* ── COL 1 ── */}
        <div className="flex flex-col gap-4">

          {/* Input source */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Input source</SectionLabel>
              <div className="flex rounded-lg overflow-hidden border border-[#061E29]/12">
                {(["file", "email"] as InputSource[]).map((src) => (
                  <button
                    key={src}
                    onClick={() => setInputSource(src)}
                    className={`px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-200
                      ${inputSource === src
                        ? "bg-[#061E29] text-[#F3F4F4]"
                        : "text-[#061E29]/40 hover:text-[#061E29]/70 bg-transparent"
                      }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer py-10 px-4 transition-all duration-300
                ${isDragging
                  ? "border-[#1D546D] bg-[#1D546D]/5"
                  : "border-[#061E29]/12 hover:border-[#5F9598]/50 hover:bg-[#5F9598]/4"
                }`}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && setFileName(e.target.files[0].name)} />
              <div className="w-10 h-10 rounded-xl bg-[#5F9598]/15 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#1D546D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              {fileName ? (
                <p className="text-sm font-medium text-[#061E29]">{fileName}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-[#061E29]/60 mb-1">Drop your file here</p>
                  <p className="text-xs text-[#061E29]/30">or click to browse</p>
                </>
              )}
              <div className="flex gap-2 mt-4">
                {["PDF", "DOCX", "TXT"].map((ext) => (
                  <span key={ext} className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#5F9598]/12 text-[#1D546D] border border-[#5F9598]/20">
                    {ext}
                  </span>
                ))}
              </div>
            </div>

            <button className="mt-4 w-full py-3 rounded-xl text-sm font-semibold bg-[#061E29] text-[#F3F4F4] hover:bg-[#1D546D] transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#061E29]/10">
              <span className="text-[#5F9598]">✦</span> Summarize document
            </button>
          </Card>

          {/* Voice settings */}
          <Card className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-md bg-[#5F9598]/15 flex items-center justify-center">
                <svg className="w-3 h-3 text-[#1D546D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <SectionLabel>Voice settings</SectionLabel>
            </div>
            <div className="space-y-3">
              <div>
                <SectionLabel>Speaker</SectionLabel>
                <CustomSelect value={speaker} onChange={setSpeaker} options={SPEAKERS.map((s) => ({ value: s, label: s }))} />
              </div>
              <div>
                <SectionLabel>Output language</SectionLabel>
                <CustomSelect
                  value={language}
                  onChange={(v) => setLanguage(v as Language)}
                  options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.code.toUpperCase()} — ${l.label}` }))}
                />
              </div>
              <div>
                <SectionLabel>Tone</SectionLabel>
                <CustomSelect value={tone} onChange={(v) => setTone(v as Tone)} options={TONES} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#5F9598]/8 border border-[#5F9598]/20">
              <div className="w-7 h-7 rounded-full bg-[#1D546D] flex items-center justify-center text-[#F3F4F4] text-xs font-bold flex-shrink-0">
                {speaker[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#061E29]">{speaker} · English</p>
                <p className="text-[10px] text-[#5F9598]">Voice model loaded</p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            </div>
          </Card>
        </div>

        {/* ── COL 2 ── */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-[#061E29]">Avatar speaks</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#F3F4F4] text-[#5F9598] border border-[#061E29]/8">
                {wordCount} words
              </span>
            </div>
            <textarea
              value={avatarText}
              onChange={handleTextChange}
              placeholder="Your summarized message appears here, or type directly..."
              className="min-h-[160px] w-full bg-[#F3F4F4] rounded-xl p-3 resize-none text-sm text-[#061E29]/75 placeholder:text-[#061E29]/25 outline-none leading-relaxed border border-[#061E29]/8 focus:border-[#5F9598]/50 transition-colors"
            />
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#061E29]/6">
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#061E29]/35 hover:text-[#061E29] hover:bg-[#F3F4F4] transition-all">
                Clear
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#1D546D] border border-[#1D546D]/20 hover:bg-[#1D546D]/6 transition-all">
                Edit tone
              </button>
              <span className="ml-auto text-[10px] text-[#061E29]/22 italic">Awaiting input</span>
            </div>
          </Card>

          <Card className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#061E29]">Summary</span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#5F9598]/10 text-[#1D546D] border border-[#5F9598]/18">
                6 key points
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5F9598]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#5F9598]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#061E29]/35">No summary yet</p>
              <p className="text-xs text-[#061E29]/25 text-center max-w-[180px] leading-relaxed">
                Upload a document and click Summarize to extract key points
              </p>
            </div>
          </Card>
        </div>

        {/* ── COL 3 ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#061E29]">Video Preview</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F3F4F4] text-[#061E29]/35 border border-[#061E29]/8">Output</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-xs text-[#061E29]/35 hover:text-[#1D546D] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
                <button className="flex items-center gap-1.5 text-xs text-[#061E29]/35 hover:text-[#1D546D] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-[#061E29] aspect-video flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <div className="w-20 h-20 rounded-full bg-[#5F9598]" />
              </div>
              <button className="relative z-10 w-12 h-12 rounded-full bg-[#F3F4F4]/90 flex items-center justify-center hover:bg-[#F3F4F4] transition-all duration-200 shadow-lg">
                <svg className="w-5 h-5 text-[#061E29] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2">
                <button className="text-[#F3F4F4]/70">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <div className="flex-1 h-0.5 rounded-full bg-[#F3F4F4]/20">
                  <div className="w-0 h-full rounded-full bg-[#5F9598]" />
                </div>
                <span className="text-[10px] text-[#F3F4F4]/50 tabular-nums">00:00 / 00:00</span>
                <div className="flex gap-1">
                  {["CC", "HD"].map((tag) => (
                    <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F3F4F4]/15 text-[#F3F4F4]/60">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionLabel>Pipeline status</SectionLabel>
            <div className="space-y-0.5 mb-4">
              {pipeline.map((step) => (
                <div key={step.key} className="flex items-center justify-between py-2 border-b border-[#061E29]/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={step.status} />
                    <span className="text-xs text-[#061E29]/55">{step.label}</span>
                  </div>
                  <span className="text-[10px] font-medium text-[#061E29]/22 capitalize">{step.status}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 rounded-xl bg-[#F3F4F4] border border-[#061E29]/8 p-3 text-center">
                <p className="text-xl font-bold text-[#061E29]">0</p>
                <p className="text-[10px] text-[#061E29]/30 mt-0.5">words</p>
              </div>
              <div className="flex-1 rounded-xl bg-[#F3F4F4] border border-[#061E29]/8 p-3 text-center">
                <p className="text-xl font-bold text-[#061E29]">—</p>
                <p className="text-[10px] text-[#061E29]/30 mt-0.5">est. time</p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300
                bg-[#061E29] text-[#F3F4F4] hover:bg-[#1D546D] shadow-md shadow-[#061E29]/12 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <span className="text-[#5F9598]">⚡</span> Generate avatar video
                </>
              )}
            </button>

            <div className="mt-4">
              <SectionLabel>Quick language</SectionLabel>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200
                      ${language === l.code
                        ? "bg-[#1D546D] text-[#F3F4F4] shadow-sm"
                        : "bg-white text-[#061E29]/45 hover:bg-[#5F9598]/10 hover:text-[#1D546D] border border-[#061E29]/8"
                      }`}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}