import React from 'react';
import { Plus, School, MapPin, User, Users, CheckCircle, XCircle } from 'lucide-react';

interface Bogcha {
  id: number;
  nomi: string;
  turi: string;
  tuman: string;
  direktor: string;
  bolalar: number;
  faol: boolean;
}

interface BogchaListProps {
  onAdd: () => void;
  bogchalar: Bogcha[];
}

const BogchaList: React.FC<BogchaListProps> = ({ onAdd, bogchalar }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#003580] uppercase tracking-tight">Bogcha boshqaruvi</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Qashqadaryo viloyatidagi maktabgacha ta'lim muassasalari</p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-[#003580] hover:bg-[#002560] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          Bogcha qo'shish
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jami bogchalar', value: bogchalar.length, color: 'text-[#003580]', bg: 'bg-blue-50' },
          { label: 'Faol bogchalar', value: bogchalar.filter(b => b.faol).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Jami bolalar', value: bogchalar.reduce((s, b) => s + b.bolalar, 0), color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Nofarol', value: bogchalar.filter(b => !b.faol).length, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <School size={16} className="text-[#003580]" />
          <h3 className="text-sm font-bold text-[#003580] uppercase tracking-widest">MTTlar ro'yxati</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">№</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bogcha nomi</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Turi</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuman</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Direktor</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bolalar</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bogchalar.map((b, index) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-bold">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-[#003580]">{b.nomi}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold">{b.turi}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400" />
                      {b.tuman}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      {b.direktor}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-slate-400" />
                      {b.bolalar} nafar
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {b.faol ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                        <CheckCircle size={12} /> Faol
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold">
                        <XCircle size={12} /> Nofarol
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BogchaList;
