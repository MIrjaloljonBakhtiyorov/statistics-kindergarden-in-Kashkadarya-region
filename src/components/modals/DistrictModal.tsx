import React from 'react';
import { motion } from 'motion/react';
import { 
  School, Users, Activity, TrendingUp, 
  Baby, CheckCircle2, MapPin
} from 'lucide-react';

interface DistrictModalProps {
  district: {
    name: string;
    count: number;
    attendance: number;
    details?: {
      totalChildren3to7: number;
      totalMTT: number;
      totalCoveredChildren: number;
      coveragePercentage: number;
      types: { name: string; count: number; children: number }[];
    };
  } | null;
}

const DistrictModal: React.FC<DistrictModalProps> = ({ district }) => {
  if (!district) return null;

  const details = district.details;
  const sectorColor = district.name.includes('sh.') ? 'from-blue-600 to-cyan-500' : 'from-indigo-600 to-purple-500';

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-transparent pointer-events-auto"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-50 bg-white/95 backdrop-blur-3xl rounded-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/60 p-8 w-[52vw] max-h-[70vh] pointer-events-auto overflow-hidden select-none flex flex-col"
      >
        {/* Background Decor */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${sectorColor} opacity-5 rounded-full blur-[80px]`} />
        
        <div className="relative space-y-6 overflow-y-auto flex-1 custom-scrollbar pr-2">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${sectorColor} rounded-xl flex items-center justify-center text-white shadow-lg relative overflow-hidden`}>
              <Activity className="w-6 h-6 relative z-10" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-white/10 scale-150 rotate-45" 
              />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{district.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <MapPin className="w-3 h-3 text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Hududiy ko'rsatkichlar</span>
              </div>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <School className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami MTTlar</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{district.count}</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qamrov</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{district.attendance}%</p>
            </div>
          </div>

          {/* Detailed Data Section */}
          {details && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Baby className="w-3.5 h-3.5 text-indigo-500" />
                  Demografik ma'lumot
                </h4>
              </div>
              
              <div className="bg-indigo-50/30 p-5 rounded-[1.5rem] border border-indigo-100/50 space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">3-7 yoshli bolalar</span>
                   <span className="text-sm font-black text-indigo-600">{details.totalChildren3to7.toLocaleString()}</span>
                </div>
                <div className="h-px bg-indigo-100/50" />
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Qamrab olingan</span>
                   <span className="text-sm font-black text-emerald-600">{details.totalCoveredChildren.toLocaleString()}</span>
                </div>
              </div>

              {/* Compact MTT Types */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">MTT turlari</h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {details.types.slice(0, 3).map((type, idx) => (
                    <div key={idx} className="flex justify-between items-center px-5 py-2.5 bg-white rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-600 uppercase truncate max-w-[150px]">{type.name}</span>
                      <span className="text-[10px] font-black text-slate-900">{type.count} ta</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase">Ma'lumotlar yangilangan</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DistrictModal;
