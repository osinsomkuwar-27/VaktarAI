import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = ({ showToast }) => {
const navigate = useNavigate();
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [formData, setFormData] = useState({ username: '', password: '' });
const [errors, setErrors] = useState({});

const handleLogin = (e) => {
e.preventDefault();
const newErrors = {};
if (!formData.username) newErrors.username = 'Username is required';
if (!formData.password) newErrors.password = 'Password is required';

if (Object.keys(newErrors).length > 0) {
  setErrors(newErrors);
  showToast('Please fill in all fields', 'error');
  return;
}

setLoading(true);
setTimeout(() => {
  setLoading(false);
  showToast('Login successful! Redirecting...');
  navigate('/create');
}, 1500);
};

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
className="pt-32 pb-12 flex items-center justify-center min-h-[80vh] px-4"
>
<div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
{/* Glow behind card */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />

    <div className="text-center mb-8">
      <h2 className="font-orbitron text-3xl font-bold text-white mb-2">Welcome Back</h2>
      <p className="text-slate-400 text-sm">Sign in to your AvatarAI account</p>
    </div>

    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-orbitron tracking-widest text-slate-400 ml-1">USERNAME</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Enter your username"
            className={`w-full pl-12 pr-4 py-3.5 input-field rounded-2xl ${errors.username ? 'border-red-500/50' : ''}`}
            value={formData.username}
            onChange={(e) => {
              setFormData({...formData, username: e.target.value});
              setErrors({...errors, username: null});
            }}
          />
        </div>
        {errors.username && <p className="text-red-500 text-[10px] mt-1 ml-1 uppercase font-bold">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-orbitron tracking-widest text-slate-400 ml-1">PASSWORD</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`w-full pl-12 pr-12 py-3.5 input-field rounded-2xl ${errors.password ? 'border-red-500/50' : ''}`}
            value={formData.password}
            onChange={(e) => {
              setFormData({...formData, password: e.target.value});
              setErrors({...errors, password: null});
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 uppercase font-bold">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-4 rounded-full font-bold tracking-[0.2em] text-sm flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            LOGIN
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              →
            </motion.span>
          </>
        )}
      </button>
    </form>

    <p className="mt-8 text-center text-slate-500 text-xs tracking-wide">
      Don't have an account? <span className="text-violet-400 hover:text-violet-300 cursor-pointer font-bold underline underline-offset-4">Register</span>
    </p>
  </div>
</motion.div>
);
};

export default LoginPage;