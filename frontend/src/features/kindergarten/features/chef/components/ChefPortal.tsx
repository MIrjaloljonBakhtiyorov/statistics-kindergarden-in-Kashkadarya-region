import React, { useEffect, useState } from 'react';
import { Clock, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { ChefSanitaryCheck } from './ChefSanitaryCheck';
import { ChefMenuDashboard } from './ChefMenuDashboard';
import { apiClient } from '@/shared/api';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

export const ChefPortal = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [checkpointStatus, setCheckpointStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCheckpointStatus = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/chef/sanitary-check/current?chef_id=${user.id}`);
      setCheckpointStatus(res.data);
    } catch (error) {
      showNotification('Sanitariya checkpoint holatini yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpointStatus();
    const interval = window.setInterval(fetchCheckpointStatus, 30000);
    return () => window.clearInterval(interval);
  }, [user?.id]);

  if (loading && !checkpointStatus) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center text-brand-primary font-black uppercase tracking-widest">
        <Loader2 className="animate-spin mr-3" size={20} /> Sanitariya checkpointi tekshirilmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {checkpointStatus?.approved ? (
        <ChefMenuDashboard />
      ) : checkpointStatus?.pending_nurse ? (
        <WaitingForNurseApproval status={checkpointStatus} onRefresh={fetchCheckpointStatus} />
      ) : (
        <ChefSanitaryCheck onComplete={fetchCheckpointStatus} />
      )}
    </div>
  );
};

const WaitingForNurseApproval = ({ status, onRefresh }: { status: any; onRefresh: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="bg-white border border-brand-border rounded-[2rem] shadow-sm max-w-xl w-full p-8 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
        <ShieldCheck size={30} />
      </div>
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Hamshira tasdig'i kutilmoqda</p>
      <h2 className="text-2xl font-black text-brand-depth mt-2">Sanitariya checkpointi yuborildi</h2>
      <p className="text-sm font-bold text-brand-slate mt-3 leading-relaxed">
        {status?.period_label || '6 soatlik'} checkpoint hamshiraga yuborildi. Hamshira tasdiqlagandan keyin bugungi ovqatlar paneli ochiladi.
      </p>
      <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-brand-border flex items-center justify-center gap-3">
        <Clock size={18} className="text-brand-primary" />
        <span className="text-sm font-black text-brand-depth">{status?.period_label || 'Joriy interval'}</span>
      </div>
      <button
        onClick={onRefresh}
        className="mt-6 w-full py-4 rounded-xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <RefreshCw size={16} /> Holatni yangilash
      </button>
    </div>
  </div>
);

