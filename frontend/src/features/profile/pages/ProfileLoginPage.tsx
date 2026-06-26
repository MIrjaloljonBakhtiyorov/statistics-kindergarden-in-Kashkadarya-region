import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Phone, Trophy, ArrowLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function ProfileLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Telefon raqami va parolni kiriting");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: phone, password })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Telefon/email yoki parol noto'g'ri");
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Telefon/email yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03101f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Trophy size={22} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white leading-none">Qashqadaryo</p>
            <p className="text-xs text-[#718096]">Startup Ligasi — Shaxsiy kabinet</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.2)] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Kabinetga kirish</h1>
          <p className="text-sm text-[#aab6c9] mb-6">
            Telefon raqamingiz va parolingizni kiriting
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-[#aab6c9] mb-1.5">
                Telefon raqami <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl px-4 py-2.5 focus-within:border-blue-500/60 transition-colors">
                <Phone size={16} className="text-blue-400 flex-shrink-0" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#718096]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#aab6c9] mb-1.5">
                Parol <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl px-4 py-2.5 focus-within:border-blue-500/60 transition-colors">
                <LockKeyhole size={16} className="text-blue-400 flex-shrink-0" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Parolingiz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#718096]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-[#718096] hover:text-white transition-colors"
                  aria-label={showPwd ? "Yashirish" : "Ko'rsatish"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400" role="alert">
                {error}
              </div>
            )}

            {/* Demo hint */}
            <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              Email yoki profilingizdagi telefon raqam bilan kiring.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-60 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? "Kirilmoqda..." : "Tizimga kirish"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-5 flex items-center justify-between text-xs text-[#718096]">
            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Ro'yxatdan o'tish
            </Link>
            <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
              <ArrowLeft size={13} />
              Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
