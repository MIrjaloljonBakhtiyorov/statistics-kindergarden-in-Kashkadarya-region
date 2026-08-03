import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Brain,
  BookOpenCheck,
  FileText,
  MapPinned,
  RefreshCw,
  Route,
  Crown,
  Megaphone,
  History,
} from 'lucide-react';
import { apiClient, PARENT_PORTAL_API_BASE_URL } from '@/shared/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { parentsApi } from '../../features/parents/api/parentsApi';

// Import Section Components
import { ProfileSection } from '../../features/parent-portal/components/ProfileSection';
import { ParentProfileSection } from '../../features/parent-portal/components/ParentProfileSection';
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
import { LoginHistorySection } from '../../features/parent-portal/components/LoginHistorySection';


type SettingsTab = 'profile' | 'parentProfile' | 'security' | 'menu' | 'medical' | 'messages' | 'finance' | 'tariffs' | 'attendance' | 'documents' | 'pickup' | 'progress' | 'vaccines' | 'psychology' | 'nearby' | 'developmentMap' | 'education' | 'ads' | 'loginHistory';

const tabToPath: Record<SettingsTab, string> = {
  profile: 'profile',
  parentProfile: 'parent-profile',
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
  messages: 'messages',
  psychology: 'psychology',
  nearby: 'nearby-kindergartens',
  developmentMap: 'development-map',
  education: 'education',
  ads: 'ads',
  loginHistory: 'login-history'
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
  const apiBase = PARENT_PORTAL_API_BASE_URL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};

const ComingSoonSection = ({ title, description, icon: Icon, statusText = "Bu qism dasturchi tomonidan ishlab chiqilyapti" }: { title: string; description: string; icon: any; statusText?: string }) => (
  <div className="flex min-h-[420px] items-center justify-center px-3 py-8">
    <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-rose-100 bg-gradient-to-br from-white via-rose-50/45 to-white p-6 text-center shadow-sm sm:p-8">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20">
        <Icon size={30} />
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">Tez kunda</p>
      <h2 className="mt-2 text-2xl font-black leading-tight text-brand-depth sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-relaxed text-brand-muted sm:text-base">{description}</p>
      <div className="mt-6 rounded-2xl border border-rose-100 bg-white px-4 py-3">
        <p className="text-sm font-black text-brand-depth">{statusText}</p>
      </div>
    </div>
  </div>
);

