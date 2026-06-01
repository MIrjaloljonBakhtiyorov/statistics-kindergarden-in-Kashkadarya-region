import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Edit3,
  History,
  Image as ImageIcon,
  PackagePlus,
  Pill,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';

type PharmacyItem = {
  id: string;
  name: string;
  form?: string;
  unit?: string;
  required_per_100: number;
  required_label?: string;
  current_quantity: number;
  movement_count: number;
  required_quantity: number;
  child_count_basis: number;
  nearest_expiry_date?: string | null;
  status: 'NOT_ENTERED' | 'OK' | 'LOW' | 'EMPTY' | 'EXPIRED' | 'EXPIRING';
};

type PharmacyMovement = {
  id: string;
  item_id: string;
  item_name?: string;
  unit?: string;
  type: 'IN' | 'OUT';
  quantity: number;
  movement_date: string;
  expiry_date?: string | null;
  batch_number?: string | null;
  source?: string | null;
  reason?: string | null;
  group_id?: string | null;
  group_name?: string | null;
  child_id?: string | null;
  child_name?: string | null;
  usage_time?: string | null;
  diagnosis?: string | null;
  evidence_photo_url?: string | null;
  notes?: string | null;
};

type GroupOption = {
  id: string;
  name: string;
};

type ChildOption = {
  id: string;
  first_name: string;
  last_name: string;
  group_id?: string | null;
  group_name?: string | null;
};

type PharmacyArchiveSummary = {
  item_id: string;
  item_name?: string;
  unit?: string;
  entries: number;
  in_quantity: number;
  out_quantity: number;
  net_quantity: number;
};

type PharmacyArchive = {
  months: number;
  cutoff_date: string;
  totals: {
    entries: number;
    in_quantity: number;
    out_quantity: number;
    net_quantity: number;
  };
  summary: PharmacyArchiveSummary[];
  movements: PharmacyMovement[];
};

