import { useState, useRef, useCallback } from 'react'
import { generateAvatar } from '../api'

const STYLES      = ['Realistic', 'Anime', 'Cartoon']
const GENDERS     = ['Male', 'Female', 'Custom']
const OUTFITS     = ['Casual', 'Professional', 'Cyber']
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'White', 'Blue']
const ACCEPTED    = ['image/jpeg', 'image/png', 'image/webp']
const LANGUAGES   = [
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'en', label: 'English' },
]

const RECENT = [
  { date: '2024-10-23' },
  { date: '2024-10-17' },
  { date: '2024-10-20' },
  { date: '2024-10-24' },
]

const POINT_COLORS = ['#4f8eff','#a78bfa','#10d9a0','#f59e0b','#ef4444','#06b6d4']

/* ── Slider ── */
function Slider({ label, value, onChange }) {
  return (
    <div style={sl.row}>
      <span style={sl.label}>{label}</span>
      <div style={sl.track}>
        <div style={{ ...sl.fill, width: `${value}%` }} />
        <input
          type="range" min={0} max={100} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={sl.input}
        />
      </div>
      <span style={sl.val}>{value}</span>
    </div>
  )
}

/* ── Chip group ── */
function ChipGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{ ...chip.base, ...(value === o ? chip.active : chip.idle) }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export default function CreatePage({ addToast }) {
  /* ── Photo upload state ── */
  const [image,        setImage]        = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver,     setDragOver]     = useState(false)
  const fileInputRef   = useRef(null)
  const docInputRef    = useRef(null)

  /* ── Avatar config state ── */
  const [style,     setStyle]     = useState('Realistic')
  const [gender,    setGender]    = useState('Male')
  const [hairColor, setHairColor] = useState('Black')
  const [outfit,    setOutfit]    = useState('Casual')
  const [prompt,    setPrompt]    = useState('')
  const [eyes,      setEyes]      = useState(50)
  const [nose,      setNose]      = useState(60)
  const [mouth,     setMouth]     = useState(45)

  /* ── Document state ── */
  const [docFile,       setDocFile]       = useState(null)
  const [emailText,     setEmailText]     = useState('')
  const [isExtracting,  setIsExtracting]  = useState(false)
  const [keyPoints,     setKeyPoints]     = useState([])
  const [keyTopic,      setKeyTopic]      = useState('')
  const [message,       setMessage]       = useState('')
  const [language,      setLanguage]      = useState('hi')

  /* ── Preview / result state ── */
  const [zoom,        setZoom]        = useState(100)
  const [rotation,    setRotation]    = useState(0)
  const [isLoading,   setIsLoading]   = useState(false)
  const [videoUrl,    setVideoUrl]    = useState(null)
  const [recent,      setRecent]      = useState(RECENT)
  const [genProgress, setGenProgress] = useState(0)

  /* ── File handling ── */
  const handleFile = useCallback((file) => {
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
  }, [addToast])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }, [handleFile])

  const clearImage = () => {
    setImage(null); setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── Document extract ── */
  const handleDocFile = (file) => {
    if (!file) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      addToast('Please upload PDF, DOCX or TXT file.', 'error'); return
    }
    setDocFile(file)
    setKeyPoints([])
    setKeyTopic('')
    addToast(`${file.name} selected — click Extract to process.`, 'info')
  }

  const handleExtract = async () => {
    if (!docFile && !emailText.trim()) {
      addToast('Please upload a document or paste email text.', 'warning'); return
    }

    setIsExtracting(true)
    setKeyPoints([])

    try {
      const formData = new FormData()
      if (docFile) formData.append('file', docFile)
      if (emailText.trim()) formData.append('email_text', emailText.trim())

      const res = await fetch('http://localhost:8000/document-to-text', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Extraction failed')
      }

      const data = await res.json()

      setKeyPoints(data.key_points || [])
      setKeyTopic(data.key_topic || '')
      setMessage(data.spoken_text || '')
      addToast(`Extracted: ${data.key_topic}`, 'success')

    } catch (err) {
      addToast(err.message || 'Document extraction failed.', 'error')
    } finally {
      setIsExtracting(false)
    }
  }

  /* ── Generate ── */
  const handleGenerate = async () => {
    if (!image)          { addToast('Please upload a portrait photo first.', 'warning'); return }
    if (!message.trim()) { addToast('Please add a message to speak.', 'warning'); return }

    setIsLoading(true); setGenProgress(0)
    let interval

    try {
      interval = setInterval(() => {
        setGenProgress(p => p >= 90 ? p : p + 1)
      }, 2000)

     const data = await generateAvatar(image, message, () => {}, language)

      clearInterval(interval)
      setGenProgress(100)

      setTimeout(() => {
        setVideoUrl(data.video_url)
        setIsLoading(false)
        setRecent(prev => [{ date: new Date().toISOString().slice(0,10), preview: imagePreview }, ...prev].slice(0,8))
        addToast('Avatar generated!', 'success')
      }, 400)
    } catch (err) {
      clearInterval(interval)
      setIsLoading(false)
      addToast(err?.message || 'Generation failed.', 'error')
    }
  }

  /* ─────────── RENDER ─────────── */
  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin360 { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes extractPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .chip-btn:hover  { border-color:rgba(79,142,255,0.6)!important; color:#c4d4ff!important; }
        .ctrl-btn:hover  { background:rgba(79,142,255,0.12)!important; border-color:rgba(79,142,255,0.4)!important; }
        .gen-btn:hover:not(:disabled) { box-shadow:0 6px 32px rgba(79,142,255,0.5)!important; transform:translateY(-1px)!important; }
        .recent-card:hover { border-color:rgba(79,142,255,0.4)!important; transform:translateY(-3px)!important; }
        .drop-zone:hover { border-color:rgba(79,142,255,0.7)!important; background:rgba(79,142,255,0.1)!important; transform:scale(1.01); }
        .doc-zone:hover { border-color:rgba(167,139,250,0.7)!important; background:rgba(167,139,250,0.08)!important; }
        .upload-preview-wrap:hover .preview-overlay { opacity:1!important; }
        .extract-btn:hover:not(:disabled) { background:rgba(167,139,250,0.25)!important; }
        textarea:focus { border-color:rgba(79,142,255,0.5)!important; outline:none; box-shadow:0 0 0 3px rgba(79,142,255,0.08)!important; }
        input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; width:100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#4f8eff; box-shadow:0 0 8px rgba(79,142,255,0.6); margin-top:-5px; }
        input[type=range]::-webkit-slider-runnable-track { height:4px; background:transparent; }
        select option { background:#111827; }
      `}</style>

      {/* ══════════════════ LEFT PANEL ══════════════════ */}
      <aside style={s.leftPanel}>

        {/* ─── SECTION: Upload Photo ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{marginRight:6}}>
              <circle cx="6" cy="6" r="5" stroke="#4f8eff" strokeWidth="1.2"/>
              <path d="M6 3v4M4 5l2-2 2 2" stroke="#4f8eff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            PORTRAIT PHOTO
          </p>

          {imagePreview ? (
            <div className="upload-preview-wrap" style={s.uploadPreviewWrap}>
              <div style={s.uploadPreviewImg}>
                <img src={imagePreview} alt="Portrait" style={s.previewPhoto} />
                <div className="preview-overlay" style={s.previewOverlay}>
                  <button style={s.previewOverlayBtn} onClick={() => fileInputRef.current?.click()}>Change</button>
                  <button style={{ ...s.previewOverlayBtn, background:'rgba(248,113,113,0.25)', borderColor:'rgba(248,113,113,0.4)' }} onClick={clearImage}>Remove</button>
                </div>
              </div>
              <div style={s.previewMeta}>
                <div style={s.previewCheck}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" fill="rgba(16,217,160,0.2)" stroke="#10d9a0" strokeWidth="1.2"/>
                    <path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="#10d9a0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize:11, color:'#10d9a0', fontWeight:600 }}>Photo ready</span>
                </div>
                <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{image?.name}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)' }}>{image ? (image.size / 1024).toFixed(0) + ' KB' : ''}</p>
              </div>
            </div>
          ) : (
            <div
              className="drop-zone"
              style={{ ...s.dropzone, ...(dragOver ? s.dropzoneActive : {}) }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <div style={s.dropIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#4f8eff" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#4f8eff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={s.dropMain}><strong>Click or drag</strong> to upload</p>
              <p style={s.dropSub}>JPG · PNG · WebP — max 10 MB</p>
              <p style={s.dropHint}>Front-facing portrait gives best results</p>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Style ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>STYLE</p>
          <ChipGroup options={STYLES} value={style} onChange={setStyle} />
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Gender ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>GENDER</p>
          <ChipGroup options={GENDERS} value={gender} onChange={setGender} />
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Traits ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>TRAITS</p>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <div style={s.hairSelect}>
              <span style={s.hairDot(hairColor)} />
              <select value={hairColor} onChange={e => setHairColor(e.target.value)} style={s.select}>
                {HAIR_COLORS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.colorSwatch(hairColor)} title={hairColor} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Slider label="Eyes"  value={eyes}  onChange={setEyes}  />
            <Slider label="Nose"  value={nose}  onChange={setNose}  />
            <Slider label="Mouth" value={mouth} onChange={setMouth} />
          </div>
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Outfits ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>OUTFITS</p>
          <ChipGroup options={OUTFITS} value={outfit} onChange={setOutfit} />
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Prompt ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>PROMPT</p>
          <textarea style={s.textarea} rows={2}
            placeholder="Describe your Avatar…"
            value={prompt} onChange={e => setPrompt(e.target.value)} />
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Document Input ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{marginRight:6}}>
              <rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="#a78bfa" strokeWidth="1.2"/>
              <path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            DOCUMENT INPUT
          </p>
          <p style={{ fontSize:9, color:'var(--text-muted)', marginBottom:8, marginTop:-4 }}>
            Upload PDF/DOCX or paste email — avatar speaks the summary
          </p>

          {/* File upload zone */}
          <div
            className="doc-zone"
            style={s.docZone}
            onClick={() => docInputRef.current?.click()}
            role="button" tabIndex={0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#a78bfa" strokeWidth="1.5"/>
              <path d="M14 2v6h6M12 12v6M9 15l3-3 3 3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p style={{ fontSize:11, color:'#a78bfa', margin:0, fontWeight:600 }}>
                {docFile ? docFile.name : 'Click to upload PDF or DOCX'}
              </p>
              <p style={{ fontSize:9, color:'var(--text-muted)', margin:'2px 0 0' }}>
                {docFile ? `${(docFile.size/1024).toFixed(0)} KB` : 'Any size — 1 to 500+ pages'}
              </p>
            </div>
            {docFile && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{marginLeft:'auto'}}>
                <circle cx="6" cy="6" r="5" fill="rgba(16,217,160,0.2)" stroke="#10d9a0" strokeWidth="1.2"/>
                <path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="#10d9a0" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <input ref={docInputRef} type="file" accept=".pdf,.docx,.txt"
            style={{ display:'none' }} onChange={e => handleDocFile(e.target.files?.[0])} />

          {/* OR divider */}
          <div style={{ display:'flex', alignItems:'center', gap:8, margin:'8px 0' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize:9, color:'var(--text-muted)' }}>OR PASTE EMAIL</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.05)' }} />
          </div>

          {/* Email paste */}
          <textarea style={{ ...s.textarea, marginBottom:8 }} rows={2}
            placeholder="Paste email text here..."
            value={emailText} onChange={e => setEmailText(e.target.value)} />

          {/* Extract button */}
          <button
            className="extract-btn"
            style={{ ...s.extractBtn, opacity: isExtracting ? 0.7 : 1, cursor: isExtracting ? 'not-allowed' : 'pointer' }}
            onClick={handleExtract}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:10, height:10, borderRadius:'50%', border:'1.5px solid rgba(167,139,250,0.3)', borderTopColor:'#a78bfa', animation:'spin360 0.7s linear infinite', display:'inline-block' }} />
                Extracting…
              </span>
            ) : 'EXTRACT + SUMMARIZE'}
          </button>

          {/* Key Points result */}
          {keyPoints.length > 0 && (
            <div style={{ marginTop:10 }}>
              <p style={{ fontSize:9, fontWeight:700, color:'#10d9a0', letterSpacing:'0.08em', marginBottom:6 }}>
                {keyPoints.length} KEY POINTS — {keyTopic}
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {keyPoints.map((pt, i) => (
                  <div key={i} style={{
                    display:'flex', gap:8, alignItems:'flex-start',
                    padding:'6px 8px', borderRadius:8,
                    background: i%2===0 ? 'rgba(6,9,26,0.6)' : 'rgba(17,24,39,0.6)',
                    borderLeft:`2px solid ${POINT_COLORS[i % POINT_COLORS.length]}`,
                  }}>
                    <span style={{ fontSize:10, fontWeight:700, color:POINT_COLORS[i % POINT_COLORS.length], minWidth:14, marginTop:1 }}>{i+1}</span>
                    <p style={{ fontSize:10, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>{pt}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:9, color:'#10d9a0', marginTop:6, fontWeight:500 }}>
                ✓ Message auto-filled below
              </p>
            </div>
          )}
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Message ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>MESSAGE TO SPEAK</p>
          <textarea style={s.textarea} rows={3}
            placeholder="Type message or extract from document above..."
            value={message} onChange={e => setMessage(e.target.value)} />
        </div>

        <div style={s.divider} />

        {/* ─── SECTION: Language ─── */}
        <div style={s.section}>
          <p style={s.sectionLabel}>TARGET LANGUAGE</p>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{ ...s.select, width:'100%', padding:'8px 12px', background:'rgba(6,9,26,0.6)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, fontSize:12 }}
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        {/* ─── GENERATE BUTTON ─── */}
        <button
          className="gen-btn"
          style={{ ...s.genBtn, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin360 0.7s linear infinite', display:'inline-block' }} />
              Generating… {genProgress}%
            </span>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 1l1.9 5.7L17 9l-6.1 2.3L9 17l-1.9-5.7L1 9l6.1-2.3L9 1z" fill="white"/>
              </svg>
              GENERATE AVATAR
            </>
          )}
        </button>

        {!image && (
          <p style={s.uploadHint}>↑ Upload a portrait photo to enable generation</p>
        )}

      </aside>

      {/* ══════════════════ RIGHT PANEL ══════════════════ */}
      <div style={s.rightPanel}>

        {/* Avatar preview */}
        <div style={s.previewBox}>
          {isLoading ? (
            <div style={s.loadingState}>
              <div style={s.loaderOrb} />
              <p style={s.loadingLabel}>Synthesizing avatar…</p>
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width:`${genProgress}%` }} />
              </div>
              <p style={s.progressPct}>{genProgress}%</p>
            </div>
          ) : videoUrl ? (
            <video src={videoUrl} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:16 }} controls autoPlay loop />
          ) : imagePreview ? (
            <div style={s.canvasPreview}>
              <img src={imagePreview} alt="Avatar preview"
                style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', borderRadius:16,
                  filter:`brightness(0.9) contrast(1.05)`,
                  transform:`rotate(${rotation}deg) scale(${zoom/100})`, transition:'transform 0.3s ease' }} />
              <div style={s.canvasBadge}>Portrait loaded · Click Generate</div>
            </div>
          ) : (
            <div style={s.emptyPreview}>
              <div style={s.emptyIconWrap}>
                <svg width="48" height="58" viewBox="0 0 100 120" fill="none" style={{ opacity:0.2 }}>
                  <ellipse cx="50" cy="38" rx="28" ry="32" stroke="#4f8eff" strokeWidth="1.5" />
                  <path d="M10 110c0-22 18-38 40-38s40 16 40 38" stroke="#4f8eff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={s.emptyLabel}>AVATAR PREVIEW</p>
              <p style={s.emptyHint}>Upload a portrait photo and click Generate</p>
              <div style={s.gridOverlay} />
            </div>
          )}
          <div style={s.zoomBadge}>{zoom}%</div>
        </div>

        {/* Control buttons */}
        <div style={s.ctrlRow}>
          {[
            { label:'ROTATE',   icon:'↻', action:() => setRotation(r => (r+90)%360) },
            { label:'ZOOM IN',  icon:'+', action:() => setZoom(z => Math.min(z+10,200)) },
            { label:'ZOOM OUT', icon:'−', action:() => setZoom(z => Math.max(z-10,50)) },
            { label:'RESET',    icon:'⟳', action:() => { setZoom(100); setRotation(0) } },
            { label:'DOWNLOAD', icon:'↓', action:() => {
              if (videoUrl) { const a = document.createElement('a'); a.href = videoUrl; a.download = 'avatar.mp4'; a.click() }
              else if (imagePreview) { const a = document.createElement('a'); a.href = imagePreview; a.download = 'avatar.png'; a.click() }
              else addToast('Nothing to download yet.', 'info')
            }},
          ].map(btn => (
            <button key={btn.label} className="ctrl-btn" style={s.ctrlBtn} onClick={btn.action}>
              <span style={s.ctrlIcon}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Recent Creations */}
        <div style={s.recentSection}>
          <div style={s.recentHeader}>
            <p style={s.recentTitle}>RECENT CREATIONS</p>
            <span style={s.recentCount}>{recent.length} avatars</span>
          </div>
          <div style={s.recentGrid}>
            {recent.map((item, i) => (
              <div key={i} className="recent-card" style={{ ...s.recentCard, animationDelay:`${i*0.06}s` }}>
                <div style={s.recentThumb}>
                  {item.preview
                    ? <img src={item.preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', borderRadius:10 }}/>
                    : <><div style={s.thumbShimmer}/>
                        <svg width="20" height="24" viewBox="0 0 100 120" fill="none" style={{ position:'absolute', opacity:0.2 }}>
                          <ellipse cx="50" cy="38" rx="28" ry="32" stroke="#4f8eff" strokeWidth="2"/>
                          <path d="M10 110c0-22 18-38 40-38s40 16 40 38" stroke="#4f8eff" strokeWidth="2" strokeLinecap="round"/>
                        </svg></>
                  }
                </div>
                <span style={s.recentDate}>{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────── Styles ──────────────────────── */
const s = {
  page: {
    maxWidth: 1200, margin: '0 auto',
    padding: '36px 28px 60px',
    display: 'grid',
    gridTemplateColumns: '310px 1fr',
    gap: 24,
    alignItems: 'start',
    animation: 'fadeUp 0.5s ease both',
  },
  leftPanel: {
    background: 'rgba(17,24,39,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '20px 18px',
    display: 'flex', flexDirection: 'column', gap: 0,
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    position: 'sticky', top: 80,
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    scrollbarWidth: 'none',
  },
  section: { padding: '12px 0' },
  sectionLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10, fontWeight: 800,
    letterSpacing: '0.12em',
    color: 'var(--text-muted)',
    marginBottom: 10,
    display: 'flex', alignItems: 'center',
  },
  divider: { height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -4px' },
  dropzone: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    padding: '22px 14px',
    border: '2px dashed rgba(79,142,255,0.4)',
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(79,142,255,0.06), rgba(167,139,250,0.04))',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
    textAlign: 'center',
  },
  dropzoneActive: { borderColor: 'rgba(79,142,255,0.6)', background: 'rgba(79,142,255,0.08)' },
  dropIconWrap: { width: 48, height: 48, background: 'rgba(79,142,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dropMain: { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' },
  dropSub: { fontSize: 10, color: 'var(--text-muted)' },
  dropHint: { fontSize: 9, color: 'var(--text-muted)', background: 'rgba(79,142,255,0.06)', border: '1px solid rgba(79,142,255,0.15)', borderRadius: 100, padding: '2px 10px', marginTop: 2 },
  uploadPreviewWrap: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px', background: 'rgba(79,142,255,0.04)', border: '1px solid rgba(79,142,255,0.12)', borderRadius: 12 },
  uploadPreviewImg: { position: 'relative', width: 64, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(79,142,255,0.2)' },
  previewPhoto: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' },
  previewOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: 0, transition: 'opacity 0.2s', borderRadius: 10 },
  previewOverlayBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(79,142,255,0.3)', border: '1px solid rgba(79,142,255,0.5)', borderRadius: 6, color: 'white', fontSize: 9, fontWeight: 700, cursor: 'pointer' },
  previewMeta: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  previewCheck: { display: 'flex', alignItems: 'center', gap: 5 },
  docZone: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px',
    border: '1.5px dashed rgba(167,139,250,0.4)',
    borderRadius: 10,
    background: 'rgba(167,139,250,0.05)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    marginBottom: 0,
  },
  extractBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', padding: '9px',
    background: 'rgba(167,139,250,0.15)',
    border: '1px solid rgba(167,139,250,0.4)',
    borderRadius: 10,
    color: '#a78bfa',
    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
    letterSpacing: '0.06em',
    transition: 'background 0.2s',
  },
  hairSelect: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', flex: 1 },
  hairDot: (color) => {
    const map = { Black:'#1a1a2e', Brown:'#8B4513', Blonde:'#F5DEB3', Red:'#c0392b', White:'#f0f0f0', Blue:'#4f8eff' }
    return { width:10, height:10, borderRadius:'50%', background: map[color]||'#888', flexShrink:0, border:'1px solid rgba(255,255,255,0.2)' }
  },
  select: { background:'none', border:'none', color:'var(--text-secondary)', fontSize:12, fontWeight:500, cursor:'pointer', flex:1, fontFamily:'var(--font-body)' },
  colorSwatch: (color) => {
    const map = { Black:'#1a1a2e', Brown:'#8B4513', Blonde:'#F5DEB3', Red:'#c0392b', White:'#f0f0f0', Blue:'#4f8eff' }
    return { width:34, height:34, borderRadius:8, flexShrink:0, background: map[color]||'#888', border:'1px solid rgba(255,255,255,0.12)', boxShadow:`0 0 10px ${map[color]||'#888'}60` }
  },
  textarea: { width:'100%', boxSizing:'border-box', background:'rgba(6,9,26,0.6)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'11px 13px', color:'var(--text-primary)', fontSize:12, lineHeight:1.65, fontFamily:'var(--font-body)', resize:'vertical', transition:'border-color 0.2s, box-shadow 0.2s', display:'block' },
  genBtn: { display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', marginTop:14, padding:'13px', background:'linear-gradient(135deg,#4f8eff,#a78bfa)', border:'none', borderRadius:12, color:'#fff', fontFamily:'var(--font-display)', fontSize:12, fontWeight:800, letterSpacing:'0.06em', boxShadow:'0 4px 20px rgba(79,142,255,0.3)', transition:'all 0.2s ease' },
  uploadHint: { textAlign:'center', fontSize:10, color:'rgba(79,142,255,0.6)', marginTop:6, fontWeight:500, letterSpacing:'0.02em', animation:'pulse 2s ease-in-out infinite' },
  rightPanel: { display:'flex', flexDirection:'column', gap:18 },
  previewBox: { position:'relative', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, minHeight:380, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', backdropFilter:'blur(16px)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' },
  canvasPreview: { width:'100%', height:'100%', minHeight:380, position:'relative' },
  canvasBadge: { position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:6, padding:'5px 14px', background:'rgba(8,13,26,0.85)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:100, backdropFilter:'blur(8px)', fontSize:10, fontWeight:600, color:'#fbbf24', whiteSpace:'nowrap' },
  emptyPreview: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, width:'100%', height:'100%', minHeight:380, position:'relative' },
  emptyIconWrap: { width:72, height:72, background:'rgba(79,142,255,0.05)', border:'1px solid rgba(79,142,255,0.1)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center' },
  emptyLabel: { fontFamily:'var(--font-display)', fontSize:'clamp(18px,2.5vw,28px)', fontWeight:800, letterSpacing:'0.06em', color:'rgba(240,244,255,0.15)' },
  emptyHint: { fontSize:12, color:'var(--text-muted)', letterSpacing:'0.03em' },
  gridOverlay: { position:'absolute', inset:0, borderRadius:20, backgroundImage:'linear-gradient(rgba(79,142,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,255,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' },
  zoomBadge: { position:'absolute', top:14, right:14, background:'rgba(8,13,26,0.8)', border:'1px solid rgba(79,142,255,0.2)', borderRadius:100, padding:'3px 10px', fontSize:11, fontWeight:700, color:'var(--accent)', fontFamily:'monospace', backdropFilter:'blur(8px)' },
  loadingState: { display:'flex', flexDirection:'column', alignItems:'center', gap:14 },
  loaderOrb: { width:56, height:56, borderRadius:'50%', border:'3px solid rgba(79,142,255,0.2)', borderTopColor:'#4f8eff', animation:'spin360 0.8s linear infinite' },
  loadingLabel: { fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--text-secondary)', letterSpacing:'0.05em' },
  progressTrack: { width:200, height:4, background:'var(--bg-elevated)', borderRadius:2, overflow:'hidden' },
  progressFill: { height:'100%', background:'linear-gradient(90deg,#4f8eff,#a78bfa)', borderRadius:2, transition:'width 0.4s ease' },
  progressPct: { fontSize:11, fontWeight:700, color:'var(--accent)', fontFamily:'monospace' },
  ctrlRow: { display:'flex', gap:8, flexWrap:'wrap' },
  ctrlBtn: { flex:'1 1 80px', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 8px', background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:11, color:'var(--text-secondary)', fontFamily:'var(--font-display)', fontSize:10, fontWeight:700, letterSpacing:'0.06em', cursor:'pointer', backdropFilter:'blur(12px)', transition:'background 0.2s,border-color 0.2s,transform 0.15s' },
  ctrlIcon: { fontSize:15, lineHeight:1, color:'var(--accent)' },
  recentSection: { background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'18px 20px', backdropFilter:'blur(16px)' },
  recentHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  recentTitle: { fontFamily:'var(--font-display)', fontSize:10, fontWeight:800, letterSpacing:'0.12em', color:'var(--text-muted)' },
  recentCount: { fontSize:10, fontWeight:500, color:'var(--accent)', background:'var(--accent-subtle)', border:'1px solid rgba(79,142,255,0.2)', borderRadius:100, padding:'2px 10px' },
  recentGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:10 },
  recentCard: { display:'flex', flexDirection:'column', gap:6, cursor:'pointer', transition:'transform 0.2s, border-color 0.2s', animation:'fadeUp 0.4s ease both' },
  recentThumb: { position:'relative', aspectRatio:'1', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  thumbShimmer: { position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(79,142,255,0.05),rgba(167,139,250,0.05))', borderRadius:10 },
  recentDate: { fontSize:10, fontWeight:500, color:'var(--text-muted)', textAlign:'center', fontFamily:'monospace', letterSpacing:'0.02em' },
}

const sl = {
  row: { display:'flex', alignItems:'center', gap:10 },
  label: { fontSize:10, fontWeight:600, color:'var(--text-muted)', width:38, flexShrink:0, letterSpacing:'0.03em' },
  track: { flex:1, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, position:'relative', cursor:'pointer' },
  fill: { height:'100%', background:'linear-gradient(90deg,#4f8eff,#a78bfa)', borderRadius:2, pointerEvents:'none', transition:'width 0.1s' },
  input: { position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer', margin:0 },
  val: { fontSize:10, color:'var(--accent)', fontFamily:'monospace', width:24, textAlign:'right' },
}

const chip = {
  base: { padding:'5px 12px', borderRadius:100, fontSize:10, fontWeight:700, letterSpacing:'0.04em', cursor:'pointer', border:'1px solid', transition:'all 0.18s', fontFamily:'var(--font-display)' },
  active: { background:'rgba(79,142,255,0.15)', borderColor:'rgba(79,142,255,0.5)', color:'#a0c0ff', boxShadow:'0 0 12px rgba(79,142,255,0.2)' },
  idle: { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.08)', color:'var(--text-muted)' },
}