import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, Award, CheckCircle, Scale,
  RefreshCw, Eye, EyeOff, Copy, Check, X, KeyRound, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Judge {
  id: string;
  lastName: string; firstName: string; middleName?: string; avatarUrl?: string;
  organization: string; position: string; specialization: string; experienceYears: number;
  phone?: string; email?: string;
  judgeCategory: string; directions: string[];
  assignedCompetition?: string; assignedStage?: string; assignedLocation?: string;
  assignedProjects: number; evalStartDate?: string; evalEndDate?: string;
  login: string; mustChangePassword: boolean; platformUrl?: string;
  agreedCriteria: boolean; agreedIndependent: boolean; agreedConfidential: boolean;
  agreedNoConflict: boolean; agreedNoShare: boolean;
  status: "active" | "inactive";
  createdAt: string;
}

const JUDGE_CATEGORIES = [
  "Investor", "Venchur fond vakili", "Tadbirkor", "IT mutaxassisi",
  "Sun'iy intellekt mutaxassisi", "Universitet professori yoki o'qituvchisi",
  "Innovatsiya eksperti", "Moliyaviy ekspert", "Sohaviy mutaxassis",
  "Xalqaro mentor", "Boshqa",
];

const ALL_DIRECTIONS = [
  "IT va Sun'iy intellekt", "Agrotexnologiyalar", "Ta'lim texnologiyalari",
  "Tibbiyot va ijtimoiy xizmatlar", "Fintex", "Davlat xizmatlari va raqamlashtirish",
  "Yashil texnologiyalar", "Turizm va xizmat ko'rsatish", "Sanoat va logistika",
  "Boshqa innovatsion loyihalar",
];

const statusConfig = {
  active: { label: "Faol", color: "bg-green-500/20 text-green-400" },
  inactive: { label: "Nofaol", color: "bg-gray-500/20 text-gray-400" },
};

const API = "/api/admin/judges";

