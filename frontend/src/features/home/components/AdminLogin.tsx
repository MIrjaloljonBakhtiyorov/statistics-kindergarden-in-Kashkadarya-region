import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Mail, Loader2, ChevronRight } from 'lucide-react';
import { apiClient } from '@/shared/api';

interface AdminLoginProps {
  onClose?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reservePanelTab = () => {
    const panelTab = window.open('about:blank', '_blank');

    if (panelTab) {
      try {
        panelTab.opener = null;
        panelTab.document.title = 'Panel ochilmoqda...';
        panelTab.document.body.innerHTML = '<p style="font-family: system-ui; padding: 24px;">Panel ochilmoqda...</p>';
      } catch {
        // The tab is still usable even if the browser blocks document writes.
      }
    }

    return panelTab;
  };

  const openPanel = (panelTab: Window | null, path: string) => {
    const url = new URL(path, window.location.origin).toString();

    if (panelTab && !panelTab.closed) {
      panelTab.location.href = url;
      return;
    }

    window.location.assign(path);
  };

  const closeReservedTab = (panelTab: Window | null) => {
    if (panelTab && !panelTab.closed) {
      panelTab.close();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedLogin = login.trim();
    const trimmedPassword = password.trim();
    const panelTab = reservePanelTab();

    try {
      if (trimmedLogin === 'm_login' && trimmedPassword === 'm_admin') {
        localStorage.removeItem('auth_user');
        localStorage.setItem('isDemoAuth', 'true');
        openPanel(panelTab, '/admin/');
        onClose?.();
        return;
      }

      const openKindergartenPanel = (userData: any) => {
        const kindergartenId = userData.kindergarten_id || userData.id;
        const role = String(userData.role || 'DIRECTOR').toLowerCase();

        localStorage.removeItem('isDemoAuth');
        localStorage.setItem('auth_user', JSON.stringify(userData));
        openPanel(panelTab, `/kindergarten/${kindergartenId}/${role}`);
      };

      try {
        const kindergartenResponse = await apiClient.post('/auth/login', {
          login: trimmedLogin,
          password: trimmedPassword,
        });
        openKindergartenPanel(kindergartenResponse.data);
        return;
      } catch (kindergartenError) {
        // If this is not a kindergarten account, keep checking the other login types.
      }

      try {
        const parentResponse = await apiClient.post('/auth/parent-login', {
          login: trimmedLogin,
          password: trimmedPassword,
        });
        openKindergartenPanel(parentResponse.data);
        return;
      } catch (parentError) {
        // If this is not a parent account, fall back to statistics admin auth.
      }

      if (!trimmedLogin.includes('@')) {
        throw new Error("Login yoki parol noto'g'ri");
      }

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../../../lib/firebase');
      await signInWithEmailAndPassword(auth, trimmedLogin, trimmedPassword);
      localStorage.removeItem('auth_user');
      openPanel(panelTab, '/admin/');
      onClose?.();
    } catch (err: any) {
      closeReservedTab(panelTab);
      if (err.code === 'auth/invalid-email') {
        setError(t('adminLogin.invalidEmail'));
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(t('adminLogin.invalidCredentials'));
      } else {
        setError(err.message || t('adminLogin.error'));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col lg:flex-row bg-[#f8fafc] font-sans overflow-x-hidden">
      <div className="relative w-full lg:w-[55%] min-h-[30vh] lg:min-h-screen bg-[#0f172a] flex items-end">
        <img
          src="/login-bg-1.png"
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
              {t('adminLogin.online')}
            </div>

            <h2 className="text-xl sm:text-4xl xl:text-6xl font-black text-white mb-2 sm:mb-6 leading-tight drop-shadow-2xl">
              {t('adminLogin.heroTitlePrefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">MTT</span> <br className="hidden xs:block" />
              {t('adminLogin.heroTitleSuffix')}
            </h2>

            <div className="hidden xs:flex items-start gap-4 p-4 sm:p-6 lg:p-8 bg-white/5 backdrop-blur-3xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <p className="text-white text-xs sm:text-lg lg:text-xl leading-relaxed font-medium">
                {t('adminLogin.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-20 bg-slate-50 min-h-[60vh] lg:min-h-screen">
        <div className="max-w-md w-full">
          <div className="mb-6 sm:mb-8 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-xl sm:rounded-2xl shadow-2xl shadow-indigo-600/30 shrink-0">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  {t('adminLogin.brandRegion')}
                </h1>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] mt-1">
                  {t('adminLogin.managementSystem')}
                </p>
              </div>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{t('adminLogin.welcome')}</h3>
            <p className="text-slate-500 font-medium mt-1 sm:mt-2 text-xs sm:text-base">{t('adminLogin.prompt')}</p>
          </div>

          <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-3 px-1">{t('login.loginLabel')}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="text"
                    autoComplete="username"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-11 sm:pl-14 pr-4 sm:pr-6 text-slate-900 font-semibold text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                    placeholder="m_login (yoki email)"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-3 px-1">{t('login.passwordLabel')}</label>
                <div className="relative group">
                  <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-11 sm:pl-14 pr-4 sm:pr-6 text-slate-900 font-semibold text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                    placeholder="********"
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
                    <span className="text-sm sm:text-base">{t('login.submit')}</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 sm:mt-10 text-center text-slate-400 font-medium">
            <p className="text-[9px] sm:text-xs leading-relaxed">
              &copy; 2026 Qashqadaryo VMMB. <br />
              <span className="text-slate-300 font-bold uppercase tracking-widest text-[7px] sm:text-[9px] mt-1 block">
                {t('adminLogin.platform')}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

