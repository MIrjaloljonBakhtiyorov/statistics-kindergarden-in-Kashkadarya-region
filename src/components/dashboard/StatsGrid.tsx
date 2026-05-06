import React from 'react';
import { stats } from '../../constants';
import { motion } from 'motion/react';

const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {stats.map((s, index) => (
        <motion.div 
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -8 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all duration-500 flex flex-col group relative overflow-hidden h-full min-h-[160px]"
        >
          {/* Subtle Background Icon */}
          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
             <s.icon className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <s.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${s.bg} ring-4 ring-slate-50`} />
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-2 h-8 flex items-center">
                {s.label}
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
                  {s.value.split('%')[0]}
                </p>
                {s.value.includes('%') && (
                  <span className="text-sm font-black text-indigo-500">%</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
