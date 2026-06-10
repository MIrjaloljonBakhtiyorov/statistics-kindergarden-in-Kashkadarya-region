/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import './index.css';

// --- Layout Components ---
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// --- View Components ---
import DirectorView from './components/views/DirectorView';
import OperatorView from './components/views/OperatorView';
import StorekeeperView from './components/views/StorekeeperView';
import ChefView from './components/views/ChefView';
import KitchenManagerView from './components/views/KitchenManagerView';
import LabView from './components/views/LabView';
import TeacherView from './components/views/TeacherView';
import NurseView from './components/views/NurseView';
import InspectorView from './components/views/InspectorView';
import ParentView from './components/views/ParentView';

// --- Types & Hooks ---
import { UserRole } from './types';
import { useGroups } from './features/groups/hooks/useGroups';

const App: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { groups } = useGroups();

  // URL dan kindergartenId va rolni aniqlash
  const [currentKindergartenId, setCurrentKindergartenId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('DIRECTOR');

  useEffect(() => {
    const path = window.location.pathname;
    // /kindergarten/:id/:role
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 3) {
      setCurrentKindergartenId(parts[1]);
      setCurrentRole(parts[2].toUpperCase() as UserRole);
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
      window.history.replaceState(null, '', `/kindergarten/${currentKindergartenId}/parent`);
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
    <div className="kindergarten-shell flex h-screen bg-brand-ghost font-sans text-brand-depth overflow-hidden">
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
            fixed inset-y-0 left-0 z-[60] w-72 bg-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block h-full shrink-0
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
        
        <main className={`flex-1 overflow-y-auto ${isParent ? 'p-0' : 'p-4 sm:p-6 lg:p-10'} custom-scrollbar`}>
          <div className={`${isParent ? 'w-full' : 'max-w-[1600px] mx-auto'}`}>
            <AnimatePresence mode="wait">
              <div key={currentRole}>
                {renderCurrentView()}
              </div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
