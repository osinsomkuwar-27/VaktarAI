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
  Lock
} from "lucide-react"
import { verifyVideo, getPublicKey, type VerificationResponse } from "./api"

export default function VerifyPage() {
  const [dragActive, setDragActive] = useState(false)
  const [_file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "hashing" | "checking" | "success" | "failed" | "error">("idle")
  const [hash, setHash] = useState("")
  const [result, setResult] = useState<VerificationResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  
  // Public Key state
  const [publicKey, setPublicKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedSession, setCopiedSession] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch Public key on mount
  useEffect(() => {
    getPublicKey()
      .then((data) => setPublicKey(data.public_key))
      .catch((err) => console.error("Error loading public key:", err))
  }, [])

  // Drag handlers
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

  // Calculate hash & call verify API
  const processFile = async (videoFile: File) => {
    setFile(videoFile)
    setStatus("hashing")
    setErrorMsg("")
    setResult(null)
    setHash("")

    try {
      // Stage 1: Local browser SHA-256 calculation
      // Reading array buffer to calculate SHA-256 locally
      const startHashTime = Date.now()
      const arrayBuffer = await videoFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
      setHash(calculatedHash)

      // Ensure the hashing animation runs for at least 800ms for realistic premium security console UX
      const timeElapsed = Date.now() - startHashTime
      if (timeElapsed < 800) {
        await new Promise(r => setTimeout(r, 800 - timeElapsed))
      }

      // Stage 2: Server ledger checking
      setStatus("checking")

      // Upload file to get verified
      const response = await verifyVideo(videoFile)
      setResult(response)

      // Stage 3: Verification status
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

  // Copy Utilities
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
    <div className="min-h-screen bg-[#020B10] text-[#E2E8F0] pt-28 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Premium Dark Tech theme radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0A2635] via-[#020B10] to-[#010609] pointer-events-none -z-10" />
      
      {/* Decorative techno borders */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/20 via-sky-500/40 to-blue-500/20" />

      <div className="max-w-4xl mx-auto space-y-8 relative">
        {/* Header Console */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#081F2C] border border-[#14425A] text-teal-400 text-xs font-semibold tracking-wider uppercase">
            <Lock className="w-3.5 h-3.5" /> Ledger Verification Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-100 to-teal-400">
            Vaktar AI Security Console
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Verify the cryptographic fingerprint and ledger records of any Vaktar AI generated media output.
          </p>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Main Dropzone Module */}
          <div className="bg-[#03131E]/60 backdrop-blur-md rounded-2xl border border-[#0F354A] p-6 lg:p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/10 to-transparent -z-10 rounded-tr-2xl" />
            
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
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-300 ${
                      dragActive 
                        ? "border-teal-400 bg-teal-950/20 scale-[1.01]" 
                        : "border-[#14425A] hover:border-sky-500/70 hover:bg-[#061D2C]/40"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="p-4 rounded-full bg-[#08202F] text-sky-400 mb-4 border border-[#123A50] shadow-inner">
                      <UploadCloud className="w-8 h-8 animate-pulse" />
                    </div>
                    <span className="text-lg font-bold text-slate-200 text-center">
                      Drag & drop generated video here
                    </span>
                    <span className="text-xs text-slate-500 mt-2 text-center">
                      Only `.mp4` formats originating from Vaktar AI pipeline
                    </span>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="mt-6 px-5 py-2.5 rounded-full bg-[#0C3044] hover:bg-[#12425C] border border-[#194C66] text-sm text-sky-300 font-semibold shadow transition-all duration-300 active:scale-95"
                    >
                      Browse Files
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
                  <div className="relative">
                    {/* Pulsing ring animation */}
                    <div className="absolute inset-0 rounded-full bg-teal-500/10 blur-xl animate-pulse" />
                    <div className="p-6 rounded-full bg-[#08202F] border border-teal-500/40 text-teal-400 relative">
                      <FileVideo className="w-12 h-12" />
                      <Loader2 className="w-6 h-6 text-teal-300 absolute -bottom-1 -right-1 animate-spin bg-[#020B10] rounded-full border border-teal-500/30 p-0.5" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-slate-200">
                      {status === "hashing" ? "Analyzing Media Buffer" : "Querying Blockchain Ledger"}
                    </h3>
                    <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                      {status === "hashing" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                          <span>Calculating SHA-256 hash of file...</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                          <span>Checking Vaktar AI ledger and signatures...</span>
                        </>
                      )}
                    </p>
                  </div>

                  {hash && (
                    <div className="w-full max-w-lg bg-[#01090F] border border-[#0F354A] rounded-lg p-3 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Local Fingerprint</div>
                      <code className="text-xs text-teal-400 break-all select-all font-mono">{hash}</code>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Verification Success (Authentic) */}
              {status === "success" && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  key="success-state"
                  className="space-y-6"
                >
                  <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 py-1.5 px-3 rounded-bl bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest border-l border-b border-emerald-500/30">
                      Signature OK
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {/* Checkmark draw micro-animation */}
                      <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </svg>
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl font-black text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                          🔒 Vaktar AI Certified Authentic
                        </h3>
                        <p className="text-xs md:text-sm text-emerald-400/90 font-medium">
                          This video is verified authentic and unaltered from Vaktar AI.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fingerprint Card */}
                    <div className="bg-[#020B10] border border-[#0F354A] rounded-xl p-4 space-y-2 relative">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" /> Video Hash (SHA-256)</span>
                        <button
                          onClick={() => copyToClipboard(result.video_hash, setCopiedHash)}
                          className="hover:text-sky-400 transition-colors p-1"
                          title="Copy Hash"
                        >
                          {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <code className="block text-xs text-sky-400 font-mono break-all py-1 bg-[#010609]/60 px-2.5 rounded border border-[#051A26]">
                        {result.video_hash}
                      </code>
                    </div>

                    {/* Session ID Card */}
                    <div className="bg-[#020B10] border border-[#0F354A] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Session ID</span>
                        {result.session_id && (
                          <button
                            onClick={() => copyToClipboard(result.session_id || "", setCopiedSession)}
                            className="hover:text-sky-400 transition-colors p-1"
                            title="Copy Session ID"
                          >
                            {copiedSession ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                      <code className="block text-xs text-slate-300 font-mono break-all py-1 bg-[#010609]/60 px-2.5 rounded border border-[#051A26]">
                        {result.session_id || "N/A"}
                      </code>
                    </div>
                  </div>

                  {/* Date trace */}
                  <div className="flex items-center justify-between bg-[#020B10] border border-[#0F354A] rounded-xl p-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-teal-400" /> Generation Timestamp</span>
                    <span className="font-semibold text-slate-200">{formatTimestamp(result.timestamp)}</span>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={resetConsole}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 border border-sky-500 text-sm font-semibold tracking-wide text-white transition-all shadow active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> Verify another video
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Verification Failure (Altered / Unknown) */}
              {status === "failed" && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  key="failed-state"
                  className="space-y-6"
                >
                  <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-950/10 shadow-[0_0_20px_rgba(244,63,94,0.05)] relative overflow-hidden animate-pulse">
                    <div className="absolute top-0 right-0 py-1.5 px-3 rounded-bl bg-rose-500/20 text-rose-400 text-[10px] font-mono uppercase tracking-widest border-l border-b border-rose-500/30">
                      Unverified
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <ShieldAlert className="w-10 h-10" />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl font-black text-rose-200">
                          ⚠️ Authenticity Check Failed
                        </h3>
                        <p className="text-xs md:text-sm text-rose-400/90 font-medium">
                          {result.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Display computed hash that failed verification */}
                  <div className="bg-[#020B10] border border-rose-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Computed Invalid SHA-256 Hash</span>
                      <button
                        onClick={() => copyToClipboard(result.video_hash, setCopiedHash)}
                        className="hover:text-rose-400 transition-colors p-1"
                        title="Copy Hash"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <code className="block text-xs text-rose-400 font-mono break-all py-1 bg-[#010609]/60 px-2.5 rounded border border-rose-500/15">
                      {result.video_hash}
                    </code>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      This checksum does not match any entry registered in the Vaktar AI SQLite database. This means the video file was either modified (tampered with by even just a single bit) after creation, or it was generated externally.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={resetConsole}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C161D] hover:bg-[#2C1D26] border border-rose-500/20 text-sm font-semibold tracking-wide text-rose-300 transition-all shadow active:scale-95 cursor-pointer animate-bounce"
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
                  <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-200">System Trace error</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">{errorMsg}</p>
                  </div>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={resetConsole}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0C3044] hover:bg-[#12425C] border border-[#194C66] text-sm text-sky-300 font-semibold transition-all active:scale-95"
                    >
                      Return to console
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapsible Key Authority Panel */}
          <div className="bg-[#03131E]/60 backdrop-blur-md rounded-2xl border border-[#0F354A] shadow-xl overflow-hidden">
            <button
              onClick={() => setShowKey(!showKey)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[#061D2C]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#08202F] text-yellow-500/70 border border-[#123A50]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-slate-200">Platform Trust Authority Key</h3>
                  <p className="text-xs text-slate-500">PEM-formatted Ed25519 public key used for external decoders</p>
                </div>
              </div>
              <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                {showKey ? "Hide Public Key" : "Expose Public Key"}
              </div>
            </button>

            <AnimatePresence>
              {showKey && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-[#0F354A]/60 overflow-hidden"
                >
                  <div className="p-5 space-y-3">
                    <div className="bg-[#01090F] border border-[#0A2635] rounded-lg p-4 relative">
                      <button
                        onClick={() => copyToClipboard(publicKey, setCopiedKey)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-sky-400 transition-colors"
                        title="Copy Public Key"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="text-[10px] leading-relaxed text-slate-400 font-mono whitespace-pre-wrap select-all overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-teal-900">
                        {publicKey || "Retrieving platform public key..."}
                      </pre>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">
                      Security validators can verify signatures off-line using this Ed25519 public key structure. Cryptographic signature check: <code>Sign(PEM_Public_Key, Hash) == True</code>.
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
