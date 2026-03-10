import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, ExternalLink, Calendar, Search, Filter } from 'lucide-react';
import { mockCreations } from '../data/mockData';
import Modal from '../components/Modal';

const HistoryPage = ({ showToast }) => {
const [filter, setFilter] = useState('All');
const [selectedAvatar, setSelectedAvatar] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const filters = ['All', 'This Week', 'This Month'];

const containerVariants = {
hidden: { opacity: 0 },
show: {
opacity: 1,
transition: {
staggerChildren: 0.05
}
}
};

const itemVariants = {
hidden: { opacity: 0, y: 20 },
show: { opacity: 1, y: 0 }
};

const handleOpenModal = (item) => {
setSelectedAvatar(item);
setIsModalOpen(true);
};

return (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="pt-24 pb-12 px-6 max-w-7xl mx-auto"
>
{/* Header & Filters */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div>
<h1 className="font-orbitron text-4xl font-black tracking-tighter text-white mb-2">GALLERY</h1>
<p className="text-slate-500 text-sm">Review and download your AI-generated collection.</p>
</div>

    <div className="flex items-center gap-2 p-1.5 glass-card rounded-2xl w-fit">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-6 py-2 rounded-xl text-xs font-orbitron tracking-widest transition-all relative ${
            filter === f ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {f}
          {filter === f && (
            <motion.div 
              layoutId="filter-bg"
              className="absolute inset-0 bg-violet-600/20 border border-violet-500/30 rounded-xl -z-10"
            />
          )}
        </button>
      ))}
    </div>
  </div>

  {/* Gallery Grid */}
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="show"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
  >
    {mockCreations.map((item) => (
      <motion.div
        key={item.id}
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
        className="glass-card group rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => handleOpenModal(item)}
      >
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={item.img} 
            alt="Avatar" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); showToast("Download started..."); }}
              className="p-3 bg-violet-600 rounded-full text-white hover:bg-violet-500 transition-colors"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); showToast("Item deleted", "error"); }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-orbitron text-cyan-400">
            {item.style}
          </div>
        </div>

        <div className="p-4 flex items-center justify-between border-t border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={12} />
            <span className="text-[10px] font-medium">{item.date}</span>
          </div>
          <ExternalLink size={12} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
        </div>
      </motion.div>
    ))}
  </motion.div>

  {/* Modal / Lightbox */}
  <Modal 
    isOpen={isModalOpen} 
    onClose={() => setIsModalOpen(false)} 
    data={selectedAvatar} 
  />
</motion.div>
);
};

export default HistoryPage;