import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileTabs } from "../components/ui/ProfileTabs";
import { ProfileFormField } from "../components/ui/ProfileFormField";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";
import type { UserProfile } from "../data/user";
import { districts } from "../../home/data/siteData";

/* ─── Constants ─────────────────────────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const emptyUser: UserProfile = {
  id: "",
  firstName: "",
  lastName: "",
  middleName: "",
  birthDate: "",
  age: 0,
  gender: "male",
  pinfl: "",
  passportSeries: "",
  passportNumber: "",
  phone: "",
  phoneVerified: false,
  email: "",
  emailVerified: false,
  telegram: "",
  region: "",
  district: "",
  mahalla: "",
  street: "",
  role: "solo_participant",
  participationType: "otm",
  employmentStatus: "student",
  institution: "",
  faculty: "",
  educationDirection: "",
  course: undefined,
  profileCompletion: 0,
  profileLocked: false,
  avatarUrl: undefined,
  createdAt: "",
  lastLogin: "",
};

const tabs = [
  { id: "basic",   label: "Asosiy" },
  { id: "contact", label: "Aloqa" },
  { id: "address", label: "Manzil" },
  { id: "avatar",  label: "Rasm" },
];

const genderOptions = [
  { value: "",       label: "Tanlang" },
  { value: "male",   label: "Erkak" },
  { value: "female", label: "Ayol" },
];

const regionOptions = [
  { value: "",                         label: "Tanlang" },
  { value: "Qashqadaryo viloyati",     label: "Qashqadaryo viloyati" },
  { value: "Toshkent shahri",          label: "Toshkent shahri" },
  { value: "Samarqand viloyati",       label: "Samarqand viloyati" },
  { value: "Buxoro viloyati",          label: "Buxoro viloyati" },
  { value: "Surxondaryo viloyati",     label: "Surxondaryo viloyati" },
  { value: "Navoiy viloyati",          label: "Navoiy viloyati" },
  { value: "Jizzax viloyati",          label: "Jizzax viloyati" },
  { value: "Sirdaryo viloyati",        label: "Sirdaryo viloyati" },
  { value: "Farg'ona viloyati",        label: "Farg'ona viloyati" },
  { value: "Andijon viloyati",         label: "Andijon viloyati" },
  { value: "Namangan viloyati",        label: "Namangan viloyati" },
  { value: "Xorazm viloyati",          label: "Xorazm viloyati" },
  { value: "Qoraqalpog'iston",         label: "Qoraqalpog'iston" },
];

const districtOptions = [
  { value: "", label: "Tanlang" },
  ...districts.map((d) => ({ value: d, label: d })),
];

/* ─── Component ─────────────────────────────────────────── */

