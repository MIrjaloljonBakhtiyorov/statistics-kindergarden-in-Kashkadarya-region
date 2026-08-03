import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Key,
  Lock,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  User
} from 'lucide-react';

export const SecuritySection = ({ credentials, setCredentials, isSaving, onUpdate }: any) => {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passwordChecks = [
    { label: 'Kamida 8 ta belgi', valid: credentials.newPassword.length >= 8 },
    { label: 'Katta harf', valid: /[A-Z]/.test(credentials.newPassword) },
    { label: 'Kichik harf', valid: /[a-z]/.test(credentials.newPassword) },
    { label: 'Son', valid: /\d/.test(credentials.newPassword) },
    { label: 'Maxsus belgi', valid: /[^A-Za-z0-9]/.test(credentials.newPassword) },
  ];
  const passedChecks = passwordChecks.filter((item) => item.valid).length;
  const passwordStrength = credentials.newPassword.length === 0
    ? 0
    : passedChecks <= 2
      ? 1
      : passedChecks < 5
        ? 2
        : 3;

  const strengthLabel = ['Bo\'sh', 'Zaif', 'Yaxshi', 'Kuchli'];
  const strengthBadgeClass = [
    'border-slate-200 bg-slate-100 text-slate-500',
    'border-rose-100 bg-rose-50 text-rose-600',
    'border-amber-100 bg-amber-50 text-amber-700',
    'border-emerald-100 bg-emerald-50 text-emerald-700',
  ];
  const strengthBarClass = passwordStrength === 3
    ? 'from-emerald-400 to-teal-500'
    : passwordStrength === 2
      ? 'from-amber-400 to-orange-400'
      : passwordStrength === 1
        ? 'from-rose-400 to-pink-500'
        : 'from-slate-200 to-slate-200';
  const passwordStrengthPercent = Math.round((passedChecks / passwordChecks.length) * 100);

  const createStrongPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%&*?';
    const allChars = upper + lower + numbers + special;
    const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
    const password = [
      pick(upper),
      pick(lower),
      pick(numbers),
      pick(special),
      ...Array.from({ length: 8 }, () => pick(allChars)),
    ].sort(() => Math.random() - 0.5).join('');

    setCredentials({
      ...credentials,
      newPassword: password,
      confirmPassword: password,
    });
    setShowNewPass(true);
    setShowConfirmPass(true);
  };

  return (
    <div className="kg-parent-section space-y-4 pb-4 sm:space-y-5">
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
                    Doimiy login
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={credentials.login}
                    readOnly
                    aria-readonly="true"
                    className="w-full cursor-not-allowed rounded-3xl border border-brand-border bg-slate-100 py-4 pl-16 pr-5 text-[16px] font-bold text-brand-depth outline-none"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[12px] font-bold text-brand-depth">Eski parol</label>
                  <span className="rounded-full border border-amber-100 bg-white px-3 py-1 text-[11px] font-bold text-amber-700">
                    Parolni tasdiqlash uchun
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-amber-100 bg-white text-amber-600 transition-all group-focus-within:bg-amber-50">
                    <Key size={18} />
                  </div>
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={credentials.oldPassword}
                    onChange={(e) => setCredentials({ ...credentials, oldPassword: e.target.value })}
                    placeholder="Eski parolni kiriting"
                    className="w-full rounded-3xl border border-amber-100 bg-white py-4 pl-16 pr-14 text-[16px] font-bold text-brand-depth outline-none transition-all placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl text-brand-muted transition-colors hover:bg-amber-50 hover:text-amber-600"
                  >
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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

              <div className="overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-slate-50 to-rose-50/60 p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 shadow-sm">
                      <ShieldCheck size={21} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-extrabold text-brand-depth">Kuchli parol yaratish</p>
                      <p className="mt-1 max-w-xl text-[12px] font-semibold leading-relaxed text-brand-muted">
                        Parolda 8+ belgi, katta/kichik harf, son va maxsus belgi qatnashishi kerak.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={createStrongPassword}
                    className="flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 text-[11px] font-extrabold uppercase tracking-wide text-rose-600 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50"
                  >
                    <WandSparkles size={16} />
                    Generatsiya
                  </button>
                </div>

                <div className="mt-4 rounded-3xl border border-white bg-white/85 p-3.5 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[12px] font-extrabold text-brand-depth">Parol kuchi</p>
                      <p className="mt-0.5 text-[11px] font-bold text-brand-muted">{passedChecks}/5 talab bajarildi</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-extrabold ${strengthBadgeClass[passwordStrength]}`}>
                      {strengthLabel[passwordStrength]}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${strengthBarClass} transition-all duration-500`}
                      style={{ width: `${passwordStrengthPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {passwordChecks.map((item) => {
                    const Icon = item.valid ? CheckCircle2 : Circle;
                    return (
                      <div
                        key={item.label}
                        className={`flex min-h-[44px] items-center gap-2.5 rounded-2xl border px-3 text-[11px] font-extrabold transition-all ${
                          item.valid
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                            : 'border-slate-100 bg-white text-slate-500'
                        }`}
                      >
                        <Icon size={15} className="shrink-0" />
                        <span className="min-w-0">{item.label}</span>
                      </div>
                    );
                  })}
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
              Login / username doimiy qoladi. Yangi parolni eslab qoling va uni boshqa odamlar bilan ulashmang.
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
              <div className="h-5 w-5 rounded-full border-4 border-white/30 border-t-white" />
            ) : (
              <>
                <Save size={19} className="transition-transform group-hover:rotate-12" />
                Saqlash va yangilash
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
