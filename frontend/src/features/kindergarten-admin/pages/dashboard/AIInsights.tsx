import { BrainCircuit, Database, ShieldCheck } from 'lucide-react';

export const AIInsights = () => {
  return (
    <div className="min-h-screen bg-[#f4f6fb] p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">AI Analitika</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Faqat real baza ma'lumotlari ulanganda ko'rsatiladi</p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
            <Database size={30} />
          </div>
          <h2 className="mb-2 text-lg font-black uppercase tracking-widest text-slate-500">Real AI ma'lumotlar hali ulanmagan</h2>
          <p className="mx-auto max-w-xl text-sm font-medium leading-6 text-slate-400">
            Bu sahifadan oldingi statik ko'rsatkichlar olib tashlandi. AI tahlil faqat backenddan real statistik endpointlar kelgandan keyin chiqariladi.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-700">
            <ShieldCheck size={15} />
            Soxta ma'lumot ko'rsatilmaydi
          </div>
        </div>
      </div>
    </div>
  );
};