export function PersonalPage() {
  const { userId } = useParams();
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("profileUser") ?? "null") as { id?: string } | null,
    []
  );
  const profileId = userId ?? storedUser?.id;

  const [tab,          setTab]          = useState("basic");
  const [editMode,     setEditMode]     = useState(false);
  const [form,         setForm]         = useState<UserProfile>({ ...emptyUser });
  const [errors,       setErrors]       = useState<Partial<Record<keyof UserProfile, string>>>({});
  // JShShIR va pasport dastlab ko'rinadi, foydalanuvchi "Yashirish" bossa yashiriladi
  const [maskedPinfl,    setMaskedPinfl]    = useState(false);
  const [maskedPassport, setMaskedPassport] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [saveState,    setSaveState]    = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError,    setSaveError]    = useState("");
  const hasLoadedProfile = useRef(false);
  const lastSavedJson    = useRef("");

  /* Load profile from API */
  useEffect(() => {
    let mounted = true;
    if (!profileId) { setIsLoading(false); return; }

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${profileId}/profile`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Profil yuklanmadi");
        const profile = normalizeProfile(json.data);
        if (mounted) {
          setForm(profile);
          lastSavedJson.current = JSON.stringify(toPayload(profile));
          syncStorage(profile);
          hasLoadedProfile.current = true;
        }
      } catch (err) {
        if (mounted) showToast(err instanceof Error ? err.message : "Profil yuklanmadi", "error");
        hasLoadedProfile.current = true;
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [profileId]);

  const field = (key: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "birthDate") next.age = calcAge(value);
        return next;
      });
      if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const validate = (show = true) => {
    const e: Partial<Record<keyof UserProfile, string>> = {};
    if (!form.firstName.trim()) e.firstName = "Ism kiritish majburiy";
    if (!form.lastName.trim())  e.lastName  = "Familiya kiritish majburiy";
    if (form.phone && !/^\+998\d{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Format: +998XXXXXXXXX";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Noto'g'ri email";
    if (show) setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { showToast("Formada xatoliklar mavjud", "error"); return; }
    void save("manual");
  };

  const handleCancel = () => {
    if (lastSavedJson.current) setForm((p) => ({ ...p, ...JSON.parse(lastSavedJson.current) }));
    setErrors({});
    setSaveError("");
    setSaveState("idle");
    setEditMode(false);
  };

  const save = async (mode: "auto" | "manual") => {
    if (!profileId || !validate(mode === "manual")) return;
    const body = toPayload(form);
    const json = JSON.stringify(body);
    if (json === lastSavedJson.current && mode === "auto") return;

    setSaveState("saving");
    setSaveError("");
    try {
      const res = await fetch(`${API_BASE_URL}/users/${profileId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Profile-Save-Mode": mode },
        body: json,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message ?? "Saqlanmadi");

      const saved = normalizeProfile(result.data);
      lastSavedJson.current = JSON.stringify(toPayload(saved));
      syncStorage(saved);
      sessionStorage.removeItem(`profile:${profileId}:overview`);
      setSaveState("saved");
      if (mode === "manual") {
        setForm(saved);
        setEditMode(false);
        showToast("Ma'lumotlar muvaffaqiyatli saqlandi ✓", "success");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Saqlanmadi";
      setSaveState("error");
      setSaveError(msg);
      showToast(msg, "error");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Fayl 2 MB dan oshmasligi kerak", "error"); return; }
    setAvatarPreview(URL.createObjectURL(file));
    showToast("Rasm tanlandi", "success");
  };

  const VerifiedBadge = ({ ok }: { ok: boolean }) =>
    ok ? (
      <span className="inline-flex items-center gap-1 text-xs text-green-400">
        <CheckCircle size={12} /> Tasdiqlangan
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
        <AlertCircle size={12} /> Tasdiqlanmagan
      </span>
    );

  const statusText =
    isLoading         ? "Ma'lumotlar yuklanmoqda..." :
    saveState === "saving" ? "Saqlanmoqda..."         :
    saveState === "saved"  ? "Saqlandi ✓"             :
    saveState === "error"  ? (saveError || "Xatolik") :
    "Profilingizni yangilang";

  const isLocked = !!form.profileLocked;

  return (
    <ProfileShell>
      <ToastContainer />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Shaxsiy ma'lumotlar</h1>
          <p className="text-sm text-[#aab6c9]">{statusText}</p>
        </div>
        <div className="flex items-center gap-3">
          {isLocked && (
            <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm font-semibold text-amber-300">
              Siz ma'lumotlarni o'zgartira olmaysiz
            </span>
          )}
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-sm font-medium text-[#aab6c9] hover:text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors"
              >
                Saqlash
              </button>
            </>
          ) : (
            <button
              disabled={isLoading || isLocked}
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl text-sm font-bold text-white transition-colors"
            >
              <User size={15} />
              Tahrirlash
            </button>
          )}
        </div>
      </div>

      <ProfileTabs tabs={tabs} activeTab={tab} onTabChange={setTab} className="mb-6" />

      <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">

        {/* ── ASOSIY ── */}
        {tab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileFormField as="input" label="Familiya" required value={form.lastName}   onChange={field("lastName")}   disabled={!editMode} error={errors.lastName} />
            <ProfileFormField as="input" label="Ism"      required value={form.firstName}  onChange={field("firstName")}  disabled={!editMode} error={errors.firstName} />
            <ProfileFormField as="input" label="Otasining ismi" value={form.middleName} onChange={field("middleName")} disabled={!editMode} />
            <ProfileFormField as="input" type="date" label="Tug'ilgan sana" required value={form.birthDate} onChange={field("birthDate")} disabled={!editMode} />
            <ProfileFormField as="select" label="Jinsi" value={form.gender} onChange={field("gender")} disabled={!editMode} options={genderOptions} />

            {/* JShShIR — ochiq, toggle bilan yashirish */}
            <ProfileFormField
              as="input"
              label="JShShIR"
              value={form.pinfl}
              onChange={field("pinfl")}
              disabled={!editMode}
              masked={maskedPinfl}
              onToggleMask={() => setMaskedPinfl((v) => !v)}
              hint="14 xonali shaxsiy identifikatsiya raqami"
            />

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Passport — ochiq, toggle bilan yashirish */}
              <ProfileFormField
                as="input"
                label="Pasport seriyasi"
                value={form.passportSeries}
                onChange={field("passportSeries")}
                disabled={!editMode}
                masked={maskedPassport}
                onToggleMask={() => setMaskedPassport((v) => !v)}
                hint="Masalan: AA"
              />
              <ProfileFormField
                as="input"
                label="Pasport raqami"
                value={form.passportNumber}
                onChange={field("passportNumber")}
                disabled={!editMode}
                masked={maskedPassport}
                onToggleMask={() => setMaskedPassport((v) => !v)}
                hint="Masalan: 1234567"
              />
              <div className="md:col-span-2 flex items-end">
                <div className="text-xs text-[#718096] bg-[#07172b] border border-[rgba(112,145,190,.12)] rounded-xl px-4 py-3 w-full">
                  Yosh: <strong className="text-white">{form.age > 0 ? `${form.age} yosh` : "—"}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ALOQA ── */}
        {tab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <ProfileFormField
                as="input"
                type="tel"
                label="Telefon raqami"
                required
                value={form.phone}
                onChange={field("phone")}
                disabled={!editMode}
                error={errors.phone}
                hint="+998XXXXXXXXX"
              />
              <div className="mt-2 flex items-center justify-between">
                <VerifiedBadge ok={form.phoneVerified} />
                {!form.phoneVerified && editMode && (
                  <button
                    onClick={() => showToast("SMS kod yuborildi", "info")}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Tasdiqlash kodi yuborish
                  </button>
                )}
              </div>
            </div>

            <div>
              <ProfileFormField
                as="input"
                type="email"
                label="Elektron pochta"
                value={form.email}
                onChange={field("email")}
                disabled={!editMode}
                error={errors.email}
              />
              <div className="mt-2 flex items-center justify-between">
                <VerifiedBadge ok={form.emailVerified} />
                {!form.emailVerified && editMode && (
                  <button
                    onClick={() => showToast("Email yuborildi", "info")}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Email tasdiqlash
                  </button>
                )}
              </div>
            </div>

            <ProfileFormField
              as="input"
              label="Telegram username"
              value={form.telegram}
              onChange={field("telegram")}
              disabled={!editMode}
              hint="@username shaklida"
            />
          </div>
        )}

        {/* ── MANZIL ── */}
        {tab === "address" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileFormField as="select" label="Viloyat"         required value={form.region}   onChange={field("region")}   disabled={!editMode} options={regionOptions} />
            <ProfileFormField as="select" label="Tuman / Shahar"  required value={form.district} onChange={field("district")} disabled={!editMode} options={districtOptions} />
            <ProfileFormField as="input"  label="Mahalla"                  value={form.mahalla}  onChange={field("mahalla")}  disabled={!editMode} />
            <ProfileFormField as="input"  label="Ko'cha, uy"               value={form.street}   onChange={field("street")}   disabled={!editMode} />
          </div>
        )}

        {/* ── RASM ── */}
        {tab === "avatar" && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(form.firstName[0] ?? "?").toUpperCase()}{(form.lastName[0] ?? "").toUpperCase()}</span>
                )}
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera size={16} className="text-white" />
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">{form.lastName} {form.firstName}</p>
              <p className="text-sm text-[#718096] mt-1">JPG, PNG yoki WEBP · Maks. 2 MB</p>
            </div>
            {avatarPreview && editMode && (
              <button onClick={() => setAvatarPreview(null)} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Rasmni o'chirish
              </button>
            )}
          </div>
        )}
      </div>
    </ProfileShell>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function normalizeProfile(data: Partial<UserProfile>): UserProfile {
  return {
    ...emptyUser,
    ...data,
    participationType:
      data.participationType === "independent" || data.participationType === "team"
        ? data.participationType
        : "otm",
    gender: data.gender === "female" ? "female" : "male",
    age: calcAge(data.birthDate ?? ""),
  };
}

function toPayload(p: UserProfile) {
  return {
    firstName:      p.firstName,
    lastName:       p.lastName,
    middleName:     p.middleName,
    birthDate:      p.birthDate,
    gender:         p.gender,
    pinfl:          p.pinfl,
    passportSeries: p.passportSeries,
    passportNumber: p.passportNumber,
    phone:          p.phone,
    email:          p.email,
    telegram:       p.telegram,
    region:         p.region,
    district:       p.district,
    mahalla:        p.mahalla,
    street:         p.street,
    institution:    p.institution,
    avatarUrl:      p.avatarUrl || undefined,
  };
}

function syncStorage(p: UserProfile) {
  const cur = JSON.parse(localStorage.getItem("profileUser") ?? "null") as Record<string, unknown> | null;
  localStorage.setItem("profileUser", JSON.stringify({
    ...cur,
    id:        p.id,
    firstName: p.firstName,
    lastName:  p.lastName,
    email:     p.email,
    profileCompletion: p.profileCompletion,
    profileLocked: p.profileLocked,
  }));
}

function calcAge(birthDate: string): number {
  if (!birthDate) return 0;
  const b = new Date(birthDate);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
  return age;
}
