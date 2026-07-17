import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldAlert, 
  FileVideo, 
  Copy, 
  Check, 
  Key, 
  Loader2, 
  UploadCloud, 
  RefreshCw,
  Clock,
  Database,
  Lock,
  ShieldCheck
} from "lucide-react"
import { verifyVideo, getPublicKey, type VerificationResponse } from "./api"

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');`

export default function VerifyPage() {
  const [dragActive, setDragActive] = useState(false)
  const [_file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "hashing" | "checking" | "success" | "failed" | "error">("idle")
  const [hash, setHash] = useState("")
  const [result, setResult] = useState<VerificationResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  
  const [publicKey, setPublicKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedSession, setCopiedSession] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getPublicKey()
      .then((data) => setPublicKey(data.public_key))
      .catch((err) => console.error("Error loading public key:", err))
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.includes("video") || droppedFile.name.endsWith(".mp4")) {
        processFile(droppedFile)
      } else {
        alert("Please upload a MP4 video file.")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = async (videoFile: File) => {
    setFile(videoFile)
    setStatus("hashing")
    setErrorMsg("")
    setResult(null)
    setHash("")

    try {
      const startHashTime = Date.now()
      const arrayBuffer = await videoFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
      setHash(calculatedHash)

      const timeElapsed = Date.now() - startHashTime
      if (timeElapsed < 800) {
        await new Promise(r => setTimeout(r, 800 - timeElapsed))
      }

      setStatus("checking")

      const response = await verifyVideo(videoFile)
      setResult(response)

      if (response.authentic) {
        setStatus("success")
      } else {
        setStatus("failed")
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "An unexpected error occurred during verification.")
      setStatus("error")
    }
  }

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetConsole = () => {
    setFile(null)
    setStatus("idle")
    setHash("")
    setResult(null)
    setErrorMsg("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const formatTimestamp = (tsStr?: string) => {
    if (!tsStr) return ""
    try {
      const date = new Date(tsStr)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return tsStr
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] text-[#1B3A5C] pt-28 pb-16 px-4 md:px-8 relative font-['Inter']">
      <style>{FONT_IMPORT}</style>

      {/* Flat, solid top rule */}
      <div className="absolute top-0 left-0 w-full h-px bg-[#D5DCE1]" />

      <div className="max-w-4xl mx-auto space-y-8 relative">
        {/* Header Console */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E8ED] text-[#3C7A6E] text-[11px] font-['IBM_Plex_Mono'] tracking-[0.15em] uppercase">
            <Lock className="w-3.5 h-3.5" /> Ledger Verification Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-['Space_Grotesk'] font-normal tracking-tight text-[#1B3A5C]">
            Vaktar AI Security Console
          </h1>
          <p className="text-sm md:text-base text-[#5A7085] max-w-xl mx-auto leading-relaxed font-normal">
            Verify the cryptographic fingerprint and ledger records of any Vaktar AI generated media output.
          </p>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Main Dropzone Module */}
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(27,58,92,0.08),0_1px_2px_rgba(27,58,92,0.04)] p-6 lg:p-8 relative">
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="idle-state"
                  className="space-y-6"
                >
                  {/* Drag-drop zone */}
                  <label
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center border rounded-xl p-10 cursor-pointer transition-colors duration-200 ${
                      dragActive 
                        ? "border-[#5FB8AE] bg-[#F0F9F7]" 
                        : "border-dashed border-[#D7E1E8] hover:border-[#3C7A94] hover:bg-[#F8FAFB]"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="p-4 rounded-full bg-[#F4F7F9] text-[#3C7A94] mb-4 border border-[#E2E8ED]">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <span className="text-base font-['Space_Grotesk'] text-[#1B3A5C] text-center">
                      Drag & drop generated video here
                    </span>
                    <span className="text-xs text-[#8098A8] mt-2 text-center font-normal">
                      Only .mp4 files originating from the Vaktar AI pipeline
                    </span>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="mt-6 px-5 py-2.5 rounded-full bg-[#1B3A5C] hover:bg-[#234A70] border border-[#1B3A5C] text-sm text-white font-normal tracking-wide transition-colors duration-200 active:scale-[0.98]"
                    >
                      Browse files
                    </button>
                  </label>
                </motion.div>
              )}

              {/* Hashing & Scanning State */}
              {(status === "hashing" || status === "checking") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="scanning-state"
                  className="flex flex-col items-center justify-center py-12 space-y-6"
                >
                  <div className="p-6 rounded-full bg-[#F4F7F9] border border-[#E2E8ED] text-[#3C7A6E] relative">
                    <FileVideo className="w-10 h-10" />
                    <Loader2 className="w-5 h-5 text-[#3C7A6E] absolute -bottom-1 -right-1 animate-spin bg-white rounded-full border border-[#E2E8ED] p-0.5" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-['Space_Grotesk'] font-normal text-[#1B3A5C]">
                      {status === "hashing" ? "Analyzing media buffer" : "Querying ledger"}
                    </h3>
                    <p className="text-sm text-[#5A7085] flex items-center justify-center gap-2 font-normal">
                      {status === "hashing" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3C7A6E]" />
                          <span>Calculating SHA-256 hash of file</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B3A5C]" />
                          <span>Checking Vaktar AI ledger and signatures</span>
                        </>
                      )}
                    </p>
                  </div>

                  {hash && (
                    <div className="w-full max-w-lg bg-[#F4F7F9] border border-[#E2E8ED] rounded-lg p-3 text-center">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[#8098A8] mb-1 font-['IBM_Plex_Mono']">Local fingerprint</div>
                      <code className="text-xs text-[#1B3A5C] break-all select-all font-['IBM_Plex_Mono']">{hash}</code>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Verification Success (Authentic) */}
              {status === "success" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key="success-state"
                  className="space-y-6"
                >
                  <div className="p-6 rounded-xl border border-[#B9DCD2] bg-[#F0F9F7] relative">
                    <div className="absolute top-0 right-0 py-1.5 px-3 rounded-bl-xl bg-[#D6EFE7] text-[#2E6355] text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-[0.15em] border-l border-b border-[#B9DCD2]">
                      Signature OK
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="p-3 rounded-full bg-[#D6EFE7] text-[#2E6355] border border-[#B9DCD2]">
                        <ShieldCheck className="w-9 h-9" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl font-['Space_Grotesk'] font-normal text-[#1B3A5C]">
                          Certified authentic
                        </h3>
                        <p className="text-sm text-[#3C7A6E] font-normal">
                          This video is verified authentic and unaltered from Vaktar AI.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fingerprint Card */}
                    <div className="bg-[#F4F6F7] border border-[#E2E8ED] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-[#5A7085] font-normal">
                        <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" /> Video hash (SHA-256)</span>
                        <button
                          onClick={() => copyToClipboard(result.video_hash, setCopiedHash)}
                          className="hover:text-[#1B3A5C] transition-colors p-1"
                          title="Copy hash"
                        >
                          {copiedHash ? <Check className="w-3.5 h-3.5 text-[#2E6355]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <code className="block text-xs text-[#1B3A5C] font-['IBM_Plex_Mono'] break-all py-1 bg-white px-2.5 rounded border border-[#E2E8ED]">
                        {result.video_hash}
                      </code>
                    </div>

                    {/* Session ID Card */}
                    <div className="bg-[#F4F6F7] border border-[#E2E8ED] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-[#5A7085] font-normal">
                        <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Session ID</span>
                        {result.session_id && (
                          <button
                            onClick={() => copyToClipboard(result.session_id || "", setCopiedSession)}
                            className="hover:text-[#1B3A5C] transition-colors p-1"
                            title="Copy session ID"
                          >
                            {copiedSession ? <Check className="w-3.5 h-3.5 text-[#2E6355]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                      <code className="block text-xs text-[#1B3A5C] font-['IBM_Plex_Mono'] break-all py-1 bg-white px-2.5 rounded border border-[#E2E8ED]">
                        {result.session_id || "N/A"}
                      </code>
                    </div>
                  </div>

                  {/* Date trace */}
                  <div className="flex items-center justify-between bg-[#F4F6F7] border border-[#E2E8ED] rounded-xl p-4 text-sm text-[#5A7085] font-normal">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#3C7A6E]" /> Generation timestamp</span>
                    <span className="text-[#1B3A5C] font-['IBM_Plex_Mono'] text-xs">{formatTimestamp(result.timestamp)}</span>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={resetConsole}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3A5C] hover:bg-[#234A70] border border-[#1B3A5C] text-sm font-normal tracking-wide text-white transition-colors duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> Verify another video
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Verification Failure (Altered / Unknown) */}
              {status === "failed" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key="failed-state"
                  className="space-y-6"
                >
                  <div className="p-6 rounded-xl border border-[#EAC3C5] bg-[#FBF0F0] relative">
                    <div className="absolute top-0 right-0 py-1.5 px-3 rounded-bl-xl bg-[#F5DBDC] text-[#8C3E43] text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-[0.15em] border-l border-b border-[#EAC3C5]">
                      Unverified
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="p-3 rounded-full bg-[#F5DBDC] text-[#8C3E43] border border-[#EAC3C5]">
                        <ShieldAlert className="w-9 h-9" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl font-['Space_Grotesk'] font-normal text-[#7A2E33]">
                          Authenticity check failed
                        </h3>
                        <p className="text-sm text-[#A65458] font-normal">
                          {result.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Display computed hash that failed verification */}
                  <div className="bg-[#F4F6F7] border border-[#F0D6D7] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs text-[#5A7085] font-normal">
                      <span>Computed hash — no matching ledger entry</span>
                      <button
                        onClick={() => copyToClipboard(result.video_hash, setCopiedHash)}
                        className="hover:text-[#8C3E43] transition-colors p-1"
                        title="Copy hash"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-[#2E6355]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <code className="block text-xs text-[#8C3E43] font-['IBM_Plex_Mono'] break-all py-1 bg-[#FBF0F0] px-2.5 rounded border border-[#F0D6D7]">
                      {result.video_hash}
                    </code>
                    <p className="text-[11px] text-[#8098A8] mt-1 leading-normal font-normal">
                      This checksum does not match any entry in the Vaktar AI ledger. The file was modified after
                      creation — even by a single bit — or it was generated outside the pipeline.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={resetConsole}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#FBF0F0] border border-[#EAC3C5] text-sm font-normal tracking-wide text-[#8C3E43] transition-colors duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> Try again
                    </button>
                  </div>
                </motion.div>
              )}

              {/* General Technical Error */}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="error-state"
                  className="space-y-6 text-center py-10"
                >
                  <div className="inline-flex p-3 rounded-full bg-[#F5DBDC] text-[#8C3E43] border border-[#EAC3C5] mb-2">
                    <ShieldAlert className="w-9 h-9" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-['Space_Grotesk'] font-normal text-[#1B3A5C]">System trace error</h3>
                    <p className="text-sm text-[#5A7085] max-w-md mx-auto font-normal">{errorMsg}</p>
                  </div>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={resetConsole}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B3A5C] hover:bg-[#234A70] border border-[#1B3A5C] text-sm text-white font-normal transition-colors duration-200 active:scale-[0.98]"
                    >
                      Return to console
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapsible Key Authority Panel */}
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(27,58,92,0.08),0_1px_2px_rgba(27,58,92,0.04)] overflow-hidden">
            <button
              onClick={() => setShowKey(!showKey)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F8FAFB] transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#F4F7F9] text-[#B8923F] border border-[#E2E8ED]">
                  <Key className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-['Space_Grotesk'] font-normal text-[#1B3A5C]">Platform trust authority key</h3>
                  <p className="text-xs text-[#8098A8] font-normal">PEM-formatted Ed25519 public key for external decoders</p>
                </div>
              </div>
              <div className="text-xs text-[#1B3A5C] font-['IBM_Plex_Mono'] uppercase tracking-[0.1em]">
                {showKey ? "Hide" : "Expose"}
              </div>
            </button>

            <AnimatePresence>
              {showKey && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-[#E2E8ED] overflow-hidden"
                >
                  <div className="p-5 space-y-3">
                    <div className="bg-[#F4F7F9] border border-[#E2E8ED] rounded-lg p-4 relative">
                      <button
                        onClick={() => copyToClipboard(publicKey, setCopiedKey)}
                        className="absolute right-3 top-3 text-[#8098A8] hover:text-[#1B3A5C] transition-colors"
                        title="Copy public key"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-[#2E6355]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="text-[10px] leading-relaxed text-[#5A7085] font-['IBM_Plex_Mono'] whitespace-pre-wrap select-all overflow-x-auto max-h-48">
                        {publicKey || "Retrieving platform public key..."}
                      </pre>
                    </div>
                    <p className="text-xs text-[#8098A8] leading-normal font-normal">
                      Security validators can verify signatures off-line using this Ed25519 public key. Cryptographic
                      check: <code className="font-['IBM_Plex_Mono'] text-[#5A7085]">Sign(PEM_Public_Key, Hash) == True</code>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}