/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';
import './index.css';

// --- Layout Components ---
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// --- Types & Hooks ---
import { UserRole } from './types';
import { useGroups } from './features/groups/hooks/useGroups';
import { canAccessMenuRole, getDefaultMenuRole } from './roleAccess';

const lazyWithTimeout = <T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>) =>
  lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("Bo'limni yuklash vaqti tugadi")), 15000);
      loader()
        .then((module) => {
          window.clearTimeout(timer);
          resolve(module);
        })
        .catch((error) => {
          window.clearTimeout(timer);
          reject(error);
        });
    })
  );

const DirectorView = lazyWithTimeout(() => import('./components/views/DirectorView'));
const OperatorView = lazyWithTimeout(() => import('./components/views/OperatorView'));
const StorekeeperView = lazyWithTimeout(() => import('./components/views/StorekeeperView'));
const ChefView = lazyWithTimeout(() => import('./components/views/ChefView'));
const KitchenManagerView = lazyWithTimeout(() => import('./components/views/KitchenManagerView'));
const LabView = lazyWithTimeout(() => import('./components/views/LabView'));
const TeacherView = lazyWithTimeout(() => import('./components/views/TeacherView'));
const NurseView = lazyWithTimeout(() => import('./components/views/NurseView'));
const InspectorView = lazyWithTimeout(() => import('./components/views/InspectorView'));
const ParentView = lazyWithTimeout(() => import('./components/views/ParentView'));
const ArchiveView = lazyWithTimeout(() => import('./components/views/ArchiveView'));
const KindergartenWebsiteView = lazyWithTimeout(() => import('./components/views/KindergartenWebsiteView'));

const ViewFallback = () => (
  <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-brand-line bg-white">
    <div className="text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Bo'lim yuklanmoqda</p>
    </div>
  </div>
);

class ViewErrorBoundary extends React.Component<
  { children: React.ReactNode; role: UserRole },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Bo'limni yuklashda xatolik yuz berdi" };
  }

  componentDidUpdate(previousProps: { role: UserRole }) {
    if (previousProps.role !== this.props.role && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-rose-100 bg-white p-8">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Bo'lim yuklanmadi</p>
          <h2 className="mt-2 text-xl font-black text-brand-depth">Sahifani ochishda xatolik yuz berdi</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-brand-slate">{this.state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 h-11 rounded-[1px] border border-emerald-300 bg-emerald-700 px-5 text-sm font-black text-white transition-colors hover:bg-emerald-800"
          >
            Qayta yuklash
          </button>
        </div>
      </div>
    );
  }
}

const getRouteState = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return {
    kindergartenId: parts.length >= 2 ? parts[1] : null,
    role: parts.length >= 3 ? (parts[2].toUpperCase() as UserRole) : 'DIRECTOR',
  };
};

