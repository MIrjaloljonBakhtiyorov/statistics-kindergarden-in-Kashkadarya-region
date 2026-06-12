import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FlaskConical,
  HeartPulse,
  Loader2,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  School,
  UploadCloud,
  Users,
  Utensils,
} from 'lucide-react';
import { apiClient, kindergartenApi } from '@/shared/api';

const DISTRICTS = [
  'Qarshi shahri',
  'Qarshi tumani',
  'Shahrisabz shahri',
  'Shahrisabz tumani',
  'Kitob tumani',
  'Koson tumani',
  'Muborak tumani',
  "G'uzor tumani",
  'Nishon tumani',
  'Dehqonobod tumani',
  'Qamashi tumani',
  'Chiroqchi tumani',
  'Kasbi tumani',
  'Mirishkor tumani',
  "Yakkabog' tumani",
  "Ko'kdala tumani",
];

const CHECK_SECTIONS = [
  { key: 'children_health', title: 'Bolalar sogligi', icon: HeartPulse, hint: 'Tibbiy karta, kunlik filtr, tana harorati, kasallik belgilari' },
  { key: 'staff_health', title: 'Xodimlar sogligi', icon: Users, hint: 'Tibbiy korik, sanitariya daftari, ishga yaroqlilik xulosasi' },
  { key: 'kitchen_sanitation', title: 'Oshxona sanitariyasi', icon: Utensils, hint: 'Tozalik, idishlar, xom/ tayyor mahsulot ajratilishi' },
  { key: 'laboratory', title: 'Laboratoriya', icon: FlaskConical, hint: 'Organoleptik korsatkichlar, namunalar, xulosalar' },
  { key: 'warehouse', title: 'Omborxona', icon: Building2, hint: 'Saqlash sharoiti, yaroqlilik muddati, kirim-chiqim hujjatlari' },
  { key: 'documentation', title: 'Hujjatlar', icon: FileText, hint: 'Buyruqlar, dalolatnomalar, taomnoma, jurnal va reyestrlar' },
  { key: 'safety', title: 'Xavfsizlik', icon: ShieldCheck, hint: 'Yongin, elektr, kirish-chiqish va bolalar xavfsizligi' },
  { key: 'general_hygiene', title: 'Umumiy gigiyena', icon: ClipboardCheck, hint: 'Guruh xonalari, yotoqxona, hojatxona, hudud tozaligi' },
];

