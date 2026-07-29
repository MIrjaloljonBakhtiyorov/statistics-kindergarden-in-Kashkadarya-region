import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  LogOut,
  CheckCircle2,
  MessageSquare,
  Activity,
  MapPin,
  Calendar,
  UserCheck,
  Users,
  ShieldAlert,
  Wallet,
  BadgeDollarSign,
  Star,
  Syringe,
  Apple,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '@/shared/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

// Import Section Components
import { ProfileSection } from '../../features/parent-portal/components/ProfileSection';
import { SecuritySection } from '../../features/parent-portal/components/SecuritySection';
import { FinanceSection } from '../../features/parent-portal/components/FinanceSection';
import { AttendanceSection } from '../../features/parent-portal/components/AttendanceSection';
import { ProgressSection } from '../../features/parent-portal/components/ProgressSection';
import { MedicalSection } from '../../features/parent-portal/components/MedicalSection';
import { VaccineSection } from '../../features/parent-portal/components/VaccineSection';
import { MenuSection } from '../../features/parent-portal/components/MenuSection';
import { DocumentsSection } from '../../features/parent-portal/components/DocumentsSection';
import { PickupSection } from '../../features/parent-portal/components/PickupSection';
import { MessagesSection } from '../../features/parent-portal/components/MessagesSection';
import { TariffsSection } from '../../features/parent-portal/components/TariffsSection';


type SettingsTab = 'profile' | 'security' | 'menu' | 'medical' | 'messages' | 'finance' | 'tariffs' | 'attendance' | 'documents' | 'pickup' | 'progress' | 'vaccines';

const tabToPath: Record<SettingsTab, string> = {
  profile: 'profile',
  security: 'safety',
  finance: 'payment',
  tariffs: 'tariffs',
  attendance: 'attendance',
  progress: 'achievements',
  medical: 'health',
  vaccines: 'vaccines',
  menu: 'menu',
  documents: 'documents',
  pickup: 'pickup',
  messages: 'messages'
};

const pathToTab: Record<string, SettingsTab> = Object.entries(tabToPath).reduce((acc, [tab, path]) => {
  acc[path] = tab as SettingsTab;
  return acc;
}, {} as Record<string, SettingsTab>);

const getParentPathParts = () => window.location.pathname.split('/').filter(Boolean);

const getParentBasePath = () => {
  const parts = getParentPathParts();
  const parentIndex = parts.findIndex((part) => part.toLowerCase() === 'parent');
  const baseParts = parentIndex >= 0 ? parts.slice(0, parentIndex + 1) : parts.slice(0, 3);
  return `/${baseParts.join('/')}`;
};

const getParentTabFromPath = (): SettingsTab => {
  const parts = getParentPathParts();
  const parentIndex = parts.findIndex((part) => part.toLowerCase() === 'parent');
  const slug = parentIndex >= 0 ? parts[parentIndex + 1] : undefined;
  return slug && pathToTab[slug] ? pathToTab[slug] : 'profile';
};

const getParentTabPath = (tab: SettingsTab) => `${getParentBasePath()}/${tabToPath[tab]}`;

const getAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};

