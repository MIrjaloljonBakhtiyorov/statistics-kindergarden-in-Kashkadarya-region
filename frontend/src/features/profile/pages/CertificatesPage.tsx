import { useState } from "react";
import { Award, Download, Eye, Info, QrCode, Share2 } from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileStatCard } from "../components/ui/ProfileStatCard";
import { ProfileModal } from "../components/ui/ProfileModal";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";
import { type Certificate } from "../data/certificates";

const statusConfig = {
  issued:     { label: "Yaratilgan",    color: "text-blue-400"   },
  downloaded: { label: "Yuklab olingan", color: "text-green-400" },
  sent:       { label: "Yuborilgan",    color: "text-cyan-400"   },
};

export function CertificatesPage() {
  const [certs] = useState<Certificate[]>([]);  // Hozircha bo'sh, kelajakda API bilan bog'lanadi
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  return (
    <ProfileShell>
      <ToastContainer />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Sertifikatlar</h1>
        <p className="text-sm text-[#aab6c9]">Tanlov sertifikatlaringizni ko'ring va yuklab oling</p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4">
        <Info size={18} className="mt-0.5 flex-shrink-0 text-blue-400" />
        <p className="text-sm leading-6 text-blue-100">
          Siz musobaqa g'alaba qozonsangiz, sizga tizim orqali online sertifikat taqdim etiladi.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ProfileStatCard label="Jami sertifikatlar" value={0} icon={Award} color="blue" />
        <ProfileStatCard label="Yuklab olingan" value={0} icon={Download} color="green" />
        <ProfileStatCard label="Yuborilgan" value={0} icon={Award} color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {certs.map((cert) => {
          const sc = statusConfig[cert.status];
          return (
            <div key={cert.id} className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl overflow-hidden">
              {/* Certificate header */}
              <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-[rgba(112,145,190,.15)] px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-400/20">
                    <Award size={22} className="text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">{cert.title}</p>
                    <p className="text-xs text-[#aab6c9] mt-0.5">{cert.competition}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[#718096]">Loyiha</p>
                    <p className="text-white font-medium">{cert.project}</p>
                  </div>
                  <div>
                    <p className="text-[#718096]">Bosqich</p>
                    <p className="text-white font-medium">{cert.stage}</p>
                  </div>
                  <div>
                    <p className="text-[#718096]">Natija</p>
                    <p className="text-yellow-400 font-semibold">{cert.result}</p>
                  </div>
                  <div>
                    <p className="text-[#718096]">Berilgan sana</p>
                    <p className="text-white font-medium">{cert.issuedAt}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[11px] text-[#718096]">{cert.certificateNumber}</span>
                  <span className={`text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => setPreviewCert(cert)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07172b] border border-[rgba(112,145,190,.18)] rounded-lg text-xs text-[#aab6c9] hover:text-white transition-colors flex-1 justify-center">
                    <Eye size={13} /> Ko'rish
                  </button>
                  <button onClick={() => showToast("PDF yuklab olindi (demo)", "success")} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/25 rounded-lg text-xs text-blue-400 hover:bg-blue-600/30 transition-colors flex-1 justify-center">
                    <Download size={13} /> PDF
                  </button>
                  <button onClick={() => showToast("QR kod ko'rsatildi (demo)", "info")} className="p-2 bg-[#07172b] border border-[rgba(112,145,190,.18)] rounded-lg text-xs text-[#aab6c9] hover:text-white transition-colors">
                    <QrCode size={14} />
                  </button>
                  <button onClick={() => showToast("Havola nusxalandi (demo)", "success")} className="p-2 bg-[#07172b] border border-[rgba(112,145,190,.18)] rounded-lg text-xs text-[#aab6c9] hover:text-white transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {certs.length === 0 && (
        <div className="py-16 text-center bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl">
          <Award size={40} className="mx-auto mb-3 text-[#718096] opacity-50" />
          <p className="text-[#aab6c9] text-sm">Hali sertifikat yo'q</p>
        </div>
      )}

      {previewCert && (
        <ProfileModal isOpen onClose={() => setPreviewCert(null)} title="Sertifikat" size="md">
          <div className="bg-gradient-to-br from-[#07172b] to-[#0a1b30] border border-[rgba(112,145,190,.25)] rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/20 flex items-center justify-center mx-auto border border-yellow-400/30">
              <Award size={30} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-[#718096] uppercase tracking-widest mb-2">Sertifikat</p>
              <h3 className="text-xl font-black text-white">{previewCert.title}</h3>
            </div>
            <p className="text-sm text-[#aab6c9]">{previewCert.competition}</p>
            <div className="border-t border-[rgba(112,145,190,.15)] pt-4 space-y-1">
              <p className="text-base font-bold text-yellow-400">{previewCert.result}</p>
              <p className="text-sm text-white">{previewCert.project}</p>
              <p className="text-xs text-[#718096]">{previewCert.issuedAt}</p>
            </div>
            <p className="font-mono text-xs text-[#718096]">{previewCert.certificateNumber}</p>
            <button onClick={() => showToast("PDF yuklab olindi (demo)", "success")} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors">
              PDF yuklab olish
            </button>
          </div>
        </ProfileModal>
      )}
    </ProfileShell>
  );
}
