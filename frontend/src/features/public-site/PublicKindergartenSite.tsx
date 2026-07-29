import { type ElementType, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, ImageOff, Images, Loader2, Mail, MapPin, Maximize2, Minus, Newspaper, Phone, Plus, Send, Sparkles, UsersRound, X } from 'lucide-react';
import { apiClient } from '@/shared/api';
import { LocationPicker } from '@/shared/components/LocationPicker';
import { type WebsiteRepresentative } from '@/shared/components/WebsiteRepresentativesEditor';
import { type WebsiteSectionItem } from '@/shared/components/WebsiteSectionItemsEditor';
import { displayAssetUrl } from '@/shared/lib/assets';

type PublicSite = {
  kindergartenName: string;
  district?: string;
  slug: string;
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  address: string;
  phone: string;
  telegram: string;
  email: string;
  coverImageUrl: string;
  locationLat: number | string | null;
  locationLng: number | string | null;
  newsTitle: string;
  newsSubtitle: string;
  groupsTitle: string;
  groupsDescription: string;
  groups: WebsiteSectionItem[];
  clubsTitle: string;
  clubsDescription: string;
  clubs: WebsiteSectionItem[];
  representatives: WebsiteRepresentative[];
  loginButtonLabel: string;
  loginButtonUrl: string;
  showLoginButton: boolean | number;
  gallery: string[];
};

type PublicNews = {
  id: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  publishedAt: string;
};

