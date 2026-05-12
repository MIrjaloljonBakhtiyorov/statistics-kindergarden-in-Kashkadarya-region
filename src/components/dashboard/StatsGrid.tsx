import React from 'react';
import { stats } from '../../constants';
import { motion } from 'motion/react';

const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      {stats.map((s, index) => (
        <motion.div 
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 transition-all duration-500 flex flex-col group relative overflow-hidden h-full min-h-[120px]"
        >
          {/* Subtle Background Icon */}
          <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
             <s.icon className="w-20 h-20" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                <s.icon className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>

            <div>
              <p className="text-[14px] font-semibold text-slate-500 uppercase tracking-wide leading-snug mb-2">
                {s.label}
              </p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-[30px] font-bold text-[#003580] tracking-tight">
                  {s.value.split('%')[0]}
                </p>
                {s.value.includes('%') && (
                  <span className="text-[30px] font-bold text-[#003580]">%</span>
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
