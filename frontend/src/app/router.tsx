import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const HomeApp = lazy(() => import('../features/home/App'));
const AdminApp = lazy(() => import('../features/kindergarten-admin/App'));
const KindergartenRoute = lazy(() => import('./KindergartenRoute'));
const PublicKindergartenSite = lazy(() => import('../features/public-site/PublicKindergartenSite'));

const AppFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
    <div>
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500">Yuklanmoqda</p>
    </div>
  </div>
);

export function AppRouter() {
  return (
    <Suspense fallback={<AppFallback />}>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/site/:slug" element={<PublicKindergartenSite />} />
        <Route path="/kindergarten/*" element={<KindergartenRoute />} />
        <Route path="/stats/*" element={<div>Statistics Feature (To be integrated)</div>} />
        <Route path="/" element={<Navigate to="/viloyat-statistikasi" replace />} />
        <Route path="/*" element={<HomeApp />} />
      </Routes>
    </Suspense>
  );
}
