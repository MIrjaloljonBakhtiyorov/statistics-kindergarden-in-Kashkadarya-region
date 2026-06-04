import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Activity,
  MapPin,
  Calendar,
  UserCheck,
  Target,
  Users,
  ShieldAlert,
  Wallet,
  Star,
  Syringe,
  Apple,
  FileText,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '@/shared/api';
import { ThemeToggle } from '@/shared/theme/theme';
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


type SettingsTab = 'profile' | 'security' | 'menu' | 'medical' | 'messages' | 'finance' | 'attendance' | 'documents' | 'pickup' | 'progress' | 'vaccines';

const getAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};

const getAttendancePercent = (records: any[] = []) => {
  if (!records.length) return null;
  const present = records.filter((item) => ['PRESENT', 'KELDI', 'EARLY', 'LATE'].includes(String(item.status || '').toUpperCase())).length;
  return Math.round((present / records.length) * 100);
};

const getHealthLabel = (parentData: any, fullPortalData: any) => {
  const latestHealth = fullPortalData?.health?.[0];
  if (parentData?.allergies || latestHealth?.allergy) return 'Allergiya bor';
  if (parentData?.medical_notes || latestHealth?.notes) return 'Nazoratda';
  return "Ma'lumot yo'q";
};

const ParentView = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    { id: 'security', label: 'Xavfsizlik', icon: ShieldCheck, color: 'blue-500' },
    { id: 'finance', label: 'Moliya', icon: Wallet, color: 'emerald-500' },
    { id: 'attendance', label: 'Davomat', icon: Calendar, color: 'indigo-500' },
    { id: 'progress', label: 'Yutuqlar', icon: Star, color: 'amber-400' },
    { id: 'medical', label: 'Salomatlik', icon: Activity, color: 'rose-500' },
    { id: 'vaccines', label: 'Emlash', icon: Syringe, color: 'sky-500' },
    { id: 'menu', label: 'Menyu', icon: Apple, color: 'orange-500' },
    { id: 'documents', label: 'Hujjatlar', icon: FileText, color: 'slate-500' },
    { id: 'pickup', label: 'Vakillar', icon: UserCheck, color: 'teal-500' },
    { id: 'messages', label: 'Xabarlar', icon: MessageSquare, color: 'brand-primary' },
  ];

  const handleProfileUpdate = () => {
    if (user?.childId) {
      fetchPortalData(user.childId);
    }
  };

  const childPhotoUrl = getAssetUrl(parentData?.photo_url);
  const attendanceRate = getAttendancePercent(fullPortalData?.attendance || []);
  const healthLabel = getHealthLabel(parentData, fullPortalData);

  const renderTabContent = () => {
    const data = fullPortalData;

    switch (activeTab) {
      case 'profile': return <ProfileSection parentData={parentData} onUpdate={handleProfileUpdate} />;
      case 'finance': return <FinanceSection data={data} />;
      case 'attendance': return <AttendanceSection data={data} childId={user.childId} onUpdate={handleProfileUpdate} />;
      case 'menu': return <MenuSection data={data} childId={user.childId} />;
      case 'medical': return <MedicalSection parentData={parentData} />;
      case 'vaccines': return <VaccineSection data={data} />;
      case 'progress': return <ProgressSection data={data} />;
      case 'messages': return <MessagesSection />;
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
    <div className="max-w-[1440px] mx-auto p-3 md:p-6 lg:p-8 space-y-5 md:space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header Profile Summary - Fully Responsive */}
      <div className="relative p-5 md:p-8 lg:p-10 bg-brand-depth rounded-[2rem] md:rounded-[3rem] text-white shadow-xl overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 w-48 md:w-[350px] h-48 md:h-[350px] bg-brand-primary/10 rounded-full blur-[60px] md:blur-[100px] -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-8 text-center md:text-left">
          <div className="relative shrink-0">
             <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl border-2 border-white/10 p-0.5 bg-white/5 shadow-xl flex items-center justify-center">
                {childPhotoUrl ? (
                  <img src={childPhotoUrl} alt="Bola rasmi" className="w-full h-full rounded-[1rem] md:rounded-[1.35rem] object-cover" />
                ) : (
                  <>
                    <User size={32} className="text-white/20 md:hidden" />
                    <User size={48} className="text-white/20 hidden md:block" />
                  </>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-brand-depth shadow-lg">
                   <CheckCircle2 size={12} className="text-white md:w-4 md:h-4" />
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-3 md:space-y-4">
             <div className="space-y-1">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                   <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight uppercase leading-tight">{parentData?.first_name} {parentData?.last_name}</h2>
                   {parentData?.kindergartenName && (
                     <div className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-[7px] md:text-[9px] font-black uppercase rounded-md tracking-widest border border-brand-primary/30">
                       {parentData.kindergartenName}
                     </div>
                   )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6 text-white/60">
                   <p className="font-bold text-[9px] md:text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-brand-primary" /> {parentData?.childGroup || 'Guruh biriktirilmagan'}
                   </p>
                   <p className="font-bold text-[9px] md:text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={14} className="text-brand-primary" /> {parentData?.kindergartenDistrict || parentData?.kindergartenAddress || "Manzil kiritilmagan"}
                   </p>
                </div>
             </div>

             <div className="flex flex-wrap justify-center md:justify-start items-center gap-5 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10"><Target size={14} className="text-brand-primary" /></div>
                   <div className="text-left">
                      <p className="text-[7px] font-black text-white/40 uppercase tracking-wide">Davomat</p>
                      <p className="text-base font-black leading-none">{attendanceRate == null ? '--' : `${attendanceRate}%`}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10"><Activity size={14} className="text-emerald-400" /></div>
                   <div className="text-left">
                      <p className="text-[7px] font-black text-white/40 uppercase tracking-wide">Salomatlik</p>
                      <p className="text-base font-black leading-none">{healthLabel}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="absolute top-3 right-3 md:static flex items-center gap-2">
             <ThemeToggle className="p-2 md:p-3.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/10 text-white" />
             <button onClick={logout} className="p-2 md:p-3.5 bg-white/5 rounded-xl hover:bg-rose-500 transition-all border border-white/10 group"><LogOut size={16} className="md:w-5 md:h-5" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8">
        {/* Navigation - Sidebar for Desktop, Horizontal Scroll for Mobile */}
        <div className="lg:col-span-3">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex overflow-x-auto pb-3 gap-2 no-scrollbar scroll-smooth px-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-105' 
                    : 'bg-white text-brand-muted border border-brand-border'
                }`}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block bg-white p-5 rounded-[2.5rem] border border-brand-border shadow-sm space-y-1.5 sticky top-8">
            <p className="text-[9px] font-black text-brand-depth uppercase tracking-[0.2em] px-5 py-3 border-b border-slate-50 mb-3">Navigatsiya</p>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-[1.5rem] font-black text-[11px] transition-all group ${
                  activeTab === item.id 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 translate-x-1' 
                    : 'text-brand-muted hover:bg-slate-50 hover:text-brand-depth'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-brand-muted group-hover:text-brand-primary'} />
                <span className="uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-white p-5 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-brand-border shadow-sm min-h-[500px] relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-10 gap-4 text-center md:text-left">
               <div>
                  <h1 className="text-xl md:text-3xl font-black text-brand-depth tracking-tight uppercase">{navItems.find(n => n.id === activeTab)?.label}</h1>
                  <div className="text-brand-muted text-[7px] md:text-[9px] font-black mt-1.5 uppercase tracking-[0.25em] flex items-center justify-center md:justify-start gap-2">
                     <div className="w-4 md:w-6 h-px bg-brand-primary/30"></div> Portal Xizmati
                  </div>
               </div>
               <div className="flex gap-2.5">
                  <div className="p-2.5 md:p-3 bg-brand-ghost rounded-xl md:rounded-2xl text-brand-muted border border-brand-border relative cursor-pointer hover:text-brand-primary transition-colors">
                     <Bell size={18} className="md:w-5 md:h-5" />
                     <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="p-2.5 md:p-3 bg-brand-ghost rounded-xl md:rounded-2xl text-brand-muted border border-brand-border cursor-pointer hover:text-brand-primary transition-colors">
                     <Settings size={18} className="md:w-5 md:h-5" />
                  </div>
               </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.3 }}
                className="relative z-10"
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

