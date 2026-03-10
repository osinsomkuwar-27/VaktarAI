import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─────────────────────────────────────────────
   Real portrait photos via public APIs
   Using randomuser.me which returns real
   portrait photos — most realistic possible
───────────────────────────────────────────── */

const AVATARS = [
  // Lane 1 — Professional / Creator types
  { id: 1,  src: 'https://randomuser.me/api/portraits/women/1.jpg',  name: 'Sarah K.',   role: 'Creator',    verified: true  },
  { id: 2,  src: 'https://randomuser.me/api/portraits/men/32.jpg',   name: 'James R.',   role: 'Director',   verified: true  },
  { id: 3,  src: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Priya M.',   role: 'Presenter',  verified: false },
  { id: 4,  src: 'https://randomuser.me/api/portraits/men/7.jpg',    name: 'Marcus T.',  role: 'Narrator',   verified: true  },
  { id: 5,  src: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Elena V.',   role: 'Anchor',     verified: true  },
  { id: 6,  src: 'https://randomuser.me/api/portraits/men/54.jpg',   name: 'David L.',   role: 'Coach',      verified: false },
  { id: 7,  src: 'https://randomuser.me/api/portraits/women/22.jpg', name: 'Aisha N.',   role: 'Designer',   verified: true  },
  { id: 8,  src: 'https://randomuser.me/api/portraits/men/18.jpg',   name: 'Oliver P.',  role: 'Engineer',   verified: false },

  // Lane 2 — Diverse professionals
  { id: 9,  src: 'https://randomuser.me/api/portraits/women/55.jpg', name: 'Yuki T.',    role: 'Streamer',   verified: true  },
  { id: 10, src: 'https://randomuser.me/api/portraits/men/41.jpg',   name: 'Rafael S.',  role: 'Advisor',    verified: true  },
  { id: 11, src: 'https://randomuser.me/api/portraits/women/33.jpg', name: 'Sofia B.',   role: 'Speaker',    verified: false },
  { id: 12, src: 'https://randomuser.me/api/portraits/men/62.jpg',   name: 'Noah W.',    role: 'Educator',   verified: true  },
  { id: 13, src: 'https://randomuser.me/api/portraits/women/77.jpg', name: 'Zara H.',    role: 'Producer',   verified: true  },
  { id: 14, src: 'https://randomuser.me/api/portraits/men/25.jpg',   name: 'Ethan M.',   role: 'Blogger',    verified: false },
  { id: 15, src: 'https://randomuser.me/api/portraits/women/11.jpg', name: 'Nadia F.',   role: 'Trainer',    verified: true  },
  { id: 16, src: 'https://randomuser.me/api/portraits/men/88.jpg',   name: 'Leon K.',    role: 'Host',       verified: true  },

  // Lane 3 — Mixed
  { id: 17, src: 'https://randomuser.me/api/portraits/women/90.jpg', name: 'Mia C.',     role: 'Vlogger',    verified: true  },
  { id: 18, src: 'https://randomuser.me/api/portraits/men/3.jpg',    name: 'Arjun D.',   role: 'Mentor',     verified: false },
  { id: 19, src: 'https://randomuser.me/api/portraits/women/49.jpg', name: 'Chloe A.',   role: 'Consultant', verified: true  },
  { id: 20, src: 'https://randomuser.me/api/portraits/men/76.jpg',   name: 'Samuel O.',  role: 'Analyst',    verified: true  },
  { id: 21, src: 'https://randomuser.me/api/portraits/women/17.jpg', name: 'Luna R.',    role: 'Writer',     verified: false },
  { id: 22, src: 'https://randomuser.me/api/portraits/men/47.jpg',   name: 'Carlos V.',  role: 'Developer',  verified: true  },
  { id: 23, src: 'https://randomuser.me/api/portraits/women/36.jpg', name: 'Hana S.',    role: 'Artist',     verified: true  },
  { id: 24, src: 'https://randomuser.me/api/portraits/men/13.jpg',   name: 'Tyler B.',   role: 'Podcaster',  verified: false },
]

// Split into 3 lanes
const LANE1 = AVATARS.slice(0, 8)
const LANE2 = AVATARS.slice(8, 16)
const LANE3 = AVATARS.slice(16, 24)

// Role accent colors
const ROLE_COLORS = {
  Creator: '#4f8eff', Director: '#a78bfa', Presenter: '#10d9a0',
  Narrator: '#fbbf24', Anchor: '#f87171',  Coach: '#34d399',
  Designer: '#818cf8', Engineer: '#fb923c', Streamer: '#e879f9',
  Advisor: '#38bdf8',  Speaker: '#a3e635', Educator: '#fb7185',
  Producer: '#c084fc', Blogger: '#4ade80',  Trainer: '#facc15',
  Host: '#60a5fa',     Vlogger: '#34d399',  Mentor: '#a78bfa',
  Consultant: '#4f8eff', Analyst: '#f87171', Writer: '#10d9a0',
  Developer: '#818cf8', Artist: '#e879f9',  Podcaster: '#fbbf24',
}

/* ── Single avatar card ── */
const CARD_W = 160
const GAP    = 14

function AvatarCard({ av }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const roleColor = ROLE_COLORS[av.role] || '#4f8eff'

  return (
    <div style={{
      flexShrink: 0,
      width: CARD_W,
      background: 'rgba(12,16,32,0.9)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      transition: 'transform 0.3s',
    }}>
      {/* Photo */}
      <div style={{
        position: 'relative',
        height: 170,
        background: `linear-gradient(160deg, ${roleColor}15, rgba(8,10,20,0.98))`,
        overflow: 'hidden',
      }}>
        {/* Shimmer while loading */}
        {!loaded && !errored && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}/>
        )}

        {/* Fallback silhouette when errored */}
        {errored && (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(160deg, ${roleColor}12, rgba(8,10,20,0.98))`,
          }}>
            <svg width="70" height="85" viewBox="0 0 100 120" fill="none">
              <circle cx="50" cy="38" r="28"
                fill={`${roleColor}20`} stroke={`${roleColor}50`} strokeWidth="1.5"/>
              <circle cx="50" cy="38" r="14" fill={`${roleColor}30`}/>
              <path d="M10 110c0-22.1 17.9-40 40-40s40 17.9 40 40"
                stroke={`${roleColor}50`} strokeWidth="1.5" strokeLinecap="round"
                fill={`${roleColor}15`}/>
            </svg>
          </div>
        )}

        {/* Actual photo */}
        <img
          src={av.src}
          alt={av.name}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            display: loaded ? 'block' : 'none',
            transition: 'opacity 0.4s',
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />

        {/* Gradient overlay at bottom for text readability */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 60,
          background: 'linear-gradient(to top, rgba(8,10,22,0.95), transparent)',
          pointerEvents: 'none',
        }}/>

        {/* Verified badge */}
        {av.verified && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            width: 22, height: 22,
            background: 'rgba(8,10,22,0.8)',
            border: `1px solid ${roleColor}60`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" fill={roleColor} opacity="0.2"/>
              <path d="M3.5 6l1.8 1.8 3.2-3.2"
                stroke={roleColor} strokeWidth="1.3"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* Role chip overlaid on photo bottom */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10,
          padding: '2px 8px',
          background: `${roleColor}22`,
          border: `1px solid ${roleColor}45`,
          borderRadius: 100,
          fontSize: 9, fontWeight: 800,
          letterSpacing: '0.07em',
          color: roleColor,
          backdropFilter: 'blur(6px)',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
        }}>
          {av.role}
        </div>

        {/* Ambient glow at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${roleColor}60, transparent)`,
          pointerEvents: 'none',
        }}/>
      </div>

      {/* Name row */}
      <div style={{
        padding: '9px 12px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: `1px solid rgba(255,255,255,0.04)`,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 12, fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>{av.name}</span>
        {/* Online dot */}
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#10d9a0',
          boxShadow: '0 0 6px #10d9a0',
          flexShrink: 0,
        }}/>
      </div>
    </div>
  )
}