const statusStyles: Record<PharmacyItem['status'], { label: string; className: string }> = {
  NOT_ENTERED: { label: 'Kiritilmagan', className: 'bg-slate-50 text-slate-600 border-slate-200' },
  OK: { label: 'Yetarli', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  LOW: { label: 'Kam', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  EMPTY: { label: 'Tugagan', className: 'bg-rose-50 text-rose-700 border-rose-100' },
  EXPIRED: { label: 'Muddati oвЂtgan', className: 'bg-red-50 text-red-700 border-red-100' },
  EXPIRING: { label: 'Muddati yaqin', className: 'bg-orange-50 text-orange-700 border-orange-100' },
};

const archiveFilters = [
  { value: 1, label: '1 oy' },
  { value: 3, label: '3 oy' },
  { value: 6, label: '6 oy' },
  { value: 12, label: '12 oy' },
  { value: 24, label: '24 oy' },
];

const today = () => new Date().toISOString().slice(0, 10);

const getAssetUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `http://localhost:4001${url}`;
};

const emptyItemForm = {
  name: '',
  form: '',
  unit: 'dona',
  required_per_100: '',
  required_label: '',
};

const emptyMovementForm = {
  item_id: '',
  type: 'IN' as 'IN' | 'OUT',
  quantity: '',
  movement_date: today(),
  expiry_date: '',
  batch_number: '',
  source: '',
  reason: '',
  group_id: '',
  child_id: '',
  usage_time: '',
  diagnosis: '',
  evidence_photo_url: '',
  notes: '',
};

const PharmacySection: React.FC = () => {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [movements, setMovements] = useState<PharmacyMovement[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [archive, setArchive] = useState<PharmacyArchive | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveMonths, setArchiveMonths] = useState(24);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PharmacyItem | null>(null);
  const [editingMovement, setEditingMovement] = useState<PharmacyMovement | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [movementForm, setMovementForm] = useState(emptyMovementForm);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const archiveRef = useRef<HTMLElement | null>(null);

  const fetchPharmacy = async () => {
    setLoading(true);
    try {
      const [itemsRes, movementsRes, groupsRes, childrenRes] = await Promise.all([
        apiClient.get('/medical-inventory/items'),
        apiClient.get('/medical-inventory/movements'),
        apiClient.get('/groups'),
        apiClient.get('/children'),
      ]);
      setItems(itemsRes.data);
      setMovements(movementsRes.data);
      setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      setChildren(Array.isArray(childrenRes.data) ? childrenRes.data : []);
    } catch (error) {
      showNotification('Dorixona maвЂ™lumotlarini yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchive = async (months = archiveMonths) => {
    setArchiveLoading(true);
    try {
      const res = await apiClient.get(`/medical-inventory/archive?months=${months}`);
      setArchive(res.data);
    } catch (error) {
      showNotification('Dorixona arxivini yuklashda xatolik', 'error');
    } finally {
      setArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacy();
  }, []);

  useEffect(() => {
    fetchArchive(archiveMonths);
  }, [archiveMonths]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = `${item.name} ${item.form || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const stats = useMemo(() => {
    const low = items.filter((item) => ['LOW', 'EMPTY'].includes(item.status)).length;
    const notEntered = items.filter((item) => item.status === 'NOT_ENTERED').length;
    const risk = items.filter((item) => ['EXPIRED', 'EXPIRING'].includes(item.status)).length;
    const stock = items.reduce((sum, item) => sum + Number(item.current_quantity || 0), 0);
    return { total: items.length, low, notEntered, risk, stock };
  }, [items]);

  const archiveTotals = archive?.totals || { entries: 0, in_quantity: 0, out_quantity: 0, net_quantity: 0 };

  const childrenForSelectedGroup = useMemo(() => {
    if (!movementForm.group_id) return children;
    return children.filter((child) => String(child.group_id || '') === String(movementForm.group_id));
  }, [children, movementForm.group_id]);

  const openArchive = () => {
    setArchiveOpen(true);
    window.setTimeout(() => {
      archiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const openItemModal = (item?: PharmacyItem) => {
    setEditingItem(item || null);
    setItemForm(item ? {
      name: item.name || '',
      form: item.form || '',
      unit: item.unit || 'dona',
      required_per_100: String(item.required_per_100 || ''),
      required_label: item.required_label || '',
    } : emptyItemForm);
    setItemModalOpen(true);
  };

  const openMovementModal = (type: 'IN' | 'OUT', item?: PharmacyItem, movement?: PharmacyMovement) => {
    setEditingMovement(movement || null);
    setMovementForm(movement ? {
      item_id: movement.item_id,
      type: movement.type,
      quantity: String(movement.quantity || ''),
      movement_date: movement.movement_date || today(),
      expiry_date: movement.expiry_date || '',
      batch_number: movement.batch_number || '',
      source: movement.source || '',
      reason: movement.reason || '',
      group_id: movement.group_id || '',
      child_id: movement.child_id || '',
      usage_time: movement.usage_time || '',
      diagnosis: movement.diagnosis || '',
      evidence_photo_url: movement.evidence_photo_url || '',
      notes: movement.notes || '',
    } : {
      ...emptyMovementForm,
      type,
      item_id: item?.id || '',
      reason: type === 'OUT' ? 'Birinchi yordam uchun ishlatildi' : '',
    });
    setMovementModalOpen(true);
  };

  const saveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        ...itemForm,
        required_per_100: Number(itemForm.required_per_100 || 0),
      };
      if (editingItem) {
        await apiClient.put(`/medical-inventory/items/${editingItem.id}`, payload);
      } else {
        await apiClient.post('/medical-inventory/items', payload);
      }
      showNotification('Dori maвЂ™lumoti saqlandi', 'success');
      setItemModalOpen(false);
      fetchPharmacy();
    } catch (error: any) {
      showNotification(error?.response?.data?.error || 'Saqlashda xatolik', 'error');
    }
  };

  const uploadEvidencePhoto = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    setUploadingEvidence(true);
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMovementForm((current) => ({ ...current, evidence_photo_url: res.data.url }));
      showNotification('Foto dalil yuklandi', 'success');
    } catch (error) {
      showNotification('Foto dalilni yuklashda xatolik', 'error');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const saveMovement = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (movementForm.type === 'OUT') {
        if (!movementForm.group_id || !movementForm.child_id || !movementForm.usage_time || !movementForm.diagnosis || !movementForm.evidence_photo_url) {
          showNotification('Chiqim uchun guruh, bola, vaqt, tashxis va foto dalil kerak', 'error');
          return;
        }
      }
      const payload = {
        ...movementForm,
        quantity: Number(movementForm.quantity || 0),
        expiry_date: movementForm.type === 'IN' ? movementForm.expiry_date || null : null,
      };
      if (editingMovement) {
        await apiClient.put(`/medical-inventory/movements/${editingMovement.id}`, payload);
      } else {
        await apiClient.post('/medical-inventory/movements', payload);
      }
      showNotification('Kirim/chiqim saqlandi', 'success');
      setMovementModalOpen(false);
      await Promise.all([fetchPharmacy(), fetchArchive(archiveMonths)]);
    } catch (error: any) {
      showNotification(error?.response?.data?.error || 'Kirim/chiqimda xatolik', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-[420px] flex items-center justify-center text-brand-primary font-black animate-pulse">Dorixona yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <SummaryCard icon={Pill} label="Dori turlari" value={stats.total} color="text-violet-600" bg="bg-violet-50" />
        <SummaryCard icon={PackagePlus} label="Kiritilmagan" value={stats.notEntered} color="text-slate-600" bg="bg-slate-50" />
        <SummaryCard icon={AlertTriangle} label="Kam qolgan" value={stats.low} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard icon={CalendarDays} label="Muddat riski" value={stats.risk} color="text-rose-600" bg="bg-rose-50" />
        <button
          onClick={openArchive}
          className="text-left bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-sm hover:border-brand-primary/30 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <History size={20} />
          </div>
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Arxiv</p>
          <p className="text-2xl sm:text-3xl font-black text-brand-depth mt-1">{archiveTotals.entries}</p>
        </button>
      </div>

      <section className="bg-white border border-brand-border rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-brand-border flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-brand-depth">Birinchi yordam dorixonasi</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mt-1">100 nafar tarbiyalanuvchi hisobidagi normativ nazorat</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Dori qidirish..."
                className="w-full sm:w-64 bg-slate-50 border border-brand-border rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-brand-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="bg-slate-50 border border-brand-border rounded-xl py-3 px-4 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-primary"
            >
              <option value="ALL">Barchasi</option>
              <option value="NOT_ENTERED">Kiritilmagan</option>
              <option value="LOW">Kam</option>
              <option value="EMPTY">Tugagan</option>
              <option value="EXPIRING">Muddati yaqin</option>
              <option value="EXPIRED">Muddati oвЂtgan</option>
            </select>
            <button
              onClick={() => openItemModal()}
              className="px-5 py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              <Plus size={16} /> Dori qoвЂshish
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/70 text-[10px] font-black uppercase text-brand-muted tracking-widest border-b border-brand-border">
                <th className="px-6 py-5">Dori vositasi</th>
                <th className="px-4 py-5">Normativ</th>
                <th className="px-4 py-5">Qoldiq</th>
                <th className="px-4 py-5">Yaroqlilik</th>
                <th className="px-4 py-5">Holat</th>
                <th className="px-6 py-5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => {
                const status = statusStyles[item.status] || statusStyles.OK;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-brand-depth">{item.name}</p>
                      <p className="text-[11px] font-semibold text-brand-muted mt-1 max-w-md">{item.form || 'Chiqarilish shakli kiritilmagan'}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-sm font-black text-brand-depth">{item.required_quantity} {item.unit}</p>
                      <p className="text-[10px] font-bold text-brand-muted mt-1">{item.required_label || `${item.required_per_100} ${item.unit} / 100 bola`}</p>
                    </td>
                    <td className="px-4 py-5">
                      {item.status === 'NOT_ENTERED' ? (
                        <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Kiritilmagan</p>
                      ) : (
                        <p className="text-lg font-black text-brand-depth">{item.current_quantity} <span className="text-xs text-brand-muted">{item.unit}</span></p>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-xs font-black text-brand-depth">{item.nearest_expiry_date || 'Kiritilmagan'}</p>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openMovementModal('IN', item)} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest">Kirim</button>
                        <button
                          onClick={() => openMovementModal('OUT', item)}
                          disabled={item.status === 'NOT_ENTERED' || item.current_quantity <= 0}
                          className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Chiqim
                        </button>
                        <button onClick={() => openItemModal(item)} className="p-2 bg-slate-50 text-brand-slate rounded-xl hover:text-brand-primary" title="Tahrirlash">
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {archiveOpen && (
      <section ref={archiveRef} className="bg-white border border-brand-border rounded-[2rem] shadow-sm overflow-hidden scroll-mt-6">
        <div className="p-5 sm:p-6 border-b border-brand-border flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <History className="text-brand-primary" size={20} />
            <div>
              <h3 className="text-lg font-black text-brand-depth">Dorixona arxivi</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Har bir bog'cha bo'yicha 2 yillik kirim/chiqim saralovi</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {archiveFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setArchiveMonths(filter.value)}
                className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  archiveMonths === filter.value
                    ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
                    : 'bg-slate-50 text-brand-slate border-brand-border hover:text-brand-primary'
                }`}
              >
                {filter.label}
              </button>
            ))}
            <button
              onClick={() => setArchiveOpen(false)}
              className="px-4 py-2 rounded-xl border bg-white text-brand-slate border-brand-border text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 sm:p-6 border-b border-brand-border bg-slate-50/40">
          <ArchiveStat label="Yozuvlar" value={archiveTotals.entries} />
          <ArchiveStat label="Kirim" value={archiveTotals.in_quantity.toLocaleString('uz-UZ')} />
          <ArchiveStat label="Chiqim" value={archiveTotals.out_quantity.toLocaleString('uz-UZ')} />
          <ArchiveStat label="Farq" value={archiveTotals.net_quantity.toLocaleString('uz-UZ')} />
        </div>

        {archive?.summary?.length ? (
          <div className="p-5 sm:p-6 border-b border-brand-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">Dori kesimidagi arxiv jamlanmasi</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {archive.summary.slice(0, 6).map((row) => (
                <div key={row.item_id} className="bg-slate-50 border border-brand-border rounded-xl p-4">
                  <p className="text-sm font-black text-brand-depth truncate">{row.item_name}</p>
                  <p className="text-[10px] font-bold text-brand-muted mt-2">
                    Kirim: {row.in_quantity} {row.unit} В· Chiqim: {row.out_quantity} {row.unit} В· Yozuv: {row.entries}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1180px]">
            <thead>
              <tr className="bg-slate-50/70 text-[10px] font-black uppercase text-brand-muted tracking-widest border-b border-brand-border">
                <th className="px-6 py-4">Dori</th>
                <th className="px-4 py-4">Turi</th>
                <th className="px-4 py-4">Miqdor</th>
                <th className="px-4 py-4">Sana</th>
                <th className="px-4 py-4">Yaroqlilik</th>
                <th className="px-4 py-4">Kimga ishlatildi</th>
                <th className="px-4 py-4">Manba/Sabab</th>
                <th className="px-4 py-4">Dalil</th>
                <th className="px-6 py-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {archiveLoading && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-brand-muted font-black uppercase tracking-widest text-[10px]">
                    Arxiv yuklanmoqda...
                  </td>
                </tr>
              )}
              {!archiveLoading && archive?.movements.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-brand-muted font-black uppercase tracking-widest text-[10px]">
                    Tanlangan davrda arxiv yozuvi yo'q
                  </td>
                </tr>
              )}
              {!archiveLoading && archive?.movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 text-sm font-black text-brand-depth">{movement.item_name}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${movement.type === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {movement.type === 'IN' ? 'Kirim' : 'Chiqim'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-brand-depth">{movement.quantity} {movement.unit}</td>
                  <td className="px-4 py-4 text-xs font-bold text-brand-slate">{movement.movement_date}</td>
                  <td className="px-4 py-4 text-xs font-bold text-brand-slate">{movement.expiry_date || '-'}</td>
                  <td className="px-4 py-4 text-xs font-bold text-brand-slate max-w-xs">
                    {movement.type === 'OUT' ? (
                      <div>
                        <p className="font-black text-brand-depth">{movement.child_name || '-'}</p>
                        <p className="mt-1">{movement.group_name || '-'}</p>
                        <p className="mt-1 text-rose-600">{movement.usage_time || '-'} - {movement.diagnosis || '-'}</p>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-brand-slate max-w-sm">
                    {movement.source || movement.reason || movement.notes || '-'}
                  </td>
                  <td className="px-4 py-4">
                    {movement.evidence_photo_url ? (
                      <a href={getAssetUrl(movement.evidence_photo_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                        <ImageIcon size={14} /> Ko'rish
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-brand-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openMovementModal(movement.type, undefined, movement)} className="p-2 bg-slate-50 text-brand-slate rounded-xl hover:text-brand-primary" title="Tahrirlash">
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {itemModalOpen && (
        <Modal title={editingItem ? 'Dorini tahrirlash' : 'Yangi dori qoвЂshish'} onClose={() => setItemModalOpen(false)}>
          <form onSubmit={saveItem} className="space-y-4">
            <Input label="Dori nomi" value={itemForm.name} onChange={(value) => setItemForm({ ...itemForm, name: value })} required />
            <Input label="Chiqarilish shakli" value={itemForm.form} onChange={(value) => setItemForm({ ...itemForm, form: value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="OвЂlchov birligi" value={itemForm.unit} onChange={(value) => setItemForm({ ...itemForm, unit: value })} required />
              <Input label="100 bolaga miqdor" type="number" value={itemForm.required_per_100} onChange={(value) => setItemForm({ ...itemForm, required_per_100: value })} />
            </div>
            <Input label="Normativ izohi" value={itemForm.required_label} onChange={(value) => setItemForm({ ...itemForm, required_label: value })} />
            <SubmitButton label="Saqlash" />
          </form>
        </Modal>
      )}

      {movementModalOpen && (
        <Modal title={editingMovement ? 'Kirim/chiqimni tahrirlash' : movementForm.type === 'IN' ? 'Doriga kirim qilish' : 'Doridan chiqim qilish'} onClose={() => setMovementModalOpen(false)}>
          <form onSubmit={saveMovement} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Dori</span>
                <select required value={movementForm.item_id} onChange={(event) => setMovementForm({ ...movementForm, item_id: event.target.value })} className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 font-bold outline-none">
                  <option value="">Tanlang...</option>
                  {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Amal turi</span>
                <select value={movementForm.type} onChange={(event) => setMovementForm({ ...movementForm, type: event.target.value as 'IN' | 'OUT' })} className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 font-bold outline-none">
                  <option value="IN">Kirim</option>
                  <option value="OUT">Chiqim</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Miqdor" type="number" value={movementForm.quantity} onChange={(value) => setMovementForm({ ...movementForm, quantity: value })} required />
              <Input label={movementForm.type === 'IN' ? 'Kelgan sana' : 'Chiqim sana'} type="date" value={movementForm.movement_date} onChange={(value) => setMovementForm({ ...movementForm, movement_date: value })} required />
            </div>
            {movementForm.type === 'IN' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Yaroqlilik muddati" type="date" value={movementForm.expiry_date} onChange={(value) => setMovementForm({ ...movementForm, expiry_date: value })} />
                <Input label="Partiya raqami" value={movementForm.batch_number} onChange={(value) => setMovementForm({ ...movementForm, batch_number: value })} />
              </div>
            )}
            {movementForm.type === 'OUT' && (
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-rose-700">
                  <Clock size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Dorini ishlatish dalolatnomasi</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Guruh</span>
                    <select
                      required
                      value={movementForm.group_id}
                      onChange={(event) => setMovementForm({ ...movementForm, group_id: event.target.value, child_id: '' })}
                      className="w-full bg-white border border-brand-border rounded-xl p-3 font-bold outline-none focus:border-brand-primary"
                    >
                      <option value="">Guruh tanlang...</option>
                      {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Bola</span>
                    <select
                      required
                      value={movementForm.child_id}
                      onChange={(event) => setMovementForm({ ...movementForm, child_id: event.target.value })}
                      className="w-full bg-white border border-brand-border rounded-xl p-3 font-bold outline-none focus:border-brand-primary"
                    >
                      <option value="">Bola tanlang...</option>
                      {childrenForSelectedGroup.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.first_name} {child.last_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Ishlatilgan vaqt" type="time" value={movementForm.usage_time} onChange={(value) => setMovementForm({ ...movementForm, usage_time: value })} required />
                  <Input label="Tashxis" value={movementForm.diagnosis} onChange={(value) => setMovementForm({ ...movementForm, diagnosis: value })} required />
                </div>
                <label className="space-y-2 block">
                  <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Foto dalil</span>
                  <div className="bg-white border border-dashed border-rose-200 rounded-2xl p-4">
                    {movementForm.evidence_photo_url ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <img
                          src={getAssetUrl(movementForm.evidence_photo_url)}
                          alt="Foto dalil"
                          className="w-full sm:w-32 h-32 rounded-xl object-cover border border-brand-border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-black text-brand-depth flex items-center gap-2"><ImageIcon size={16} /> Foto dalil yuklangan</p>
                          <button
                            type="button"
                            onClick={() => setMovementForm({ ...movementForm, evidence_photo_url: '' })}
                            className="mt-3 px-4 py-2 bg-slate-50 text-brand-slate rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-rose-600"
                          >
                            Rasmni almashtirish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-4">
                        <Upload size={24} className="text-rose-500 mb-2" />
                        <p className="text-sm font-black text-brand-depth">Dori ishlatilganini tasdiqlovchi rasm yuklang</p>
                        <p className="text-[10px] font-bold text-brand-muted mt-1">Chiqimni saqlash uchun majburiy</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      required={!movementForm.evidence_photo_url}
                      disabled={uploadingEvidence}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) uploadEvidencePhoto(file);
                      }}
                      className="mt-4 w-full text-xs font-bold text-brand-slate file:mr-4 file:rounded-xl file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-white"
                    />
                    {uploadingEvidence && <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-3">Yuklanmoqda...</p>}
                  </div>
                </label>
              </div>
            )}
            <Input label={movementForm.type === 'IN' ? 'Qayerdan keldi' : 'Chiqim sababi'} value={movementForm.type === 'IN' ? movementForm.source : movementForm.reason} onChange={(value) => setMovementForm(movementForm.type === 'IN' ? { ...movementForm, source: value } : { ...movementForm, reason: value })} />
            <label className="space-y-2 block">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Izoh</span>
              <textarea value={movementForm.notes} onChange={(event) => setMovementForm({ ...movementForm, notes: event.target.value })} rows={3} className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 font-bold outline-none resize-none" />
            </label>
            <SubmitButton label="Saqlash" />
          </form>
        </Modal>
      )}
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number | string; color: string; bg: string }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-sm">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon size={20} />
    </div>
    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{label}</p>
    <p className="text-2xl sm:text-3xl font-black text-brand-depth mt-1">{value}</p>
  </div>
);

const ArchiveStat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-white border border-brand-border rounded-xl p-4">
    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{label}</p>
    <p className="text-xl font-black text-brand-depth mt-1">{value}</p>
  </div>
);

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-[14px] border border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-brand-border flex items-center justify-between">
        <h3 className="text-xl font-black text-brand-depth">{title}</h3>
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 font-black transition-colors">&times;</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Input = ({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) => (
  <label className="space-y-2 block">
    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{label}</span>
    <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 font-bold outline-none focus:border-brand-primary" />
  </label>
);

const SubmitButton = ({ label }: { label: string }) => (
  <button type="submit" className="w-full py-4 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2">
    <PackagePlus size={16} /> {label}
  </button>
);

export default PharmacySection;

