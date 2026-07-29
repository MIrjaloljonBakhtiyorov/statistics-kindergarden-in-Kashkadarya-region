import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { InspectorDashboard } from '../../features/inspector/components/InspectorDashboard';
import { NewInspectionForm } from '../../features/inspector/components/NewInspectionForm';
import { InspectorCalendar } from '../../features/inspector/components/InspectorCalendar';
import { INSPECTION_CATEGORIES } from '../../features/inspector/constants/inspector.constants';
import { InspectionProvider } from '../../features/inspector/context/InspectionProvider';
import { Calendar as CalendarIcon, LayoutDashboard, History as HistoryIcon } from 'lucide-react';

const InspectorView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [audits, setAudits] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'CREATE' | 'CALENDAR'>('DASHBOARD');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/audits');
      setAudits(res.data);
    } catch (err) {
      console.error(err);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionSubmit = async (data: any) => {
    try {
      const checklistItems: any[] = [];
      let hasFail = false;

      Object.entries(data.results).forEach(([catId, questions]: [string, any]) => {
        const category = INSPECTION_CATEGORIES.find(c => c.id === catId);
        if (!category) return;

        Object.entries(questions).forEach(([qId, status]) => {
          const questionIndex = parseInt(qId) - 1;
          const questionText = category.questions[questionIndex];
          if (status === 'problem') hasFail = true;
          
          checklistItems.push({
            question: `${category.name}: ${questionText}`,
            result: status === 'normal' ? 'PASS' : status === 'problem' ? 'FAIL' : 'N/A',
            note: '',
            severity: status === 'problem' ? 'MEDIUM' : 'LOW'
          });
        });
      });

      // Special handling for food consumption if needed
      if (data.consumption && Object.keys(data.consumption).length > 0) {
        checklistItems.push({
          question: "Ovqat iste'moli nazorati (Barcha guruhlar)",
          result: 'PASS',
          note: `Ma'lumotlar kiritildi. Progress: ${data.totalProgress}%`,
          severity: 'LOW'
        });
      }

      const payload = {
        inspection_id: Date.now().toString(),
        inspection_type: 'REGULAR_AUDIT',
        overall_result: hasFail ? 'FAIL' : 'PASS',
        severity: hasFail ? 'MEDIUM' : 'LOW',
        notes: `Umumiy progress: ${data.totalProgress}%`,
        created_by: user?.full_name || 'Inspektor',
        status: 'COMPLETED',
        checklist_items: checklistItems
      };

      await apiClient.post('/audits', payload);
      await fetchAudits();
      showNotification("Hisobot muvaffaqiyatli saqlandi", "success");
    } catch (err) {
      console.error(err);
      showNotification("Hisobotni saqlashda xatolik yuz berdi", "error");
    }
  };

  const filteredAudits = selectedDate 
    ? audits.filter(a => a.created_at?.startsWith(selectedDate))
    : audits;

  return (
    <InspectionProvider>
    <div className="min-h-screen p-3 sm:p-5" style={{
      background: 'radial-gradient(circle at 8% 0%, rgba(14,165,233,0.12), transparent 28rem), radial-gradient(circle at 95% 12%, rgba(124,58,237,0.10), transparent 30rem), linear-gradient(135deg, #f8fafc 0%, #eef7ff 48%, #f7f5ff 100%)',
    }}>
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-5">
        
        {viewMode !== 'CREATE' && (
          <div className="flex flex-wrap bg-white/85 p-1.5 rounded-2xl border border-sky-100 w-full sm:w-fit gap-1.5 shadow-[0_14px_32px_rgba(14,165,233,0.09)] backdrop-blur-md">
            <button 
              onClick={() => { setViewMode('DASHBOARD'); setSelectedDate(null); }} 
              className={`flex-1 sm:flex-none px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 ${viewMode === 'DASHBOARD' && !selectedDate ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700'}`}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            <button 
              onClick={() => setViewMode('CALENDAR')} 
              className={`flex-1 sm:flex-none px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 ${viewMode === 'CALENDAR' ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700'}`}
            >
              <CalendarIcon size={14} /> Taqvim
            </button>
            <button 
              onClick={() => { setViewMode('DASHBOARD'); setSelectedDate(null); }} 
              className="flex-1 sm:flex-none px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
            >
              <HistoryIcon size={14} /> Arxiv
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {viewMode === 'CREATE' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "circOut" }}
            >
              <NewInspectionForm 
                onCancel={() => setViewMode('DASHBOARD')}
                onSubmit={handleInspectionSubmit}
              />
            </motion.div>
          ) : viewMode === 'CALENDAR' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8"
            >
              <div className="lg:col-span-8 overflow-x-auto">
                <InspectorCalendar 
                  audits={audits} 
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setViewMode('DASHBOARD');
                  }} 
                />
              </div>
              <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                <div className="bg-white/90 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-sky-100 shadow-[0_18px_42px_rgba(14,165,233,0.10)] backdrop-blur-md">
                  <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-4 sm:mb-6">Tezkor Ma'lumot</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500">Jami auditlar</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">{audits.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-600">Muvaffaqiyatli</span>
                      <span className="text-base sm:text-lg font-black text-emerald-700">{audits.filter(a => a.overall_result === 'PASS').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-red-600">Kamchiliklar</span>
                      <span className="text-base sm:text-lg font-black text-red-700">{audits.filter(a => a.overall_result !== 'PASS').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "circOut" }}
            >
              <InspectorDashboard 
                onNewInspection={() => setViewMode('CREATE')} 
                audits={filteredAudits}
              />
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="mt-6 text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  в†ђ Barcha auditlarni ko'rsatish ({selectedDate})
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </InspectionProvider>
  );
};

export default InspectorView;

