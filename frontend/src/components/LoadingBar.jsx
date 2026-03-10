const STAGES = [
  { label: 'Uploading assets', icon: '↑' },
  { label: 'Synthesizing voice', icon: '♪' },
  { label: 'Animating avatar', icon: '◉' },
  { label: 'Finalizing video', icon: '▶' },
]

export default function LoadingBar({ progress = 0 }) {
  // Derive current stage from progress
  const stageIndex = Math.min(Math.floor((progress / 100) * STAGES.length), STAGES.length - 1)

  return (
    <div style={styles.wrapper}>
      {/* Waveform animation */}
      <div style={styles.waveform}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.bar,
              animationDelay: `${(i * 0.08) % 1.2}s`,
              height: `${20 + Math.sin(i * 0.7) * 16}px`,
            }}
          />
        ))}
      </div>

      {/* Stage label */}
      <p style={styles.stage}>
        <span style={styles.stageIcon}>{STAGES[stageIndex].icon}</span>
        {STAGES[stageIndex].label}…
      </p>

      {/* Progress track */}
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${progress}%`,
          }}
        />
        <div
          style={{
            ...styles.glow,
            left: `${progress}%`,
          }}
        />
      </div>

      {/* Stage dots */}
      <div style={styles.stages}>
        {STAGES.map((s, i) => (
          <div key={i} style={styles.stageItem}>
            <div
              style={{
                ...styles.dot,
                background: i <= stageIndex ? 'var(--accent)' : 'var(--bg-elevated)',
                boxShadow: i === stageIndex ? '0 0 10px var(--accent-glow)' : 'none',
                transform: i === stageIndex ? 'scale(1.3)' : 'scale(1)',
              }}
            />
            <span
              style={{
                ...styles.dotLabel,
                color: i <= stageIndex ? 'var(--text-secondary)' : 'var(--text-muted)',
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <p style={styles.percent}>{progress}%</p>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: '32px 24px',
    animation: 'fadeIn 0.4s ease both',
  },
  waveform: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: 48,
  },
  bar: {
    width: 4,
    background: 'linear-gradient(180deg, #4f8eff, #a78bfa)',
    borderRadius: 2,
    animation: 'wave 1.2s ease-in-out infinite',
    transformOrigin: 'bottom',
    opacity: 0.85,
  },
  stage: {
    fontFamily: 'var(--font-display)',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    letterSpacing: '-0.01em',
  },
  stageIcon: {
    fontSize: 18,
    color: 'var(--accent)',
  },
  track: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    height: 6,
    background: 'var(--bg-elevated)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4f8eff, #a78bfa)',
    borderRadius: 3,
    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  glow: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 14,
    background: 'rgba(79,142,255,0.7)',
    filter: 'blur(6px)',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  stages: {
    display: 'flex',
    gap: 24,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  stageItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  dotLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.02em',
    transition: 'color 0.3s',
  },
  percent: {
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--accent)',
    letterSpacing: '0.05em',
  },
}