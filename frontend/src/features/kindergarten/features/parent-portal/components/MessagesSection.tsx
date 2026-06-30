import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  MoreVertical, 
  Paperclip, 
  Send, 
  Check, 
  CheckCheck,
  Lock,
  MessageCircle,
  ArrowLeft,
  Mic,
  X,
  Clock,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '@/shared/api';
import { parentsApi } from '../../parents/api/parentsApi';
import { ChatMessage, ChatContact } from '../../parents/types/parentPortal.types';

const QUICK_TEMPLATES_LEGACY = [
  { id: 'absent', text: 'Bugun bormaymiz', icon: 'Uy' },
  { id: 'late', text: 'Biroz kechikamiz', icon: 'РІРЏВ°' },
  { id: 'pickup', text: 'Farzandimni amakisi olib ketadi', icon: 'Avtomobil' },
  { id: 'medicine', text: 'Dorisi bor edi', icon: 'СЂСџвЂ™Р‰' },
  { id: 'thanks', text: 'Rahmat, ustoz!', icon: 'СЂСџв„ўРЏ' }
];

const QUICK_TEMPLATES = [
  { id: 'absent', text: 'Bugun bormaymiz', icon: 'Uy' },
  { id: 'late', text: 'Biroz kechikamiz', icon: 'Vaqt' },
  { id: 'pickup', text: 'Farzandimni amakisi olib ketadi', icon: 'Avtomobil' },
  { id: 'medicine', text: 'Dorisi bor edi', icon: 'Dori' },
  { id: 'thanks', text: 'Rahmat, ustoz!', icon: 'OK' }
];

const getAssetUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getMessageType = (file?: File) => {
  if (!file) return 'text';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'file';
};

const MessageBody = ({ msg }: { msg: ChatMessage }) => {
  const url = getAssetUrl(msg.fileUrl);
  if (msg.isDeleted) {
    return <p className="text-[11px] md:text-sm font-bold italic opacity-70">Xabar o'chirildi</p>;
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
      {msg.text && <p className="text-[11px] md:text-sm font-bold leading-relaxed">{msg.text}</p>}
    </div>
  );
};

