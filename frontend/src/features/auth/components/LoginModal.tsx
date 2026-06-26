import { Eye, EyeOff, LockKeyhole, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginModalProps = {
  onClose: () => void;
  onRegisterClick?: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function LoginModal({ onClose, onRegisterClick }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Admin login check
    if (username === "mister_italiano" && password === "mister_italiano") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminUser", "mister_italiano");
      navigate("/admin");
      onClose();
      return;
    }

    if (!username || !password) {
      setError("Login va parolni kiriting");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Foydalanuvchi topilmadi yoki parol noto'g'ri");
      }

      localStorage.setItem(
        "profileUser",
        JSON.stringify({
          id: payload.data.id,
          firstName: payload.data.firstName,
          lastName: payload.data.lastName,
          email: payload.data.email,
          phone: payload.data.phone,
          role: payload.data.role
        })
      );
      navigate(`/profile/${payload.data.id}/overview`);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Foydalanuvchi topilmadi yoki parol noto'g'ri");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/[0.03] p-[5%] backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onMouseDown={onClose}
    >
      <section
        className="relative w-full max-w-[560px] rounded-[2px] border border-sky-300/25 bg-slate-950/95 p-6 text-white shadow-[0_32px_100px_rgba(0,0,0,0.42)] sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-sky-300/35 hover:text-white"
          aria-label="Modalni yopish"
        >
          <X size={19} />
        </button>

        <div className="pr-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-sky-400/10 text-sky-300">
            <LockKeyhole size={24} />
          </div>
          <h2 id="login-modal-title" className="mt-5 text-3xl font-black tracking-tight text-white">
            Kirish ma'lumotlari
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Telefon raqami va tizimda ro'yxatdan o'tgan parolingizni kiriting.
          </p>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleLogin}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Login / Telefon raqami</span>
            <div className="flex min-h-[56px] items-center gap-3 rounded-[2px] border border-sky-300/25 bg-slate-900/70 px-4 transition focus-within:border-sky-300/70">
              <Phone size={20} className="text-sky-300" />
              <input
                type="text"
                autoComplete="username"
                placeholder="Login yoki telefon raqam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Parol</span>
            <div className="flex min-h-[56px] items-center gap-3 rounded-[2px] border border-sky-300/25 bg-slate-900/70 px-4 transition focus-within:border-sky-300/70">
              <LockKeyhole size={20} className="text-sky-300" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ro'yxatdan o'tgan parolingiz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="rounded-[2px] p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-[2px] border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="rounded-[2px] border border-blue-500/20 bg-blue-500/8 p-3 text-xs text-blue-300">
            <strong>Admin:</strong> mister_italiano / mister_italiano
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 font-semibold text-slate-300">
              <input type="checkbox" className="h-4 w-4 rounded-[2px] border-sky-300/30 bg-slate-950 accent-sky-500" />
              Eslab qolish
            </label>
            <a href="#" className="font-bold text-sky-300 transition hover:text-sky-200">
              Parolni unutdingizmi?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-[2px] border border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 text-lg font-black text-white shadow-[0_22px_56px_rgba(37,99,235,0.32)] transition hover:shadow-[0_26px_70px_rgba(37,99,235,0.42)]"
          >
            <LockKeyhole size={20} />
            {isSubmitting ? "Kirilmoqda..." : "Tizimga kirish"}
          </button>
        </form>

        <div className="mt-6 rounded-[2px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
          Hali ro'yxatdan o'tmagan bo'lsangiz, avval ariza kabinetini yarating.
          <button 
            type="button"
            onClick={onRegisterClick} 
            className="ml-1 font-bold text-sky-300 hover:text-sky-200 transition"
          >
            Ro'yxatdan o'tish
          </button>
        </div>
      </section>
    </div>
  );
}
