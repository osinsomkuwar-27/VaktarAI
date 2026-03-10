import { useState, useRef } from 'react'
// import { generateAvatar } from '../api'

const TONES = ['Professional', 'Friendly', 'Energetic', 'Calm', 'Inspirational']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Hindi', 'Arabic', 'Portuguese']

const STATS = [
  { value: '1,234', label: 'Total Generations', icon: '◈', color: '#4f8eff' },
  { value: '98%',   label: 'Satisfaction Rate',  icon: '◉', color: '#10d9a0' },
  { value: '90s',  label: 'Avg. Gen Time',      icon: '◷', color: '#a78bfa' },
  { value: '22+',   label: 'Languages',           icon: '◎', color: '#fbbf24' },
  { value: '3 HD',  label: 'Output Formats',      icon: '▣', color: '#f87171' },
]

export default function FeaturesPage({ addToast }) {
  const [message,   setMessage]  = useState('')
  const [language,  setLanguage] = useState('English')
  const [tone,      setTone]     = useState('Professional')
  const [isLoading, setIsLoading]= useState(false)
  const [videoUrl,  setVideoUrl] = useState(null)
  const [isPlaying, setIsPlaying]= useState(false)
  const videoRef = useRef(null)

  const handleGenerate = async () => {
    if (!message.trim()) { addToast('Please enter your message.', 'warning'); return }
    setIsLoading(true)
    try {
      await new Promise(r => setTimeout(r, 2000)) // replace with real call
      setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4') // demo
      addToast('Avatar video generated!', 'success')
    } catch {
      addToast('Generation failed. Try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
    else { videoRef.current.pause(); setIsPlaying(false) }
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerLoad { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin360 { to{transform:rotate(360deg)} }
        @keyframes statPop { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        .stat-card:hover { border-color: rgba(79,142,255,0.3) !important; transform: translateY(-3px) !important; }
        .tone-chip:hover { border-color: rgba(79,142,255,0.4) !important; color: var(--text-secondary) !important; }
        .gen-btn:hover:not(:disabled) { box-shadow: 0 6px 32px rgba(79,142,255,0.5) !important; transform: translateY(-1px) !important; }
        textarea:focus { border-color: rgba(79,142,255,0.5) !important; outline:none; box-shadow: 0 0 0 3px rgba(79,142,255,0.08) !important; }
        select:focus { outline:none; border-color: rgba(79,142,255,0.5) !important; }
      `}</style>

      {/* Stats row */}
      <div style={s.statsRow}>
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ ...s.statCard, animationDelay:`${i*0.07}s` }}
          >
            <div style={{ ...s.statIcon, color: stat.color, textShadow:`0 0 12px ${stat.color}` }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ ...s.statValue, color: stat.color }}>{stat.value}</p>
              <p style={s.statLabel}>{stat.label}</p>
            </div>
            {/* Glow accent line */}
            <div style={{ ...s.statLine, background: stat.color }} />
          </div>
        ))}
      </div>

      {/* Main content: video left + controls right */}
      <div style={s.mainGrid}>

        {/* Left: Video player */}
        <div style={s.playerSection}>
          <div style={s.videoBox}>
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  style={s.video}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                />
                {!isPlaying && (
                  <button style={s.playOverlay} onClick={togglePlay}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="17" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.2)" />
                      <path d="M15 11l11 7-11 7V11z" fill="white" />
                    </svg>
                  </button>
                )}
              </>
            ) : isLoading ? (
              <div style={s.loadingBox}>
                <div style={s.loaderRing} />
                <p style={s.loadingText}>Building your video…</p>
              </div>
            ) : (
              <div style={s.emptyPlayer}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <rect x="4" y="4" width="48" height="48" rx="12" stroke="rgba(79,142,255,0.3)" strokeWidth="1.5" strokeDasharray="5 3"/>
                  <path d="M22 18l18 10-18 10V18z" fill="rgba(79,142,255,0.35)" />
                </svg>
                <p style={s.emptyVideoLabel}>Video Player</p>
                <p style={s.emptyVideoHint}>Generate a video to preview it here</p>
                {/* Grid lines */}
                <div style={s.gridLines} />
              </div>
            )}
          </div>

          {/* Playback controls */}
          <div style={s.playbackRow}>
            <button style={s.pbBtn} onClick={togglePlay}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {isPlaying
                  ? <><rect x="3" y="2" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="11" y="2" width="4" height="14" rx="1.5" fill="currentColor"/></>
                  : <path d="M4 2l12 7-12 7V2z" fill="currentColor"/>
                }
              </svg>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button style={s.pbBtn} onClick={() => addToast('Downloading…', 'info')}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v9M6 9l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Download
            </button>
            <button style={s.pbBtn} onClick={() => addToast('Share link copied!', 'success')}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="14" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="14" cy="14" r="2" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="4"  cy="9" r="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6 8l6-3M6 10l6 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={s.controlsCard}>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Your Message</label>
            <div style={s.textareaWrap}>
              <textarea
                style={s.textarea}
                rows={6}
                placeholder="Type the speech content for your avatar…"
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 500))}
              />
              <span style={s.charCount}>{message.length} / 500 characters</span>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Language</label>
            <div style={s.selectWrap}>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={s.select}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              <svg style={s.selectArrow} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Tone</label>
            <div style={s.toneGrid}>
              {TONES.map(t => (
                <button
                  key={t}
                  className="tone-chip"
                  onClick={() => setTone(t)}
                  style={{
                    ...s.toneChip,
                    ...(tone === t ? s.toneActive : s.toneIdle),
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            className="gen-btn"
            style={{
              ...s.generateBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin360 0.7s linear infinite',display:'inline-block' }} />
                Generating Avatar Video…
              </span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1l1.9 5.7L17 9l-6.1 2.3L9 17l-1.9-5.7L1 9l6.1-2.3L9 1z" fill="white"/>
                </svg>
                Generate Avatar Video
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 28px 60px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    animation: 'fadeUp 0.5s ease both',
  },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 14,
  },
  statCard: {
    position: 'relative',
    background: 'rgba(17,24,39,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s, border-color 0.2s',
    animation: 'statPop 0.4s ease both',
    overflow: 'hidden',
  },
  statIcon: { fontSize: 22, flexShrink: 0 },
  statValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 20, fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 10, fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  statLine: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 2, opacity: 0.5,
    borderRadius: '0 0 16px 16px',
  },

  // Main grid
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: 24,
    alignItems: 'start',
  },

  // Player section
  playerSection: {
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  videoBox: {
    position: 'relative',
    background: 'rgba(17,24,39,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    aspectRatio: '16/9',
    overflow: 'hidden',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  video: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  playOverlay: {
    position:'absolute', inset:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    background:'rgba(0,0,0,0.2)', border:'none', cursor:'pointer',
  },
  emptyPlayer: {
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    gap:14, width:'100%', height:'100%', position:'relative',
  },
  emptyVideoLabel: {
    fontFamily:'var(--font-display)', fontSize:22, fontWeight:800,
    color:'rgba(240,244,255,0.15)', letterSpacing:'0.03em',
  },
  emptyVideoHint: { fontSize:12, color:'var(--text-muted)' },
  gridLines: {
    position:'absolute', inset:0,
    backgroundImage:'linear-gradient(rgba(79,142,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,255,0.04) 1px,transparent 1px)',
    backgroundSize:'40px 40px', pointerEvents:'none', borderRadius:20,
  },
  loadingBox: {
    display:'flex', flexDirection:'column', alignItems:'center', gap:16,
  },
  loaderRing: {
    width:50, height:50, borderRadius:'50%',
    border:'3px solid rgba(79,142,255,0.2)',
    borderTopColor:'#4f8eff',
    animation:'spin360 0.8s linear infinite',
  },
  loadingText: {
    fontSize:13, fontWeight:600, color:'var(--text-secondary)',
    fontFamily:'var(--font-display)', letterSpacing:'0.05em',
  },

  // Playback row
  playbackRow: {
    display:'flex', gap:10,
  },
  pbBtn: {
    flex:1,
    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
    padding:'10px',
    background:'rgba(17,24,39,0.85)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:12,
    color:'var(--text-secondary)',
    fontFamily:'var(--font-display)',
    fontSize:12, fontWeight:700,
    letterSpacing:'0.05em',
    cursor:'pointer',
    backdropFilter:'blur(12px)',
    transition:'all 0.2s',
  },

  // Controls card
  controlsCard: {
    background:'rgba(17,24,39,0.85)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:20,
    padding:'24px',
    backdropFilter:'blur(16px)',
    boxShadow:'0 20px 60px rgba(0,0,0,0.4)',
    display:'flex', flexDirection:'column', gap:20,
  },
  fieldGroup: {
    display:'flex', flexDirection:'column', gap:8,
  },
  fieldLabel: {
    fontFamily:'var(--font-display)',
    fontSize:11, fontWeight:800,
    letterSpacing:'0.1em',
    color:'var(--text-muted)',
    textTransform:'uppercase',
  },
  textareaWrap: { position:'relative' },
  textarea: {
    width:'100%', boxSizing:'border-box',
    background:'rgba(6,9,26,0.6)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:12, padding:'12px 14px',
    color:'var(--text-primary)',
    fontSize:13, lineHeight:1.65,
    fontFamily:'var(--font-body)',
    resize:'vertical',
    transition:'border-color 0.2s, box-shadow 0.2s',
    display:'block',
  },
  charCount: {
    position:'absolute', bottom:10, right:12,
    fontSize:10, color:'var(--text-muted)',
    fontWeight:500, pointerEvents:'none',
  },
  selectWrap: {
    position:'relative',
  },
  select: {
    width:'100%', boxSizing:'border-box',
    background:'rgba(6,9,26,0.7)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:10, padding:'10px 36px 10px 14px',
    color:'var(--text-secondary)',
    fontSize:13, fontFamily:'var(--font-body)',
    cursor:'pointer',
    appearance:'none',
    transition:'border-color 0.2s',
  },
  selectArrow: {
    position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
    pointerEvents:'none',
  },
  toneGrid: {
    display:'flex', flexWrap:'wrap', gap:8,
  },
  toneChip: {
    padding:'6px 14px',
    borderRadius:100,
    fontSize:11, fontWeight:700,
    letterSpacing:'0.04em',
    cursor:'pointer',
    border:'1px solid',
    transition:'all 0.18s',
    fontFamily:'var(--font-display)',
  },
  toneActive: {
    background:'rgba(79,142,255,0.15)',
    borderColor:'rgba(79,142,255,0.5)',
    color:'#a0c0ff',
    boxShadow:'0 0 10px rgba(79,142,255,0.2)',
  },
  toneIdle: {
    background:'rgba(255,255,255,0.03)',
    borderColor:'rgba(255,255,255,0.08)',
    color:'var(--text-muted)',
  },
  generateBtn: {
    display:'flex', alignItems:'center', justifyContent:'center', gap:9,
    width:'100%', padding:'14px',
    background:'linear-gradient(135deg,#4f8eff,#a78bfa)',
    border:'none', borderRadius:12,
    color:'#fff',
    fontFamily:'var(--font-display)',
    fontSize:14, fontWeight:800,
    letterSpacing:'0.03em',
    boxShadow:'0 4px 20px rgba(79,142,255,0.3)',
    transition:'all 0.2s ease',
  },
}