import React from 'react';
import { X, Info, CheckCircle2, Users, School } from 'lucide-react';
import { kindergartenTypes, COLORS } from '../../constants';
import { motion, AnimatePresence } from 'motion/react';

interface MTTDetailModalProps {
  selectedMTTType: any;
  setSelectedMTTType: (type: any) => void;
  modalRef: React.RefObject<HTMLDivElement>;
}

const MTTDetailModal: React.FC<MTTDetailModalProps> = ({ selectedMTTType, setSelectedMTTType, modalRef }) => {
  if (!selectedMTTType) return null;

  const typeIndex = kindergartenTypes.findIndex(t => t.name === selectedMTTType.name);
  const typeColor = COLORS[typeIndex % COLORS.length];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 md:p-12 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedMTTType(null)}
          className="absolute inset-0 pointer-events-auto cursor-pointer"
        />
        <motion.div 
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-[52vw] max-h-[70vh] rounded-[1%] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden pointer-events-auto border border-white/20 flex flex-col"
        >
          <div className="h-40 shrink-0 relative flex items-end p-8 lg:p-10 overflow-hidden" style={{ background: typeColor }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
              <button 
                onClick={() => setSelectedMTTType(null)}
                className="bg-white/20 hover:bg-white/40 p-3 rounded-xl text-white transition-all active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none">{selectedMTTType.name}</h3>
              <p className="text-white/80 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Batafsil ma'lumot va tahlil</p>
            </div>
          </div>
          
          <div className="p-8 lg:p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between group hover:border-indigo-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 mb-4 shadow-sm group-hover:text-indigo-500 transition-colors">
                   <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Muassasalar</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{selectedMTTType.count}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between group hover:border-indigo-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 mb-4 shadow-sm group-hover:text-indigo-500 transition-colors">
                   <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarbiyalanuvchilar</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{selectedMTTType.children.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Tashkilot Tavsifi
              </h4>
              <p className="text-slate-500 leading-relaxed font-bold text-sm bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">
                "{selectedMTTType.description}"
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Asosiy Ko'rsatkichlar
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {selectedMTTType.features.map((feature: string, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-150" style={{ backgroundColor: typeColor }}></div>
                    <span className="font-bold text-slate-600 text-xs uppercase tracking-tight">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setSelectedMTTType(null)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
            >
              <CheckCircle2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Tushunarli
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MTTDetailModal;
