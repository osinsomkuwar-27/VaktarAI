import { useState, useRef } from 'react'
import { generateAvatar } from '../api'

const TONES = ['Professional', 'Friendly', 'Energetic', 'Calm', 'Inspirational']

const LANGUAGE_MAP = {
  'English':    'en',
  'Hindi':      'hi',
  'Tamil':      'ta',
  'Telugu':     'te',
  'Marathi':    'mr',
  'Bengali':    'bn',
  'Gujarati':   'gu',
  'Spanish':    'es',
  'French':     'fr',
  'German':     'de',
  'Japanese':   'ja',
  'Arabic':     'ar',
  'Portuguese': 'pt',
}

const TONE_MAP = {
  'Professional':  'formal',
  'Friendly':      'calm',
  'Energetic':     'urgent',
  'Calm':          'calm',
  'Inspirational': 'inspiring',
}

const STATS = [
  { value: '1,234', label: 'Total Generations', icon: '◈', color: '#4f8eff' },
  { value: '98%',   label: 'Satisfaction Rate',  icon: '◉', color: '#10d9a0' },
  { value: '90s',   label: 'Avg. Gen Time',      icon: '◷', color: '#a78bfa' },
  { value: '22+',   label: 'Languages',           icon: '◎', color: '#fbbf24' },
  { value: '3 HD',  label: 'Output Formats',      icon: '▣', color: '#f87171' },
]

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export default function FeaturesPage({ addToast }) {
  const [message,      setMessage]      = useState('')
  const [language,     setLanguage]     = useState('Hindi')
  const [tone,         setTone]         = useState('Professional')
  const [isLoading,    setIsLoading]    = useState(false)
  const [videoUrl,     setVideoUrl]     = useState(null)
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [image,        setImage]        = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [genProgress,  setGenProgress]  = useState(0)
  const [dragOver,     setDragOver]     = useState(false)

  const videoRef    = useRef(null)
  const fileInputRef = useRef(null)

  // ── File handling ──
  const handleFile = (file) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      addToast('Please upload a JPG, PNG, or WebP image.', 'error'); return
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Image must be under 10 MB.', 'error'); return
    }
    setImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  // ── Generate ──
  const handleGenerate = async () => {
    if (!image)          { addToast('Please upload a portrait photo.', 'warning'); return }
    if (!message.trim()) { addToast('Please enter your message.',       'warning'); return }

    setIsLoading(true)
    setGenProgress(0)
    setVideoUrl(null)

    let interval

    try {
      // Simulate progress while pipeline runs
      interval = setInterval(() => {
        setGenProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 2
        })
      }, 1000)

      const data = await generateAvatar(
        image,
        message,
        (pct) => setGenProgress(Math.round(pct * 20)),
        LANGUAGE_MAP[language] || 'hi',
        TONE_MAP[tone] || null
      )

      clearInterval(interval)
      setGenProgress(100)

      if (!data?.video_url) throw new Error('No video returned.')

      setTimeout(() => {
        setVideoUrl(data.video_url)
        setIsLoading(false)
        addToast('Avatar video generated!', 'success')
      }, 400)

    } catch (err) {
      clearInterval(interval)
      setIsLoading(false)
      setGenProgress(0)
      addToast(err?.message || 'Generation failed. Try again.', 'error')
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
    else { videoRef.current.pause(); setIsPlaying(false) }
  }

  const handleDownload = () => {
    if (!videoUrl) { addToast('No video to download yet.', 'info'); return }
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = 'avatar.mp4'
    a.click()
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin360  { to{transform:rotate(360deg)} }
        @keyframes statPop  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        .stat-card:hover    { border-color:rgba(79,142,255,0.3)!important; transform:translateY(-3px)!important; }
        .tone-chip:hover    { border-color:rgba(79,142,255,0.4)!important; color:var(--text-secondary)!important; }
        .gen-btn:hover:not(:disabled) { box-shadow:0 6px 32px rgba(79,142,255,0.5)!important; transform:translateY(-1px)!important; }
        .drop-zone:hover    { border-color:rgba(79,142,255,0.7)!important; background:rgba(79,142,255,0.08)!important; }
        textarea:focus      { border-color:rgba(79,142,255,0.5)!important; outline:none; box-shadow:0 0 0 3px rgba(79,142,255,0.08)!important; }
        select:focus        { outline:none; border-color:rgba(79,142,255,0.5)!important; }
      `}</style>

      {/* Stats row */}
      <div style={s.statsRow}>
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card" style={{ ...s.statCard, animationDelay:`${i*0.07}s` }}>
            <div style={{ ...s.statIcon, color:stat.color, textShadow:`0 0 12px ${stat.color}` }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ ...s.statValue, color:stat.color }}>{stat.value}</p>
              <p style={s.statLabel}>{stat.label}</p>
            </div>
            <div style={{ ...s.statLine, background:stat.color }} />
          </div>
        ))}
      </div>

      {/* Main grid */}
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
                  playsInline autoPlay
                />
                {!isPlaying && (
                  <button style={s.playOverlay} onClick={togglePlay}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="17" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.2)"/>
                      <path d="M15 11l11 7-11 7V11z" fill="white"/>
                    </svg>
                  </button>
                )}
              </>
            ) : isLoading ? (
              <div style={s.loadingBox}>
                <div style={s.loaderRing} />
                <p style={s.loadingText}>Building your avatar video…</p>
                <div style={s.progressTrack}>
                  <div style={{ ...s.progressFill, width:`${genProgress}%` }} />
                </div>
                <p style={s.progressPct}>{Math.round(genProgress)}%</p>
              </div>
            ) : imagePreview ? (
              <img
                src={imagePreview}
                alt="Portrait preview"
                style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}
              />
            ) : (
              <div style={s.emptyPlayer}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <rect x="4" y="4" width="48" height="48" rx="12" stroke="rgba(79,142,255,0.3)" strokeWidth="1.5" strokeDasharray="5 3"/>
                  <path d="M22 18l18 10-18 10V18z" fill="rgba(79,142,255,0.35)"/>
                </svg>
                <p style={s.emptyVideoLabel}>Video Player</p>
                <p style={s.emptyVideoHint}>Generate a video to preview it here</p>
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
                  : <path d="M4 2l12 7-12 7V2z" fill="currentColor"/>}
              </svg>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button style={s.pbBtn} onClick={handleDownload}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v9M6 9l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Download
            </button>
            <button style={s.pbBtn} onClick={() => {
              if (videoUrl) { navigator.clipboard.writeText(videoUrl); addToast('Video URL copied!', 'success') }
              else addToast('No video to share yet.', 'info')
            }}>
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

          {/* Photo upload */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Portrait Photo</label>
            {imagePreview ? (
              <div style={s.photoPreview}>
                <img src={imagePreview} alt="Portrait" style={s.photoImg} />
                <div style={s.photoMeta}>
                  <span style={{ fontSize:11, color:'#10d9a0', fontWeight:600 }}>✓ Photo ready</span>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>{image?.name}</span>
                  <button onClick={() => { setImage(null); setImagePreview(null) }} style={s.clearBtn}>
                    Change photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="drop-zone"
                style={{ ...s.dropzone, ...(dragOver ? { borderColor:'rgba(79,142,255,0.7)', background:'rgba(79,142,255,0.08)' } : {}) }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#4f8eff" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#4f8eff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>
                  <strong style={{ color:'var(--text-secondary)' }}>Click or drag</strong> to upload portrait
                </p>
                <p style={{ fontSize:10, color:'var(--text-muted)', margin:0 }}>JPG · PNG · WebP — max 10 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display:'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {/* Message */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Your Message</label>
            <div style={s.textareaWrap}>
              <textarea
                style={s.textarea}
                rows={5}
                placeholder="Type the speech content for your avatar…"
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 500))}
              />
              <span style={s.charCount}>{message.length} / 500 characters</span>
            </div>
          </div>

          {/* Language */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Language</label>
            <div style={s.selectWrap}>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={s.select}>
                {Object.keys(LANGUAGE_MAP).map(l => <option key={l}>{l}</option>)}
              </select>
              <svg style={s.selectArrow} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Tone */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Tone</label>
            <div style={s.toneGrid}>
              {TONES.map(t => (
                <button
                  key={t}
                  className="tone-chip"
                  onClick={() => setTone(t)}
                  style={{ ...s.toneChip, ...(tone === t ? s.toneActive : s.toneIdle) }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            className="gen-btn"
            style={{ ...s.generateBtn, opacity:isLoading ? 0.7 : 1, cursor:isLoading ? 'not-allowed' : 'pointer' }}
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
  page:         { maxWidth:1200, margin:'0 auto', padding:'40px 28px 60px', display:'flex', flexDirection:'column', gap:28, animation:'fadeUp 0.5s ease both' },
  statsRow:     { display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:14 },
  statCard:     { position:'relative', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'16px 18px', display:'flex', alignItems:'center', gap:12, backdropFilter:'blur(12px)', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', transition:'transform 0.2s, border-color 0.2s', animation:'statPop 0.4s ease both', overflow:'hidden' },
  statIcon:     { fontSize:22, flexShrink:0 },
  statValue:    { fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1 },
  statLabel:    { fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.05em', marginTop:3, textTransform:'uppercase' },
  statLine:     { position:'absolute', bottom:0, left:0, right:0, height:2, opacity:0.5, borderRadius:'0 0 16px 16px' },
  mainGrid:     { display:'grid', gridTemplateColumns:'1fr 420px', gap:24, alignItems:'start' },
  playerSection:{ display:'flex', flexDirection:'column', gap:14 },
  videoBox:     { position:'relative', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, aspectRatio:'16/9', overflow:'hidden', backdropFilter:'blur(16px)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' },
  video:        { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  playOverlay:  { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)', border:'none', cursor:'pointer' },
  emptyPlayer:  { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, width:'100%', height:'100%', position:'relative' },
  emptyVideoLabel:{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'rgba(240,244,255,0.15)', letterSpacing:'0.03em' },
  emptyVideoHint: { fontSize:12, color:'var(--text-muted)' },
  gridLines:    { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(79,142,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,255,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', borderRadius:20 },
  loadingBox:   { display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  loaderRing:   { width:50, height:50, borderRadius:'50%', border:'3px solid rgba(79,142,255,0.2)', borderTopColor:'#4f8eff', animation:'spin360 0.8s linear infinite' },
  loadingText:  { fontSize:13, fontWeight:600, color:'var(--text-secondary)', fontFamily:'var(--font-display)', letterSpacing:'0.05em' },
  progressTrack:{ width:200, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' },
  progressFill: { height:'100%', background:'linear-gradient(90deg,#4f8eff,#a78bfa)', borderRadius:2, transition:'width 0.4s ease' },
  progressPct:  { fontSize:11, fontWeight:700, color:'var(--accent)', fontFamily:'monospace' },
  playbackRow:  { display:'flex', gap:10 },
  pbBtn:        { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, color:'var(--text-secondary)', fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, letterSpacing:'0.05em', cursor:'pointer', backdropFilter:'blur(12px)', transition:'all 0.2s' },
  controlsCard: { background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'24px', backdropFilter:'blur(16px)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', gap:18 },
  fieldGroup:   { display:'flex', flexDirection:'column', gap:8 },
  fieldLabel:   { fontFamily:'var(--font-display)', fontSize:11, fontWeight:800, letterSpacing:'0.1em', color:'var(--text-muted)', textTransform:'uppercase' },
  dropzone:     { display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'16px', border:'2px dashed rgba(79,142,255,0.4)', borderRadius:12, cursor:'pointer', background:'rgba(79,142,255,0.04)', transition:'all 0.2s', textAlign:'center' },
  photoPreview: { display:'flex', gap:12, alignItems:'center', padding:'10px', background:'rgba(79,142,255,0.04)', border:'1px solid rgba(79,142,255,0.12)', borderRadius:12 },
  photoImg:     { width:56, height:70, objectFit:'cover', objectPosition:'center top', borderRadius:8, border:'1px solid rgba(79,142,255,0.2)' },
  photoMeta:    { display:'flex', flexDirection:'column', gap:4 },
  clearBtn:     { marginTop:4, padding:'4px 10px', background:'rgba(79,142,255,0.1)', border:'1px solid rgba(79,142,255,0.3)', borderRadius:6, color:'#7aadff', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)' },
  textareaWrap: { position:'relative' },
  textarea:     { width:'100%', boxSizing:'border-box', background:'rgba(6,9,26,0.6)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px', color:'var(--text-primary)', fontSize:13, lineHeight:1.65, fontFamily:'var(--font-body)', resize:'vertical', transition:'border-color 0.2s, box-shadow 0.2s', display:'block' },
  charCount:    { position:'absolute', bottom:10, right:12, fontSize:10, color:'var(--text-muted)', fontWeight:500, pointerEvents:'none' },
  selectWrap:   { position:'relative' },
  select:       { width:'100%', boxSizing:'border-box', background:'rgba(6,9,26,0.7)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 36px 10px 14px', color:'var(--text-secondary)', fontSize:13, fontFamily:'var(--font-body)', cursor:'pointer', appearance:'none', transition:'border-color 0.2s' },
  selectArrow:  { position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' },
  toneGrid:     { display:'flex', flexWrap:'wrap', gap:8 },
  toneChip:     { padding:'6px 14px', borderRadius:100, fontSize:11, fontWeight:700, letterSpacing:'0.04em', cursor:'pointer', border:'1px solid', transition:'all 0.18s', fontFamily:'var(--font-display)' },
  toneActive:   { background:'rgba(79,142,255,0.15)', borderColor:'rgba(79,142,255,0.5)', color:'#a0c0ff', boxShadow:'0 0 10px rgba(79,142,255,0.2)' },
  toneIdle:     { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.08)', color:'var(--text-muted)' },
  generateBtn:  { display:'flex', alignItems:'center', justifyContent:'center', gap:9, width:'100%', padding:'14px', background:'linear-gradient(135deg,#4f8eff,#a78bfa)', border:'none', borderRadius:12, color:'#fff', fontFamily:'var(--font-display)', fontSize:14, fontWeight:800, letterSpacing:'0.03em', boxShadow:'0 4px 20px rgba(79,142,255,0.3)', transition:'all 0.2s ease' },
}