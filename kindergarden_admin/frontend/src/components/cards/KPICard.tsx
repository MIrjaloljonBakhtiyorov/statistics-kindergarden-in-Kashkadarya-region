import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'slate';
  description?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  red: 'bg-rose-50 text-rose-600 border-rose-100',
  yellow: 'bg-amber-50 text-amber-600 border-amber-100',
  purple: 'bg-violet-50 text-violet-600 border-violet-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-100',
};

const iconBgMap = {
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  red: 'bg-rose-600',
  yellow: 'bg-amber-600',
  purple: 'bg-violet-600',
  slate: 'bg-slate-600',
};

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  description 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={clsx(
        "p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between h-full transition-all duration-300"
      )}
    >
      <div>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {trend && (
            <span className={clsx(
              "text-[10px] font-bold px-1.5 py-0.5 rounded",
              trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend.isUp ? '+' : '-'}{trend.value}%
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
        <div 
          className={clsx("h-full transition-all duration-500", iconBgMap[color])}
          style={{ width: `${Math.min(100, parseInt(value.toString().replace(/[^0-9.]/g, '')) || 75)}%` }}
        ></div>
      </div>
    </motion.div>
  );
};
