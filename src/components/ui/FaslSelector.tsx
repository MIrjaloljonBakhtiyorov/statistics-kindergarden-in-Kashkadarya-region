import React from 'react';
import { Snowflake, Flower2, Sun, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface Fasl {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
  activeColor: string;
  shadow: string;
}

const fasllar: Fasl[] = [
  { 
    id: 'winter', 
    name: 'QISH', 
    icon: Snowflake, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50',
    activeColor: 'bg-blue-500',
    shadow: 'shadow-blue-200'
  },
  { 
    id: 'spring', 
    name: 'BAHOR', 
    icon: Flower2, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    activeColor: 'bg-rose-500',
    shadow: 'shadow-rose-200'
  },
  { 
    id: 'summer', 
    name: 'YOZ', 
    icon: Sun, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50',
    activeColor: 'bg-amber-500',
    shadow: 'shadow-amber-200'
  },
  { 
    id: 'autumn', 
    name: 'KUZ', 
    icon: Leaf, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50',
    activeColor: 'bg-emerald-500',
    shadow: 'shadow-emerald-200'
  },
];

interface FaslSelectorProps {
  activeFasl: string;
  setActiveFasl: (id: string) => void;
}

const FaslSelector: React.FC<FaslSelectorProps> = ({ activeFasl, setActiveFasl }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-10">
      {fasllar.map((fasl) => {
        const isActive = activeFasl === fasl.id;
        return (
          <motion.button
            key={fasl.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFasl(fasl.id)}
            className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] font-black transition-all duration-500 ${
              isActive 
                ? `${fasl.activeColor} text-white shadow-2xl ${fasl.shadow} scale-105` 
                : `${fasl.bg} ${fasl.color} hover:shadow-xl border-2 border-transparent hover:border-white`
            }`}
          >
            <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
              <fasl.icon className={`w-6 h-6 ${isActive ? 'text-white' : fasl.color}`} strokeWidth={2.5} />
            </div>
            <span className="text-sm tracking-[0.2em] font-black uppercase">{fasl.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default FaslSelector;
export { fasllar };