function generatePassword(len = 10) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── Password field ──────────────────────────────────────────────────────────
function PasswordField({
  value, onChange, label, autoGen = false,
}: { value: string; onChange: (v: string) => void; label: string; autoGen?: boolean }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div>
      <label className="block text-sm text-[var(--admin-text-secondary)] mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full pr-10 pl-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Parol"
          />
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-white">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {autoGen && (
          <button type="button" onClick={() => onChange(generatePassword())}
            className="px-3 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface)] transition-colors text-xs text-white flex items-center gap-1">
            <RefreshCw size={13} /> Auto
          </button>
        )}
        {value && (
          <button type="button" onClick={copy}
            className="px-3 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface)] transition-colors text-xs text-white flex items-center gap-1">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────
type FormData = Omit<Judge, "id" | "createdAt" | "mustChangePassword"> & { password: string };

const emptyForm = (): FormData => ({
  lastName: "", firstName: "", middleName: "", avatarUrl: "",
  organization: "", position: "", specialization: "", experienceYears: 0,
  phone: "", email: "",
  judgeCategory: JUDGE_CATEGORIES[0], directions: [],
  assignedCompetition: "", assignedStage: "", assignedLocation: "",
  assignedProjects: 0, evalStartDate: "", evalEndDate: "",
  login: "", password: generatePassword(), platformUrl: "",
  agreedCriteria: false, agreedIndependent: false, agreedConfidential: false,
  agreedNoConflict: false, agreedNoShare: false,
  status: "active",
});

function JudgeModal({
  judge, onClose, onSaved,
}: { judge: Judge | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!judge;
  const [form, setForm] = useState<FormData>(() =>
    judge
      ? { ...judge, password: "", middleName: judge.middleName ?? "", avatarUrl: judge.avatarUrl ?? "", phone: judge.phone ?? "", email: judge.email ?? "", assignedCompetition: judge.assignedCompetition ?? "", assignedStage: judge.assignedStage ?? "", assignedLocation: judge.assignedLocation ?? "", evalStartDate: judge.evalStartDate ?? "", evalEndDate: judge.evalEndDate ?? "", platformUrl: judge.platformUrl ?? "" }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [section, setSection] = useState(0);
  const [generatedPw, setGeneratedPw] = useState("");

  const set = (k: keyof FormData) => (v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleDirection = (d: string) => {
    setForm(f => ({
      ...f,
      directions: f.directions.includes(d)
        ? f.directions.filter(x => x !== d)
        : [...f.directions, d],
    }));
  };

  const handleSubmit = async () => {
    if (!form.lastName || !form.firstName || !form.organization || !form.login) {
      setError("Familiya, ism, tashkilot va login majburiy"); return;
    }
    if (!isEdit && !form.password) {
      setError("Parol majburiy"); return;
    }
    setSaving(true); setError("");
    try {
      const body: any = { ...form };
      if (!body.password) delete body.password;
      const res = await fetch(isEdit ? `${API}/${judge!.id}` : API, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? "Xato"); return; }
      if (json.generatedPassword) setGeneratedPw(json.generatedPassword);
      else { onSaved(); onClose(); }
    } finally { setSaving(false); }
  };

  const sections = [
    "Shaxsiy ma'lumotlar", "Tashkilot va lavozim",
    "Mutaxassislik", "Baholash yo'nalishlari",
    "Tanlov va bosqich", "Login va parol", "Shartlar tasdig'i",
  ];

  if (generatedPw) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Hakam {isEdit ? "yangilandi" : "qo'shildi"}</h3>
          <p className="text-[var(--admin-text-secondary)] mb-6">Login va parolni hakamga yetkazing:</p>
          <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-[var(--admin-text-muted)]">Login:</span><span className="text-white font-mono">{form.login}</span></div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-[var(--admin-text-muted)]">Parol:</span>
              <span className="text-white font-mono bg-blue-500/10 px-2 py-0.5 rounded">{generatedPw}</span>
            </div>
            {form.platformUrl && <div className="flex justify-between text-sm"><span className="text-[var(--admin-text-muted)]">URL:</span><span className="text-blue-400 text-xs">{form.platformUrl}</span></div>}
          </div>
          <button onClick={() => { onSaved(); onClose(); }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium">
            Yopish
          </button>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm placeholder:text-[var(--admin-text-muted)]";
  const checkboxCls = "w-4 h-4 rounded border-[var(--admin-border)] accent-blue-500 cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Hakamni tahrirlash" : "Yangi hakam qo'shish"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg"><X size={18} /></button>
        </div>

        {/* Section tabs */}
        <div className="flex overflow-x-auto gap-1 px-6 py-3 border-b border-[var(--admin-border)] scrollbar-hide">
          {sections.map((s, idx) => (
            <button key={idx} onClick={() => setSection(idx)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${section === idx ? "bg-blue-600 text-white" : "text-[var(--admin-text-muted)] hover:text-white hover:bg-[var(--admin-surface-2)]"}`}>
              {idx + 1}. {s}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

          {/* Section 0: Shaxsiy */}
          {section === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Familiyasi *</label><input className={inputCls} value={form.lastName} onChange={e => set("lastName")(e.target.value)} placeholder="Yusupova" /></div>
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Ismi *</label><input className={inputCls} value={form.firstName} onChange={e => set("firstName")(e.target.value)} placeholder="Malika" /></div>
              </div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Otasining ismi</label><input className={inputCls} value={form.middleName} onChange={e => set("middleName")(e.target.value)} placeholder="Bahodirovna" /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Profil rasmi URL</label><input className={inputCls} value={form.avatarUrl} onChange={e => set("avatarUrl")(e.target.value)} placeholder="https://..." /></div>
            </div>
          )}

          {/* Section 1: Tashkilot */}
          {section === 1 && (
            <div className="space-y-4">
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Tashkiloti *</label><input className={inputCls} value={form.organization} onChange={e => set("organization")(e.target.value)} placeholder="Qarshi DU" /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Lavozimi *</label><input className={inputCls} value={form.position} onChange={e => set("position")(e.target.value)} placeholder="Professor" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Telefon raqami</label><input className={inputCls} value={form.phone} onChange={e => set("phone")(e.target.value)} placeholder="+998901234567" /></div>
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Elektron pochta</label><input className={inputCls} value={form.email} onChange={e => set("email")(e.target.value)} placeholder="judge@example.uz" /></div>
              </div>
            </div>
          )}

          {/* Section 2: Mutaxassislik */}
          {section === 2 && (
            <div className="space-y-4">
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Mutaxassisligi *</label><input className={inputCls} value={form.specialization} onChange={e => set("specialization")(e.target.value)} placeholder="IT va AI" /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Ish tajribasi (yil)</label><input type="number" min={0} max={60} className={inputCls} value={form.experienceYears} onChange={e => set("experienceYears")(Number(e.target.value))} /></div>
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Hakam toifasi *</label>
                <select className={inputCls} value={form.judgeCategory} onChange={e => set("judgeCategory")(e.target.value)}>
                  {JUDGE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Section 3: Yo'nalishlar */}
          {section === 3 && (
            <div>
              <label className="block text-sm text-[var(--admin-text-secondary)] mb-3">Baholashi mumkin bo'lgan loyiha yo'nalishlari</label>
              <div className="grid grid-cols-1 gap-2">
                {ALL_DIRECTIONS.map(d => (
                  <label key={d} className="flex items-center gap-3 p-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors">
                    <input type="checkbox" className={checkboxCls} checked={form.directions.includes(d)} onChange={() => toggleDirection(d)} />
                    <span className="text-sm text-white">{d}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Tanlov va bosqich */}
          {section === 4 && (
            <div className="space-y-4">
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Biriktiriladigan tanlov</label><input className={inputCls} value={form.assignedCompetition} onChange={e => set("assignedCompetition")(e.target.value)} placeholder="Startup Ligasi 2026" /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Biriktiriladigan bosqich</label><input className={inputCls} value={form.assignedStage} onChange={e => set("assignedStage")(e.target.value)} placeholder="Viloyat final bosqichi" /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Biriktiriladigan OTM / tuman / shahar / viloyat finali</label><input className={inputCls} value={form.assignedLocation} onChange={e => set("assignedLocation")(e.target.value)} placeholder="Qarshi DU, Shahrisabz tumani..." /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Biriktiriladigan loyihalar soni</label><input type="number" min={0} className={inputCls} value={form.assignedProjects} onChange={e => set("assignedProjects")(Number(e.target.value))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Baholash boshlanish sanasi</label><input type="date" className={inputCls} value={form.evalStartDate} onChange={e => set("evalStartDate")(e.target.value)} /></div>
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Baholash yakunlanish muddati</label><input type="date" className={inputCls} value={form.evalEndDate} onChange={e => set("evalEndDate")(e.target.value)} /></div>
              </div>
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Faol holati</label>
                <select className={inputCls} value={form.status} onChange={e => set("status")(e.target.value as any)}>
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 5: Login va parol */}
          {section === 5 && (
            <div className="space-y-4">
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Login *</label><input className={inputCls} value={form.login} onChange={e => set("login")(e.target.value)} placeholder="judge_malika_2026" /></div>
              <PasswordField value={form.password} onChange={set("password")} label={isEdit ? "Yangi parol (bo'sh qoldirsa o'zgarmaydi)" : "Vaqtinchalik parol *"} autoGen />
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Platformaga kirish havolasi</label><input className={inputCls} value={form.platformUrl} onChange={e => set("platformUrl")(e.target.value)} placeholder="https://tanlov.qashqadaryo.uz/hakam" /></div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                Parol birinchi kirishda o'zgartirilishi talab qilinadi (avtomatik sozlangan)
              </div>
            </div>
          )}

          {/* Section 6: Shartlar */}
          {section === 6 && (
            <div className="space-y-3">
              {[
                ["agreedCriteria", "Baholash mezonlari bilan tanishganligini tasdiqlayman"],
                ["agreedIndependent", "Xolis va mustaqil baholash majburiyatini qabul qilaman"],
                ["agreedConfidential", "Maxfiylik majburiyatini qabul qilaman"],
                ["agreedNoConflict", "Manfaatlar to'qnashuvi mavjud emas deb tasdiqlayman"],
                ["agreedNoShare", "Login va parolni boshqa shaxsga bermaslik majburiyatini qabul qilaman"],
              ].map(([k, label]) => (
                <label key={k} className="flex items-start gap-3 p-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors">
                  <input type="checkbox" className={`${checkboxCls} mt-0.5`} checked={(form as any)[k]} onChange={e => set(k as keyof FormData)(e.target.checked)} />
                  <span className="text-sm text-white">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--admin-border)]">
          <div className="flex gap-2">
            <button onClick={() => setSection(s => Math.max(0, s - 1))} disabled={section === 0}
              className="px-4 py-2 text-sm bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-bg)] transition-colors disabled:opacity-40">
              ← Oldingi
            </button>
            <button onClick={() => setSection(s => Math.min(sections.length - 1, s + 1))} disabled={section === sections.length - 1}
              className="px-4 py-2 text-sm bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-bg)] transition-colors disabled:opacity-40">
              Keyingi →
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-bg)] transition-colors">Bekor</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-60 flex items-center gap-2">
              {saving && <RefreshCw size={14} className="animate-spin" />}
              {isEdit ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ judge, onClose, onSaved }: { judge: Judge; onClose: () => void; onSaved: () => void }) {
  const [pw, setPw] = useState(generatePassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (!pw || pw.length < 6) { setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/${judge.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? "Xato"); return; }
      setDone(true);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6 max-w-md w-full">
        {done ? (
          <div className="text-center">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Parol o'zgartirildi</h3>
            <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl p-4 mb-4 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[var(--admin-text-muted)]">Login:</span><span className="text-white font-mono">{judge.login}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--admin-text-muted)]">Yangi parol:</span><span className="text-white font-mono bg-blue-500/10 px-2 py-0.5 rounded">{pw}</span></div>
            </div>
            <button onClick={() => { onSaved(); onClose(); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium">Yopish</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><KeyRound size={18} className="text-amber-400" /> Parol o'zgartirish</h3>
              <button onClick={onClose}><X size={18} /></button>
            </div>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-4">{judge.lastName} {judge.firstName} — <span className="font-mono text-white">{judge.login}</span></p>
            {error && <div className="p-2 bg-red-500/10 text-red-400 text-sm rounded-lg mb-3">{error}</div>}
            <PasswordField value={pw} onChange={setPw} label="Yangi parol" autoGen />
            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="flex-1 py-2 text-sm bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg">Bekor</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 text-sm bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <RefreshCw size={14} className="animate-spin" />} Saqlash
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [filtered, setFiltered] = useState<Judge[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | "add" | { type: "edit"; judge: Judge } | { type: "pw"; judge: Judge }>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const json = await res.json();
      setJudges(json.data ?? []);
    } catch { /* network error */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = judges;
    if (search) list = list.filter(j => `${j.lastName} ${j.firstName} ${j.specialization}`.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "all") list = list.filter(j => j.status === statusFilter);
    setFiltered(list);
  }, [judges, search, statusFilter]);

  const deleteJudge = async (id: string) => {
    if (!confirm("Hakamni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    load();
  };

  const stats = [
    { label: "Jami hakamlar", value: judges.length, icon: Award, color: "text-blue-400" },
    { label: "Faol", value: judges.filter(j => j.status === "active").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Nofaol", value: judges.filter(j => j.status === "inactive").length, icon: Scale, color: "text-gray-400" },
    { label: "Yo'nalishlar", value: [...new Set(judges.flatMap(j => j.directions))].length, icon: Award, color: "text-purple-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Hakamlar"
        subtitle="Tanlov hakamlarini boshqarish"
        actions={
          <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors">
            <Plus size={16} /> Hakam qo'shish
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
            <s.icon className={s.color} size={22} />
            <div className="text-3xl font-bold text-white mt-3 mb-1">{s.value}</div>
            <div className="text-xs text-[var(--admin-text-muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={16} />
          <input className="w-full pl-9 pr-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500" placeholder="Ism yoki mutaxassislik..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[var(--admin-text-muted)]"><RefreshCw size={32} className="animate-spin mx-auto mb-3" /><p>Yuklanmoqda...</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
                <tr>
                  {["F.I.Sh.", "Tashkilot", "Mutaxassislik / Toifa", "Tajriba", "Holat", "Amallar"].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(j => (
                  <tr key={j.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-medium text-white">{j.lastName} {j.firstName}</div>
                      <div className="text-xs text-[var(--admin-text-muted)] mt-0.5 font-mono">{j.login}</div>
                    </td>
                    <td className="py-3 px-5 text-sm text-[var(--admin-text-secondary)]">
                      <div>{j.organization}</div>
                      <div className="text-xs text-[var(--admin-text-muted)]">{j.position}</div>
                    </td>
                    <td className="py-3 px-5 text-sm text-[var(--admin-text-secondary)]">
                      <div>{j.specialization}</div>
                      <div className="text-xs text-blue-400">{j.judgeCategory}</div>
                    </td>
                    <td className="py-3 px-5 text-sm text-[var(--admin-text-secondary)]">{j.experienceYears} yil</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[j.status].color}`}>{statusConfig[j.status].label}</span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: "edit", judge: j })} title="Tahrirlash" className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors text-[var(--admin-text-muted)] hover:text-white"><Edit2 size={15} /></button>
                        <button onClick={() => setModal({ type: "pw", judge: j })} title="Parol o'zgartirish" className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors text-[var(--admin-text-muted)] hover:text-amber-400"><KeyRound size={15} /></button>
                        <button onClick={() => deleteJudge(j.id)} title="O'chirish" className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--admin-text-muted)] hover:text-red-400"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[var(--admin-text-muted)]">
                <Scale size={40} className="mx-auto mb-3 opacity-40" />
                <p>Hakamlar topilmadi</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "add" && <JudgeModal judge={null} onClose={() => setModal(null)} onSaved={load} />}
      {modal !== null && typeof modal === "object" && modal.type === "edit" && <JudgeModal judge={modal.judge} onClose={() => setModal(null)} onSaved={load} />}
      {modal !== null && typeof modal === "object" && modal.type === "pw" && <ChangePasswordModal judge={modal.judge} onClose={() => setModal(null)} onSaved={load} />}
    </AdminShell>
  );
}
