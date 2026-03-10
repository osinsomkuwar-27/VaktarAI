import { useState, useEffect } from 'react'

const STORAGE_KEY = 'avatarHistory'

const MOCK_ITEMS = [
  { id: 1, date: '2024-10-23', style: 'Realistic', tone: 'Professional' },
  { id: 2, date: '2024-10-17', style: 'Anime',     tone: 'Friendly'    },
  { id: 3, date: '2024-10-20', style: 'Cartoon',   tone: 'Energetic'   },
  { id: 4, date: '2024-10-24', style: 'Realistic', tone: 'Calm'        },
  { id: 5, date: '2024-10-23', style: 'Anime',     tone: 'Inspirational'},
  { id: 6, date: '2024-10-17', style: 'Cartoon',   tone: 'Professional'},
  { id: 7, date: '2024-10-20', style: 'Realistic', tone: 'Friendly'    },
  { id: 8, date: '2024-10-24', style: 'Anime',     tone: 'Energetic'   },
]

const STYLE_COLORS = {
  Realistic: { bg:'rgba(79,142,255,0.12)', border:'rgba(79,142,255,0.3)', text:'#7aadff' },
  Anime:     { bg:'rgba(167,139,250,0.12)',border:'rgba(167,139,250,0.3)',text:'#c4adff' },
  Cartoon:   { bg:'rgba(16,217,160,0.12)', border:'rgba(16,217,160,0.3)', text:'#5de8c1' },
}

function EmptyState() {
  return (
    <div style={es.wrap}>
      <div style={es.icon}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="6" width="24" height="20" rx="4" stroke="var(--text-muted)" strokeWidth="1.5"/>
          <path d="M10 13h12M10 18h8" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 style={es.title}>No creations yet</h3>
      <p style={es.desc}>Your generated avatars will appear here.</p>
      <a href="/create" style={es.btn}>Create your first avatar →</a>
    </div>
  )
}

