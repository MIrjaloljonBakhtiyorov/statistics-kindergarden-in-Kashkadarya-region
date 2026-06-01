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
      showNotification('BogвЂcha nomi yangilandi', 'success');
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
  ];

  const roleMenuAccess: Partial<Record<UserRole, string[]>> = {
    INSPECTOR: ['INSPECTOR', 'LAB_CONTROLLER'],
    STOREKEEPER: ['STOREKEEPER'],
  };
  // Director/admin/operator see all roles. Other users only see their own role.
  const menuItems = canSeeAllRoles
    ? allMenuItems 
    : allMenuItems.filter(item => roleMenuAccess[user?.role as UserRole]?.includes(item.id) || item.id === user?.role);

  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-emerald-100 overflow-y-auto custom-scrollbar relative shadow-[8px_0_30px_rgba(6,78,59,0.04)]">
      {/* Mobile Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-brand-slate hover:bg-slate-50 rounded-lg lg:hidden transition-colors z-10"
        >
          <X size={20} />
        </button>
      )}

      <div className="p-8 border-b border-emerald-100 shrink-0 bg-gradient-to-br from-white to-emerald-50/60">
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <div 
            onClick={handleLogoClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-700/10 shrink-0 relative overflow-hidden group/logo ${isUploading ? 'bg-emerald-50' : 'bg-brand-primary cursor-pointer hover:shadow-brand-primary/30 transition-all'}`}
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
                className={`text-brand-primary font-sans font-bold text-lg leading-tight uppercase tracking-tight truncate ${canManageBrand ? 'cursor-pointer hover:opacity-70' : ''}`}
              >
                {kgName}
              </h1>
            )}
            <p className="text-brand-muted text-[10px] uppercase tracking-widest font-bold">Qashqadaryo MTM Tizimi</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 mt-6 space-y-1 pb-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onRoleChange(item.id as UserRole)}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 group border-l-[3px] ${
              activeRole === item.id 
                ? 'bg-emerald-50 text-brand-primary border-brand-primary font-bold shadow-sm' 
                : 'text-brand-slate border-transparent hover:bg-emerald-50/70 hover:text-brand-depth'
            }`}
          >
            <item.icon size={18} className={activeRole === item.id ? 'text-brand-primary' : 'group-hover:scale-110 transition-transform'} />
            <span className="text-sm whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer info or version */}
      <div className="p-6 border-t border-slate-50 mt-auto shrink-0">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors font-bold mb-4"
        >
          <LogOut size={18} />
          <span className="text-sm">Chiqish</span>
        </button>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
           <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Tizim holati</p>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-brand-depth">Online вЂў v2.4.0</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