/* ── Stripe ── */
function AvatarStripe({ avatars, direction, lane, speed }) {
  const quad    = [...avatars, ...avatars, ...avatars, ...avatars]
  const anim    = `lane${lane}${direction}`
  const totalW  = avatars.length * (CARD_W + GAP)

  return (
    <div style={{
      overflow: 'hidden', width: '100%',
      maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
    }}>
      <style>{`
        @keyframes ${anim} {
          from { transform: translateX(${direction === 'fwd' ? 0 : -totalW}px); }
          to   { transform: translateX(${direction === 'fwd' ? -totalW : 0}px); }
        }
      `}</style>
      <div style={{
        display: 'flex', gap: GAP,
        willChange: 'transform',
        animation: `${anim} ${speed}s linear infinite`,
        padding: '8px 0',
      }}>
        {quad.map((av, i) => (
          <AvatarCard key={`${av.id}-${i}`} av={av}/>
        ))}
      </div>
    </div>
  )
}

/* ── Login Page ── */
export default function LoginPage({ addToast }) {
  const navigate = useNavigate()
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData,     setFormData]     = useState({ username: '', password: '' })
  const [errors,       setErrors]       = useState({})
  const [focused,      setFocused]      = useState(null)

  const update = (f, v) => {
    setFormData(p => ({ ...p, [f]: v }))
    setErrors(p => ({ ...p, [f]: null }))
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const errs = {}
    if (!formData.username.trim()) errs.username = 'Username is required'
    if (!formData.password.trim()) errs.password = 'Password is required'
    if (Object.keys(errs).length) {
      setErrors(errs)
      addToast?.('Please fill in all fields', 'error')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      addToast?.('Welcome back! Redirecting…', 'success')
      navigate('/create')
    }, 1500)
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cardPulse {
          0%,100% { box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07), 0 0 50px rgba(79,142,255,0.05); }
          50%     { box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(79,142,255,0.2),  0 0 80px rgba(79,142,255,0.12); }
        }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes arrow  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .fi:focus  { outline: none !important; }
        .sbtn:hover:not(:disabled) { transform: translateY(-2px) scale(1.015) !important; box-shadow: 0 10px 48px rgba(79,142,255,0.55) !important; }
        .sbtn:active:not(:disabled) { transform: scale(0.985) !important; }
        .socbtn:hover { background: rgba(79,142,255,0.1) !important; border-color: rgba(79,142,255,0.4) !important; }
        .rlink:hover  { color: #90b8ff !important; text-decoration: underline; }
        .fbtn:hover   { color: var(--accent) !important; }
        .eyebtn:hover { color: var(--text-primary) !important; }
      `}</style>

      {/* ════ BACKGROUND STRIPES ════ */}
      <div style={s.bg}>
        {/* Dark overlay */}
        <div style={s.overlay}/>
        {/* Center vignette to frame the card */}
        <div style={s.vignette}/>
        {/* Subtle noise texture */}
        <div style={s.noise}/>

        <div style={s.stripe}><AvatarStripe avatars={LANE1} direction="fwd" lane={1} speed={60}/></div>
        <div style={s.divLine}/>
        <div style={s.stripe}><AvatarStripe avatars={LANE2} direction="rev" lane={2} speed={72}/></div>
        <div style={s.divLine}/>
        <div style={s.stripe}><AvatarStripe avatars={LANE3} direction="fwd" lane={3} speed={54}/></div>
      </div>

      {/* ════ LOGIN CARD ════ */}
      <div style={s.cardWrap}>
        <div style={s.card}>
          {/* Top prismatic edge */}
          <div style={s.prismEdge}/>

          {/* Logo */}
          <div style={s.logoRow}>
            <div style={s.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="white"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="19" cy="5" r="2.5" fill="#4f8eff"/>
                <path d="M19 3v1M19 7v1M17 5h-1M21 5h1" stroke="#4f8eff" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={s.logoText}>AvatarAI</span>
          </div>

          {/* Status badge */}
          <div style={s.badge}>
            <span style={s.bdot}/>
            SECURE LOGIN
          </div>

          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to continue creating AI avatars</p>

          {/* Form */}
          <form onSubmit={handleLogin} style={s.form}>
            {/* Username */}
            <div style={s.field}>
              <label style={s.label}>USERNAME</label>
              <div style={{ ...s.ibox, ...(focused==='username' ? s.ifocus : {}), ...(errors.username ? s.ierr : {}) }}>
                <svg style={s.ficon} width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input className="fi" style={s.input} type="text" placeholder="Enter your username"
                  value={formData.username} onChange={e => update('username', e.target.value)}
                  onFocus={() => setFocused('username')} onBlur={() => setFocused(null)}
                  autoComplete="username"/>
              </div>
              {errors.username && <p style={s.errmsg}>{errors.username}</p>}
            </div>

            {/* Password */}
            <div style={s.field}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <label style={s.label}>PASSWORD</label>
                <button type="button" className="fbtn" style={s.forgot}>Forgot password?</button>
              </div>
              <div style={{ ...s.ibox, ...(focused==='password' ? s.ifocus : {}), ...(errors.password ? s.ierr : {}) }}>
                <svg style={s.ficon} width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="8" cy="11" r="1.2" fill="currentColor"/>
                </svg>
                <input className="fi" style={{ ...s.input, paddingRight: 44 }}
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
                  value={formData.password} onChange={e => update('password', e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  autoComplete="current-password"/>
                <button type="button" className="eyebtn" style={s.eyebtn}
                  onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword
                    ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M3 3l10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>
                  }
                </button>
              </div>
              {errors.password && <p style={s.errmsg}>{errors.password}</p>}
            </div>

            {/* Remember */}
            <label style={s.remember}>
              <input type="checkbox" style={{ accentColor:'#4f8eff', width:13, height:13 }}/>
              <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:7 }}>
                Remember me for 30 days
              </span>
            </label>

            {/* Submit */}
            <button type="submit" className="sbtn" disabled={loading}
              style={{ ...s.submit, opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <span style={{ width:15, height:15, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
                    Authenticating…
                  </span>
                : <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    LOGIN
                    <span style={{ animation:'arrow 1.4s ease-in-out infinite', display:'inline-block' }}>→</span>
                  </span>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={s.divrow}>
            <div style={s.divline}/><span style={s.divtxt}>or continue with</span><div style={s.divline}/>
          </div>

          {/* Social */}
          <div style={s.socialrow}>
            {[
              { l: 'Google', i: <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
              { l: 'GitHub',  i: <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--text-secondary)"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg> },
            ].map(({ l, i }) => (
              <button key={l} className="socbtn" style={s.socbtn}
                onClick={() => addToast?.(`${l} login coming soon`, 'info')}>
                {i}<span>{l}</span>
              </button>
            ))}
          </div>

          {/* Register */}
          <p style={s.reg}>
            New to AvatarAI?{' '}
            <span className="rlink" style={s.rlink}
              onClick={() => addToast?.('Registration coming soon!', 'info')}>
              Create free account →
            </span>
          </p>

          {/* Live counter strip */}
          <div style={s.counter}>
            <div style={s.counterDot}/>
            <span style={s.counterTxt}>1,234 avatars created today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Styles ── */
const s = {
  page: {
    position: 'relative', minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', background: '#05070f',
  },

  bg: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(4,6,16,0.65)',
    zIndex: 2, pointerEvents: 'none',
  },
  vignette: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 55% 100% at 50% 50%, transparent 20%, rgba(3,5,14,0.92) 100%)',
    zIndex: 3, pointerEvents: 'none',
  },
  noise: {
    position: 'absolute', inset: 0,
    opacity: 0.025,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    zIndex: 4, pointerEvents: 'none',
  },
  stripe: {
    flex: 1, display: 'flex', alignItems: 'center',
    overflow: 'hidden', position: 'relative', zIndex: 1,
  },
  divLine: {
    height: 1, background: 'rgba(255,255,255,0.035)',
    position: 'relative', zIndex: 1,
  },

  cardWrap: {
    position: 'relative', zIndex: 10,
    padding: 20, animation: 'fadeUp 0.55s ease both',
  },
  card: {
    width: 400,
    background: 'rgba(8,11,24,0.94)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24, padding: '28px 28px 20px',
    backdropFilter: 'blur(48px)',
    display: 'flex', flexDirection: 'column', gap: 13,
    position: 'relative', overflow: 'hidden',
    animation: 'cardPulse 4s ease-in-out infinite',
  },
  prismEdge: {
    position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(79,142,255,0.8), rgba(167,139,250,0.6), rgba(16,217,160,0.4), transparent)',
    pointerEvents: 'none',
  },

  logoRow: { display:'flex', alignItems:'center', gap:9, justifyContent:'center' },
  logoIcon: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, #4f8eff, #a78bfa)',
    borderRadius: 10, display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow: '0 4px 16px rgba(79,142,255,0.35)',
  },
  logoText: {
    fontFamily:'var(--font-display)', fontSize:20, fontWeight:800,
    color:'var(--text-primary)', letterSpacing:'-0.02em',
  },

  badge: {
    display:'inline-flex', alignItems:'center', gap:7, alignSelf:'center',
    padding:'4px 12px', background:'rgba(79,142,255,0.08)',
    border:'1px solid rgba(79,142,255,0.2)', borderRadius:100,
    fontSize:9, fontWeight:800, letterSpacing:'0.1em', color:'var(--accent)',
  },
  bdot: {
    width:5, height:5, borderRadius:'50%',
    background:'#10d9a0', boxShadow:'0 0 5px #10d9a0', flexShrink:0,
    animation:'blink 2s ease-in-out infinite',
  },

  title: {
    fontFamily:'var(--font-display)', fontSize:27, fontWeight:800,
    color:'var(--text-primary)', letterSpacing:'-0.03em',
    textAlign:'center', lineHeight:1.1, margin:0,
  },
  subtitle: {
    fontSize:13, color:'var(--text-secondary)',
    textAlign:'center', marginTop:-4,
  },

  form: { display:'flex', flexDirection:'column', gap:11 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: {
    fontFamily:'var(--font-display)', fontSize:9, fontWeight:800,
    letterSpacing:'0.1em', color:'var(--text-muted)', textTransform:'uppercase',
  },
  ibox: {
    position:'relative', display:'flex', alignItems:'center',
    background:'rgba(4,6,18,0.85)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:11, transition:'border-color 0.2s, box-shadow 0.2s',
  },
  ifocus: { borderColor:'rgba(79,142,255,0.5)', boxShadow:'0 0 0 3px rgba(79,142,255,0.08)' },
  ierr:   { borderColor:'rgba(248,113,113,0.5)', boxShadow:'0 0 0 3px rgba(248,113,113,0.08)' },
  ficon:  { position:'absolute', left:13, color:'var(--text-muted)', pointerEvents:'none' },
  input: {
    flex:1, background:'none', border:'none',
    padding:'11px 13px 11px 36px',
    color:'var(--text-primary)', fontSize:13,
    fontFamily:'var(--font-body)', width:'100%',
  },
  eyebtn: {
    position:'absolute', right:12, background:'none', border:'none',
    cursor:'pointer', color:'var(--text-muted)',
    display:'flex', alignItems:'center', padding:4, transition:'color 0.2s',
  },
  errmsg: {
    fontSize:9, fontWeight:700, color:'var(--error)',
    letterSpacing:'0.05em', textTransform:'uppercase', marginLeft:2,
  },
  forgot: {
    background:'none', border:'none', padding:0,
    fontSize:10, fontWeight:600, color:'var(--text-muted)',
    cursor:'pointer', letterSpacing:'0.02em', transition:'color 0.2s',
  },
  remember: { display:'flex', alignItems:'center', cursor:'pointer' },
  submit: {
    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
    width:'100%', padding:'13px',
    background:'linear-gradient(135deg, #4f8eff 0%, #7c6eff 50%, #a78bfa 100%)',
    border:'none', borderRadius:11, color:'#fff',
    fontFamily:'var(--font-display)', fontSize:13, fontWeight:800,
    letterSpacing:'0.08em',
    boxShadow:'0 4px 24px rgba(79,142,255,0.3)',
    transition:'all 0.2s cubic-bezier(0.34,1.3,0.64,1)', marginTop:4,
  },

  divrow: { display:'flex', alignItems:'center', gap:10 },
  divline: { flex:1, height:1, background:'rgba(255,255,255,0.06)' },
  divtxt: { fontSize:10, color:'var(--text-muted)', fontWeight:500, whiteSpace:'nowrap' },

  socialrow: { display:'flex', gap:8 },
  socbtn: {
    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
    padding:'10px', background:'rgba(14,18,36,0.85)',
    border:'1px solid rgba(255,255,255,0.07)', borderRadius:10,
    color:'var(--text-secondary)', fontSize:11, fontWeight:600,
    cursor:'pointer', fontFamily:'var(--font-body)',
    backdropFilter:'blur(8px)', transition:'all 0.2s',
  },

  reg: { textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:-2 },
  rlink: { color:'var(--accent)', fontWeight:700, cursor:'pointer', transition:'color 0.2s' },

  counter: {
    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
    paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.04)',
  },
  counterDot: {
    width:6, height:6, borderRadius:'50%',
    background:'#10d9a0', boxShadow:'0 0 6px #10d9a0',
    animation:'blink 2s ease-in-out infinite',
  },
  counterTxt: {
    fontSize:10, fontWeight:600,
    color:'var(--text-muted)', letterSpacing:'0.04em',
  },
}