import { Activity, Lock, Trophy, Award } from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";

export function MonitoringPage() {
  return (
    <ProfileShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Monitoring</h1>
        <p className="text-sm text-[#aab6c9]">6 oylik monitoring hisobotlari</p>
      </div>

      {/* G'olib startaplar uchun bo'sh holat */}
      <div className="bg-gradient-to-br from-[#0a1b30] to-[#0d1f35] border-2 border-[rgba(255,215,0,.15)] rounded-3xl p-12 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30">
            <Trophy size={40} className="text-yellow-500" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-3">
            G'olib Startaplar Uchun
          </h2>

          {/* Description */}
          <p className="text-[#aab6c9] text-base max-w-2xl mx-auto mb-6 leading-relaxed">
            Monitoring qismi faqat <span className="text-yellow-500 font-semibold">g'olib startaplarga</span> ochiladi. 
            Tanlov finalida muvaffaqiyatli ishtirok etganingizdan keyin bu bo'limda 6 oylik rivojlanish jarayonini 
            kuzatish va hisobotlarni yuborish imkoniyati paydo bo'ladi.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="p-4 bg-[#07172b]/50 border border-[rgba(112,145,190,.18)] rounded-xl">
              <Activity size={24} className="mx-auto mb-2 text-blue-400" />
              <p className="text-xs text-[#718096]">Oylik progress hisobotlari</p>
            </div>
            <div className="p-4 bg-[#07172b]/50 border border-[rgba(112,145,190,.18)] rounded-xl">
              <Lock size={24} className="mx-auto mb-2 text-purple-400" />
              <p className="text-xs text-[#718096]">KPI ko'rsatkichlarini kuzatish</p>
            </div>
            <div className="p-4 bg-[#07172b]/50 border border-[rgba(112,145,190,.18)] rounded-xl">
              <Award size={24} className="mx-auto mb-2 text-yellow-400" />
              <p className="text-xs text-[#718096]">Mentor bilan hamkorlik</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <Lock size={14} className="text-yellow-500" />
            <span className="text-xs font-semibold text-yellow-500">G'oliblar uchun maxsus imkoniyat</span>
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}
