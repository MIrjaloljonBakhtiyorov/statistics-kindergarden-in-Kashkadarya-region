import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Clock3,
  LayoutGrid,
  FlaskConical,
  AlertCircle,
  Utensils
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { OperationsLog } from '../../features/operations/components/OperationsLog';
import { ArrowLeft, Check, CheckCheck, Edit3, MessageCircle, Search, Send, Trash2, UserRound, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { parentsApi } from '../../features/parents/api/parentsApi';
import { ChatMessage, DirectorChatContact } from '../../features/parents/types/parentPortal.types';

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Nonushta',
  LUNCH: 'Tushlik',
  TEA: 'Poldnik',
  DINNER: 'Kechki ovqat',
};

const MEAL_SHORTS: Record<string, string> = {
  BREAKFAST: 'NO',
  LUNCH: 'TU',
  TEA: 'PO',
  DINNER: 'KE',
};

const KPI_THEMES = {
  children: {
    from: '#eff6ff',
    via: '#ffffff',
    to: '#dbeafe',
    accent: '#2563eb',
    badgeBg: '#dbeafe',
    glow: 'rgba(37, 99, 235, 0.16)',
  },
  early: {
    from: '#ecfdf5',
    via: '#ffffff',
    to: '#bbf7d0',
    accent: '#059669',
    badgeBg: '#d1fae5',
    glow: 'rgba(5, 150, 105, 0.16)',
  },
  late: {
    from: '#fff7ed',
    via: '#ffffff',
    to: '#fed7aa',
    accent: '#d97706',
    badgeBg: '#ffedd5',
    glow: 'rgba(217, 119, 6, 0.18)',
  },
  groups: {
    from: '#ecfeff',
    via: '#ffffff',
    to: '#a5f3fc',
    accent: '#0891b2',
    badgeBg: '#cffafe',
    glow: 'rgba(8, 145, 178, 0.16)',
  },
};

