import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '@/shared/api';
import { 
  Users, AlertTriangle, ShieldCheck, HeartPulse, Activity, 
  ArrowLeft, Search, Filter, Eye, Edit3, PlusCircle,
  Thermometer, Scale, Ruler, FileText, Calendar, Clock,
  Stethoscope, ChevronLeft, ChevronRight, AlertCircle, Plus, History, Pill,
  MessageCircle, Send, UserRound, XCircle, Check, CheckCheck, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PharmacySection from '../../features/pharmacy/components/PharmacySection';
import StaffHealthSection from '../../features/health/components/StaffHealthSection';
import NurseSanitaryPanel from '../../features/sanitary/components/NurseSanitaryPanel';
import { useAuth } from '../../context/AuthContext';
import { parentsApi } from '../../features/parents/api/parentsApi';
import { ChatMessage, DirectorChatContact } from '../../features/parents/types/parentPortal.types';

const metricStatusOptions = [
  { value: 'NORMAL', label: "Me'yorda" },
  { value: 'WATCH', label: 'Kuzatuvda' },
  { value: 'NOT_CHECKED', label: 'Tekshirilmadi' },
];

const metricStatusLabel = (value?: string | null) => {
  return metricStatusOptions.find(option => option.value === value)?.label || 'Tekshirilmadi';
};

const metricStatusClass = (value?: string | null) => {
  if (value === 'NORMAL') return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (value === 'WATCH') return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-brand-muted bg-slate-50 border-brand-border';
};

const getChatAssetUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatChatTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

const ChatMessageBody = ({ msg }: { msg: ChatMessage }) => {
  const url = getChatAssetUrl(msg.fileUrl);
  if (msg.isDeleted) {
    return <p className="text-sm font-bold italic opacity-70">Xabar o'chirildi</p>;
  }

  return (
    <div className="space-y-2">
      {msg.messageType === 'image' && url && <img src={url} alt={msg.fileName || 'Rasm'} className="max-h-64 rounded-2xl object-cover" />}
      {msg.messageType === 'video' && url && <video src={url} controls className="max-h-64 rounded-2xl" />}
      {msg.messageType === 'audio' && url && <audio src={url} controls className="w-64 max-w-full" />}
      {msg.messageType === 'file' && url && (
        <a href={url} target="_blank" rel="noreferrer" className="block underline font-black">
          {msg.fileName || 'Faylni ochish'}
        </a>
      )}
      {msg.text && <p className="text-sm font-bold leading-relaxed">{msg.text}</p>}
    </div>
  );
};

const NurseView: React.FC = () => {
  const { showNotification } = useNotification();
  
  // Data States
  const [allChildren, setAllChildren] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [childHealthSchedule, setChildHealthSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeSection, setActiveSection] = useState<'HEALTH' | 'PHARMACY' | 'SANITARY' | 'MESSAGES'>('HEALTH');
  const [healthScope, setHealthScope] = useState<'CHILDREN' | 'STAFF'>('CHILDREN');
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'GROUP' | 'PROFILE'>('DASHBOARD');
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [nurseUnreadCount, setNurseUnreadCount] = useState(0);
  
  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    child_id: '',
    status: 'Sog\'lom', // 'Sog\'lom' | 'Kasal'
    hasAllergy: 'Yo\'q', // 'Yo\'q' | 'Bor'
    allergyType: '',
    illnessType: '',
    notes: '',
    weight: '',
    height: '',
    temperature: '',
    chest_circumference: '',
    weight_status: 'NOT_CHECKED',
    height_status: 'NOT_CHECKED',
    temperature_status: 'NOT_CHECKED',
    chest_circumference_status: 'NOT_CHECKED'
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const loadNurseUnreadCount = useCallback(async () => {
    try {
      const data = await parentsApi.getRoleContacts('nurse');
      setNurseUnreadCount(data.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0));
    } catch {
      setNurseUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadNurseUnreadCount();
    const interval = window.setInterval(loadNurseUnreadCount, 10000);
    return () => window.clearInterval(interval);
  }, [loadNurseUnreadCount]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [childrenRes, groupsRes, allergiesRes, childScheduleRes] = await Promise.all([
        apiClient.get('/children'),
        apiClient.get('/groups'),
        apiClient.get('/health/allergies'),
        apiClient.get('/health/children-annual')
      ]);
      setAllChildren(childrenRes.data);
      setGroups(groupsRes.data);
      setAllergies(allergiesRes.data);
      setChildHealthSchedule(Array.isArray(childScheduleRes.data) ? childScheduleRes.data : []);
    } catch (err) {
      showNotification("Ma'lumotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupHistory = async (groupId: string) => {
    try {
      const res = await apiClient.get(`/health/history/${groupId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  // --- KPI Calculations ---
  const stats = useMemo(() => {
    const total = allChildren.length;
    // Basic age calculation from birth_date or age_category
    const age1_3 = allChildren.filter(c => c.age_category === '1-3 yosh' || c.age_category === 'Kichik yosh').length;
    const age3_7 = allChildren.filter(c => c.age_category === '3-7 yosh' || c.age_category === 'Katta yosh' || c.age_category === 'Tayyorlov guruh').length;
    // In our generic schema, 'is_allergic' might not be directly on child object, we check allergies field or watchlist
    const allergyCount = allChildren.filter(c => c.allergies && c.allergies.trim() !== '').length;
    // We assume 'status' or checking recent history for 'Kasal'. We'll approximate from allChildren if possible, or use a default if not tracked directly.
    const sickCount = allChildren.filter(c => c.medical_notes?.toLowerCase().includes('kasal') || c.status === 'SICK').length || 0; // Fallback to 0 if not tracked globally this way
    const annualDueCount = childHealthSchedule.filter(c => c.is_due).length;
    const annualCheckedCount = childHealthSchedule.filter(c => c.latest_check_date).length;

    return { total, age1_3, age3_7, sickCount, allergyCount, annualDueCount, annualCheckedCount };
  }, [allChildren, childHealthSchedule]);

  const groupSummaries = useMemo(() => {
    return groups.map(g => {
      const groupChildren = allChildren.filter(c => c.group_id === g.id);
      const sick = groupChildren.filter(c => c.medical_notes?.toLowerCase().includes('kasal') || c.status === 'SICK').length;
      const allergy = groupChildren.filter(c => c.allergies && c.allergies.trim() !== '').length;
      return { ...g, total: groupChildren.length, sick, allergy };
    });
  }, [groups, allChildren]);

  const getChildAnnualCheck = (childId: string) => {
    return childHealthSchedule.find(item => String(item.id) === String(childId));
  };

  const formatHealthDate = (value?: string | null) => {
    if (!value) return 'Kiritilmagan';
    const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const selectedChildSchedule = useMemo(() => {
    if (!selectedChild) return null;
    return getChildAnnualCheck(selectedChild.id) || null;
  }, [selectedChild, childHealthSchedule]);

  const selectedChildHistory = useMemo(() => {
    if (!selectedChild) return [];
    return history.filter(h => String(h.child_id) === String(selectedChild.id));
  }, [history, selectedChild]);

  const selectedLatestRecord = selectedChildHistory[0] || null;

  // --- Handlers ---
  const handleOpenGroup = (group: any) => {
    setSelectedGroup(group);
    fetchGroupHistory(group.id);
    setViewMode('GROUP');
  };

  const handleOpenProfile = (child: any) => {
    setSelectedChild(child);
    setViewMode('PROFILE');
  };

  const handleOpenRecordModal = (child: any) => {
    setSelectedChild(child);
    setRecordForm({
      child_id: child.id,
      status: (child.status === 'SICK' || child.medical_notes?.toLowerCase().includes('kasal')) ? 'Kasal' : 'Sog\'lom',
      hasAllergy: (child.allergies && child.allergies.trim() !== '') ? 'Bor' : 'Yo\'q',
      allergyType: child.allergies || '',
      illnessType: '',
      notes: '',
      weight: child.weight || '',
      height: child.height || '',
      temperature: '',
      chest_circumference: '',
      weight_status: child.weight ? 'NORMAL' : 'NOT_CHECKED',
      height_status: child.height ? 'NORMAL' : 'NOT_CHECKED',
      temperature_status: 'NOT_CHECKED',
      chest_circumference_status: 'NOT_CHECKED'
    });
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    try {
      const isSick = recordForm.status === 'Kasal';
      const allergyStr = recordForm.hasAllergy === 'Bor' ? recordForm.allergyType : '';
      const finalNotes = isSick && recordForm.illnessType ? `Kasallik: ${recordForm.illnessType} | ${recordForm.notes}` : recordForm.notes;

      await apiClient.post('/health/batch', {
        group_name: selectedGroup.name,
        records: [{
          child_id: recordForm.child_id,
          weight: parseFloat(recordForm.weight) || null,
          height: parseFloat(recordForm.height) || null,
          temperature: parseFloat(recordForm.temperature) || null,
          chest_circumference: parseFloat(recordForm.chest_circumference) || null,
          weight_status: recordForm.weight_status,
          height_status: recordForm.height_status,
          temperature_status: recordForm.temperature_status,
          chest_circumference_status: recordForm.chest_circumference_status,
          allergy: allergyStr,
          is_sick: isSick,
          notes: finalNotes,
          is_allergic: recordForm.hasAllergy === 'Bor'
        }]
      });
      
      showNotification("Tibbiy qayd saqlandi!", "success");
      setIsRecordModalOpen(false);
      fetchAllData();
      fetchGroupHistory(selectedGroup.id);
    } catch (err) {
      showNotification("Saqlashda xatolik yuz berdi", "error");
    }
  };

  const currentDate = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-brand-primary animate-pulse font-black text-xl">Yuklanmoqda...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-brand-border mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-brand-primary/10 text-brand-primary flex items-center justify-center rounded-xl sm:rounded-2xl">
            <HeartPulse size={20} className="sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-brand-depth tracking-tight">Hamshira Paneli</h1>
            <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest mt-0.5 sm:mt-1">Bugungi sog'liq monitoringi</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-brand-depth text-sm font-bold">{currentDate}</p>
            <p className="text-brand-muted text-[9px] font-black uppercase tracking-widest">Tizim vaqti</p>
          </div>
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-widest">Real-time</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => setActiveSection('HEALTH')}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSection === 'HEALTH'
              ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
              : 'bg-white text-brand-slate border-brand-border hover:text-brand-primary'
          }`}
        >
          <HeartPulse size={16} /> Sog'liq nazorati
        </button>
        <button
          onClick={() => setActiveSection('PHARMACY')}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSection === 'PHARMACY'
              ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
              : 'bg-white text-brand-slate border-brand-border hover:text-brand-primary'
          }`}
        >
          <Pill size={16} /> Dorixona
        </button>
        <button
          onClick={() => setActiveSection('SANITARY')}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSection === 'SANITARY'
              ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
              : 'bg-white text-brand-slate border-brand-border hover:text-brand-primary'
          }`}
        >
          <ShieldCheck size={16} /> Sanitariya
        </button>
        <button
          onClick={() => setActiveSection('MESSAGES')}
          className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSection === 'MESSAGES'
              ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
              : 'bg-white text-brand-slate border-brand-border hover:text-brand-primary'
          }`}
        >
          <MessageCircle size={16} /> Xabarlar
          {nurseUnreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white ring-2 ring-white">
              {nurseUnreadCount}
            </span>
          )}
        </button>
      </div>

      {activeSection === 'PHARMACY' ? (
        <PharmacySection />
      ) : activeSection === 'SANITARY' ? (
        <NurseSanitaryPanel />
      ) : activeSection === 'MESSAGES' ? (
        <NurseMessagesPanel onUnreadCountChange={setNurseUnreadCount} />
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            setHealthScope('CHILDREN');
            setViewMode('DASHBOARD');
          }}
          className={`p-5 rounded-[1.5rem] border text-left transition-all ${
            healthScope === 'CHILDREN'
              ? 'bg-white border-brand-primary shadow-lg shadow-brand-primary/10'
              : 'bg-white/70 border-brand-border hover:border-brand-primary/40'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${healthScope === 'CHILDREN' ? 'bg-brand-primary text-white' : 'bg-blue-50 text-blue-500'}`}>
              <Users size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-brand-depth">Bolalar salomatligi</p>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">1 yilda 1 marta</p>
            </div>
          </div>
          <p className="text-xs font-bold text-brand-slate">Yillik tibbiy ko'rik, kasallik va allergiya nazorati.</p>
        </button>

        <button
          onClick={() => {
            setHealthScope('STAFF');
            setViewMode('DASHBOARD');
          }}
          className={`p-5 rounded-[1.5rem] border text-left transition-all ${
            healthScope === 'STAFF'
              ? 'bg-white border-brand-primary shadow-lg shadow-brand-primary/10'
              : 'bg-white/70 border-brand-border hover:border-brand-primary/40'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${healthScope === 'STAFF' ? 'bg-brand-primary text-white' : 'bg-emerald-50 text-emerald-500'}`}>
              <Stethoscope size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-brand-depth">Xodimlar salomatligi</p>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Har 6 oyda</p>
            </div>
          </div>
          <p className="text-xs font-bold text-brand-slate">Xodimlarning yarim yillik tibbiy ko'rigi va xulosalari.</p>
        </button>
      </div>

      {healthScope === 'STAFF' ? (
        <StaffHealthSection />
      ) : (
        <>

      {/* DASHBOARD VIEW */}
      <AnimatePresence mode="wait">
        {viewMode === 'DASHBOARD' && (
          <motion.div key="dashboard" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-6 sm:space-y-8">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center"><Users size={16} className="sm:w-5 sm:h-5"/></div>
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest mb-1">Jami bolalar</p>
                  <p className="text-xl sm:text-3xl font-black text-brand-depth">{stats.total}</p>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center"><ShieldCheck size={16} className="sm:w-5 sm:h-5"/></div>
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest mb-1">1-3 yosh</p>
                  <p className="text-xl sm:text-3xl font-black text-brand-depth">{stats.age1_3}</p>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center"><Activity size={16} className="sm:w-5 sm:h-5"/></div>
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest mb-1">3-7 yosh</p>
                  <p className="text-xl sm:text-3xl font-black text-brand-depth">{stats.age3_7}</p>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-50 text-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center"><AlertTriangle size={16} className="sm:w-5 sm:h-5"/></div>
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest mb-1">Kasal bolalar</p>
                  <p className="text-xl sm:text-3xl font-black text-rose-500">{stats.sickCount}</p>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center"><Thermometer size={16} className="sm:w-5 sm:h-5"/></div>
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest mb-1">Allergiyasi bor</p>
                  <p className="text-xl sm:text-3xl font-black text-amber-500">{stats.allergyCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-brand-border rounded-[2rem] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-brand-depth">Bolalar yillik ko'rigi</h3>
                  <p className="text-xs font-bold text-brand-slate mt-1">
                    Har bir bola salomatligi 1 yilda 1 marta tekshiriladi.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-full lg:min-w-[420px]">
                <div className="bg-slate-50 border border-brand-border rounded-xl p-4">
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Tekshirilgan</p>
                  <p className="text-2xl font-black text-brand-depth mt-1">{stats.annualCheckedCount}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Ko'rik kerak</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{stats.annualDueCount}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 col-span-2 sm:col-span-1">
                  <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Davriylik</p>
                  <p className="text-sm font-black text-emerald-700 mt-2">1 yilda 1 marta</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* GROUP HEALTH SUMMARY */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-black text-brand-depth">Guruhlar nazorati</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupSummaries.map(g => (
                    <div 
                      key={g.id} 
                      onClick={() => handleOpenGroup(g)}
                      className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-black text-brand-depth group-hover:text-brand-primary transition-colors">{g.name}</h4>
                        <ChevronRight className="text-brand-slate group-hover:text-brand-primary group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-brand-muted" />
                          <span className="text-xs font-bold text-brand-slate">{g.total}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className={g.sick > 0 ? 'text-rose-500' : 'text-brand-muted'} />
                          <span className={`text-xs font-bold ${g.sick > 0 ? 'text-rose-500' : 'text-brand-slate'}`}>{g.sick} kasal</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer size={14} className={g.allergy > 0 ? 'text-amber-500' : 'text-brand-muted'} />
                          <span className={`text-xs font-bold ${g.allergy > 0 ? 'text-amber-500' : 'text-brand-slate'}`}>{g.allergy} allergiya</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALERTS SYSTEM */}
              <div className="space-y-6">
                <h3 className="text-xl font-black text-brand-depth">Sog'liq Ogohlantirishlari</h3>
                <div className="bg-white rounded-[2rem] border border-brand-border shadow-sm overflow-hidden p-6 space-y-4 h-full max-h-[500px] overflow-y-auto custom-scrollbar">
                  {stats.sickCount > 0 && (
                    <div className="flex gap-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in slide-in-from-right">
                      <div className="mt-1"><AlertCircle className="text-rose-500" size={20}/></div>
                      <div>
                        <p className="text-sm font-black text-rose-700">Kasal bolalar mavjud</p>
                        <p className="text-[11px] font-bold text-rose-600/80 mt-1">Tizimda bugun {stats.sickCount} ta kasal bola qayd etilgan.</p>
                      </div>
                    </div>
                  )}
                  {allergies.length > 0 && (
                    <div className="flex gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-in slide-in-from-right delay-100">
                      <div className="mt-1"><AlertCircle className="text-amber-500" size={20}/></div>
                      <div>
                        <p className="text-sm font-black text-amber-700">Allergiya nazorati</p>
                        <p className="text-[11px] font-bold text-amber-600/80 mt-1">{allergies.length} ta bolada allergiya holati aniqlangan. Menyuni tekshiring.</p>
                      </div>
                    </div>
                  )}
                  {stats.sickCount === 0 && allergies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-brand-muted">
                      <ShieldCheck size={40} className="text-emerald-500 opacity-50 mb-3" />
                      <p className="text-sm font-black uppercase tracking-widest">Barchasi joyida</p>
                      <p className="text-xs font-bold mt-1">Xavotirga o'rin yo'q</p>
                    </div>
                  )}
                  
                  {/* Miniature alert list based on real allergy data */}
                  {allergies.slice(0, 5).map((a: any, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 bg-slate-50 border border-brand-border rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-black text-brand-depth">{a.first_name} {a.last_name}</p>
                        <p className="text-[9px] font-bold text-brand-muted mt-0.5">{a.allergies}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* GROUP VIEW */}
        {viewMode === 'GROUP' && selectedGroup && (
          <motion.div key="group" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setViewMode('DASHBOARD')} className="w-12 h-12 bg-white rounded-[1rem] border border-brand-border flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <ArrowLeft size={20} className="text-brand-depth" />
                </button>
                <div>
                  <h2 className="text-3xl font-black text-brand-depth">{selectedGroup.name}</h2>
                  <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest mt-1">Guruh sog'liq jurnali</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                <input 
                  type="text" 
                  placeholder="Ism bo'yicha qidirish..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 bg-white border border-brand-border rounded-[1rem] py-3 pl-12 pr-4 font-bold text-sm outline-none focus:border-brand-primary transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-brand-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-brand-muted tracking-widest border-b border-brand-border">
                      <th className="px-8 py-6">Bola F.I.Sh</th>
                      <th className="px-6 py-6">Guruh</th>
                      <th className="px-6 py-6">Yosh</th>
                      <th className="px-6 py-6">Holat</th>
                      <th className="px-6 py-6">Allergiya</th>
                      <th className="px-6 py-6">Yillik ko'rik</th>
                      <th className="px-8 py-6 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allChildren
                      .filter(c => c.group_id === selectedGroup.id)
                      .filter(c => (c.first_name + ' ' + c.last_name).toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((child: any) => {
                        const isSick = child.medical_notes?.toLowerCase().includes('kasal') || child.status === 'SICK';
                        const hasAllergy = child.allergies && child.allergies.trim() !== '';
                        const annualCheck = getChildAnnualCheck(child.id);

                        return (
                          <tr key={child.id} className="hover:bg-brand-primary/[0.02] transition-colors group">
                            <td className="px-8 py-5">
                              <p className="text-sm font-black text-brand-depth">{child.first_name} {child.last_name}</p>
                            </td>
                            <td className="px-6 py-5 text-xs font-bold text-brand-slate">{selectedGroup.name}</td>
                            <td className="px-6 py-5 text-xs font-bold text-brand-slate">{child.age_category || '-'}</td>
                            <td className="px-6 py-5">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isSick ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isSick ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                {isSick ? 'Kasal' : 'Sog\'lom'}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasAllergy ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-brand-muted border border-brand-border'}`}>
                                {hasAllergy ? 'вљ  Bor' : 'вќЊ Yo\'q'}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                                annualCheck?.is_due ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${annualCheck?.is_due ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                {annualCheck?.is_due ? 'Ko\'rik kerak' : 'Me\'yorda'}
                              </div>
                              <p className="text-[10px] font-bold text-brand-muted mt-2">
                                Oxirgi: {formatHealthDate(annualCheck?.latest_check_date)}
                              </p>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenProfile(child)} className="p-2 text-brand-slate hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors" title="Ko'rish">
                                  <Eye size={18} />
                                </button>
                                <button onClick={() => handleOpenRecordModal(child)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                                  <PlusCircle size={14} /> Qayd qilish
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* PROFILE VIEW */}
        {viewMode === 'PROFILE' && selectedChild && (
          <motion.div key="profile" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="space-y-6">
            <button onClick={() => setViewMode('GROUP')} className="flex items-center gap-2 text-brand-muted hover:text-brand-primary font-black text-[10px] uppercase tracking-widest transition-colors mb-4">
              <ArrowLeft size={16} /> Jadvalga qaytish
            </button>

            <section className="bg-white rounded-[2.5rem] border border-brand-border shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-brand-border flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-depth">Tibbiy ko'rik kartasi</h2>
                    <p className="text-xs font-bold text-brand-slate mt-2">
                      {selectedChild.first_name} {selectedChild.last_name} uchun yillik ko'rik, oxirgi qayd va asosiy o'lchovlar.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenRecordModal(selectedChild)}
                  className="px-5 py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={16} /> Yangi ko'rik qaydi
                </button>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 xl:grid-cols-4 gap-4">
                <div className="xl:col-span-2 bg-slate-50 border border-brand-border rounded-[1.5rem] p-5">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Yillik ko'rik holati</p>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4">
                    <div>
                      <p className={`text-3xl font-black ${(selectedChildSchedule?.is_due ?? true) ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {(selectedChildSchedule?.is_due ?? true) ? "Ko'rik kerak" : "Me'yorda"}
                      </p>
                      <p className="text-xs font-bold text-brand-muted mt-2">Davriylik: 1 yilda 1 marta</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-full sm:min-w-[320px]">
                      <div className="bg-white border border-brand-border rounded-xl p-4">
                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Oxirgi</p>
                        <p className="text-sm font-black text-brand-depth mt-2">{formatHealthDate(selectedChildSchedule?.latest_check_date)}</p>
                      </div>
                      <div className="bg-white border border-brand-border rounded-xl p-4">
                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Keyingi</p>
                        <p className="text-sm font-black text-brand-depth mt-2">{formatHealthDate(selectedChildSchedule?.next_check_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-[1.5rem] p-5">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Harorat</p>
                  <p className="text-3xl font-black text-blue-700 mt-3">
                    {selectedLatestRecord?.temperature ? `${selectedLatestRecord.temperature} C` : 'Kiritilmagan'}
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-[1.5rem] p-5">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Vazn / Bo'y</p>
                  <p className="text-3xl font-black text-emerald-700 mt-3">
                    {selectedLatestRecord?.weight || selectedChild.weight || '-'} kg
                  </p>
                  <p className="text-sm font-black text-emerald-700/80 mt-1">
                    {selectedLatestRecord?.height || selectedChild.height || '-'} sm
                  </p>
                </div>

                <div className="bg-violet-50 border border-violet-100 rounded-[1.5rem] p-5">
                  <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">Ko'krak qafasi</p>
                  <p className="text-3xl font-black text-violet-700 mt-3">
                    {selectedLatestRecord?.chest_circumference || '-'} sm
                  </p>
                </div>

                <div className="xl:col-span-3 bg-white border border-brand-border rounded-[1.5rem] p-5">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Tekshiruv statuslari</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      ["Bo'y", selectedLatestRecord?.height_status],
                      ['Vazn', selectedLatestRecord?.weight_status],
                      ['Tana harorati', selectedLatestRecord?.temperature_status],
                      ["Ko'krak qafasi", selectedLatestRecord?.chest_circumference_status],
                    ].map(([label, status]) => (
                      <div key={label} className={`border rounded-xl p-3 ${metricStatusClass(status as string)}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
                        <p className="text-sm font-black mt-2">{metricStatusLabel(status as string)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-2 bg-white border border-brand-border rounded-[1.5rem] p-5">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Allergiya</p>
                  <p className={`text-xl font-black mt-3 ${selectedChild.allergies ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {selectedChild.allergies || "Yo'q"}
                  </p>
                </div>

                <div className="xl:col-span-2 bg-white border border-brand-border rounded-[1.5rem] p-5">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Oxirgi izoh</p>
                  <p className="text-sm font-bold text-brand-depth mt-3 leading-relaxed">
                    {selectedLatestRecord?.notes || selectedChild.medical_notes || 'Tibbiy izoh kiritilmagan.'}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-brand-border shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-primary/20 to-blue-500/20 text-brand-primary rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                  <Stethoscope size={40} />
                </div>
                <h2 className="text-2xl font-black text-brand-depth">{selectedChild.first_name} {selectedChild.last_name}</h2>
                <p className="text-brand-muted font-bold text-sm mt-1">{selectedChild.age_category || 'Yosh kiritilmagan'} - {selectedGroup?.name}</p>
                
                <div className="w-full mt-8 space-y-4">
                  <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-brand-border">
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Joriy Holat</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${(selectedChild.status === 'SICK' || selectedChild.medical_notes?.toLowerCase().includes('kasal')) ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {(selectedChild.status === 'SICK' || selectedChild.medical_notes?.toLowerCase().includes('kasal')) ? 'Kasal' : 'Sog\'lom'}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-brand-border">
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Allergiya</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedChild.allergies ? 'text-amber-500' : 'text-brand-slate'}`}>
                      {selectedChild.allergies || "Yo'q"}
                    </span>
                  </div>
                  <button onClick={() => handleOpenRecordModal(selectedChild)} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2">
                    <Edit3 size={16} /> Yangi Qayd Qo'shish
                  </button>
                </div>
              </div>

              {/* Timeline & History */}
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-brand-border shadow-sm h-[600px] overflow-y-auto custom-scrollbar">
                <h3 className="text-xl font-black text-brand-depth mb-6 flex items-center gap-2"><History size={20} className="text-brand-primary"/> Tibbiy Tarix (Timeline)</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-border before:to-transparent">
                  {history.filter(h => h.child_id === selectedChild.id).length > 0 ? (
                    history.filter(h => h.child_id === selectedChild.id).map((record, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 text-brand-slate group-[.is-active]:bg-emerald-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          {record.is_sick ? <AlertTriangle size={14}/> : <Activity size={14}/>}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-brand-border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-brand-depth text-sm">{record.is_sick ? 'Kasallik qayd etildi' : 'Sog\'lom ko\'rik'}</span>
                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{record.date}</span>
                          </div>
                          <div className="space-y-1 mt-3 text-xs text-brand-slate font-medium">
                            {record.temperature && <p>Harorat: {record.temperature}В°C</p>}
                            {record.weight && <p>Vazn: {record.weight}kg</p>}
                            {record.height && <p>Bo'y: {record.height}sm</p>}
                            {record.chest_circumference && <p>Ko'krak qafasi: {record.chest_circumference}sm</p>}
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {[
                                ["Bo'y", record.height_status],
                                ['Vazn', record.weight_status],
                                ['Harorat', record.temperature_status],
                                ['Ko\'krak', record.chest_circumference_status],
                              ].map(([label, status]) => (
                                <span key={label} className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${metricStatusClass(status as string)}`}>
                                  {label}: {metricStatusLabel(status as string)}
                                </span>
                              ))}
                            </div>
                            {record.notes && <p className="mt-2 text-brand-depth italic bg-slate-50 p-2 rounded-lg">"{record.notes}"</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-brand-muted font-bold text-sm italic">
                      Bu bola uchun tibbiy tarix mavjud emas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEDICAL RECORD MODAL */}
      <AnimatePresence>
        {isRecordModalOpen && selectedChild && (
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[10px] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/20 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-brand-depth tracking-tight">Tibbiy Qayd</h3>
                  <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">Holatni va ko'rik natijalarini kiritish</p>
                </div>
                <button onClick={() => setIsRecordModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all font-black text-xl">&times;</button>
              </div>
              
              <form onSubmit={handleSaveRecord} className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-[10px] border border-brand-border flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-primary"><Users size={24}/></div>
                  <div>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Bemor (Bola)</p>
                    <p className="text-lg font-black text-brand-depth">{selectedChild.first_name} {selectedChild.last_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Umumiy Holat</label>
                    <select 
                      value={recordForm.status} 
                      onChange={e => setRecordForm({...recordForm, status: e.target.value})}
                      className={`w-full bg-white border-2 rounded-[10px] p-4 font-black outline-none transition-colors ${recordForm.status === 'Kasal' ? 'border-rose-100 text-rose-600 focus:border-rose-400' : 'border-emerald-100 text-emerald-600 focus:border-emerald-400'}`}
                    >
                      <option value="Sog'lom">Sog'lom</option>
                      <option value="Kasal">Kasal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Allergiya holati</label>
                    <select 
                      value={recordForm.hasAllergy} 
                      onChange={e => setRecordForm({...recordForm, hasAllergy: e.target.value})}
                      className={`w-full bg-white border-2 rounded-[10px] p-4 font-black outline-none transition-colors ${recordForm.hasAllergy === 'Bor' ? 'border-amber-100 text-amber-600 focus:border-amber-400' : 'border-slate-100 text-brand-slate focus:border-brand-primary'}`}
                    >
                      <option value="Yo'q">Yo'q</option>
                      <option value="Bor">Bor</option>
                    </select>
                  </div>
                </div>

                {recordForm.hasAllergy === 'Bor' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Allergiya turi</label>
                    <input 
                      required
                      placeholder="Masalan: Sutga, Sitrus mevalarga..."
                      value={recordForm.allergyType}
                      onChange={e => setRecordForm({...recordForm, allergyType: e.target.value})}
                      className="w-full bg-amber-50/50 border border-amber-200 rounded-[10px] p-4 font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                )}

                {recordForm.status === 'Kasal' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Kasallik turi (Tashxis)</label>
                    <input 
                      required
                      placeholder="Masalan: O'RVI, Shamollash..."
                      value={recordForm.illnessType}
                      onChange={e => setRecordForm({...recordForm, illnessType: e.target.value})}
                      className="w-full bg-rose-50/50 border border-rose-200 rounded-[10px] p-4 font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-brand-border pt-6 mt-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Harorat (В°C)</label>
                    <input 
                      type="number" step="0.1" placeholder="36.6"
                      value={recordForm.temperature} onChange={e => setRecordForm({...recordForm, temperature: e.target.value})}
                      className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Vazn (kg)</label>
                    <input 
                      type="number" step="0.1" placeholder="15.5"
                      value={recordForm.weight} onChange={e => setRecordForm({...recordForm, weight: e.target.value})}
                      className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Bo'y (sm)</label>
                    <input 
                      type="number" step="1" placeholder="105"
                      value={recordForm.height} onChange={e => setRecordForm({...recordForm, height: e.target.value})}
                      className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Ko'krak qafasi (sm)</label>
                    <input 
                      type="number" step="0.1" placeholder="54"
                      value={recordForm.chest_circumference} onChange={e => setRecordForm({...recordForm, chest_circumference: e.target.value})}
                      className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricStatusSelect label="Harorat statusi" value={recordForm.temperature_status} onChange={(value) => setRecordForm({...recordForm, temperature_status: value})} />
                  <MetricStatusSelect label="Vazn statusi" value={recordForm.weight_status} onChange={(value) => setRecordForm({...recordForm, weight_status: value})} />
                  <MetricStatusSelect label="Bo'y statusi" value={recordForm.height_status} onChange={(value) => setRecordForm({...recordForm, height_status: value})} />
                  <MetricStatusSelect label="Ko'krak statusi" value={recordForm.chest_circumference_status} onChange={(value) => setRecordForm({...recordForm, chest_circumference_status: value})} />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Izoh va Ko'rsatmalar</label>
                  <textarea 
                    rows={3}
                    placeholder="Qo'shimcha tibbiy ko'rsatmalar yoki dori-darmonlar..."
                    value={recordForm.notes}
                    onChange={e => setRecordForm({...recordForm, notes: e.target.value})}
                    className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-bold outline-none focus:border-brand-primary resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-brand-border">
                  <button type="submit" className="w-full py-5 bg-brand-primary text-white rounded-[10px] font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-brand-primary/30 hover:bg-brand-primary/90 transition-all active:scale-95">
                    Saqlash va Qayd etish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
        </>
      )}

    </div>
  );
};

const NurseMessagesPanel = ({ onUnreadCountChange }: { onUnreadCountChange?: (count: number) => void }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [contacts, setContacts] = useState<DirectorChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<DirectorChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const kindergartenId = String(user?.kindergarten_id || window.location.pathname.split('/').filter(Boolean)[1] || user?.id || '');
  const nurseId = kindergartenId ? `role_nurse_${kindergartenId}` : '';

  const filteredContacts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) =>
      [contact.name, contact.childName, contact.childGroup, contact.login]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [contacts, searchTerm]);

  const loadContacts = useCallback(async () => {
    try {
      const data = await parentsApi.getRoleContacts('nurse');
      setContacts(data);
      onUnreadCountChange?.(data.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0));
      setActiveContact((current) => {
        if (!current) return current;
        return data.find((contact) => String(contact.id) === String(current.id)) || current;
      });
    } catch (error) {
      console.error('Failed to load nurse contacts:', error);
      setContacts([]);
      onUnreadCountChange?.(0);
    } finally {
      setIsContactsLoading(false);
    }
  }, [onUnreadCountChange]);

  const loadMessages = useCallback(async () => {
    if (!nurseId || !activeContact) {
      setMessages([]);
      return;
    }

    setIsMessagesLoading(true);
    try {
      const data = await parentsApi.getMessages(nurseId, activeContact.id, {
        userRole: 'nurse',
        contactRole: 'parent',
      });
      setMessages(data);

      if (activeContact.unreadCount > 0) {
        await parentsApi.markAsRead(nurseId, activeContact.id, {
          userRole: 'nurse',
          contactRole: 'parent',
        });
        loadContacts();
      }
    } catch (error) {
      console.error('Failed to load nurse messages:', error);
      setMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, [activeContact, nurseId, loadContacts]);

  useEffect(() => {
    loadContacts();
    const interval = window.setInterval(loadContacts, 10000);
    return () => window.clearInterval(interval);
  }, [loadContacts]);

  useEffect(() => {
    if (activeContact) loadMessages();
  }, [activeContact, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setEditingMessage(null);
    setChatMessage('');
  }, [activeContact?.id]);

  const handleSendMessage = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    const text = chatMessage.trim();
    if (!text || !activeContact || !nurseId) return;

    setChatMessage('');
    try {
      if (editingMessage) {
        const updatedMessage = await parentsApi.editMessage(editingMessage.id, {
          userId: nurseId,
          userRole: 'nurse',
          text,
        });
        setMessages((prev) => prev.map((msg) => String(msg.id) === String(updatedMessage.id) ? { ...updatedMessage, type: 'sent' } : msg));
        setEditingMessage(null);
        showNotification('Xabar tahrirlandi', 'success');
        loadContacts();
        return;
      }

      await parentsApi.sendMessage({
        senderId: nurseId,
        receiverId: activeContact.id,
        text,
        senderRole: 'nurse',
        receiverRole: 'parent',
        messageType: 'text',
      });
      await loadMessages();
      loadContacts();
      showNotification('Xabar ota-onaga yuborildi', 'success');
    } catch (error) {
      showNotification('Xabar yuborishda xatolik', 'error');
      setChatMessage(text);
    }
  };

  const handleEditMessage = (msg: ChatMessage) => {
    if (msg.isDeleted) return;
    setEditingMessage(msg);
    setChatMessage(msg.text || '');
  };

  const handleDeleteMessage = async (msg: ChatMessage) => {
    if (!nurseId) return;
    try {
      const deletedMessage = await parentsApi.deleteMessage(msg.id, { userId: nurseId, userRole: 'nurse' });
      setMessages((prev) => prev.map((item) => String(item.id) === String(msg.id) ? { ...deletedMessage, type: 'sent' } : item));
      if (editingMessage && String(editingMessage.id) === String(msg.id)) {
        setEditingMessage(null);
        setChatMessage('');
      }
      loadContacts();
      showNotification("Xabar o'chirildi", 'success');
    } catch {
      showNotification("Xabarni o'chirishda xatolik", 'error');
    }
  };

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-white shadow-[0_20px_52px_rgba(16,185,129,0.09)]">
      <div className="flex flex-col gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <MessageCircle size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Ota-onalar bilan aloqa</p>
            <h4 className="truncate text-lg font-black text-brand-depth sm:text-xl">Hamshira xabarlari</h4>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-muted">
            {contacts.length} suhbat
          </div>
          {contacts.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0) > 0 && (
            <div className="rounded-full bg-rose-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20">
              {contacts.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0)} yangi
            </div>
          )}
        </div>
      </div>

      <div className="flex h-[640px] min-h-0 flex-col lg:flex-row">
        <aside className={`${activeContact ? 'hidden lg:flex' : 'flex'} min-h-0 w-full flex-col border-r border-emerald-50 bg-slate-50/55 lg:w-[360px]`}>
          <div className="border-b border-emerald-50 p-4">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-brand-muted shadow-sm">
              <Search size={17} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ota-ona yoki bola qidirish..."
                className="min-w-0 flex-1 bg-transparent text-xs font-bold text-brand-depth outline-none"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 custom-scrollbar">
            {isContactsLoading ? (
              <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-brand-muted">Yuklanmoqda...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Ota-ona suhbati topilmadi</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-500 ${
                    activeContact?.id === contact.id ? 'border-emerald-500 bg-white shadow-md' : 'border-slate-100 bg-white/85'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                        <UserRound size={20} />
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-xs font-black uppercase tracking-wide text-brand-depth">{contact.name}</p>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {contact.lastMessageAt && <span className="text-[9px] font-black text-brand-muted">{formatChatTime(contact.lastMessageAt)}</span>}
                          {contact.unreadCount > 0 && (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                              {contact.unreadCount} yangi
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 truncate text-[10px] font-bold text-emerald-600">{contact.childName || 'Bola biriktirilmagan'}</p>
                      <p className="mt-1 truncate text-[10px] font-semibold text-brand-muted">{contact.lastMessage || contact.childGroup || contact.login || 'Xabar yozish mumkin'}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className={`${activeContact ? 'flex' : 'hidden lg:flex'} min-h-0 flex-1 flex-col bg-white`}>
          {!activeContact ? (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                <MessageCircle size={40} />
              </div>
              <h5 className="text-lg font-black uppercase text-brand-depth">Suhbat tanlang</h5>
              <p className="mt-2 max-w-sm text-sm font-semibold text-brand-muted">Ota-onadan kelgan tibbiy xabarlarni ko'rish yoki javob yozish uchun chap ro'yxatdan suhbatni oching.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-emerald-50 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button onClick={() => setActiveContact(null)} className="lg:hidden rounded-xl p-2 text-brand-muted hover:bg-slate-50 hover:text-emerald-600">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <UserRound size={20} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="truncate text-base font-black text-brand-depth">{activeContact.name}</h5>
                    <p className="truncate text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      {activeContact.childName || activeContact.login || 'Ota-ona'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50/55 to-white p-4 sm:p-6 custom-scrollbar">
                {isMessagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageCircle size={42} className="text-slate-300" />
                    <p className="mt-3 max-w-xs text-sm font-bold text-brand-muted">Hali xabar yo'q. Birinchi xabarni hamshira nomidan yuborishingiz mumkin.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSent = msg.type === 'sent';
                    return (
                      <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`group relative max-w-[82%] rounded-3xl px-4 py-3 shadow-sm ${
                          isSent ? 'rounded-tr-md bg-emerald-600 text-white' : 'rounded-tl-md border border-slate-100 bg-white text-brand-depth'
                        }`}>
                          {isSent && !msg.isDeleted && (
                            <div className="absolute -left-20 top-2 hidden items-center gap-1 rounded-full border border-slate-100 bg-white p-1 shadow-sm group-hover:flex">
                              <button onClick={() => handleEditMessage(msg)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-50 hover:text-emerald-600" title="Tahrirlash">
                                <Edit3 size={13} />
                              </button>
                              <button onClick={() => handleDeleteMessage(msg)} className="rounded-full p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-500" title="O'chirish">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                          <ChatMessageBody msg={msg} />
                          <div className={`mt-2 flex items-center justify-end gap-1 text-[9px] font-black ${isSent ? 'text-white/75' : 'text-brand-muted'}`}>
                            <span>{formatChatTime(msg.time)}</span>
                            {isSent && (msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-emerald-50 bg-white p-4">
                {editingMessage && (
                  <div className="mb-3 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Xabar tahrirlanmoqda</p>
                      <p className="truncate text-xs font-bold text-brand-depth">{editingMessage.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMessage(null);
                        setChatMessage('');
                      }}
                      className="shrink-0 text-brand-muted hover:text-rose-500"
                      title="Bekor qilish"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 rounded-3xl border-2 border-slate-100 bg-slate-50 px-4 py-3 transition-all focus-within:border-emerald-500 focus-within:bg-white">
                  <input
                    value={chatMessage}
                    onChange={(event) => setChatMessage(event.target.value)}
                    placeholder="Ota-onaga tibbiy xabar yozish..."
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm font-bold text-brand-depth outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 disabled:opacity-45"
                    title={editingMessage ? 'Saqlash' : 'Yuborish'}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const MetricStatusSelect = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="space-y-2 block">
    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
    >
      {metricStatusOptions.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

export default NurseView;

