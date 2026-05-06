import React from 'react';
import { motion } from 'motion/react';
import { LogIn, School, Star, ShieldCheck, Zap, ArrowRight, MousePointer2 } from 'lucide-react';
import RotatingFoodMenu from './ui/RotatingFoodMenu';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-12 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-64 -left-64 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 150, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl w-full bg-white/70 backdrop-blur-3xl rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-white/50 relative z-10"
      >
        {/* Left Side: Content */}
        <div className="flex-1 p-8 md:p-20 flex flex-col justify-center space-y-12">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-indigo-600/10 text-indigo-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Star className="w-3 h-3 fill-indigo-600" />
              Qashqadaryo Viloyati
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter"
            >
              RAQAMLI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">MTT TIZIMI</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-500 text-lg md:text-2xl font-medium max-w-lg leading-relaxed"
            >
              Maktabgacha ta’lim tashkilotlari faoliyatini raqamlashtirish va tizimli monitoring platformasi.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-xs uppercase tracking-widest">Tezkor Analitika</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-vaqt rejimida</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-xs uppercase tracking-widest">Xavfsiz Tizim</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Yuqori himoya</p>
              </div>
            </div>
          </motion.div>

          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            onClick={onEnter}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center justify-between px-10 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl uppercase tracking-widest transition-all shadow-2xl hover:shadow-indigo-500/40 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-4">
              TIZIMGA KIRISH <MousePointer2 className="w-6 h-6 animate-bounce" />
            </span>
            <div className="relative z-10 bg-white/20 p-3 rounded-2xl group-hover:bg-white/40 transition-colors">
              <ArrowRight className="h-6 w-6" />
            </div>
          </motion.button>
        </div>

        {/* Right Side: Visual Design */}
        <div className="flex-1 bg-slate-900 relative min-h-[700px] hidden md:block overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1631&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-slate-900 to-slate-900"></div>
          
          {/* Animated Orbitals */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/10 rounded-full"
          />

          {/* Rotating Menu Integration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 opacity-40">
            <RotatingFoodMenu />
          </div>

          <div className="absolute inset-0 p-16 flex flex-col justify-between text-white z-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                <School className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="font-black text-3xl leading-none tracking-tighter">RAQAMLI MTT</p>
                <p className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest mt-2">Hududiy monitoring tizimi</p>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/40 transition-colors"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-black text-sm uppercase tracking-widest text-indigo-300">Innovatsiya</p>
                </div>
                <p className="text-2xl font-black leading-tight tracking-tight">
                  "Maktabgacha ta'lim tizimini raqamlashtirishda yangi texnologik qadam."
                </p>
              </motion.div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-400">
                      U{i}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                    +1k
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Version 2.0 &bull; 2026</p>
              </div>
            </div>
          </div>

          <motion.img 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 0.9, scale: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            src="/welcome_image.png" 
            alt="Welcome Mascot" 
            className="absolute bottom-0 right-0 w-[65%] h-auto object-contain select-none pointer-events-none z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;

