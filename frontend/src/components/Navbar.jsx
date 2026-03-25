import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const NAV_LINKS = [
  { to: '/create', label: 'Create Avatar' },
  { to: '/chat', label: 'AI Chat' },
  { to: '/background', label: 'Background' },
  { to: '/features', label: 'Features' },
  { to: '/history', label: 'History' },
]

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    setDropdownOpen(false)
    navigate('/login')
  }

  const avatarLetter = user?.displayName
    ? user.displayName[0].toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : '?'

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <NavLink to="/create" style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="white" />
              <path
                d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="19" cy="6" r="2.5" fill="#4f8eff" />
              <path
                d="M19 3.5v1M19 8.5v1M16.5 6h-1M21.5 6h1M17.3 4.3l-.7-.7M21.4 8.4l-.7-.7M21.4 3.6l-.7.7M17.3 7.7l-.7.7"
                stroke="#4f8eff"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span style={styles.logoText}>Vaktar AI</span>
        </NavLink>

        <div style={styles.links}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
                ...(to === '/chat' ? styles.chatLink : {}),
                ...(to === '/chat' && isActive ? styles.chatLinkActive : {}),
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div style={styles.actions}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                style={styles.avatar}
                onClick={() => setDropdownOpen((open) => !open)}
                title={user.email || user.phoneNumber || 'Account'}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" style={styles.avatarImg} />
                ) : (
                  avatarLetter
                )}
              </div>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <p style={styles.dropdownEmail}>
                    {user.email || user.phoneNumber || 'Signed in'}
                  </p>
                  <button style={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              style={({ isActive }) => ({
                ...styles.ctaBtn,
                ...(isActive ? styles.loginBtnActive : {}),
              })}
            >
              Login
            </NavLink>
          )}
        </div>

        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <span
            style={{
              ...styles.bar,
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            }}
          />
          <span style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
          <span
            style={{
              ...styles.bar,
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            }}
          />
        </button>
      </nav>

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
          {user && (
            <button style={styles.mobileLogout} onClick={handleLogout}>
              Logout
            </button>
          )}
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
  chatLink: {
    color: 'var(--accent)',
    background: 'rgba(79,142,255,0.08)',
    border: '1px solid rgba(79,142,255,0.2)',
  },
  chatLinkActive: {
    background: 'rgba(79,142,255,0.18)',
    border: '1px solid rgba(79,142,255,0.4)',
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
    textDecoration: 'none',
  },
  loginBtnActive: {
    boxShadow: '0 0 0 2px rgba(255,255,255,0.15)',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f8eff, #a78bfa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    overflow: 'hidden',
    border: '2px solid rgba(79,142,255,0.4)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 48,
    background: '#161b22',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '12px',
    minWidth: 200,
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  dropdownEmail: {
    color: '#8b949e',
    fontSize: 12,
    margin: 0,
    wordBreak: 'break-all',
  },
  logoutBtn: {
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    color: '#f85149',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'left',
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
  mobileLogout: {
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    color: '#f85149',
    borderRadius: 6,
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'left',
    marginTop: 8,
  },
}
