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
  FileText,
  MapPinned,
  RefreshCw,
  Route,
  Crown,
  ExternalLink,
  Loader2,
  Megaphone,
  Newspaper,
  History,
  Languages,
  X,
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
import {
  ParentPortalAutoTranslator,
  ParentPortalLanguagePanel,
  ParentPortalLanguageProvider,
  parentPortalLanguages,
  useParentPortalLanguage,
} from '../../features/parent-portal/i18n/parentPortalI18n';


type SettingsTab = 'profile' | 'parentProfile' | 'security' | 'menu' | 'medical' | 'messages' | 'finance' | 'language' | 'tariffs' | 'attendance' | 'documents' | 'pickup' | 'progress' | 'vaccines' | 'psychology' | 'nearby' | 'developmentMap' | 'ads' | 'news' | 'loginHistory';

const tabToPath: Record<SettingsTab, string> = {
  profile: 'profile',
  parentProfile: 'parent-profile',
  security: 'safety',
  finance: 'payment',
  language: 'language',
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
  ads: 'ads',
  news: 'news',
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
  const rawValue = String(value || '').trim();
  if (!rawValue || rawValue === 'null' || rawValue === 'undefined') return '';
  const normalizedValue = rawValue;
  if (/^(https?:|data:|blob:)/.test(normalizedValue)) return normalizedValue;
  const apiBase = PARENT_PORTAL_API_BASE_URL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`}`;
};

const ComingSoonSection = ({ title, description, icon: Icon, statusText = "Bu qism dasturchi tomonidan ishlab chiqilyapti" }: { title: string; description: string; icon: any; statusText?: string }) => (
  <div className="flex min-h-[420px] items-center justify-center px-3 py-8">
    <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-6 text-center shadow-sm sm:p-8">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/70 to-transparent" />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-slate-950 to-blue-950 text-white shadow-lg shadow-slate-950/20">
        <Icon size={30} />
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-slate-950">Tez kunda</p>
      <h2 className="mt-2 text-2xl font-black leading-tight text-brand-depth sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-relaxed text-brand-muted sm:text-base">{description}</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-black text-brand-depth">{statusText}</p>
      </div>
    </div>
  </div>
);

interface ParentNewsItem {
  id: string;
  title: string;
  text?: string;
  imageUrl?: string;
  mediaType?: 'image' | 'video';
  linkUrl?: string;
  publishedAt?: string;
  createdAt?: string;
}

interface ParentAdvertisementItem {
  id: string;
  name: string;
  text?: string;
  imageUrl?: string;
  linkUrl?: string;
  contentType?: 'image' | 'video' | 'text';
  displayCount?: number;
  durationDays?: number;
  createdAt?: string;
}

const formatParentNewsDate = (value?: string) => {
  if (!value) return 'Yangilik';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const normalizeParentNewsLink = (value?: string) => {
  const link = String(value || '').trim();
  if (!link) return '';
  return /^(https?:)?\/\//i.test(link) || link.startsWith('/') ? link : `https://${link}`;
};

const getSeenNewsIds = (storageKey: string) => {
  if (!storageKey) return new Set<string>();
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    localStorage.removeItem(storageKey);
    return new Set<string>();
  }
};

const saveSeenNewsIds = (storageKey: string, ids: string[]) => {
  if (!storageKey) return;
  const merged = new Set([...getSeenNewsIds(storageKey), ...ids.map(String)]);
  localStorage.setItem(storageKey, JSON.stringify([...merged].slice(-500)));
};

const AD_COUNTDOWN_SECONDS = 9;

const getRandomParentAdvertisement = (items: ParentAdvertisementItem[], storageKey: string) => {
  if (items.length === 0) return undefined;
  if (items.length <= 1) return items[0];

  let lastId = '';
  try {
    lastId = localStorage.getItem(storageKey) || '';
  } catch {
    lastId = '';
  }

  const candidates = lastId ? items.filter((item) => item.id !== lastId) : items;
  const selectedItem = candidates[Math.floor(Math.random() * candidates.length)] || items[0];
  try {
    localStorage.setItem(storageKey, selectedItem.id);
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }

  return selectedItem;
};