const CHECK_STATUS = [
  { value: 'passed', label: 'Talabga javob beradi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'attention', label: "E'tibor kerak", color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'failed', label: 'Kamchilik bor', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const OVERALL_STATUS = [
  { value: 'excellent', label: 'Yaxshi', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'needs_attention', label: 'Nazoratda', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'critical', label: 'Kritik', color: 'text-rose-600 bg-rose-50 border-rose-200' },
];

const emptyInspector = {
  fullName: '',
  organization: '',
  specialty: '',
  position: '',
  birthYear: '',
  passport: '',
  phone: '',
};

const initialChecks = () => CHECK_SECTIONS.map((section) => ({
  key: section.key,
  title: section.title,
  status: 'passed',
  note: '',
}));

type KindergartenRow = {
  id: string | number;
  name?: string;
  system_id?: string;
  systemId?: string;
  district?: string;
  region?: string;
  type?: string;
  directorName?: string;
  phone?: string;
  address?: string;
};

type InspectionEntry = {
  id: string;
  kindergartenId: string;
  kindergartenName: string;
  region: string;
  district: string;
  inspectionDate: string;
  actNumber?: string;
  actFileUrl?: string;
  actFileName?: string;
  actFileType?: string;
  inspector: typeof emptyInspector;
  checks: Array<{ key: string; title: string; status: string; note?: string }>;
  summary?: string;
  overallStatus: string;
  createdAt?: string;
};

type InspectionMonthSummary = {
  district: string;
  entries: number;
  kindergartenCount: number;
  criticalCount: number;
  attentionCount: number;
  excellentCount: number;
};

const statusInfo = (value: string) => OVERALL_STATUS.find((item) => item.value === value) || OVERALL_STATUS[1];
const inspectionWordHref = (id: string) => `${String(apiClient.defaults.baseURL || '').replace(/\/$/, '')}/kindergartens/inspections/${id}/word`;

export const KindergartenInspection = () => {
  const [kindergartens, setKindergartens] = useState<KindergartenRow[]>([]);
  const [inspections, setInspections] = useState<InspectionEntry[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<InspectionMonthSummary[]>([]);
  const [availableMonths, setAvailableMonths] = useState<Array<{ month: string; entries: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [district, setDistrict] = useState('');
  const [search, setSearch] = useState('');
  const [archiveMonth, setArchiveMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedKindergarten, setSelectedKindergarten] = useState<KindergartenRow | null>(null);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().slice(0, 10));
  const [actNumber, setActNumber] = useState('');
  const [actFile, setActFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [overallStatus, setOverallStatus] = useState('needs_attention');
  const [inspector, setInspector] = useState(emptyInspector);
  const [checks, setChecks] = useState(initialChecks);

  const loadKindergartens = async () => {
    try {
      const kindergartenRows = await kindergartenApi.getAll();
      setKindergartens(Array.isArray(kindergartenRows) ? kindergartenRows : []);
    } catch {
      toast.error("Bog'cha ro'yxatini yuklab bolmadi");
    }
  };

  const loadInspections = async (month = archiveMonth) => {
    try {
      const inspectionRes = await apiClient.get('/kindergartens/inspections', {
        params: { month },
      });
      setInspections(Array.isArray(inspectionRes.data?.entries) ? inspectionRes.data.entries : []);
      setMonthlySummary(Array.isArray(inspectionRes.data?.monthlySummary) ? inspectionRes.data.monthlySummary : []);
      setAvailableMonths(Array.isArray(inspectionRes.data?.availableMonths) ? inspectionRes.data.availableMonths : []);
    } catch {
      toast.error("Inspeksiya ma'lumotlarini yuklab bolmadi");
    }
  };

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      setLoading(true);
      try {
        await loadKindergartens();
        if (!active) return;
        await loadInspections(archiveMonth);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    loadInspections(archiveMonth);
  }, [archiveMonth]);

  const filteredKindergartens = useMemo(() => {
    const term = search.trim().toLowerCase();
    return kindergartens
      .filter((item) => !district || item.district === district)
      .filter((item) => {
        if (!term) return true;
        return [item.name, item.system_id, item.systemId, item.directorName, item.address, item.phone]
          .join(' ')
          .toLowerCase()
          .includes(term);
      })
      .slice(0, 30);
  }, [district, kindergartens, search]);

  const selectedStats = useMemo(() => {
    const failed = checks.filter((item) => item.status === 'failed').length;
    const attention = checks.filter((item) => item.status === 'attention').length;
    const passed = checks.filter((item) => item.status === 'passed').length;
    return { failed, attention, passed };
  }, [checks]);

  const updateInspector = (field: keyof typeof emptyInspector, value: string) => {
    setInspector((current) => ({ ...current, [field]: value }));
  };

  const updateCheck = (key: string, patch: Partial<{ status: string; note: string }>) => {
    setChecks((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item));
  };

  const uploadAct = async () => {
    if (!actFile) return { url: '', name: '', type: '' };
    const formData = new FormData();
    formData.append('image', actFile);
    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      url: String(res.data?.url || ''),
      name: actFile.name,
      type: actFile.type || 'application/octet-stream',
    };
  };

  const submitInspection = async () => {
    if (!selectedKindergarten) {
      toast.error('Avval bogchani tanlang');
      return;
    }
    if (!inspector.fullName.trim()) {
      toast.error('Inspektor F.I.Sh kiritilishi shart');
      return;
    }
    if (!inspector.organization.trim() || !inspector.specialty.trim() || !inspector.position.trim() || !inspector.birthYear.trim() || !inspector.passport.trim() || !inspector.phone.trim()) {
      toast.error("Tekshiruvchi haqidagi barcha ma'lumotlarni to'liq kiriting");
      return;
    }
    if (!actFile) {
      toast.error('Dalolatnoma faylini yuklang');
      return;
    }

    setSaving(true);
    try {
      const uploaded = await uploadAct();
      const payload = {
        kindergartenId: selectedKindergarten.id,
        kindergartenName: selectedKindergarten.name,
        region: 'Qashqadaryo',
        district: selectedKindergarten.district,
        inspectionDate,
        actNumber,
        actFileUrl: uploaded.url,
        actFileName: uploaded.name,
        actFileType: uploaded.type,
        inspector,
        checks,
        summary,
        overallStatus,
      };
      await apiClient.post('/kindergartens/inspections', payload);
      setActNumber('');
      setActFile(null);
      setSummary('');
      setOverallStatus('needs_attention');
      setChecks(initialChecks());
      await loadInspections(archiveMonth);
      toast.success('Bogcha inspeksiyasi saqlandi');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Inspeksiyani saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="rounded-[2rem] bg-slate-950 text-white p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-4">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Admin nazorati
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">Bogcha inspeksiyasi</h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base font-medium text-slate-300 leading-relaxed">
              Qashqadaryo viloyatidagi MTTlar bo'yicha sanitariya, sogliq, oshxona, laboratoriya va hujjatlar nazoratini dalolatnoma bilan arxivlang.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[300px]">
            {[
              { label: 'Jami', value: inspections.length },
              { label: 'Kamchilik', value: selectedStats.failed },
              { label: 'Eslatma', value: selectedStats.attention },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                <p className="mt-1 text-2xl font-black">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.35fr] gap-6">
        <section className="space-y-4">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Hudud va bogcha tanlash</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Viloyat: Qashqadaryo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tuman / shahar</span>
                <select
                  value={district}
                  onChange={(event) => {
                    setDistrict(event.target.value);
                    setSelectedKindergarten(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">Barcha tumanlar</option>
                  {DISTRICTS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search</span>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Bogcha nomi, ID, direktor..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </label>
            </div>

            <div className="mt-5 max-h-[430px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {filteredKindergartens.map((item) => {
                const active = String(selectedKindergarten?.id) === String(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedKindergarten(item)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${active ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">{item.name || 'Nomsiz MTT'}</p>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">{item.district || 'Tuman kiritilmagan'}</p>
                      </div>
                      <span className="shrink-0 rounded-xl bg-white px-2.5 py-1 text-[10px] font-black text-indigo-600 border border-indigo-100">
                        {item.system_id || item.systemId || `#${item.id}`}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredKindergartens.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm font-bold text-slate-400">
                  Bogcha topilmadi
                </div>
              )}
            </div>
          </div>

          {selectedKindergarten && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <School className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Tanlangan profil</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900 leading-tight">{selectedKindergarten.name}</h3>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                    <span>{selectedKindergarten.district || '-'}</span>
                    <span>{selectedKindergarten.type || 'Turi kiritilmagan'}</span>
                    <span>{selectedKindergarten.directorName || 'Direktor kiritilmagan'}</span>
                    <span>{selectedKindergarten.phone || 'Telefon kiritilmagan'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        <section className="space-y-4">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">Nazorat checklisti</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Har bir bolim alohida baholanadi</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {OVERALL_STATUS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setOverallStatus(item.value)}
                    className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${overallStatus === item.value ? item.color : 'border-slate-200 bg-white text-slate-400'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {CHECK_SECTIONS.map((section) => {
                const row = checks.find((item) => item.key === section.key)!;
                const Icon = section.icon;
                return (
                  <div key={section.key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{section.title}</h3>
                        <p className="mt-1 text-[11px] font-semibold text-slate-400 leading-snug">{section.hint}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {CHECK_STATUS.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => updateCheck(section.key, { status: status.value })}
                          className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition-all ${row.status === status.value ? status.color : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700'}`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={row.note}
                      onChange={(event) => updateCheck(section.key, { note: event.target.value })}
                      placeholder="Izoh, aniqlangan holat yoki topshiriq..."
                      className="min-h-[84px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4">Dalolatnoma</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sana</span>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(event) => setInspectionDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dalolatnoma raqami</span>
                  <input
                    value={actNumber}
                    onChange={(event) => setActNumber(event.target.value)}
                    placeholder="AKT-2026-001"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none"
                  />
                </label>
              </div>
              <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-5 py-6 text-center transition hover:bg-indigo-50">
                <UploadCloud className="h-9 w-9 text-indigo-500" />
                <span className="mt-3 text-sm font-black text-slate-900">
                  {actFile ? actFile.name : 'PDF, Word yoki rasm yuklang'}
                </span>
                <span className="mt-1 text-xs font-semibold text-slate-400">Dalolatnoma qogoz shaklidan skan/rasm ham qabul qilinadi</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={(event) => setActFile(event.target.files?.[0] || null)}
                />
              </label>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Umumiy xulosa..."
                className="mt-3 min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"
              />
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Tekshiruvchi ma'lumotlari</h2>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-rose-500">Barcha maydonlar majburiy</p>
                </div>
                <div className="rounded-2xl bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600">
                  To'liq
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['fullName', 'F.I.Sh', 'Ism familiya sharif'],
                  ['organization', 'Tashkilot vakilligi', 'Qaysi tashkilotdan'],
                  ['specialty', 'Mutaxassisligi', 'Sanitar vrach, epidemiolog...'],
                  ['position', 'Lavozimi', 'Bosh mutaxassis'],
                  ['birthYear', "Tugilgan yili", '1988'],
                  ['passport', "Pasport ma'lumotlari", 'AA1234567'],
                  ['phone', 'Telefon', '+998'],
                ].map(([field, label, placeholder]) => (
                  <label key={field} className={field === 'fullName' ? 'space-y-1.5 sm:col-span-2' : 'space-y-1.5'}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label} <b className="text-rose-500">*</b></span>
                    <input
                      value={inspector[field as keyof typeof emptyInspector]}
                      onChange={(event) => updateInspector(field as keyof typeof emptyInspector, event.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={submitInspection}
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                Inspeksiyani saqlash
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-slate-100 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">Inspeksiya arxivi</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tumanlar kesimida oylik dalolatnomalar</p>
          </div>
          <label className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arxiv oyi</span>
            <input
              type="month"
              value={archiveMonth}
              onChange={(event) => setArchiveMonth(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>
        </div>

        {availableMonths.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {availableMonths.map((item) => (
              <button
                key={item.month}
                type="button"
                onClick={() => setArchiveMonth(item.month)}
                className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-widest ${
                  archiveMonth === item.month
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {item.month} | {item.entries}
              </button>
            ))}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {monthlySummary.map((item) => (
            <div key={item.district} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm font-black text-slate-900">{item.district}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                <span>Jami: {item.entries}</span>
                <span>MTT: {item.kindergartenCount}</span>
                <span className="text-emerald-600">Yaxshi: {item.excellentCount}</span>
                <span className="text-amber-600">Nazorat: {item.attentionCount}</span>
                <span className="col-span-2 text-rose-600">Kritik: {item.criticalCount}</span>
              </div>
            </div>
          ))}
          {monthlySummary.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm font-bold text-slate-400">
              Tanlangan oy bo'yicha tumanlar kesimida arxiv topilmadi
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {inspections.map((item) => {
            const status = statusInfo(item.overallStatus);
            const failed = item.checks?.filter((check) => check.status === 'failed').length || 0;
            const attention = item.checks?.filter((check) => check.status === 'attention').length || 0;
            return (
              <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{item.kindergartenName}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <MapPin className="h-3 w-3" /> {item.district}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase ${status.color}`}>{status.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {item.inspectionDate}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {item.inspector?.phone || '-'}</span>
                  <span>Kamchilik: {failed}</span>
                  <span>Eslatma: {attention}</span>
                </div>
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tekshiruvchi</p>
                  <p className="mt-1 text-sm font-black text-slate-800">{item.inspector?.fullName || '-'}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{item.inspector?.organization || '-'}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={inspectionWordHref(item.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Word dalolatnoma
                  </a>
                </div>
              </div>
            );
          })}
          {inspections.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm font-bold text-slate-400">
              Tanlangan oy uchun inspeksiya yozuvlari yo'q
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
