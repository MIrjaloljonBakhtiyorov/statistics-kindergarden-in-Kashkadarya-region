import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut,
  UserCircle,
  Menu,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '@/shared/api';
import { ThemeToggle } from '@/shared/theme/theme';

const ROLES_INFO: Record<UserRole, { label: string, description: string }> = {
  DIRECTOR: { label: 'Direktor', description: 'Tizim direktori' },
  OPERATOR: { label: 'Operator', description: 'Tizim operatori' },
  STOREKEEPER: { label: 'Omborchi', description: 'Ombor mudiri' },
  KITCHEN_MANAGER: { label: 'Oshxona mudiri', description: "Organoleptik ko'rsatkichlar" },
  CHEF: { label: 'Oshpaz', description: 'Oshpaz' },
  LAB_CONTROLLER: { label: 'Laborant', description: 'Laboratoriya nazorati' },
  TEACHER: { label: 'Tarbiyachi', description: 'Tarbiyachi' },
  NURSE: { label: 'Hamshira', description: 'Tibbiy nazorat' },
  INSPECTOR: { label: 'Inspektor', description: "Organoleptik ko'rsatkichlar" },
  PARENT: { label: 'Ota-ona', description: 'Ota-ona portali' },
  ADMIN: { label: 'Admin', description: 'Tizim admini' }
};

interface TopBarProps {
  role: UserRole;
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ role, onMenuClick }) => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const initializedNotificationsRef = useRef(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const loadNotifications = useCallback(async () => {
    if (!user?.id || !role) return;
    try {
      const params = new URLSearchParams({
        role,
        userId: String(user.id),
        limit: '20',
      });
      const res = await apiClient.get(`/notifications?${params.toString()}`);
      const nextNotifications = Array.isArray(res.data) ? res.data : [];

      if (initializedNotificationsRef.current) {
        const newUnread = nextNotifications.find((item: any) => !item.is_read && !seenNotificationIdsRef.current.has(item.id));
        if (newUnread) {
          showNotification(`${newUnread.title}: ${newUnread.message}`, 'info');
        }
      }

      seenNotificationIdsRef.current = new Set(nextNotifications.map((item: any) => item.id));
      initializedNotificationsRef.current = true;
      setNotifications(nextNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [role, showNotification, user?.id]);

  useEffect(() => {
    initializedNotificationsRef.current = false;
    seenNotificationIdsRef.current = new Set();
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 10000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const markNotificationRead = async (notificationId: string) => {
    setNotifications((items) => items.map((item) => item.id === notificationId ? { ...item, is_read: true } : item));
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
    } catch {
      loadNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
    try {
      await apiClient.post('/notifications/read-all', {
        role,
        userId: user?.id || '',
      });
    } catch {
      loadNotifications();
    }
  };

  const notificationTone = (type?: string) => {
    if (type === 'success') return 'bg-emerald-50 text-emerald-600';
    if (type === 'warning') return 'bg-amber-50 text-amber-600';
    if (type === 'error') return 'bg-rose-50 text-rose-600';
    return 'bg-blue-50 text-blue-600';
  };

  const formatNotificationTime = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-16 sm:h-20 border-b border-emerald-100 flex items-center justify-between px-3 sm:px-6 lg:px-10 sticky top-0 z-40 backdrop-blur-xl bg-white/90 shadow-[0_8px_30px_rgba(6,78,59,0.04)]">
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 min-w-0">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-brand-slate hover:bg-slate-50 rounded-lg lg:hidden transition-colors"
        >
          <Menu size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="truncate">
          <h2 className="text-base sm:text-xl font-display font-bold text-brand-depth leading-none mb-1 truncate">{ROLES_INFO[role]?.label || role}</h2>
          <p className="text-[9px] sm:text-[10px] text-brand-slate uppercase font-bold tracking-widest hidden sm:block">{ROLES_INFO[role]?.description || 'Tizim foydalanuvchisi'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Qidirish..." 
            className="bg-emerald-50/60 border border-emerald-100 rounded-xl py-2 pl-10 pr-4 text-sm w-48 xl:w-64 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3 border-l pl-2 sm:pl-6 border-slate-100">
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen((value) => !value);
                loadNotifications();
              }}
              className="p-1.5 sm:p-2 text-brand-slate hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all relative"
              title="Bildirishnomalar"
            >
              <Bell size={18} className="sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 border-2 border-white rounded-full text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-[340px] max-w-[calc(100vw-24px)] bg-white border border-emerald-100 rounded-2xl shadow-2xl shadow-emerald-900/10 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-brand-depth">Bildirishnomalar</p>
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{unreadCount} ta yangi</p>
                  </div>
                  <button
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-primary disabled:text-brand-muted"
                  >
                    O'qildi
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto text-brand-muted mb-3" size={26} />
                      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Bildirishnoma yo'q</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => markNotificationRead(item.id)}
                        className={`w-full p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${item.is_read ? 'opacity-70' : 'bg-emerald-50/30'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notificationTone(item.type)}`}>
                          <Bell size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-black text-brand-depth leading-tight">{item.title}</p>
                            {!item.is_read && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs font-semibold text-brand-slate leading-relaxed mt-1 line-clamp-2">{item.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                            <span>{formatNotificationTime(item.created_at)}</span>
                            {item.is_read && (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 size={12} /> o'qildi
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="p-1.5 sm:p-2 text-brand-slate hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all" title="Sozlamalar">
            <Settings size={18} className="sm:w-5 sm:h-5" />
          </button>
          <ThemeToggle className="p-1.5 sm:p-2 text-brand-slate hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 border-l pl-2 sm:pl-6 border-slate-100">
          <div className="text-right hidden md:block max-w-[120px]">
             <p className="text-xs sm:text-sm font-bold text-brand-depth leading-none mb-1 truncate">{user?.full_name || 'Foydalanuvchi'}</p>
             <p className="text-[9px] sm:text-[10px] text-brand-slate uppercase font-bold tracking-wider truncate">{user?.role === 'DIRECTOR' ? 'Admin / direktor' : user?.role}</p>
          </div>
          <div className="group relative">
            <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-[10px] sm:text-xs text-brand-primary overflow-hidden shadow-sm uppercase hover:border-brand-primary transition-colors">
               {user?.login?.substring(0, 2) || 'US'}
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl shadow-emerald-900/10 border border-emerald-100 py-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
               <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-xs font-bold text-brand-depth">{user?.full_name}</p>
                  <p className="text-[10px] text-brand-muted uppercase font-bold">{user?.role}</p>
               </div>
               <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-slate hover:bg-slate-50 transition-colors">
                  <UserCircle size={16} /> Profil
               </button>
               <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
               >
                  <LogOut size={16} /> Chiqish
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

