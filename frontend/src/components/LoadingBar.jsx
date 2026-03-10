import React from 'react';
import { motion } from 'framer-motion';

const LoadingBar = ({ progress, status }) => {
return (
<div className="w-full space-y-2">
<div className="flex justify-between text-xs font-orbitron text-slate-400 tracking-wider">
<span className="animate-pulse">{status}</span>
<span>{progress}%</span>
</div>
<div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
<motion.div
className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
initial={{ width: 0 }}
animate={{ width: `${progress}%` }}
transition={{ duration: 0.5 }}
/>
</div>
</div>
);
};

export default LoadingBar;