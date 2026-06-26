import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState } from "react";
import {
  Settings, Globe, Trophy, BarChart3, Shield, Link2,
  Bell, Lock, HardDrive, Database, Save, CheckCircle,
  AlertTriangle, RefreshCw,
} from "lucide-react";

const tabs = [
  { id: "general", label: "Umumiy", icon: Globe },
  { id: "competition", label: "Tanlov", icon: Trophy },
  { id: "evaluation", label: "Baholash", icon: BarChart3 },
  { id: "roles", label: "Rollar", icon: Shield },
  { id: "integrations", label: "Integratsiyalar", icon: Link2 },
  { id: "notifications", label: "Bildirishnomalar", icon: Bell },
  { id: "security", label: "Xavfsizlik", icon: Lock },
  { id: "files", label: "Fayllar", icon: HardDrive },
  { id: "backup", label: "Backup", icon: Database },
];

const integrations = [
  { id: "oneid", name: "OneID", description: "Davlat identifikatsiya tizimi", status: "connected", lastTest: "2024-06-22 10:00" },
  { id: "sms", name: "SMS Gateway", description: "Eskiz / SMSC provayderи", status: "connected", lastTest: "2024-06-22 09:00" },
  { id: "smtp", name: "SMTP / Email", description: "Xabar yuborish uchun pochta serveri", status: "connected", lastTest: "2024-06-22 08:00" },
  { id: "telegram", name: "Telegram Bot", description: "Bildirishnomalar uchun bot", status: "error", lastTest: "2024-06-21 15:00" },
  { id: "google", name: "Google OAuth", description: "Google orqali kirish", status: "disconnected", lastTest: "—" },
  { id: "storage", name: "File Storage", description: "Fayllarni saqlash", status: "connected", lastTest: "2024-06-22 10:00" },
];

