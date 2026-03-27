import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth } from "../../firebase"

export default function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState<"signin" | "signup">("signup")
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const redirectTo =
    typeof location.state === "object" &&
    location.state !== null &&
    "redirectTo" in location.state &&
    typeof location.state.redirectTo === "string"
      ? location.state.redirectTo
      : "/"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      if (tab === "signup") {
        if (!form.name.trim()) {
          setError("Please enter your full name.")
          setLoading(false)
          return
        }
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
        await updateProfile(cred.user, { displayName: form.name })
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password)
      }
      navigate(redirectTo)
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError("")
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      navigate(redirectTo)
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const friendlyError = (code: string): string => {
    switch (code) {
      case "auth/email-already-in-use":    return "This email is already registered. Try signing in."
      case "auth/invalid-email":            return "Please enter a valid email address."
      case "auth/weak-password":            return "Password must be at least 6 characters."
      case "auth/user-not-found":           return "No account found with this email."
      case "auth/wrong-password":           return "Incorrect password. Please try again."
      case "auth/invalid-credential":       return "Invalid email or password."
      case "auth/popup-closed-by-user":     return "Google sign-in was cancelled."
      case "auth/too-many-requests":        return "Too many attempts. Please try again later."
      default:                              return "Something went wrong. Please try again."
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.grid} />

      <div style={styles.card}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.logo}>
            <img src="/28.png" alt="VaktarAI" style={styles.logoImage} />
          </div>

          <div style={styles.tagline}>
            <h1 style={styles.taglineMain}>Your identity.</h1>
            <h1 style={styles.taglineAccent}>Brought to life.</h1>
          </div>

          <p style={styles.taglineDesc}>
            Upload a photo, pick a voice, and let AI create lifelike avatars in seconds.
          </p>

          <ul style={styles.featureList}>
            {[
              "Photo to talking avatar in seconds",
              "Multi-language voice synthesis",
              "Background & scene customization",
              "Instant PDF extraction & summary",
            ].map((f) => (
              <li key={f} style={styles.featureItem}>
                <span style={styles.bullet} />
                {f}
              </li>
            ))}
          </ul>

          <p style={styles.copyright}>© 2025 VaktarAI · All rights reserved</p>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.tabBar}>
            <button
              style={{ ...styles.tab, ...(tab === "signin" ? styles.tabActive : styles.tabInactive) }}
              onClick={() => { setTab("signin"); setError("") }}
            >
              Sign In
            </button>
            <button
              style={{ ...styles.tab, ...(tab === "signup" ? styles.tabActive : styles.tabInactive) }}
              onClick={() => { setTab("signup"); setError("") }}
            >
              Sign Up
            </button>
          </div>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {tab === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p style={styles.formSubtitle}>
              {tab === "signup"
                ? "Start building your AI avatar today"
                : "Sign in to your VaktarAI workspace"}
            </p>
          </div>

          <div style={styles.fields}>
            {tab === "signup" && (
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#5F9598" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="7" r="4" stroke="#5F9598" strokeWidth="2"/>
                  </svg>
                </span>
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="#5F9598" strokeWidth="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="#5F9598" strokeWidth="2"/>
                </svg>
              </span>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder={tab === "signin" ? "hello@vaktar.ai" : "your@email.com"}
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#5F9598" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#5F9598" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#5F9598" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#5F9598" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="#5F9598" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#5F9598" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="#5F9598" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#5F9598" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#5F9598" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button
            style={{ ...styles.ctaBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait…" : tab === "signup" ? "Create Account →" : "Sign In →"}
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>OR CONTINUE WITH</span>
            <div style={styles.dividerLine} />
          </div>

          <button
            style={{ ...styles.googleBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#5F9598"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#F3F4F4"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#1D546D"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#061E29"/>
            </svg>
            Continue with Google
          </button>

          <p style={styles.footerLink}>
            {tab === "signup" ? (
              <>Already have an account?{" "}
                <span style={styles.link} onClick={() => { setTab("signin"); setError("") }}>Sign in</span>
              </>
            ) : (
              <>Don't have an account?{" "}
                <span style={styles.link} onClick={() => { setTab("signup"); setError("") }}>Sign up free</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F3F4F4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "108px 24px 32px",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: "none",
    pointerEvents: "none",
  },
  card: {
    display: "flex",
    width: "min(920px, 95vw)",
    minHeight: 560,
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 20px 48px rgba(29,84,109,0.12)",
    position: "relative",
    zIndex: 1,
    border: "1px solid rgba(95,149,152,0.18)",
    background: "#F3F4F4",
  },
  leftPanel: {
    flex: "0 0 380px",
    background: "#F3F4F4",
    padding: "44px 40px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(95,149,152,0.22)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
  },
  logoImage: {
    height: 72,
    width: "auto",
    display: "block",
    objectFit: "contain",
  },
  tagline: { marginBottom: 12 },
  taglineMain: { fontSize: 28, fontWeight: 800, color: "#061E29", margin: 0, lineHeight: 1.2 },
  taglineAccent: { fontSize: 28, fontWeight: 800, color: "#5F9598", margin: 0, lineHeight: 1.2 },
  taglineDesc: { fontSize: 13.5, color: "#1D546D", lineHeight: 1.6, marginBottom: 28 },
  featureList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#1D546D" },
  bullet: { width: 6, height: 6, borderRadius: "50%", background: "#5F9598", flexShrink: 0 },
  copyright: { marginTop: "auto", fontSize: 11.5, color: "#5F9598", paddingTop: 32 },
  rightPanel: {
    flex: 1,
    background: "#F3F4F4",
    padding: "40px 36px",
    display: "flex",
    flexDirection: "column",
  },
  tabBar: {
    display: "flex",
    background: "rgba(95,149,152,0.12)",
    borderRadius: 10,
    padding: 3,
    marginBottom: 28,
    border: "1px solid rgba(95,149,152,0.28)",
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: { background: "#1D546D", color: "#F3F4F4", boxShadow: "0 2px 8px rgba(29,84,109,0.16)" },
  tabInactive: { background: "transparent", color: "#5F9598" },
  formHeader: { marginBottom: 22 },
  formTitle: { fontSize: 22, fontWeight: 700, color: "#061E29", margin: "0 0 4px" },
  formSubtitle: { fontSize: 13, color: "#5F9598", margin: 0 },
  fields: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#F3F4F4",
    border: "1px solid rgba(95,149,152,0.35)",
    borderRadius: 10,
    transition: "border-color 0.2s",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 40px 12px 40px",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#061E29",
    fontSize: 13.5,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 4,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(95,149,152,0.12)",
    border: "1px solid rgba(95,149,152,0.45)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "#1D546D",
    fontSize: 12.5,
    marginTop: 8,
    marginBottom: 4,
  },
  ctaBtn: {
    marginTop: 16,
    width: "100%",
    padding: "13px 0",
    background: "#1D546D",
    border: "none",
    borderRadius: 10,
    color: "#F3F4F4",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.3px",
    boxShadow: "0 4px 16px rgba(29,84,109,0.16)",
    transition: "opacity 0.2s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "18px 0",
  },
  dividerLine: { flex: 1, height: 1, background: "rgba(95,149,152,0.3)" },
  dividerText: { fontSize: 10.5, color: "#5F9598", fontWeight: 600, letterSpacing: "0.8px", whiteSpace: "nowrap" },
  googleBtn: {
    width: "100%",
    padding: "11px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "#F3F4F4",
    border: "1px solid rgba(95,149,152,0.35)",
    borderRadius: 10,
    color: "#1D546D",
    fontSize: 13.5,
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  footerLink: { marginTop: 18, textAlign: "center", fontSize: 12.5, color: "#5F9598" },
  link: { color: "#F3F4F4", cursor: "pointer", fontWeight: 600 },
}
