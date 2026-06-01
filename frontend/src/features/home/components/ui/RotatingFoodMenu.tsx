import React from 'react';
import { motion } from 'motion/react';
import { 
  Coffee, 
  Pizza, 
  Soup, 
  ChefHat, 
  UtensilsCrossed, 
  Dessert, 
  Beef, 
  Cake, 
  IceCream 
} from 'lucide-react';

const foodItems = [
  { icon: Pizza, label: 'Pizza', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Soup, label: 'Sho\'rva', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Coffee, label: 'Qahva', color: 'text-brown-500', bg: 'bg-stone-100' },
  { icon: UtensilsCrossed, label: 'Taom', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Dessert, label: 'Shirinlik', color: 'text-pink-500', bg: 'bg-pink-50' },
  { icon: Beef, label: 'Go\'sht', color: 'text-rose-600', bg: 'bg-rose-50' },
  { icon: Cake, label: 'Tort', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: IceCream, label: 'Muzqaymoq', color: 'text-sky-500', bg: 'bg-sky-50' },
];

const RotatingFoodMenu: React.FC = () => {
  const radius = 240; // Orbit radius

  return (
    <div className="relative w-[600px] h-[600px] flex items-center justify-center">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[480px] h-[480px] rounded-full border border-slate-200/50 dashed-border animate-[spin_60s_linear_infinite]" 
             style={{ borderStyle: 'dashed', borderWidth: '2px', borderDasharray: '10 10' }}></div>
        <div className="absolute w-[360px] h-[360px] rounded-full border border-slate-100/30"></div>
      </div>

      {/* Rotating Ring Container */}
      <motion.div 
        className="relative w-full h-full flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {foodItems.map((item, index) => {
          const angle = (index / foodItems.length) * (2 * Math.PI);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={index}
              className="absolute group"
              style={{
                x,
                y,
              }}
            >
              {/* Individual Card */}
              <motion.div
                className={`w-24 h-24 rounded-full ${item.bg} border-2 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 relative`}
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <item.icon className={`w-10 h-10 ${item.color} relative z-10`} strokeWidth={1.5} />
                
                {/* Label that appears on hover */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap uppercase tracking-widest">
                  {item.label}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Central Hub */}
      <div className="absolute z-20 w-44 h-44 bg-white rounded-full shadow-2xl border-4 border-slate-50 flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white"></div>
        <motion.div 
          className="relative z-10 flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-2 shadow-lg shadow-indigo-200">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">OSHPAZ</span>
          <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter">MENYUSI</span>
        </motion.div>
        
        {/* Decorative inner spinning ring */}
        <motion.div 
          className="absolute inset-2 rounded-full border-2 border-indigo-100 border-t-indigo-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default RotatingFoodMenu;
