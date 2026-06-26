import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, UserCog, CheckCircle, RefreshCw,
  Eye, EyeOff, Copy, Check, X, KeyRound,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Coordinator {
  id: string;
  lastName: string; firstName: string; middleName?: string; avatarUrl?: string;
  organization: string; position: string;
  phone?: string; email?: string;
  role: "otm" | "region" | "city" | "province" | "secretary" | "monitoring";
  location?: string; competition?: string;
  login: string; mustChangePassword: boolean;
  status: "active" | "temp_suspended" | "expired";
  validUntil?: string;
  createdAt: string;
}

const ROLE_CONFIG = {
  otm:        { label: "OTM koordinatori",       color: "text-blue-400" },
  region:     { label: "Tuman koordinatori",      color: "text-purple-400" },
  city:       { label: "Shahar koordinatori",     color: "text-cyan-400" },
  province:   { label: "Viloyat koordinatori",    color: "text-amber-400" },
  secretary:  { label: "Mas'ul kotib",            color: "text-red-400" },
  monitoring: { label: "Monitoring",              color: "text-green-400" },
};

const STATUS_CONFIG = {
  active:        { label: "Faol",                     color: "bg-green-500/20 text-green-400" },
  temp_suspended:{ label: "Vaqtinchalik to'xtatilgan",color: "bg-amber-500/20 text-amber-400" },
  expired:       { label: "Muddati o'tgan",            color: "bg-red-500/20 text-red-400" },
};

const API = "/api/admin/coordinators";

