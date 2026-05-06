import React, { useState } from 'react';
import { UserCircle, Lock, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginSection: React.FC = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isParent, setIsParent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login for demo purposes
    setTimeout(() => {
      setLoading(false);
      alert('Tizimga kirish xizmati tez kunda ishga tushiriladi.');
    }, 1500);
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 p-12 md:p-16 space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-16 -mb-16 opacity-40"></div>

        <div className="text-center space-y-4 relative z-10">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform duration-500">
             <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Tizimga <span className="text-indigo-600 italic">Kirish</span>
          </h2>
          <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Boshqaruv Paneli</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Login</label>
            <div className="relative group">
              <input 
                type="text" 
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                required
                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-3xl py-5 px-8 pl-14 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                placeholder="Loginni kiriting"
              />
              <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Parol</label>
            <div className="relative group">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-3xl py-5 px-8 pl-14 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                placeholder="********"
              />
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
            </div>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                id="isParent" 
                checked={isParent}
                onChange={(e) => setIsParent(e.target.checked)}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 transition-all checked:bg-indigo-600 checked:border-indigo-600" 
              />
              <svg className="absolute h-6 w-6 pointer-events-none hidden peer-checked:block text-white p-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <label htmlFor="isParent" className="text-sm font-bold text-slate-500 cursor-pointer select-none">Ota-ona sifatida kirish</label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-[2rem] py-6 font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
              <>
                TIZIMGA KIRISH 
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-8 border-t border-slate-100 relative z-10">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-relaxed">
             QASHQADARYO VILOYATI <br/> MAKTABGACHA TA'LIM TIZIMI
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSection;
