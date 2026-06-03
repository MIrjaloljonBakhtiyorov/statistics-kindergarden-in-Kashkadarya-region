import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/shared/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Thermometer,
  Calendar,
  Users,
  Utensils,
  Clock as LucideClock,
  History as HistoryIcon,
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  CheckCheck,
  Check,
  User,
  XCircle as XIcon,
  AlertCircle
} from 'lucide-react';
import { Group } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { useGroups } from '../../features/groups/hooks/useGroups';
import { useAuth } from '../../context/AuthContext';
import { parentsApi } from '../../features/parents/api/parentsApi';
import { ChatMessage } from '../../features/parents/types/parentPortal.types';

interface TeacherViewProps {
  groups: Group[];
}

type AttendanceStatus = 'early' | 'late' | 'absent';

const ATTENDANCE_CUTOFF_LABEL = '09:30';
const ATTENDANCE_CUTOFF_TIME = `${ATTENDANCE_CUTOFF_LABEL}:00`;
const EARLY_ATTENDANCE_FALLBACK_TIME = '09:29:00';
const LATE_ATTENDANCE_FALLBACK_TIME = '09:31:00';

const isAfterAttendanceCutoff = (date = new Date()) => {
  const cutoff = new Date(date);
  cutoff.setHours(9, 30, 0, 0);
  return date > cutoff;
};

const getChatAssetUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getChatFileType = (file?: File) => {
  if (!file) return 'text';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'file';
};

