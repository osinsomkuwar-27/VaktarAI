import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Calendar } from 'lucide-react';

const Modal = ({ isOpen, onClose, data }) => {
if (!data) return null;

return (
<AnimatePresence>
{isOpen && (
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="absolute inset-0 bg-black/90 backdrop-blur-sm"
/>
<motion.div
initial={{ opacity: 0, scale: 0.9, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.9, y: 20 }}
className="relative w-full max-w-2xl glass-card rounded-2xl overflow-hidden shadow-2xl"
>
<button
onClick={onClose}
className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors"
>
<X size={20} />
</button>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 aspect-square">
            <img src={data.img} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-orbitron text-2xl font-bold mb-2">Avatar Preview</h3>
              <div className="flex items-center gap-2 text-slate-400 mb-6">
                <Calendar size={14} />
                <span className="text-sm">{data.date}</span>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Style</p>
                  <p className="text-sm text-cyan-400">{data.style}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm text-green-400">High Definition Ready</p>
                </div>
              </div>
            </div>

            <button className="btn-gradient w-full py-3 rounded-xl flex items-center justify-center gap-2 mt-8 font-bold">
              <Download size={18} />
              DOWNLOAD 4K
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
);
};

export default Modal;