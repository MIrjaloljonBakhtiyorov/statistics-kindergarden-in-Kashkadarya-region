import { Box, Database, Download, Package, Search, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';

const kpis = [
  { title: "Umumiy mahsulotlar", value: "0", unit: "tonna", icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
  { title: "Kirim", value: "0", unit: "tonna", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Chiqim", value: "0", unit: "tonna", icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Riskdagi mahsulotlar", value: "0", unit: "tur", icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50" },
];

export const WarehouseCommandCenter = () => {
  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-20 font-sans text-slate-900">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Box className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">Omborxona Markazi</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real ombor API ulanmaguncha ma'lumot ko'rsatilmaydi</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                disabled
                placeholder="Real ombor qidiruvi ulanmagan"
                className="w-64 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 shadow-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color} mb-4`}>
                <kpi.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.title}</p>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-black text-slate-900">{kpi.value}</h3>
                <span className="text-[10px] font-bold text-slate-500">{kpi.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <section className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm min-h-[420px] flex items-center justify-center">
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Database className="text-slate-400" size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Ombor real bazasi hali ulanmagan</h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Eski statik mahsulotlar, tranzaksiyalar va trend grafiklari olib tashlandi. Real ombor API tayyor bo'lganda kirim, chiqim, mahsulot qoldig'i va risklar shu sahifada bazadan olinadi.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
