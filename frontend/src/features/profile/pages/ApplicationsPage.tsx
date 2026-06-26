 import { useState, useEffect, useMemo } from "react";
import { Files, Plus, Eye, FileText, Inbox, Upload, Link as LinkIcon, GitBranch, Video, FileUp, Pencil, Download, ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileStatCard } from "../components/ui/ProfileStatCard";
import { ProfileModal } from "../components/ui/ProfileModal";
import { ProfileFormField } from "../components/ui/ProfileFormField";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";

interface Application {
  id: string;
  userId: string;
  projectName: string;
  direction: string;
  goal: string;
  problem: string;
  presentationUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  applicationNumber?: string;
  status: "submitted" | "under_review" | "needs_correction" | "accepted" | "rejected" | "next_stage";
  adminComment?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ProfileReadiness {
  profileCompletion: number;
  profileLocked?: boolean;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  pinfl?: string;
  passportSeries?: string;
  passportNumber?: string;
  phone?: string;
  region?: string;
  participationType?: "otm" | "independent" | "team" | "university";
  institution?: string;
  faculty?: string;
  educationDirection?: string;
  course?: number;
  district?: string;
}

const directions = [
  "Texnologiya",
  "Ta'lim",
  "Sog'liqni saqlash",
  "Qishloq xo'jaligi",
  "Ekologiya",
  "Transport",
  "Moliya",
  "Turizm",
  "E-commerce",
  "Boshqa"
];

export function ApplicationsPage() {
  const { userId } = useParams();
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("profileUser") ?? "null") as { id?: string } | null,
    []
  );
  const profileId = userId ?? storedUser?.id;

  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    projectName: "",
    direction: "",
    goal: "",
    problem: "",
    presentation: null as File | null,
    video: null as File | null,
    demo: null as File | null,
    github: "",
    website: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<ProfileReadiness | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [previewResource, setPreviewResource] = useState<ResourcePreview | null>(null);

  // Arizalarni yuklash
  useEffect(() => {
    if (!profileId) return;

    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/users/${profileId}/applications`);
        const profileResponse = await fetch(`${API_BASE_URL}/users/${profileId}/profile`);
        
        if (!response.ok) {
          throw new Error("Arizalarni yuklab bo'lmadi");
        }

        const data = await response.json();
        setApps(data.data || []);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.data);
        }
      } catch (error) {
        console.error("Arizalarni yuklashda xatolik:", error);
        showToast("Arizalarni yuklab bo'lmadi. Qaytadan urinib ko'ring.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [profileId]);

  const missingProfileFields = useMemo(() => {
    if (!profile) return [];
    const missing: string[] = [];
    const pType = profile.participationType === "university" ? "otm" : profile.participationType;
    if (!profile.lastName) missing.push("familiya");
    if (!profile.firstName) missing.push("ism");
    if (!profile.birthDate) missing.push("tug'ilgan sana");
    if (!profile.gender) missing.push("jinsi");
    if (!profile.pinfl) missing.push("JShShIR");
    if (!profile.passportSeries) missing.push("pasport seriyasi");
    if (!profile.passportNumber) missing.push("pasport raqami");
    if (!profile.phone) missing.push("telefon raqami");
    if (!profile.region) missing.push("viloyat");
    if (!profile.district) missing.push("tuman/shahar");
    if (pType === "otm") {
      if (!profile.institution) missing.push("OTM nomi");
      if (!profile.faculty) missing.push("fakultet");
      if (!profile.educationDirection) missing.push("ta'lim yo'nalishi");
      if (!profile.course) missing.push("kurs");
    } else if (!profile.district) {
      missing.push("qatnashadigan tuman/shahar");
    }
    return missing;
  }, [profile]);

  const canCreateApplication = missingProfileFields.length === 0;

  const openCreateModal = () => {
    if (!canCreateApplication) {
      showToast(`Avval to'ldiring: ${missingProfileFields.join(", ")}`, "error");
      return;
    }
    setEditingApp(null);
    setIsModalOpen(true);
  };

  const openEditModal = (app: Application) => {
    if (!canEditApplication(app)) {
      showToast("Admin loyihani qabul qilganidan keyin arizani o'zgartirib bo'lmaydi.", "error");
      return;
    }
    setEditingApp(app);
    setForm({
      projectName: app.projectName,
      direction: app.direction,
      goal: app.goal,
      problem: app.problem,
      presentation: null,
      video: null,
      demo: null,
      github: app.githubUrl ?? "",
      website: app.websiteUrl ?? ""
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errs: Record<string, string> = {};
    if (!form.projectName.trim()) errs.projectName = "Loyiha nomini kiriting";
    if (!form.direction) errs.direction = "Yo'nalishni tanlang";
    if (form.goal.trim().length < 10) errs.goal = "Maqsad kamida 10 ta belgidan iborat bo'lishi kerak";
    if (form.problem.trim().length < 10) errs.problem = "Muammo/mohiyat kamida 10 ta belgidan iborat bo'lishi kerak";
    
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!profileId) {
      showToast("Foydalanuvchi topilmadi", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: profileId,
        projectName: form.projectName,
        direction: form.direction,
        goal: form.goal,
        problem: form.problem,
        githubUrl: form.github || undefined,
        websiteUrl: form.website || undefined,
        presentationUrl: editingApp?.presentationUrl || undefined,
        videoUrl: editingApp?.videoUrl || undefined,
        demoUrl: editingApp?.demoUrl || undefined,
        presentationFile: form.presentation ? await fileToUploadPayload(form.presentation) : undefined,
        videoFile: form.video ? await fileToUploadPayload(form.video) : undefined,
        demoFile: form.demo ? await fileToUploadPayload(form.demo) : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/users/${profileId}/applications${editingApp ? `/${editingApp.id}` : ""}`, {
        method: editingApp ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(formatApiError(responseData, response.status));
      }

      const data = responseData;

      setApps(prev => editingApp ? prev.map((app) => app.id === editingApp.id ? data.data : app) : [data.data, ...prev]);
      setProfile((prev) => prev ? { ...prev, profileLocked: true } : prev);
      sessionStorage.removeItem(`profile:${profileId}:overview`);
      
      setIsModalOpen(false);
      setForm({
        projectName: "",
        direction: "",
        goal: "",
        problem: "",
        presentation: null,
        video: null,
        demo: null,
        github: "",
        website: ""
      });
      setErrors({});
      setEditingApp(null);
      showToast(editingApp ? "Ariza muvaffaqiyatli yangilandi" : "Ariza muvaffaqiyatli yaratildi", "success");
    } catch (error) {
      console.error("Ariza yaratishda xatolik:", error);
      showToast(error instanceof Error ? error.message : "Ariza yaratilmadi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (field: 'presentation' | 'video' | 'demo') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast("Fayl hajmi 50 MB dan oshmasligi kerak", "error");
        return;
      }
      setForm(prev => ({ ...prev, [field]: file }));
      showToast(`${file.name} yuklandi`, "success");
    }
  };

  const stats = {
    total: apps.length,
    withFiles: apps.filter(a => a.presentationUrl || a.videoUrl || a.demoUrl).length,
    withLinks: apps.filter(a => a.githubUrl || a.websiteUrl).length,
  };

  return (
    <ProfileShell>
      <ToastContainer />

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arizalarim</h1>
          <p className="text-sm text-gray-600 dark:text-[#aab6c9]">Tanlovga topshirgan arizalaringiz</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!canCreateApplication}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} />
          Yangi ariza
        </button>
      </div>

      {!canCreateApplication && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-sm text-amber-200">
          Ariza yuborishdan oldin shaxsiy va ishtirokchi ma'lumotlarini to'liq to'ldiring: {missingProfileFields.join(", ")}.
        </div>
      )}

      {profile?.profileLocked && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4 text-sm text-blue-200">
          Ariza yuborilgan. Shaxsiy va ishtirokchi ma'lumotlarini o'zgartira olmaysiz, lekin loyiha arizasini admin qabul qilmaguncha tahrirlashingiz mumkin.
        </div>
      )}

      {/* Stats */}
      {apps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ProfileStatCard label="Jami arizalar" value={stats.total} icon={Files} color="blue" />
          <ProfileStatCard label="Fayllar yuklangan" value={stats.withFiles} icon={FileText} color="purple" />
          <ProfileStatCard label="Havolalar qo'shilgan" value={stats.withLinks} icon={LinkIcon} color="cyan" />
        </div>
      )}

      {/* Applications list */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#0a1b30] border border-gray-200 dark:border-[rgba(112,145,190,.18)] rounded-2xl p-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-[#718096]">Arizalar yuklanmoqda...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white dark:bg-[#0a1b30] border border-gray-200 dark:border-[rgba(112,145,190,.18)] rounded-2xl p-16 text-center">
          <Inbox size={64} className="mx-auto mb-4 text-gray-300 dark:text-[#718096] opacity-50" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hali arizalar yo'q</h3>
          <p className="text-sm text-gray-600 dark:text-[#718096] mb-6 max-w-md mx-auto">
            Tanlovga ishtirok etish uchun birinchi arizangizni yarating. Loyiha haqida to'liq ma'lumot bering va kerakli fayllarni yuklang.
          </p>
          <button
            onClick={openCreateModal}
            disabled={!canCreateApplication}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            Birinchi arizani yaratish
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-white dark:bg-[#0a1b30] border border-gray-200 dark:border-[rgba(112,145,190,.18)] rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{app.projectName}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{app.direction}</p>
                  <p className="text-xs text-gray-500 dark:text-[#718096]">
                    {app.applicationNumber ? `${app.applicationNumber} · ` : ""}Yaratildi: {new Date(app.createdAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getApplicationStatusClass(app.status)}`}>
                    {getApplicationStatusLabel(app.status)}
                  </span>
                  {canEditApplication(app) && (
                    <button
                      onClick={() => openEditModal(app)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                      <Pencil size={14} />
                      Tahrirlash
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#07172b] border border-gray-200 dark:border-[rgba(112,145,190,.18)] rounded-xl text-sm text-gray-700 dark:text-[#aab6c9] hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Eye size={14} />
                    Ko'rish
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-[#07172b] rounded-xl">
                  <p className="text-xs font-semibold text-gray-600 dark:text-[#718096] mb-1">Maqsad</p>
                  <p className="text-sm text-gray-900 dark:text-[#aab6c9] line-clamp-2">{app.goal}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-[#07172b] rounded-xl">
                  <p className="text-xs font-semibold text-gray-600 dark:text-[#718096] mb-1">Muammo</p>
                  <p className="text-sm text-gray-900 dark:text-[#aab6c9] line-clamp-2">{app.problem}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {app.presentationUrl && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                    <FileUp size={12} /> Taqdimot
                  </span>
                )}
                {app.videoUrl && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium">
                    <Video size={12} /> Video
                  </span>
                )}
                {app.demoUrl && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">
                    <FileUp size={12} /> Demo
                  </span>
                )}
                {app.githubUrl && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 rounded-lg text-xs font-medium">
                    <GitBranch size={12} /> GitHub
                  </span>
                )}
                {app.websiteUrl && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                    <LinkIcon size={12} /> Sayt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProfileModal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Ariza tafsilotlari"
        subtitle={selectedApp?.applicationNumber ?? "Ariza ma'lumotlari"}
        size="xl"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Ariza raqami" value={selectedApp.applicationNumber ?? "Raqam berilmagan"} />
              <DetailItem label="Holat" value={getApplicationStatusLabel(selectedApp.status)} />
              <DetailItem label="Loyiha nomi" value={selectedApp.projectName} />
              <DetailItem label="Yo'nalish" value={selectedApp.direction} />
              <DetailItem label="Yaratilgan sana" value={new Date(selectedApp.createdAt).toLocaleString("uz-UZ")} />
            </div>

            <DetailBlock label="Loyihaning maqsadi" value={selectedApp.goal} />
            <DetailBlock label="Qanday muammoni hal qiladi / mazmun-mohiyati" value={selectedApp.problem} />

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Fayllar va havolalar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailLink label="Taqdimot materiali" value={selectedApp.presentationUrl} onPreview={setPreviewResource} />
                <DetailLink label="Video material" value={selectedApp.videoUrl} onPreview={setPreviewResource} />
                <DetailLink label="Demo versiyasi" value={selectedApp.demoUrl} onPreview={setPreviewResource} />
                <DetailLink label="GitHub" value={selectedApp.githubUrl} onPreview={setPreviewResource} />
                <DetailLink label="Yaratilgan sayt" value={selectedApp.websiteUrl} onPreview={setPreviewResource} />
              </div>
            </div>
          </div>
        )}
      </ProfileModal>

      <ResourcePreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />

      {/* Create Application Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrors({});
          setEditingApp(null);
        }}
        title={editingApp ? "Arizani tahrirlash" : "Yangi ariza yaratish"}
        subtitle={editingApp ? "Admin qabul qilmaguncha loyiha ma'lumotlarini yangilashingiz mumkin" : "Loyihangiz haqida to'liq ma'lumot bering"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Loyiha nomi */}
          <ProfileFormField
            as="input"
            label="Loyihaning nomi"
            required
            value={form.projectName}
            onChange={(e) => setForm(prev => ({ ...prev, projectName: e.target.value }))}
            error={errors.projectName}
            placeholder="Masalan: EduConnect"
          />

          {/* Yo'nalish */}
          <ProfileFormField
            as="select"
            label="Yo'nalish"
            required
            value={form.direction}
            onChange={(e) => setForm(prev => ({ ...prev, direction: e.target.value }))}
            error={errors.direction}
            options={[
              { value: "", label: "Tanlang" },
              ...directions.map(d => ({ value: d, label: d }))
            ]}
          />

          {/* Maqsad */}
          <ProfileFormField
            as="textarea"
            label="Loyihaning maqsadi"
            required
            value={form.goal}
            onChange={(e) => setForm(prev => ({ ...prev, goal: e.target.value }))}
            error={errors.goal}
            placeholder="Loyihangiz qanday maqsadga xizmat qiladi?"
            rows={3}
          />

          {/* Muammo */}
          <ProfileFormField
            as="textarea"
            label="Qanday muammoni hal qiladi?"
            required
            value={form.problem}
            onChange={(e) => setForm(prev => ({ ...prev, problem: e.target.value }))}
            error={errors.problem}
            placeholder="Loyihangiz qanday muammoni hal qiladi?"
            rows={3}
          />

          {/* Fayllar */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Fayllar (ixtiyoriy)</h3>
            
            {/* Taqdimot */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#aab6c9] mb-2">
                Taqdimot (PPTX)
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#07172b] border border-gray-200 dark:border-[rgba(112,145,190,.25)] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0d223b] transition-colors">
                <Upload size={18} className="text-gray-500 dark:text-[#718096]" />
                <span className="text-sm text-gray-700 dark:text-[#aab6c9]">
                  {form.presentation ? form.presentation.name : "Fayl tanlash"}
                </span>
                <input
                  type="file"
                  accept=".ppt,.pptx"
                  className="hidden"
                  onChange={handleFileChange('presentation')}
                />
              </label>
            </div>

            {/* Video */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#aab6c9] mb-2">
                Video (MP4, AVI)
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#07172b] border border-gray-200 dark:border-[rgba(112,145,190,.25)] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0d223b] transition-colors">
                <Upload size={18} className="text-gray-500 dark:text-[#718096]" />
                <span className="text-sm text-gray-700 dark:text-[#aab6c9]">
                  {form.video ? form.video.name : "Fayl tanlash"}
                </span>
                <input
                  type="file"
                  accept=".mp4,.avi,.mov"
                  className="hidden"
                  onChange={handleFileChange('video')}
                />
              </label>
            </div>

            {/* Demo */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#aab6c9] mb-2">
                Demo versiyasi (ZIP, RAR)
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#07172b] border border-gray-200 dark:border-[rgba(112,145,190,.25)] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0d223b] transition-colors">
                <Upload size={18} className="text-gray-500 dark:text-[#718096]" />
                <span className="text-sm text-gray-700 dark:text-[#aab6c9]">
                  {form.demo ? form.demo.name : "Fayl tanlash"}
                </span>
                <input
                  type="file"
                  accept=".zip,.rar"
                  className="hidden"
                  onChange={handleFileChange('demo')}
                />
              </label>
            </div>
          </div>

          {/* Havolalar */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Havolalar (ixtiyoriy)</h3>
            
            <ProfileFormField
              as="input"
              label="GitHub"
              value={form.github}
              onChange={(e) => setForm(prev => ({ ...prev, github: e.target.value }))}
              placeholder="https://github.com/username/repo"
              hint="GitHub repository havolasi"
            />

            <ProfileFormField
              as="input"
              label="Yaratilgan sayt"
              value={form.website}
              onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              hint="Loyihangizning sayti"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[rgba(112,145,190,.15)]">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setErrors({});
                setEditingApp(null);
              }}
              className="px-5 py-2.5 bg-gray-100 dark:bg-[#07172b] border border-gray-200 dark:border-[rgba(112,145,190,.25)] rounded-xl text-sm font-medium text-gray-700 dark:text-[#aab6c9] hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? "Saqlanmoqda..." : editingApp ? "O'zgarishlarni saqlash" : "Arizani yaratish"}
            </button>
          </div>
        </form>
      </ProfileModal>
    </ProfileShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#07172b] border border-[rgba(112,145,190,.16)] rounded-xl p-4">
      <p className="text-xs font-semibold text-[#718096] mb-1">{label}</p>
      <p className="text-sm text-white break-words">{value || "—"}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#aab6c9] mb-2">{label}</p>
      <div className="bg-[#07172b] border border-[rgba(112,145,190,.16)] rounded-xl p-4 text-sm text-white whitespace-pre-wrap break-words leading-6">
        {value || "—"}
      </div>
    </div>
  );
}

type ResourcePreview = {
  label: string;
  href: string;
  kind: "video" | "document" | "archive" | "link";
};

type PreviewData =
  | { type: "pptx"; fileName: string; slides: Array<{ number: number; text: string }> }
  | { type: "zip"; fileName: string; entries: Array<{ name: string; size: number }> }
  | { type: "unsupported"; fileName: string };

function DetailLink({ label, value, onPreview }: { label: string; value?: string | null; onPreview: (resource: ResourcePreview) => void }) {
  const isDownloadable = value?.startsWith("/uploads/");
  const canOpen = Boolean(value);
  const openHref = value ? normalizeHref(value) : "";

  return (
    <div className="bg-[#07172b] border border-[rgba(112,145,190,.16)] rounded-xl p-4">
      <p className="text-xs font-semibold text-[#718096] mb-1">{label}</p>
      {canOpen && value ? (
        <>
          <p className="text-sm text-white break-all">{getFileName(value)}</p>
          {isDownloadable && (
            <div className="mt-3">
              <a href={openHref} download className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/20">
                <Download size={13} /> Yuklab olish
              </a>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-white break-all">{value || "Yuklanmagan"}</p>
      )}
    </div>
  );
}

function ResourcePreviewModal({ resource, onClose }: { resource: ResourcePreview | null; onClose: () => void }) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    if (!resource || !resource.href.startsWith("/uploads/") || resource.kind === "video") {
      setPreviewData(null);
      setPreviewError("");
      return;
    }

    let ignore = false;
    setPreviewData(null);
    setPreviewError("");

    fetch(`${API_BASE_URL}/file-preview?path=${encodeURIComponent(resource.href)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message || "Faylni o'qib bo'lmadi");
        if (!ignore) setPreviewData(payload.data);
      })
      .catch((error) => {
        if (!ignore) setPreviewError(error instanceof Error ? error.message : "Faylni o'qib bo'lmadi");
      });

    return () => {
      ignore = true;
    };
  }, [resource]);

  if (!resource) return null;

  return (
    <ProfileModal isOpen={!!resource} onClose={onClose} title={resource.label} subtitle={getFileName(resource.href)} size="xl">
      <div className="space-y-4">
        <div className="min-h-[55vh] overflow-hidden rounded-xl border border-[rgba(112,145,190,.16)] bg-[#061326]">
          {resource.kind === "video" ? (
            <video src={resource.href} controls className="h-full min-h-[55vh] w-full bg-black" />
          ) : resource.href.startsWith("/uploads/") ? (
            <UploadedPreview data={previewData} error={previewError} kind={resource.kind} />
          ) : (
            <div className="flex h-[55vh] flex-col">
              <div className="border-b border-[rgba(112,145,190,.16)] px-4 py-3 text-sm text-[#aab6c9]">
                Agar sayt xavfsizlik sababli ichkarida ochilmasa, "Alohida ochish" tugmasidan foydalaning.
              </div>
              <iframe src={resource.href} title={resource.label} className="min-h-0 flex-1 w-full bg-white" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <a href={resource.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
            <ExternalLink size={16} /> Alohida ochish
          </a>
          {resource.href.startsWith("/uploads/") && (
            <a href={resource.href} download className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <Download size={16} /> Yuklab olish
            </a>
          )}
        </div>
      </div>
    </ProfileModal>
  );
}

function UploadedPreview({ data, error, kind }: { data: PreviewData | null; error: string; kind: ResourcePreview["kind"] }) {
  if (error) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center p-6 text-center">
        <FileUp className="mb-4 text-red-300" size={42} />
        <p className="text-base font-semibold text-white">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center text-sm text-[#aab6c9]">
        Fayl o'qilmoqda...
      </div>
    );
  }

  if (data.type === "pptx") {
    return (
      <div className="max-h-[55vh] overflow-y-auto p-5 space-y-4">
        {data.slides.length === 0 ? (
          <p className="text-sm text-[#aab6c9]">Slaydlarda o'qiladigan matn topilmadi.</p>
        ) : data.slides.map((slide) => (
          <div key={slide.number} className="rounded-xl border border-[rgba(112,145,190,.16)] bg-[#0a1b30] p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300">Slayd {slide.number}</div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-white">{slide.text}</p>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === "zip") {
    return (
      <div className="max-h-[55vh] overflow-y-auto p-5">
        <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-100">
          Demo arxiv ichidagi fayllar ro'yxati.
        </div>
        <div className="space-y-2">
          {data.entries.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(112,145,190,.16)] bg-[#0a1b30] px-4 py-3">
              <span className="min-w-0 break-all text-sm text-white">{entry.name}</span>
              <span className="shrink-0 text-xs text-[#718096]">{formatBytes(entry.size)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center p-6 text-center">
      <FileUp className="mb-4 text-purple-300" size={42} />
      <p className="text-base font-semibold text-white">
        {kind === "archive" ? "RAR arxivni brauzer ichida o'qib bo'lmaydi." : "Bu fayl turi uchun ichki ko'rish mavjud emas."}
      </p>
      <p className="mt-2 max-w-md text-sm text-[#aab6c9]">Faylni yuklab oling yoki alohida oynada oching.</p>
    </div>
  );
}

function getResourceKind(href: string): ResourcePreview["kind"] {
  const clean = href.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|ogg|mov)$/i.test(clean)) return "video";
  if (/\.(zip|rar|7z)$/i.test(clean)) return "archive";
  if (href.startsWith("http://") || href.startsWith("https://")) return "link";
  return "document";
}

function normalizeHref(href: string) {
  if (href.startsWith("/uploads/") || href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `https://${href.replace(/^\/+/, "")}`;
}

function getFileName(href: string) {
  try {
    return decodeURIComponent(href.split("/").pop()?.split("?")[0] || href);
  } catch {
    return href;
  }
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getApplicationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    submitted: "Qabul qilish bosqichida",
    under_review: "Ko'rib chiqilmoqda",
    needs_correction: "Tuzatish kerak",
    accepted: "Admin loyihani qabul qildi",
    rejected: "Rad etildi",
    next_stage: "Keyingi bosqichga o'tdi",
  };
  return labels[status] ?? status;
}

function getApplicationStatusClass(status: string) {
  const classes: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    under_review: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
    needs_correction: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    accepted: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    next_stage: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  };
  return classes[status] ?? classes.submitted;
}

function canEditApplication(app: Application) {
  return !["accepted", "next_stage"].includes(app.status);
}

function fileToUploadPayload(file: File) {
  return new Promise<{ name: string; contentType: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      contentType: file.type || "application/octet-stream",
      data: String(reader.result)
    });
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

async function parseApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: {
        message: response.status === 413
          ? "Fayl hajmi juda katta. Iltimos, kichikroq fayl yuklang."
          : `Server JSON o'rniga boshqa javob qaytardi (${response.status}).`
      }
    };
  }
}

function formatApiError(errorData: any, status?: number) {
  if (status === 413) {
    return "Fayl hajmi juda katta. Iltimos, kichikroq fayl yuklang.";
  }

  const details = errorData?.error?.details?.fieldErrors;
  if (details && typeof details === "object") {
    const messages = Object.entries(details)
      .flatMap(([field, value]) => {
        const text = Array.isArray(value) ? value.join(", ") : String(value);
        return text ? [`${field}: ${text}`] : [];
      });
    if (messages.length > 0) return messages.join("; ");
  }

  return errorData?.error?.message || "Ariza yaratilmadi";
}
