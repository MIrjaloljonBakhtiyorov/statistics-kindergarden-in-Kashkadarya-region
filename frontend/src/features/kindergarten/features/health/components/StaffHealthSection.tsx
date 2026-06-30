import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  PlusCircle,
  Search,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';

type StaffHealthRow = {
  id: string;
  full_name: string;
  position?: string | null;
  phone?: string | null;
  status?: string | null;
  latest_check_date?: string | null;
  latest_is_fit?: boolean | null;
  latest_conclusion?: string | null;
  latest_weight?: number | null;
  latest_height?: number | null;
  latest_temperature?: number | null;
  latest_chest_circumference?: number | null;
  latest_weight_status?: string | null;
  latest_height_status?: string | null;
  latest_temperature_status?: string | null;
  latest_chest_circumference_status?: string | null;
  next_check_date?: string | null;
  is_due: boolean;
  frequency_label: string;
};

type StaffHealthForm = {
  staff_id: string;
  date: string;
  weight: string;
  height: string;
  temperature: string;
  chest_circumference: string;
  weight_status: string;
  height_status: string;
  temperature_status: string;
  chest_circumference_status: string;
  blood_pressure: string;
  conclusion: string;
  is_fit: boolean;
  notes: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

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

const formatDate = (value?: string | null) => {
  if (!value) return 'Kiritilmagan';
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

const emptyForm = (staffId = ''): StaffHealthForm => ({
  staff_id: staffId,
  date: todayIso(),
  weight: '',
  height: '',
  temperature: '',
  chest_circumference: '',
  weight_status: 'NOT_CHECKED',
  height_status: 'NOT_CHECKED',
  temperature_status: 'NOT_CHECKED',
  chest_circumference_status: 'NOT_CHECKED',
  blood_pressure: '',
  conclusion: '',
  is_fit: true,
  notes: '',
});

const StaffHealthSection: React.FC = () => {
  const { showNotification } = useNotification();
  const [rows, setRows] = useState<StaffHealthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffHealthForm>(emptyForm());

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/health/staff-semiannual');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      showNotification("Xodimlar salomatligi ma'lumotlarini yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      `${row.full_name} ${row.position || ''} ${row.phone || ''}`.toLowerCase().includes(term)
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const due = rows.filter((row) => row.is_due).length;
    const fit = rows.filter((row) => row.latest_is_fit === true).length;
    const checked = rows.filter((row) => row.latest_check_date).length;
    return { total: rows.length, due, fit, checked };
  }, [rows]);

  const selectedStaff = rows.find((row) => row.id === form.staff_id);

  const openModal = (staff?: StaffHealthRow) => {
    setForm(emptyForm(staff?.id || ''));
    setModalOpen(true);
  };

  const saveCheck = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.staff_id) {
      showNotification('Xodim tanlang', 'info');
      return;
    }

    try {
      await apiClient.post('/health/staff-check', {
        staff_id: form.staff_id,
        date: form.date,
        weight: form.weight === '' ? null : Number(form.weight),
        height: form.height === '' ? null : Number(form.height),
        temperature: form.temperature === '' ? null : Number(form.temperature),
        chest_circumference: form.chest_circumference === '' ? null : Number(form.chest_circumference),
        weight_status: form.weight_status,
        height_status: form.height_status,
        temperature_status: form.temperature_status,
        chest_circumference_status: form.chest_circumference_status,
        blood_pressure: form.blood_pressure.trim() || null,
        conclusion: form.conclusion.trim() || null,
        is_fit: form.is_fit,
        notes: form.notes.trim() || null,
      });
      showNotification("Xodim tibbiy ko'rigi saqlandi", 'success');
      setModalOpen(false);
      loadRows();
    } catch (error) {
      showNotification("Xodim tibbiy ko'rigini saqlashda xatolik", 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-brand-border rounded-[2rem] p-10 text-center text-brand-primary font-black animate-pulse">
        Xodimlar salomatligi yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-[1.5rem] border border-brand-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
            <UserRound size={18} />
          </div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Jami xodimlar</p>
          <p className="text-3xl font-black text-brand-depth mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-[1.5rem] border border-brand-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
            <AlertTriangle size={18} />
          </div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Ko'rik vaqti kelgan</p>
          <p className="text-3xl font-black text-amber-500 mt-1">{stats.due}</p>
        </div>
        <div className="bg-white p-5 rounded-[1.5rem] border border-brand-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Yaroqli</p>
          <p className="text-3xl font-black text-emerald-500 mt-1">{stats.fit}</p>
        </div>
        <div className="bg-white p-5 rounded-[1.5rem] border border-brand-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
            <CalendarDays size={18} />
          </div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Tekshirilgan</p>
          <p className="text-3xl font-black text-brand-depth mt-1">{stats.checked}</p>
        </div>
      </div>

      <section className="bg-white border border-brand-border rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-brand-depth">Xodimlar salomatligi</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">
              Har 6 oyda bir marta majburiy tibbiy ko'rik
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Xodim qidirish..."
                className="w-full sm:w-72 bg-slate-50 border border-brand-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-brand-primary"
              />
            </div>
            <button
              onClick={() => openModal()}
              className="px-5 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              <PlusCircle size={16} /> Ko'rik qo'shish
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-brand-muted tracking-widest">
                <th className="px-6 py-5">Xodim</th>
                <th className="px-6 py-5">Lavozim</th>
                <th className="px-6 py-5">Oxirgi ko'rik</th>
                <th className="px-6 py-5">Keyingi ko'rik</th>
                <th className="px-6 py-5">Holat</th>
                <th className="px-6 py-5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-primary/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-brand-depth">{row.full_name}</p>
                    <p className="text-[10px] font-bold text-brand-muted mt-1">{row.phone || 'Telefon kiritilmagan'}</p>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-brand-slate">{row.position || 'Xodim'}</td>
                  <td className="px-6 py-5 text-xs font-black text-brand-depth">{formatDate(row.latest_check_date)}</td>
                  <td className="px-6 py-5 text-xs font-black text-brand-depth">{formatDate(row.next_check_date)}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                      row.is_due
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : row.latest_is_fit === false
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        row.is_due ? 'bg-amber-500' : row.latest_is_fit === false ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} />
                      {row.is_due ? 'Ko\'rik kerak' : row.latest_is_fit === false ? 'Nazoratda' : 'Me\'yorda'}
                    </span>
                    {row.latest_conclusion && (
                      <p className="text-[10px] font-bold text-brand-muted mt-2 max-w-xs truncate">{row.latest_conclusion}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {[
                        ["Bo'y", row.latest_height_status],
                        ['Vazn', row.latest_weight_status],
                        ['Harorat', row.latest_temperature_status],
                        ["Ko'krak", row.latest_chest_circumference_status],
                      ].map(([label, status]) => (
                        <span key={label} className={`px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${metricStatusClass(status as string)}`}>
                          {label}: {metricStatusLabel(status as string)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => openModal(row)}
                      className="px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      Qayd qilish
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Stethoscope className="mx-auto text-brand-muted mb-3" size={34} />
                    <p className="text-sm font-black text-brand-muted">Xodim topilmadi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[10px] shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brand-border flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-black text-brand-depth">Xodim tibbiy ko'rigi</h3>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">
                  Har 6 oylik ko'rik natijalarini kiriting
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveCheck} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Xodim</label>
                <select
                  required
                  value={form.staff_id}
                  onChange={(event) => setForm({ ...form, staff_id: event.target.value })}
                  className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                >
                  <option value="">Xodim tanlang</option>
                  {rows.map((row) => (
                    <option key={row.id} value={row.id}>{row.full_name} - {row.position || 'Xodim'}</option>
                  ))}
                </select>
              </div>

              {selectedStaff && (
                <div className="p-4 bg-slate-50 rounded-[10px] border border-brand-border flex items-center gap-3">
                  <Activity size={18} className="text-brand-primary" />
                  <div>
                    <p className="text-xs font-black text-brand-depth">{selectedStaff.full_name}</p>
                    <p className="text-[10px] font-bold text-brand-muted">
                      Oxirgi ko'rik: {formatDate(selectedStaff.latest_check_date)}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sana</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Bo'y</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="170"
                    value={form.height}
                    onChange={(event) => setForm({ ...form, height: event.target.value })}
                    className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Vazn</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={form.weight}
                    onChange={(event) => setForm({ ...form, weight: event.target.value })}
                    className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Harorat</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.6"
                    value={form.temperature}
                    onChange={(event) => setForm({ ...form, temperature: event.target.value })}
                    className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Ko'krak qafasi</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="90"
                    value={form.chest_circumference}
                    onChange={(event) => setForm({ ...form, chest_circumference: event.target.value })}
                    className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Qon bosimi</label>
                  <input
                    placeholder="120/80"
                    value={form.blood_pressure}
                    onChange={(event) => setForm({ ...form, blood_pressure: event.target.value })}
                    className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricStatusSelect label="Bo'y statusi" value={form.height_status} onChange={(value) => setForm({ ...form, height_status: value })} />
                <MetricStatusSelect label="Vazn statusi" value={form.weight_status} onChange={(value) => setForm({ ...form, weight_status: value })} />
                <MetricStatusSelect label="Harorat statusi" value={form.temperature_status} onChange={(value) => setForm({ ...form, temperature_status: value })} />
                <MetricStatusSelect label="Ko'krak statusi" value={form.chest_circumference_status} onChange={(value) => setForm({ ...form, chest_circumference_status: value })} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Xulosa</label>
                <input
                  placeholder="Masalan: Sog'lom, ishga yaroqli"
                  value={form.conclusion}
                  onChange={(event) => setForm({ ...form, conclusion: event.target.value })}
                  className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-[10px] border border-brand-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_fit}
                  onChange={(event) => setForm({ ...form, is_fit: event.target.checked })}
                  className="w-5 h-5 accent-brand-primary"
                />
                <span className="text-sm font-black text-brand-depth">Ishga yaroqli</span>
              </label>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Izoh</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  placeholder="Qo'shimcha tavsiyalar..."
                  className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-bold outline-none focus:border-brand-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-primary text-white rounded-[10px] font-black uppercase text-xs tracking-widest shadow-xl shadow-brand-primary/20"
              >
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricStatusSelect = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="space-y-2 block">
    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-white border border-brand-border rounded-[10px] p-4 font-black outline-none focus:border-brand-primary"
    >
      {metricStatusOptions.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

export default StaffHealthSection;

