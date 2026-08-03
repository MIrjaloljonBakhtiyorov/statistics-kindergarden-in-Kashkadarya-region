import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, Save, ShieldCheck, User, WandSparkles } from 'lucide-react';

interface ParentEditModalProps {
  parent: any;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}

export const ParentEditModal: React.FC<ParentEditModalProps> = ({ parent, onClose, onSave }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const createStrongPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%&*?';
    const allChars = upper + lower + numbers + special;
    const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
    const nextPassword = [
      pick(upper),
      pick(lower),
      pick(numbers),
      pick(special),
      ...Array.from({ length: 8 }, () => pick(allChars)),
    ].sort(() => Math.random() - 0.5).join('');

    setPassword(nextPassword);
    setConfirmPassword(nextPassword);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    setIsSubmitting(true);
    try {
      await onSave(parent.id, {
        password,
        updatedByRole: 'OPERATOR',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/20">
      <div className="bg-white w-full max-w-md rounded-[10px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-brand-depth">Ota-ona parolini yangilash</h3>
            <p className="text-xs font-bold text-brand-muted mt-1 uppercase tracking-widest">{parent.childName} ota-onasi</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white border border-brand-border rounded-full flex items-center justify-center text-brand-depth hover:bg-rose-50 hover:text-rose-500 hover:rotate-90 transition-all active:scale-95"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Login / username</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
                <User size={16} />
              </div>
              <input 
                type="text"
                value={parent.login || ''}
                readOnly
                className="w-full cursor-not-allowed bg-slate-100 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-brand-depth outline-none"
              />
            </div>
            <p className="text-[10px] text-brand-muted font-bold ml-1">Login doimiy, operator faqat parolni almashtiradi.</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-primary">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-brand-depth">Operator ruxsati</p>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-brand-muted">
                  Admin/operator ota-ona parolini eski parolsiz yangilashi mumkin. Parolga cheklov qo'yilmaydi.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Yangi parol</label>
              <button
                type="button"
                onClick={createStrongPassword}
                className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-primary hover:bg-emerald-50"
              >
                <WandSparkles size={13} />
                Yaratish
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-brand-depth focus:border-brand-primary focus:bg-white transition-all outline-none"
                placeholder="Kuchli parol kiriting"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-depth"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Parolni tasdiqlash</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
                <KeyRound size={16} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-brand-depth focus:border-brand-primary focus:bg-white transition-all outline-none"
                placeholder="Yangi parolni qayta kiriting"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-depth"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className={`rounded-xl px-3 py-2 text-[10px] font-black ${password ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-brand-muted'}`}>
              {password ? '+' : '-'} Parol kiritildi
            </div>
            <div className={`rounded-xl px-3 py-2 text-[10px] font-black ${passwordsMatch ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-brand-muted'}`}>
              {passwordsMatch ? '+' : '-'} Parollar mos
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !passwordsMatch}
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Saqlash
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
