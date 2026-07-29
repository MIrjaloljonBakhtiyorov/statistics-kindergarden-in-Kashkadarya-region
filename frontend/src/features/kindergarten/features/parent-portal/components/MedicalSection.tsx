import React from 'react';
import { Activity, AlertCircle, Calendar, Clipboard, FileText, HeartPulse, Ruler, ShieldAlert, Thermometer, Weight } from 'lucide-react';
import { motion } from 'motion/react';

type HealthRecord = {
  id?: string | number;
  date?: string;
  height?: string | number | null;
  weight?: string | number | null;
  temperature?: string | number | null;
  chest_circumference?: string | number | null;
  weight_status?: string | null;
  height_status?: string | null;
  temperature_status?: string | null;
  chest_circumference_status?: string | null;
  notes?: string | null;
  allergy?: string | null;
  allergies?: string | null;
  doctor_name?: string | null;
  checkup_type?: string | null;
  is_sick?: boolean | number | string;
};

const formatDate = (value?: string) => {
  if (!value) return 'Sana kiritilmagan';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getFirstValue = (...values: Array<string | number | null | undefined>) => {
  const match = values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
  return match === undefined ? '--' : match;
};

const isHealthyNote = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase().replace(/[`\u2019]/g, "'");
  return normalized.includes("sog'lom") || normalized.includes('soglom');
};

const isSickValue = (value: unknown) => value === true || value === 1 || value === '1' || String(value || '').toUpperCase() === 'TRUE';

const hasMeasuredValue = (value: string | number | null | undefined) => value !== undefined && value !== null && String(value).trim() !== '';

export const MedicalSection = ({ parentData, health = [] }: { parentData: any; health?: HealthRecord[] }) => {
  const latest = health?.[0];
  const allergies = getFirstValue(latest?.allergy, latest?.allergies, parentData?.allergies, '');
  const notes = getFirstValue(latest?.notes, parentData?.medical_notes, '');
  const hasAllergy = allergies !== '--' && String(allergies).trim() !== '';
  const isUnderControl = Boolean(isSickValue(latest?.is_sick) || parentData?.status === 'SICK' || (notes !== '--' && !isHealthyNote(String(notes))));
  const statusLabel = hasAllergy ? 'Allergiya bor' : isUnderControl ? 'Nazoratda' : "Sog'lom";
  const statusText = hasAllergy
    ? 'Allergiya va taqiqlar alohida kuzatuvda.'
    : isUnderControl
      ? "Shifokor qaydi bo'yicha nazorat davom etmoqda."
      : 'Hozircha xavfli belgi qayd etilmagan.';

  const vitals = [
    {
      label: "Bo'yi",
      value: getFirstValue(latest?.height, parentData?.height),
      unit: 'cm',
      icon: Ruler,
    },
    {
      label: 'Vazni',
      value: getFirstValue(latest?.weight, parentData?.weight),
      unit: 'kg',
      icon: Weight,
    },
    {
      label: 'Harorat',
      value: getFirstValue(latest?.temperature, parentData?.temperature),
      unit: 'C',
      icon: Thermometer,
    },
    {
      label: "Ko'krak qafasi",
      value: getFirstValue(latest?.chest_circumference),
      unit: 'cm',
      icon: Activity,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-5">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-4 shadow-sm md:p-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500"></div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 shadow-sm">
              <HeartPulse size={23} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Salomatlik nazorati</p>
              <h4 className="mt-1 text-xl font-extrabold uppercase leading-tight text-brand-depth md:text-2xl">Tibbiy kuzatuv</h4>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">Farzandingiz sog'ligi bo'yicha asosiy ma'lumotlar</p>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-brand-muted">Umumiy holat</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20">
                <Activity size={16} />
              </span>
              <div>
                <p className="text-sm font-extrabold uppercase leading-none text-brand-depth">{statusLabel}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-brand-muted">{statusText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {vitals.map((item) => (
          <div key={item.label} className="rounded-[1.15rem] border border-rose-100 bg-white p-4 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50/40">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
                <item.icon size={20} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-muted">{item.label}</p>
            </div>
            <p className="text-3xl font-extrabold leading-none text-brand-depth">
              {item.value}
              {item.value !== '--' && <span className="ml-1.5 text-sm font-black uppercase text-rose-500">{item.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-[1.25rem] border border-rose-100 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
              <ShieldAlert size={21} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-500">Muhim ma'lumot</p>
              <h5 className="text-lg font-extrabold uppercase leading-tight text-brand-depth">Allergiya va taqiqlar</h5>
            </div>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/45 p-4">
            <p className="text-sm font-bold leading-relaxed text-brand-depth">
              {hasAllergy ? String(allergies) : 'Allergiya yoki maxsus taqiq qayd etilmagan.'}
            </p>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-rose-100 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
              <FileText size={21} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-500">Shifokor qaydi</p>
              <h5 className="text-lg font-extrabold uppercase leading-tight text-brand-depth">Oxirgi izoh</h5>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-bold leading-relaxed text-brand-slate">
              {notes !== '--' ? String(notes) : "Hozircha shifokor tomonidan qo'shimcha qayd kiritilmagan."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-brand-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-depth text-white">
              <Clipboard size={20} />
            </div>
            <div>
              <h5 className="text-lg font-extrabold uppercase leading-tight text-brand-depth">Tekshiruv tarixi</h5>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-muted">Oxirgi tibbiy kuzatuvlar</p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-rose-600">
            <Calendar size={13} /> {latest ? formatDate(latest.date) : "Yozuv yo'q"}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {health.length > 0 ? health.slice(0, 5).map((item, index) => (
            <div key={item.id || `${item.date}-${index}`} className="flex flex-col gap-3 p-4 transition-all hover:bg-rose-50/35 md:flex-row md:items-center md:justify-between md:p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500">
                  <HeartPulse size={18} />
                </div>
                <div>
                  <p className="text-sm font-extrabold uppercase text-brand-depth">{isSickValue(item.is_sick) ? 'Kasallik qayd etildi' : item.checkup_type || 'Hamshira tekshiruvi'}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                    {formatDate(item.date)} {item.doctor_name ? `- ${item.doctor_name}` : ''}
                  </p>
                  {item.notes && <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-slate">{item.notes}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {hasMeasuredValue(item.height) && <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-rose-600">Bo'yi {item.height} cm</span>}
                {hasMeasuredValue(item.weight) && <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-rose-600">Vazni {item.weight} kg</span>}
                {hasMeasuredValue(item.temperature) && <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-rose-600">Harorat {item.temperature} C</span>}
                {hasMeasuredValue(item.chest_circumference) && <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-rose-600">Ko'krak {item.chest_circumference} cm</span>}
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="text-sm font-extrabold uppercase text-brand-depth">Tekshiruvlar kiritilmagan</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand-muted">Salomatlik yozuvlari bog'cha tomonidan qo'shilganda shu yerda ko'rinadi.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
