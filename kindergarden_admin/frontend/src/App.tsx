import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Overview } from './pages/dashboard/Overview';
import { Districts } from './pages/dashboard/Districts';
import { NutritionMenu } from './pages/dashboard/NutritionMenu';
import { RatingAudit } from './pages/dashboard/RatingAudit';
import { WarehouseCommandCenter } from './pages/dashboard/WarehouseCommandCenter';
import { MTTManagement } from './pages/dashboard/MTTManagement';
import { AIInsights } from './pages/dashboard/AIInsights';
import { FinancialAnalytics } from './pages/dashboard/FinancialAnalytics';
import { MenuStatistics } from './pages/dashboard/MenuStatistics';
import { Alerts } from './pages/dashboard/Alerts';
import { Login } from './pages/Login';
import { Loader2, Settings, ShieldCheck } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | { email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDemo = localStorage.getItem('isDemoAuth') === 'true';
    if (isDemo) {
      setUser({ email: 'm_login@admin.com' });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <Router basename="/admin">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router basename="/admin">
      <Toaster position="top-center" richColors />
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/districts" element={<Districts />} />
          <Route path="/menu" element={<NutritionMenu />} />
          <Route path="/rating" element={<RatingAudit />} />
          <Route path="/kindergartens" element={<MTTManagement />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/warehouse" element={<WarehouseCommandCenter />} />
          <Route path="/financial-stats" element={<FinancialAnalytics />} />
          <Route path="/menu-stats" element={<MenuStatistics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={
            <div className="p-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tizim sozlamalari</h2>
                <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">
                  Ushbu bo'lim hozirda ishlab chiqilmoqda.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Settings />
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <ShieldCheck />
                  </div>
                </div>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}
