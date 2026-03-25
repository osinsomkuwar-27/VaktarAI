import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/create')
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleEmailAuth = async () => {
    setError('')

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }

      navigate('/create')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleGoogle = async () => {
    setError('')

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      navigate('/create')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>VaktarAI</h2>

        <div style={styles.tabs}>
          <button
            onClick={() => setMode('login')}
            style={mode === 'login' ? styles.activeTab : styles.tab}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            style={mode === 'signup' ? styles.activeTab : styles.tab}
          >
            Sign Up
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.btn} onClick={handleEmailAuth}>
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
        <button style={styles.googleBtn} onClick={handleGoogle}>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1117',
  },
  card: {
    background: '#161b22',
    padding: '2rem',
    borderRadius: '12px',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    color: '#00e5cc',
    textAlign: 'center',
    marginBottom: '8px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    flex: 1,
    padding: '8px',
    background: '#21262d',
    color: '#8b949e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  activeTab: {
    flex: 1,
    padding: '8px',
    background: '#00e5cc',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #30363d',
    background: '#0d1117',
    color: '#fff',
    fontSize: '14px',
  },
  btn: {
    padding: '10px',
    background: '#00e5cc',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  googleBtn: {
    padding: '10px',
    background: '#21262d',
    color: '#fff',
    border: '1px solid #30363d',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  error: {
    color: '#f85149',
    fontSize: '13px',
  },
}
