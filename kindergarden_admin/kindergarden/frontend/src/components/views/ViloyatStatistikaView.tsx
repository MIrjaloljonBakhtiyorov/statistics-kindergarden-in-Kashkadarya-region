import React from 'react';
import { BarChart3 } from 'lucide-react';

const ViloyatStatistikaView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <BarChart3 className="text-blue-700 w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-depth uppercase tracking-tight">Viloyat Statistikasi</h2>
          <p className="text-[11px] text-brand-muted font-semibold uppercase tracking-widest">Qashqadaryo viloyati MTT tahlili</p>
        </div>
      </div>
      <div className="flex-1 rounded-2xl overflow-hidden border border-brand-border shadow-sm" style={{ minHeight: '80vh' }}>
        <iframe
          src="/viloyat-statistikasi"
          className="w-full h-full border-0"
          style={{ minHeight: '80vh' }}
          title="Viloyat Statistikasi"
        />
      </div>
    </div>
  );
};

export default ViloyatStatistikaView;