const KPICard = ({ title, value, meta, icon: Icon, theme, detail, progress = 0, footer }: any) => {
  const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      className="group relative min-h-[188px] overflow-hidden rounded-[1.35rem] border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: `
          radial-gradient(circle at 18% 14%, rgba(255,255,255,0.96), transparent 5.8rem),
          radial-gradient(circle at 92% 0%, ${theme.accent}24, transparent 8rem),
          linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 46%, ${theme.to} 100%)
        `,
        borderColor: `${theme.accent}38`,
        boxShadow: `0 18px 44px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.88)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-45 blur-2xl transition-transform duration-500 group-hover:scale-125"
        style={{ background: theme.accent }}
      />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-24 w-44 rotate-[-18deg] rounded-full bg-white/55 blur-xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.28) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5" style={{ background: `linear-gradient(180deg, ${theme.accent}, transparent)` }} />

      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white/70 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
            boxShadow: `0 14px 26px ${theme.glow}`,
          }}
        >
          <Icon size={21} />
        </div>
        <div
          className="rounded-full border px-3 py-1.5 font-black text-[10px] sm:text-xs backdrop-blur-md"
          style={{
            backgroundColor: `${theme.badgeBg}cc`,
            borderColor: `${theme.accent}38`,
            color: theme.accent,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {meta}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: '#475569' }}>{title}</p>
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-3xl sm:text-4xl font-black text-brand-depth font-sans tracking-tight leading-none">{value}</h3>
          <span className="rounded-full border bg-white/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest" style={{ borderColor: `${theme.accent}28`, color: theme.accent }}>
            {detail}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border bg-white/62 p-3 backdrop-blur-md" style={{ borderColor: `${theme.accent}22` }}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">{footer}</span>
            <span className="text-[10px] font-black" style={{ color: theme.accent }}>{normalizedProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${normalizedProgress}%`,
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}99)`,
                boxShadow: `0 0 18px ${theme.glow}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
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

const DirectorMessagesPanel = ({ onUnreadCountChange }: { onUnreadCountChange?: (count: number) => void }) => {
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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const kindergartenId = String(user?.kindergarten_id || window.location.pathname.split('/').filter(Boolean)[1] || user?.id || '');
  const directorId = kindergartenId ? `role_director_${kindergartenId}` : '';

  const filteredContacts = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) =>
      [contact.name, contact.childName, contact.childGroup, contact.login]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [contacts, searchTerm]);

  const loadContacts = React.useCallback(async () => {
    try {
      const data = await parentsApi.getDirectorContacts();
      setContacts(data);
      onUnreadCountChange?.(data.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0));
      setActiveContact((current) => {
        if (!current) return current;
        return data.find((contact) => String(contact.id) === String(current.id)) || current;
      });
    } catch (error) {
      console.error('Failed to load director contacts:', error);
      setContacts([]);
      onUnreadCountChange?.(0);
    } finally {
      setIsContactsLoading(false);
    }
  }, [onUnreadCountChange]);

  const loadMessages = React.useCallback(async () => {
    if (!directorId || !activeContact) {
      setMessages([]);
      return;
    }

    setIsMessagesLoading(true);
    try {
      const data = await parentsApi.getMessages(directorId, activeContact.id, {
        userRole: 'director',
        contactRole: 'parent',
      });
      setMessages(data);

      if (activeContact.unreadCount > 0) {
        await parentsApi.markAsRead(directorId, activeContact.id, {
          userRole: 'director',
          contactRole: 'parent',
        });
        loadContacts();
      }
    } catch (error) {
      console.error('Failed to load director messages:', error);
      setMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, [activeContact, directorId, loadContacts]);

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
    if (!text || !activeContact || !directorId) return;

    setChatMessage('');
    try {
      if (editingMessage) {
        const updatedMessage = await parentsApi.editMessage(editingMessage.id, {
          userId: directorId,
          userRole: 'director',
          text,
        });
        setMessages((prev) => prev.map((msg) => String(msg.id) === String(updatedMessage.id) ? { ...updatedMessage, type: 'sent' } : msg));
        setEditingMessage(null);
        showNotification('Xabar tahrirlandi', 'success');
        loadContacts();
        return;
      }

      await parentsApi.sendMessage({
        senderId: directorId,
        receiverId: activeContact.id,
        text,
        senderRole: 'director',
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
    if (!directorId) return;
    try {
      const deletedMessage = await parentsApi.deleteMessage(msg.id, { userId: directorId, userRole: 'director' });
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
    <section className="overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_20px_52px_rgba(14,165,233,0.09)]">
      <div className="flex flex-col gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
            <MessageCircle size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Ota-onalar bilan aloqa</p>
            <h4 className="truncate text-lg font-black text-brand-depth sm:text-xl">Xabarlar markazi</h4>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-muted">
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
        <aside className={`${activeContact ? 'hidden lg:flex' : 'flex'} min-h-0 w-full flex-col border-r border-sky-50 bg-slate-50/55 lg:w-[360px]`}>
          <div className="border-b border-sky-50 p-4">
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
                  className={`w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-primary ${
                    activeContact?.id === contact.id ? 'border-brand-primary bg-white shadow-md' : 'border-slate-100 bg-white/85'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-brand-primary">
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
                      <p className="mt-1 truncate text-[10px] font-bold text-brand-primary">{contact.childName || 'Bola biriktirilmagan'}</p>
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
              <p className="mt-2 max-w-sm text-sm font-semibold text-brand-muted">Ota-onadan kelgan xabarlarni ko'rish yoki javob yuborish uchun chap ro'yxatdan suhbatni oching.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button onClick={() => setActiveContact(null)} className="rounded-xl p-2 text-brand-muted hover:bg-slate-50 lg:hidden">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <UserRound size={22} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="truncate text-base font-black text-brand-depth sm:text-lg">{activeContact.name}</h5>
                    <p className="truncate text-[10px] font-black uppercase tracking-widest text-brand-primary">{activeContact.childName || activeContact.login}</p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-slate-50/80 p-5 custom-scrollbar sm:p-6">
                {isMessagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="max-w-xs text-sm font-bold text-brand-muted">Hali xabar yo'q. Birinchi xabarni direktor nomidan yuborishingiz mumkin.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`group relative max-w-[84%] rounded-3xl p-4 shadow-sm ${
                        msg.type === 'sent'
                          ? 'rounded-tr-md bg-brand-primary text-white'
                          : 'rounded-tl-md border border-slate-100 bg-white text-brand-depth'
                      }`}>
                        {msg.type === 'sent' && !msg.isDeleted && (
                          <div className="absolute -left-20 top-3 hidden items-center gap-1.5 group-hover:flex">
                            <button
                              type="button"
                              onClick={() => handleEditMessage(msg)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-brand-primary shadow-sm hover:bg-brand-primary hover:text-white"
                              title="Tahrirlash"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white"
                              title="O'chirish"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                        <ChatMessageBody msg={msg} />
                        <div className={`mt-2 flex items-center justify-end gap-1.5 ${msg.type === 'sent' ? 'text-white/65' : 'text-brand-muted'}`}>
                          {msg.editedAt && !msg.isDeleted && <span className="text-[9px] font-black">tahrirlangan</span>}
                          <span className="text-[9px] font-black">{formatChatTime(msg.time)}</span>
                          {msg.type === 'sent' && (msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-100 p-4 sm:p-5">
                {editingMessage && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Xabar tahrirlanmoqda</p>
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
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 rounded-3xl border-2 border-slate-100 bg-slate-50 px-4 py-3 transition-all focus-within:border-brand-primary focus-within:bg-white">
                  <input
                    value={chatMessage}
                    onChange={(event) => setChatMessage(event.target.value)}
                    placeholder="Ota-onaga xabar yozish..."
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm font-bold text-brand-depth outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 disabled:opacity-45"
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

const DirectorView: React.FC = () => {
  const [activeDirectorTab, setActiveDirectorTab] = useState<'dashboard' | 'messages'>('dashboard');
  const [directorUnreadCount, setDirectorUnreadCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [statsRes, samplesRes, menuRes, groupsRes] = await Promise.all([
          apiClient.get('/attendance/today-stats'),
          apiClient.get('/lab/samples'),
          apiClient.get(`/menu/${today}`),
          apiClient.get('/groups')
        ]);
        setStats(statsRes.data);
        setSamples(samplesRes.data.slice(0, 5));
        setMenu(menuRes.data);
        setGroups(groupsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const loadDirectorUnreadCount = React.useCallback(async () => {
    try {
      const data = await parentsApi.getDirectorContacts();
      setDirectorUnreadCount(data.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0));
    } catch {
      setDirectorUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadDirectorUnreadCount();
    const interval = window.setInterval(loadDirectorUnreadCount, 10000);
    return () => window.clearInterval(interval);
  }, [loadDirectorUnreadCount]);

  const handleApproveMenu = async () => {
    try {
      await apiClient.post('/menus/approve-today');
      // Refresh stats
      const statsRes = await apiClient.get('/attendance/today-stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };


  const beforeNineCount = Math.max((stats?.present || 0) - (stats?.late || 0), 0);
  const totalChildren = stats?.total || 0;
  const presentCount = stats?.present || 0;
  const lateCount = stats?.late || 0;
  const attendanceProgress = totalChildren ? (presentCount / totalChildren) * 100 : 0;
  const earlyProgress = totalChildren ? (beforeNineCount / totalChildren) * 100 : 0;
  const lateProgress = totalChildren ? (lateCount / totalChildren) * 100 : 0;
  const groupProgress = Math.min(100, groups.length * 12);

  return (
    <div className="space-y-5 sm:space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-sky-100 bg-white/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-brand-depth">Direktor bo'limi</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Boshqaruv va ota-onalar bilan aloqa</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1.5 sm:w-[360px]">
          <button
            type="button"
            onClick={() => setActiveDirectorTab('dashboard')}
            className={`rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeDirectorTab === 'dashboard'
                ? 'bg-white text-brand-primary shadow-sm'
                : 'text-brand-muted hover:bg-white/70'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveDirectorTab('messages')}
            className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeDirectorTab === 'messages'
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'text-brand-muted hover:bg-white/70'
            }`}
          >
            <MessageCircle size={14} />
            Xabarlar
            {directorUnreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white ring-2 ring-white">
                {directorUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeDirectorTab === 'messages' ? (
        <DirectorMessagesPanel onUnreadCountChange={setDirectorUnreadCount} />
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard title="Jami bolalar soni" value={totalChildren} meta="Ro'yxatda" icon={Users} theme={KPI_THEMES.children} detail={`${presentCount} keldi`} progress={attendanceProgress} footer="Bugungi davomat" />
        <KPICard title="09:30 gacha kelganlar" value={beforeNineCount} meta="Vaqtida" icon={ClipboardCheck} theme={KPI_THEMES.early} detail="erta" progress={earlyProgress} footer="Vaqtida kelish" />
        <KPICard title="09:30 dan keyin kelganlar" value={lateCount} meta="Kechikkan" icon={Clock3} theme={KPI_THEMES.late} detail="nazorat" progress={lateProgress} footer="Kechikish ulushi" />
        <KPICard title="Umumiy guruhlar" value={groups.length} meta="Faol guruhlar" icon={LayoutGrid} theme={KPI_THEMES.groups} detail="guruh" progress={groupProgress} footer="Guruh faolligi" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8">
          <OperationsLog />
        </div>

        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="relative overflow-hidden bg-white/92 rounded-[1.5rem] p-5 sm:p-6 border border-emerald-100 shadow-[0_20px_52px_rgba(16,185,129,0.10)] backdrop-blur-md">
            <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-200/55 blur-3xl" />
            <div className="relative z-10 flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Kunlik taomnoma</p>
                <h4 className="font-sans font-black text-base sm:text-lg text-brand-depth">Bugungi Menu</h4>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 text-brand-primary text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">Admin</span>
            </div>
            <div className="relative z-10 space-y-3">
              {menu.length === 0 ? (
                <div className="relative overflow-hidden py-8 text-center border-2 border-dashed border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-sky-50/55 rounded-2xl">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-sm border border-emerald-100">
                    <Utensils size={22} />
                  </div>
                  <p className="text-brand-muted text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Bugun uchun menu kiritilmagan</p>
                </div>
              ) : (
                menu.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-br from-white to-emerald-50/45 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-[0_14px_30px_rgba(16,185,129,0.10)] transition-all">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.meal_name || 'Taom rasmi'} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary font-black text-[9px] sm:text-[10px] border border-emerald-100 shadow-sm">
                          {MEAL_SHORTS[item.meal_type] || 'OV'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-black text-brand-depth leading-snug break-words">{item.meal_name}</p>
                        <p className="text-[8px] sm:text-[9px] text-brand-muted uppercase font-bold tracking-tight">{item.calories} kkal - {MEAL_LABELS[item.meal_type] || item.meal_type}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/92 rounded-[1.5rem] p-5 sm:p-6 border border-sky-100 shadow-[0_20px_52px_rgba(14,165,233,0.10)] backdrop-blur-md">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="relative z-10 flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-sky-600 mb-1">Sifat nazorati</p>
                <h4 className="font-sans font-black text-base sm:text-lg text-brand-depth">Laboratoriya & Sinama</h4>
              </div>
              <span className="px-3 py-1.5 bg-sky-50 text-sky-700 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-sky-100">Analizlar</span>
            </div>
            <div className="relative z-10 space-y-4">
              {stats?.approved_recipes > 0 ? (
                <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20 ring-4 ring-white/70">
                    <ClipboardCheck size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Ovqat retsepti</p>
                    <p className="text-xs sm:text-sm font-bold text-brand-depth">Tasdiqlangan</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20 ring-4 ring-white/70">
                      <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600 uppercase">Ovqat retsepti</p>
                      <p className="text-xs sm:text-sm font-bold text-brand-depth">Tasdiqlanmagan</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleApproveMenu}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] sm:text-[10px] font-black uppercase rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    Tasdiqlash
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {samples.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-sky-100 bg-gradient-to-br from-sky-50/60 to-emerald-50/45 rounded-2xl">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm border border-sky-100">
                      <FlaskConical size={22} />
                    </div>
                    <p className="text-brand-muted text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Analizlar mavjud emas</p>
                  </div>
                ) : (
                  samples.map((s, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-gradient-to-br from-white to-sky-50/45 rounded-2xl border border-sky-100 hover:border-sky-200 transition-all group shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-brand-depth truncate">{s.dish_name}</p>
                          <p className="text-[8px] sm:text-[9px] text-brand-muted font-bold">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase border shrink-0 ${
                          s.risk_level === 'NORMAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          s.risk_level === 'WARNING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                        }`}>
                          {s.risk_level === 'NORMAL' ? 'Toza' : s.risk_level}
                        </span>
                      </div>
                      
                      {s.test_results && (
                        <div className="grid grid-cols-3 gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200">
                          <div className="text-center">
                            <p className="text-[7px] font-black text-brand-muted uppercase">pH</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-brand-depth">{s.test_results.ph_level}</p>
                          </div>
                          <div className="text-center border-x border-slate-200">
                            <p className="text-[7px] font-black text-brand-muted uppercase">Bakteriya</p>
                            <p className={`text-[9px] sm:text-[10px] font-black ${s.test_results.bacterial_check === 'PASS' ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {s.test_results.bacterial_check === 'PASS' ? 'OK' : 'XAVF'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[7px] font-black text-brand-muted uppercase">Organolep.</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-emerald-600">OK</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-sky-50 p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 mt-4 shadow-sm">
                 <div className="p-2 bg-white rounded-xl border border-emerald-100 text-brand-emerald shadow-sm shrink-0">
                   <FlaskConical size={16} className="sm:w-4 sm:h-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                     <p className="text-[10px] sm:text-xs font-bold text-brand-depth truncate">Namuna Olish</p>
                     <span className="text-[9px] sm:text-[10px] font-black text-brand-emerald">
                        {samples.length > 0 && menu.length > 0 ? Math.round((samples.length / menu.length) * 100) : 0}%
                     </span>
                   </div>
                   <div className="w-full bg-slate-200 h-1 sm:h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-emerald h-full transition-all duration-1000" 
                        style={{ width: `${samples.length > 0 && menu.length > 0 ? Math.round((samples.length / menu.length) * 100) : 0}%` }}
                      ></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default DirectorView;