const integrationStatusCfg = {
  connected: { label: "Ulangan", color: "bg-green-500/20 text-green-400" },
  error: { label: "Xatolik", color: "bg-red-500/20 text-red-400" },
  disconnected: { label: "Ulanmagan", color: "bg-gray-500/20 text-gray-400" },
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  // General settings state
  const [platformName, setPlatformName] = useState("Qashqadaryo Startup Ligasi");
  const [contactEmail, setContactEmail] = useState("info@startup.qashqadaryo.uz");
  const [timezone, setTimezone] = useState("Asia/Tashkent");
  const [maintenance, setMaintenance] = useState(false);

  // Security settings state
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [failedLoginLimit, setFailedLoginLimit] = useState("5");
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminShell>
      <AdminPageHeader
        title="Sozlamalar"
        subtitle="Platforma va tizim sozlamalari"
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            <span>{saved ? "Saqlandi!" : "Saqlash"}</span>
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg)] hover:text-white"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">

          {/* GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Umumiy sozlamalar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Platforma nomi</label>
                  <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Aloqa email</label>
                  <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Vaqt zonasi</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Domen</label>
                  <input defaultValue="startup.qashqadaryo.uz" className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
                <div>
                  <div className="font-medium text-white">Texnik ishlar rejimi</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">Faol bo'lganda faqat adminlar kirishi mumkin</div>
                </div>
                <button
                  onClick={() => setMaintenance(!maintenance)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${maintenance ? "bg-amber-500" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintenance ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          )}

          {/* COMPETITION */}
          {activeTab === "competition" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Tanlov sozlamalari</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Minimal yosh</label>
                  <input type="number" defaultValue={16} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Maksimal yosh</label>
                  <input type="number" defaultValue={35} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Jamoa minimal a'zo</label>
                  <input type="number" defaultValue={2} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Jamoa maksimal a'zo</label>
                  <input type="number" defaultValue={5} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">1-o'rin mukofoti (so'm)</label>
                  <input defaultValue="50000000" className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Apellyatsiya muddati (kun)</label>
                  <input type="number" defaultValue={7} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* EVALUATION */}
          {activeTab === "evaluation" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Baholash sozlamalari</h3>
              <div className="space-y-3">
                {[
                  { name: "Muammoning dolzarbligi", max: 15 },
                  { name: "Yechim samaradorligi va innovatsionligi", max: 15 },
                  { name: "MVP / Prototip", max: 15 },
                  { name: "Bozor va mijozlar", max: 15 },
                  { name: "Joriy etish va pilot", max: 15 },
                  { name: "Biznes model va moliyaviy barqarorlik", max: 10 },
                  { name: "Jamoa salohiyati", max: 10 },
                  { name: "Taqdimot va javob", max: 5 },
                ].map((criterion) => (
                  <div key={criterion.name} className="flex items-center gap-4 p-3 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)]">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{criterion.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--admin-text-muted)] text-sm">Maks:</span>
                      <input type="number" defaultValue={criterion.max} className="w-16 px-2 py-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded text-white text-center focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">20 ball tafovut ogohlantirish</div>
                    <div className="text-sm text-[var(--admin-text-secondary)]">Hakamlar orasida 20+ ball farq bo'lganda ogohlantirish</div>
                  </div>
                  <input type="number" defaultValue={20} className="w-20 px-2 py-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded text-white text-center focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Integratsiyalar</h3>
              <div className="space-y-4">
                {integrations.map((intg) => {
                  const cfg = integrationStatusCfg[intg.status as keyof typeof integrationStatusCfg];
                  return (
                    <div key={intg.id} className="p-4 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--admin-surface)] flex items-center justify-center">
                            <Link2 size={18} className="text-blue-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{intg.name}</div>
                            <div className="text-xs text-[var(--admin-text-muted)]">{intg.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-xs">
                            <RefreshCw size={12} />
                            Test
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-[var(--admin-text-muted)]">Oxirgi test: {intg.lastTest}</div>
                      <div className="mt-2 text-xs text-amber-400/80 flex items-center gap-1.5">
                        <AlertTriangle size={12} />
                        Demo rejimda haqiqiy credentials yuborilmaydi
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Xavfsizlik sozlamalari</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Sessiya muddati (daqiqa)</label>
                  <input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Noto'g'ri kirish limiti</label>
                  <input type="number" value={failedLoginLimit} onChange={(e) => setFailedLoginLimit(e.target.value)} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
                <div>
                  <div className="font-medium text-white">Ikki bosqichli autentifikatsiya (2FA)</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">Adminlar uchun OTP talab qilish</div>
                </div>
                <button
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${twoFactor ? "bg-blue-500" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${twoFactor ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          )}

          {/* FILES */}
          {activeTab === "files" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Fayl sozlamalari</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Ruxsat etilgan formatlar</label>
                  <input defaultValue="pdf, docx, pptx, jpg, png, mp4" className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Maksimal hajm (MB)</label>
                  <input type="number" defaultValue={50} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Video maksimal davomiyligi (daqiqa)</label>
                  <input type="number" defaultValue={5} className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="flex items-center gap-3 p-4 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
                  <CheckCircle size={20} className="text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Antivirus skan</div>
                    <div className="text-xs text-[var(--admin-text-muted)]">Barcha fayllар tekshiriladi</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BACKUP */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Backup va tiklash</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Oxirgi backup", value: "2024-06-22 03:00", color: "text-green-400" },
                  { label: "Backup hajmi", value: "2.4 GB", color: "text-blue-400" },
                  { label: "Saqlash muddati", value: "30 kun", color: "text-purple-400" },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
                    <div className="text-sm text-[var(--admin-text-secondary)] mb-1">{item.label}</div>
                    <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
                  <Database size={16} />
                  Hozir backup olish
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
                  <RefreshCw size={16} />
                  Tiklash
                </button>
              </div>
            </div>
          )}

          {/* ROLES */}
          {activeTab === "roles" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Rollar va vakolatlar</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)]">
                      <th className="text-left py-3 px-4 text-[var(--admin-text-secondary)]">Vakolat</th>
                      {["Admin", "Kotib", "Koordinator", "Hakam", "Ekspert"].map((role) => (
                        <th key={role} className="text-center py-3 px-4 text-[var(--admin-text-secondary)]">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["Ko'rish", "Qo'shish", "Tahrirlash", "Tasdiqlash", "Eksport", "Bloklash", "O'chirish"].map((perm) => (
                      <tr key={perm} className="border-b border-[var(--admin-border)]">
                        <td className="py-3 px-4 text-[var(--admin-text-secondary)]">{perm}</td>
                        {[true, perm !== "O'chirish" && perm !== "Bloklash", false, false, false].map((checked, i) => (
                          <td key={i} className="text-center py-3 px-4">
                            <input type="checkbox" defaultChecked={!!checked} className="w-4 h-4 accent-blue-500 cursor-pointer" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Bildirishnoma shablonlari</h3>
              <div className="space-y-3">
                {["Ariza qabul qilindi", "Tuzatishga qaytarildi", "Saralash natijalari", "Final tadbiri", "G'olib e'loni", "Monitoring eslatmasi"].map((tmpl) => (
                  <div key={tmpl} className="flex items-center justify-between p-4 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
                    <div className="font-medium text-white">{tmpl}</div>
                    <div className="flex gap-2">
                      {["SMS", "Email", "Telegram"].map((ch) => (
                        <label key={ch} className="flex items-center gap-1.5 text-sm text-[var(--admin-text-secondary)] cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500" />
                          {ch}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminShell>
  );
}