const ParentAdsSection = ({
  onClose,
  onEmpty,
  rotationKey,
}: {
  onClose: () => void;
  onEmpty?: () => void;
  rotationKey: string;
}) => {
  const [selectedItem, setSelectedItem] = useState<ParentAdvertisementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const countdownRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const recordedAdvertisementViewRef = useRef('');

  useEffect(() => {
    let mounted = true;

    apiClient.get('/parent-portal/advertisements')
      .then((response) => {
        if (!mounted) return;
        const rows = Array.isArray(response.data) ? response.data : [];
        const normalizedItems: ParentAdvertisementItem[] = rows.map((item: any) => ({
          id: String(item.id),
          name: String(item.name || ''),
          text: String(item.text || '').trim() || undefined,
          imageUrl: String(item.imageUrl || item.image_url || '').trim() || undefined,
          linkUrl: String(item.linkUrl || item.link_url || '').trim() || undefined,
          contentType: String(item.contentType || item.content_type || 'text') === 'video'
            ? 'video'
            : String(item.contentType || item.content_type || 'text') === 'image'
              ? 'image'
              : 'text',
          displayCount: Number(item.displayCount || item.display_count || 0),
          durationDays: Number(item.durationDays || item.duration_days || 1),
          createdAt: String(item.createdAt || item.created_at || ''),
        }));
        setSelectedItem(getRandomParentAdvertisement(normalizedItems, rotationKey) || null);
      })
      .catch(() => {
        if (mounted) {
          setSelectedItem(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [rotationKey]);

  const activeItem = selectedItem;

  useEffect(() => {
    if (!loading && !activeItem) {
      onEmpty?.();
    }
  }, [activeItem, loading, onEmpty]);

  useEffect(() => {
    if (!activeItem?.id) return;
    if (recordedAdvertisementViewRef.current === activeItem.id) return;
    recordedAdvertisementViewRef.current = activeItem.id;
    apiClient.post(`/parent-portal/advertisements/${activeItem.id}/view`).catch(() => undefined);
  }, [activeItem?.id]);

  useEffect(() => {
    if (loading || !activeItem) return;

    let remainingSeconds = AD_COUNTDOWN_SECONDS;
    const countdownElement = countdownRef.current;
    const closeButtonElement = closeButtonRef.current;

    if (countdownElement) {
      countdownElement.textContent = String(AD_COUNTDOWN_SECONDS);
      countdownElement.style.display = 'flex';
    }
    if (closeButtonElement) {
      closeButtonElement.style.display = 'none';
    }

    const intervalId = window.setInterval(() => {
      remainingSeconds -= 1;

      if (countdownElement) {
        countdownElement.textContent = String(Math.max(remainingSeconds, 0));
      }

      if (remainingSeconds <= 0) {
        window.clearInterval(intervalId);
        if (countdownElement) {
          countdownElement.style.display = 'none';
        }
        if (closeButtonElement) {
          closeButtonElement.style.display = 'flex';
        }
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeItem?.id, loading]);

  const openAdLink = (link?: string) => {
    const url = normalizeParentNewsLink(link);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAdCardClick = (event: React.MouseEvent<HTMLElement>, link?: string) => {
    const target = event.target as HTMLElement;
    if (target.closest('video, button, a')) return;
    openAdLink(link);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-black text-white shadow-xl backdrop-blur">
          <Loader2 size={18} className="animate-spin text-blue-700" />
          Reklamalar yuklanmoqda
        </div>
      </div>
    );
  }

  if (!activeItem) {
    return null;
  }

  const source = getAssetUrl(activeItem.imageUrl);
  const isLinked = Boolean(activeItem.linkUrl);

  return (
    <section
      role={isLinked ? 'link' : undefined}
      tabIndex={isLinked ? 0 : undefined}
      onClick={(event) => handleAdCardClick(event, activeItem.linkUrl)}
      onKeyDown={(event) => {
        if (isLinked && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openAdLink(activeItem.linkUrl);
        }
      }}
      className={`fixed inset-0 z-[9999] h-screen w-screen overflow-hidden bg-transparent text-white ${
        isLinked ? 'cursor-pointer focus:outline-none' : ''
      }`}
    >
      <div className="absolute inset-x-[10vw] inset-y-[9vh] overflow-hidden bg-slate-900">
        {source && activeItem.contentType === 'video' ? (
          <video
            src={source}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : source ? (
          <img src={source} alt={activeItem.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 text-center">
            <div className="max-w-3xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border border-white/15 bg-white/10 shadow-2xl">
                <Megaphone size={38} />
              </div>
              <h1 className="mt-7 break-words text-4xl font-black leading-tight sm:text-6xl">
                {activeItem.name}
              </h1>
              {activeItem.text ? (
                <p className="mx-auto mt-5 max-w-2xl break-words text-lg font-bold leading-8 text-white/75 sm:text-2xl sm:leading-10">
                  {activeItem.text}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="absolute right-[calc(10vw-56px)] top-[calc(9vh-56px)] z-20">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="Reklamani yopish"
          style={{ display: 'none' }}
          className="h-13 w-13 items-center justify-center rounded-full border border-white/25 bg-white text-slate-950 shadow-2xl transition hover:scale-105 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
        >
          <X size={24} />
        </button>
        <div
          ref={countdownRef}
          className="flex h-13 min-w-13 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-2xl font-black text-slate-950 shadow-2xl"
        >
          {AD_COUNTDOWN_SECONDS}
        </div>
      </div>

    </section>
  );
};

const ParentNewsSection = ({
  seenStorageKey,
  onCountChange,
}: {
  seenStorageKey: string;
  onCountChange?: (count: number) => void;
}) => {
  const [items, setItems] = useState<ParentNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiClient.get('/parent-portal/news')
      .then((response) => {
        if (!mounted) return;
        const rows = Array.isArray(response.data) ? response.data : [];
        const normalizedRows: ParentNewsItem[] = rows.map((item: any) => ({
          id: String(item.id),
          title: String(item.title || ''),
          text: String(item.text || item.body || '').trim() || undefined,
          imageUrl: String(item.imageUrl || item.image_url || ''),
          mediaType: String(item.mediaType || item.media_type || 'image') === 'video' ? 'video' as const : 'image' as const,
          linkUrl: String(item.linkUrl || item.link_url || '').trim() || undefined,
          publishedAt: String(item.publishedAt || item.published_at || ''),
          createdAt: String(item.createdAt || item.created_at || ''),
        }));
        saveSeenNewsIds(seenStorageKey, normalizedRows.map((item) => item.id));
        onCountChange?.(0);
        setItems(normalizedRows);
      })
      .catch(() => {
        if (mounted) setItems([]);
        onCountChange?.(0);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [onCountChange, seenStorageKey]);

  const openNewsLink = (link?: string) => {
    const url = normalizeParentNewsLink(link);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNewsCardClick = (event: React.MouseEvent<HTMLElement>, link?: string) => {
    const target = event.target as HTMLElement;
    if (target.closest('video, button, a')) return;
    openNewsLink(link);
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-brand-muted shadow-sm">
          <Loader2 size={18} className="animate-spin text-blue-700" />
          Yuklanmoqda
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-950 via-blue-800 to-indigo-700" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white shadow-lg shadow-slate-950/15">
              <Newspaper size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Ota-ona portali</p>
              <h2 className="mt-1 text-2xl font-black leading-tight text-brand-depth sm:text-3xl">Yangiliklar</h2>
              <p className="mt-1 text-sm font-bold leading-6 text-brand-muted">
                MTT administratsiyasi tomonidan joylangan faol yangiliklar.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-800">
            <Newspaper size={14} />
            {items.length} ta yangilik
          </span>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid max-w-[820px] gap-4">
          {items.map((item) => {
            const mediaUrl = getAssetUrl(item.imageUrl);
            const isLinked = Boolean(item.linkUrl);

            return (
              <article
                key={item.id}
                role={isLinked ? 'link' : undefined}
                tabIndex={isLinked ? 0 : undefined}
                onClick={(event) => handleNewsCardClick(event, item.linkUrl)}
                onKeyDown={(event) => {
                  if (isLinked && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    openNewsLink(item.linkUrl);
                  }
                }}
                className={`group grid min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all md:grid-cols-[260px_minmax(0,1fr)] ${
                  isLinked ? 'cursor-pointer hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 focus:outline-none focus:ring-4 focus:ring-blue-100' : ''
                }`}
              >
                <div className="relative h-[190px] w-full overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 sm:h-[220px] md:h-[230px]">
                  {mediaUrl ? (
                    item.mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="h-full w-full object-cover" />
                    ) : (
                      <img src={mediaUrl} alt={item.title} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Newspaper size={34} />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/30 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-950 shadow-sm backdrop-blur">
                    Yangilik
                  </span>
                </div>
                <div className="flex min-h-0 min-w-0 flex-col justify-between p-4 sm:p-5">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-500">
                        <Calendar size={13} />
                        {formatParentNewsDate(item.publishedAt || item.createdAt)}
                      </span>
                      {isLinked && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
                          <ExternalLink size={13} />
                          Batafsil
                        </span>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 overflow-hidden break-words text-[18px] font-black leading-snug text-brand-depth sm:text-[20px] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                        {item.title}
                      </h3>
                      {isLinked && (
                        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white sm:flex">
                          <ExternalLink size={17} />
                        </span>
                      )}
                    </div>
                    {item.text && (
                      <p className="mt-3 max-w-2xl overflow-hidden break-words text-[13px] font-semibold leading-6 text-brand-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                        {item.text}
                      </p>
                    )}
                  </div>
                  {isLinked && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="truncate text-[11px] font-bold text-slate-400">
                        Yangilik ustiga bosib havolaga o'tish mumkin
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-100 text-slate-500">
              <Newspaper size={24} />
            </div>
            <p className="mt-4 text-base font-black text-brand-depth">Hozircha faol yangilik yo'q</p>
            <p className="mt-2 text-sm font-bold text-brand-muted">Admin panelda saqlangan faol yangiliklar shu yerda chiqadi.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ParentViewContent = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const { language, t: parentT, phrase: parentPhrase } = useParentPortalLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => getParentTabFromPath());
  const [isSaving, setIsSaving] = useState(false);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);
  const [parentNewsCount, setParentNewsCount] = useState(0);
  const [showLoginAdvertisement, setShowLoginAdvertisement] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const loginAdvertisementAttemptedRef = useRef(false);
  
  const [parentData, setParentData] = useState<any>(null);
  const [fullPortalData, setFullPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [childPhotoFailed, setChildPhotoFailed] = useState(false);

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

  const parentNewsSeenKey = `parent-portal-seen-news:${user?.id || 'parent'}:${user?.childId || 'child'}`;
  const parentAdvertisementRotationKey = `parent-portal-ad-rotation:${user?.id || 'parent'}:${user?.childId || 'child'}`;

  const dismissLoginAdvertisement = useCallback(() => {
    setShowLoginAdvertisement(false);
  }, []);

  const handleParentLogout = useCallback(() => {
    logout();
  }, [logout]);

  useEffect(() => {
    loginAdvertisementAttemptedRef.current = false;
    setShowLoginAdvertisement(false);
  }, [user?.childId, user?.id]);

  useEffect(() => {
    if (loading || !user?.id || !user?.childId || !parentData) return;
    if (loginAdvertisementAttemptedRef.current) return;
    loginAdvertisementAttemptedRef.current = true;
    setShowLoginAdvertisement(true);
  }, [loading, parentData, user?.childId, user?.id]);

  const loadParentNewsCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/parent-portal/news');
      const rows = Array.isArray(response.data) ? response.data : [];
      const seenIds = getSeenNewsIds(parentNewsSeenKey);
      setParentNewsCount(rows.filter((item: any) => !seenIds.has(String(item.id))).length);
    } catch {
      setParentNewsCount(0);
    }
  }, [parentNewsSeenKey]);

  useEffect(() => {
    loadParentNewsCount();
    const interval = window.setInterval(loadParentNewsCount, 30000);
    return () => window.clearInterval(interval);
  }, [loadParentNewsCount]);

  useEffect(() => {
    setChildPhotoFailed(false);
  }, [parentData?.photo_url]);

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
        <div className="w-20 h-20 bg-slate-100 text-slate-950 rounded-[2rem] flex items-center justify-center border-2 border-slate-200 shadow-xl">
           <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-brand-depth">Hisob bog'lanmagan</h2>
           <p className="text-brand-muted font-bold max-w-sm mx-auto text-sm">Ushbu ota-ona hisobi hali biron bir bola ma'lumotlariga bog'lanmagan.</p>
        </div>
        <button onClick={handleParentLogout} className="px-8 py-4 bg-brand-depth text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-brand-primary flex items-center gap-3">
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
    { id: 'profile', label: parentPhrase('Bola profili'), icon: User, color: 'navy' },
    { id: 'parentProfile', label: parentPhrase('Ota-ona profili'), icon: Users, color: 'navy' },
    { id: 'finance', label: parentPhrase("To'lovlar"), icon: Wallet, color: 'navy' },
    { id: 'language', label: parentT('nav.language'), icon: Languages, color: 'navy' },
    { id: 'tariffs', label: parentPhrase('Tariflar'), icon: BadgeDollarSign, color: 'navy' },
    { id: 'attendance', label: parentPhrase('Davomat'), icon: Calendar, color: 'navy' },
    { id: 'progress', label: parentPhrase('Yutuqlar'), icon: Star, color: 'navy' },
    { id: 'developmentMap', label: parentPhrase('Rivojlanish xaritasi'), icon: Route, color: 'navy' },
    { id: 'psychology', label: parentPhrase('Psixologik maslahat'), icon: Brain, color: 'navy' },
    { id: 'nearby', label: parentPhrase("Yaqin bog'chalar"), icon: MapPinned, color: 'navy' },
    { id: 'news', label: parentPhrase('Yangiliklar'), icon: Newspaper, color: 'navy' },
    { id: 'messages', label: parentPhrase('Xabarlar'), icon: MessageSquare, color: 'navy' },
    { id: 'menu', label: parentPhrase('Menyu'), icon: Apple, color: 'navy' },
    { id: 'vaccines', label: parentPhrase('Emlash'), icon: Syringe, color: 'navy' },
    { id: 'medical', label: parentPhrase('Salomatlik'), icon: Activity, color: 'navy' },
    { id: 'pickup', label: parentPhrase('Vakillar'), icon: UserCheck, color: 'navy' },
    { id: 'documents', label: parentPhrase('Hujjatlar'), icon: FileText, color: 'navy' },
    { id: 'loginHistory', label: parentPhrase('Kirish tarixi'), icon: History, color: 'navy' },
    { id: 'security', label: parentPhrase('Xavfsizlik'), icon: ShieldCheck, color: 'navy' },
  ];

  const handleProfileUpdate = (nextParentData?: any) => {
    if (nextParentData && typeof nextParentData === 'object') {
      setParentData(nextParentData);
    }
    if (user?.childId) {
      return fetchPortalData(user.childId);
    }
    return Promise.resolve();
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    const nextPath = getParentTabPath(tab);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
  };

  const childPhotoUrl = getAssetUrl(parentData?.photo_url);
  const showChildPhoto = Boolean(childPhotoUrl && !childPhotoFailed);
  const currentTariff = 'Premium tarif';
  const currentParentLanguage = parentPortalLanguages.find((item) => item.code === language) || parentPortalLanguages[0];
  const renderTabContent = () => {
    const data = fullPortalData;

    switch (activeTab) {
      case 'profile': return <ProfileSection parentData={parentData} onUpdate={handleProfileUpdate} />;
      case 'parentProfile': return <ParentProfileSection parentData={parentData} onUpdate={handleProfileUpdate} />;
      case 'finance': return <FinanceSection data={data} />;
      case 'language': return <ParentPortalLanguagePanel />;
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
        return <ParentProfileSection parentData={parentData} onUpdate={handleProfileUpdate} />;
      case 'news': return <ParentNewsSection seenStorageKey={parentNewsSeenKey} onCountChange={setParentNewsCount} />;
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
      <ParentPortalAutoTranslator />
      {/* Parent portal header */}
      <div className="kg-parent-header relative flex-none overflow-hidden rounded-[20px] border border-slate-200 bg-white px-3 py-3 shadow-sm sm:rounded-[24px] sm:px-4">
        <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-gradient-to-b from-slate-950 via-blue-950 to-slate-800"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100/70 via-white to-blue-50/45"></div>
        <div className="absolute -right-12 -top-16 hidden h-40 w-40 rounded-[42px] border border-slate-200 bg-blue-50/60 rotate-12 xl:block"></div>
        <div className="relative z-10 grid grid-cols-1 items-center gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative ml-1 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] border border-slate-200 bg-gradient-to-br from-slate-100 to-white shadow-sm sm:h-[58px] sm:w-[58px] sm:rounded-[18px]">
                {showChildPhoto ? (
                  <img
                    src={childPhotoUrl}
                    alt="Bola rasmi"
                    className="h-full w-full object-cover"
                    onError={() => setChildPhotoFailed(true)}
                  />
                ) : (
                  <User size={25} className="text-slate-500" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg border-2 border-white bg-emerald-500 shadow-sm shadow-emerald-500/20">
                <CheckCircle2 size={10} className="text-white" />
              </div>
            </div>

            <div className="min-w-0 text-left">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">Portal bo'limi</p>
              <h2 className="text-[25px] font-extrabold leading-[1.08] text-brand-depth sm:text-[31px]">Ota-ona profili</h2>
              <div className="mt-1.5 flex min-w-0 flex-wrap justify-start gap-1.5 text-[12px] font-bold text-brand-muted sm:mt-2 sm:gap-2">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-950 shadow-sm sm:px-3">
                  <Users size={14} className="shrink-0 text-slate-950" />
                  <span className="truncate">{parentData?.childGroup || 'Guruh biriktirilmagan'}</span>
                </span>
                <span className="kg-parent-location inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 text-brand-muted shadow-sm sm:px-3">
                  <MapPin size={14} className="shrink-0 text-slate-950" />
                  <span className="truncate">{parentData?.kindergartenDistrict || parentData?.kindergartenAddress || "Manzil kiritilmagan"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="relative grid w-full min-w-0 grid-cols-[72px_minmax(0,1fr)_42px_96px] gap-1.5 overflow-hidden rounded-[20px] border border-slate-300 bg-white p-1.5 shadow-lg shadow-slate-950/10 sm:grid-cols-[86px_minmax(210px,1fr)_48px_104px] sm:rounded-[22px] xl:w-[570px]">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white to-blue-50"></div>
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/70 to-transparent"></div>
              <button
                type="button"
                onClick={() => handleTabChange('language')}
                title={parentT('language.title')}
                className="relative my-auto flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-[15px] border border-slate-200 bg-white/85 px-2 text-[10px] font-black uppercase text-slate-950 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-blue-950 sm:h-11 sm:rounded-[16px]"
              >
                <Languages size={15} />
                <span data-kg-no-translate="true">{currentParentLanguage.short}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('tariffs')}
                className="group relative flex min-h-[56px] min-w-0 items-center gap-3 rounded-[16px] px-2.5 py-2 text-left transition-all hover:bg-white/75 sm:min-h-[62px] sm:rounded-[18px] sm:px-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-slate-700 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-800 text-white shadow-lg shadow-slate-950/20 sm:h-11 sm:w-11 sm:rounded-[17px]">
                  <Crown size={19} />
                </span>
                <span className="min-w-0">
                  <span className="kg-parent-tariff-label block text-[9px] font-black uppercase tracking-[0.18em] text-slate-950">Tarif</span>
                  <span className="kg-parent-tariff-value mt-0.5 block truncate text-[17px] font-extrabold leading-tight text-brand-depth sm:text-[18px]">{currentTariff}</span>
                  <span className="mt-1 inline-flex w-fit items-center rounded-full border border-slate-300 bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-950 shadow-sm">Faol paket</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('tariffs')}
                title="Tarifni yangilash"
                className="relative my-auto flex h-10 items-center justify-center rounded-[15px] border border-slate-200 bg-white/75 text-slate-950 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-blue-950 sm:h-11 sm:rounded-[16px]"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={handleParentLogout}
                title="Tizimdan chiqish"
                className="relative my-auto flex h-10 items-center justify-center gap-1.5 rounded-[15px] bg-gradient-to-r from-slate-950 to-blue-950 px-2 text-[11px] font-extrabold uppercase text-white shadow-lg shadow-slate-950/20 transition-all hover:from-blue-950 hover:to-slate-800 hover:shadow-md hover:shadow-slate-950/25 sm:h-11 sm:rounded-[16px] sm:px-3"
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
                    ? 'bg-gradient-to-r from-slate-950 to-blue-950 text-white shadow-lg shadow-slate-950/20' 
                    : 'border border-brand-border bg-white text-brand-muted hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <item.icon size={14} />
                <span data-kg-no-translate={item.id === 'language' ? 'true' : undefined}>{item.label}</span>
                {item.id === 'messages' && messagesUnreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {messagesUnreadCount}
                  </span>
                )}
                {item.id === 'news' && parentNewsCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {parentNewsCount}
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
                    ? 'bg-gradient-to-r from-slate-100 to-blue-50 text-brand-depth shadow-sm ring-1 ring-slate-200' 
                    : 'text-brand-muted hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  activeTab === item.id ? 'bg-gradient-to-br from-slate-950 to-blue-950 text-white shadow-sm shadow-slate-950/20' : 'bg-slate-50 text-brand-muted group-hover:bg-slate-200 group-hover:text-slate-950'
                }`}>
                  <item.icon size={16} />
                </span>
                <span className="truncate uppercase tracking-[0.12em]" data-kg-no-translate={item.id === 'language' ? 'true' : undefined}>{item.label}</span>
                {item.id === 'messages' && messagesUnreadCount > 0 ? (
                  <span className="ml-auto rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-black leading-none text-white shadow-sm shadow-slate-950/30">
                    {messagesUnreadCount}
                  </span>
                ) : item.id === 'news' && parentNewsCount > 0 ? (
                  <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black leading-none text-white shadow-sm shadow-blue-600/30">
                    {parentNewsCount}
                  </span>
                ) : (
                  activeTab === item.id && <span className="ml-auto h-2 w-2 rounded-full bg-slate-950 shadow-sm shadow-slate-950/40"></span>
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

      {showLoginAdvertisement ? (
        <ParentAdsSection
          onClose={dismissLoginAdvertisement}
          onEmpty={dismissLoginAdvertisement}
          rotationKey={parentAdvertisementRotationKey}
        />
      ) : null}
    </div>
  );
};

const ParentView = () => (
  <ParentPortalLanguageProvider>
    <ParentViewContent />
  </ParentPortalLanguageProvider>
);

export default ParentView;

