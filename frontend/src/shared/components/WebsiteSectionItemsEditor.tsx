import { Plus, Trash2 } from 'lucide-react';

export type WebsiteSectionItem = {
  id?: string;
  name: string;
  count: string;
  workHours?: string;
  days: string;
  payment: string;
  description?: string;
};

type WebsiteSectionItemsEditorProps = {
  title: string;
  value: WebsiteSectionItem[];
  onChange: (value: WebsiteSectionItem[]) => void;
  namePlaceholder: string;
  countLabel: string;
  countPlaceholder: string;
  paymentLabel?: string;
  paymentPlaceholder?: string;
};

const emptyItem = (): WebsiteSectionItem => ({
  id: crypto.randomUUID(),
  name: '',
  count: '',
  days: '',
  payment: '',
});

export const WebsiteSectionItemsEditor = ({
  title,
  value,
  onChange,
  namePlaceholder,
  countLabel,
  countPlaceholder,
  paymentLabel = "Oylik to'lov",
  paymentPlaceholder = "Oyiga 300 000 so'm",
}: WebsiteSectionItemsEditorProps) => {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (index: number, key: keyof WebsiteSectionItem, nextValue: string) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: nextValue } : item));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1110] p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
          <p className="mt-1 text-xs font-bold text-slate-300">{items.length} ta ma'lumot kiritilgan</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem()])}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-500"
        >
          <Plus size={14} /> Qo'shish
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-2xl border border-white/10 bg-[#111615] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-300">#{index + 1}</p>
              <button type="button" onClick={() => removeItem(index)} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-rose-200">
                <Trash2 size={13} /> O'chirish
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Nomi" value={item.name || ''} onChange={(value) => updateItem(index, 'name', value)} placeholder={namePlaceholder} />
              <Field label={countLabel} value={item.count || ''} onChange={(value) => updateItem(index, 'count', value)} placeholder={countPlaceholder} />
              <Field label="Ish kunlari" value={item.days || ''} onChange={(value) => updateItem(index, 'days', value)} placeholder="Dushanba - Juma" />
              <Field label={paymentLabel} value={item.payment || ''} onChange={(value) => updateItem(index, 'payment', value)} placeholder={paymentPlaceholder} />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111615] p-6 text-center text-sm font-bold text-slate-300">
            Hali ma'lumot qo'shilmagan
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) => (
  <label>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
    <input
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1110] px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
    />
  </label>
);

export default WebsiteSectionItemsEditor;
