import { useState } from "react";
import { User, Phone, Mail, Building2, Briefcase, Star, CheckCircle2, Lock, Camera } from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";
import { useJudgeAuth } from "../context/JudgeAuthContext";

const API = "/api/judge";

function Field({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid #F3F4F6", alignItems: "center" }}>
      {icon && <div style={{ color: "#9CA3AF", flexShrink: 0 }}>{icon}</div>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>{value || "—"}</div>
      </div>
    </div>
  );
}

export function JudgeProfilePage() {
  const { judge, refresh } = useJudgeAuth();
  const [tab, setTab] = useState<"profile" | "password" | "security">("profile");
  const [phone, setPhone] = useState(judge?.phone ?? "");
  const [email, setEmail] = useState(judge?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password change
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`${API}/profile`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email })
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const changePwd = async () => {
    setPwdError("");
    if (newPwd !== confirmPwd) { setPwdError("Yangi parollar mos emas"); return; }
    if (newPwd.length < 6) { setPwdError("Parol kamida 6 ta belgidan iborat bo'lishi kerak"); return; }
    setPwdSaving(true);
    try {
      const r = await fetch(`${API}/auth/change-password`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd })
      });
      const j = await r.json();
      if (!r.ok) { setPwdError(j?.error?.message ?? "Xatolik"); return; }
      setPwdSuccess(true);
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setPwdSuccess(false), 4000);
    } finally { setPwdSaving(false); }
  };

  const fullName = judge ? `${judge.lastName} ${judge.firstName}${judge.middleName ? " " + judge.middleName : ""}` : "Hakam";

  return (
    <JudgeShell pageTitle="Shaxsiy profil">
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, maxWidth: 1000 }} className="profile-layout">
        {/* Left: avatar + quick info */}
        <div>
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "24px", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.05)", marginBottom: 16 }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #071B33, #1a3a5c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 800, color: "#D6A21E", margin: "0 auto"
              }}>
                {judge?.avatarUrl
                  ? <img src={judge.avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" />
                  : `${judge?.lastName?.[0] ?? ""}${judge?.firstName?.[0] ?? ""}`}
              </div>
              <button style={{
                position: "absolute", bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: "50%",
                background: "#D6A21E", border: "2px solid white",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}>
                <Camera size={12} color="white" />
              </button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#101828" }}>{fullName}</div>
            <div style={{ fontSize: 13, color: "#D6A21E", fontWeight: 600, marginTop: 2 }}>Hakam</div>
            <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>{judge?.organization}</div>
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, fontSize: 12, color: "#344054" }}>
              <span style={{ color: "#667085" }}>Login: </span>
              <strong>{judge?.login}</strong>
            </div>
          </div>

          {/* Agreed flags */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "16px 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#344054", marginBottom: 10 }}>KELISHUVLAR</div>
            {[
              { label: "Baholash mezonlari", ok: judge?.agreedCriteria },
              { label: "Mustaqillik", ok: judge?.agreedIndependent },
              { label: "Maxfiylik", ok: judge?.agreedConfidential },
              { label: "Manfaatsizlik", ok: judge?.agreedNoConflict },
              { label: "Ma'lumot ulashmaslik", ok: judge?.agreedNoShare },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <CheckCircle2 size={14} color={a.ok ? "#16A34A" : "#D0D5DD"} />
                <span style={{ fontSize: 12, color: a.ok ? "#344054" : "#9CA3AF" }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: tabs */}
        <div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 12, padding: 4, border: "1px solid #E4E7EC", marginBottom: 20, width: "fit-content" }}>
            {([
              { id: "profile", label: "Profil ma'lumotlari" },
              { id: "password", label: "Parolni almashtirish" },
              { id: "security", label: "Xavfsizlik" },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
                background: tab === t.id ? "#071B33" : "transparent",
                color: tab === t.id ? "white" : "#667085", fontWeight: tab === t.id ? 600 : 400
              }}>{t.label}</button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === "profile" && (
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "24px 28px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Shaxsiy ma'lumotlar</h3>
              <Field label="Familiya" value={judge?.lastName} icon={<User size={16} />} />
              <Field label="Ism" value={judge?.firstName} icon={<User size={16} />} />
              <Field label="Otasining ismi" value={judge?.middleName} icon={<User size={16} />} />
              <Field label="Tashkilot" value={judge?.organization} icon={<Building2 size={16} />} />
              <Field label="Lavozim" value={judge?.position} icon={<Briefcase size={16} />} />
              <Field label="Mutaxassislik" value={judge?.specialization} icon={<Star size={16} />} />
              <Field label="Tajriba" value={judge?.experienceYears ? `${judge.experienceYears} yil` : undefined} icon={<Star size={16} />} />

              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#344054", margin: "0 0 12px" }}>Tahrirlash mumkin bo'lgan ma'lumotlar</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}>
                      <Phone size={13} style={{ display: "inline", marginRight: 6 }} />Telefon raqami
                    </label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 90 123 45 67"
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}>
                      <Mail size={13} style={{ display: "inline", marginRight: 6 }} />Elektron pochta
                    </label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="hakam@example.com"
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                {saved && <div style={{ color: "#16A34A", fontSize: 13, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={14} /> Saqlandi</div>}
                <button onClick={saveProfile} disabled={saving} style={{
                  marginTop: 16, padding: "11px 24px", borderRadius: 10, border: "none",
                  background: "#D6A21E", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer"
                }}>
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>

              {/* Directions */}
              {(judge?.directions?.length ?? 0) > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#344054", marginBottom: 8 }}>Baholash yo'nalishlari</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {judge?.directions.map(d => (
                      <span key={d} style={{ background: "#F5F7FA", border: "1px solid #E4E7EC", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#344054" }}>{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Password tab */}
          {tab === "password" && (
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "24px 28px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#101828", margin: "0 0 6px" }}>Parolni almashtirish</h3>
              <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak</p>
              {[
                { label: "Joriy parol", val: curPwd, set: setCurPwd },
                { label: "Yangi parol", val: newPwd, set: setNewPwd },
                { label: "Yangi parolni tasdiqlang", val: confirmPwd, set: setConfirmPwd },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #E4E7EC", borderRadius: 8, padding: "10px 14px" }}>
                    <Lock size={16} color="#9CA3AF" />
                    <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
                      placeholder="••••••••"
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#101828" }} />
                  </div>
                </div>
              ))}
              {pwdError && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{pwdError}</div>}
              {pwdSuccess && <div style={{ color: "#16A34A", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} /> Parol muvaffaqiyatli o'zgartirildi</div>}
              <button onClick={changePwd} disabled={pwdSaving || !curPwd || !newPwd || !confirmPwd} style={{
                padding: "11px 24px", borderRadius: 10, border: "none",
                background: "#D6A21E", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
                opacity: !curPwd || !newPwd || !confirmPwd ? 0.5 : 1
              }}>
                {pwdSaving ? "Saqlanmoqda..." : "Parolni o'zgartirish"}
              </button>
            </div>
          )}

          {/* Security tab */}
          {tab === "security" && (
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "24px 28px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Xavfsizlik va maxfiylik</h3>
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#344054", marginBottom: 8 }}>Login ma'lumotlari</div>
                <div style={{ fontSize: 13, color: "#667085" }}>Login: <strong style={{ color: "#101828" }}>{judge?.login}</strong></div>
                <div style={{ fontSize: 13, color: "#667085", marginTop: 4 }}>Holat: <span style={{ background: "#DCFCE7", color: "#14532D", padding: "2px 8px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>Faol</span></div>
              </div>
              <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.7 }}>
                <p>• Parolingizni hech kim bilan ulashmaslik.</p>
                <p>• Ishni tugatgandan so'ng tizimdan chiqish.</p>
                <p>• Loyiha ma'lumotlarini uchinchi shaxslarga oshkor qilmaslik.</p>
                <p>• Shubhali faoliyat sezsangiz, administratorga xabar bering.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </JudgeShell>
  );
}
