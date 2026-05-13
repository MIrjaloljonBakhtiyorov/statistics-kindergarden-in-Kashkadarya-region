import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldCheck, Lock, Mail, Loader2, ChevronRight, X, Building2, UserCircle } from 'lucide-react';

interface AdminLoginProps {
  onClose?: () => void;
}

type LoginType = 'stat' | 'kinderflow';

const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedLogin = login.trim();
    const trimmedPassword = password.trim();

    try {
      // --- STATISTIKA TIZIMI UCHUN ---
      if (trimmedLogin === 'm_login' && trimmedPassword === 'm_admin') {
        localStorage.setItem('isDemoAuth', 'true');
        if (onClose) onClose();
        else window.location.replace('/admin/');
        return;
      }

      await signInWithEmailAndPassword(auth, trimmedLogin, trimmedPassword);
      if (onClose) onClose();
      else window.location.replace('/admin/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError('Login formatini noto‘g‘ri (email bo‘lishi kerak)');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Login yoki parol noto‘g‘ri');
      } else {
        setError(err.message || 'Xatolik yuz berdi');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col lg:flex-row bg-[#f8fafc] font-sans overflow-x-hidden">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[110] p-3 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/30 transition-all active:scale-95"
        >
          <X size={24} />
        </button>
      )}
      
      {/* Chap tomon: Vizual qism (Responsive Background) - 55% */}
      <div className="relative w-full lg:w-[55%] min-h-[30vh] lg:min-h-screen bg-[#0f172a] flex items-end">
        <img 
          src="/login-bg-2.png" 
          alt="Modern Kindergarten" 
          className="absolute inset-0 w-full h-full object-cover object-top lg:object-top transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 lg:via-transparent to-black/20"></div>
        
        <div className="relative z-10 p-6 sm:p-10 lg:p-16 xl:p-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-indigo-500/20 backdrop-blur-md rounded-xl border border-white/20 text-white text-[9px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 shadow-2xl">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
              </span>
              Tizim onlayn
            </div>

            <h2 className="text-xl sm:text-4xl xl:text-6xl font-black text-white mb-2 sm:mb-6 leading-tight drop-shadow-2xl">
              Zamonaviy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">MTT</span> <br className="hidden xs:block"/> 
              Boshqaruv Tizimi
            </h2>
            
            <div className="hidden xs:flex items-start gap-4 p-4 sm:p-6 lg:p-8 bg-white/5 backdrop-blur-3xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <p className="text-white text-xs sm:text-lg lg:text-xl leading-relaxed font-medium">
                Qashqadaryo viloyati Maktabgacha boshqarmasi boshqaruv va monitoring platformasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* O'ng tomon: Login Formasi - 45% */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-20 bg-slate-50 min-h-[60vh] lg:min-h-screen">
        <div className="max-w-md w-full">
          <div className="mb-6 sm:mb-8 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-xl sm:rounded-2xl shadow-2xl shadow-indigo-600/30 shrink-0">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  Kashkadarya
                </h1>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] mt-1">
                  MTT Management System
                </p>
              </div>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Xush kelibsiz!</h3>
            <p className="text-slate-500 font-medium mt-1 sm:mt-2 text-xs sm:text-base">Statistika tizimiga kirish uchun ma'lumotlaringizni kiriting</p>
          </div>

          <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-3 px-1">Login</label>
                <div className="relative group">
                  <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-11 sm:pl-14 pr-4 sm:pr-6 text-slate-900 font-semibold text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                    placeholder="m_login (yoki email)"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-3 px-1">Parol</label>
                <div className="relative group">
                  <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-11 sm:pl-14 pr-4 sm:pr-6 text-slate-900 font-semibold text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[11px] sm:text-xs font-bold p-3 sm:p-4 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 transform active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Tizimga kirish</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 sm:mt-10 text-center text-slate-400 font-medium">
            <p className="text-[9px] sm:text-xs leading-relaxed">
              &copy; 2026 Qashqadaryo VMMB. <br/>
              <span className="text-slate-300 font-bold uppercase tracking-widest text-[7px] sm:text-[9px] mt-1 block">
                Platforma v2.0
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