const ParentView = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => getParentTabFromPath());
  const [isSaving, setIsSaving] = useState(false);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);
  const mobileNavRef = useRef<HTMLElement>(null);
  
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

  useEffect(() => {
    const nav = mobileNavRef.current;
    const activeItem = nav?.querySelector<HTMLElement>(`[data-parent-tab="${activeTab}"]`);
    if (!nav || !activeItem) return;
    if (nav.clientWidth === 0) return;

    const centeredLeft = activeItem.offsetLeft - (nav.clientWidth - activeItem.offsetWidth) / 2;
    const maxLeft = Math.max(0, nav.scrollWidth - nav.clientWidth);
    nav.scrollTo({ left: Math.min(Math.max(0, centeredLeft), maxLeft), behavior: 'auto' });
  }, [activeTab]);

  const loadMessagesUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setMessagesUnreadCount(0);
      return;
    }

    try {
      const contacts = await parentsApi.getContacts(user.id, (user as any)?.childId);
      setMessagesUnreadCount(contacts.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0));
    } catch {
      setMessagesUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    loadMessagesUnreadCount();
    const interval = window.setInterval(loadMessagesUnreadCount, 10000);
    return () => window.clearInterval(interval);
  }, [loadMessagesUnreadCount]);

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
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-brand-primary border-t-transparent rounded-full"></div>
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
        <button onClick={logout} className="px-8 py-4 bg-brand-depth text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-brand-primary flex items-center gap-3">
           <LogOut size={16} /> Chiqish
        </button>
      </div>
    );
  }

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const wantsPasswordChange = Boolean(credentials.oldPassword || credentials.newPassword || credentials.confirmPassword);
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(credentials.newPassword);

    if (wantsPasswordChange && !credentials.oldPassword) {
      showNotification("Eski parolni kiriting", "error");
      return;
    }
    if (wantsPasswordChange && !strongPassword) {
      showNotification("Yangi parol kamida 8 ta belgi, katta harf, kichik harf, son va maxsus belgidan iborat bo'lishi kerak", "error");
      return;
    }
    if (credentials.newPassword !== credentials.confirmPassword) {
      showNotification("Parollar mos kelmadi", "error");
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.put(`/parents/${user?.id}`, {
        oldPassword: credentials.oldPassword,
        password: credentials.newPassword
      });
      setCredentials((prev) => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      showNotification("Ma'lumotlar yangilandi!", 'success');
    } catch (err: any) {
      showNotification(err?.response?.data?.error || "Xatolik yuz berdi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const navItems: { id: SettingsTab; label: string; icon: any; color: string }[] = [
    { id: 'profile', label: 'Bola profili', icon: User, color: 'brand-primary' },
    { id: 'parentProfile', label: 'Ota-ona profili', icon: Users, color: 'sky-500' },
    { id: 'finance', label: "To'lovlar", icon: Wallet, color: 'rose-500' },
    { id: 'tariffs', label: 'Tariflar', icon: BadgeDollarSign, color: 'brand-primary' },
    { id: 'attendance', label: 'Davomat', icon: Calendar, color: 'indigo-500' },
    { id: 'progress', label: 'Yutuqlar', icon: Star, color: 'amber-400' },
    { id: 'developmentMap', label: 'Rivojlanish xaritasi', icon: Route, color: 'emerald-500' },
    { id: 'education', label: "Ta'lim", icon: BookOpenCheck, color: 'blue-500' },
    { id: 'psychology', label: 'Psixologik maslahat', icon: Brain, color: 'violet-500' },
    { id: 'nearby', label: "Yaqin bog'chalar", icon: MapPinned, color: 'teal-500' },
    { id: 'ads', label: 'Reklama', icon: Megaphone, color: 'amber-500' },
    { id: 'messages', label: 'Xabarlar', icon: MessageSquare, color: 'brand-primary' },
    { id: 'menu', label: 'Menyu', icon: Apple, color: 'orange-500' },
    { id: 'vaccines', label: 'Emlash', icon: Syringe, color: 'sky-500' },
    { id: 'medical', label: 'Salomatlik', icon: Activity, color: 'rose-500' },
    { id: 'pickup', label: 'Vakillar', icon: UserCheck, color: 'teal-500' },
    { id: 'documents', label: 'Hujjatlar', icon: FileText, color: 'slate-500' },
    { id: 'loginHistory', label: 'Kirish tarixi', icon: History, color: 'sky-500' },
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
  const currentTariff = 'Premium tarif';
  const renderTabContent = () => {
    const data = fullPortalData;

    switch (activeTab) {
      case 'profile': return <ProfileSection parentData={parentData} onUpdate={handleProfileUpdate} />;
      case 'parentProfile': return <ParentProfileSection parentData={parentData} onUpdate={handleProfileUpdate} />;
      case 'finance': return <FinanceSection data={data} />;
      case 'tariffs': return <TariffsSection />;
      case 'attendance': return <AttendanceSection data={data} childId={user.childId} onUpdate={handleProfileUpdate} />;
      case 'menu': return <MenuSection data={data} childId={user.childId} />;
      case 'medical': return <MedicalSection parentData={parentData} health={data?.health || []} />;
      case 'vaccines': return <VaccineSection data={data} />;
      case 'progress': return <ProgressSection data={data} />;
      case 'developmentMap':
        return (
          <ComingSoonSection
            title="Rivojlanish xaritasi"
            description="Bolaning rivojlanish bosqichlari, kuzatuvlar va tavsiyalar shu yerda xarita shaklida jamlanadi."
            icon={Route}
          />
        );
      case 'education':
        return (
          <ComingSoonSection
            title="Ta'lim"
            description="Bolaning ta'lim jarayoni, mashg'ulotlar rejasi va o'quv natijalari shu bo'limda jamlanadi."
            icon={BookOpenCheck}
            statusText="Bu qism dasturchi tomonidan ishlab chiqildi"
          />
        );
      case 'psychology':
        return (
          <ComingSoonSection
            title="Psixologik maslahat"
            description="Ota-onalar uchun psixolog tavsiyalari, suhbat yozuvlari va individual maslahatlar shu bo'limda bo'ladi."
            icon={Brain}
          />
        );
      case 'nearby':
        return (
          <ComingSoonSection
            title="Yaqin atrofdagi bog'chalar"
            description="Manzil bo'yicha yaqin MTTlarni qidirish, masofa va asosiy ma'lumotlarni ko'rish imkoniyati qo'shiladi."
            icon={MapPinned}
          />
        );
      case 'ads':
        return (
          <ComingSoonSection
            title="Reklama"
            description="Ota-onalar uchun foydali e'lonlar, maxsus takliflar va hamkorlar reklamalari shu bo'limda ko'rsatiladi."
            icon={Megaphone}
          />
        );
      case 'messages': return (
        <MessagesSection
          childName={`${parentData?.first_name || ''} ${parentData?.last_name || ''}`.trim()}
          onUnreadCountChange={setMessagesUnreadCount}
        />
      );
      case 'documents': return <DocumentsSection data={data} childId={user.childId} onUpdate={handleProfileUpdate} />;
      case 'pickup': return <PickupSection data={data} onUpdate={handleProfileUpdate} />;
      case 'loginHistory': return <LoginHistorySection childId={user.childId || ''} />;
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
    <div className="kg-page kg-parent-portal mx-auto flex h-full min-w-0 max-w-[1440px] flex-col gap-2.5 overflow-hidden bg-slate-50/30 p-2 sm:gap-3 sm:p-3 md:gap-5 md:p-5 lg:gap-6 lg:p-6">
      {/* Parent portal header */}
      <div className="kg-parent-header relative flex-none overflow-hidden rounded-[20px] border border-rose-100/90 bg-white px-3 py-3 shadow-sm sm:rounded-[24px] sm:px-4">
        <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-gradient-to-b from-rose-500 via-pink-500 to-fuchsia-500"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/55 via-white to-sky-50/40"></div>
        <div className="absolute -right-12 -top-16 hidden h-40 w-40 rounded-[42px] border border-sky-100 bg-sky-50/50 rotate-12 xl:block"></div>
        <div className="relative z-10 grid grid-cols-1 items-center gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative ml-1 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] border border-rose-100 bg-gradient-to-br from-rose-50 to-white shadow-sm sm:h-[58px] sm:w-[58px] sm:rounded-[18px]">
                {childPhotoUrl ? (
                  <img src={childPhotoUrl} alt="Bola rasmi" className="h-full w-full object-cover" />
                ) : (
                  <User size={25} className="text-rose-300" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg border-2 border-white bg-emerald-500 shadow-sm shadow-emerald-500/20">
                <CheckCircle2 size={10} className="text-white" />
              </div>
            </div>

            <div className="min-w-0 text-left">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Portal bo'limi</p>
              <h2 className="text-[25px] font-extrabold leading-[1.08] text-brand-depth sm:text-[31px]">Ota-ona profili</h2>
              <div className="mt-1.5 flex min-w-0 flex-wrap justify-start gap-1.5 text-[12px] font-bold text-brand-muted sm:mt-2 sm:gap-2">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-rose-100 bg-white px-2.5 py-1 text-rose-600 shadow-sm sm:px-3">
                  <Users size={14} className="shrink-0 text-rose-500" />
                  <span className="truncate">{parentData?.childGroup || 'Guruh biriktirilmagan'}</span>
                </span>
                <span className="kg-parent-location inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 text-brand-muted shadow-sm sm:px-3">
                  <MapPin size={14} className="shrink-0 text-rose-500" />
                  <span className="truncate">{parentData?.kindergartenDistrict || parentData?.kindergartenAddress || "Manzil kiritilmagan"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="relative grid w-full min-w-0 grid-cols-[minmax(0,1fr)_42px_96px] gap-1.5 overflow-hidden rounded-[20px] border border-amber-200 bg-white p-1.5 shadow-lg shadow-amber-100/60 sm:grid-cols-[minmax(230px,1fr)_48px_104px] sm:rounded-[22px] xl:w-[470px]">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-white to-rose-50"></div>
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent"></div>
              <button
                type="button"
                onClick={() => handleTabChange('tariffs')}
                className="group relative flex min-h-[56px] min-w-0 items-center gap-3 rounded-[16px] px-2.5 py-2 text-left transition-all hover:bg-white/75 sm:min-h-[62px] sm:rounded-[18px] sm:px-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-amber-300 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200/80 sm:h-11 sm:w-11 sm:rounded-[17px]">
                  <Crown size={19} />
                </span>
                <span className="min-w-0">
                  <span className="kg-parent-tariff-label block text-[9px] font-black uppercase tracking-[0.18em] text-amber-600">Tarif</span>
                  <span className="kg-parent-tariff-value mt-0.5 block truncate text-[17px] font-extrabold leading-tight text-brand-depth sm:text-[18px]">{currentTariff}</span>
                  <span className="mt-1 inline-flex w-fit items-center rounded-full border border-amber-200 bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-700 shadow-sm">Faol paket</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('tariffs')}
                title="Tarifni yangilash"
                className="relative my-auto flex h-10 items-center justify-center rounded-[15px] border border-amber-100 bg-white/75 text-amber-600 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-orange-600 sm:h-11 sm:rounded-[16px]"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={logout}
                title="Tizimdan chiqish"
                className="relative my-auto flex h-10 items-center justify-center gap-1.5 rounded-[15px] bg-gradient-to-r from-rose-500 to-pink-500 px-2 text-[11px] font-extrabold uppercase text-white shadow-lg shadow-rose-500/20 transition-all hover:from-rose-600 hover:to-pink-600 hover:shadow-md hover:shadow-rose-500/25 sm:h-11 sm:rounded-[16px] sm:px-3"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Chiqish</span>
              </button>
          </div>
        </div>
      </div>

      <div className="kg-parent-layout grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-2.5 sm:gap-3 md:gap-5 lg:grid-cols-12 lg:grid-rows-none lg:gap-6">
        {/* Navigation - Sidebar for Desktop, Horizontal Scroll for Mobile */}
        <div className="lg:col-span-3 lg:self-stretch lg:min-h-0 lg:h-full lg:overflow-hidden">
          {/* Mobile Menu Toggle */}
          <nav ref={mobileNavRef} aria-label="Ota-ona portali bo'limlari" className="kg-parent-mobile-nav kg-scroll-x no-scrollbar flex gap-2 overflow-x-auto px-0.5 pb-1.5 lg:hidden">
            {navItems.map(item => (
              <button
                key={item.id}
                data-parent-tab={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`relative flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[9px] font-black uppercase tracking-wide transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20' 
                    : 'border border-brand-border bg-white text-brand-muted hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
                {item.id === 'messages' && messagesUnreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {messagesUnreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

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
                {item.id === 'messages' && messagesUnreadCount > 0 ? (
                  <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black leading-none text-white shadow-sm shadow-rose-500/30">
                    {messagesUnreadCount}
                  </span>
                ) : (
                  activeTab === item.id && <span className="ml-auto h-2 w-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40"></span>
                )}
              </button>
            ))}
            </div>
          </aside>
        </div>

        {/* Content Area */}
        <div className="kg-parent-content-column lg:col-span-9 min-h-0 h-full overflow-hidden">
          <div className="kg-parent-content-panel relative flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-brand-border bg-white p-2.5 shadow-sm sm:rounded-3xl sm:p-4 md:p-5 lg:p-6">
            <div key={activeTab} className="kg-parent-content-scroll custom-scrollbar relative z-10 h-full min-h-0 min-w-0 flex-1 overflow-y-auto pr-0.5 sm:pr-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentView;

