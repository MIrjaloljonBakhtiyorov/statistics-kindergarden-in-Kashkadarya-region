import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  ChefHat, 
  ShieldCheck, 
  FlaskConical, 
  Smartphone,
  LogOut,
  X,
  Contact,
  Stethoscope,
  Camera,
  Globe2,
  Loader2
} from 'lucide-react';
import { UserRole, NavItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../context/NotificationContext';

interface SidebarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeRole, onRoleChange, onClose }) => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [kgName, setKgName] = useState('KinderFlow');
  const [kgLogo, setKgLogo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data.kg_name) setKgName(res.data.kg_name);
      if (res.data.kg_logo) setKgLogo(res.data.kg_logo);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleNameSave = async (newName: string) => {
    setKgName(newName);
    setIsEditing(false);
    try {
      await apiClient.post('/settings', { kg_name: newName });
      showNotification("Bog'cha nomi yangilandi", 'success');
    } catch (err) {
      showNotification('Xatolik yuz berdi', 'error');
    }
  };

  const canSeeAllRoles = user?.role === 'DIRECTOR' || user?.role === 'ADMIN' || user?.role === 'OPERATOR';
  const canManageBrand = user?.role === 'DIRECTOR' || user?.role === 'ADMIN';

  const handleLogoClick = () => {
    if (canManageBrand) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadRes = await apiClient.post('/upload', formData);
      const logoUrl = uploadRes.data.url;
      
      await apiClient.post('/settings', { kg_logo: logoUrl });
      setKgLogo(logoUrl);
      showNotification('Logo yuklandi!', 'success');
    } catch (err) {
      showNotification('Logo yuklashda xatolik', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const allMenuItems: NavItem[] = [
    { id: 'DIRECTOR', label: 'Boshqaruv (Direktor)', icon: LayoutDashboard },
    { id: 'OPERATOR', label: 'Operator', icon: Contact },
    { id: 'TEACHER', label: 'Tarbiyachi', icon: ClipboardCheck },
    { id: 'NURSE', label: 'Hamshira', icon: Stethoscope },
    { id: 'CHEF', label: 'Oshpaz', icon: ChefHat },
    { id: 'STOREKEEPER', label: 'Omborchi', icon: Package },
    { id: 'INSPECTOR', label: "Organoleptik ko'rsatkichlar", icon: ShieldCheck },
    { id: 'LAB_CONTROLLER', label: 'Laboratoriya', icon: FlaskConical },
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
  };

  const roleMenuAccess: Partial<Record<UserRole, string[]>> = {
    INSPECTOR: ['INSPECTOR', 'LAB_CONTROLLER'],
    STOREKEEPER: ['STOREKEEPER'],
  };
  // Director/admin/operator see all roles. Other users only see their own role.
  const menuItems = canSeeAllRoles
    ? allMenuItems 
    : allMenuItems.filter(item => roleMenuAccess[user?.role as UserRole]?.includes(item.id) || item.id === user?.role);

  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-emerald-100 overflow-hidden relative shadow-[8px_0_30px_rgba(6,78,59,0.04)]">
      {/* Mobile Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-brand-slate hover:bg-slate-50 rounded-lg lg:hidden transition-colors z-10"
        >
          <X size={20} />
        </button>
      )}

      <div className="relative overflow-hidden p-5 sm:p-6 lg:p-7 border-b border-emerald-100 shrink-0 bg-gradient-to-br from-white via-emerald-50/70 to-sky-50/60">
        <div className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-emerald-200/55 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-28 rounded-full bg-sky-200/35 blur-2xl" />
        <div className="relative z-10 flex items-center gap-3 rounded-[1.35rem] border border-white/70 bg-white/72 p-3 shadow-[0_16px_36px_rgba(5,150,105,0.10)] backdrop-blur-md">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <div 
            onClick={handleLogoClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-700/15 shrink-0 relative overflow-hidden group/logo ring-4 ring-white/80 ${isUploading ? 'bg-emerald-50' : 'bg-gradient-to-br from-emerald-600 to-teal-500 cursor-pointer hover:shadow-brand-primary/30 transition-all'}`}
          >
            {isUploading ? (
              <Loader2 size={20} className="animate-spin text-brand-primary" />
            ) : kgLogo ? (
              <img src={kgLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-sans font-bold text-xl uppercase tracking-tighter">{kgName[0]}</span>
            )}
            {canManageBrand && !isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                <Camera size={16} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                autoFocus
                className="w-full bg-slate-50 border-none outline-none font-bold text-brand-primary text-sm p-1 rounded"
                value={kgName}
                onChange={(e) => setKgName(e.target.value)}
                onBlur={() => handleNameSave(kgName)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave(kgName)}
              />
            ) : (
              <h1 
                onClick={() => canManageBrand && setIsEditing(true)}
                className={`text-brand-primary font-sans font-black text-lg leading-tight uppercase tracking-tight truncate ${canManageBrand ? 'cursor-pointer hover:opacity-70' : ''}`}
              >
                {kgName}
              </h1>
            )}
            <div className="mt-1 flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] shrink-0" />
              <p className="text-brand-muted text-[8px] sm:text-[9px] uppercase tracking-wider sm:tracking-widest font-black leading-tight truncate">Qashqadaryo MTM Tizimi</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 mt-4 sm:mt-6 space-y-1 overflow-y-auto overflow-x-hidden pb-6 sm:pb-10 custom-scrollbar">
        {menuItems.map((item) => {
          const theme = menuThemes[item.id] || menuThemes.OPERATOR;
          const isActive = activeRole === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onRoleChange(item.id as UserRole)}
              className={`kg-sidebar-nav-item w-full flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 transition-all duration-300 group text-left min-w-0 ${
                isActive ? 'is-active font-bold' : 'text-brand-slate'
              }`}
              style={{
                ['--kg-menu-from' as string]: theme.from,
                ['--kg-menu-to' as string]: theme.to,
                ['--kg-menu-text' as string]: theme.text,
                ['--kg-menu-glow' as string]: theme.glow,
              } as React.CSSProperties}
            >
              <span className="kg-sidebar-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <item.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
              </span>
              <span className="text-sm leading-tight break-words">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info or version */}
      <div className="mt-auto shrink-0 border-t border-slate-50 p-3">
        <button 
          onClick={logout}
          className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-500 transition-colors hover:bg-rose-50"
        >
          <LogOut size={15} />
          <span className="text-xs font-black">Chiqish</span>
        </button>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
           <div className="min-w-0">
              <p className="text-[7px] font-black uppercase tracking-widest text-brand-muted">Tizim holati</p>
              <div className="flex items-center gap-1.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.75)]"></div>
                 <span className="truncate text-[8px] font-black text-brand-depth">Onlayn</span>
              </div>
           </div>
           <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[8px] font-black text-emerald-700 shadow-sm">v1.1</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

