import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  MoreVertical, 
  Paperclip, 
  Send, 
  Check, 
  CheckCheck,
  MessageCircle,
  ArrowLeft,
  Mic,
  X,
  Clock,
  Edit3,
  Trash2,
  Home,
  UserRoundCheck,
  ShieldCheck,
  Stethoscope,
  GraduationCap
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { apiClient, PARENT_PORTAL_API_BASE_URL } from '@/shared/api';
import { parentsApi } from '../../parents/api/parentsApi';
import { ChatMessage, ChatContact } from '../../parents/types/parentPortal.types';

const QUICK_TEMPLATES = [
  { id: 'absent', text: 'Bugun bormaymiz', icon: Home },
  { id: 'late', text: 'Biroz kechikamiz', icon: Clock }
];

const getAssetUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const apiRoot = String(PARENT_PORTAL_API_BASE_URL || apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getMessageType = (file?: File) => {
  if (!file) return 'text';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'file';
};

const getContactStatusLabel = (contact: ChatContact) => {
  return contact.statusLabel || (contact.isOnline ? 'Online' : "Hali online bo'lmagan");
};

const getCompactContactStatusLabel = (contact: ChatContact) => {
  const status = getContactStatusLabel(contact);
  if (status === "Hali online bo'lmagan") return 'Offline';
  if (status === 'Xabar yuborish mumkin') return 'Chat ochiq';
  return status;
};

const getInitials = (name?: string) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'T') + (parts[1]?.[0] || '');
};

const contactRoleMeta = {
  director: {
    label: 'MTT direktori',
    description: 'Bogʼcha boshqaruvi',
    icon: ShieldCheck,
    tone: 'rose',
  },
  nurse: {
    label: 'Hamshira',
    description: 'Tibbiy nazorat',
    icon: Stethoscope,
    tone: 'sky',
  },
  teacher: {
    label: 'Guruh tarbiyachisi',
    description: 'Guruh rahbari',
    icon: GraduationCap,
    tone: 'emerald',
  },
  admin: {
    label: 'Administrator',
    description: 'Bogʼcha administratori',
    icon: UserRoundCheck,
    tone: 'slate',
  },
} as const;

const getContactMeta = (contact?: ChatContact | null) => {
  const role = String(contact?.role || 'teacher') as keyof typeof contactRoleMeta;
  return contactRoleMeta[role] || contactRoleMeta.teacher;
};

const getContactToneClass = (tone: string, active = false) => {
  if (tone === 'sky') return active ? 'border-sky-200 bg-sky-50 shadow-sm ring-2 ring-sky-100' : 'border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50/45';
  if (tone === 'emerald') return active ? 'border-emerald-200 bg-emerald-50 shadow-sm ring-2 ring-emerald-100' : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/45';
  if (tone === 'slate') return active ? 'border-slate-300 bg-slate-100 shadow-sm ring-2 ring-slate-100' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50';
  return active ? 'border-rose-200 bg-rose-50 shadow-sm ring-2 ring-rose-100' : 'border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50/45';
};

const getContactIconClass = (tone: string) => {
  if (tone === 'sky') return 'border-sky-100 bg-sky-50 text-sky-600 shadow-sky-50';
  if (tone === 'emerald') return 'border-emerald-100 bg-emerald-50 text-emerald-600 shadow-emerald-50';
  if (tone === 'slate') return 'border-slate-100 bg-slate-50 text-slate-600 shadow-slate-50';
  return 'border-rose-100 bg-rose-50 text-rose-600 shadow-rose-50';
};

const getContactRoleBadgeClass = (tone: string) => {
  if (tone === 'sky') return 'bg-sky-50 text-sky-700 ring-sky-100';
  if (tone === 'emerald') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (tone === 'slate') return 'bg-slate-50 text-slate-700 ring-slate-100';
  return 'bg-rose-50 text-rose-700 ring-rose-100';
};

const normalizeName = (value?: string) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr'
];

const formatMessageTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = date.getDate();
  const month = UZ_MONTHS[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month}, ${hours}:${minutes}`;
};

const MessageBody = ({ msg, tone }: { msg: ChatMessage; tone: 'sent' | 'received' }) => {
  const url = getAssetUrl(msg.fileUrl);
  if (msg.isDeleted) {
    return <p className={`kg-chat-message-text ${tone === 'sent' ? 'kg-chat-message-text-sent' : 'kg-chat-message-text-received'} text-[11px] md:text-sm font-bold italic opacity-70`}>Xabar o'chirildi</p>;
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
      {msg.text ? (
        <p className={`kg-chat-message-text ${tone === 'sent' ? 'kg-chat-message-text-sent' : 'kg-chat-message-text-received'} text-sm md:text-[15px] font-semibold leading-relaxed`}>
          {msg.text}
        </p>
      ) : null}
    </div>
  );
};

export const MessagesSection = ({
  childName = '',
  onUnreadCountChange,
}: {
  childName?: string;
  onUnreadCountChange?: (count: number) => void;
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadContacts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await parentsApi.getContacts(user.id, (user as any)?.childId);
      setContacts(data);
      onUnreadCountChange?.(data.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0));
    } catch (error) {
      console.error('Failed to load chat contacts:', error);
      setContacts([]);
      onUnreadCountChange?.(0);
    }
  }, [user, onUnreadCountChange]);

  const loadMessages = useCallback(async () => {
    if (!user?.id || !activeChat) return;
    setIsLoading(true);
    try {
      const data = await parentsApi.getMessages(user.id, activeChat.id, {
        userRole: 'parent',
        contactRole: activeChat.role,
      });
      setMessages(data);
      if (activeChat.unreadCount > 0) {
        await parentsApi.markAsRead(user.id, activeChat.id, {
          userRole: 'parent',
          contactRole: activeChat.role,
        });
        loadContacts();
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeChat, loadContacts]);

  useEffect(() => { loadContacts(); }, [loadContacts]);
  useEffect(() => { if (activeChat) loadMessages(); }, [activeChat, loadMessages]);
  useEffect(() => {
    setEditingMessage(null);
    setChatMessage('');
  }, [activeChat?.id]);

  const visibleContacts = contacts.filter((contact) => normalizeName(contact.name) !== normalizeName(childName));

  useEffect(() => {
    if (activeChat && !visibleContacts.some((contact) => String(contact.id) === String(activeChat.id))) {
      setActiveChat(null);
    }
  }, [contacts, childName, activeChat?.id]);

  const handleOpenChat = (contact: ChatContact) => {
    setActiveChat(contact);
  };

  const uploadChatFile = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url as string;
  };

  const handleSendMessage = async (text: string, file?: File) => {
    if ((!text.trim() && !file) || !activeChat || !user?.id) return;
    try {
      if (editingMessage && !file) {
        const updatedMessage = await parentsApi.editMessage(editingMessage.id, {
          userId: user.id,
          userRole: 'parent',
          text,
        });
        setMessages((prev) => prev.map((msg) => String(msg.id) === String(updatedMessage.id) ? { ...updatedMessage, type: 'sent' } : msg));
        setEditingMessage(null);
        setChatMessage('');
        showNotification('Xabar tahrirlandi', 'success');
        return;
      }

      const fileUrl = file ? await uploadChatFile(file) : null;
      const newMessage = await parentsApi.sendMessage({
        senderId: user.id,
        receiverId: activeChat.id,
        text,
        senderRole: 'parent',
        receiverRole: activeChat.role,
        messageType: file ? getMessageType(file) as any : 'text',
        fileUrl,
        fileName: file?.name || null,
        mimeType: file?.type || null,
      });
      setMessages((prev) => [...prev, { ...newMessage, type: 'sent' }]);
      setEditingMessage(null);
      showNotification('Xabar yuborildi', 'success');
    } catch (error) {
      showNotification('Xabar yuborishda xatolik', 'error');
    }
    setChatMessage('');
  };

  const handleEditMessage = (msg: ChatMessage) => {
    if (msg.isDeleted) return;
    setEditingMessage(msg);
    setChatMessage(msg.text || '');
  };

  const handleDeleteMessage = async (msg: ChatMessage) => {
    if (!user?.id) return;
    try {
      const deletedMessage = await parentsApi.deleteMessage(msg.id, { userId: user.id, userRole: 'parent' });
      setMessages((prev) => prev.map((item) => String(item.id) === String(msg.id) ? { ...deletedMessage, type: 'sent' } : item));
      if (editingMessage && String(editingMessage.id) === String(msg.id)) {
        setEditingMessage(null);
        setChatMessage('');
      }
      showNotification("Xabar o'chirildi", 'success');
    } catch {
      showNotification("Xabarni o'chirishda xatolik", 'error');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await handleSendMessage(chatMessage, file);
  };

  const startRecording = async () => {
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
        await handleSendMessage('', file);
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      showNotification('Mikrofonga ruxsat berilmadi', 'error');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="kg-parent-section kg-parent-messages flex h-full min-h-[500px] min-w-0 flex-col gap-3 md:min-h-0 md:flex-row md:gap-4">
      {/* Contact List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} kg-parent-chat-list min-w-0 w-full md:w-[320px] lg:w-[340px] xl:w-[380px] flex-col gap-3`}>
        <div className="space-y-3 rounded-[1.5rem] border border-brand-border bg-white/95 p-3.5 shadow-sm shadow-slate-200/60 sm:p-4 md:rounded-[1.6rem]">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-3.5 py-3">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-depth">Kontaktlar</p>
                <p className="mt-1 text-[10px] font-bold leading-relaxed text-brand-muted">Kimga yozishni tanlang</p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-primary/10 px-2.5 py-1 text-[10px] font-black text-brand-primary">
                {visibleContacts.length} ta
              </span>
            </div>
            <div className="space-y-2">
            {visibleContacts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-rose-400">
                    <UserRoundCheck size={18} />
                  </div>
                  <p className="text-[11px] font-extrabold text-brand-depth">Kontaktlar topilmadi</p>
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-brand-muted">Bog'cha administratori xodim profillarini biriktirgandan keyin chat ochiladi.</p>
                </div>
            ) : visibleContacts.map((contact) => {
              const meta = getContactMeta(contact);
              const Icon = meta.icon;
              const roleLabel = contact.title || meta.label;
              const subtitle = contact.subtitle || meta.description;

              return (
                <button 
                  key={contact.id}
                  onClick={() => handleOpenChat(contact)}
                  className={`relative flex min-h-[86px] w-full items-center gap-3 overflow-hidden rounded-[1.15rem] border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3.5 md:min-h-[94px] md:rounded-[1.25rem] ${getContactToneClass(meta.tone, activeChat?.id === contact.id)}`}
                >
                    {activeChat?.id === contact.id && (
                      <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-brand-primary" />
                    )}
                    <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/55" />
                    <div className="relative shrink-0">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-base font-extrabold uppercase shadow-sm md:h-12 md:w-12 ${getContactIconClass(meta.tone)}`}>
                        <Icon size={19} />
                      </div>
                      {contact.unreadCount > 0 && (
                        <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[8px] font-black text-white">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-black leading-tight text-brand-depth md:text-base">{contact.name}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] ring-1 ${getContactRoleBadgeClass(meta.tone)}`}>
                              {roleLabel}
                            </span>
                          </div>
                        </div>
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${contact.isOnline ? 'bg-emerald-500 ring-emerald-100' : 'bg-rose-400 ring-rose-100'}`} />
                      </div>
                      <p className="mt-2 truncate text-[10px] font-semibold text-brand-muted">
                        {contact.lastMessage || `${subtitle} - ${getCompactContactStatusLabel(contact)}`}
                      </p>
                    </div>
                </button>
              );
            })}
            </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} kg-parent-chat-window relative min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-brand-border bg-white shadow-sm md:rounded-[1.75rem]`}>
          {!activeChat ? (
            <div key="placeholder" className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-ghost flex items-center justify-center border-2 border-slate-50 mb-4">
                <MessageCircle size={32} className="text-slate-300" />
              </div>
              <h4 className="text-lg md:text-xl font-black text-brand-depth">Xabar yuborish</h4>
              <p className="text-xs text-brand-muted mt-1.5 max-w-[240px]">Suhbatni boshlash uchun direktor, hamshira yoki tarbiyachini tanlang.</p>
            </div>
          ) : (
            <div key="chat-window" className="kg-parent-chat-inner flex h-full min-h-0 flex-1 flex-col bg-gradient-to-b from-white via-white to-slate-50/70">
              {/* Chat Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-brand-border bg-white px-4 py-3.5 sm:px-5 md:px-6 md:py-4">
                <div className="flex min-w-0 items-center gap-3 md:gap-3.5">
                    <button onClick={() => setActiveChat(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-muted hover:text-brand-primary md:hidden"><ArrowLeft size={18} /></button>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[14px] font-extrabold uppercase shadow-sm md:h-14 md:w-14 md:text-base ${getContactIconClass(getContactMeta(activeChat).tone)}`}>
                      {React.createElement(getContactMeta(activeChat).icon, { size: 22 })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase text-rose-500">{activeChat.title || getContactMeta(activeChat).label}</p>
                      <h5 className="truncate text-lg font-extrabold leading-tight text-brand-depth md:text-xl">{activeChat.name}</h5>
                      <div className={`mt-1 flex items-center gap-1.5 text-[10px] font-extrabold ${activeChat.isOnline ? 'text-emerald-600' : 'text-rose-500'}`}>
                          <div className={`h-2 w-2 rounded-full ${activeChat.isOnline ? 'bg-emerald-500' : 'bg-rose-400'}`}></div>
                          {getContactStatusLabel(activeChat)}
                      </div>
                    </div>
                </div>
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-brand-muted hover:bg-slate-50 hover:text-brand-primary"><MoreVertical size={18} /></button>
              </div>

              {/* Messages Area */}
              <div className="kg-parent-chat-messages relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-6 space-y-2.5 md:space-y-3 custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-6 h-6 border-3 border-brand-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                        <div key={`msg-${msg.id}`} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`kg-chat-bubble relative max-w-[86%] break-words px-4 py-3 shadow-sm md:max-w-[72%] md:px-4.5 md:py-3.5 group ${
                              msg.type === 'sent' ? 'kg-chat-bubble-sent rounded-2xl rounded-tr-md bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-100' : 'kg-chat-bubble-received rounded-2xl rounded-tl-md border border-rose-100 bg-white text-brand-depth shadow-rose-50'
                          }`}>
                              {msg.type === 'sent' && !msg.isDeleted && (
                                <div className="absolute -top-4 right-1 flex items-center gap-1 md:-left-16 md:right-auto md:top-2 md:hidden md:group-hover:flex">
                                  <button
                                    type="button"
                                    onClick={() => handleEditMessage(msg)}
                                    className="w-7 h-7 rounded-full bg-white text-brand-primary border border-slate-100 shadow-sm flex items-center justify-center hover:bg-brand-primary hover:text-white"
                                    title="Tahrirlash"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(msg)}
                                    className="kg-parent-danger-action w-7 h-7 rounded-full bg-white text-rose-500 border border-slate-100 shadow-sm flex items-center justify-center hover:bg-rose-500 hover:text-white"
                                    title="O'chirish"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                              <MessageBody msg={msg} tone={msg.type === 'sent' ? 'sent' : 'received'} />
                              <div className={`kg-chat-message-meta mt-1.5 flex items-center justify-end gap-1 ${msg.type === 'sent' ? 'kg-chat-message-meta-sent text-white/70' : 'kg-chat-message-meta-received text-brand-muted'}`}>
                                {msg.editedAt && !msg.isDeleted && <span className="text-[9px] md:text-[10px] font-black">tahrirlangan</span>}
                                <span className="text-[9px] md:text-[10px] font-black">{formatMessageTime(msg.time)}</span>
                                {msg.type === 'sent' && (
                                    msg.status === 'read' ? <CheckCheck size={10} /> : <Check size={10} />
                                )}
                              </div>
                          </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Quick Templates */}
              <div className="relative z-10 border-t border-brand-border bg-white/90 px-4 py-3 sm:px-5 md:px-6">
                <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto sm:grid sm:grid-cols-2 sm:overflow-visible">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={`tpl-${tpl.id}`}
                    onClick={() => handleSendMessage(tpl.text)}
                    className="min-h-[48px] min-w-[210px] snap-start rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/55 px-3.5 py-2.5 text-left text-[11px] font-extrabold leading-snug text-brand-depth shadow-sm shadow-rose-50 hover:border-rose-200 hover:bg-rose-50 sm:min-w-0 sm:text-[12px]"
                  >
                    <span className="flex h-full items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-500">
                        <tpl.icon size={16} />
                      </span>
                      <span className="min-w-0 whitespace-normal leading-snug">{tpl.text}</span>
                    </span>
                  </button>
                ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="relative z-10 border-t border-brand-border bg-white px-4 py-3.5 sm:px-5 md:px-6 md:py-4">
                {editingMessage && (
                  <div className="mb-2 flex items-center justify-between rounded-2xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-2">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Xabar tahrirlanmoqda</p>
                      <p className="truncate text-[11px] font-bold text-brand-depth">{editingMessage.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMessage(null);
                        setChatMessage('');
                      }}
                      className="text-brand-muted hover:text-rose-500"
                      title="Bekor qilish"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {isRecording ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl md:rounded-[1.8rem] px-4 py-1.5 md:py-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="flex-1 font-black text-red-500 text-xs tracking-widest">{formatTime(recordingTime)}</span>
                    <button onClick={() => setIsRecording(false)} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                    <button onClick={stopRecording} className="w-8 h-8 md:w-10 md:h-10 bg-red-500 text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-md"><Send size={14} /></button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatMessage); }}
                    className="flex min-w-0 items-center gap-2 rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/35 px-3 py-2.5 shadow-sm shadow-rose-50 focus-within:border-rose-300 sm:px-4 sm:py-3 md:gap-3"
                  >
                      <label className="hidden cursor-pointer text-brand-muted hover:text-rose-500 md:block">
                        <Paperclip size={18} />
                        <input type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileChange} />
                      </label>
                      <input 
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Xabar..."
                        className="min-w-0 flex-1 bg-transparent py-1.5 text-sm font-semibold text-brand-depth outline-none md:text-[15px]"
                      />
                      <button type="button" onClick={startRecording} className="text-brand-muted hover:text-rose-500"><Mic size={18} /></button>
                      <button
                        type="submit"
                        disabled={!chatMessage.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm shadow-rose-200 hover:from-rose-500 hover:to-pink-600 disabled:opacity-50"
                      >
                        <Send size={14} />
                      </button>
                  </form>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};


