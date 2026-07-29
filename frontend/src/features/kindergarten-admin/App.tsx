import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

const Overview = lazy(() => import('./pages/dashboard/Overview').then((module) => ({ default: module.Overview })));
const Districts = lazy(() => import('./pages/dashboard/Districts').then((module) => ({ default: module.Districts })));
const NutritionMenu = lazy(() => import('./pages/dashboard/NutritionMenu').then((module) => ({ default: module.NutritionMenu })));
const AqlvoyChefMenu = lazy(() => import('./pages/dashboard/AqlvoyChefMenu').then((module) => ({ default: module.AqlvoyChefMenu })));
const RatingAudit = lazy(() => import('./pages/dashboard/RatingAudit').then((module) => ({ default: module.RatingAudit })));
const WarehouseCommandCenter = lazy(() => import('./pages/dashboard/WarehouseCommandCenter').then((module) => ({ default: module.WarehouseCommandCenter })));
const MedicalStockReserve = lazy(() => import('./pages/dashboard/MedicalStockReserve').then((module) => ({ default: module.MedicalStockReserve })));
const MTTManagement = lazy(() => import('./pages/dashboard/MTTManagement').then((module) => ({ default: module.MTTManagement })));
const KindergartenInspection = lazy(() => import('./pages/dashboard/KindergartenInspection').then((module) => ({ default: module.KindergartenInspection })));
const AIInsights = lazy(() => import('./pages/dashboard/AIInsights').then((module) => ({ default: module.AIInsights })));
const FinancialAnalytics = lazy(() => import('./pages/dashboard/FinancialAnalytics').then((module) => ({ default: module.FinancialAnalytics })));
const MenuStatistics = lazy(() => import('./pages/dashboard/MenuStatistics').then((module) => ({ default: module.MenuStatistics })));
const KindergartenWebsiteBuilder = lazy(() => import('./pages/dashboard/KindergartenWebsiteBuilder').then((module) => ({ default: module.KindergartenWebsiteBuilder })));
const WebsiteNewsManager = lazy(() => import('./pages/dashboard/WebsiteNewsManager').then((module) => ({ default: module.WebsiteNewsManager })));
const Alerts = lazy(() => import('./pages/dashboard/Alerts').then((module) => ({ default: module.Alerts })));

const RouteFallback = () => (
  <div className="flex min-h-[420px] items-center justify-center">
    <Loader2 className="animate-spin text-emerald-600" size={34} />
  </div>
);

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

    let unsubscribe: (() => void) | undefined;

    import('firebase/auth')
      .then(async ({ onAuthStateChanged }) => {
        const { auth } = await import('./services/firebase');
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    return () => unsubscribe?.();
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
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <DashboardLayout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route index element={<Overview />} />
            <Route path="region/:regionSlug" element={<Overview />} />
            <Route path="districts" element={<Districts />} />
            <Route path="tuman-stats" element={<Districts />} />
            <Route path="menu" element={<NutritionMenu />} />
            <Route path="aqlvoy-chef-menu" element={<AqlvoyChefMenu />} />
            <Route path="rating" element={<RatingAudit />} />
            <Route path="kindergartens" element={<MTTManagement />} />
            <Route path="kindergarten-inspection" element={<KindergartenInspection />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="warehouse" element={<WarehouseCommandCenter />} />
            <Route path="medical-stock" element={<MedicalStockReserve />} />
            <Route path="financial-stats" element={<FinancialAnalytics />} />
            <Route path="menu-stats" element={<MenuStatistics />} />
            <Route path="website-builder" element={<KindergartenWebsiteBuilder />} />
            <Route path="website-news" element={<WebsiteNewsManager />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </DashboardLayout>
    </>
  );
}
