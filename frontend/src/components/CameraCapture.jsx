import { useState, useRef, useEffect, useCallback } from 'react'

// ── The portrait guide zone (% of video dimensions) ──
// Head + shoulders must fit inside this zone
const ZONE = {
  cx: 50,   // center x %
  cy: 48,   // center y % (slightly lower to include shoulders)
  rx: 32,   // horizontal radius % (wider for shoulders)
  ry: 42,   // vertical radius % (taller for head + shoulders)
}

// Head zone — face should be in upper portion
const HEAD_ZONE = {
  cx: 50,
  cy: 30,   // face center should be in upper 40%
  rx: 20,
  ry: 22,
}

// Check if a point (px, py) is inside the oval
const insideOval = (px, py) => {
  const dx = (px - ZONE.cx) / ZONE.rx
  const dy = (py - ZONE.cy) / ZONE.ry
  return dx * dx + dy * dy <= 1
}

// Check if face is in correct position (upper portion of frame)
// and face width suggests shoulders are visible
const faceInsideZone = (box) => {
  // Face center should be in upper-center of frame
  const facePoints = [
    { x: box.cx,          y: box.cy          },
    { x: box.cx - box.rw, y: box.cy          },
    { x: box.cx + box.rw, y: box.cy          },
    { x: box.cx,          y: box.cy - box.rh },
    { x: box.cx,          y: box.cy + box.rh },
  ]

  // All face points must be inside the main zone
  const faceInZone = facePoints.every(p => insideOval(p.x, p.y))

  // Face should be in upper portion (not too low — leaves room for shoulders)
  const faceInUpperArea = box.cy < 52

  // Face should not be too small (too far away — no shoulders visible)
  const notTooFar = box.rw > 14

  // Face should not be too large (too close — cuts off shoulders)
  const notTooClose = box.rw < 28

  // Face center should be horizontally centered
  const centered = box.cx > 35 && box.cx < 65

  return faceInZone && faceInUpperArea && notTooFar && notTooClose && centered
}

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef       = useRef(null)
  const canvasRef      = useRef(null)
  const streamRef      = useRef(null)
  const detectorRef    = useRef(null)
  const loopRef        = useRef(null)

  const [status,    setStatus]    = useState('waiting')
  const [countdown, setCountdown] = useState(3)
  const [flash,     setFlash]     = useState(false)
  const [ready,     setReady]     = useState(false)     // face inside oval?
  const [faceFound, setFaceFound] = useState(false)     // any face detected?
  const [hint,      setHint]      = useState('Position your face in the oval')

  // ── Start camera ──
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setStatus('ready')
        }
      } catch {
        setStatus('error')
      }
    }
    start()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      clearTimeout(loopRef.current)
    }
  }, [])

  // ── Init face detector ──
  useEffect(() => {
    try {
      if ('FaceDetector' in window) {
        detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
      }
    } catch { detectorRef.current = null }
  }, [])

  // ── Detection loop ──
  useEffect(() => {
    if (status !== 'ready') return
    let active = true

    const detect = async () => {
      if (!active || !videoRef.current) return
      const video = videoRef.current
      if (video.readyState < 2) { loopRef.current = setTimeout(detect, 150); return }

      const vw = video.videoWidth  || 640
      const vh = video.videoHeight || 480

      try {
        let facePct = null

        if (detectorRef.current) {
          // Chrome FaceDetector — gives real bounding box
          const faces = await detectorRef.current.detect(video)
          if (faces.length > 0) {
            const f = faces[0].boundingBox
            // Mirror X (video is flipped)
            const mirX = vw - f.x - f.width
            facePct = {
              cx: ((mirX + f.width  / 2) / vw) * 100,
              cy: ((f.y  + f.height / 2) / vh) * 100,
              rw: (f.width  / vw) * 50,   // half-width %
              rh: (f.height / vh) * 50,   // half-height %
            }
          }
        } else {
          // Canvas skin-tone fallback
          const tmp = document.createElement('canvas')
          tmp.width = 80; tmp.height = 60
          const ctx = tmp.getContext('2d')
          ctx.drawImage(video, 0, 0, 80, 60)
          const d = ctx.getImageData(20, 6, 40, 48).data
          let skin = 0
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i+1], b = d[i+2]
            if (r > 80 && g > 30 && b > 15 && r > g && r > b && r - Math.min(g,b) > 20) skin++
          }
          if (skin / (d.length / 4) > 0.12) {
            // Assume face is roughly centered if skin detected
            facePct = { cx: 50, cy: 44, rw: 22, rh: 28 }
          }
        }

        if (facePct) {
          setFaceFound(true)
          const inside = faceInsideZone(facePct)
          setReady(inside)

          if (inside) {
            setHint('Perfect — hold still')
          } else {
            // Shoulder/distance hints first
            if (facePct.rw < 14)        setHint('Move closer — show your shoulders')
            else if (facePct.rw > 28)   setHint('Move back — too close')
            // Position hints
            else if (facePct.cy > 52)   setHint('Move up — face too low')
            else if (facePct.cy < 20)   setHint('Move down — face too high')
            else if (facePct.cx < 35)   setHint('Move right — center your face')
            else if (facePct.cx > 65)   setHint('Move left — center your face')
            else                        setHint('Fit head and shoulders in the frame')
          }
        } else {
          setFaceFound(false)
          setReady(false)
          setHint('No face detected — look at the camera')
        }
      } catch {
        setReady(false)
      }

      if (active) loopRef.current = setTimeout(detect, 90)
    }

    detect()
    return () => { active = false; clearTimeout(loopRef.current) }
  }, [status])

  // ── Countdown ──
  const startCountdown = useCallback(() => {
    if (!ready) return
    setStatus('countdown')
    setCountdown(3)
    let count = 3
    const timer = setInterval(() => {
      count--
      setCountdown(count)
      if (count === 0) { clearInterval(timer); capturePhoto() }
    }, 1000)
  }, [ready])

  const capturePhoto = () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    setFlash(true)
    setTimeout(() => setFlash(false), 300)
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' })
      streamRef.current?.getTracks().forEach(t => t.stop())
      clearTimeout(loopRef.current)
      setStatus('captured')
      onCapture(file)
    }, 'image/jpeg', 0.95)
  }

  // Frame color based on state
  const fc = ready ? '#22C55E' : faceFound ? '#F59E0B' : '#EF4444'

  // Portrait bust shape path in SVG coordinates (viewBox 100x75)
  // Head oval + shoulder curve at bottom = bust silhouette
  const headCx = 50, headCy = 30, headRx = 22, headRy = 24
  const shoulderY = 70   // where shoulders end
  const shoulderW = 72   // shoulder width
  const neckW = 12       // neck width

  // SVG path: head oval top + neck + shoulders curve
  const bustPath = [
    // Start at top of head
    `M ${headCx} ${headCy - headRy}`,
    // Head oval (right side)
    `A ${headRx} ${headRy} 0 0 1 ${headCx} ${headCy + headRy}`,
    // Head oval (left side)  
    `A ${headRx} ${headRy} 0 0 1 ${headCx} ${headCy - headRy}`,
  ].join(' ')

  // Separate shoulder line path
  const shoulderPath = [
    `M ${headCx - neckW} ${headCy + headRy - 2}`,
    `C ${headCx - neckW * 1.5} ${headCy + headRy + 4} ${headCx - shoulderW/2} ${shoulderY - 8} ${headCx - shoulderW/2} ${shoulderY}`,
    `L ${headCx + shoulderW/2} ${shoulderY}`,
    `C ${headCx + shoulderW/2} ${shoulderY - 8} ${headCx + neckW * 1.5} ${headCy + headRy + 4} ${headCx + neckW} ${headCy + headRy - 2}`,
  ].join(' ')

  // Full bust outline for mask
  const fullBustPath = [
    `M ${headCx} ${headCy - headRy}`,
    `A ${headRx} ${headRy} 0 1 1 ${headCx - 0.01} ${headCy - headRy}`,
    `M ${headCx - neckW} ${headCy + headRy - 2}`,
    `C ${headCx - neckW * 1.5} ${headCy + headRy + 4} ${headCx - shoulderW/2} ${shoulderY - 8} ${headCx - shoulderW/2} ${shoulderY}`,
    `L ${headCx + shoulderW/2} ${shoulderY}`,
    `C ${headCx + shoulderW/2} ${shoulderY - 8} ${headCx + neckW * 1.5} ${headCy + headRy + 4} ${headCx + neckW} ${headCy + headRy - 2}`,
  ].join(' ')

  return (
    <>
      <style>{`
        @keyframes camFadeIn  { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes pulseDot   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes countPop   { 0%{transform:translate(-50%,-50%) scale(1.5);opacity:0} 30%{opacity:1} 80%{opacity:1} 100%{transform:translate(-50%,-50%) scale(0.8);opacity:0} }
        @keyframes flashWhite { 0%{opacity:0} 15%{opacity:0.9} 100%{opacity:0} }
        @keyframes spin360    { to{transform:rotate(360deg)} }
        @keyframes hintSlide  { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .cam-capture:hover:not(:disabled) { filter:brightness(1.1)!important; transform:translateY(-1px)!important; }
        .cam-cancel:hover { background:rgba(255,255,255,0.07)!important; }
      `}</style>

      <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={s.modal}>

          {/* Header */}
          <div style={s.header}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={s.camIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#4f8eff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="#4f8eff" strokeWidth="1.8"/>
                </svg>
              </div>
              <div>
                <p style={s.title}>Portrait capture</p>
                <p style={s.subtitle}>Fit your head and shoulders in the frame</p>
              </div>
            </div>
            <button style={s.closeBtn} onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Viewport */}
          <div style={s.viewport}>
            {status === 'error' ? (
              <div style={s.errorBox}>
                <div style={s.errorIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.5"/>
                    <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ color:'#FCA5A5', fontSize:14, fontWeight:600, margin:0 }}>Camera access denied</p>
                <p style={{ color:'#64748B', fontSize:12, margin:'6px 0 0', textAlign:'center' }}>Allow camera permission in your browser settings</p>
                <button onClick={onClose} style={s.errorBtn}>Close</button>
              </div>
            ) : (
              <>
                {/* Live video — mirrored */}
                <video ref={videoRef} style={{ ...s.video, transform:'scaleX(-1)' }} playsInline muted />

                {/* Portrait bust frame overlay */}
                <svg
                  viewBox="0 0 100 75"
                  preserveAspectRatio="none"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3 }}
                >
                  <defs>
                    <mask id="bustMask">
                      <rect width="100" height="75" fill="white"/>
                      {/* Head cutout */}
                      <ellipse cx={headCx} cy={headCy} rx={headRx} ry={headRy} fill="black"/>
                      {/* Shoulder cutout */}
                      <path d={`M ${headCx - neckW} ${headCy + headRy - 2} C ${headCx - neckW*1.5} ${headCy + headRy + 4} ${headCx - shoulderW/2} ${shoulderY - 8} ${headCx - shoulderW/2} ${shoulderY} L ${headCx + shoulderW/2} ${shoulderY} C ${headCx + shoulderW/2} ${shoulderY - 8} ${headCx + neckW*1.5} ${headCy + headRy + 4} ${headCx + neckW} ${headCy + headRy - 2} Z`} fill="black"/>
                    </mask>
                  </defs>

                  {/* Dark overlay — cut out head + shoulders */}
                  <rect width="100" height="75" fill="rgba(0,0,0,0.82)" mask="url(#bustMask)"/>

                  {/* Head oval border */}
                  <ellipse
                    cx={headCx} cy={headCy} rx={headRx} ry={headRy}
                    fill="none" stroke={fc} strokeWidth="0.6"
                    strokeDasharray={ready ? "none" : "2 1.5"}
                    style={{ transition:'stroke 0.3s' }}
                  />

                  {/* Shoulder curve border */}
                  <path
                    d={`M ${headCx - neckW} ${headCy + headRy - 2} C ${headCx - neckW*1.5} ${headCy + headRy + 4} ${headCx - shoulderW/2} ${shoulderY - 8} ${headCx - shoulderW/2} ${shoulderY}`}
                    fill="none" stroke={fc} strokeWidth="0.6"
                    strokeDasharray={ready ? "none" : "2 1.5"}
                    style={{ transition:'stroke 0.3s' }}
                  />
                  <path
                    d={`M ${headCx + neckW} ${headCy + headRy - 2} C ${headCx + neckW*1.5} ${headCy + headRy + 4} ${headCx + shoulderW/2} ${shoulderY - 8} ${headCx + shoulderW/2} ${shoulderY}`}
                    fill="none" stroke={fc} strokeWidth="0.6"
                    strokeDasharray={ready ? "none" : "2 1.5"}
                    style={{ transition:'stroke 0.3s' }}
                  />
                  {/* Shoulder bottom line */}
                  <line
                    x1={headCx - shoulderW/2} y1={shoulderY}
                    x2={headCx + shoulderW/2} y2={shoulderY}
                    stroke={fc} strokeWidth="0.6"
                    strokeDasharray={ready ? "none" : "2 1.5"}
                    style={{ transition:'stroke 0.3s' }}
                  />

                  {/* Glow when ready */}
                  {ready && <>
                    <ellipse cx={headCx} cy={headCy} rx={headRx} ry={headRy} fill="none" stroke="#22C55E" strokeWidth="1.2" opacity="0.2"/>
                    <path d={`M ${headCx - neckW} ${headCy + headRy - 2} C ${headCx - neckW*1.5} ${headCy + headRy + 4} ${headCx - shoulderW/2} ${shoulderY - 8} ${headCx - shoulderW/2} ${shoulderY}`} fill="none" stroke="#22C55E" strokeWidth="1.2" opacity="0.2"/>
                    <path d={`M ${headCx + neckW} ${headCy + headRy - 2} C ${headCx + neckW*1.5} ${headCy + headRy + 4} ${headCx + shoulderW/2} ${shoulderY - 8} ${headCx + shoulderW/2} ${shoulderY}`} fill="none" stroke="#22C55E" strokeWidth="1.2" opacity="0.2"/>
                  </>}

                  {/* Eye level guide line inside head */}
                  <line
                    x1={headCx - headRx * 0.65} y1={headCy - headRy * 0.15}
                    x2={headCx + headRx * 0.65} y2={headCy - headRy * 0.15}
                    stroke={fc} strokeWidth="0.25" opacity="0.45"
                    strokeDasharray="1 1"
                    style={{ transition:'stroke 0.3s' }}
                  />

                  {/* Nose center dot */}
                  <circle cx={headCx} cy={headCy + headRy * 0.15} r="0.5" fill={fc} opacity="0.55" style={{ transition:'fill 0.3s' }}/>

                  {/* Corner ticks on head oval */}
                  {[0, 90, 180, 270].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180
                    const x1 = headCx + headRx * Math.cos(rad)
                    const y1 = headCy + headRy * Math.sin(rad)
                    const x2 = headCx + (headRx + 2) * Math.cos(rad)
                    const y2 = headCy + (headRy + 2) * Math.sin(rad)
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={fc} strokeWidth="0.8" strokeLinecap="round" style={{ transition:'stroke 0.3s' }}/>
                  })}

                  {/* Shoulder label guides */}
                  <text x={headCx - shoulderW/2 + 1} y={shoulderY - 1.5} fontSize="3" fill={fc} opacity="0.5" fontFamily="sans-serif">L</text>
                  <text x={headCx + shoulderW/2 - 3} y={shoulderY - 1.5} fontSize="3" fill={fc} opacity="0.5" fontFamily="sans-serif">R</text>
                </svg>

                {/* Status badge */}
                <div style={{ ...s.badge, borderColor:`${fc}60`, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', transition:'all 0.3s' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:fc, marginRight:7, animation:'pulseDot 1.4s ease-in-out infinite', flexShrink:0, transition:'background 0.3s' }} />
                  <span style={{ fontSize:11, color:fc, fontWeight:700, letterSpacing:'0.04em', transition:'color 0.3s' }}>
                    {status === 'waiting' ? 'STARTING…'
                      : !faceFound ? 'NO FACE FOUND'
                      : ready ? 'PERFECTLY ALIGNED'
                      : 'ALIGN YOUR FACE'}
                  </span>
                </div>

                {/* HD badge */}
                <div style={s.resBadge}>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:600, letterSpacing:'0.06em' }}>HD</span>
                </div>

                {/* Hint bar — directional instruction */}
                <div style={{ ...s.hintBar, borderColor:`${fc}30`, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)', transition:'border-color 0.3s' }} key={hint}>
                  <span style={{ fontSize:12, color: ready ? '#86EFAC' : faceFound ? '#FCD34D' : '#FCA5A5', fontWeight:700, transition:'color 0.3s' }}>
                    {hint}
                  </span>
                </div>

                {/* Countdown overlay */}
                {status === 'countdown' && (
                  <div style={s.countdownOverlay}>
                    <div key={countdown} style={{ position:'absolute', top:'50%', left:'50%', fontSize:96, fontWeight:900, color:'white', lineHeight:1, animation:'countPop 1s ease forwards', textShadow:`0 0 40px ${fc}` }}>
                      {countdown}
                    </div>
                    <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:700, letterSpacing:'0.12em' }}>
                      HOLD STILL
                    </div>
                  </div>
                )}

                {/* Flash */}
                {flash && <div style={{ position:'absolute', inset:0, background:'white', animation:'flashWhite 0.3s ease forwards', zIndex:10, borderRadius:12 }} />}
              </>
            )}
          </div>

          {/* Tips row — fixed height, never shifts */}
          <div style={s.tipsRow}>
            {[
              { icon:'☀', text:'Good lighting' },
              { icon:'◎', text:'Look straight' },
              { icon:'👕', text:'Show shoulders' },
            ].map(({ icon, text }, i) => (
              <div key={i} style={s.tipChip}>
                <span style={{ fontSize:13 }}>{icon}</span>
                <span style={{ fontSize:11, color:'#64748B', fontWeight:500 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={s.btnRow}>
            <button className="cam-cancel" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              className="cam-capture"
              style={{
                ...s.captureBtn,
                opacity: (status === 'ready' && ready) ? 1 : 0.4,
                background: (status === 'ready' && ready) ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : '#334155',
                cursor: (status === 'ready' && ready) ? 'pointer' : 'not-allowed',
                transition:'all 0.2s',
              }}
              onClick={(status === 'ready' && ready) ? startCountdown : undefined}
              disabled={status !== 'ready' || !ready}
            >
              {status === 'countdown' ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:12, height:12, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin360 0.7s linear infinite', display:'inline-block' }} />
                  Capturing in {countdown}…
                </span>
              ) : status === 'waiting' ? 'Starting camera…'
                : !faceFound ? 'Show your face'
                : !ready ? 'Align face to capture'
                : (
                  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8"/>
                    </svg>
                    Capture photo
                  </span>
                )
              }
            </button>
          </div>

          <canvas ref={canvasRef} style={{ display:'none' }} />
        </div>
      </div>
    </>
  )
}

const s = {
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,5,0.82)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(6px)' },
  modal:        { background:'#0B1120', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:20, width:460, maxWidth:'95vw', display:'flex', flexDirection:'column', gap:14, animation:'camFadeIn 0.25s ease both', boxShadow:'0 32px 80px rgba(0,0,0,0.6)' },
  header:       { display:'flex', justifyContent:'space-between', alignItems:'center' },
  camIcon:      { width:36, height:36, borderRadius:10, background:'rgba(79,142,255,0.12)', border:'1px solid rgba(79,142,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  title:        { fontSize:15, fontWeight:700, color:'#F1F5F9', margin:0, letterSpacing:'-0.01em' },
  subtitle:     { fontSize:11, color:'#475569', margin:'2px 0 0', fontWeight:500 },
  closeBtn:     { width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 },
  viewport:     { position:'relative', width:'100%', aspectRatio:'4/3', background:'#020817', borderRadius:14, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.06)' },
  video:        { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  badge:        { position:'absolute', top:12, left:12, display:'flex', alignItems:'center', border:'1px solid', borderRadius:20, padding:'5px 12px', zIndex:5 },
  resBadge:     { position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'4px 8px', zIndex:5 },
  hintBar:      { position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:7, border:'1px solid', borderRadius:20, padding:'6px 18px', zIndex:5, whiteSpace:'nowrap', animation:'hintSlide 0.3s ease' },
  countdownOverlay: { position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(2px)', zIndex:8, display:'flex', alignItems:'center', justifyContent:'center' },
  tipsRow:      { display:'flex', gap:8 },
  tipChip:      { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'7px 10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 },
  btnRow:       { display:'flex', gap:10 },
  cancelBtn:    { flex:1, padding:'11px', borderRadius:11, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#64748B', fontSize:13, fontWeight:600, cursor:'pointer' },
  captureBtn:   { flex:2, padding:'11px', borderRadius:11, border:'none', color:'white', fontSize:13, fontWeight:700, letterSpacing:'0.02em' },
  errorBox:     { display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:28, textAlign:'center' },
  errorIcon:    { width:56, height:56, borderRadius:16, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  errorBtn:     { marginTop:8, padding:'8px 20px', borderRadius:10, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#FCA5A5', fontSize:12, fontWeight:600, cursor:'pointer' },
}