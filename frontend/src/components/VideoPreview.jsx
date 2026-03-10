import { useRef, useState } from 'react'

export default function VideoPreview({ videoUrl, onReset }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setIsPlaying(true) }
    else { v.pause(); setIsPlaying(false) }
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    setProgress((v.currentTime / v.duration) * 100)
  }

  const handleSeek = (e) => {
    const v = videoRef.current
    if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    v.currentTime = pct * v.duration
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div style={styles.wrapper} className="animate-fade-in">
      {/* Success badge */}
      <div style={styles.badge}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#10d9a0" strokeWidth="1.5" />
          <path d="M5 8l2 2 4-4" stroke="#10d9a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Avatar generated successfully
      </div>

      {/* Video container */}
      <div style={styles.videoContainer}>
        {/* Glow ring */}
        <div style={styles.glowRing} />

        <video
          ref={videoRef}
          src={videoUrl}
          style={styles.video}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />

        {/* Play overlay when paused */}
        {!isPlaying && (
          <button style={styles.playOverlay} onClick={togglePlay} aria-label="Play video">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" />
              <path d="M13 10l10 6-10 6V10z" fill="white" />
            </svg>
          </button>
        )}
      </div>

      {/* Custom controls */}
      <div style={styles.controls}>
        {/* Play/Pause */}
        <button style={styles.ctrlBtn} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="2" width="4" height="12" rx="1.5" fill="currentColor" />
              <rect x="9" y="2" width="4" height="12" rx="1.5" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 2l10 6-10 6V2z" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Seek bar */}
        <div style={styles.seekTrack} onClick={handleSeek} role="slider" aria-valuenow={progress}>
          <div style={{ ...styles.seekFill, width: `${progress}%` }} />
          <div style={{ ...styles.seekThumb, left: `${progress}%` }} />
        </div>

        {/* Time */}
        <span style={styles.time}>
          {formatTime((progress / 100) * duration)} / {formatTime(duration)}
        </span>
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <a
          href={videoUrl}
          download="avatar-video.mp4"
          style={styles.downloadBtn}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Download MP4
        </a>
        <button style={styles.resetBtn} onClick={onReset}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8a6 6 0 1 0 1-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 3v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Create Another
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 16px',
    background: 'rgba(16,217,160,0.08)',
    border: '1px solid rgba(16,217,160,0.2)',
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 500,
    color: '#10d9a0',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    overflow: 'hidden',
    background: '#000',
    aspectRatio: '16/9',
  },
  glowRing: {
    position: 'absolute',
    inset: -2,
    borderRadius: 18,
    background: 'linear-gradient(135deg, #4f8eff, #a78bfa)',
    zIndex: -1,
    opacity: 0.5,
    filter: 'blur(8px)',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.2)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 480,
    padding: '12px 16px',
    background: 'var(--bg-elevated)',
    borderRadius: 12,
    border: '1px solid var(--border)',
  },
  ctrlBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  seekTrack: {
    flex: 1,
    height: 4,
    background: 'var(--bg-primary)',
    borderRadius: 2,
    cursor: 'pointer',
    position: 'relative',
  },
  seekFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4f8eff, #a78bfa)',
    borderRadius: 2,
    transition: 'width 0.1s linear',
  },
  seekThumb: {
    position: 'absolute',
    top: '50%',
    width: 12,
    height: 12,
    background: '#fff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 6px rgba(79,142,255,0.6)',
    transition: 'left 0.1s linear',
  },
  time: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    gap: 12,
    width: '100%',
    maxWidth: 480,
  },
  downloadBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 20px',
    background: 'linear-gradient(135deg, #4f8eff, #a78bfa)',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    borderRadius: 10,
    letterSpacing: '-0.01em',
    transition: 'opacity 0.2s, transform 0.15s',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 20px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: 10,
    letterSpacing: '-0.01em',
    transition: 'color 0.2s, border-color 0.2s',
  },
}