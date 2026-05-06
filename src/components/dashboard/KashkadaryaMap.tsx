import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  MapPin, Info, Users, School, TrendingUp, X, CheckCircle2, 
  Activity, Target, Shield, Search, Cloud, Clock, Terminal, 
  AlertCircle, Maximize2, Globe, Radar, Cpu
} from 'lucide-react';
import { districts } from '../../constants';
import DistrictModal from '../modals/DistrictModal';

interface KashkadaryaMapProps {
  selectedDistrict: string | null;
  setSelectedDistrict: (name: string | null) => void;
}

const KashkadaryaMap: React.FC<KashkadaryaMapProps> = ({ selectedDistrict, setSelectedDistrict }) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeLayer, setActiveLayer] = useState<'borders' | 'standard' | 'sat'>('borders');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logs, setLogs] = useState<string[]>(['Sektorlar sinxronizatsiyasi tugadi.', 'Hududiy ma\'lumotlar yangilandi.', '3D vizualizatsiya yuklandi.']);
  
  // Mouse Parallax values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-300, 300], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-500, 500], [-5, 5]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const logInterval = setInterval(() => {
      const msgs = ['Hududiy tahlil yangilanmoqda', 'Signal barqaror', 'Sektor 4: Yangi ma\'lumot', 'Monitoring 100%'];
      setLogs(prev => [msgs[Math.floor(Math.random() * msgs.length)], ...prev.slice(0, 4)]);
    }, 10000);
    return () => { clearInterval(timer); clearInterval(logInterval); };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const districtsData = useMemo(() => [
    { id: 1, name: 'Muborak t.', x: 22, y: 35, d: "M 5,25 L 20,20 L 35,28 L 38,45 L 25,50 L 10,45 Z" },
    { id: 2, name: 'Koson t.', x: 38, y: 22, d: "M 20,20 L 45,15 L 55,25 L 50,40 L 35,35 L 35,28 Z" },
    { id: 3, name: 'Ko\'kdala t.', x: 58, y: 18, d: "M 45,15 L 70,12 L 80,25 L 65,35 L 55,25 Z" },
    { id: 4, name: 'Chiroqchi t.', x: 75, y: 28, d: "M 70,12 L 95,20 L 92,40 L 75,45 L 65,35 L 80,25 Z" },
    { id: 5, name: 'Kitob t.', x: 88, y: 40, d: "M 92,40 L 98,50 L 95,65 L 82,60 L 75,45 Z" },
    { id: 6, name: 'Shahrisabz sh.', x: 76, y: 45, d: "M 74,43 L 78,43 L 78,47 L 74,47 Z" },
    { id: 7, name: 'Shahrisabz t.', x: 85, y: 65, d: "M 82,60 L 95,65 L 90,85 L 75,80 L 75,65 Z" },
    { id: 8, name: 'Yakkabog\' t.', x: 72, y: 60, d: "M 75,45 L 82,60 L 75,65 L 75,80 L 65,75 L 60,55 Z" },
    { id: 9, name: 'Qamashi t.', x: 60, y: 70, d: "M 50,40 L 65,35 L 75,45 L 60,55 L 65,75 L 50,85 L 45,60 Z" },
    { id: 10, name: 'Qarshi sh.', x: 48, y: 50, d: "M 46,48 L 50,48 L 50,52 L 46,52 Z" },
    { id: 11, name: 'Qarshi t.', x: 45, y: 60, d: "M 35,35 L 50,40 L 45,60 L 50,85 L 35,80 L 32,55 Z" },
    { id: 12, name: 'Kasbi t.', x: 28, y: 55, d: "M 35,35 L 32,55 L 30,75 L 15,65 L 25,50 L 38,45 Z" },
    { id: 13, name: 'Mirishkor t.', x: 15, y: 65, d: "M 5,25 L 10,45 L 15,65 L 10,90 L 2,60 Z" },
    { id: 14, name: 'Nishon t.', x: 30, y: 85, d: "M 10,90 L 30,95 L 45,90 L 50,85 L 35,80 L 30,75 L 15,65 Z" },
    { id: 15, name: 'G\'uzor t.', x: 60, y: 90, d: "M 50,85 L 75,80 L 85,90 L 60,98 L 45,90 Z" },
    { id: 16, name: 'Dehqonobod t.', x: 82, y: 88, d: "M 85,90 L 90,85 L 98,75 L 95,95 L 80,98 L 60,98 Z" },
  ], []);

  const getDistrictData = (name: string) => {
    return districts.find(s => s.name === name) || { count: 0, attendance: 0 };
  };

  const selectedData = selectedDistrict ? {
    ...districtsData.find(d => d.name === selectedDistrict),
    ...getDistrictData(selectedDistrict)
  } : null;

  return (
    <div className="w-full h-full flex flex-col group/map animate-in fade-in duration-1000" onMouseMove={handleMouseMove}>
      
      {/* Upper HUD */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden group">
                <MapPin className="w-8 h-8 text-indigo-500 group-hover:scale-125 transition-transform" />
                <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
             </div>
             <div>
               <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight max-w-2xl">
                 Qashqadaryoning hududiy yer maydoni <span className="text-indigo-600">tumanlar kesimida</span>
               </h2>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tizim holati: Stabil</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-100" />
              <div className="flex items-center gap-3">
                 <Cpu className="w-4 h-4 text-indigo-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yuklanish: 14%</span>
              </div>
           </div>
        </div>
      </div>

      <motion.div 
        style={{ rotateX, rotateY, perspective: 1500 }}
        className="relative w-full aspect-[16/9] bg-slate-950 rounded-[1%] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.6)] group/container"
      >
        {/* Geographic Image */}
        <div className="absolute inset-0">
          <img 
            src="/map-bg.png" 
            className={`w-full h-full object-cover transition-all duration-1000 ${activeLayer === 'borders' ? 'opacity-40 grayscale brightness-50 contrast-125' : activeLayer === 'sat' ? 'invert opacity-70 hue-rotate-180' : 'opacity-80'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-transparent to-slate-950/20" />
        </div>

        {/* Dynamic HUD Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        
        {/* SVG Vector Layer */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-20">
          <defs>
            <filter id="cyber-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Data Flow Lines (Connections to Qarshi) */}
          {districtsData.map(d => (
            d.name !== 'Qarshi sh.' && (
              <motion.path 
                key={`flow-${d.id}`}
                d={`M ${d.x},${d.y} Q ${(d.x + 48)/2},${(d.y + 50)/2 - 10} 48,50`}
                fill="none"
                stroke="white"
                strokeWidth="0.1"
                strokeDasharray="1 3"
                opacity="0.2"
              />
            )
          ))}

          {districtsData.map((d) => {
            const isHovered = hoveredId === d.id;
            const isSelected = selectedDistrict === d.name;
            const districtInfo = getDistrictData(d.name);

            return (
              <g 
                key={d.id}
                onMouseEnter={() => setHoveredId(d.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedDistrict(isSelected ? null : d.name)}
                className="cursor-pointer outline-none"
              >
                <motion.path
                  d={d.d}
                  initial={false}
                  animate={{
                    fill: isSelected ? "url(#cyber-grad)" : isHovered ? "rgba(99, 102, 241, 0.15)" : "transparent",
                    stroke: isSelected ? "#6366f1" : isHovered ? "#818cf8" : "rgba(255,255,255,0.15)",
                    strokeWidth: isSelected || isHovered ? 1 : 0.4,
                    filter: isSelected || isHovered ? "url(#cyber-glow)" : "none",
                  }}
                  transition={{ duration: 0.4 }}
                />

                <g pointerEvents="none">
                   <motion.text
                     x={d.x}
                     y={d.y}
                     textAnchor="middle"
                     className={`text-[2.2px] font-black uppercase tracking-widest transition-all duration-300 ${isSelected || isHovered ? 'fill-white' : 'fill-white/30'}`}
                   >
                     {d.name.replace(' t.', '').replace(' sh.', '')}
                   </motion.text>
                   {isSelected && (
                     <motion.circle 
                       cx={d.x} 
                       cy={d.y + 3} 
                       r="0.8" 
                       fill="#6366f1" 
                       initial={{ scale: 0 }} 
                       animate={{ scale: [1, 1.5, 1] }} 
                       transition={{ repeat: Infinity, duration: 2 }}
                     />
                   )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* District Modal Overlay */}
        <AnimatePresence>
          {hoveredId && (
            <DistrictModal 
              district={(() => {
                const d = districtsData.find(item => item.id === hoveredId);
                if (!d) return null;
                const stats = getDistrictData(d.name);
                return { name: d.name, ...stats };
              })()}
            />
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default KashkadaryaMap;