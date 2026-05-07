import React from 'react';
import { 
  Snowflake, 
  Flower2, 
  Sun, 
  Leaf, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Fingerprint, 
  Activity,
  Pizza,
  Soup,
  Coffee,
  UtensilsCrossed,
  Dessert,
  Beef,
  Cake,
  IceCream
} from 'lucide-react';
import { motion } from 'motion/react';

// Math helper for perfect SVG Arcs
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

const foodItems = [
  { image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop", label: "Pizza" },
  { image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop", label: "Sho'rva" },
  { image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop", label: "Qahva" },
  { image: "https://media.istockphoto.com/id/1434918490/photo/cute-little-girl-eats-fruit-salad.jpg?s=612x612&w=0&k=20&c=8zi80wlKZADN_koDY7EXg-kAzeyhiPlYdtJvM4BfLDQ=", label: "Salat" },
  { image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop", label: "Shirinlik" },
  { image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=300&h=300&fit=crop", label: "Go'sht" },
  { image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop", label: "Tort" },
  { image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&h=300&fit=crop", label: "Muzqaymoq" }
];

function ArcSegment({ startAngle, endAngle, cx, cy, innerRadius, outerRadius, label, index }: any) {
  const gap = 3; 
  const p1 = polarToCartesian(cx, cy, outerRadius, startAngle + gap);
  const p2 = polarToCartesian(cx, cy, outerRadius, endAngle - gap);
  const p3 = polarToCartesian(cx, cy, innerRadius, endAngle - gap);
  const p4 = polarToCartesian(cx, cy, innerRadius, startAngle + gap);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    "M", p1.x, p1.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, p2.x, p2.y,
    "L", p3.x, p3.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, p4.x, p4.y,
    "Z"
  ].join(" ");

  const midAngle = (startAngle + endAngle) / 2;
  const labelRadius = innerRadius + (outerRadius - innerRadius) / 2;
  const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

  return (
    <motion.g 
      className="cursor-pointer group"
      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.04, zIndex: 50 }}
    >
      <defs>
        <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.7" />
        </linearGradient>
        <filter id="segmentShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
        </filter>
      </defs>
      
      <path 
        d={d} 
        fill={`url(#grad-${index})`}
        stroke="rgba(255,255,255,0.9)" 
        strokeWidth="1.5" 
        filter="url(#segmentShadow)"
        className="transition-all duration-500 group-hover:fill-indigo-600 group-hover:stroke-indigo-400"
      />
      
      <text 
        x={labelPos.x} 
        y={labelPos.y} 
        textAnchor="middle" 
        dominantBaseline="middle" 
        className="text-[12px] font-black fill-slate-500 transition-all duration-300 group-hover:fill-white pointer-events-none tracking-widest"
      >
        {label}
      </text>
    </motion.g>
  );
}

const TaomnomaNazorati: React.FC = () => {
  return (
    <div className="relative w-full min-h-[1100px] flex items-center justify-center p-4 md:p-12 overflow-hidden rounded-[4rem] bg-white border border-slate-100 shadow-[0_0_100px_rgba(0,0,0,0.02)]">
      
      {/* NOISE & GRAIN OVERLAY */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* AMBIENT LIGHT SYSTEM */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 200, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[160px]"
        />
        <motion.div 
          animate={{ x: [0, -200, 0], y: [0, 200, 0], scale: [1, 1.4, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-[-10%] w-[700px] h-[700px] bg-sky-400/15 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -150, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-60 left-1/4 w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-[180px]"
        />
      </div>

      {/* FLOATING GLASS DECOR */}
      <motion.div 
        animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-40 h-40 bg-white/20 backdrop-blur-3xl border border-white/60 rounded-[3rem] shadow-2xl z-10 hidden xl:block"
      />
      <motion.div 
        animate={{ y: [0, 50, 0], rotate: [0, -15, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-40 right-20 w-32 h-32 bg-white/10 backdrop-blur-2xl border border-white/40 rounded-full shadow-2xl z-10 hidden xl:block"
      />

      {/* CORE WRAPPER */}
      <div className="relative z-10 w-full max-w-7xl bg-white/40 backdrop-blur-3xl border border-white/80 p-8 md:p-20 rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,1)] flex flex-col">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-32">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600 drop-shadow-md">Taomnoma Tsikli</span>
          </h2>
          <p className="text-xs md:text-xl text-slate-500 font-bold uppercase tracking-[0.4em] max-w-2xl">
            Tizimli nazorat va xavfsiz ovqatlantirish algoritmi
          </p>
        </div>

        <div className="flex flex-col items-center gap-24">
          
          {/* THE MASTER DIAL (Luxury Watch/Cockpit style) */}
          <div className="relative w-[380px] h-[380px] md:w-[640px] md:h-[640px] shrink-0 flex items-center justify-center">
            
            {/* Seasonal Satellites (Outer Orbit - Clockwise) */}
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-60px] pointer-events-none hidden md:block"
            >
              {[
                { icon: Snowflake, color: "text-blue-500", label: "Qish" },
                { icon: Flower2, color: "text-rose-500", label: "Bahor" },
                { icon: Sun, color: "text-amber-500", label: "Yoz" },
                { icon: Leaf, color: "text-emerald-500", label: "Kuz" }
              ].map((s, i) => {
                const angle = i * 90;
                const x = 50 + 55 * Math.cos(angle * Math.PI / 180);
                const y = 50 + 55 * Math.sin(angle * Math.PI / 180);
                return (
                  <div key={i} className="absolute w-20 h-20 bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] shadow-2xl flex flex-col items-center justify-center gap-1" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}>
                       <s.icon className={`w-8 h-8 ${s.color}`} strokeWidth={1.5} />
                    </motion.div>
                  </div>
                )
              })}
            </motion.div>

            {/* Food Satellites (Inner Orbit - Counter-Clockwise) */}
            <motion.div 
              animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-10px] pointer-events-none hidden md:block z-20"
            >
              {foodItems.map((s, i) => {
                const angle = (i / foodItems.length) * 360;
                const x = 50 + 48 * Math.cos(angle * Math.PI / 180);
                const y = 50 + 48 * Math.sin(angle * Math.PI / 180);
                return (
                  <div key={i} className="absolute w-20 h-20 bg-white p-1 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                    <motion.img 
                      src={s.image}
                      alt={s.label}
                      className="w-full h-full object-cover rounded-full"
                      animate={{ rotate: [0, 360] }} 
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )
              })}
            </motion.div>

            {/* SVG Layers */}

            <svg width="100%" height="100%" viewBox="0 0 640 640" className="absolute z-10 drop-shadow-[0_60px_100px_rgba(0,0,0,0.12)] overflow-visible">
               {/* Precision Ticks */}
               <g opacity="0.4">
                 {Array.from({ length: 120 }).map((_, i) => {
                    const isMajor = i % 12 === 0;
                    const angle = i * 3;
                    const rO = 310;
                    const rI = isMajor ? 285 : 300;
                    const p1 = polarToCartesian(320, 320, rO, angle);
                    const p2 = polarToCartesian(320, 320, rI, angle);
                    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#64748b" strokeWidth={isMajor ? 2 : 1} />;
                 })}
               </g>

               {/* Inner rotating rings */}
               <motion.circle cx="320" cy="320" r="270" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 12" animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />
               <motion.circle cx="320" cy="320" r="260" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="1 8" animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />

               <circle cx="320" cy="320" r="250" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />

               {/* Day Segments */}
               {Array.from({ length: 10 }).map((_, i) => (
                 <ArcSegment key={i} index={i} cx={320} cy={320} innerRadius={170} outerRadius={245} startAngle={i * 36} endAngle={(i + 1) * 36} label={`${i + 1}-KUN`} />
               ))}

               {/* Flow Indicator */}
               <path d="M 320,140 A 180,180 0 0,1 500,320" fill="none" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
            </svg>

            {/* THE CENTRAL BADGE (The Jewel) */}
            <div className="absolute w-[280px] h-[280px] md:w-[320px] md:h-[320px] z-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[12px] border-white/50 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_10px_20px_rgba(255,255,255,0.8)]"></div>
              
              <div className="relative w-[236px] h-[226px] md:w-[276px] md:h-[276px] bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 rounded-full shadow-[inset_0_-20px_40px_rgba(0,0,0,0.8),0_30px_60px_rgba(0,0,0,0.6)] border border-slate-700 flex flex-col items-center justify-center p-8 group overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/40 rounded-full blur-[60px] mix-blend-screen"></div>
                
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-indigo-500/30 border-t-indigo-400"></motion.div>
                
                <div className="relative z-10 w-24 h-24 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                  <Fingerprint className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" strokeWidth={1.2} />
                </div>
                
                <h3 className="relative z-10 text-center">
                  <span className="block text-[11px] font-black tracking-[0.5em] text-indigo-300 mb-2 opacity-80 uppercase">Tashkilot</span>
                  <span className="block text-3xl font-black uppercase tracking-tighter text-white drop-shadow-2xl leading-none">Tasdiqlangan</span>
                </h3>
              </div>
            </div>
          </div>

          {/* INFOGRAPHIC CARDS - MOVED BELOW */}
          <div className="w-full max-w-6xl z-20 space-y-10 mt-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "Ekspert Bazasi", desc: "Faqatgina mutaxassislar tomonidan tekshirilgan, kaloriya va vitaminlar balansi hisoblangan taomnoma ruxsat etiladi." },
                { icon: Lock, color: "text-rose-500", bg: "bg-rose-50", label: "Qat'iy Blokirovka", desc: "Hujjatdan tashqari har qanday qo'shimcha mahsulot yoki o'zboshimchalik bilan taom qo'shish avtomatik bloklanadi." }
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                  className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-white/90 hover:shadow-[0_40px_100px_rgba(79,70,229,0.15)] transition-all duration-700 group h-full"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
                     <div className={`w-20 h-20 rounded-[2.2rem] ${card.bg} border-2 border-white flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700`}>
                        <card.icon className={`w-10 h-10 ${card.color}`} strokeWidth={1.5} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{card.label}</h4>
                        <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{card.desc}</p>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* LIVE STATUS CARD */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="mt-6 bg-slate-900 p-2 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_5s_linear_infinite] opacity-30"></div>
               <div className="relative bg-slate-900/95 backdrop-blur-3xl p-8 px-10 rounded-[3.2rem] flex items-center justify-between border border-slate-700/50">
                  <div className="flex items-center gap-6">
                    <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                       <Activity className="w-8 h-8 text-emerald-400" />
                       <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-10"></div>
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2">Tizim holati</p>
                       <p className="text-white font-black text-3xl tracking-tighter">100% XAVFSIZ</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Live</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaomnomaNazorati;