const PublicKindergartenSite = () => {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const previewKindergartenId = searchParams.get('kindergartenId') || '';
  const [site, setSite] = useState<PublicSite | null>(null);
  const [news, setNews] = useState<PublicNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [selectedNews, setSelectedNews] = useState<PublicNews | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSite = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/public/sites/${slug}`);
        if (!mounted) return;
        setSite(res.data?.site || null);
        setNews(Array.isArray(res.data?.news) ? res.data.news : []);
      } catch {
        if (!previewKindergartenId) {
          if (mounted) setError('Web sayt topilmadi yoki hali internetga chiqarilmagan');
          return;
        }

        try {
          const [siteRes, newsRes] = await Promise.all([
            apiClient.get(`/kindergartens/websites/${previewKindergartenId}`),
            apiClient.get(`/kindergartens/websites/${previewKindergartenId}/news`),
          ]);
          if (!mounted) return;
          setSite(siteRes.data || null);
          setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
        } catch {
          if (mounted) setError('Web sayt topilmadi yoki hali internetga chiqarilmagan');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSite();
    return () => {
      mounted = false;
    };
  }, [slug, previewKindergartenId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600" size={38} />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-950">Sayt ochilmadi</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{error}</p>
          <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
            <ArrowLeft size={15} /> Orqaga
          </Link>
        </div>
      </div>
    );
  }

  const loginUrl = site.loginButtonUrl || '/login';
  const title = site.heroTitle || site.kindergartenName;
  const subtitle = site.heroSubtitle || "Farzandingiz uchun mehrli, xavfsiz va zamonaviy ta'lim muhiti.";
  const brandName = formatKindergartenBrandName(site.kindergartenName, site.district);
  const featuredNews = news.slice(0, 3);
  const newsGridClass = featuredNews.length === 1
    ? 'mt-8'
    : featuredNews.length === 2
      ? 'mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2'
      : 'mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3';
  const galleryImages = (site.gallery || []).filter(Boolean).slice(0, 8);
  const shouldScrollGallery = galleryImages.length > 4;
  const galleryRenderItems = shouldScrollGallery ? [...galleryImages, ...galleryImages] : galleryImages;
  const representatives = (site.representatives || []).filter((item) =>
    item.fullName || item.role || item.phone || item.imageUrl || item.description
  );
  const shouldScrollRepresentatives = representatives.length >= 5;
  const representativeRenderItems = shouldScrollRepresentatives ? [...representatives, ...representatives] : representatives;
  const heroStats = [
    { icon: MapPin, label: 'Hudud', value: site.district || 'Qashqadaryo', helper: 'Joylashuv' },
    { icon: UsersRound, label: 'Guruhlar', value: `${(site.groups || []).length} ta`, helper: 'Faol guruhlar' },
    { icon: Sparkles, label: 'Vakillar', value: `${representatives.length} ta`, helper: "Jamoa a'zolari" },
  ];
  const heroStatTones = [
    {
      card: 'border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#ecfdf5_100%)]',
      icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
      dot: 'bg-emerald-500',
      glow: 'from-emerald-300/28',
    },
    {
      card: 'border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_100%)]',
      icon: 'bg-sky-50 text-sky-600 ring-sky-100',
      dot: 'bg-sky-500',
      glow: 'from-sky-300/28',
    },
    {
      card: 'border-teal-100 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdfa_100%)]',
      icon: 'bg-teal-50 text-teal-600 ring-teal-100',
      dot: 'bg-teal-500',
      glow: 'from-teal-300/28',
    },
  ];
  const aboutText = String(site.about || "Bog'cha haqida ma'lumot kiritilmagan.")
    .replace(/\s+/g, ' ')
    .trim();
  const publicDomain = site.slug ? `${site.slug}.raqamli-mtt.uz` : '';
  const locationLat = Number(site.locationLat);
  const locationLng = Number(site.locationLng);
  const hasLocation = Number.isFinite(locationLat) && Number.isFinite(locationLng);
  const mapsUrl = hasLocation ? `https://www.google.com/maps?q=${locationLat},${locationLng}` : '';
  const googleEmbedUrl = hasLocation ? googleMapEmbedUrl(locationLat, locationLng, mapZoom) : '';
  const phoneHref = site.phone ? `tel:${String(site.phone).replace(/[^\d+]/g, '')}` : '';
  const emailHref = site.email ? `mailto:${site.email}` : '';
  const telegramHref = telegramUrl(site.telegram);
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5faf9] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-white/92 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex w-[92vw] max-w-[1680px] flex-col gap-2 py-2 sm:w-[90vw] lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:py-3">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white shadow-sm sm:h-11 sm:w-11">
                {(brandName || 'M')[0]}
              </div>
              <div className="min-w-0 lg:max-w-[320px] xl:min-w-[260px]">
                <p className="truncate text-[8px] font-black uppercase tracking-widest text-emerald-600 sm:text-[9px]">Bog'cha nomi</p>
                <h1 className="truncate text-sm font-black leading-tight text-slate-950 sm:text-xl">{brandName}</h1>
              </div>
            </div>
            {Boolean(site.showLoginButton) && (
              <a href={loginUrl} className="group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_14px_34px_rgba(5,150,105,0.20)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_18px_44px_rgba(5,150,105,0.26)] sm:h-11 sm:gap-2 sm:px-4 sm:text-[10px] lg:hidden">
                <span className="hidden min-[390px]:inline">{site.loginButtonLabel || 'Tizimga kirish'}</span>
                <span className="min-[390px]:hidden">Kirish</span>
                <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={14} />
              </a>
            )}
          </div>
          <nav className="kg-nav-scroll -mx-1 flex min-w-0 flex-1 snap-x items-center gap-1 overflow-x-auto whitespace-nowrap px-1 py-1 text-slate-500 lg:mx-2 lg:justify-center">
            <NavLink href="#about">Bog'cha haqida</NavLink>
            <NavLink href="#representatives">Vakillar</NavLink>
            <NavLink href="#news">{site.newsTitle || 'Yangiliklar'}</NavLink>
            <NavLink href="#groups">{site.groupsTitle || 'Guruhlar'}</NavLink>
            <NavLink href="#clubs">{site.clubsTitle || "To'garaklar"}</NavLink>
            <NavLink href="#contacts">Kontaktlar</NavLink>
          </nav>
          {Boolean(site.showLoginButton) && (
            <a href={loginUrl} className="group hidden h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_14px_34px_rgba(5,150,105,0.20)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_18px_44px_rgba(5,150,105,0.26)] lg:inline-flex">
              {site.loginButtonLabel || 'Tizimga kirish'}
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={14} />
            </a>
          )}
        </div>
      </header>

      <main>
        <section id="about" className="relative overflow-hidden border-b border-emerald-100/80 bg-[linear-gradient(135deg,#f6fff8_0%,#dffcf3_30%,#e0f7ff_62%,#fffbe8_100%)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0.05)_28%,transparent_48%),linear-gradient(245deg,rgba(56,189,248,0.22)_0%,rgba(125,211,252,0.08)_34%,transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.62)_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.34] [background-image:linear-gradient(rgba(16,185,129,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-100/55 to-transparent" />
          <div className="relative mx-auto grid w-[92vw] max-w-[1680px] grid-cols-1 gap-7 py-8 sm:w-[90vw] sm:gap-8 sm:py-12 lg:min-h-[640px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:py-16">
            <figure className="relative overflow-hidden rounded-lg border border-white/75 bg-white shadow-[0_28px_90px_rgba(15,118,110,0.18)] ring-1 ring-emerald-100/80">
              <div className="aspect-[4/3] bg-slate-100 sm:aspect-[16/10] lg:aspect-[5/4]">
                {site.coverImageUrl ? (
                  <img
                    src={displayAssetUrl(site.coverImageUrl)}
                    alt={site.kindergartenName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-center">
                    <div>
                      <Images className="mx-auto text-emerald-500" size={42} />
                      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-700">Bog'cha rasmi</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
              {publicDomain && (
                <figcaption className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-lg border border-white/55 bg-white/92 px-3 py-2.5 shadow-lg backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:px-4 sm:py-3">
                  <span className="min-w-0 truncate text-[11px] font-black text-slate-800 sm:text-xs">{publicDomain}</span>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.8)]" />
                </figcaption>
              )}
            </figure>

            <div className="min-w-0 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700 shadow-sm backdrop-blur">
                <Sparkles size={14} /> Bog'cha haqida
              </div>
              <h2 className="mx-auto mt-5 max-w-4xl break-words text-3xl font-black leading-[1.06] tracking-normal text-slate-950 sm:mt-6 sm:text-5xl lg:mx-0 lg:text-[64px]">{title}</h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm font-black leading-7 text-slate-700 sm:text-base lg:mx-0">{subtitle}</p>
              <p className="mx-auto mt-5 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:mt-6 sm:leading-8 lg:mx-0">
                {aboutText}
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 min-[520px]:grid-cols-3">
                {heroStats.map((item, index) => {
                  const Icon = item.icon;
                  const tone = heroStatTones[index % heroStatTones.length];
                  return (
                    <div key={item.label} className={`group relative min-h-[86px] overflow-hidden rounded-lg border px-4 py-3 shadow-[0_16px_38px_rgba(15,118,110,0.10)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_58px_rgba(15,118,110,0.16)] ${tone.card}`}>
                      <div className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${tone.glow} to-transparent blur-xl`} />
                      <div className="relative flex min-w-0 items-center gap-3">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ${tone.icon}`}>
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot} shadow-[0_0_12px_rgba(16,185,129,0.65)]`} />
                            {item.label}
                          </span>
                          <span className="mt-1 block truncate text-base font-black leading-tight text-slate-950">{item.value}</span>
                          <span className="mt-1 block truncate text-[10px] font-bold text-slate-500">{item.helper}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <a href="#contacts" className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_18px_42px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_22px_52px_rgba(15,118,110,0.20)]">
                  <Phone size={14} /> Bog'lanish
                </a>
                {Boolean(site.showLoginButton) && (
                  <a href={loginUrl} className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white/92 px-5 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-[0_14px_34px_rgba(15,118,110,0.10)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-[0_20px_46px_rgba(15,118,110,0.16)]">
                    {site.loginButtonLabel || 'Tizimga kirish'} <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {representatives.length > 0 && (
          <section id="representatives" className="relative overflow-hidden border-y border-emerald-100/70 bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf8_52%,#ffffff_100%)] py-12 sm:py-16">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
            <div className="mx-auto w-[92vw] max-w-[1680px] sm:w-[90vw]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <SectionHeading
                  eyebrow="Jamoa"
                  title="Bog'cha vakillari"
                  description="Bog'cha rahbariyati, oshpazlar va guruh rahbarlari haqida ma'lumot."
                />
                <div className="w-fit rounded-lg border border-emerald-200 bg-white px-4 py-3 shadow-[0_16px_44px_rgba(16,185,129,0.12)] ring-1 ring-emerald-50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Jami</p>
                  <p className="mt-1 text-xl font-black text-slate-950">{representatives.length} ta</p>
                </div>
              </div>
              <div className={shouldScrollRepresentatives ? 'relative mt-7 overflow-hidden rounded-lg border border-emerald-100 bg-white/80 p-2 shadow-[0_28px_80px_rgba(15,118,110,0.10)] backdrop-blur sm:mt-9 sm:p-3' : 'mt-7 sm:mt-9'}>
                {shouldScrollRepresentatives && (
                  <>
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white via-white/80 to-transparent sm:w-16" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-16" />
                  </>
                )}
                <div className={shouldScrollRepresentatives ? 'kg-representatives-marquee flex w-max gap-5' : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'}>
                  {representativeRenderItems.map((person, index) => (
                    <RepresentativeCard
                      key={`${person.id || person.fullName || person.role || 'representative'}-${index}`}
                      person={person}
                      index={(index % representatives.length) + 1}
                      carousel={shouldScrollRepresentatives}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="news" className="relative overflow-hidden border-y border-emerald-100/70 bg-[linear-gradient(180deg,#ffffff_0%,#f6fffb_56%,#ffffff_100%)] py-12 sm:py-16">
          <div className="mx-auto w-[92vw] max-w-[1680px] sm:w-[90vw]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Yangiliklar" title={site.newsTitle || "Bog'chaning eng so'nggi yangiliklari"} description={site.newsSubtitle || "E'lonlar, tadbirlar va bog'cha hayotidagi muhim yangiliklar."} />
            </div>
            <div className={newsGridClass}>
              {featuredNews.length ? featuredNews.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  featured={featuredNews.length === 1}
                  onOpenDetails={() => setSelectedNews(item)}
                />
              )) : (
                <div className="rounded-lg border border-dashed border-emerald-200 bg-white p-8 text-center shadow-sm">
                  <Newspaper className="mx-auto mb-3 text-emerald-300" size={36} />
                  <p className="text-sm font-black text-slate-700">Hozircha yangiliklar mavjud emas</p>
                  <p className="mt-2 text-xs font-bold leading-6 text-slate-400">Yangi e'lonlar va tadbirlar shu yerda ko'rinadi.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#f5faf9] py-10 sm:py-12">
          <div className="mx-auto w-[92vw] max-w-[1680px] sm:w-[90vw]">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <InfoPanel
                id="groups"
                icon={UsersRound}
                eyebrow="Bolalar guruhlari"
                title={site.groupsTitle || 'Bolalar guruhlari'}
                text={site.groupsDescription || "Guruhlar haqida ma'lumot kiritilmagan."}
                items={site.groups || []}
                emptyText="Guruhlar ro'yxati hali kiritilmagan."
              />
              <InfoPanel
                id="clubs"
                icon={Sparkles}
                eyebrow="Qo'shimcha mashg'ulotlar"
                title={site.clubsTitle || "To'garaklar"}
                text={site.clubsDescription || "To'garaklar haqida ma'lumot kiritilmagan."}
                items={site.clubs || []}
                emptyText="To'garaklar ro'yxati hali kiritilmagan."
              />
            </div>
          </div>
        </section>

        {galleryImages.length > 0 && (
          <section className="overflow-hidden bg-white py-12 sm:py-16">
            <div className="mx-auto w-[92vw] max-w-[1680px] sm:w-[90vw]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <SectionHeading
                  eyebrow="Galereya"
                  title="Bog'cha hayotidan lavhalar"
                  description="Bog'cha muhitidan tanlangan suratlar avtomatik aylantirib ko'rsatiladi."
                />
                <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  <Images size={15} /> {galleryImages.length}/8 lavha
                </div>
              </div>
              <div className="relative mt-7 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:mt-8 sm:p-3">
                {shouldScrollGallery && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent" />
                )}
                <div className={shouldScrollGallery ? 'kg-gallery-marquee flex w-max gap-4' : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
                  {galleryRenderItems.map((image, index) => (
                    <GalleryImageCard
                      key={`${image}-${index}`}
                      image={image}
                      index={(index % galleryImages.length) + 1}
                      carousel={shouldScrollGallery}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="contacts" className="relative overflow-hidden border-t border-emerald-100 bg-[linear-gradient(180deg,#f7fffb_0%,#eefaf6_48%,#ffffff_100%)] py-12 text-slate-950 sm:py-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
          <div className="mx-auto w-[92vw] max-w-[1680px] sm:w-[90vw]">
            <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">Manzil va aloqa</p>
                <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">Bog'chaga tashrif buyurish</h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
                  Xaritadan joylashuvni ko'ring, aloqa ma'lumotlari orqali bog'cha bilan tez bog'laning.
                </p>
              </div>
              {publicDomain && (
                <div className="min-w-0 rounded-lg border border-emerald-100 bg-white px-4 py-3 shadow-[0_16px_44px_rgba(15,118,110,0.10)]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Public domen</p>
                  <p className="mt-1 break-words text-sm font-black text-slate-800">{publicDomain}</p>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-[0_28px_80px_rgba(15,118,110,0.12)]">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="relative min-h-[320px] bg-white p-2 sm:min-h-[390px]">
                  <LocationPicker
                    lat={site.locationLat}
                    lng={site.locationLng}
                    label="Xaritadagi joylashuv"
                    markerLabel="Bog'cha joyi"
                    readOnly
                    showCoordinates={false}
                    showControls={false}
                    hideHeader
                    className="h-full border-0 bg-transparent p-0 shadow-none"
                    mapClassName="h-[320px] min-h-[320px] sm:h-[390px]"
                  />
                  <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-lg border border-emerald-100 bg-white/94 px-3 py-2.5 shadow-lg backdrop-blur-md sm:left-5 sm:right-auto sm:top-5 sm:px-4 sm:py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Xaritadagi joy</p>
                    <p className="mt-1 max-w-full truncate text-xs font-black text-slate-800 sm:max-w-[280px] sm:text-sm">{site.address || 'Manzil kiritilmagan'}</p>
                  </div>
                </div>

                <aside className="border-t border-emerald-100 bg-[linear-gradient(135deg,#ffffff,#f5fffb)] p-5 lg:border-l lg:border-t-0">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                      <MapPin size={23} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asosiy manzil</p>
                      <h3 className="mt-2 text-xl font-black leading-snug text-slate-950">{site.address || 'Manzil kiritilmagan'}</h3>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                    <MiniMetric label="Tuman" value={site.district || 'Qashqadaryo'} />
                    <MiniMetric label="Holat" value={hasLocation ? 'Belgilangan' : 'Kiritilmagan'} />
                  </div>

                  <div className="mt-5 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Mo'ljal</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{site.district || 'Qashqadaryo'} hududida joylashgan MTT.</p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/18 transition-colors hover:bg-emerald-700">
                        Xaritada ochish <ArrowUpRight size={14} />
                      </a>
                    )}
                    {hasLocation && (
                      <button
                        type="button"
                        onClick={() => setIsMapOpen(true)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        Katta oynada ko'rish <Maximize2 size={14} />
                      </button>
                    )}
                  </div>
                </aside>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
              <Contact icon={MapPin} label="Manzil" value={site.address} href={mapsUrl} action="Xaritada ko'rish" tone="emerald" />
              <Contact icon={Phone} label="Telefon" value={site.phone} href={phoneHref} action="Telefon qilish" tone="sky" />
              <Contact icon={Send} label="Telegram" value={site.telegram} href={telegramHref} action="Telegramga o'tish" tone="cyan" />
              <Contact icon={Mail} label="Email" value={site.email} href={emailHref} action="Email yozish" tone="violet" />
            </div>
          </div>
        </section>
      </main>

      {isMapOpen && hasLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/78 p-2 backdrop-blur-sm sm:p-3">
          <section className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl sm:h-[92vh]">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Google Map</p>
                <h2 className="mt-1 truncate text-xl font-black text-slate-950">{site.kindergartenName}</h2>
                <p className="mt-1 truncate text-sm font-semibold text-slate-500">{site.address || `${locationLat}, ${locationLng}`}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMapZoom((value) => Math.max(3, value - 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-700 transition-colors hover:bg-slate-50"
                    aria-label="Xaritani kichiklashtirish"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex h-10 min-w-12 items-center justify-center border-x border-slate-200 px-3 text-xs font-black text-slate-500">
                    {mapZoom}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapZoom((value) => Math.min(20, value + 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-700 transition-colors hover:bg-slate-50"
                    aria-label="Xaritani kattalashtirish"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-[10px] font-black uppercase tracking-widest text-white sm:inline-flex"
                >
                  Google Maps <ArrowUpRight size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                  aria-label="Xaritani yopish"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-slate-100">
              <iframe
                title="Bog'cha Google xaritasi"
                src={googleEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      )}
      {selectedNews && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/20 p-2 backdrop-blur-[2px] sm:p-6"
          onClick={() => setSelectedNews(null)}
        >
          <article
            className="max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:max-h-[92vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Yangilik tafsilotlari</p>
                <h2 className="mt-2 text-xl font-black leading-tight text-slate-950 sm:text-3xl">{selectedNews.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                aria-label="Yangilik modalini yopish"
              >
                <X size={17} />
              </button>
            </div>
            <div className="max-h-[calc(94vh-96px)] overflow-y-auto custom-scrollbar sm:max-h-[calc(92vh-96px)]">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="relative flex min-h-[240px] items-center justify-center bg-slate-50 sm:min-h-[300px] xl:min-h-[520px]">
                  {displayAssetUrl(selectedNews.imageUrl) ? (
                    <img
                      src={displayAssetUrl(selectedNews.imageUrl)}
                      alt={selectedNews.title}
                      className="max-h-[58vh] w-full object-contain sm:max-h-[70vh] xl:max-h-[calc(92vh-96px)]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[240px] items-center justify-center bg-[linear-gradient(135deg,#ecfdf5,#ffffff_50%,#e0f2fe)] text-emerald-500 sm:min-h-[300px]">
                      <Newspaper size={46} />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/94 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-sm backdrop-blur">
                    <CalendarDays size={13} /> {selectedNews.publishedAt || 'Yangilik'}
                  </span>
                </div>
                <div className="min-w-0 p-5 sm:p-7">
                  {selectedNews.summary && (
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Qisqa izoh</p>
                      <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{selectedNews.summary}</p>
                    </div>
                  )}
                  <div className="mt-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">To'liq ma'lumot</p>
                    <p className="mt-3 whitespace-pre-wrap text-[15px] font-semibold leading-8 text-slate-600">
                      {selectedNews.body || selectedNews.summary || "Batafsil ma'lumot kiritilmagan."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      <style>{`
        @keyframes kg-gallery-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .kg-gallery-marquee {
          animation: kg-gallery-scroll 38s linear infinite;
        }
        .kg-gallery-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes kg-representatives-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .kg-representatives-marquee {
          animation: kg-representatives-scroll 34s linear infinite;
        }
        .kg-representatives-marquee:hover {
          animation-play-state: paused;
        }
        .kg-nav-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .kg-nav-scroll::-webkit-scrollbar {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .kg-gallery-marquee,
          .kg-representatives-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

const NavLink = ({ href, children }: { href: string; children: string }) => (
  <a href={href} className="inline-flex h-10 shrink-0 snap-start items-center rounded-lg border border-transparent px-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-white hover:text-emerald-700 hover:shadow-[0_10px_26px_rgba(15,118,110,0.10)] sm:px-3 sm:text-xs">
    <span>{children}</span>
  </a>
);

const SectionHeading = ({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) => (
  <div className="max-w-2xl min-w-0">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">{eyebrow}</p>
    <h2 className="mt-3 break-words text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{description}</p>}
  </div>
);

const NewsCard = ({
  item,
  featured = false,
  onOpenDetails,
}: {
  item: PublicNews;
  featured?: boolean;
  onOpenDetails: () => void;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = displayAssetUrl(item.imageUrl);
  const showPlaceholder = !imageSrc || imageFailed;
  const summary = String(item.summary || '').trim();
  const body = String(item.body || '').trim();
  const previewText = summary || body || "Batafsil ma'lumot kiritilmagan.";

  return (
    <article className={`group overflow-hidden rounded-lg border border-emerald-100/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.10)] ring-1 ring-slate-950/[0.025] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_28px_70px_rgba(15,118,110,0.14)] ${featured ? 'grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]' : 'h-full'}`}>
      <div className={`relative overflow-hidden bg-emerald-50 ${featured ? 'min-h-[240px] sm:min-h-[300px] xl:min-h-[360px]' : 'h-52'}`}>
        {showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#ecfdf5,#ffffff_50%,#e0f2fe)] text-emerald-500">
            <Newspaper size={featured ? 46 : 32} />
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/62 via-slate-950/14 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/94 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur">
          <CalendarDays size={13} /> {item.publishedAt || 'Yangilik'}
        </span>
      </div>
      <div className={`flex min-w-0 flex-col ${featured ? 'p-5 sm:p-8' : 'p-5'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Bog'cha yangiligi</p>
        <h3 className={`${featured ? 'mt-4 text-2xl sm:text-3xl' : 'mt-3 text-xl'} break-words font-black leading-tight text-slate-950`}>{item.title}</h3>
        <p className={`${featured ? 'mt-5 text-base leading-7' : 'mt-3 text-sm leading-6'} line-clamp-4 font-semibold text-slate-500`}>{previewText}</p>
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={onOpenDetails}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition-colors hover:border-emerald-200 hover:bg-emerald-100"
          >
            Ko'proq <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};

const GalleryImageCard = ({ image, index, carousel = false }: { image: string; index: number; carousel?: boolean }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = displayAssetUrl(image);
  const showPlaceholder = !imageSrc || imageFailed;

  return (
    <figure className={`group relative h-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:h-72 ${carousel ? 'w-[78vw] max-w-[320px] shrink-0 sm:w-[292px] lg:w-[296px]' : 'w-full'}`}>
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#ecfdf5,#f8fafc_52%,#e0f2fe)] text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
              <ImageOff size={27} />
            </div>
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Rasm topilmadi</p>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={`Bog'cha hayotidan lavha ${index}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/62 to-transparent" />
      <figcaption className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-lg border border-white/45 bg-white/92 px-3 py-2 shadow-sm backdrop-blur">
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-slate-700">Lavha {index}</span>
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
      </figcaption>
    </figure>
  );
};

const RepresentativeCard = ({ person, index, carousel = false }: { person: WebsiteRepresentative; index: number; carousel?: boolean }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = displayAssetUrl(person.imageUrl);
  const showPlaceholder = !imageSrc || imageFailed;
  const phoneHref = person.phone ? `tel:${String(person.phone).replace(/[^\d+]/g, '')}` : '';
  const role = person.role || 'Vakil';

  return (
    <article className={`group flex h-full min-h-[500px] flex-col overflow-hidden rounded-lg border border-emerald-100/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.10)] ring-1 ring-slate-950/[0.025] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_28px_70px_rgba(15,118,110,0.16)] sm:min-h-[548px] ${carousel ? 'w-[78vw] max-w-[300px] shrink-0 sm:w-[264px] lg:w-[276px]' : 'w-full'}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-emerald-50">
        {showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#ecfdf5,#ffffff_48%,#e0f2fe)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-white bg-white text-3xl font-black text-emerald-700 shadow-[0_18px_42px_rgba(15,118,110,0.16)]">
              {(person.fullName || person.role || 'V')[0]}
            </div>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={person.fullName || person.role}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        <div className="absolute left-3 top-3 rounded-lg border border-white/70 bg-white/94 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur">
          #{index}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-flex max-w-full items-center rounded-lg border border-emerald-200/70 bg-white/94 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-700 shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur">
            <span className="truncate">{role}</span>
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="break-words text-lg font-black leading-snug text-slate-950 sm:text-xl">{person.fullName || 'F.I.Sh kiritilmagan'}</h3>
        {person.description && (
          <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm font-semibold leading-6 text-slate-500">{person.description}</p>
        )}
        {person.phone && (
          <a href={phoneHref} className="mt-auto block rounded-lg border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#dffbea)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition-colors hover:border-emerald-300 hover:bg-emerald-100">
            <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                <Phone size={13} />
              </span>
              <span className="min-w-0 leading-4">Murojaat uchun telefon nomerlar</span>
            </span>
            <span className="mt-2 block break-words text-base font-black text-emerald-950">{person.phone}</span>
          </a>
        )}
      </div>
    </article>
  );
};

const InfoPanel = ({
  id,
  icon: Icon,
  eyebrow,
  title,
  text,
  items,
  emptyText,
}: {
  id: string;
  icon: ElementType;
  eyebrow: string;
  title: string;
  text: string;
  items: WebsiteSectionItem[];
  emptyText: string;
}) => {
  const emptyDescription = id === 'groups'
    ? "Guruh haqida ma'lumot kiritilmagan"
    : "Mashg'ulot haqida ma'lumot kiritilmagan";

  return (
    <section id={id} className="min-w-0 overflow-hidden rounded-lg border border-emerald-100/90 bg-white shadow-[0_22px_70px_rgba(15,118,110,0.10)] ring-1 ring-white">
      <div className="relative overflow-hidden border-b border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f4fffb_52%,#eefcff_100%)] p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/24 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-600 shadow-[0_10px_28px_rgba(15,118,110,0.10)]">
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600">{eyebrow}</p>
              <h2 className="mt-1 text-xl font-black leading-tight text-slate-950 sm:text-2xl">{title}</h2>
              <p className="mt-2 max-w-xl text-xs font-semibold leading-6 text-slate-600">{text}</p>
            </div>
          </div>
          <div className="inline-flex w-fit shrink-0 items-center gap-3 rounded-lg border border-emerald-200 bg-white/92 px-3 py-2 shadow-[0_14px_34px_rgba(16,185,129,0.13)] backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.78)]" />
            <span>
              <span className="block text-[8px] font-black uppercase tracking-widest text-emerald-600">Jami</span>
              <span className="mt-0.5 block text-xl font-black leading-none text-slate-950">{items.length} ta</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 bg-[linear-gradient(180deg,#ffffff,#f8fcfb)] p-3 sm:p-4">
        {items.length ? items.map((item, index) => (
          <article
            key={item.id || `${item.name}-${index}`}
            className="group relative overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_22px_54px_rgba(15,118,110,0.12)]"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 via-teal-400 to-sky-400" />
            <div className="min-w-0 p-3 pl-4 sm:p-4 sm:pl-5">
              <div className="flex flex-col gap-3 min-[460px]:flex-row min-[460px]:items-start min-[460px]:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-[9px] font-black text-emerald-700 shadow-sm">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-black leading-tight text-slate-950 sm:text-lg">{item.name || 'Nomi kiritilmagan'}</h3>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                      {item.description || emptyDescription}
                    </p>
                  </div>
                </div>
                <span className="inline-flex h-7 w-fit shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                  Faol
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <DetailPill label="Soni" value={item.count} tone="sky" />
                <DetailPill label="Ish kunlari" value={item.days} tone="slate" />
                <DetailPill label="Oylik to'lov" value={item.payment} tone="emerald" />
              </div>
            </div>
          </article>
        )) : (
          <div className="rounded-lg border border-dashed border-emerald-200 bg-white p-7 text-center shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-400 ring-1 ring-emerald-100">
              <Icon size={26} />
            </span>
            <p className="mt-4 text-sm font-black text-slate-600">{emptyText}</p>
          </div>
        )}
      </div>
    </section>
  );
};

const detailPillTones = {
  emerald: 'border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#e8fff3)] text-emerald-600',
  sky: 'border-sky-100 bg-[linear-gradient(135deg,#f0f9ff,#ffffff)] text-sky-600',
  slate: 'border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] text-slate-400',
};

type DetailPillTone = keyof typeof detailPillTones;

const DetailPill = ({ label, value, tone = 'slate' }: { label: string; value?: string; tone?: DetailPillTone }) => (
  <div className={`relative min-h-[56px] overflow-hidden rounded-lg border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] ${detailPillTones[tone]}`}>
    <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-current opacity-50" />
    <p className="text-[8px] font-black uppercase tracking-widest opacity-80">{label}</p>
    <p className="mt-1 break-words text-xs font-black leading-5 text-slate-950 sm:text-sm">{value || '-'}</p>
  </div>
);

const MiniMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
  </div>
);

const telegramUrl = (value?: string) => {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  return `https://t.me/${text.replace(/^@/, '')}`;
};

const googleMapEmbedUrl = (lat: number, lng: number, zoom: number) => {
  const query = encodeURIComponent(`${lat},${lng}`);
  return `https://maps.google.com/maps?q=${query}&z=${zoom}&output=embed`;
};

const formatKindergartenBrandName = (name?: string, district?: string) => {
  const original = String(name || '').trim();
  if (!original) return "Bog'cha";

  const districtPattern = String(district || '')
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let next = original
    .replace(/^kinderflow\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (districtPattern) {
    next = next.replace(new RegExp(districtPattern, 'i'), '').trim();
  }

  next = next
    .replace(/^[\s-:|]+|[\s-:|]+$/g, '')
    .replace(/\s+-\s+/g, '-')
    .replace(/^-+/, '')
    .trim();

  return next || original;
};

const contactTones = {
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    accent: 'from-emerald-400/55',
    action: 'text-emerald-700',
    dot: 'bg-emerald-500',
    panel: 'border-emerald-100 bg-emerald-50/70',
    cta: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  sky: {
    icon: 'bg-sky-50 text-sky-600 ring-sky-100',
    accent: 'from-sky-400/55',
    action: 'text-sky-700',
    dot: 'bg-sky-500',
    panel: 'border-sky-100 bg-sky-50/70',
    cta: 'bg-sky-600 text-white hover:bg-sky-700',
  },
  cyan: {
    icon: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
    accent: 'from-cyan-400/55',
    action: 'text-cyan-700',
    dot: 'bg-cyan-500',
    panel: 'border-cyan-100 bg-cyan-50/70',
    cta: 'bg-cyan-600 text-white hover:bg-cyan-700',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600 ring-violet-100',
    accent: 'from-violet-400/55',
    action: 'text-violet-700',
    dot: 'bg-violet-500',
    panel: 'border-violet-100 bg-violet-50/70',
    cta: 'bg-violet-600 text-white hover:bg-violet-700',
  },
};

type ContactTone = keyof typeof contactTones;

const Contact = ({
  icon: Icon,
  label,
  value,
  href,
  action,
  tone = 'emerald',
}: {
  icon: ElementType;
  label: string;
  value?: string;
  href?: string;
  action: string;
  tone?: ContactTone;
}) => {
  const theme = contactTones[tone];
  const content = (
    <>
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.accent} via-white to-transparent`} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ${theme.icon}`}>
            <Icon size={21} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className={`mt-1 truncate text-[10px] font-black uppercase tracking-widest ${href ? theme.action : 'text-slate-300'}`}>
              {href ? action : 'Kiritilmagan'}
            </p>
          </div>
        </div>
        {href && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors group-hover:border-emerald-200 group-hover:text-emerald-700">
            <ArrowUpRight size={15} />
          </span>
        )}
      </div>
      <div className={`mt-4 min-h-[76px] rounded-lg border p-3.5 sm:mt-5 sm:min-h-[86px] sm:p-4 ${theme.panel}`}>
        <p className="line-clamp-3 break-words text-[15px] font-black leading-7 text-slate-950">{value || 'Kiritilmagan'}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} shadow-[0_0_14px_rgba(16,185,129,0.55)]`} />
          Aloqa
        </span>
        <span className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${href ? theme.cta : 'bg-slate-100 text-slate-300'}`}>
          Ochish
        </span>
      </div>
    </>
  );

  const className = "group relative block min-h-[208px] overflow-hidden rounded-lg border border-emerald-100 bg-white p-4 shadow-[0_18px_48px_rgba(15,118,110,0.09)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_28px_68px_rgba(15,118,110,0.14)] sm:min-h-[226px] sm:p-5";

  return href ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
};

export default PublicKindergartenSite;