function generatePassword(len = 10) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── Password field ───────────────────────────────────────────────────────────
function PasswordField({ value, onChange, label, autoGen = false }:
  { value: string; onChange: (v: string) => void; label: string; autoGen?: boolean }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div>
      <label className="block text-sm text-[var(--admin-text-secondary)] mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
            className="w-full pr-10 pl-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Parol" />
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

// ─── Form Modal ───────────────────────────────────────────────────────────────
type FormData = Omit<Coordinator, "id" | "createdAt" | "mustChangePassword"> & { password: string };

const emptyForm = (): FormData => ({
  lastName: "", firstName: "", middleName: "", avatarUrl: "",
  organization: "", position: "", phone: "", email: "",
  role: "otm", location: "", competition: "",
  login: "", password: generatePassword(),
  status: "active", validUntil: "",
});

function CoordModal({ coord, onClose, onSaved }:
  { coord: Coordinator | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!coord;
  const [form, setForm] = useState<FormData>(() =>
    coord
      ? { ...coord, password: "", middleName: coord.middleName ?? "", avatarUrl: coord.avatarUrl ?? "", phone: coord.phone ?? "", email: coord.email ?? "", location: coord.location ?? "", competition: coord.competition ?? "", validUntil: coord.validUntil ?? "" }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generatedPw, setGeneratedPw] = useState("");

  const set = (k: keyof FormData) => (v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.lastName || !form.firstName || !form.organization || !form.login) {
      setError("Familiya, ism, tashkilot va login majburiy"); return;
    }
    if (!isEdit && !form.password) { setError("Parol majburiy"); return; }
    setSaving(true); setError("");
    try {
      const body: any = { ...form };
      if (!body.password) delete body.password;
      const res = await fetch(isEdit ? `${API}/${coord!.id}` : API, {
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

  const inputCls = "w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm placeholder:text-[var(--admin-text-muted)]";

  if (generatedPw) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Mas'ul {isEdit ? "yangilandi" : "qo'shildi"}</h3>
          <p className="text-[var(--admin-text-secondary)] mb-6">Login va parolni mas'ulga yetkazing:</p>
          <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-[var(--admin-text-muted)]">Login:</span><span className="text-white font-mono">{form.login}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[var(--admin-text-muted)]">Parol:</span><span className="text-white font-mono bg-blue-500/10 px-2 py-0.5 rounded">{generatedPw}</span></div>
          </div>
          <button onClick={() => { onSaved(); onClose(); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium">Yopish</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Mas'ulni tahrirlash" : "Yangi mas'ul qo'shish"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

          {/* Shaxsiy */}
          <p className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">Asosiy shaxsiy ma'lumotlar</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Familiyasi *</label><input className={inputCls} value={form.lastName} onChange={e => set("lastName")(e.target.value)} placeholder="Rahmonov" /></div>
            <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Ismi *</label><input className={inputCls} value={form.firstName} onChange={e => set("firstName")(e.target.value)} placeholder="Jasur" /></div>
          </div>
          <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Otasining ismi</label><input className={inputCls} value={form.middleName} onChange={e => set("middleName")(e.target.value)} placeholder="Aliyevich" /></div>
          <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Profil rasmi URL</label><input className={inputCls} value={form.avatarUrl} onChange={e => set("avatarUrl")(e.target.value)} placeholder="https://..." /></div>

          {/* Tashkilot */}
          <div className="pt-2 border-t border-[var(--admin-border)]">
            <p className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">Ish joyi va kasbiy ma'lumotlar</p>
            <div className="space-y-3">
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Tashkiloti *</label><input className={inputCls} value={form.organization} onChange={e => set("organization")(e.target.value)} placeholder="Qarshi DU" /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Lavozimi *</label><input className={inputCls} value={form.position} onChange={e => set("position")(e.target.value)} placeholder="Prorektor" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Telefon raqami</label><input className={inputCls} value={form.phone} onChange={e => set("phone")(e.target.value)} placeholder="+998901234567" /></div>
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Elektron pochta</label><input className={inputCls} value={form.email} onChange={e => set("email")(e.target.value)} placeholder="j.rahmonov@qdu.uz" /></div>
              </div>
            </div>
          </div>

          {/* Rol va joylashuv */}
          <div className="pt-2 border-t border-[var(--admin-border)]">
            <p className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">Rol va biriktirish</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Roli</label>
                <select className={inputCls} value={form.role} onChange={e => set("role")(e.target.value as any)}>
                  {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Joylashuvi (OTM / tuman / shahar)</label><input className={inputCls} value={form.location} onChange={e => set("location")(e.target.value)} placeholder="Qarshi DU" /></div>
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Biriktiriladigan tanlov</label><input className={inputCls} value={form.competition} onChange={e => set("competition")(e.target.value)} placeholder="Startup Ligasi 2026" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Holati</label>
                  <select className={inputCls} value={form.status} onChange={e => set("status")(e.target.value as any)}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Muddati (sana)</label><input type="date" className={inputCls} value={form.validUntil} onChange={e => set("validUntil")(e.target.value)} /></div>
              </div>
            </div>
          </div>

          {/* Login va parol */}
          <div className="pt-2 border-t border-[var(--admin-border)]">
            <p className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">Tizimga kirish ma'lumotlari</p>
            <div className="space-y-3">
              <div><label className="block text-sm text-[var(--admin-text-secondary)] mb-1">Login *</label><input className={inputCls} value={form.login} onChange={e => set("login")(e.target.value)} placeholder="coord_jasur_2026" /></div>
              <PasswordField value={form.password} onChange={set("password")} label={isEdit ? "Yangi parol (bo'sh qoldirsa o'zgarmaydi)" : "Vaqtinchalik parol *"} autoGen />
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                Parol birinchi kirishda o'zgartirilishi talab qilinadi (avtomatik sozlangan)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--admin-border)]">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-bg)] transition-colors">Bekor</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-60 flex items-center gap-2">
            {saving && <RefreshCw size={14} className="animate-spin" />}
            {isEdit ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ coord, onClose, onSaved }:
  { coord: Coordinator; onClose: () => void; onSaved: () => void }) {
  const [pw, setPw] = useState(generatePassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (!pw || pw.length < 6) { setError("Parol kamida 6 ta belgi"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/${coord.id}/password`, {
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
              <div className="flex justify-between text-sm"><span className="text-[var(--admin-text-muted)]">Login:</span><span className="text-white font-mono">{coord.login}</span></div>
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
            <p className="text-sm text-[var(--admin-text-secondary)] mb-4">{coord.lastName} {coord.firstName} — <span className="font-mono text-white">{coord.login}</span></p>
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
export function CoordinatorsPage() {
  const [coords, setCoords] = useState<Coordinator[]>([]);
  const [filtered, setFiltered] = useState<Coordinator[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | "add" | { type: "edit"; coord: Coordinator } | { type: "pw"; coord: Coordinator }>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const json = await res.json();
      setCoords(json.data ?? []);
    } catch { /* network error */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = coords;
    if (search) list = list.filter(c => `${c.lastName} ${c.firstName} ${c.organization}`.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== "all") list = list.filter(c => c.role === roleFilter);
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);
    setFiltered(list);
  }, [coords, search, roleFilter, statusFilter]);

  const deleteCoord = async (id: string) => {
    if (!confirm("Mas'ulni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    load();
  };

  const stats = [
    { label: "Jami mas'ullar", value: coords.length, icon: UserCog, color: "text-blue-400" },
    { label: "Faol", value: coords.filter(c => c.status === "active").length, icon: CheckCircle, color: "text-green-400" },
    { label: "OTM", value: coords.filter(c => c.role === "otm").length, icon: UserCog, color: "text-purple-400" },
    { label: "To'xtatilgan", value: coords.filter(c => c.status === "temp_suspended").length, icon: UserCog, color: "text-amber-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Mas'ullar"
        subtitle="OTM va hududiy koordinatorlarni boshqarish"
        actions={
          <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors">
            <Plus size={16} /> Mas'ul qo'shish
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
          <input className="w-full pl-9 pr-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500" placeholder="Ism yoki tashkilot..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">Barcha rollar</option>
          {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Barcha holatlar</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
                  {["F.I.Sh.", "Tashkilot / Lavozim", "Aloqa", "Rol", "Holat", "Amallar"].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-medium text-[var(--admin-text-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-medium text-white">{c.lastName} {c.firstName}</div>
                      <div className="text-xs text-[var(--admin-text-muted)] mt-0.5 font-mono">{c.login}</div>
                    </td>
                    <td className="py-3 px-5 text-sm text-[var(--admin-text-secondary)]">
                      <div>{c.organization}</div>
                      <div className="text-xs text-[var(--admin-text-muted)]">{c.position}</div>
                    </td>
                    <td className="py-3 px-5 text-sm text-[var(--admin-text-secondary)]">
                      <div>{c.phone}</div>
                      <div className="text-xs text-[var(--admin-text-muted)]">{c.email}</div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-sm font-medium ${ROLE_CONFIG[c.role].color}`}>{ROLE_CONFIG[c.role].label}</span>
                      {c.location && <div className="text-xs text-[var(--admin-text-muted)]">{c.location}</div>}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[c.status].color}`}>{STATUS_CONFIG[c.status].label}</span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: "edit", coord: c })} title="Tahrirlash" className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors text-[var(--admin-text-muted)] hover:text-white"><Edit2 size={15} /></button>
                        <button onClick={() => setModal({ type: "pw", coord: c })} title="Parol o'zgartirish" className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors text-[var(--admin-text-muted)] hover:text-amber-400"><KeyRound size={15} /></button>
                        <button onClick={() => deleteCoord(c.id)} title="O'chirish" className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--admin-text-muted)] hover:text-red-400"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[var(--admin-text-muted)]">
                <UserCog size={40} className="mx-auto mb-3 opacity-40" />
                <p>Mas'ullar topilmadi</p>
              </div>
            )}
          </div>
        )}
      </div>

      {modal === "add" && <CoordModal coord={null} onClose={() => setModal(null)} onSaved={load} />}
      {modal !== null && typeof modal === "object" && modal.type === "edit" && <CoordModal coord={modal.coord} onClose={() => setModal(null)} onSaved={load} />}
      {modal !== null && typeof modal === "object" && modal.type === "pw" && <ChangePasswordModal coord={modal.coord} onClose={() => setModal(null)} onSaved={load} />}
    </AdminShell>
  );
}
