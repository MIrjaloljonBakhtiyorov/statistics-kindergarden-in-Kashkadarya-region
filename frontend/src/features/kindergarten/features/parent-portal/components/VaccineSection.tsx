import React from 'react';
import { AlertCircle, Calendar, CheckCircle, Clock, Info, ShieldCheck, Syringe } from 'lucide-react';

type VaccineRecord = {
  id?: string | number;
  vaccine_name?: string;
  planned_date?: string;
  taken_date?: string;
  status?: string;
};

const formatDate = (value?: string) => {
  if (!value) return 'Sana kiritilmagan';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const VaccineSection = ({ data }: any) => {
  const vaccinations: VaccineRecord[] = data?.vaccinations || [];
  const takenCount = vaccinations.filter((item) => item.status === 'TAKEN').length;
  const plannedCount = vaccinations.length - takenCount;

  return (
    <div className="kg-parent-section space-y-4 md:space-y-5">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-4 shadow-sm md:p-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500"></div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 shadow-sm">
              <ShieldCheck size={23} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Emlash nazorati</p>
              <h4 className="mt-1 text-xl font-extrabold uppercase leading-tight text-brand-depth md:text-2xl">Immunizatsiya</h4>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">Reja va olingan emlashlar ro'yxati</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-[260px]">
            <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-brand-muted">Olingan</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold leading-none text-brand-depth">
                <CheckCircle size={19} className="text-rose-500" /> {takenCount}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-brand-muted">Rejada</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold leading-none text-brand-depth">
                <Clock size={19} className="text-rose-500" /> {plannedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-brand-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20">
              <Syringe size={20} />
            </div>
            <div>
              <h5 className="text-lg font-extrabold uppercase leading-tight text-brand-depth">Emlashlar ro'yxati</h5>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-muted">Tibbiy profilaktika jadvali</p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-rose-600">
            <Calendar size={13} /> {vaccinations.length} ta yozuv
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {vaccinations.length > 0 ? vaccinations.map((item, index) => {
            const isTaken = item.status === 'TAKEN';
            return (
              <div
                key={item.id || `${item.vaccine_name}-${index}`}
                className="flex flex-col gap-3 p-4 transition-all hover:bg-rose-50/35 md:flex-row md:items-center md:justify-between md:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${isTaken ? 'border-rose-100 bg-rose-50 text-rose-500' : 'border-slate-100 bg-slate-50 text-brand-muted'}`}>
                    <Syringe size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold uppercase text-brand-depth">{item.vaccine_name || 'Emlash nomi kiritilmagan'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-brand-muted">
                        <Calendar size={12} className="text-rose-500" /> Reja: {formatDate(item.planned_date)}
                      </span>
                      {isTaken && (
                        <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-rose-600">
                          <CheckCircle size={12} /> Olingan: {formatDate(item.taken_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`inline-flex w-fit items-center justify-center rounded-2xl px-4 py-2 text-[9px] font-black uppercase tracking-[0.14em] ${isTaken ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20' : 'bg-slate-100 text-brand-muted'}`}>
                  {isTaken ? 'Olingan' : 'Kutilmoqda'}
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="text-sm font-extrabold uppercase text-brand-depth">Emlash ma'lumotlari kiritilmagan</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand-muted">Bog'cha emlash jadvalini kiritganda shu yerda ko'rinadi.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[1.15rem] border border-rose-100 bg-rose-50/55 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
          <Info size={19} />
        </div>
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-rose-700">
          Emlash ishlari tasdiqlangan grafik asosida olib boriladi. Savollar bo'lsa, bog'cha ma'muriyati bilan bog'laning.
        </p>
      </div>
    </div>
  );
};
