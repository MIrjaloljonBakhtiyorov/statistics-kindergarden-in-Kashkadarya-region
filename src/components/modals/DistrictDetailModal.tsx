import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, School, Users, Baby, TrendingUp, CheckCircle2, 
  MapPin, BarChart3, AlertCircle,
  LayoutGrid, Target, Zap
} from 'lucide-react';
import { kindergartenImages } from '../../constants';

type DistrictTypeRow = {
  name: string;
  count: number;
  children: number;
};

type DistrictDetails = {
  totalChildren3to7: number;
  totalMTT: number;
  totalCoveredChildren: number;
  coveragePercentage: number;
  types: DistrictTypeRow[];
};

interface DistrictDetailModalProps {
  district: any;
  onClose: () => void;
}

const DistrictDetailModal: React.FC<DistrictDetailModalProps> = ({ district, onClose }) => {
  const hasDetails = !!district?.details;
  const details = district?.details || {
    totalChildren3to7: 0,
    totalMTT: district?.count || 0,
    totalCoveredChildren: 0,
    coveragePercentage: district?.attendance || 0,
    types: []
  };
  
  const districtImage = kindergartenImages[Math.floor(Math.random() * kindergartenImages.length)].url;

  return (
    <AnimatePresence>
      {district && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-transparent pointer-events-auto cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="relative bg-white w-[52vw] h-[70vh] rounded-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col md:flex-row pointer-events-auto"
          >
            {/* LEFT SIDEBAR: Visual Identity & Key Stats */}
            <div className="md:w-[30%] relative bg-slate-900 text-white flex flex-col overflow-hidden shrink-0">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img src={districtImage} alt="" className="w-full h-full object-cover opacity-30 scale-110 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/40 via-slate-900/90 to-slate-900" />
              </div>

              <div className="relative z-10 p-6 lg:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <button 
                    onClick={onClose}
                    className="mb-8 bg-white/10 hover:bg-white/20 p-3 rounded-xl text-white transition-all active:scale-90 flex items-center gap-2 group"
                  >
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Yopish</span>
                  </button>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-indigo-500 rounded-full" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400">Statistik Dashboard</span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase leading-[0.9] mb-4">
                      {district.name.split(' ').map((word: string, i: number) => (
                        <span key={i} className="block">{word}</span>
                      ))}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 bg-white/5 w-fit px-3 py-1.5 rounded-lg backdrop-blur-md">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Qashqadaryo</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Metrics */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Qamrov</span>
                      <span className="text-xl font-black text-indigo-400">{details.coveragePercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${details.coveragePercentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                      <p className="text-[7px] font-black text-slate-500 uppercase mb-1">Bolalar</p>
                      <p className="text-sm font-black text-white">{details.totalChildren3to7.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                      <p className="text-[7px] font-black text-slate-500 uppercase mb-1">MTTlar</p>
                      <p className="text-sm font-black text-white">{details.totalMTT}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT: Detailed Analysis Sections */}
            <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
              {/* Sub-header Navigation-like Info */}
              <div className="p-6 lg:p-8 flex justify-between items-center bg-white border-b border-slate-100 relative z-20">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Batafsil Tahlil</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Hududiy kengaytirilgan hisobotlar</p>
                    </div>
                 </div>
                 <div className="hidden lg:flex items-center gap-4">
                   <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                     <Zap className="w-3.5 h-3.5" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-nowrap">Jonli Ma'lumot</span>
                   </div>
                 </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-12">
                  
                  {hasDetails ? (
                    <>
                      {/* SECTION 1: Strategic Targets */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4" />
                          </div>
                          <h5 className="text-base font-black text-slate-900 uppercase tracking-tighter">Asosiy Ko'rsatkichlar</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          {[
                            { label: '3-7 Yoshli Bolalar', value: details.totalChildren3to7, icon: Baby, color: 'text-stat-blue', bg: 'bg-blue-50' },
                            { label: 'Qamrab Olingan', value: details.totalCoveredChildren, icon: Users, color: 'text-stat-blue', bg: 'bg-emerald-50' },
                            { label: 'Muassasalar', value: details.totalMTT, icon: School, color: 'text-stat-blue', bg: 'bg-purple-50' }
                          ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
                              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-5 h-5" />
                              </div>
                              <p className="text-2xl font-black text-[#003580] tracking-tighter mb-1">
                                {stat.value.toLocaleString()} <span className="text-[14px] font-black">nafar</span>
                              </p>
                              <p className="text-[9px] font-bold text-black uppercase tracking-widest">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* SECTION 2: Organizational Structure */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                            <LayoutGrid className="w-4 h-4" />
                          </div>
                          <h5 className="text-base font-black text-slate-900 uppercase tracking-tighter">Tashkiliy Tuzilma</h5>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                             <div className="col-span-6">MTT Turi</div>
                             <div className="col-span-3 text-center">Soni</div>
                             <div className="col-span-3 text-right">Bolalar</div>
                          </div>
                          {details.types.map((type: any, i: number) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="grid grid-cols-12 items-center p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group"
                            >
                              <div className="col-span-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                  <School className="w-4.5 h-4.5" />
                                </div>
                                <span className="font-black text-slate-700 text-xs uppercase tracking-tight">{type.name}</span>
                              </div>
                              <div className="col-span-3 text-center font-black text-slate-900 text-base">{type.count}</div>
                              <div className="col-span-3 text-right font-black text-indigo-600 text-base">{type.children.toLocaleString()}</div>
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                       <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                          <AlertCircle className="w-10 h-10" />
                       </div>
                       <h5 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">Ma'lumotlar To'ldirilmoqda</h5>
                       <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">Ushbu hudud bo'yicha ma'lumotlar yaqin orada kiritiladi.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Final Confirmation Button */}
              <div className="p-6 lg:p-8 bg-white border-t border-slate-100 flex justify-center">
                 <button 
                  onClick={onClose}
                  className="w-full max-w-sm py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Tasdiqlash
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DistrictDetailModal;
