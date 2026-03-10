import React, { useState } from 'react';
import { BrowserRouter as Routes, Route, Routes as Switch, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import CreatePage from './pages/CreatePage';
import FeaturesPage from './pages/FeaturesPage';
import HistoryPage from './pages/HistoryPage';

const AppContent = () => {
const location = useLocation();
const [toast, setToast] = useState(null);

const showToast = (message, type = 'success') => {
setToast({ message, type });
};

return (
<div className="min-h-screen bg-[#050816] text-white selection:bg-violet-500/30">
<Navbar />

  <AnimatePresence mode="wait">
    <Switch location={location} key={location.pathname}>
      <Route path="/login" element={<LoginPage showToast={showToast} />} />
      <Route path="/create" element={<CreatePage showToast={showToast} />} />
      <Route path="/features" element={<FeaturesPage showToast={showToast} />} />
      <Route path="/history" element={<HistoryPage showToast={showToast} />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Switch>
  </AnimatePresence>

  <AnimatePresence>
    {toast && (
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(null)} 
      />
    )}
  </AnimatePresence>

  {/* Background Animated Orbs */}
  <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
  </div>
</div>
);
};

const App = () => (
<Routes>
<AppContent />
</Routes>
);

export default App;