export const MessagesSection = () => {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    } catch (error) {
      console.error('Failed to load chat contacts:', error);
      setContacts([]);
    }
  }, [user]);

  const loadMessages = useCallback(async () => {
    if (!user?.id || !activeChat) return;
    setIsLoading(true);
    try {
      const data = await parentsApi.getMessages(user.id, activeChat.id);
      setMessages(data);
      if (activeChat.unreadCount > 0) {
        await parentsApi.markAsRead(user.id, activeChat.id);
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
    <div className="h-[500px] md:h-[600px] flex flex-col md:flex-row gap-4">
      {/* Contact List */}
      <div className={`${activeChat && 'hidden md:flex'} w-full md:w-72 flex-col gap-3 transition-all duration-500`}>
        <div className="bg-white p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-brand-border shadow-sm space-y-2">
            <p className="text-[8px] md:text-[9px] font-black text-brand-muted uppercase tracking-widest px-1.5">Tarbiyachi</p>
            <div className="space-y-1.5">
            {contacts.map((contact) => (
                <button 
                  key={contact.id}
                  onClick={() => setActiveChat(contact)}
                  className={`w-full flex items-center gap-2.5 p-2.5 md:p-3.5 rounded-xl md:rounded-[1.2rem] transition-all text-left border ${
                    activeChat?.id === contact.id ? 'bg-brand-primary/5 border-brand-primary' : 'bg-slate-50 border-slate-100 hover:border-brand-primary'
                  }`}
                >
                    <div className="relative">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-white border border-brand-border text-brand-primary shrink-0">
                        <User size={16} />
                      </div>
                      {contact.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-wide truncate">{contact.name}</p>
                      <p className={`text-[7px] md:text-[8px] mt-0.5 font-bold uppercase tracking-widest ${contact.isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {contact.isOnline ? 'Onlayn' : 'Oflayn'}
                      </p>
                    </div>
                </button>
            ))}
            </div>
        </div>
        <div className="hidden md:flex bg-brand-ghost p-4 rounded-[2rem] border border-brand-border flex-1 flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner opacity-40"><Lock size={20} /></div>
            <p className="text-[8px] font-black text-brand-muted uppercase leading-relaxed px-3 tracking-widest">Shifrlangan</p>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`${!activeChat && 'hidden md:flex'} flex-1 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl flex flex-col relative overflow-hidden transition-all duration-500`}>
        <AnimatePresence mode="wait">
          {!activeChat ? (
            <motion.div key="placeholder" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-ghost flex items-center justify-center border-2 border-slate-50 mb-4">
                <MessageCircle size={32} className="text-slate-300" />
              </div>
              <h4 className="text-lg md:text-xl font-black text-brand-depth">Xabar yuborish</h4>
              <p className="text-xs text-brand-muted mt-1.5 max-w-[200px]">Suhbatni boshlash uchun tarbiyachini tanlang.</p>
            </motion.div>
          ) : (
            <motion.div key="chat-window" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-3 md:p-5 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-2.5 md:gap-3.5">
                    <button onClick={() => setActiveChat(null)} className="md:hidden p-1.5 text-brand-muted hover:text-brand-primary"><ArrowLeft size={18} /></button>
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10">
                      <User size={18} />
                    </div>
                    <div>
                      <h5 className="text-sm md:text-lg font-black text-brand-depth tracking-tight">{activeChat.name}</h5>
                      <div className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${activeChat.isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                          <div className={`w-1 h-1 rounded-full ${activeChat.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div> 
                          {activeChat.isOnline ? 'Tarmoqda' : 'Oflayn'}
                      </div>
                    </div>
                </div>
                <button className="p-1.5 text-brand-muted hover:text-brand-primary transition-colors"><MoreVertical size={18} /></button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-3 md:space-y-4 relative z-10 custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-6 h-6 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                        <div key={`msg-${msg.id}`} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-xl md:rounded-[1.5rem] shadow-sm relative group ${
                              msg.type === 'sent' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-50 text-brand-depth rounded-tl-none border border-slate-100'
                          }`}>
                              {msg.type === 'sent' && !msg.isDeleted && (
                                <div className="absolute -left-16 top-2 hidden group-hover:flex items-center gap-1">
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
                                    className="w-7 h-7 rounded-full bg-white text-rose-500 border border-slate-100 shadow-sm flex items-center justify-center hover:bg-rose-500 hover:text-white"
                                    title="O'chirish"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                              <MessageBody msg={msg} />
                              <div className={`flex items-center justify-end gap-1 mt-1.5 ${msg.type === 'sent' ? 'text-white/60' : 'text-brand-muted'}`}>
                                {msg.editedAt && !msg.isDeleted && <span className="text-[7px] md:text-[8px] font-black">tahrirlangan</span>}
                                <span className="text-[7px] md:text-[8px] font-black">{msg.time}</span>
                                {msg.type === 'sent' && (
                                    msg.status === 'read' ? <CheckCheck size={8} /> : <Check size={8} />
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
              <div className="px-4 md:px-6 pb-1.5 overflow-x-auto flex gap-1.5 no-scrollbar relative z-10">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={`tpl-${tpl.id}`}
                    onClick={() => handleSendMessage(tpl.text)}
                    className="whitespace-nowrap bg-slate-50 hover:bg-brand-primary/10 border border-slate-100 hover:border-brand-primary px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold text-brand-depth transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>{tpl.icon}</span> {tpl.text}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-5 lg:p-6 border-t border-slate-50 bg-white/80 backdrop-blur-md relative z-10">
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
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl md:rounded-[1.8rem] px-4 py-1.5 md:py-3 transition-all">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="flex-1 font-black text-red-500 text-xs tracking-widest">{formatTime(recordingTime)}</span>
                    <button onClick={() => setIsRecording(false)} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                    <button onClick={stopRecording} className="w-8 h-8 md:w-10 md:h-10 bg-red-500 text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-md"><Send size={14} /></button>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatMessage); }}
                    className="flex items-center gap-2 md:gap-3 bg-slate-50 border border-transparent focus-within:border-brand-primary focus-within:bg-white rounded-xl md:rounded-[1.8rem] px-4 py-1.5 md:py-3 transition-all"
                  >
                      <label className="text-brand-muted hover:text-brand-primary transition-colors hidden md:block cursor-pointer">
                        <Paperclip size={18} />
                        <input type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileChange} />
                      </label>
                      <input 
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Xabar..."
                        className="flex-1 bg-transparent outline-none font-bold text-[11px] md:text-sm text-brand-depth py-1.5"
                      />
                      <button type="button" onClick={startRecording} className="text-brand-muted hover:text-brand-primary transition-colors"><Mic size={18} /></button>
                      <button 
                        type="submit"
                        disabled={!chatMessage.trim()}
                        className="w-8 h-8 md:w-10 md:h-10 bg-brand-primary text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 disabled:opacity-50 disabled:scale-100"
                      >
                        <Send size={14} />
                      </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


