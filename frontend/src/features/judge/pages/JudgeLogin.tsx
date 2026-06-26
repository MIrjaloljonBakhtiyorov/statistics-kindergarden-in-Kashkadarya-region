import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, LockKeyhole, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useJudgeAuth } from "../context/JudgeAuthContext";

export function JudgeLogin() {
  const { login, judge, loading } = useJudgeAuth();
  const navigate = useNavigate();
  const [loginVal, setLoginVal] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && judge) navigate("/judge/dashboard");
  }, [judge, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginVal || !password) { setError("Login va parolni kiriting"); return; }
    setSubmitting(true);
    try {
      await login(loginVal, password);
      navigate("/judge/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login yoki parol noto'g'ri");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #031326 0%, #071B33 50%, #0a2340 100%)",
      padding: 20, fontFamily: "'Inter', 'Manrope', system-ui, sans-serif"
    }}>
      {/* Background decoration */}
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none"
      }}>
        <div style={{
          position: "absolute", top: -200, right: -200, width: 600, height: 600,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(214,162,30,0.06) 0%, transparent 70%)"
        }} />
        <div style={{
          position: "absolute", bottom: -200, left: -200, width: 500, height: 500,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(7,27,51,0.8) 0%, transparent 70%)"
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #D6A21E, #b8850f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(214,162,30,0.35)"
          }}>
            <Trophy size={32} color="white" />
          </div>
          <div style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: "0.05em" }}>
            QASHQADARYO
          </div>
          <div style={{ color: "#D6A21E", fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", marginTop: 2 }}>
            STARTAP LIGASI
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8 }}>
            Hakamlar shaxsiy kabineti
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
          padding: "32px 36px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
            Tizimga kirish
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 28px", lineHeight: 1.5 }}>
            Administrator tomonidan berilgan login va parolni kiriting
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Login */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8 }}>
                Login
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "12px 16px", transition: "border-color 0.2s"
              }}
                onFocus={() => {}} // handled below via CSS workaround
              >
                <User size={18} color="#D6A21E" />
                <input
                  type="text"
                  value={loginVal}
                  onChange={e => setLoginVal(e.target.value)}
                  autoComplete="username"
                  placeholder="Hakam loginini kiriting"
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: "white", fontSize: 14, width: "100%",
                    caretColor: "#D6A21E"
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8 }}>
                Parol
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "12px 16px"
              }}>
                <LockKeyhole size={18} color="#D6A21E" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Parolni kiriting"
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: "white", fontSize: 14, flex: 1, caretColor: "#D6A21E"
                  }}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 2 }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: 8, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 8,
                color: "#FCA5A5", fontSize: 13
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting}
              style={{
                background: submitting ? "rgba(214,162,30,0.5)" : "linear-gradient(135deg, #D6A21E, #b8850f)",
                color: "white", fontWeight: 700, fontSize: 15,
                border: "none", borderRadius: 10, padding: "14px 24px",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: submitting ? "none" : "0 4px 16px rgba(214,162,30,0.35)",
                transition: "all 0.2s", marginTop: 4
              }}>
              <LockKeyhole size={18} />
              {submitting ? "Kirilmoqda..." : "Tizimga kirish"}
            </button>
          </form>

          <div style={{
            marginTop: 20, padding: "12px 14px",
            background: "rgba(7,27,51,0.5)", borderRadius: 8,
            border: "1px solid rgba(214,162,30,0.2)",
            fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5
          }}>
            <strong style={{ color: "rgba(255,255,255,0.6)" }}>Eslatma:</strong> Login va parolni administrator
            tomonidan berilgan ma'lumotlar asosida kiriting. Muammo bo'lsa, administrator bilan bog'laning.
          </div>
        </div>
      </div>
    </div>
  );
}