const ParentView = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => getParentTabFromPath());
  const [isSaving, setIsSaving] = useState(false);
  
  const [parentData, setParentData] = useState<any>(null);
  const [fullPortalData, setFullPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.childId) {
      fetchPortalData(user.childId);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const syncTabWithPath = () => {
      const nextTab = getParentTabFromPath();
      const nextPath = getParentTabPath(nextTab);
      setActiveTab(nextTab);

      if (window.location.pathname !== nextPath) {
        window.history.replaceState(null, '', nextPath);
      }
    };

    syncTabWithPath();
    window.addEventListener('popstate', syncTabWithPath);
    return () => window.removeEventListener('popstate', syncTabWithPath);
  }, []);

  const fetchPortalData = async (childId: string) => {
    setLoading(true);
    try {
      const [infoRes, fullRes] = await Promise.all([
        apiClient.get(`/parent-portal/child-info/${childId}`),
        apiClient.get(`/parent-portal/full-data/${childId}`)
      ]);
      setParentData(infoRes.data);
      setFullPortalData(fullRes.data);
    } catch (err) {
      console.error(err);
      showNotification("Ma'lumotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const [credentials, setCredentials] = useState({
    login: user?.login || '',
    newPassword: '',
    confirmPassword: ''
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-depth font-black uppercase tracking-widest text-[10px] md:text-xs">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user?.childId || !parentData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center border-2 border-rose-100 shadow-xl">
           <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-brand-depth">Hisob bog'lanmagan</h2>
           <p className="text-brand-muted font-bold max-w-sm mx-auto text-sm">Ushbu ota-ona hisobi hali biron bir bola ma'lumotlariga bog'lanmagan.</p>
        </div>
        <button onClick={logout} className="px-8 py-4 bg-brand-depth text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-brand-primary transition-all flex items-center gap-3">
           <LogOut size={16} /> Chiqish
        </button>
      </div>
    );
  }

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.newPassword !== credentials.confirmPassword) {
      showNotification("Parollar mos kelmadi", "error");
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.put(`/parents/${user?.id}`, {
        login: credentials.login,
        password: credentials.newPassword
      });
      showNotification("Ma'lumotlar yangilandi!", 'success');
    } catch (err) {
      showNotification("Xatolik yuz berdi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const navItems: { id: SettingsTab; label: string; icon: any; color: string }[] = [
    { id: 'profile', label: 'Profil', icon: User, color: 'brand-primary' },
    { id: 'finance', label: "To'lovlar", icon: Wallet, color: 'rose-500' },
    { id: 'tariffs', label: 'Tariflar', icon: BadgeDollarSign, color: 'brand-primary' },
    { id: 'attendance', label: 'Davomat', icon: Calendar, color: 'indigo-500' },
    { id: 'progress', label: 'Yutuqlar', icon: Star, color: 'amber-400' },
    { id: 'messages', label: 'Xabarlar', icon: MessageSquare, color: 'brand-primary' },
    { id: 'menu', label: 'Menyu', icon: Apple, color: 'orange-500' },
    { id: 'vaccines', label: 'Emlash', icon: Syringe, color: 'sky-500' },
    { id: 'medical', label: 'Salomatlik', icon: Activity, color: 'rose-500' },
    { id: 'pickup', label: 'Vakillar', icon: UserCheck, color: 'teal-500' },
    { id: 'documents', label: 'Hujjatlar', icon: FileText, color: 'slate-500' },
    { id: 'security', label: 'Xavfsizlik', icon: ShieldCheck, color: 'blue-500' },
  ];

  const handleProfileUpdate = () => {
    if (user?.childId) {
      fetchPortalData(user.childId);
    }
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    const nextPath = getParentTabPath(tab);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
  };

  const childPhotoUrl = getAssetUrl(parentData?.photo_url);
  const currentTariff = parentData?.tariff_name || parentData?.tariffName || fullPortalData?.tariff?.name || fullPortalData?.subscription?.plan_name || 'Bepul tarif';
  const renderTabContent = () => {
    const data = fullPortalData;

    switch (activeTab) {
      case 'profile': return <ProfileSection parentData={parentData} onUpdate={handleProfileUpdate} />;
      case 'finance': return <FinanceSection data={data} />;
      case 'tariffs': return <TariffsSection />;
      case 'attendance': return <AttendanceSection data={data} childId={user.childId} onUpdate={handleProfileUpdate} />;
      case 'menu': return <MenuSection data={data} childId={user.childId} />;
      case 'medical': return <MedicalSection parentData={parentData} health={data?.health || []} />;
      case 'vaccines': return <VaccineSection data={data} />;
      case 'progress': return <ProgressSection data={data} />;
      case 'messages': return <MessagesSection childName={`${parentData?.first_name || ''} ${parentData?.last_name || ''}`.trim()} />;
      case 'documents': return <DocumentsSection data={data} childId={user.childId} onUpdate={handleProfileUpdate} />;
      case 'pickup': return <PickupSection data={data} onUpdate={handleProfileUpdate} />;
      case 'security':
        return (
          <SecuritySection 
            credentials={credentials} 
            setCredentials={setCredentials} 
            isSaving={isSaving} 
            onUpdate={handleUpdateCredentials} 
          />
        );
      default: return null;
    }
  };

  return (
    <div className="kg-page kg-parent-portal flex h-full max-w-[1440px] mx-auto p-2 sm:p-3 md:p-5 lg:p-6 gap-4 md:gap-6 bg-slate-50/30 overflow-hidden flex-col">
      {/* Parent portal header */}
      <div className="kg-parent-header relative flex-none overflow-hidden rounded-[24px] border border-rose-100/90 bg-white px-4 py-3 shadow-sm">
        <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-rose-500"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/35 via-white to-white"></div>
        <div className="relative z-10 grid grid-cols-1 items-center gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-[18px] border border-rose-100 bg-rose-50/70 shadow-sm">
                {childPhotoUrl ? (
                  <img src={childPhotoUrl} alt="Bola rasmi" className="h-full w-full object-cover" />
                ) : (
                  <User size={28} className="text-rose-300" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg border-2 border-white bg-emerald-500 shadow-sm shadow-emerald-500/20">
                <CheckCircle2 size={10} className="text-white" />
              </div>
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <h2 className="text-[24px] font-extrabold leading-[1.08] text-brand-depth sm:text-[28px]">
                {parentData?.first_name} {parentData?.last_name}
              </h2>
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-[12px] font-bold text-brand-muted sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-white px-3 py-1 text-rose-600 shadow-sm">
                  <Users size={14} className="shrink-0 text-rose-500" />
                  {parentData?.childGroup || 'Guruh biriktirilmagan'}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-slate-100 bg-white px-3 py-1 text-brand-muted shadow-sm">
                  <MapPin size={14} className="shrink-0 text-rose-500" />
                  <span className="break-words">{parentData?.kindergartenDistrict || parentData?.kindergartenAddress || "Manzil kiritilmagan"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-1.5 rounded-[20px] border border-rose-100 bg-white/85 p-1.5 shadow-sm sm:grid-cols-[minmax(210px,1fr)_50px_108px] xl:w-[470px]">
              <button
                type="button"
                onClick={() => handleTabChange('tariffs')}
                className="group flex min-h-[54px] items-center gap-3 rounded-[16px] px-3 py-2 text-left transition-all hover:bg-rose-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                  <BadgeDollarSign size={17} />
                </span>
                <span className="min-w-0">
                  <span className="kg-parent-tariff-label block text-[10px] font-extrabold uppercase text-rose-500">Tarif</span>
                  <span className="kg-parent-tariff-value mt-0.5 block truncate text-[16px] font-extrabold leading-tight text-brand-depth">{currentTariff}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('tariffs')}
                title="Tarifni yangilash"
                className="flex min-h-[54px] items-center justify-center rounded-[16px] text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-600"
              >
                <RefreshCw size={19} />
              </button>
              <button
                onClick={logout}
                className="flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-rose-500 px-4 py-2.5 text-[12px] font-extrabold uppercase text-white shadow-sm shadow-rose-500/20 transition-all hover:bg-rose-600 hover:shadow-md hover:shadow-rose-500/25"
              >
                <LogOut size={17} /> Chiqish
              </button>
          </div>
        </div>
      </div>

      <div className="kg-parent-layout grid flex-1 min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-12 lg:grid-rows-none gap-4 md:gap-6">
        {/* Navigation - Sidebar for Desktop, Horizontal Scroll for Mobile */}
        <div className="lg:col-span-3 lg:self-stretch lg:min-h-0 lg:h-full lg:overflow-hidden">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden kg-scroll-x flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar scroll-smooth">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`shrink-0 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[9px] font-black uppercase tracking-wide transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20' 
                    : 'border border-brand-border bg-white text-brand-muted hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex h-full min-h-0 rounded-3xl border border-brand-border bg-white p-3 shadow-sm overflow-hidden flex-col">
            <div className="flex-none mb-3 border-b border-slate-100 px-3 pb-3 pt-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-muted">Portal bo'limlari</p>
              <p className="mt-1 text-sm font-extrabold text-brand-depth">Ota-ona portali</p>
            </div>
            <div className="kg-parent-sidebar-menu flex-1 min-h-0 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`relative w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[11px] font-black transition-all group ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-brand-depth shadow-sm ring-1 ring-rose-100' 
                    : 'text-brand-muted hover:bg-rose-50/70 hover:text-rose-600'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  activeTab === item.id ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20' : 'bg-slate-50 text-brand-muted group-hover:bg-rose-100 group-hover:text-rose-600'
                }`}>
                  <item.icon size={16} />
                </span>
                <span className="truncate uppercase tracking-[0.12em]">{item.label}</span>
                {activeTab === item.id && <span className="ml-auto h-2 w-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40"></span>}
              </button>
            ))}
            </div>
          </aside>
        </div>

        {/* Content Area */}
        <div className="kg-parent-content-column lg:col-span-9 min-h-0 h-full overflow-hidden">
          <div className="kg-parent-content-panel bg-white p-3.5 sm:p-4 md:p-5 lg:p-6 rounded-3xl border border-brand-border shadow-sm h-full min-h-0 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.3 }}
                className="kg-parent-content-scroll relative z-10 flex-1 min-h-0 h-full overflow-y-auto pr-1 custom-scrollbar"
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentView;

