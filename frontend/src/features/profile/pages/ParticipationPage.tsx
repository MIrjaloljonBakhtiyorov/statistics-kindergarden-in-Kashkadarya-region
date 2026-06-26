import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeCheck, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileFormField } from "../components/ui/ProfileFormField";
import { ProfileStatusBadge } from "../components/ui/ProfileStatusBadge";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";
import type { ParticipationType } from "../data/user";
import { districts, universities } from "../../home/data/siteData";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";

const employmentOptions = [
  { value: "student", label: "Talaba" },
  { value: "master", label: "Magistrant" },
  { value: "phd", label: "Doktorant" },
  { value: "developer", label: "Dasturchi" },
  { value: "entrepreneur", label: "Tadbirkor" },
  { value: "unemployed", label: "Ishsiz" },
  { value: "other", label: "Boshqa" },
];

const universityOptions = universities.map((u) => ({ value: u, label: u }));
const districtOptions = districts.map((d) => ({ value: d, label: d }));

const participationTypeLabels: Record<ParticipationType, string> = {
  otm: "OTMga mansub ishtirokchi",
  independent: "Mustaqil ishtirokchi",
  team: "Tashabbuskor jamoa a'zosi",
};

export function ParticipationPage() {
  const { userId } = useParams();
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("profileUser") ?? "null") as { id?: string } | null,
    []
  );
  const profileId = userId ?? storedUser?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pType, setPType] = useState<ParticipationType>("otm");
  const [employment, setEmployment] = useState("student");
  const [institution, setInstitution] = useState("");
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");
  const [educationDirection, setEducationDirection] = useState("");
  const [district, setDistrict] = useState("");
  const [docUploaded, setDocUploaded] = useState(false);
  const [profileLocked, setProfileLocked] = useState(false);

  // Profil ma'lumotlarini yuklab olish
  useEffect(() => {
    let isMounted = true;
    if (!profileId) { setIsLoading(false); return; }

    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${profileId}/profile`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Yuklanmadi");
        const d = json.data;
        if (isMounted) {
          setPType(
            d.participationType === "independent" || d.participationType === "team"
              ? d.participationType
              : "otm"
          );
          setEmployment(d.employmentStatus || "student");
          setInstitution(d.institution || "");
          setFaculty(d.faculty || "");
          setCourse(d.course ? String(d.course) : "");
          setEducationDirection(d.educationDirection || "");
          setDistrict(d.district || "");
          setProfileLocked(!!d.profileLocked);
        }
      } catch {
        if (isMounted) showToast("Ma'lumotlar yuklanmadi", "error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [profileId]);

  const handleSave = async () => {
    if (!profileId) return;
    if (profileLocked) {
      showToast("Siz ma'lumotlarni o'zgartira olmaysiz", "error");
      return;
    }
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        participationType: pType,
        employmentStatus: employment,
        institution: pType === "otm" ? institution : undefined,
        faculty: pType === "otm" ? faculty : undefined,
        course: pType === "otm" && course ? Number(course) : undefined,
        educationDirection: pType === "otm" ? educationDirection : undefined,
        district,
      };

      const res = await fetch(`${API_BASE_URL}/users/${profileId}/participation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Saqlanmadi");

      sessionStorage.removeItem(`profile:${profileId}:overview`);
      setEditMode(false);
      showToast("Ishtirok ma'lumotlari saqlandi", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Saqlanmadi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProfileShell>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      <ToastContainer />

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Ishtirok ma'lumotlari</h1>
          <p className="text-sm text-[#aab6c9]">Tanlovdagi ishtirok turini va ma'lumotlarni boshqaring</p>
        </div>
        <div className="flex items-center gap-3">
          {profileLocked && (
            <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm font-semibold text-amber-300">
              Siz ma'lumotlarni o'zgartira olmaysiz
            </span>
          )}
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-sm font-medium text-[#aab6c9] hover:text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl text-sm font-bold text-white transition-colors"
              >
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </>
          ) : (
            <button
              disabled={profileLocked}
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl text-sm font-bold text-white transition-colors"
            >
              <BadgeCheck size={15} />
              Tahrirlash
            </button>
          )}
        </div>
      </div>

      {/* Status card */}
      <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Tasdiqlangan</p>
            <p className="text-xs text-[#718096]">{participationTypeLabels[pType]}</p>
          </div>
        </div>
        <ProfileStatusBadge label="Tasdiqlangan" variant="green" />
      </div>

      {/* Participation type selector */}
      <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold text-white mb-4">Ishtirok turi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["otm", "independent", "team"] as ParticipationType[]).map((type) => (
            <button
              key={type}
              onClick={() => editMode && setPType(type)}
              disabled={!editMode}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                pType === type
                  ? "border-blue-500/60 bg-blue-500/10"
                  : "border-[rgba(112,145,190,.18)] bg-[#07172b] hover:border-blue-500/30"
              } disabled:cursor-default`}
            >
              <p className="text-sm font-bold text-white mb-1">{participationTypeLabels[type]}</p>
              <p className="text-xs text-[#718096]">
                {type === "otm" && "OTM talabasimiz yoki xodimasiz"}
                {type === "independent" && "Mustaqil ravishda ishtirok etasiz"}
                {type === "team" && "Jamoa tarkibida ishtirok etasiz"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Bandlik holati */}
      <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold text-white mb-4">Bandlik holati</h2>
        <div className="max-w-sm">
          <ProfileFormField
            as="select"
            label="Bandlik holati"
            value={employment}
            onChange={(e) => setEmployment(e.target.value)}
            disabled={!editMode}
            options={[{ value: "", label: "Tanlang" }, ...employmentOptions]}
          />
        </div>
      </div>

      {/* OTM or District details */}
      <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold text-white mb-4">
          {pType === "otm" ? "OTM ma'lumotlari" : "Hudud ma'lumotlari"}
        </h2>

        {pType === "otm" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileFormField
              as="select"
              label="OTM nomi"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              disabled={!editMode}
              options={[{ value: "", label: "Tanlang" }, ...universityOptions]}
            />
            <ProfileFormField
              as="input"
              label="Fakultet"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              disabled={!editMode}
            />
            <ProfileFormField
              as="input"
              label="Ta'lim yo'nalishi"
              value={educationDirection}
              onChange={(e) => setEducationDirection(e.target.value)}
              disabled={!editMode}
            />
            <ProfileFormField
              as="select"
              label="Kurs"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={!editMode}
              options={[
                { value: "", label: "Tanlang" },
                { value: "1", label: "1-kurs" },
                { value: "2", label: "2-kurs" },
                { value: "3", label: "3-kurs" },
                { value: "4", label: "4-kurs" },
                { value: "5", label: "5-kurs" },
              ]}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileFormField
              as="select"
              label="Qatnashadigan tuman/shahar"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!editMode}
              options={[{ value: "", label: "Tanlang" }, ...districtOptions]}
            />
          </div>
        )}
      </div>

      {/* Document upload */}
      <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4">Tasdiqlovchi hujjat</h2>
        <div className="flex items-center justify-between p-4 bg-[#07172b] border border-[rgba(112,145,190,.12)] rounded-xl">
          <div className="flex items-center gap-3">
            {docUploaded ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <AlertCircle size={20} className="text-[#718096]" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {pType === "otm" ? "Talabalik guvohnomasi" : "Fuqarolik pasporti"}
              </p>
              <p className="text-xs text-[#718096]">
                {docUploaded ? "Yuklangan" : "Yuklanmagan"} · PDF, JPG, PNG — maks. 5 MB
              </p>
            </div>
          </div>
          {editMode && (
            <label className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/25 rounded-lg text-xs font-semibold text-blue-400 cursor-pointer hover:bg-blue-600/30 transition-colors">
              <Upload size={14} />
              Yuklash
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={() => {
                  setDocUploaded(true);
                  showToast("Hujjat yuklandi", "success");
                }}
              />
            </label>
          )}
        </div>
      </div>
    </ProfileShell>
  );
}