export default function HistoryPage() {
  const [items,  setItems]  = useState(MOCK_ITEMS)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [hovered,setHovered]= useState(null)

  const styles = ['All', 'Realistic', 'Anime', 'Cartoon']

  const filtered = items.filter(item => {
    const matchStyle  = filter === 'All' || item.style === filter
    const matchSearch = item.date.includes(search) || item.style.toLowerCase().includes(search.toLowerCase())
    return matchStyle && matchSearch
  })

  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerLoad { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .gallery-card:hover .card-overlay { opacity: 1 !important; }
        .filter-btn:hover { border-color: rgba(79,142,255,0.4) !important; color: var(--text-secondary) !important; }
        .delete-btn:hover { background: rgba(248,113,113,0.15) !important; border-color: rgba(248,113,113,0.4) !important; }
        input::placeholder { color: var(--text-muted); }
        input:focus { border-color: rgba(79,142,255,0.4) !important; outline: none; box-shadow: 0 0 0 3px rgba(79,142,255,0.08) !important; }
      `}</style>

      {/* Page header */}
      <div style={s.header}>
        <div>
          <p style={s.pageEyebrow}>YOUR LIBRARY</p>
          <h1 style={s.pageTitle}>GALLERY</h1>
        </div>
        <div style={s.headerRight}>
          {/* Search */}
          <div style={s.searchWrap}>
            <svg style={s.searchIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="var(--text-muted)" strokeWidth="1.4"/>
              <path d="M11 11l3 3" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              style={s.searchInput}
              placeholder="Search by date or style…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Count badge */}
          <div style={s.countBadge}>
            <span style={s.countNum}>{filtered.length}</span>
            <span style={s.countLabel}>avatars</span>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={s.filterRow}>
        {styles.map(f => (
          <button
            key={f}
            className="filter-btn"
            onClick={() => setFilter(f)}
            style={{
              ...s.filterBtn,
              ...(filter === f ? s.filterActive : s.filterIdle),
            }}
          >
            {f}
            {f !== 'All' && (
              <span style={{ ...s.filterCount, background: filter===f ? 'rgba(79,142,255,0.25)' : 'rgba(255,255,255,0.05)' }}>
                {items.filter(i => i.style === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={s.grid}>
          {filtered.map((item, i) => {
            const sc = STYLE_COLORS[item.style] || STYLE_COLORS.Realistic
            return (
              <div
                key={item.id}
                className="gallery-card"
                style={{ ...s.card, animationDelay:`${i*0.05}s` }}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Thumbnail */}
                <div style={s.thumb}>
                  {/* Shimmer background */}
                  <div style={s.thumbBg} />
                  {/* Grid overlay */}
                  <div style={s.thumbGrid} />
                  {/* Avatar silhouette */}
                  <svg width="36" height="44" viewBox="0 0 100 120" fill="none" style={{ position:'relative', zIndex:1, opacity:0.2 }}>
                    <ellipse cx="50" cy="38" rx="28" ry="32" stroke="#4f8eff" strokeWidth="2"/>
                    <path d="M10 110c0-22 18-38 40-38s40 16 40 38" stroke="#4f8eff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {/* Style badge */}
                  <div style={{ ...s.styleBadge, background:sc.bg, border:`1px solid ${sc.border}`, color:sc.text }}>
                    {item.style}
                  </div>
                  {/* Hover overlay */}
                  <div className="card-overlay" style={s.cardOverlay}>
                    <button
                      className="delete-btn"
                      style={s.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}
                    >
                      ✕
                    </button>
                    <button style={s.viewBtn}>▶ View</button>
                  </div>
                </div>
                {/* Card footer */}
                <div style={s.cardFooter}>
                  <span style={s.cardDate}>{item.date}</span>
                  <span style={s.cardTone}>{item.tone}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Styles ── */
const s = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 28px 60px',
    display: 'flex', flexDirection: 'column', gap: 24,
    animation: 'fadeUp 0.5s ease both',
  },
  header: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
  },
  pageEyebrow: {
    fontFamily: 'var(--font-display)',
    fontSize: 10, fontWeight: 800,
    letterSpacing: '0.15em',
    color: 'var(--accent)',
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(28px,4vw,48px)',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  searchWrap: {
    position: 'relative', display: 'flex', alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute', left: 12, pointerEvents: 'none',
  },
  searchInput: {
    background: 'rgba(17,24,39,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10, padding: '9px 14px 9px 34px',
    color: 'var(--text-secondary)',
    fontSize: 13, fontFamily: 'var(--font-body)',
    width: 240,
    backdropFilter: 'blur(12px)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  countBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(17,24,39,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '8px 16px',
    backdropFilter: 'blur(12px)',
  },
  countNum: {
    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800,
    color: 'var(--accent)', lineHeight: 1,
  },
  countLabel: {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
    color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2,
  },

  // Filters
  filterRow: {
    display: 'flex', gap: 8, flexWrap: 'wrap',
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '7px 16px',
    borderRadius: 100,
    fontSize: 11, fontWeight: 700,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    border: '1px solid',
    transition: 'all 0.18s',
    fontFamily: 'var(--font-display)',
  },
  filterActive: {
    background: 'rgba(79,142,255,0.15)',
    borderColor: 'rgba(79,142,255,0.5)',
    color: '#a0c0ff',
  },
  filterIdle: {
    background: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
    color: 'var(--text-muted)',
  },
  filterCount: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 18, height: 18, borderRadius: '50%',
    fontSize: 9, fontWeight: 800,
    color: 'var(--text-secondary)',
  },

  // Gallery grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 18,
  },
  card: {
    display: 'flex', flexDirection: 'column', gap: 8,
    animation: 'fadeUp 0.4s ease both',
  },
  thumb: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  thumbBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(8,13,26,0.95))',
  },
  thumbGrid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(79,142,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,255,0.04) 1px,transparent 1px)',
    backgroundSize: '24px 24px',
    pointerEvents: 'none',
  },
  styleBadge: {
    position: 'absolute', top: 10, left: 10,
    padding: '3px 9px',
    borderRadius: 100,
    fontSize: 9, fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  cardOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
    opacity: 0,
    transition: 'opacity 0.2s',
    borderRadius: 16,
  },
  deleteBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28,
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.25)',
    borderRadius: '50%',
    color: '#f87171',
    fontSize: 11, fontWeight: 700,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s, border-color 0.2s',
  },
  viewBtn: {
    padding: '7px 18px',
    background: 'rgba(79,142,255,0.2)',
    border: '1px solid rgba(79,142,255,0.4)',
    borderRadius: 100,
    color: '#a0c0ff',
    fontSize: 11, fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.05em',
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 2px',
  },
  cardDate: {
    fontSize: 11, fontWeight: 500,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    letterSpacing: '0.02em',
  },
  cardTone: {
    fontSize: 10, fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
  },
}

const es = {
  wrap: {
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:14, padding:'80px 24px',
  },
  icon: {
    width:64, height:64,
    background:'rgba(17,24,39,0.85)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
  },
  title: {
    fontFamily:'var(--font-display)', fontSize:18, fontWeight:700,
    color:'var(--text-primary)', letterSpacing:'-0.02em',
  },
  desc: { fontSize:13, color:'var(--text-secondary)', textAlign:'center' },
  btn: {
    display:'inline-flex', alignItems:'center',
    marginTop:6, padding:'9px 20px',
    background:'linear-gradient(135deg,#4f8eff,#a78bfa)',
    color:'#fff', textDecoration:'none',
    borderRadius:10, fontFamily:'var(--font-display)',
    fontSize:13, fontWeight:700,
  },
}