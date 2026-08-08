/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import './index.css';

// --- Layout Components ---
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// --- Types & Hooks ---
import { UserRole } from './types';
import { useGroups } from './features/groups/hooks/useGroups';

const DirectorView = lazy(() => import('./components/views/DirectorView'));
const OperatorView = lazy(() => import('./components/views/OperatorView'));
const StorekeeperView = lazy(() => import('./components/views/StorekeeperView'));
const ChefView = lazy(() => import('./components/views/ChefView'));
const KitchenManagerView = lazy(() => import('./components/views/KitchenManagerView'));
const LabView = lazy(() => import('./components/views/LabView'));
const TeacherView = lazy(() => import('./components/views/TeacherView'));
const NurseView = lazy(() => import('./components/views/NurseView'));
const InspectorView = lazy(() => import('./components/views/InspectorView'));
const ParentView = lazy(() => import('./components/views/ParentView'));
const KindergartenWebsiteView = lazy(() => import('./components/views/KindergartenWebsiteView'));

const ViewFallback = () => (
  <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-brand-line bg-white">
    <div className="text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Bo'lim yuklanmoqda</p>
    </div>
  </div>
);

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
      setCurrentRole(user.role);
      window.history.replaceState(null, '', `/kindergarten/${currentKindergartenId}/${String(user.role).toLowerCase()}`);
    }
  }, [currentKindergartenId, currentRole, isAuthenticated, user]);

  // Rol o'zgarganda URL ni yangilash
  const handleRoleChange = (role: UserRole) => {
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
                <Suspense fallback={<ViewFallback />}>
                  {renderCurrentView()}
                </Suspense>
              </div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
