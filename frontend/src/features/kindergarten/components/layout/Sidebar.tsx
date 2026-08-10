import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  ChefHat, 
  ShieldCheck, 
  FlaskConical, 
  LogOut,
  X,
  Contact,
  Stethoscope,
  Archive,
  Globe2,
} from 'lucide-react';
import { UserRole, NavItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { canAccessMenuRole } from '../../roleAccess';

interface SidebarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeRole, onRoleChange, onClose }) => {
  const { user, logout } = useAuth();

  const allMenuItems: NavItem[] = [
    { id: 'DIRECTOR', label: 'Boshqaruv (Direktor)', icon: LayoutDashboard },
    { id: 'OPERATOR', label: 'Operator', icon: Contact },
    { id: 'TEACHER', label: 'Tarbiyachi', icon: ClipboardCheck },
    { id: 'NURSE', label: 'Hamshira', icon: Stethoscope },
    { id: 'CHEF', label: 'Oshpaz', icon: ChefHat },
    { id: 'STOREKEEPER', label: 'Omborchi', icon: Package },
    { id: 'INSPECTOR', label: "Organoleptik ko'rsatkichlar", icon: ShieldCheck },
    { id: 'LAB_CONTROLLER', label: 'Laboratoriya', icon: FlaskConical },
    { id: 'ARCHIVE', label: 'Arxiv', icon: Archive },
    { id: 'WEBSITE', label: "Bog'cha web sayti", icon: Globe2 },
  ];

  const menuThemes: Record<string, { from: string; to: string; text: string; glow: string }> = {
    DIRECTOR: { from: '#eff6ff', to: '#dbeafe', text: '#1d4ed8', glow: 'rgba(37, 99, 235, 0.14)' },
    OPERATOR: { from: '#ecfdf5', to: '#bbf7d0', text: '#047857', glow: 'rgba(16, 185, 129, 0.16)' },
    TEACHER: { from: '#fff7ed', to: '#fed7aa', text: '#c2410c', glow: 'rgba(249, 115, 22, 0.15)' },
    NURSE: { from: '#fdf2f8', to: '#fbcfe8', text: '#be185d', glow: 'rgba(219, 39, 119, 0.14)' },
    CHEF: { from: '#fffbeb', to: '#fde68a', text: '#b45309', glow: 'rgba(217, 119, 6, 0.16)' },
    STOREKEEPER: { from: '#ecfeff', to: '#a5f3fc', text: '#0e7490', glow: 'rgba(8, 145, 178, 0.15)' },
    WEBSITE: { from: '#eef2ff', to: '#bfdbfe', text: '#1d4ed8', glow: 'rgba(37, 99, 235, 0.14)' },
    INSPECTOR: { from: '#f5f3ff', to: '#ddd6fe', text: '#6d28d9', glow: 'rgba(124, 58, 237, 0.15)' },
    LAB_CONTROLLER: { from: '#eef2ff', to: '#c7d2fe', text: '#4338ca', glow: 'rgba(79, 70, 229, 0.16)' },
    ARCHIVE: { from: '#f8fafc', to: '#e2e8f0', text: '#475569', glow: 'rgba(71, 85, 105, 0.13)' },
  };

  const menuItems = allMenuItems.filter((item) => canAccessMenuRole(user?.role, item.id as UserRole));

  return (
    <div className="kg-sidebar-shell w-full h-full flex flex-col overflow-hidden relative">
      {/* Mobile Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-brand-slate hover:bg-slate-50 rounded-lg lg:hidden transition-colors z-20"
        >
          <X size={20} />
        </button>
      )}

      <div className="kg-sidebar-brand-wrap relative overflow-hidden shrink-0">
        <div className="kg-sidebar-brand relative z-10 flex items-center gap-3">
          <div className="kg-sidebar-mark shrink-0">
            <span>MTT</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="kg-sidebar-brand-title">
              MTT
            </h1>
            <div className="kg-sidebar-brand-subtitle">
              <span />
              <p>Qashqadaryo MTT Tizimi</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="kg-sidebar-menu custom-scrollbar">
        {menuItems.map((item) => {
          const theme = menuThemes[item.id] || menuThemes.OPERATOR;
          const isActive = activeRole === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onRoleChange(item.id as UserRole)}
              className={`kg-sidebar-nav-item flex items-center gap-3 transition-all duration-300 group text-left min-w-0 ${
                isActive ? 'is-active font-bold' : 'text-brand-slate'
              }`}
              style={{
                ['--kg-menu-from' as string]: theme.from,
                ['--kg-menu-to' as string]: theme.to,
                ['--kg-menu-text' as string]: theme.text,
                ['--kg-menu-glow' as string]: theme.glow,
              } as React.CSSProperties}
            >
              <span className="kg-sidebar-icon flex shrink-0 items-center justify-center">
                <item.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
              </span>
              <span className="kg-sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info or version */}
      <div className="kg-sidebar-footer mt-auto shrink-0">
        <button 
          onClick={logout}
          className="kg-sidebar-logout mb-2 flex w-full items-center gap-2 transition-colors"
        >
          <LogOut size={15} />
          <span className="text-xs font-black">Chiqish</span>
        </button>
        <div className="kg-sidebar-status flex items-center justify-between gap-2">
           <div className="min-w-0">
              <p>Tizim holati</p>
              <div className="flex items-center gap-1.5">
                 <div className="kg-sidebar-status-dot"></div>
                 <span>Onlayn</span>
              </div>
           </div>
           <span className="kg-sidebar-version shrink-0">v1.1</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

