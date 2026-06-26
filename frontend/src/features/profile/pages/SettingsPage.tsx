import { useMemo, useState } from "react";
import { Eye, EyeOff, Globe, Key, Lock, Moon, Sun } from "lucide-react";import { useParams } from "react-router-dom";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileTabs } from "../components/ui/ProfileTabs";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";
import { useTheme } from "../../../shared/contexts/ThemeContext";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";

const tabs = [
  { id: "privacy", label: "Maxfiylik" },
  { id: "language", label: "Til" },
  { id: "appearance", label: "Ko'rinish" },
];

type LangKey = "uz" | "ru" | "en";
type VisKey = "public" | "participants" | "private";
type PasswordField = "current" | "next" | "confirm";

const privacyOptions: { key: string; label: string; desc: string }[] = [
  { key: "showName", label: "Profil nomini ko'rsatish", desc: "F.I.Sh. profil sahifasida ko'rinadi" },
  { key: "showTeam", label: "Jamoa a'zoligini ko'rsatish", desc: "Jamoalaringiz ro'yxati ko'rinadi" },
  { key: "hideApplications", label: "Arizalar ro'yxatini yashirish", desc: "Arizalaringiz faqat sizga ko'rinadi" },
  { key: "hideContacts", label: "Kontakt ma'lumotlarini yashirish", desc: "Telefon va email yashiriladi" },
];

export function SettingsPage() {
  const { userId } = useParams();
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("profileUser") ?? "null") as { id?: string } | null,
    []
  );
  const profileId = userId ?? storedUser?.id;
  const { theme, setTheme } = useTheme();

  const [tab, setTab] = useState("privacy");
  const [lang, setLang] = useState<LangKey>("uz");
  const [privacy, setPrivacy] = useState<Record<string, boolean>>({
    showName: true,
    showTeam: true,
    hideApplications: false,
    hideContacts: false,
  });
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = () => {
    localStorage.setItem(
      "profile_settings",
      JSON.stringify({ lang, theme, privacy })
    );
    showToast("Sozlamalar saqlandi", "success");
  };

  const handleLanguageSelect = (nextLang: LangKey) => {
    setLang(nextLang);
    showToast("Til tanlash dasturchi tomonidan ishlab chiqilyapti", "info");
  };

  const handlePasswordChange = (key: PasswordField, value: string) => {
    setPwdForm((prev) => ({ ...prev, [key]: value }));
    if (pwdErrors[key]) setPwdErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors = { current: "", next: "", confirm: "" };
    if (!pwdForm.current) nextErrors.current = "Joriy parolni kiriting";
    if (pwdForm.next.length < 6) nextErrors.next = "Yangi parol kamida 6 ta belgi bo'lishi kerak";
    if (pwdForm.next !== pwdForm.confirm) nextErrors.confirm = "Yangi parol tasdiqlash bilan mos emas";
    setPwdErrors(nextErrors);

    if (nextErrors.current || nextErrors.next || nextErrors.confirm) return;
    if (!profileId) {
      showToast("Foydalanuvchi topilmadi", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${profileId}/security/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdForm.current,
          newPassword: pwdForm.next,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Parol o'zgartirilmadi");
      }

      setPwdForm({ current: "", next: "", confirm: "" });
      showToast("Parol o'zgartirildi. Endi yangi parol bilan kirishingiz mumkin", "success");
    } catch (caught) {
      showToast(caught instanceof Error ? caught.message : "Parol o'zgartirilmadi", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative h-6 w-12 flex-shrink-0 rounded-full transition-colors ${
        on ? "bg-blue-500" : "border border-[rgba(112,145,190,.25)] bg-[#07172b]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  return (
    <ProfileShell>
      <ToastContainer />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Sozlamalar</h1>
          <p className="text-sm text-[#aab6c9]">Kabinet va profil sozlamalari</p>
        </div>
        <button
          onClick={handleSave}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Saqlash
        </button>
      </div>

      <ProfileTabs tabs={tabs} activeTab={tab} onTabChange={setTab} className="mb-6" />

      <div className="rounded-2xl border border-[rgba(112,145,190,.18)] bg-[#0a1b30] p-6">
        {tab === "privacy" && (
          <div className="space-y-6">
            <div className="space-y-5">
              {privacyOptions.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[rgba(112,145,190,.1)] bg-[#07172b] p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="mt-0.5 text-xs text-[#718096]">{item.desc}</p>
                  </div>
                  <Toggle
                    on={privacy[item.key]}
                    onChange={() => setPrivacy((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-[rgba(112,145,190,.12)] pt-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                <Key size={18} className="text-blue-400" />
                Parolni o'zgartirish
              </h2>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4 md:grid-cols-3" noValidate>
                {(["current", "next", "confirm"] as const).map((field) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-xs font-semibold text-[#aab6c9]">
                      {field === "current" ? "Joriy parol" : field === "next" ? "Yangi parol" : "Yangi parolni tasdiqlash"}
                      <span className="ml-0.5 text-red-400">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-[rgba(112,145,190,.25)] bg-[#07172b] px-4 py-2.5 transition-colors focus-within:border-blue-500/60">
                      <Lock size={15} className="mr-2 flex-shrink-0 text-blue-400" />
                      <input
                        type={showPwd[field] ? "text" : "password"}
                        value={pwdForm[field]}
                        onChange={(event) => handlePasswordChange(field, event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#718096]"
                        placeholder="Parol"
                        autoComplete={field === "current" ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }))}
                        className="text-[#718096] transition-colors hover:text-white"
                        aria-label={showPwd[field] ? "Parolni yashirish" : "Parolni ko'rsatish"}
                      >
                        {showPwd[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {pwdErrors[field] && <p className="mt-1 text-xs text-red-400">{pwdErrors[field]}</p>}
                  </div>
                ))}

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isChangingPassword ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === "language" && (
          <div className="space-y-3">
            {([
              { value: "uz", label: "O'zbek", native: "O'zbekcha" },
              { value: "ru", label: "Ruscha", native: "Russkiy" },
              { value: "en", label: "Inglizcha", native: "English" },
            ] as { value: LangKey; label: string; native: string }[]).map((item) => (
              <button
                key={item.value}
                onClick={() => handleLanguageSelect(item.value)}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  lang === item.value
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-[rgba(112,145,190,.18)] bg-[#07172b] hover:border-blue-500/25"
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <Globe size={18} className={lang === item.value ? "text-blue-400" : "text-[#718096]"} />
                  <div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-xs text-[#718096]">{item.native}</p>
                  </div>
                </div>
                {lang === item.value && (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {tab === "appearance" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[rgba(112,145,190,.1)] bg-[#07172b] p-4">
              <div className="flex items-center gap-3">
                {theme === "light" ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} className="text-blue-400" />}
                <div>
                  <p className="text-sm font-bold text-white">Dark / Light rejim</p>
                  <p className="text-xs text-[#718096]">Kabinet ko'rinishini almashtirish</p>
                </div>
              </div>
              <Toggle on={theme !== "light"} onChange={() => setTheme(theme === "light" ? "dark" : "light")} />
            </div>
          </div>
        )}
      </div>
    </ProfileShell>
  );
}
