import { useState, useRef, useEffect, useCallback } from 'react'
import { askAvatar } from '../api'

/* ─── Constants ─────────────────────────────────────────── */
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
]

const SPEAKERS = ['shreeja', 'osin', 'soham', 'kshitij', 'tanishka', 'bhargavi']
const STORAGE_KEY = 'vaktar_chat_history'

const LOADING_STEPS = [
  { icon: '🧠', text: 'Thinking…' },
  { icon: '🔊', text: 'Generating voice…' },
  { icon: '🎭', text: 'Animating avatar…' },
  { icon: '🎬', text: 'Rendering video…' },
]

/* ─── Helpers ────────────────────────────────────────────── */
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.filter(h => !h.loading)))
  } catch {}
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ─── LoadingBubble ──────────────────────────────────────── */
function LoadingBubble({ step }) {
  return (
    <div style={s.loadingBubble}>
      <div style={s.loadingSteps}>
        {LOADING_STEPS.map((ls, i) => (
          <div key={i} style={{
            ...s.loadingStep,
            ...(i === step ? s.loadingStepActive : {}),
            ...(i < step ? s.loadingStepDone : {}),
          }}>
            <span style={s.loadingStepIcon}>{i < step ? '✓' : ls.icon}</span>
            <span style={s.loadingStepText}>{ls.text}</span>
            {i === step && (
              <div style={s.loadingPulse}>
                {[0,1,2].map(d => (
                  <div key={d} style={{ ...s.pulseDot, animationDelay: `${d * 0.18}s` }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={s.loadingBar}>
        <div style={{ ...s.loadingBarFill, width: `${(step / (LOADING_STEPS.length - 1)) * 100}%` }} />
      </div>
    </div>
  )
}

/* ─── ChatEntry ──────────────────────────────────────────── */
function ChatEntry({ entry, photoPreview, idx }) {
  const [videoError, setVideoError] = useState(false)
  return (
    <div style={{ ...s.chatEntry, animationDelay: `${Math.min(idx,5)*0.06}s` }} className="animate-fade-in">
      {/* Question */}
      <div style={s.questionRow}>
        <span style={s.questionTime}>{formatTime(entry.timestamp)}</span>
        <div style={s.questionBubble}>
          <p style={s.questionText}>{entry.question}</p>
        </div>
        <div style={s.userAvatar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="var(--text-secondary)"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      {/* Response */}
      <div style={s.responseRow}>
        <div style={s.avatarBadge}>
          {photoPreview
            ? <img src={photoPreview} alt="avatar" style={s.avatarBadgeImg}/>
            : <span style={s.avatarBadgeFallback}>AI</span>
          }
          <div style={s.avatarOnlineDot}/>
        </div>
        <div style={s.responseBubble}>
          {entry.loading ? (
            <LoadingBubble step={entry.loadingStep || 0}/>
          ) : entry.error ? (
            <div style={s.errorWrap}>
              <span>⚠</span>
              <span style={s.errorText}>{entry.error}</span>
            </div>
          ) : (
            <div style={s.responseContent}>
              {entry.answer && <p style={s.answerText}>{entry.answer}</p>}
              {entry.videoUrl && !videoError ? (
                <div style={s.videoCard}>
                  <div style={s.videoHeader}>
                    <div style={s.videoHeaderDot}/>
                    <span style={s.videoHeaderText}>AVATAR RESPONSE</span>
                  </div>
                  <video src={entry.videoUrl} controls autoPlay style={s.video} onError={() => setVideoError(true)}/>
                </div>
              ) : entry.videoUrl && videoError ? (
                <div style={s.noVideoNote}>Video failed to load — check SadTalker service</div>
              ) : entry.answer && (
                <div style={s.noVideoNote}>⚡ Text only — SadTalker not running</div>
              )}
              <div style={s.responseMeta}>
                <span style={s.responseTime}>{formatTime(entry.timestamp)}</span>
                {entry.source && (
                  <div style={s.sourcePill}>
                    <div style={{
                      ...s.sourceDot,
                      background: ['groq','gemini'].includes(entry.source) ? 'var(--success)' : 'var(--warning)'
                    }}/>
                    <span style={s.sourceLabel}>{entry.source}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────── */
export default function ChatPage({ addToast }) {
  const [photo, setPhoto]               = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [question, setQuestion]         = useState('')
  const [language, setLanguage]         = useState('en')
  const [speaker, setSpeaker]           = useState('shreeja')
  const [loading, setLoading]           = useState(false)
  const [history, setHistory]           = useState(loadHistory)

  const fileInputRef  = useRef(null)
  const historyEndRef = useRef(null)
  const textareaRef   = useRef(null)
  const stepTimerRef  = useRef(null)

  useEffect(() => { saveHistory(history) }, [history])
  useEffect(() => { historyEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history])
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }, [question])

  function startLoadingAnimation() {
    let step = 0
    setHistory(prev => prev.map((h,i) => i === prev.length-1 ? {...h, loadingStep: 0} : h))
    stepTimerRef.current = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1)
      setHistory(prev => prev.map((h,i) => i === prev.length-1 ? {...h, loadingStep: step} : h))
    }, 4000)
  }

  function stopLoadingAnimation() {
    if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { addToast('Please upload an image file', 'error'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleAsk = useCallback(async () => {
    if (!photo) { addToast('Upload an avatar photo first', 'error'); return }
    if (!question.trim()) { addToast('Type a question first', 'error'); return }
    if (loading) return

    const q = question.trim()
    setQuestion('')
    setLoading(true)

    setHistory(prev => [...prev, { question: q, answer: null, videoUrl: null, source: null, timestamp: Date.now(), loading: true, loadingStep: 0 }])
    startLoadingAnimation()

    try {
      const res = await askAvatar(photo, q, language, speaker)
      stopLoadingAnimation()
      setHistory(prev => prev.map((h,i) => i === prev.length-1
        ? { ...h, answer: res.answer, videoUrl: res.video_url, source: res.llm_source, loading: false, loadingStep: undefined }
        : h
      ))
    } catch (err) {
      stopLoadingAnimation()
      setHistory(prev => prev.map((h,i) => i === prev.length-1
        ? { ...h, error: err.message, loading: false, loadingStep: undefined }
        : h
      ))
      addToast(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }, [photo, question, language, speaker, loading])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() }
  }

  function clearHistory() {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
    addToast('Chat history cleared', 'info')
  }

  return (
    <div style={s.page}>
      <style>{inlineCSS}</style>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarInner}>
          <div style={s.sidebarHeader}>
            <div style={s.sidebarGlow}/>
            <div style={s.sidebarTitle}>
              <div style={s.brainIcon}>🧠</div>
              <div>
                <div style={s.sidebarTitleText}>AI Avatar Chat</div>
                <div style={s.sidebarTitleSub}>Real-time video responses</div>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div style={s.section}>
            <label style={s.label}><span style={s.labelDot}/>Avatar Photo</label>
            <div
              style={{ ...s.dropzone, ...(photoPreview ? s.dropzoneActive : {}) }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              {photoPreview ? (
                <div style={s.photoWrap}>
                  <img src={photoPreview} alt="avatar" style={s.photoImg}/>
                  <div style={s.photoOverlay}><span style={s.photoOverlayText}>↑ Change</span></div>
                </div>
              ) : (
                <div style={s.dropzonePlaceholder}>
                  <div style={s.uploadRing}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15V4M12 4L8 8M12 4L16 8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 17v1.75C4 19.99 4.9 21 6 21h12c1.1 0 2-1.01 2-2.25V17" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span style={s.dropzoneLabel}>Drop or click to upload</span>
                  <span style={s.dropzoneHint}>JPG · PNG · WEBP</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoChange}/>
          </div>

          {/* Language */}
          <div style={s.section}>
            <label style={s.label}><span style={s.labelDot}/>Language</label>
            <select style={s.select} value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          {/* Speaker */}
          <div style={s.section}>
            <label style={s.label}><span style={s.labelDot}/>Voice</label>
            <div style={s.speakerGrid}>
              {SPEAKERS.map(sp => (
                <button key={sp}
                  style={{ ...s.speakerBtn, ...(speaker===sp ? s.speakerBtnOn : {}) }}
                  onClick={() => setSpeaker(sp)}
                >
                  {speaker===sp && <span>✓ </span>}{sp}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div style={{ ...s.statusCard, ...(photo ? s.statusCardReady : {}) }}>
            <div style={{ ...s.statusDot, background: photo ? 'var(--success)' : 'var(--text-muted)' }}/>
            <span style={s.statusText}>{photo ? 'Ready to chat' : 'Upload a photo to begin'}</span>
          </div>

          {/* Clear */}
          {history.length > 0 && (
            <button style={s.clearBtn} onClick={clearHistory}>
              🗑 Clear History ({history.filter(h=>!h.loading).length})
            </button>
          )}
        </div>
      </aside>

      {/* ── Chat ── */}
      <main style={s.chatPanel}>
        <div style={s.chatScroll}>
          {history.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyOrb}>
                <div style={s.emptyOrbInner}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="var(--accent)" strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="19" cy="6" r="2" fill="var(--accent)" opacity="0.6"/>
                    <path d="M19 4v1M19 8v1M17 6h-1M21 6h1" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={s.emptyOrbRing}/>
              </div>
              <h2 style={s.emptyTitle}>Your avatar awaits</h2>
              <p style={s.emptySub}>Upload a photo, ask a question, and watch your avatar come to life with a video response.</p>
              <div style={s.emptyTips}>
                {['Upload your avatar photo','Pick a language + voice','Ask anything — press Enter'].map((tip,i) => (
                  <div key={i} style={s.emptyTip}>
                    <span style={s.emptyTipNum}>{i+1}</span>
                    <span style={s.emptyTipText}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : history.map((entry, idx) => (
            <ChatEntry key={entry.timestamp} entry={entry} photoPreview={photoPreview} idx={idx}/>
          ))}
          <div ref={historyEndRef}/>
        </div>

        {/* Input */}
        <div style={s.inputBar}>
          <div style={s.inputCard}>
            <textarea
              ref={textareaRef}
              style={s.textarea}
              placeholder={photo ? 'Ask your avatar anything… (Enter to send)' : 'Upload a photo first…'}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading || !photo}
            />
            <button
              style={{ ...s.sendBtn, ...(!loading && question.trim() && photo ? s.sendBtnOn : s.sendBtnOff) }}
              onClick={handleAsk}
              disabled={loading || !question.trim() || !photo}
            >
              {loading
                ? <div style={s.spinner}/>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
              }
            </button>
          </div>
          <p style={s.inputFooter}>Shift+Enter for new line · Responses capped at ~80 words for video generation</p>
        </div>
      </main>
    </div>
  )
}

/* ─── Injected CSS ───────────────────────────────────────── */
const inlineCSS = `
  @keyframes pulseDot {
    0%,100% { transform:scaleY(0.4); opacity:0.5; }
    50%      { transform:scaleY(1);   opacity:1;   }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes orbPulse {
    0%,100% { transform:scale(1);    opacity:0.3; }
    50%      { transform:scale(1.15); opacity:0.6; }
  }
  @keyframes barShimmer {
    0%   { background-position:-200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeSlideIn {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .animate-fade-in { animation: fadeSlideIn 0.4s ease both; }
  select option { background:#111827; color:#f0f4ff; }
  textarea:focus { outline:none; border-color:rgba(79,142,255,0.5)!important; }
  textarea::placeholder { color:#4a5568; }
`

/* ─── Styles ─────────────────────────────────────────────── */
const s = {
  page: { display:'flex', height:'calc(100vh - 64px)', background:'var(--bg-primary)', overflow:'hidden' },

  sidebar: { width:288, flexShrink:0, borderRight:'1px solid var(--border)', overflowY:'auto', background:'var(--bg-secondary)' },
  sidebarInner: { display:'flex', flexDirection:'column', gap:20, paddingBottom:32 },
  sidebarHeader: { padding:'28px 20px 20px', borderBottom:'1px solid var(--border)', position:'relative', overflow:'hidden' },
  sidebarGlow: { position:'absolute', top:-30, left:-30, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(79,142,255,0.12) 0%, transparent 70%)', pointerEvents:'none' },
  sidebarTitle: { display:'flex', alignItems:'center', gap:12, position:'relative' },
  brainIcon: { width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,rgba(79,142,255,0.2),rgba(167,139,250,0.2))', border:'1px solid rgba(79,142,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 },
  sidebarTitleText: { fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text-primary)', lineHeight:1.2 },
  sidebarTitleSub: { fontSize:11, color:'var(--text-muted)', marginTop:2, letterSpacing:'0.02em' },

  section: { padding:'0 20px', display:'flex', flexDirection:'column', gap:8 },
  label: { fontSize:11, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6 },
  labelDot: { width:5, height:5, borderRadius:'50%', background:'var(--accent)', display:'inline-block', flexShrink:0 },

  dropzone: { border:'1.5px dashed rgba(255,255,255,0.1)', borderRadius:14, minHeight:110, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'var(--bg-card)', overflow:'hidden', transition:'border-color 0.2s' },
  dropzoneActive: { border:'1.5px solid var(--accent)', minHeight:150 },
  dropzonePlaceholder: { display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:16 },
  uploadRing: { width:46, height:46, borderRadius:'50%', background:'var(--accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(79,142,255,0.2)' },
  dropzoneLabel: { fontSize:12, color:'var(--text-secondary)', textAlign:'center' },
  dropzoneHint: { fontSize:10, color:'var(--text-muted)', letterSpacing:'0.05em' },
  photoWrap: { position:'relative', width:'100%', height:150 },
  photoImg: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  photoOverlay: { position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.2s' },
  photoOverlayText: { color:'#fff', fontSize:13, fontWeight:600 },

  select: { width:'100%', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-primary)', fontSize:13, padding:'9px 12px', cursor:'pointer', outline:'none' },

  speakerGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 },
  speakerBtn: { padding:'8px 10px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-secondary)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s', textTransform:'capitalize' },
  speakerBtnOn: { border:'1px solid var(--accent)', background:'var(--accent-subtle)', color:'var(--accent)' },

  statusCard: { margin:'0 20px', padding:'10px 14px', borderRadius:10, background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, transition:'border-color 0.3s' },
  statusCardReady: { borderColor:'rgba(16,217,160,0.3)', background:'rgba(16,217,160,0.04)' },
  statusDot: { width:8, height:8, borderRadius:'50%', flexShrink:0, transition:'background 0.3s', boxShadow:'0 0 6px currentColor' },
  statusText: { fontSize:12, color:'var(--text-secondary)' },

  clearBtn: { margin:'0 20px', padding:'9px 14px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:12, cursor:'pointer', textAlign:'left' },

  chatPanel: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  chatScroll: { flex:1, overflowY:'auto', padding:'40px 48px', display:'flex', flexDirection:'column', gap:40 },

  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', paddingTop:60, gap:20, textAlign:'center' },
  emptyOrb: { position:'relative', width:90, height:90, display:'flex', alignItems:'center', justifyContent:'center' },
  emptyOrbInner: { width:70, height:70, borderRadius:'50%', background:'radial-gradient(circle,rgba(79,142,255,0.15) 0%,transparent 70%)', border:'1px solid rgba(79,142,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1 },
  emptyOrbRing: { position:'absolute', inset:0, borderRadius:'50%', border:'1px solid rgba(79,142,255,0.15)', animation:'orbPulse 3s ease-in-out infinite' },
  emptyTitle: { fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 },
  emptySub: { fontSize:14, color:'var(--text-secondary)', maxWidth:340, lineHeight:1.65, margin:0 },
  emptyTips: { display:'flex', flexDirection:'column', gap:10, marginTop:8, width:'100%', maxWidth:300 },
  emptyTip: { display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderRadius:10, background:'var(--bg-card)', border:'1px solid var(--border)' },
  emptyTipNum: { width:22, height:22, borderRadius:'50%', background:'var(--accent-subtle)', border:'1px solid rgba(79,142,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--accent)', flexShrink:0 },
  emptyTipText: { fontSize:13, color:'var(--text-secondary)' },

  chatEntry: { display:'flex', flexDirection:'column', gap:14 },

  questionRow: { display:'flex', alignItems:'flex-end', justifyContent:'flex-end', gap:10 },
  questionTime: { fontSize:10, color:'var(--text-muted)' },
  questionBubble: { background:'linear-gradient(135deg,#3b7eff 0%,#8b5cf6 100%)', borderRadius:'18px 18px 4px 18px', padding:'12px 18px', maxWidth:500, boxShadow:'0 4px 20px rgba(79,142,255,0.25)' },
  questionText: { fontSize:14, color:'#fff', lineHeight:1.55, margin:0 },
  userAvatar: { width:32, height:32, borderRadius:'50%', background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },

  responseRow: { display:'flex', alignItems:'flex-start', gap:14 },
  avatarBadge: { width:36, height:36, borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(79,142,255,0.4)', flexShrink:0, background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' },
  avatarBadgeImg: { width:'100%', height:'100%', objectFit:'cover' },
  avatarBadgeFallback: { fontSize:10, fontWeight:700, color:'var(--accent)' },
  avatarOnlineDot: { position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'var(--success)', border:'2px solid var(--bg-primary)' },
  responseBubble: { flex:1, maxWidth:600, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'4px 18px 18px 18px', padding:'16px 18px', boxShadow:'var(--shadow-sm)' },

  loadingBubble: { display:'flex', flexDirection:'column', gap:14 },
  loadingSteps: { display:'flex', flexDirection:'column', gap:8 },
  loadingStep: { display:'flex', alignItems:'center', gap:10, padding:'6px 10px', borderRadius:8, transition:'all 0.3s', opacity:0.35 },
  loadingStepActive: { opacity:1, background:'rgba(79,142,255,0.07)', border:'1px solid rgba(79,142,255,0.15)' },
  loadingStepDone: { opacity:0.6 },
  loadingStepIcon: { fontSize:16, width:20, textAlign:'center' },
  loadingStepText: { fontSize:13, color:'var(--text-secondary)', flex:1 },
  loadingPulse: { display:'flex', gap:3 },
  pulseDot: { width:5, height:5, borderRadius:'50%', background:'var(--accent)', animation:'pulseDot 0.9s ease-in-out infinite' },
  loadingBar: { height:3, borderRadius:99, background:'var(--bg-elevated)', overflow:'hidden' },
  loadingBarFill: { height:'100%', borderRadius:99, background:'linear-gradient(90deg,var(--accent),var(--accent-2))', backgroundSize:'200% 100%', animation:'barShimmer 1.8s linear infinite', transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' },

  responseContent: { display:'flex', flexDirection:'column', gap:12 },
  answerText: { fontSize:14, color:'var(--text-primary)', lineHeight:1.65, margin:0 },
  videoCard: { borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', background:'#000' },
  videoHeader: { padding:'8px 12px', background:'var(--bg-elevated)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 },
  videoHeaderDot: { width:6, height:6, borderRadius:'50%', background:'var(--success)', boxShadow:'0 0 6px var(--success)' },
  videoHeaderText: { fontSize:10, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.08em' },
  video: { width:'100%', display:'block', maxHeight:320 },
  noVideoNote: { fontSize:11, color:'var(--text-muted)', padding:'7px 10px', background:'var(--bg-elevated)', borderRadius:6, border:'1px solid var(--border)' },
  responseMeta: { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 },
  responseTime: { fontSize:10, color:'var(--text-muted)' },
  sourcePill: { display:'flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:99, background:'var(--bg-elevated)', border:'1px solid var(--border)' },
  sourceDot: { width:5, height:5, borderRadius:'50%', flexShrink:0 },
  sourceLabel: { fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'capitalize' },
  errorWrap: { display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:'var(--error-bg)', border:'1px solid rgba(248,113,113,0.2)', color:'var(--error)', fontSize:14 },
  errorText: { fontSize:13, color:'var(--error)', lineHeight:1.4 },

  inputBar: { padding:'16px 48px 24px', borderTop:'1px solid var(--border)', background:'var(--bg-secondary)', display:'flex', flexDirection:'column', gap:8 },
  inputCard: { display:'flex', gap:10, alignItems:'flex-end', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:16, padding:'8px 8px 8px 16px' },
  textarea: { flex:1, background:'transparent', border:'none', color:'var(--text-primary)', fontSize:14, padding:'6px 0', resize:'none', outline:'none', fontFamily:'var(--font-body)', lineHeight:1.55, minHeight:36, maxHeight:140 },
  sendBtn: { width:40, height:40, borderRadius:10, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' },
  sendBtnOn: { background:'linear-gradient(135deg,#4f8eff,#a78bfa)', boxShadow:'0 4px 14px rgba(79,142,255,0.4)' },
  sendBtnOff: { background:'var(--bg-card)', cursor:'not-allowed', opacity:0.4 },
  spinner: { width:16, height:16, border:'2px solid rgba(255,255,255,0.25)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' },
  inputFooter: { fontSize:11, color:'var(--text-muted)', textAlign:'center' },
}