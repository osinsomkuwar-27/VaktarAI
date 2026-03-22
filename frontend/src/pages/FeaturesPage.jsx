import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateAvatar } from '../api'
import CameraCapture from '../components/CameraCapture'

const SPEAKERS = [
  { key: 'shreeja',  label: 'Shreeja',  initials: 'SH', color: '#a78bfa' },
  { key: 'osin',     label: 'Osin',     initials: 'OS', color: '#10d9a0' },
  { key: 'soham',    label: 'Soham',    initials: 'SO', color: '#f87171' },
  { key: 'kshitij',  label: 'Kshitij',  initials: 'KS', color: '#4f8eff' },
  { key: 'tanishka', label: 'Tanishka', initials: 'TA', color: '#fbbf24' },
  { key: 'bhargavi', label: 'Bhargavi', initials: 'BH', color: '#f472b6' },
]

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

const STATS = [
  { value: '1,234', label: 'Total Generations', icon: '◈', color: '#4f8eff' },
  { value: '98%',   label: 'Satisfaction Rate',  icon: '◉', color: '#10d9a0' },
  { value: '2min',   label: 'Avg. Gen Time',      icon: '◷', color: '#a78bfa' },
  { value: '10+',   label: 'Languages',           icon: '◎', color: '#fbbf24' },
  { value: '3 HD',  label: 'Output Formats',      icon: '▣', color: '#f87171' },
]

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export default function FeaturesPage({ addToast, selectedBackground }) {
  const navigate = useNavigate()

  const [message,          setMessage]          = useState('')
  const [language,         setLanguage]         = useState('English')
  const [speaker,          setSpeaker]          = useState('shreeja')
  const [isLoading,        setIsLoading]        = useState(false)
  const [videoUrl,         setVideoUrl]         = useState(null)
  const [isPlaying,        setIsPlaying]        = useState(false)
  const [image,            setImage]            = useState(null)
  const [imagePreview,     setImagePreview]     = useState(null)
  const [genProgress,      setGenProgress]      = useState(0)
  const [dragOver,         setDragOver]         = useState(false)
  const [showCamera,       setShowCamera]       = useState(false)
  const [removingBg,       setRemovingBg]       = useState(false)
  const [bgRemovedPreview, setBgRemovedPreview] = useState(null)
  const [bgRemoved,        setBgRemoved]        = useState(false)

  const videoRef     = useRef(null)
  const fileInputRef = useRef(null)

  function getBgStyle() {
    if (!selectedBackground) return {}
    const { type, image: bgImage, color, opacity = 100 } = selectedBackground
    const base = { opacity: opacity / 100 }
    if (type === 'color' && color) return { ...base, background: color }
    if ((type === 'preset' || type === 'upload') && bgImage)
      return { ...base, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    if (type === 'preset' && color) return { ...base, background: color }
    return {}
  }

  const hasBg = !!selectedBackground

  async function removeBackground(file) {
    const apiKey = import.meta.env.VITE_REMOVEBG_API_KEY
    if (!apiKey) {
      addToast('VITE_REMOVEBG_API_KEY not set in frontend/.env', 'error')
      return null
    }
    const formData = new FormData()
    formData.append('image_file', file)
    formData.append('size', 'auto')

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.errors?.[0]?.title || `Remove.bg error ${res.status}`)
    }

    const blob = await res.blob()
    return new File([blob], 'portrait_nobg.png', { type: 'image/png' })
  }

  const handleFile = async (file) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      addToast('Please upload a JPG, PNG, or WebP image.', 'error'); return
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Image must be under 10 MB.', 'error'); return
    }

    setImage(file)
    setBgRemovedPreview(null)
    setBgRemoved(false)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveBg = async () => {
    if (!image) return
    setRemovingBg(true)
    try {
      const cleanFile = await removeBackground(image)
      if (cleanFile) {
        const cleanUrl = URL.createObjectURL(cleanFile)
        setBgRemovedPreview(cleanUrl)
        setImage(cleanFile)
        setBgRemoved(true)
        addToast('Background removed! ✨', 'success')
      }
    } catch (err) {
      addToast(`BG removal failed: ${err.message}`, 'error')
    } finally {
      setRemovingBg(false)
    }
  }

  async function compositeWithBackground(portraitUrl, backgroundObj) {
    return new Promise((resolve, reject) => {
      const canvas  = document.createElement('canvas')
      const ctx     = canvas.getContext('2d')
      const bgImg   = new Image()
      const faceImg = new Image()

      bgImg.crossOrigin   = 'anonymous'
      faceImg.crossOrigin = 'anonymous'

      bgImg.onerror = () => reject(new Error('Failed to load background image'))

      bgImg.onload = () => {
        // Use background's natural size as canvas size
        canvas.width  = bgImg.naturalWidth  || bgImg.width
        canvas.height = bgImg.naturalHeight || bgImg.height

        // Draw background
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

        faceImg.onload = () => {
          // Scale face to fit height, keep aspect ratio, anchor to bottom-center
          const scale      = canvas.height / faceImg.naturalHeight
          const faceW      = faceImg.naturalWidth  * scale
          const faceH      = faceImg.naturalHeight * scale
          const faceX      = (canvas.width - faceW) / 2
          const faceY      = canvas.height - faceH

          ctx.drawImage(faceImg, faceX, faceY, faceW, faceH)

          // Use PNG for lossless quality
          canvas.toBlob(resolve, 'image/png')
        }
        faceImg.onerror = () => reject(new Error('Failed to load portrait image'))
        faceImg.src = portraitUrl
      }

      // Handle color backgrounds
      if (backgroundObj.type === 'color') {
        canvas.width  = 1280
        canvas.height = 720
        ctx.fillStyle = backgroundObj.color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const faceImg2 = new Image()
        faceImg2.crossOrigin = 'anonymous'
        faceImg2.onload = () => {
          const scale = canvas.height / faceImg2.naturalHeight
          const faceW = faceImg2.naturalWidth  * scale
          const faceH = faceImg2.naturalHeight * scale
          const faceX = (canvas.width - faceW) / 2
          const faceY = canvas.height - faceH
          ctx.drawImage(faceImg2, faceX, faceY, faceW, faceH)
          canvas.toBlob(resolve, 'image/png')
        }
        faceImg2.src = portraitUrl
        return
      }

      bgImg.src = backgroundObj.image
    })
  }

  const handleGenerate = async () => {
    if (!image)          { addToast('Please upload a portrait photo.', 'warning'); return }
    if (!message.trim()) { addToast('Please enter your message.',       'warning'); return }

    setIsLoading(true)
    setGenProgress(0)
    setVideoUrl(null)
    let interval

    try {
      interval = setInterval(() => {
        setGenProgress(prev => prev >= 90 ? prev : prev + Math.random() * 2)
      }, 1000)

      // ✅ Composite only if bg was removed AND a background is selected
      let photoToSend = image
      if (selectedBackground && bgRemovedPreview && bgRemoved) {
        addToast('Compositing background…', 'info')
        const composited = await compositeWithBackground(bgRemovedPreview, selectedBackground)
        photoToSend = new File([composited], 'portrait_with_bg.png', { type: 'image/png' })
      }

      const data = await generateAvatar(
        photoToSend,
        message,
        (pct) => setGenProgress(Math.round(pct * 20)),
        LANGUAGE_MAP[language] || 'en',
        speaker
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
    a.href = videoUrl; a.download = 'avatar.mp4'; a.click()
  }

  const displayPreview = bgRemovedPreview || imagePreview
  const activeSpeaker  = SPEAKERS.find(s => s.key === speaker)

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin360 { to{transform:rotate(360deg)} }
        @keyframes statPop { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        .stat-card:hover     { border-color:rgba(79,142,255,0.3)!important; transform:translateY(-3px)!important; }
        .speaker-card:hover  { border-color:rgba(79,142,255,0.4)!important; background:rgba(79,142,255,0.06)!important; }
        .gen-btn:hover:not(:disabled) { box-shadow:0 6px 32px rgba(79,142,255,0.5)!important; transform:translateY(-1px)!important; }
        .drop-zone:hover     { border-color:rgba(79,142,255,0.7)!important; background:rgba(79,142,255,0.08)!important; }
        .photo-opt:hover     { border-color:rgba(79,142,255,0.5)!important; color:#a0c0ff!important; background:rgba(79,142,255,0.1)!important; }
        textarea:focus       { border-color:rgba(79,142,255,0.5)!important; outline:none; box-shadow:0 0 0 3px rgba(79,142,255,0.08)!important; }
        select:focus         { outline:none; border-color:rgba(79,142,255,0.5)!important; }
      `}</style>

      {showCamera && (
        <CameraCapture
          onCapture={(file) => { handleFile(file); setShowCamera(false); addToast('Photo captured!', 'success') }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Stats */}
      <div style={s.statsRow}>
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card" style={{ ...s.statCard, animationDelay:`${i*0.07}s` }}>
            <div style={{ ...s.statIcon, color:stat.color, textShadow:`0 0 12px ${stat.color}` }}>{stat.icon}</div>
            <div>
              <p style={{ ...s.statValue, color:stat.color }}>{stat.value}</p>
              <p style={s.statLabel}>{stat.label}</p>
            </div>
            <div style={{ ...s.statLine, background:stat.color }} />
          </div>
        ))}
      </div>

      <div style={s.mainGrid}>

        {/* Left: Video */}
        <div style={s.playerSection}>
          {hasBg && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background:'rgba(201,240,62,0.06)', border:'0.5px solid rgba(201,240,62,0.2)', borderRadius:10, fontSize:11, color:'#c9f03e', fontWeight:600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9f03e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Background applied: <span style={{ color:'#ede8d8', fontWeight:400 }}>{selectedBackground.label}</span>
            </div>
          )}

          <div style={s.videoBox}>
            {hasBg && <div style={{ position:'absolute', inset:0, zIndex:0, borderRadius:20, ...getBgStyle() }} />}

            {videoUrl ? (
              <>
                <video ref={videoRef} src={videoUrl} style={{ ...s.video, position:'relative', zIndex:1 }} onEnded={() => setIsPlaying(false)} playsInline autoPlay />
                {!isPlaying && (
                  <button style={{ ...s.playOverlay, zIndex:2 }} onClick={togglePlay}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="17" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.2)"/>
                      <path d="M15 11l11 7-11 7V11z" fill="white"/>
                    </svg>
                  </button>
                )}
              </>
            ) : isLoading ? (
              <div style={{ ...s.loadingBox, position:'relative', zIndex:1 }}>
                <div style={s.loaderRing} />
                <p style={s.loadingText}>Building your avatar video…</p>
                <div style={s.progressTrack}><div style={{ ...s.progressFill, width:`${genProgress}%` }} /></div>
                <p style={s.progressPct}>{Math.round(genProgress)}%</p>
              </div>
            ) : removingBg ? (
              <div style={{ ...s.loadingBox, position:'relative', zIndex:1 }}>
                <div style={s.loaderRing} />
                <p style={s.loadingText}>Removing background…</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>Powered by Remove.bg ✨</p>
              </div>
            ) : displayPreview ? (
              <img
                src={displayPreview}
                alt="Portrait preview"
                style={{
                  width:'100%', height:'100%',
                  objectFit:'contain', objectPosition:'center bottom',
                  position:'relative', zIndex:1,
                  background: bgRemovedPreview && !hasBg
                    ? 'repeating-conic-gradient(#1a1a2e 0% 25%, #0d0d1a 0% 50%) 0 0 / 20px 20px'
                    : 'transparent',
                }}
              />
            ) : (
              <div style={{ ...s.emptyPlayer, position:'relative', zIndex:1 }}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <rect x="4" y="4" width="48" height="48" rx="12" stroke="rgba(79,142,255,0.3)" strokeWidth="1.5" strokeDasharray="5 3"/>
                  <path d="M22 18l18 10-18 10V18z" fill="rgba(79,142,255,0.35)"/>
                </svg>
                <p style={s.emptyVideoLabel}>Video Player</p>
                <p style={s.emptyVideoHint}>Generate a video to preview it here</p>
                {!hasBg && <div style={s.gridLines} />}
              </div>
            )}
          </div>

          <div style={s.playbackRow}>
            <button style={s.pbBtn} onClick={togglePlay}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {isPlaying ? <><rect x="3" y="2" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="11" y="2" width="4" height="14" rx="1.5" fill="currentColor"/></> : <path d="M4 2l12 7-12 7V2z" fill="currentColor"/>}
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
                <circle cx="4" cy="9" r="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6 8l6-3M6 10l6 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={s.controlsCard}>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Portrait Photo</label>

            {displayPreview ? (
              <div style={s.photoPreview}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <img src={displayPreview} alt="Portrait" style={{
                    ...s.photoImg,
                    background: bgRemovedPreview
                      ? 'repeating-conic-gradient(#1a1a2e 0% 25%, #0d0d1a 0% 50%) 0 0 / 10px 10px'
                      : 'transparent'
                  }} />
                  {removingBg && (
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin360 0.7s linear infinite' }} />
                    </div>
                  )}
                  {bgRemovedPreview && !removingBg && (
                    <div style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#10d9a0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>✓</div>
                  )}
                </div>
                <div style={s.photoMeta}>
                  <span style={{ fontSize:11, color: bgRemoved ? '#10d9a0' : '#fbbf24', fontWeight:600 }}>
                    {bgRemoved ? '✓ Background removed!' : '✓ Photo ready'}
                  </span>
                  <span style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{image?.name}</span>
                  <div style={{ display:'flex', gap:6, marginTop:6 }}>
                    <button onClick={() => fileInputRef.current?.click()} style={s.miniBtn}>Upload</button>
                    <button onClick={() => setShowCamera(true)} style={{ ...s.miniBtn, borderColor:'rgba(79,142,255,0.4)', color:'#7aadff' }}>Retake</button>
                    {!bgRemoved && (
                      <button
                        onClick={handleRemoveBg}
                        disabled={removingBg}
                        style={{ ...s.miniBtn, borderColor:'rgba(167,139,250,0.4)', color:'#a78bfa', opacity: removingBg ? 0.6 : 1 }}
                      >
                        {removingBg ? '⏳ Removing…' : '✨ Remove BG'}
                      </button>
                    )}
                    {bgRemoved && (
                      <span style={{ ...s.miniBtn, borderColor:'rgba(16,217,160,0.4)', color:'#10d9a0', cursor:'default' }}>✓ BG Removed</span>
                    )}
                    <button onClick={() => { setImage(null); setImagePreview(null); setBgRemovedPreview(null); setBgRemoved(false) }} style={{ ...s.miniBtn, borderColor:'rgba(248,113,113,0.3)', color:'#f87171' }}>Remove</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="photo-opt" style={s.photoOptBtn} onClick={() => fileInputRef.current?.click()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Upload photo
                  </button>
                  <button className="photo-opt" style={{ ...s.photoOptBtn, borderColor:'rgba(79,142,255,0.4)', color:'#7aadff', background:'rgba(79,142,255,0.07)' }} onClick={() => setShowCamera(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Take photo
                  </button>
                </div>
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
              </>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {/* Background banner — appears after photo upload */}
          {displayPreview && (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 14px',
              background: selectedBackground ? 'rgba(201,240,62,0.06)' : 'rgba(79,142,255,0.06)',
              border: `0.5px solid ${selectedBackground ? 'rgba(201,240,62,0.25)' : 'rgba(79,142,255,0.2)'}`,
              borderRadius:10, gap:10,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>🎨</span>
                <div>
                  <p style={{ fontSize:11, fontWeight:600, color: selectedBackground ? '#c9f03e' : '#7aadff', margin:0 }}>
                    {selectedBackground ? `Background: ${selectedBackground.label}` : 'No background selected'}
                  </p>
                  <p style={{ fontSize:10, color:'var(--text-muted)', margin:0, marginTop:2 }}>
                    {selectedBackground ? 'Looking good! You can change it anytime.' : 'Want to add a scene behind your avatar?'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/background')}
                style={{
                  padding:'6px 12px', flexShrink:0,
                  background: selectedBackground ? 'rgba(201,240,62,0.1)' : 'rgba(79,142,255,0.1)',
                  border: `1px solid ${selectedBackground ? 'rgba(201,240,62,0.3)' : 'rgba(79,142,255,0.3)'}`,
                  borderRadius:8, cursor:'pointer',
                  fontSize:11, fontWeight:700,
                  color: selectedBackground ? '#c9f03e' : '#7aadff',
                  fontFamily:'var(--font-display)', letterSpacing:'0.04em', transition:'all 0.18s',
                }}
              >
                {selectedBackground ? 'Change' : 'Choose Background'}
              </button>
            </div>
          )}

          {/* Message */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Your Message</label>
            <div style={s.textareaWrap}>
              <textarea style={s.textarea} rows={5} placeholder="Type the speech content for your avatar…" value={message} onChange={e => setMessage(e.target.value.slice(0, 500))} />
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

          {/* Speaker */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Speaker Voice</label>
            <div style={s.speakerGrid}>
              {SPEAKERS.map(sp => (
                <button
                  key={sp.key}
                  className="speaker-card"
                  onClick={() => setSpeaker(sp.key)}
                  style={{
                    ...s.speakerCard,
                    ...(speaker === sp.key ? {
                      borderColor: sp.color,
                      background: `${sp.color}18`,
                      boxShadow: `0 0 12px ${sp.color}30`,
                    } : {})
                  }}
                >
                  <div style={{ ...s.speakerAvatar, background:`${sp.color}22`, color:sp.color }}>
                    {sp.initials}
                  </div>
                  <span style={{ ...s.speakerName, color: speaker === sp.key ? sp.color : 'var(--text-muted)' }}>
                    {sp.label}
                  </span>
                </button>
              ))}
            </div>
            {activeSpeaker && (
              <p style={s.speakerHint}>
                Speaking as <span style={{ color: activeSpeaker.color, fontWeight: 700 }}>{activeSpeaker.label}</span>

              </p>
            )}
          </div>

          {/* Generate */}
          <button
            className="gen-btn"
            style={{ ...s.generateBtn, opacity:(isLoading || removingBg) ? 0.7 : 1, cursor:(isLoading || removingBg) ? 'not-allowed' : 'pointer' }}
            onClick={handleGenerate}
            disabled={isLoading || removingBg}
          >
            {isLoading ? (
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin360 0.7s linear infinite', display:'inline-block' }} />
                Generating Avatar Video…
              </span>
            ) : removingBg ? (
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin360 0.7s linear infinite', display:'inline-block' }} />
                Removing Background…
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
  page:           { maxWidth:1200, margin:'0 auto', padding:'40px 28px 60px', display:'flex', flexDirection:'column', gap:28, animation:'fadeUp 0.5s ease both' },
  statsRow:       { display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:14 },
  statCard:       { position:'relative', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'16px 18px', display:'flex', alignItems:'center', gap:12, backdropFilter:'blur(12px)', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', transition:'transform 0.2s, border-color 0.2s', animation:'statPop 0.4s ease both', overflow:'hidden' },
  statIcon:       { fontSize:22, flexShrink:0 },
  statValue:      { fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1 },
  statLabel:      { fontSize:10, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.05em', marginTop:3, textTransform:'uppercase' },
  statLine:       { position:'absolute', bottom:0, left:0, right:0, height:2, opacity:0.5, borderRadius:'0 0 16px 16px' },
  mainGrid:       { display:'grid', gridTemplateColumns:'1fr 420px', gap:24, alignItems:'start' },
  playerSection:  { display:'flex', flexDirection:'column', gap:14 },
  videoBox:       { position:'relative', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, aspectRatio:'16/9', overflow:'hidden', backdropFilter:'blur(16px)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' },
  video:          { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  playOverlay:    { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)', border:'none', cursor:'pointer' },
  emptyPlayer:    { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, width:'100%', height:'100%', position:'relative' },
  emptyVideoLabel:{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'rgba(240,244,255,0.15)', letterSpacing:'0.03em' },
  emptyVideoHint: { fontSize:12, color:'var(--text-muted)' },
  gridLines:      { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(79,142,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,255,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', borderRadius:20 },
  loadingBox:     { display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  loaderRing:     { width:50, height:50, borderRadius:'50%', border:'3px solid rgba(79,142,255,0.2)', borderTopColor:'#4f8eff', animation:'spin360 0.8s linear infinite' },
  loadingText:    { fontSize:13, fontWeight:600, color:'var(--text-secondary)', fontFamily:'var(--font-display)', letterSpacing:'0.05em' },
  progressTrack:  { width:200, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' },
  progressFill:   { height:'100%', background:'linear-gradient(90deg,#4f8eff,#a78bfa)', borderRadius:2, transition:'width 0.4s ease' },
  progressPct:    { fontSize:11, fontWeight:700, color:'var(--accent)', fontFamily:'monospace' },
  playbackRow:    { display:'flex', gap:10 },
  pbBtn:          { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, color:'var(--text-secondary)', fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, letterSpacing:'0.05em', cursor:'pointer', backdropFilter:'blur(12px)', transition:'all 0.2s' },
  controlsCard:   { background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'24px', backdropFilter:'blur(16px)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', gap:18 },
  fieldGroup:     { display:'flex', flexDirection:'column', gap:8 },
  fieldLabel:     { fontFamily:'var(--font-display)', fontSize:11, fontWeight:800, letterSpacing:'0.1em', color:'var(--text-muted)', textTransform:'uppercase' },
  photoOptBtn:    { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'var(--text-muted)', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:'0.04em', transition:'all 0.18s' },
  dropzone:       { display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'14px', border:'2px dashed rgba(79,142,255,0.3)', borderRadius:12, cursor:'pointer', background:'rgba(79,142,255,0.03)', transition:'all 0.2s', textAlign:'center' },
  photoPreview:   { display:'flex', gap:12, alignItems:'center', padding:'10px', background:'rgba(79,142,255,0.04)', border:'1px solid rgba(79,142,255,0.12)', borderRadius:12 },
  photoImg:       { width:56, height:70, objectFit:'cover', objectPosition:'center top', borderRadius:8, border:'1px solid rgba(79,142,255,0.2)', flexShrink:0 },
  photoMeta:      { display:'flex', flexDirection:'column' },
  miniBtn:        { padding:'4px 10px', background:'rgba(79,142,255,0.1)', border:'1px solid rgba(79,142,255,0.3)', borderRadius:6, color:'#7aadff', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', transition:'all 0.18s' },
  textareaWrap:   { position:'relative' },
  textarea:       { width:'100%', boxSizing:'border-box', background:'rgba(6,9,26,0.6)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px', color:'var(--text-primary)', fontSize:13, lineHeight:1.65, fontFamily:'var(--font-body)', resize:'vertical', transition:'border-color 0.2s, box-shadow 0.2s', display:'block' },
  charCount:      { position:'absolute', bottom:10, right:12, fontSize:10, color:'var(--text-muted)', fontWeight:500, pointerEvents:'none' },
  selectWrap:     { position:'relative' },
  select:         { width:'100%', boxSizing:'border-box', background:'rgba(6,9,26,0.7)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 36px 10px 14px', color:'var(--text-secondary)', fontSize:13, fontFamily:'var(--font-body)', cursor:'pointer', appearance:'none', transition:'border-color 0.2s' },
  selectArrow:    { position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' },
  speakerGrid:    { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 },
  speakerCard:    { display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'10px 6px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, cursor:'pointer', transition:'all 0.18s' },
  speakerAvatar:  { width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.04em' },
  speakerName:    { fontSize:11, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.03em', transition:'color 0.18s' },
  speakerHint:    { fontSize:11, color:'var(--text-muted)', margin:0, paddingTop:2 },
  generateBtn:    { display:'flex', alignItems:'center', justifyContent:'center', gap:9, width:'100%', padding:'14px', background:'linear-gradient(135deg,#4f8eff,#a78bfa)', border:'none', borderRadius:12, color:'#fff', fontFamily:'var(--font-display)', fontSize:14, fontWeight:800, letterSpacing:'0.03em', boxShadow:'0 4px 20px rgba(79,142,255,0.3)', transition:'all 0.2s ease' },
}