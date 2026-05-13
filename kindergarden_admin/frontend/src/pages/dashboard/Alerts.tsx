import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Filter, CheckCircle2, 
  AlertCircle, AlertTriangle, RefreshCw, 
  User, Brain, Calendar, Clock, 
  ChevronRight, MoreVertical, ShieldCheck,
  PlusCircle, LayoutGrid, FileText, ShoppingCart
} from 'lucide-react';
import { clsx } from 'clsx';

// Types
type AlertStatus = 'success' | 'update' | 'warning' | 'error' | 'ai';

interface Alert {
  id: string;
  status: AlertStatus;
  title: string;
  context: string;
  actor: string;
  time: string;
  icon?: any;
}

// Mock Data
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    status: 'ai',
    title: 'Davomatda shubhali o‘zgarish aniqlandi',
    context: '5-sonli MTT — Qarshi tumani',
    actor: 'AI tizim',
    time: 'Hozir',
    icon: Brain
  },
  {
    id: '2',
    status: 'error',
    title: 'Qoidabuzarlik aniqlangan',
    context: 'Gigiyena buzilgan — 12-sonli MTT',
    actor: 'AI tizim',
    time: 'Hozir',
    icon: AlertCircle
  },
  {
    id: '3',
    status: 'warning',
    title: 'Mahsulot yetishmayapti',
    context: 'Kartoshka — Kasbi tumani',
    actor: 'System',
    time: '09:45',
    icon: ShoppingCart
  },
  {
    id: '4',
    status: 'success',
    title: 'Bola qo‘shildi',
    context: '12-sonli MTT — Qarshi tumani',
    actor: 'Operator',
    time: '09:12',
    icon: PlusCircle
  },
  {
    id: '5',
    status: 'update',
    title: 'Taomnoma yangilandi',
    context: 'Nonushta menyusi',
    actor: 'Admin',
    time: '08:30',
    icon: FileText
  },
  {
    id: '6',
    status: 'success',
    title: 'Bog‘cha yaratildi',
    context: 'Yangi Hayot MTT',
    actor: 'Admin',
    time: 'Kecha',
    icon: LayoutGrid
  },
  {
    id: '7',
    status: 'ai',
    title: 'Mahsulot sarfi normadan yuqori',
    context: 'Go\'sht mahsuloti — 3-sonli MTT',
    actor: 'AI tizim',
    time: 'Kecha',
    icon: Brain
  }
];

const STATUS_CONFIG = {
  success: {
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  },
  update: {
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    dot: 'bg-blue-500',
    icon: RefreshCw
  },
  warning: {
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    dot: 'bg-amber-500',
    icon: AlertTriangle
  },
  error: {
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    dot: 'bg-rose-500',
    icon: AlertCircle
  },
  ai: {
    color: 'text-indigo-400',
    bg: 'bg-slate-900',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-500',
    icon: Brain,
    special: 'shadow-[0_0_20px_rgba(99,102,241,0.2)] border-indigo-500/50'
  }
};

export const Alerts = () => {
  const [filter, setFilter] = useState('Barchasi');
  const [search, setSearch] = useState('');

  const filteredAlerts = MOCK_ALERTS.filter(alert => {
    const matchesFilter = 
      filter === 'Barchasi' || 
      (filter === 'Faqat xatoliklar' && alert.status === 'error') ||
      (filter === 'AI alertlar' && alert.status === 'ai') ||
      (filter === 'Faqat yangilar' && alert.time === 'Hozir');
    
    const matchesSearch = 
      alert.title.toLowerCase().includes(search.toLowerCase()) || 
      alert.context.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 bg-slate-50 min-h-screen text-slate-900">
      
      {/* 1. HEADER DESIGN */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-white/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white shadow-sm sticky top-0 z-30 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Alertlar va ogohlantirishlar</h1>
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Real-time</span>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500">
            Tizimda sodir bo‘layotgan barcha harakatlarni real-time kuzatish
          </p>
        </div>

        {/* 4. FILTER & CONTROL PANEL */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors sm:w-4 sm:h-4" size={14} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold w-full sm:w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {['Barchasi', 'Faqat xatoliklar', 'Faqat yangilar', 'AI alertlar'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all whitespace-nowrap",
                  filter === f ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT — ACTIVITY FEED */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 ml-[11px]" />

          <div className="space-y-6 relative">
            <AnimatePresence mode='popLayout'>
              {filteredAlerts.map((alert, idx) => {
                const config = STATUS_CONFIG[alert.status];
                const Icon = alert.icon || config.icon;
                const isAI = alert.status === 'ai';

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-6 group"
                  >
                    {/* Time Marker */}
                    <div className="flex flex-col items-center">
                      <div className={clsx(
                        "w-6 h-6 rounded-full border-4 border-slate-50 relative z-10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                        config.dot
                      )}>
                        {isAI && <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />}
                      </div>
                      <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                        {alert.time}
                      </div>
                    </div>

                    {/* 3. ALERT CARD UI DESIGN */}
                    <div className={clsx(
                      "flex-1 p-5 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
                      isAI ? config.bg + ' ' + config.special : "bg-white border-slate-100 shadow-sm"
                    )}>
                      {isAI && (
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                          <Brain size={80} />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                            isAI ? "bg-indigo-500/20 text-indigo-400" : config.bg + ' ' + config.color
                          )}>
                            <Icon size={22} />
                          </div>
                          <div>
                            <h3 className={clsx(
                              "text-sm font-black mb-1",
                              isAI ? "text-white" : "text-slate-900"
                            )}>
                              {alert.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={clsx(
                                "text-[11px] font-bold",
                                isAI ? "text-indigo-300" : "text-slate-500"
                              )}>
                                {alert.context}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <div className={clsx(
                                  "w-5 h-5 rounded-full flex items-center justify-center",
                                  isAI ? "bg-white/10" : "bg-slate-100"
                                )}>
                                  <User size={10} className={isAI ? "text-indigo-300" : "text-slate-500"} />
                                </div>
                                <span className={clsx(
                                  "text-[10px] font-black uppercase tracking-wider",
                                  isAI ? "text-slate-400" : "text-slate-500"
                                )}>
                                  {alert.actor}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={10} />
                                <span className="text-[10px] font-bold">{alert.time === 'Hozir' ? 'Hozirgi vaqtda' : alert.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button className={clsx(
                          "p-2 rounded-xl transition-colors",
                          isAI ? "text-slate-500 hover:bg-white/10" : "text-slate-300 hover:bg-slate-50 hover:text-slate-600"
                        )}>
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {/* AI Actionable Insight (Extra for AI alerts) */}
                      {isAI && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <ShieldCheck size={14} className="text-emerald-400" />
                             <span className="text-[10px] font-bold text-slate-400 italic">AI tavsiyasi: Monitoringni kuchaytiring</span>
                          </div>
                          <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                            Batafsil
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredAlerts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-20 text-center"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-slate-300" size={32} />
                </div>
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-sm">Hozircha alertlar yo‘q</h3>
                <p className="text-xs text-slate-400 mt-2 font-bold">Qidiruv yoki filtrni o‘zgartirib ko‘ring</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* 7. AUDIT & HISTORY MODE - Load More */}
        <div className="mt-12 text-center">
           <button className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 mx-auto">
             <Calendar size={14} /> Tarixni yuklash
           </button>
        </div>
      </div>
    </div>
  );
};
