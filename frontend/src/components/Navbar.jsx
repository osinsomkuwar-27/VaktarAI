import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/create', label: 'Create Avatar' },
  { to: '/features', label: 'Features' },
  { to: '/history', label: 'History' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        {/* Logo */}
        <NavLink to="/create" style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="white" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="19" cy="6" r="2.5" fill="#4f8eff" />
              <path d="M19 3.5v1M19 8.5v1M16.5 6h-1M21.5 6h1M17.3 4.3l-.7-.7M21.4 8.4l-.7-.7M21.4 3.6l-.7.7M17.3 7.7l-.7.7" stroke="#4f8eff" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <span style={styles.logoText}>AvatarAI</span>
        </NavLink>

        {/* Desktop Links */}
        <div style={styles.links}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <div style={styles.actions}>
          <NavLink
            to="/login"
            style={({ isActive }) => ({
              ...styles.ctaBtn,
              ...(isActive ? styles.loginBtnActive : {}),
            })}
          >
            Login
          </NavLink>
        </div>

        {/* Hamburger */}
        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.mobileLink,
                ...(isActive ? styles.mobileLinkActive : {}),
              })}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(8, 11, 18, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  nav: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    marginRight: 'auto',
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #4f8eff, #a78bfa)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 18,
    color: '#f0f4ff',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    gap: 4,
    '@media(max-width:768px)': { display: 'none' },
  },
  link: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: 8,
    transition: 'color 0.2s, background 0.2s',
  },
  linkActive: {
    color: 'var(--text-primary)',
    background: 'rgba(79,142,255,0.1)',
  },
  actions: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  ctaBtn: {
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: '#fff',
    background: 'linear-gradient(135deg, #4f8eff, #a78bfa)',
    border: 'none',
    borderRadius: 8,
    padding: '8px 18px',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.2s',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: 5,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  bar: {
    width: 22,
    height: 2,
    background: 'var(--text-secondary)',
    borderRadius: 2,
    transition: 'all 0.25s',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 24px 20px',
    gap: 4,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  mobileLink: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: 8,
  },
  mobileLinkActive: {
    color: 'var(--text-primary)',
    background: 'rgba(79,142,255,0.1)',
  },
}