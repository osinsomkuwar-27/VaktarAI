import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RotateCw, ZoomIn, RefreshCcw, Download, Sparkles, History as HistoryIcon } from 'lucide-react';
import LoadingBar from '../components/LoadingBar';
import { mockCreations } from '../data/mockData';

const CreatePage = ({ showToast }) => {
const [isGenerating, setIsGenerating] = useState(false);
const [progress, setProgress] = useState(0);
const [status, setStatus] = useState("Ready");
const [previewAvatar, setPreviewAvatar] = useState(null);
const [rotation, setRotation] = useState(0);
const [isZoomed, setIsZoomed] = useState(false);

// Form State
const [style, setStyle] = useState('Realistic');
const [gender, setGender] = useState('Male');
const [trait, setTrait] = useState('Young');
const [outfit, setOutfit] = useState('Casual');
const [prompt, setPrompt] = useState('');

const handleGenerate = () => {
if (isGenerating) return;
setIsGenerating(true);
setPreviewAvatar(null);
setProgress(0);

const statuses = [
  { p: 10, s: "Initializing..." },
  { p: 40, s: "Generating face..." },
  { p: 70, s: "Applying style..." },
  { p: 90, s: "Finalizing..." },
  { p: 100, s: "Done!" }
];

statuses.forEach((step, index) => {
  setTimeout(() => {
    setProgress(step.p);
    setStatus(step.s);
    if (step.p === 100) {
      setTimeout(() => {
        setPreviewAvatar(`https://picsum.photos/seed/${Math.random()}/600/600`);
        setIsGenerating(false);
        showToast("Avatar generated successfully!");
      }, 500);
    }
  }, (index + 1) * 600);
});
};

const ToggleGroup = ({ label, options, activeValue, onChange }) => (
<div className="mb-6">
<label className="text-[10px] font-orbitron tracking-[0.2em] text-slate-500 mb-3 block uppercase">{label}</label>
<div className="flex flex-wrap gap-2">
{options.map((opt) => (
<button
key={opt}
onClick={() => onChange(opt)}
className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border ${activeValue === opt  ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]'  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
>
{opt}
</button>
))}
</div>
</div>
);

return (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[calc(100vh-100px)]"
>
{/* Left Panel - Controls */}
<div className="lg:col-span-3 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
<div className="glass-card p-6 rounded-3xl">
<ToggleGroup label="Style" options={['Realistic', 'Anime', 'Cartoon']} activeValue={style} onChange={setStyle} />
<ToggleGroup label="Gender" options={['Male', 'Female', 'Non-binary']} activeValue={gender} onChange={setGender} />
<ToggleGroup label="Traits" options={['Young', 'Middle', 'Senior']} activeValue={trait} onChange={setTrait} />
<ToggleGroup label="Outfit" options={['Casual', 'Formal', 'Fantasy', 'Sci-Fi']} activeValue={outfit} onChange={setOutfit} />

      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <label className="text-[10px] font-orbitron tracking-[0.2em] text-slate-500 uppercase">Prompt</label>
          <span className={`text-[10px] ${prompt.length > 180 ? 'text-red-400' : 'text-slate-500'}`}>{prompt.length}/200</span>
        </div>
        <textarea 
          maxLength={200}
          placeholder="Describe your Avatar..."
          className="w-full h-32 p-4 rounded-2xl input-field text-sm resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="btn-gradient w-full py-4 rounded-full font-orbitron text-xs font-bold tracking-widest flex items-center justify-center gap-2 overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="loading" 
              initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="animate-spin" size={16} />
              GENERATING...
            </motion.div>
          ) : (
            <motion.div 
              key="idle" 
              initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
              className="flex items-center gap-2"
            >
              <Wand2 size={16} />
              GENERATE
            </motion.div>
          )}
        </AnimatePresence>
        {isGenerating && (
          <motion.div 
            className="absolute inset-0 bg-white/10"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </button>
    </div>
  </div>

  {/* Center Panel - Preview */}
  <div className="lg:col-span-9 flex flex-col gap-6">
    <div className="glass-card flex-grow rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[500px]">
      {/* Dashboard UI elements */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-orbitron text-cyan-400/50 uppercase tracking-widest">
        <Sparkles size={12} /> Live Preview System v2.0
      </div>
      
      <AnimatePresence mode="wait">
        {!previewAvatar && !isGenerating ? (
          <motion.div 
            key="placeholder"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-slate-600 border-2 border-dashed border-white/5 rounded-3xl p-20 w-full h-full justify-center"
          >
            <div className="p-6 rounded-full bg-white/5">
              <Wand2 size={48} />
            </div>
            <p className="font-orbitron tracking-widest text-sm">Your Avatar Will Appear Here</p>
          </motion.div>
        ) : isGenerating ? (
          <motion.div key="loading-state" className="w-full max-w-md px-8 text-center">
            <LoadingBar progress={progress} status={status} />
          </motion.div>
        ) : (
          <motion.div 
            key="avatar-image"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              scale: isZoomed ? 1.2 : 1, 
              filter: 'blur(0px)',
              rotate: rotation 
            }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 w-full max-w-sm aspect-square"
          >
            <img src={previewAvatar} alt="Generated Avatar" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Row */}
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        {[
          { icon: RotateCw, label: 'ROTATE', action: () => setRotation(r => r + 90) },
          { icon: ZoomIn, label: 'ZOOM', action: () => setIsZoomed(!isZoomed) },
          { icon: RefreshCcw, label: 'RESET', action: () => { setRotation(0); setIsZoomed(false); } },
          { icon: Download, label: 'DOWNLOAD', action: () => showToast("Preparing download...") }
        ].map((btn) => (
          <button 
            key={btn.label}
            onClick={btn.action}
            disabled={!previewAvatar}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-orbitron tracking-widest hover:bg-violet-600/20 hover:border-violet-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <btn.icon size={14} />
            {btn.label}
          </button>
        ))}
      </div>
    </div>

    {/* Bottom Strip - Recent */}
    <div className="glass-card p-6 rounded-3xl">
      <div className="flex items-center gap-2 mb-4">
        <HistoryIcon size={14} className="text-slate-500" />
        <h3 className="text-[10px] font-orbitron tracking-widest text-slate-500 uppercase">Recent Creations</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {mockCreations.slice(0, 5).map((item, idx) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -5 }}
            onClick={() => setPreviewAvatar(item.img)}
            className="flex-shrink-0 w-32 cursor-pointer group"
          >
            <div className="aspect-square rounded-xl overflow-hidden border border-white/5 group-hover:border-violet-500/50 transition-colors mb-2">
              <img src={item.img} alt="Creation" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
            </div>
            <p className="text-[9px] text-center text-slate-500 font-medium">{item.date}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</motion.div>
);
};

export default CreatePage;