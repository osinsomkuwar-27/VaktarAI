import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import CreatePage   from './pages/CreatePage'
import FeaturesPage from './pages/FeaturesPage'
import HistoryPage  from './pages/HistoryPage'
import LoginPage    from './components/LoginPage'

export default function App() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"         element={<Navigate to="/create" replace />} />
          <Route path="/create"   element={<CreatePage   addToast={addToast} />} />
          <Route path="/features" element={<FeaturesPage addToast={addToast} />} />
          <Route path="/history"  element={<HistoryPage  addToast={addToast} />} />
          <Route path="/login"    element={<LoginPage    addToast={addToast} />} />
          <Route path="*"         element={<Navigate to="/create" replace />} />
        </Routes>
      </main>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}