const ChatMessageBody = ({ msg }: { msg: ChatMessage }) => {
  const url = getChatAssetUrl(msg.fileUrl);
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


const TeacherView: React.FC<TeacherViewProps> = ({ groups: initialGroups }) => {
  const { groups, refetch: refetchGroups } = useGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'attendance' | 'messages'>('attendance');
  const { showNotification } = useNotification();
  
  const [todayStats, setTodayStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    sick: 0,
    late: 0
  });

  const displayGroups = groups.length > 0 ? groups : initialGroups;

  const fetchTodayStats = useCallback(async () => {
    try {
      const groupIds = displayGroups.map(g => (g as any).id).filter(Boolean).join(',');
      const url = groupIds 
        ? `/attendance/today-stats?groupIds=${groupIds}` 
        : `/attendance/today-stats`;
      const res = await apiClient.get(url);

      setTodayStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [displayGroups.length]); // Use length as dependency to stabilize, or empty [] if we only want initial load

  useEffect(() => {
    fetchTodayStats();
  }, [fetchTodayStats]);

  useEffect(() => {
    refetchGroups();
  }, []); // Only refetch on mount if needed, or rely on useGroups initial fetch

  if (!selectedGroup) {
    const totalKids = todayStats.total;
    const earlyArrivals = todayStats.present - todayStats.late;
    const lateArrivals = todayStats.late;
    const notArrived = todayStats.absent + todayStats.sick;
    const mealPortions = todayStats.present; 

    return (
      <div className="p-4 sm:p-8 animate-in fade-in max-w-7xl mx-auto space-y-6 sm:space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-depth tracking-tight">Xush kelibsiz!</h2>
            <p className="text-brand-muted font-bold uppercase text-[9px] sm:text-[10px] tracking-widest mt-1 sm:mt-2 flex items-center gap-2">
              <Calendar size={14} className="text-brand-primary" />
              Bugun: {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-brand-border shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-brand-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
              <Users size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black text-brand-muted uppercase tracking-wider sm:tracking-[0.2em] mb-1">Jami bolalar</p>
            <p className="text-xl sm:text-3xl font-black text-brand-depth">{totalKids}</p>
          </div>

          <div className="bg-emerald-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
              <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-wider sm:tracking-[0.2em] mb-1">{ATTENDANCE_CUTOFF_LABEL} gacha keladigan bolalar soni prognozi</p>
            <p className="text-xl sm:text-3xl font-black text-emerald-600">{earlyArrivals}</p>
          </div>

          <div className="bg-amber-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-amber-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 text-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
              <AlertCircle size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black text-amber-600 uppercase tracking-wider sm:tracking-[0.2em] mb-1">{ATTENDANCE_CUTOFF_LABEL} dan keyin</p>
            <p className="text-xl sm:text-3xl font-black text-amber-600">{lateArrivals}</p>
          </div>

          <div className="bg-rose-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-rose-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 text-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
              <XCircle size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black text-rose-500 uppercase tracking-wider sm:tracking-[0.2em] mb-1">Kelmaganlar</p>
            <p className="text-xl sm:text-3xl font-black text-rose-500">{notArrived}</p>
          </div>

          <div className="bg-indigo-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
              <Utensils size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black text-indigo-600 uppercase tracking-wider sm:tracking-[0.2em] mb-1">Ovqat porsiyasi</p>
            <p className="text-xl sm:text-3xl font-black text-indigo-600">{mealPortions}</p>
          </div>
        </div>

        <section>
          <h3 className="text-[10px] sm:text-sm font-black text-brand-muted uppercase tracking-[0.2em] mb-4 sm:mb-6 ml-1">Guruhni tanlang</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayGroups.map(g => (
              <button 
                key={(g as any).id || g.name} 
                onClick={() => setSelectedGroup(g.name)} 
                className="p-6 sm:p-8 bg-white border border-brand-border rounded-3xl sm:rounded-[2.5rem] text-left transition-all hover:border-brand-primary hover:shadow-2xl hover:shadow-brand-primary/5 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <span className="font-black text-brand-depth block text-lg sm:text-xl mb-1 tracking-tight">{g.name}</span>
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] sm:text-[10px] text-brand-muted font-bold uppercase tracking-wider">Tarbiyachi: {(g as any).teacher_name}</p>
                    <p className="text-[9px] sm:text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1 sm:mt-2">{(g as any).children?.length || 0} ta bola</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const groupData = displayGroups.find(g => g.name === selectedGroup);
  if (!groupData) return null;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Group Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-brand-border shadow-xl shadow-slate-200/50 gap-4 sm:gap-6">
        <div className="space-y-1">
          <button onClick={() => setSelectedGroup(null)} className="text-brand-primary font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center gap-2 mb-2 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft size={12} /> Barcha guruhlar
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-depth tracking-tight">"{groupData.name}" guruhi</h2>
          <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
            <button 
              onClick={() => setActiveTab('attendance')}
              className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all ${activeTab === 'attendance' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-brand-muted hover:bg-slate-200'}`}
            >
              Davomat
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all flex items-center gap-2 ${activeTab === 'messages' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-brand-muted hover:bg-slate-200'}`}
            >
              Xabarlar <span className="bg-red-500 text-white w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[7px] sm:text-[8px]">3</span>
            </button>
          </div>
        </div>
      </div>

      <AttendanceCountEntry
        groupData={groupData}
        onSaved={() => {
          fetchTodayStats();
          refetchGroups();
        }}
      />

      {activeTab === 'attendance' ? (
        <GroupAttendanceView 
          groupData={groupData} 
          onSaved={() => {
            fetchTodayStats();
            refetchGroups();
          }}
        />
      ) : (
        <TeacherMessagesView groupData={groupData} />
      )}
    </div>
  );
};

const TeacherMessagesView = ({ groupData }: { groupData: any }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeParent, setActiveParent] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUnreadCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const params = new URLSearchParams({ userId: user.id, userRole: 'teacher' });
      const res = await apiClient.get(`/messages/unread-counts?${params.toString()}`);
      setUnreadCounts(res.data);
    } catch (error) {
      console.error('Failed to load unread counts:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [loadUnreadCounts]);

  const loadMessages = useCallback(async () => {
    if (!activeParent || !user?.id || !activeParent.hasAccount) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await parentsApi.getMessages(user.id, activeParent.id, { userRole: 'teacher' });
      setMessages(data);
      
      if (unreadCounts[activeParent.id] > 0) {
        await parentsApi.markAsRead(user.id, activeParent.id, { userRole: 'teacher' });
        loadUnreadCounts();
      }
    } catch (error) {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeParent, user?.id, unreadCounts, loadUnreadCounts]);

  useEffect(() => {
    if (activeParent) loadMessages();
  }, [activeParent, loadMessages]);

  const uploadChatFile = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url as string;
  };

  const handleSendMessage = async (e?: React.FormEvent, file?: File) => {
    if (e) e.preventDefault();
    if ((!chatMessage.trim() && !file) || !activeParent || !user?.id) return;

    const messageText = chatMessage;
    setChatMessage('');

    try {
      const fileUrl = file ? await uploadChatFile(file) : null;
      await parentsApi.sendMessage({
        senderId: user.id,
        receiverId: activeParent.id,
        text: messageText,
        senderRole: 'teacher',
        messageType: file ? getChatFileType(file) as any : 'text',
        fileUrl,
        fileName: file?.name || null,
        mimeType: file?.type || null,
      });
      loadMessages();
      showNotification('Xabar yuborildi', 'success');
    } catch (error) {
      showNotification('Xabar yuborishda xatolik', 'error');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await handleSendMessage(undefined, file);
  };

  const startRecording = async () => {
    if (!activeParent || !user?.id) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        await handleSendMessage(undefined, file);
      };
      recorder.start();
      showNotification('Ovoz yozish boshlandi', 'success');
    } catch {
      showNotification('Mikrofonga ruxsat berilmadi', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      showNotification('Ovozli xabar yuborildi', 'success');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim() || !user?.id) return;
    
    const parentIds = (groupData.children || [])
      .map((child: any) => child.parent_account_id)
      .filter((id: string | null) => id !== null);

    if (parentIds.length === 0) {
      showNotification('Guruhda ota-ona hisoblari topilmadi', 'error');
      return;
    }

    try {
      await parentsApi.sendBroadcast({
        senderId: user.id,
        receiverIds: parentIds,
        text: broadcastText,
        senderRole: 'teacher'
      });
      
      showNotification(`E'lon ${parentIds.length} ta ota-onaga yuborildi`, 'success');
      setBroadcastText('');
      setShowBroadcastModal(false);
    } catch (error) {
      showNotification('E\'lon yuborishda xatolik', 'error');
    }
  };

  const parents = useMemo(() => {
    const list = (groupData.children || []).map((child: any) => ({
      id: child.parent_account_id || `temp_${child.id}`,
      hasAccount: !!child.parent_account_id,
      name: child.father_name || child.mother_name || `Ota-ona (${child.first_name})`,
      childName: child.first_name,
      unreadCount: unreadCounts[child.parent_account_id || ''] || 0,
      isOnline: false
    }));

    if (!searchTerm) return list;
    return list.filter((p: any) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.childName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groupData.children, searchTerm, unreadCounts]);

  return (
    <div className="h-[600px] flex gap-6 animate-in slide-in-from-bottom-4 relative">
      {/* Parents List */}
      <div className={`w-full md:w-80 flex flex-col gap-4 ${activeParent && 'hidden md:flex'}`}>
        <div className="bg-white p-6 rounded-[2.5rem] border border-brand-border shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="space-y-4 mb-4">
            <div className="flex justify-between items-center px-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Ota-onalar</p>
              <button 
                onClick={() => setShowBroadcastModal(true)}
                className="bg-brand-primary/10 text-brand-primary p-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                title="Guruhga e'lon"
              >
                <MessageCircle size={18} />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Qidirish..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2 px-4 text-xs font-bold outline-none focus:border-brand-primary transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {parents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[10px] font-black text-brand-muted uppercase">Topilmadi</p>
              </div>
            ) : (
              parents.map((parent: any) => (
                <button
                  key={parent.id}
                  onClick={() => setActiveParent(parent)}
                  className={`w-full flex items-center gap-3 p-4 rounded-[1.5rem] transition-all text-left border ${
                    activeParent?.id === parent.id ? 'bg-brand-primary/5 border-brand-primary' : 'bg-slate-50 border-slate-100 hover:border-brand-primary'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-brand-border flex items-center justify-center text-brand-primary shrink-0">
                      <User size={20} />
                    </div>
                    {parent.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {parent.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] font-black text-brand-depth uppercase truncate tracking-wide">{parent.name}</p>
                    <p className="text-[9px] text-brand-muted font-bold mt-1">Bolasining ismi: {parent.childName}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 bg-white border-2 border-slate-50 rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden ${!activeParent && 'hidden md:flex'}`}>
        {!activeParent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 rounded-full bg-brand-ghost flex items-center justify-center mb-6">
              <MessageCircle size={48} className="text-slate-300" />
            </div>
            <h4 className="text-xl font-black text-brand-depth uppercase">Muloqot markazi</h4>
            <p className="text-sm text-brand-muted mt-2 max-w-xs">Xabar yuborish uchun chapdan ota-onani tanlang yoki yuqoridagi tugma orqali guruhga e'lon yuboring.</p>
          </div>
        ) : !activeParent.hasAccount ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
              <AlertCircle size={40} />
            </div>
            <h4 className="text-lg font-black text-brand-depth uppercase">Akkount topilmadi</h4>
            <p className="text-sm text-brand-muted mt-2 max-w-xs">
              Ushbu ota-ona hali tizimda ro'yxatdan o'tmagan. Xabar yuborish uchun avval ularga login/parol berilishi kerak.
            </p>
            <button 
              onClick={() => setActiveParent(null)}
              className="mt-6 text-brand-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Boshqa ota-onani tanlash
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveParent(null)} className="md:hidden p-2 text-brand-muted hover:text-brand-primary"><ArrowLeft size={20} /></button>
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <User size={24} />
                </div>
                <div>
                  <h5 className="text-lg font-black text-brand-depth tracking-tight">{activeParent.name}</h5>
                  <div className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{activeParent.childName} ning ota-onasi</div>
                </div>
              </div>
              <button className="p-2 text-brand-muted hover:text-brand-primary transition-colors"><MoreVertical size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-[2rem] shadow-lg relative ${
                        msg.type === 'sent' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-50 text-brand-depth rounded-tl-none border border-slate-100'
                      }`}>
                        <ChatMessageBody msg={msg} />
                        <div className={`flex items-center justify-end gap-1.5 mt-2 ${msg.type === 'sent' ? 'text-white/60' : 'text-brand-muted'}`}>
                          <span className="text-[9px] font-black">{msg.time}</span>
                          {msg.type === 'sent' && (msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 border-2 border-transparent focus-within:border-brand-primary focus-within:bg-white rounded-[2.5rem] px-6 py-3 transition-all shadow-inner">
                <label className="cursor-pointer text-brand-muted hover:text-brand-primary transition-colors">
                  <Paperclip size={20} />
                  <input type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileChange} />
                </label>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Javob yozish..."
                  className="flex-1 bg-transparent outline-none font-bold text-sm text-brand-depth py-2"
                />
                <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className="text-brand-muted hover:text-brand-primary" title="Ovoz yozish uchun bosib turing"><Mic size={20} /></button>
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Broadcast Modal Overlay */}
      <AnimatePresence>
        {showBroadcastModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/5"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[10px] shadow-2xl border border-brand-border overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-brand-depth uppercase tracking-tight">Guruhga e'lon</h3>
                  <button onClick={() => setShowBroadcastModal(false)} className="text-brand-muted hover:text-brand-primary"><XCircle size={24} /></button>
                </div>
                <p className="text-xs text-brand-muted font-bold mb-4">Ushbu xabar guruhdagi barcha ota-onalarga yuboriladi.</p>
                <textarea 
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 text-sm font-bold outline-none focus:border-brand-primary transition-all resize-none mb-6"
                  placeholder="E'lon matnini yozing..."
                ></textarea>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowBroadcastModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-brand-muted font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    onClick={handleBroadcast}
                    disabled={!broadcastText.trim()}
                    className="flex-1 py-4 bg-brand-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-lg hover:shadow-brand-primary/30 transition-all disabled:opacity-50"
                  >
                    Yuborish
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AttendanceCountEntry = ({ groupData, onSaved }: { groupData: any, onSaved: () => void }) => {
  const { showNotification } = useNotification();
  const [counts, setCounts] = useState({ total: 0, early: 0, late: 0, absent: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const totalChildren = (groupData.children || []).length;
  const today = new Date().toISOString().split('T')[0];
  const isTimeExpired = useMemo(() => isAfterAttendanceCutoff(), []);

  useEffect(() => {
    const loadExistingCounts = async () => {
      try {
        const res = await apiClient.get(`/attendance/${groupData.id}/${today}`);
        const rows = Array.isArray(res.data) ? res.data : Object.values(res.data || {});
        const early = rows.filter((row: any) => {
          const status = String(row.status || '').toUpperCase();
          return status === 'EARLY' || (['PRESENT', 'KELDI'].includes(status) && String(row.arrival_time || '') <= ATTENDANCE_CUTOFF_TIME);
        }).length;
        const late = rows.filter((row: any) => {
          const status = String(row.status || '').toUpperCase();
          return status === 'LATE' || (['PRESENT', 'KELDI'].includes(status) && String(row.arrival_time || '') > ATTENDANCE_CUTOFF_TIME);
        }).length;
        const absent = rows.filter((row: any) => ['ABSENT', 'KELMADI', 'SICK'].includes(String(row.status || '').toUpperCase())).length;
        setCounts({ total: totalChildren, early, late, absent });
      } catch {
        setCounts({ total: totalChildren, early: 0, late: 0, absent: 0 });
      }
    };

    loadExistingCounts();
  }, [groupData.id, today, totalChildren]);

  const enteredTotal = counts.early + counts.late + counts.absent;
  const mealPortions = counts.early + counts.late;
  const remaining = Math.max(totalChildren - enteredTotal, 0);
  const isBalanced = enteredTotal === totalChildren;

  const updateCount = (key: 'early' | 'late' | 'absent', value: string) => {
    if (isTimeExpired) {
      showNotification(`Sondagi davomad faqat soat ${ATTENDANCE_CUTOFF_LABEL} gacha qabul qilinadi`, 'error');
      return;
    }
    if (/^0\d+/.test(value.trim())) {
      showNotification('Xato kiritdingiz. Sonlarni qaytadan toвЂldiring', 'error');
      setCounts({ total: totalChildren, early: 0, late: 0, absent: 0 });
      return;
    }

    const nextValue = Math.max(0, Number(value || 0));
    setCounts((state) => ({ ...state, [key]: nextValue }));
  };

  const handleSaveCounts = async () => {
    if (isTimeExpired) {
      showNotification(`Sondagi davomad faqat soat ${ATTENDANCE_CUTOFF_LABEL} gacha qabul qilinadi`, 'error');
      return;
    }
    if (totalChildren === 0) {
      showNotification('Guruhda bolalar topilmadi', 'error');
      return;
    }
    if (!isBalanced) {
      showNotification(`Kiritilgan sonlar jami ${totalChildren} taga teng boвЂlishi kerak`, 'error');
      return;
    }

    const children = groupData.children || [];
    const attendanceData: Record<string, { status: string; arrival_time: string | null }> = {};
    let index = 0;

    children.slice(index, index + counts.early).forEach((child: any) => {
      attendanceData[child.id] = { status: 'PRESENT', arrival_time: EARLY_ATTENDANCE_FALLBACK_TIME };
    });
    index += counts.early;

    children.slice(index, index + counts.late).forEach((child: any) => {
      attendanceData[child.id] = { status: 'PRESENT', arrival_time: LATE_ATTENDANCE_FALLBACK_TIME };
    });
    index += counts.late;

    children.slice(index, index + counts.absent).forEach((child: any) => {
      attendanceData[child.id] = { status: 'ABSENT', arrival_time: null };
    });

    try {
      setIsSaving(true);
      await apiClient.post('/attendance', {
        date: today,
        group_id: groupData.id,
        group_name: groupData.name,
        entry_mode: 'COUNT',
        attendance_counts: {
          total_children: totalChildren,
          early_count: counts.early,
          late_count: counts.late,
          absent_count: counts.absent,
        },
        attendance_data: attendanceData,
      });
      showNotification(`Sondagi davomad saqlandi. Bugungi ovqat porsiyasi: ${mealPortions}`, 'success');
      onSaved();
    } catch (error: any) {
      showNotification(error?.response?.data?.error || 'Sondagi davomadni saqlashda xatolik', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white border border-brand-border rounded-3xl sm:rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-brand-border bg-slate-50/40 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-brand-depth">Davomadni sonda kiritish</h3>
            <p className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-widest mt-1">
              {groupData.name} guruhi uchun bugungi umumiy davomad
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
          isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {isBalanced ? 'ToвЂliq kiritildi' : `${remaining} ta qoldi`}
        </div>
      </div>

      {isTimeExpired && (
        <div className="mx-5 sm:mx-6 mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 flex items-center gap-3 text-rose-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest">Sondagi davomad vaqti tugadi. Ma'lumotlar faqat soat {ATTENDANCE_CUTOFF_LABEL} gacha qabul qilinadi.</p>
        </div>
      )}

      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_190px] gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <CountInput
            label="Jami bolalar"
            value={totalChildren}
            icon={Users}
            tone="blue"
            readOnly
          />
          <CountInput
            label={`${ATTENDANCE_CUTOFF_LABEL} gacha keladigan bolalar soni prognozi`}
            value={counts.early}
            icon={CheckCircle2}
            tone="emerald"
            disabled={isTimeExpired}
            onChange={(value) => updateCount('early', value)}
          />
          <CountInput
            label={`${ATTENDANCE_CUTOFF_LABEL} dan keyin kelgan`}
            value={counts.late}
            icon={LucideClock}
            tone="amber"
            disabled={isTimeExpired}
            onChange={(value) => updateCount('late', value)}
          />
          <CountInput
            label="Umuman kelmagan"
            value={counts.absent}
            icon={XCircle}
            tone="rose"
            disabled={isTimeExpired}
            onChange={(value) => updateCount('absent', value)}
          />
          <CountInput
            label="Ovqat porsiyasi"
            value={mealPortions}
            icon={Utensils}
            tone="blue"
            readOnly
          />
        </div>

        <button
          onClick={handleSaveCounts}
          disabled={isSaving || !isBalanced || totalChildren === 0 || isTimeExpired}
          className="h-full min-h-[96px] rounded-2xl bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-brand-primary/20 transition-all"
        >
          <CheckCircle2 size={18} />
          {isSaving ? 'Saqlanmoqda...' : 'Sonda saqlash'}
        </button>
      </div>
    </section>
  );
};

const CountInput = ({
  label,
  value,
  icon: Icon,
  tone,
  readOnly,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: 'blue' | 'emerald' | 'amber' | 'rose';
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) => {
  const toneClass = tone === 'emerald'
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : tone === 'amber'
      ? 'bg-amber-50 text-amber-600 border-amber-100'
      : tone === 'rose'
        ? 'bg-rose-50 text-rose-500 border-rose-100'
        : 'bg-blue-50 text-brand-primary border-blue-100';

  return (
    <label className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center">
          <Icon size={18} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{label}</span>
      </div>
      <input
        type="number"
        min={0}
        value={value}
        readOnly={readOnly || disabled}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full bg-white/80 border border-white rounded-xl px-4 py-3 text-2xl font-black text-brand-depth outline-none focus:border-brand-primary read-only:text-brand-muted disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
};

const GroupAttendanceView = ({ groupData, onSaved }: { groupData: any, onSaved: () => void }) => {
  const { showNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, { status: AttendanceStatus | null, arrival_time?: string | null }>>({});

  const isTimeExpired = useMemo(() => {
    return isAfterAttendanceCutoff();
  }, []);

  useEffect(() => {
    const fetchExistingAttendance = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const res = await apiClient.get(`/attendance/${groupData.id}/${today}`);
        
        const initialAttendance = (groupData.children || []).reduce((acc: any, child: any) => {
          const existing = res.data[child.id];
          let status: AttendanceStatus | null = null;
          
          if (existing?.status === 'present') {
            status = existing.arrival_time && existing.arrival_time <= ATTENDANCE_CUTOFF_TIME ? 'early' : 'late';
          } else if (existing?.status === 'absent' || existing?.status === 'sick') {
            status = 'absent';
          }

          acc[child.id] = {
            status: status,
            arrival_time: existing?.arrival_time || null
          };
          return acc;
        }, {});
        
        setAttendance(initialAttendance);
      } catch (err) {
        console.error('Failed to fetch existing attendance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingAttendance();
  }, [groupData]);

  const stats = useMemo(() => {
    const items = Object.values(attendance) as { status: AttendanceStatus | null, arrival_time?: string | null }[];
    const early = items.filter(v => v.status === 'early').length;
    const late = items.filter(v => v.status === 'late').length;
    const absent = items.filter(v => v.status === 'absent').length;

    return {
      total: (groupData.children || []).length,
      early,
      late,
      absent,
      present: early + late
    };
  }, [attendance, groupData.children]);

  const handleStatusChange = (childId: string, status: AttendanceStatus) => {
    if (isTimeExpired) return;
    setAttendance(prev => {
      let arrivalTime = null;
      const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
      
      if (status === 'early') {
        arrivalTime = now <= ATTENDANCE_CUTOFF_TIME ? now : EARLY_ATTENDANCE_FALLBACK_TIME;
      } else if (status === 'late') {
        arrivalTime = now > ATTENDANCE_CUTOFF_TIME ? now : LATE_ATTENDANCE_FALLBACK_TIME;
      }

      return { 
        ...prev, 
        [childId]: { status, arrival_time: arrivalTime } 
      };
    });
  };

  const handleSave = async () => {
    if (isTimeExpired) {
      showNotification(`Davomat qilish vaqti tugagan (soat ${ATTENDANCE_CUTOFF_LABEL} gacha)`, 'error');
      return;
    }
    // Check if all children have a status selected
    const unselectedCount = (groupData.children || []).filter((c: any) => !attendance[c.id]?.status).length;
    if (unselectedCount > 0) {
      showNotification(`${unselectedCount} ta bolaga status tanlanmagan!`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const attendanceData = Object.keys(attendance).reduce((acc: any, id) => {
        const item = attendance[id];
        acc[id] = {
          status: item.status === 'absent' ? 'ABSENT' : 'PRESENT',
          arrival_time: item.arrival_time
        };
        return acc;
      }, {});

      const payload = {
        date: new Date().toISOString().split('T')[0],
        group_name: groupData.name,
        attendance_data: attendanceData
      };

      await apiClient.post(`/attendance`, payload);
      showNotification('Davomat muvaffaqiyatli saqlandi!', 'success');
      onSaved();
    } catch (err) {
      showNotification('Davomatni saqlashda xatolik yuz berdi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-20 text-center font-black text-brand-muted uppercase tracking-widest">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      {isTimeExpired && (
        <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
           <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shrink-0 border border-rose-100">
                 <AlertCircle size={28} />
              </div>
              <div>
                 <h5 className="text-rose-900 font-black uppercase text-sm tracking-tight">Davomat vaqti tugadi</h5>
                 <p className="text-rose-700/70 text-[10px] font-bold uppercase tracking-widest mt-1">Davomat har kuni faqat soat {ATTENDANCE_CUTOFF_LABEL} gacha qabul qilinadi.</p>
              </div>
           </div>
           <div className="px-6 py-2 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">
              Vaqt: {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
      )}

      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={isSaving || isTimeExpired}
          className={`w-full md:w-auto font-black uppercase text-xs tracking-widest px-10 py-5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 ${isTimeExpired ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-brand-primary text-white hover:shadow-2xl hover:shadow-brand-primary/30'}`}
        >
          {isSaving ? 'Saqlanmoqda...' : 'Davomatni saqlash'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">Jami bolalar</p>
          <p className="text-2xl font-black text-brand-depth">{stats.total}</p>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">{ATTENDANCE_CUTOFF_LABEL} gacha keladigan bolalar soni prognozi</p>
          <p className="text-2xl font-black text-emerald-600">{stats.early}</p>
        </div>

        <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <LucideClock size={20} />
          </div>
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">{ATTENDANCE_CUTOFF_LABEL} dan keyin keladi</p>
          <p className="text-2xl font-black text-amber-600">{stats.late}</p>
        </div>

        <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center mb-4">
            <XCircle size={20} />
          </div>
          <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Umuman kelmaydi</p>
          <p className="text-2xl font-black text-rose-500">{stats.absent}</p>
        </div>

        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Utensils size={20} />
          </div>
          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Ovqat porsiyasi</p>
          <p className="text-2xl font-black text-indigo-600">{stats.present}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-brand-border bg-slate-50/30">
          <h3 className="font-black text-brand-depth uppercase text-[10px] sm:text-xs tracking-widest flex items-center gap-2">
            <ClipboardCheck size={16} className="text-brand-primary" />
            Bolalar ro'yxati
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {(groupData.children || []).length === 0 ? (
            <div className="p-10 sm:p-20 text-center text-brand-muted font-bold italic text-sm">Guruhda bolalar yo'q</div>
          ) : (
            groupData.children.map((child: any) => (
              <div key={child.id} className="p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                <div className="min-w-0">
                  <span className="font-bold text-brand-depth text-sm sm:text-base block truncate">{child.first_name || child.name} {child.last_name || ''}</span>
                  <p className="text-[9px] sm:text-[10px] text-brand-muted font-bold mt-1 uppercase tracking-tight truncate">
                    Status: {
                      attendance[child.id]?.status === 'early' ? `${ATTENDANCE_CUTOFF_LABEL} gacha keldi` : 
                      attendance[child.id]?.status === 'late' ? `${ATTENDANCE_CUTOFF_LABEL} dan keyin keladi` : 
                      attendance[child.id]?.status === 'absent' ? 'Umuman kelmaydi' : 
                      'Tanlanmagan'
                    }
                    {attendance[child.id]?.arrival_time && ` вЂў ${attendance[child.id].arrival_time}`}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
                  <button 
                    onClick={() => handleStatusChange(child.id, 'early')}
                    disabled={isTimeExpired}
                    className={`px-4 py-2.5 sm:py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                      attendance[child.id]?.status === 'early' 
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                        : isTimeExpired ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed' : 'bg-slate-50 text-brand-muted border-brand-border hover:bg-white'
                    }`}
                  >
                    <CheckCircle2 size={14} className="shrink-0" /> <span className="truncate">{ATTENDANCE_CUTOFF_LABEL} gacha keldi</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(child.id, 'late')}
                    disabled={isTimeExpired}
                    className={`px-4 py-2.5 sm:py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                      attendance[child.id]?.status === 'late' 
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
                        : isTimeExpired ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed' : 'bg-slate-50 text-brand-muted border-brand-border hover:bg-white'
                    }`}
                  >
                    <LucideClock size={14} className="shrink-0" /> <span className="truncate">{ATTENDANCE_CUTOFF_LABEL} dan keyin</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(child.id, 'absent')}
                    disabled={isTimeExpired}
                    className={`px-4 py-2.5 sm:py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                      attendance[child.id]?.status === 'absent' 
                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                        : isTimeExpired ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed' : 'bg-slate-50 text-brand-muted border-brand-border hover:bg-white'
                    }`}
                  >
                    <XCircle size={14} className="shrink-0" /> <span className="truncate">Kelmaydi</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherView;

