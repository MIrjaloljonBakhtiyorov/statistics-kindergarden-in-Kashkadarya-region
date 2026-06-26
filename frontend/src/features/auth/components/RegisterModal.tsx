import { ArrowLeft, CheckCircle, Lock, Mail, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { districts, universities } from "../../home/data/siteData";
import type { ParticipationType } from "../../../shared/types";

type RegisterModalProps = {
  onClose: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function RegisterModal({ onClose }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [participationType, setParticipationType] = useState<ParticipationType>("university");
  const [institution, setInstitution] = useState("");
  const [region, setRegion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Ism va familiyani kiriting");
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
      setIsSubmitting(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Parollar bir xil emas");
      setIsSubmitting(false);
      return;
    }
    if (participationType === "university" && !institution) {
      setError("OTM ni tanlang");
      setIsSubmitting(false);
      return;
    }
    if ((participationType === "independent" || participationType === "team") && !region) {
      setError("Tuman/Shaharni tanlang");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          participationType,
          institution: participationType === "university" ? institution : "",
          region: participationType !== "university" ? region : ""
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Ro'yxatdan o'tishda xatolik yuz berdi");
      }

      localStorage.setItem("userData", JSON.stringify(payload.data));
      localStorage.setItem(
        "profileUser",
        JSON.stringify({
          id: payload.data.id,
          firstName: payload.data.firstName,
          lastName: payload.data.lastName,
          email: payload.data.email,
          role: "participant"
        })
      );
      onClose();
      navigate(`/profile/${payload.data.id}/overview`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <section
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-sky-300/25 bg-slate-950/95 p-6 text-white shadow-[0_32px_100px_rgba(0,0,0,0.5)] sm:p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Yopish tugmasi */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-sky-300/35 hover:text-white"
          aria-label="Yopish"
        >
          <X size={19} />
        </button>

        {/* Progress bar */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`h-2 w-20 rounded-full transition-all ${step >= 1 ? "bg-blue-500" : "bg-slate-700"}`} />
          <div className={`h-2 w-20 rounded-full transition-all ${step >= 2 ? "bg-blue-500" : "bg-slate-700"}`} />
        </div>

        {/* ─── 1-qadam: Ism & Familiya ─── */}
        {step === 1 && (
          <>
            <div className="mb-6 pr-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300">
                <User size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white">Ro'yxatdan o'tish</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ism va familiyangizni kiriting
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Ismingiz</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ism"
                  required
                  className="min-h-[56px] w-full rounded-lg border border-sky-300/25 bg-slate-900/70 px-4 text-base font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-sky-300/70"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Familiyangiz</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Familiya"
                  required
                  className="min-h-[56px] w-full rounded-lg border border-sky-300/25 bg-slate-900/70 px-4 text-base font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-sky-300/70"
                />
              </label>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex min-h-[58px] w-full items-center justify-center rounded-lg border border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 text-lg font-black text-white shadow-[0_22px_56px_rgba(37,99,235,0.32)] transition hover:shadow-[0_26px_70px_rgba(37,99,235,0.42)]"
              >
                Davom etish
              </button>
            </form>
          </>
        )}

        {/* ─── 2-qadam: Email, Parol, Ishtirok turi ─── */}
        {step === 2 && (
          <>
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); }}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Orqaga
            </button>

            <div className="mb-6 pr-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-400/10 text-purple-300">
                <User size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white">Profil ma'lumotlari</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Email va parol orqali profilingizni tasdiqlang
              </p>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-5">
              {/* Ism ko'rsatish */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-300">
                  <strong>{firstName} {lastName}</strong>
                </p>
              </div>

              {/* Email */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Email</span>
                <div className="flex min-h-[56px] items-center gap-3 rounded-lg border border-sky-300/25 bg-slate-900/70 px-4 transition focus-within:border-sky-300/70">
                  <Mail size={20} className="shrink-0 text-sky-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </label>

              {/* Parol */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Parol</span>
                <div className="flex min-h-[56px] items-center gap-3 rounded-lg border border-sky-300/25 bg-slate-900/70 px-4 transition focus-within:border-sky-300/70">
                  <Lock size={20} className="shrink-0 text-sky-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 8 ta belgi"
                    required
                    minLength={8}
                    className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </label>

              {/* Parolni tasdiqlash */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Parolni tasdiqlash</span>
                <div className="flex min-h-[56px] items-center gap-3 rounded-lg border border-sky-300/25 bg-slate-900/70 px-4 transition focus-within:border-sky-300/70">
                  <Lock size={20} className="shrink-0 text-sky-300" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Parolni qayta kiriting"
                    required
                    minLength={8}
                    className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </label>

              {/* Ishtirok turi */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">Ishtirok turi</label>
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                  {(["university", "independent", "team"] as ParticipationType[]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setParticipationType(val); setInstitution(""); setRegion(""); }}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        participationType === val ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {val === "university" ? "OTM" : val === "independent" ? "Mustaqil" : "Jamoa"}
                    </button>
                  ))}
                </div>
              </div>

              {/* OTM tanlash */}
              {participationType === "university" && (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-200">OTM</span>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    required
                    className="min-h-[48px] w-full rounded-lg border border-sky-300/25 bg-slate-900/70 px-4 text-white outline-none transition focus:border-sky-300/70"
                  >
                    <option value="">Tanlang</option>
                    {universities.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </label>
              )}

              {/* Tuman tanlash */}
              {(participationType === "independent" || participationType === "team") && (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-200">Tuman/Shahar</span>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                    className="min-h-[48px] w-full rounded-lg border border-sky-300/25 bg-slate-900/70 px-4 text-white outline-none transition focus:border-sky-300/70"
                  >
                    <option value="">Tanlang</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
              )}

              {/* Shartlar */}
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" required className="h-5 w-5 accent-blue-600" />
                <span className="text-sm text-slate-300">Foydalanish shartlariga roziman</span>
              </label>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 text-lg font-black text-white shadow-[0_22px_56px_rgba(37,99,235,0.32)] transition hover:shadow-[0_26px_70px_rgba(37,99,235,0.42)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle size={20} />
                {isSubmitting ? "Saqlanmoqda..." : "Ro'yxatdan o'tish"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
