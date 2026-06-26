import { useState } from "react";
import { AlertCircle, Gavel, Plus, Eye, Upload, MessageSquare } from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileStatCard } from "../components/ui/ProfileStatCard";
import { ProfileStatusBadge, getAppealStatusBadge } from "../components/ui/ProfileStatusBadge";
import { ProfileModal } from "../components/ui/ProfileModal";
import { ProfileFormField } from "../components/ui/ProfileFormField";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";
import { type Appeal, type AppealReason } from "../data/appeals";

const reasonLabels: Record<AppealReason, string> = {
  procedure_violation: "Tanlov tartibi buzilgan",
  calculation_error: "Ball hisoblashda texnik xato",
  conflict_of_interest: "Manfaatlar to'qnashuvi",
  other: "Boshqa sabab",
};

export function AppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAppeal, setDetailAppeal] = useState<Appeal | null>(null);
  const [form, setForm] = useState({
    applicationNumber: "",
    projectName: "",
    reason: "" as AppealReason | "",
    description: "",
    agreed: false,
  });
  const [formErrors, setFormErrors] = useState({ applicationNumber: "", reason: "", description: "" });

  const handleSubmit = () => {
    const errs = { applicationNumber: "", reason: "", description: "" };
    if (!form.applicationNumber.trim()) errs.applicationNumber = "Ariza raqamini kiriting";
    if (!form.reason) errs.reason = "Sabab tanlang";
    if (!form.description.trim()) errs.description = "Izoh kiriting";
    setFormErrors(errs);
    if (errs.applicationNumber || errs.reason || errs.description) return;
    if (!form.agreed) { showToast("Shartlarga rozilikni tasdiqlang", "error"); return; }

    const newAppeal: Appeal = {
      id: `appeal_${Date.now()}`,
      applicationNumber: form.applicationNumber,
      projectName: form.projectName || form.applicationNumber,
      reason: form.reason as AppealReason,
      reasonText: reasonLabels[form.reason as AppealReason],
      description: form.description,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };
    setAppeals((prev) => [newAppeal, ...prev]);
    setCreateOpen(false);
    setForm({ applicationNumber: "", projectName: "", reason: "", description: "", agreed: false });
    showToast("Apellyatsiya muvaffaqiyatli yuborildi!", "success");
  };

  const stats = {
    total: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  };

  return (
    <ProfileShell>
      <ToastContainer />

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Apellyatsiyalar</h1>
          <p className="text-sm text-[#aab6c9]">Qaror yoki baholash bo'yicha apellyatsiya yuboring</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors"
        >
          <Plus size={15} />
          Apellyatsiya yuborish
        </button>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
        <p className="text-sm leading-6 text-amber-100">
          Siz musobaqa tugaganidan keyin 3 kun muddatda apellyatsiya bera olasiz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ProfileStatCard label="Jami" value={stats.total} icon={Gavel} color="blue" />
        <ProfileStatCard label="Ko'rib chiqilmoqda" value={stats.underReview} icon={MessageSquare} color="purple" />
        <ProfileStatCard label="Qanoatlantirilgan" value={stats.approved} icon={Gavel} color="green" />
        <ProfileStatCard label="Rad etilgan" value={stats.rejected} icon={Gavel} color="red" />
      </div>

      {/* Appeals list */}
      <div className="space-y-4">
        {appeals.map((appeal) => {
          const badge = getAppealStatusBadge(appeal.status);
          return (
            <div key={appeal.id} className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-white">{appeal.projectName}</p>
                    <span className="font-mono text-xs text-[#718096]">{appeal.applicationNumber}</span>
                    <ProfileStatusBadge label={badge.label} variant={badge.variant} />
                  </div>
                  <p className="text-xs text-amber-400 mb-1">{reasonLabels[appeal.reason]}</p>
                  <p className="text-xs text-[#aab6c9] line-clamp-2">{appeal.description}</p>
                  {appeal.submittedAt && (
                    <p className="text-[11px] text-[#718096] mt-2">
                      Yuborildi: {new Date(appeal.submittedAt).toLocaleDateString("uz-UZ")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setDetailAppeal(appeal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07172b] border border-[rgba(112,145,190,.18)] rounded-lg text-xs text-[#aab6c9] hover:text-white transition-colors flex-shrink-0"
                >
                  <Eye size={13} /> Ko'rish
                </button>
              </div>

              {appeal.adminResponse && (
                <div className="mt-4 p-3 bg-green-500/8 border border-green-500/20 rounded-xl">
                  <p className="text-xs text-green-400 font-semibold mb-1">Administrator javobi:</p>
                  <p className="text-xs text-[#aab6c9]">{appeal.adminResponse}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {appeals.length === 0 && (
        <div className="py-16 text-center bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl">
          <Gavel size={40} className="mx-auto mb-3 text-[#718096] opacity-50" />
          <p className="text-[#aab6c9] text-sm">Apellyatsiyalar yo'q</p>
        </div>
      )}

      {/* Create Modal */}
      <ProfileModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Apellyatsiya yuborish"
        subtitle="Barcha maydonlarni to'g'ri to'ldiring"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-sm text-[#aab6c9] hover:text-white transition-colors">
              Bekor qilish
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors">
              Yuborish
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <ProfileFormField as="input" label="Ariza raqami" required value={form.applicationNumber} onChange={(e) => setForm((p) => ({ ...p, applicationNumber: e.target.value }))} error={formErrors.applicationNumber} hint="Masalan: QSL-2024-0142" />
          <ProfileFormField as="input" label="Loyiha nomi" value={form.projectName} onChange={(e) => setForm((p) => ({ ...p, projectName: e.target.value }))} />
          <ProfileFormField
            as="select"
            label="Sabab"
            required
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value as AppealReason }))}
            error={formErrors.reason}
            options={[
              { value: "", label: "Tanlang" },
              ...Object.entries(reasonLabels).map(([v, l]) => ({ value: v, label: l })),
            ]}
          />
          <ProfileFormField as="textarea" label="Izoh" required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} error={formErrors.description} hint="Muammoni batafsil tushuntiring" />
          <div className="flex items-start gap-4 p-3 bg-[#07172b] border border-[rgba(112,145,190,.12)] rounded-xl">
            <Upload size={16} className="text-[#718096] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-white mb-1">Tasdiqlovchi hujjat (ixtiyoriy)</p>
              <label className="text-xs text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                Fayl yuklash
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={() => showToast("Fayl yuklandi (demo)", "success")} />
              </label>
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.agreed} onChange={(e) => setForm((p) => ({ ...p, agreed: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-blue-500" />
            <span className="text-xs text-[#aab6c9]">Apellyatsiya tartibi bilan tanishganman va ma'lumotlar to'g'ri ekanini tasdiqlayman</span>
          </label>
        </div>
      </ProfileModal>

      {/* Detail Modal */}
      {detailAppeal && (
        <ProfileModal isOpen onClose={() => setDetailAppeal(null)} title="Apellyatsiya tafsilotlari" size="md">
          <div className="space-y-4">
            {[
              ["Ariza raqami", detailAppeal.applicationNumber],
              ["Loyiha", detailAppeal.projectName],
              ["Sabab", reasonLabels[detailAppeal.reason]],
              ["Holat", getAppealStatusBadge(detailAppeal.status).label],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-[rgba(112,145,190,.1)]">
                <span className="text-xs text-[#718096]">{label}</span>
                <span className="text-xs font-semibold text-white text-right">{value}</span>
              </div>
            ))}
            <div>
              <p className="text-xs text-[#718096] mb-2">Izoh</p>
              <p className="text-sm text-[#aab6c9]">{detailAppeal.description}</p>
            </div>
            {detailAppeal.adminResponse && (
              <div className="p-4 bg-green-500/8 border border-green-500/20 rounded-xl">
                <p className="text-xs font-bold text-green-400 mb-2">Administrator javobi</p>
                <p className="text-sm text-[#aab6c9]">{detailAppeal.adminResponse}</p>
                {detailAppeal.respondedAt && (
                  <p className="text-[11px] text-[#718096] mt-2">{new Date(detailAppeal.respondedAt).toLocaleDateString("uz-UZ")}</p>
                )}
              </div>
            )}
          </div>
        </ProfileModal>
      )}
    </ProfileShell>
  );
}
