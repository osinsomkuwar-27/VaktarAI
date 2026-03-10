import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Share2, Heart, MessageSquare, ChevronDown } from 'lucide-react';
import { stats, languages, tones } from '../data/mockData';

const Counter = ({ value, prefix = "", suffix = "" }) => {
const [count, setCount] = useState(0);

useEffect(() => {
let start = 0;
const end = parseInt(value);
if (start === end) return;

let totalMiliseconds = 1500;
let incrementTime = totalMiliseconds / end;

let timer = setInterval(() => {
  start += 1;
  setCount(start);
  if (start === end) clearInterval(timer);
}, incrementTime);

return () => clearInterval(timer);
}, [value]);

return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const FeaturesPage = ({ showToast }) => {
const [isPlaying, setIsPlaying] = useState(false);
const [progress, setProgress] = useState(0);
const [liked, setLiked] = useState(false);
const [selectedTone, setSelectedTone] = useState('Neutral');

useEffect(() => {
let interval;
if (isPlaying) {
interval = setInterval(() => {
setProgress(p => (p >= 100 ? 0 : p + 0.5));
}, 50);
}
return () => clearInterval(interval);
}, [isPlaying]);

return (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8"
>
{/* Stats Row */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{stats.map((stat, idx) => (
<motion.div
key={stat.label}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: idx * 0.1 }}
className="glass-card p-6 rounded-2xl border-l-2 border-l-cyan-500/50"
>
<p className="text-[10px] font-orbitron text-slate-500 tracking-widest uppercase mb-1">{stat.label}</p>
<h4 className="text-2xl font-bold text-cyan-400 font-orbitron">
<Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
</h4>
</motion.div>
))}
</div>

  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Left column — Video Player */}
    <div className="lg:col-span-7 flex flex-col gap-6">
      <div className="glass-card rounded-3xl overflow-hidden aspect-video relative group">
        {/* Fake Video Player BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
           <img 
             src="[https://picsum.photos/seed/video/800/450](https://picsum.photos/seed/video/800/450)" 
             alt="Preview" 
             className={`w-full h-full object-cover transition-opacity duration-1000 ${isPlaying ? 'opacity-80' : 'opacity-40'}`} 
           />
           <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="z-10 w-20 h-20 rounded-full bg-violet-600/80 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm"
           >
             {isPlaying ? <Pause size={32} /> : <Play size={32} fill="white" className="ml-1" />}
           </motion.button>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="h-1 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
            <motion.div 
              className="h-full bg-cyan-400"
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button onClick={() => setLiked(!liked)} className="text-slate-300 hover:text-white transition-colors">
                <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}}>
                  <Heart size={20} fill={liked ? "#ef4444" : "none"} className={liked ? "text-red-500" : ""} />
                </motion.div>
              </button>
              <button className="text-slate-300 hover:text-white transition-colors"><Download size={20} /></button>
              <button className="text-slate-300 hover:text-white transition-colors"><Share2 size={20} /></button>
            </div>
            <span className="text-[10px] font-orbitron text-slate-400">00:{Math.floor(progress / 3).toString().padStart(2, '0')} / 00:30</span>
          </div>
        </div>
      </div>
    </div>

    {/* Right column — Text to Avatar Panel */}
    <div className="lg:col-span-5">
      <div className="glass-card p-8 rounded-3xl h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={18} className="text-violet-500" />
          <h3 className="font-orbitron text-lg font-bold">Text to Avatar</h3>
        </div>

        <div className="flex-grow space-y-6">
          <div>
            <label className="text-[10px] font-orbitron text-slate-500 tracking-widest uppercase block mb-3">Your Message</label>
            <textarea 
              placeholder="Enter the script for your avatar..."
              className="w-full h-40 p-4 rounded-2xl input-field text-sm resize-none"
            />
            <p className="text-right text-[10px] text-slate-500 mt-2">0/300 characters</p>
          </div>

          <div>
            <label className="text-[10px] font-orbitron text-slate-500 tracking-widest uppercase block mb-3">Language</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50">
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-orbitron text-slate-500 tracking-widest uppercase block mb-3">Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map(tone => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`py-2 px-4 rounded-xl text-xs transition-all border ${
                    selectedTone === tone 
                    ? 'bg-violet-600/20 border-violet-500/50 text-white' 
                    : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => showToast("✓ Generation started! Check History for your video.")}
          className="btn-gradient w-full py-4 rounded-full font-orbitron text-xs font-bold tracking-widest mt-8"
        >
          GENERATE FROM TEXT
        </button>
      </div>
    </div>
  </div>
</motion.div>
);
};

export default FeaturesPage;