const App: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { groups } = useGroups();

  // URL dan kindergartenId va rolni aniqlash
  const [currentKindergartenId, setCurrentKindergartenId] = useState<string | null>(() => getRouteState().kindergartenId);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => getRouteState().role);

  useEffect(() => {
    const syncRouteState = () => {
      const nextRoute = getRouteState();
      setCurrentKindergartenId(nextRoute.kindergartenId);
      setCurrentRole(nextRoute.role);
    };

    syncRouteState();
    window.addEventListener('popstate', syncRouteState);
    return () => {
      window.removeEventListener('popstate', syncRouteState);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user || !currentKindergartenId || currentRole === 'PARENT') return;

    const userKindergartenId = String(user.kindergarten_id || user.id || '');
    if (userKindergartenId !== currentKindergartenId) {
      logout();
    }
  }, [currentKindergartenId, currentRole, isAuthenticated, logout, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || !currentKindergartenId) return;

    if (user.role === 'PARENT' && currentRole !== 'PARENT') {
      setCurrentRole('PARENT');
      window.history.replaceState(null, '', `/kindergarten/${currentKindergartenId}/parent/profile`);
      return;
    }

    if (user.role !== 'PARENT' && currentRole === 'PARENT') {
      const defaultRole = getDefaultMenuRole(user.role);
      setCurrentRole(defaultRole);
      window.history.replaceState(null, '', `/kindergarten/${currentKindergartenId}/${String(defaultRole).toLowerCase()}`);
      return;
    }

    if (user.role !== 'PARENT' && !canAccessMenuRole(user.role, currentRole)) {
      const defaultRole = getDefaultMenuRole(user.role);
      setCurrentRole(defaultRole);
      window.history.replaceState(null, '', `/kindergarten/${currentKindergartenId}/${String(defaultRole).toLowerCase()}`);
    }
  }, [currentKindergartenId, currentRole, isAuthenticated, user]);

  // Rol o'zgarganda URL ni yangilash
  const handleRoleChange = (role: UserRole) => {
    if (!canAccessMenuRole(user?.role, role)) return;
    setCurrentRole(role);
    if (currentKindergartenId) {
      window.history.pushState(null, '', `/kindergarten/${currentKindergartenId}/${role.toLowerCase()}`);
    }
  };

  if (!isAuthenticated) {
    window.location.replace('/login');
    return null;
  }

  const renderCurrentView = () => {
    switch (currentRole) {
      case 'DIRECTOR':
        return <DirectorView />;
      case 'ADMIN':
        // Admin uchun default ko'rinishni OperatorView qilamiz
        return <OperatorView groups={groups} />;
      case 'OPERATOR':
        return <OperatorView groups={groups} />;
      case 'STOREKEEPER':
        return <StorekeeperView />;
      case 'KITCHEN_MANAGER':
        return <KitchenManagerView />;
      case 'CHEF':
        return <ChefView />;
      case 'LAB_CONTROLLER':
        return <LabView />;
      case 'TEACHER':
        return <TeacherView groups={groups} />;
      case 'NURSE':
        return <NurseView />;
      case 'INSPECTOR':
        return <InspectorView />;
      case 'ARCHIVE':
        return <ArchiveView />;
      case 'WEBSITE':
        return <KindergartenWebsiteView />;
      case 'PARENT':
        return <ParentView />;
      default:
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Ruxsat etilmagan</h1>
            <p className="text-brand-muted mt-2">Sizning rolingiz: {currentRole}</p>
          </div>
        );
    }
  };

  const isParent = currentRole === 'PARENT';

  return (
    <div className="kindergarten-shell flex h-dvh bg-brand-ghost font-sans text-brand-depth overflow-hidden">
      <Toaster position="top-center" richColors />
      {/* Sidebar - Hidden for Parents */}
      {!isParent && (
        <>
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 z-[55] lg:hidden bg-black/20 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Sidebar container */}
          <div className={`
            fixed inset-y-0 left-0 z-[60] w-[min(18rem,calc(100vw-1.5rem))] bg-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block h-full shrink-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar 
              activeRole={currentRole} 
              onRoleChange={(role) => {
                handleRoleChange(role as UserRole);
                setIsSidebarOpen(false); // Close on selection on mobile
              }} 
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {!isParent && (
          <TopBar 
            role={currentRole} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
        )}
        
        <main className={`flex-1 ${isParent ? 'overflow-hidden p-0 kg-parent-main min-h-0' : 'overflow-y-auto p-3 sm:p-5 lg:p-8 xl:p-10 custom-scrollbar'}`}>
          <div className={`${isParent ? 'w-full h-full min-h-0' : 'max-w-[1600px] mx-auto w-full min-w-0'}`}>
            <AnimatePresence mode="wait">
              <div key={currentRole} className={`min-w-0 ${isParent ? 'h-full min-h-0' : ''}`}>
                <ViewErrorBoundary role={currentRole}>
                  <Suspense fallback={<ViewFallback />}>
                    {renderCurrentView()}
                  </Suspense>
                </ViewErrorBoundary>
              </div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
