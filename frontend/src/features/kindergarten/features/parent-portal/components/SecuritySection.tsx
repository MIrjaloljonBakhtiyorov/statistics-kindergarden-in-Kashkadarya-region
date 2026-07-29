import React, { useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Lock,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User
} from 'lucide-react';
import { motion } from 'motion/react';

export const SecuritySection = ({ credentials, setCredentials, isSaving, onUpdate }: any) => {
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passwordStrength = credentials.newPassword.length === 0
    ? 0
    : credentials.newPassword.length < 6
      ? 1
      : credentials.newPassword.length < 10
        ? 2
        : 3;

  const strengthLabel = ['Bo\'sh', 'Zaif', 'Yaxshi', 'Kuchli'];
  const strengthColor = ['bg-slate-200', 'bg-rose-400', 'bg-pink-400', 'bg-fuchsia-500'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-4">
      <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-r from-white via-rose-50/70 to-pink-50/80 p-5 shadow-sm md:p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-rose-500"></div>
        <div className="pointer-events-none absolute right-8 top-5 h-24 w-24 rounded-full border border-rose-200/70"></div>
        <div className="pointer-events-none absolute -right-10 -bottom-12 h-32 w-32 rounded-full bg-pink-100/70 blur-2xl"></div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-rose-100 bg-white text-rose-500 shadow-sm">
              <ShieldCheck size={26} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[24px] font-extrabold leading-tight text-brand-depth md:text-[30px]">Xavfsizlik markazi</h4>
              <p className="mt-1 text-[13px] font-medium text-brand-muted md:text-sm">
                Login va parolni yangilab, ota-ona portaliga kirishni nazorat qiling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <ShieldAlert size={19} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-semibold text-brand-muted">Xavfsizlik darajasi</p>
              <p className="text-lg font-extrabold text-brand-depth">{strengthLabel[passwordStrength]}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onUpdate} className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-white p-4 shadow-sm md:p-5">
            <div className="pointer-events-none absolute right-6 top-6 opacity-[0.035]">
              <Lock size={130} />
            </div>

            <div className="relative z-10 space-y-5">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[12px] font-bold text-brand-depth">Login / username</label>
                  <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
                    Tizimga kirish uchun
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 transition-all group-focus-within:bg-rose-100">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={credentials.login}
                    onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                    className="w-full rounded-3xl border border-brand-border bg-slate-50 py-4 pl-16 pr-5 text-[16px] font-bold text-brand-depth outline-none transition-all focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2.5">
                  <label className="text-[12px] font-bold text-brand-depth">Yangi parol</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-pink-100 bg-pink-50 text-pink-500 transition-all group-focus-within:bg-pink-100">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={credentials.newPassword}
                      onChange={(e) => setCredentials({ ...credentials, newPassword: e.target.value })}
                      placeholder="Parol kiriting"
                      className="w-full rounded-3xl border border-brand-border bg-slate-50 py-4 pl-16 pr-14 text-[16px] font-bold text-brand-depth outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl text-brand-muted transition-colors hover:bg-rose-50 hover:text-rose-500"
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[12px] font-bold text-brand-depth">Parolni tasdiqlash</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-fuchsia-100 bg-fuchsia-50 text-fuchsia-500 transition-all group-focus-within:bg-fuchsia-100">
                      <Key size={18} />
                    </div>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={credentials.confirmPassword}
                      onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                      placeholder="Qayta kiriting"
                      className="w-full rounded-3xl border border-brand-border bg-slate-50 py-4 pl-16 pr-14 text-[16px] font-bold text-brand-depth outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl text-brand-muted transition-colors hover:bg-rose-50 hover:text-rose-500"
                    >
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-bold text-brand-depth">Parol kuchi</p>
                    <p className="mt-0.5 text-[12px] font-medium text-brand-muted">Kamida 6 ta belgi tavsiya etiladi.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${passwordStrength === 0 ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'}`}>
                    {strengthLabel[passwordStrength]}
                  </span>
                </div>
                <div className="grid h-2 grid-cols-3 gap-2">
                  <div className={`rounded-full transition-all duration-500 ${passwordStrength >= 1 ? strengthColor[1] : 'bg-slate-200'}`} />
                  <div className={`rounded-full transition-all duration-500 ${passwordStrength >= 2 ? strengthColor[2] : 'bg-slate-200'}`} />
                  <div className={`rounded-full transition-all duration-500 ${passwordStrength >= 3 ? strengthColor[3] : 'bg-slate-200'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-white text-amber-600">
              <AlertCircle size={21} />
            </div>
            <h5 className="text-lg font-extrabold leading-tight text-brand-depth">Muhim eslatma</h5>
            <p className="mt-2 text-[13px] font-semibold leading-relaxed text-amber-900/80">
              Login o'zgartirilsa, keyingi kirishda aynan yangi login ishlatiladi. Yangi parolni eslab qoling va uni boshqa odamlar bilan ulashmang.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-rose-600">
              <Sparkles size={18} />
              <p className="text-[13px] font-extrabold text-brand-depth">Tavsiya</p>
            </div>
            <p className="text-[13px] font-medium leading-relaxed text-brand-muted">
              Parolni ism, telefon raqami yoki tug'ilgan sana kabi oson topiladigan ma'lumotlardan tuzmang.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-4 text-[13px] font-extrabold text-white shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-shimmer" />
            {isSaving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            ) : (
              <>
                <Save size={19} className="transition-transform group-hover:rotate-12" />
                Saqlash va yangilash
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
