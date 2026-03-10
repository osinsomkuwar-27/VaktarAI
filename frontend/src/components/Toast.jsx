const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#10d9a0" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="#10d9a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5" />
      <path d="M6 6l4 4M10 6l-4 4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#4f8eff" strokeWidth="1.5" />
      <path d="M8 7v4M8 5.5v.5" stroke="#4f8eff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 13H2L8 2z" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 7v3M8 11.5v.5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

const COLORS = {
  success: { border: 'rgba(16,217,160,0.25)', bg: 'rgba(16,217,160,0.06)' },
  error: { border: 'rgba(248,113,113,0.25)', bg: 'rgba(248,113,113,0.06)' },
  info: { border: 'rgba(79,142,255,0.25)', bg: 'rgba(79,142,255,0.06)' },
  warning: { border: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.06)' },
}

function ToastItem({ toast, removeToast }) {
  const color = COLORS[toast.type] || COLORS.info

  return (
    <div
      style={{
        ...styles.toast,
        borderColor: color.border,
        background: `rgba(13, 18, 32, 0.95)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px ${color.border}`,
        animation: 'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      <div style={{ ...styles.colorBar, background: color.border }} />
      <div style={styles.iconWrap}>{ICONS[toast.type] || ICONS.info}</div>
      <p style={styles.message}>{toast.message}</p>
      <button style={styles.close} onClick={() => removeToast(toast.id)} aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default function Toast({ toasts, removeToast }) {
  if (!toasts.length) return null

  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 28,
    right: 24,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 360,
    width: '100%',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '13px 16px',
    borderRadius: 12,
    border: '1px solid',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    overflow: 'hidden',
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: '12px 0 0 12px',
  },
  iconWrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    marginLeft: 4,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-primary)',
    lineHeight: 1.45,
  },
  close: {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
}