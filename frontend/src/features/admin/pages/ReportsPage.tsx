import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState } from "react";
import { FileText, Download, Printer, FileSpreadsheet, FileJson, Calendar, Filter } from "lucide-react";

const reportTypes = [
  { id: "users", name: "Foydalanuvchilar", description: "Ro'yxatdan o'tganlar, faollar, rollar" },
  { id: "applications", name: "Arizalar", description: "Barcha arizalar va statuslar" },
  { id: "otm", name: "OTMlar", description: "OTM bo'yicha statistika" },
  { id: "regions", name: "Hududlar", description: "Tuman/shahar bo'yicha taqsimot" },
  { id: "directions", name: "Yo'nalishlar", description: "Yo'nalishlar bo'yicha arizalar" },
  { id: "judges", name: "Hakamlar", description: "Hakamlar faoliyati va baholash" },
  { id: "evaluations", name: "Baholash", description: "Ballar, hakamlar, natijalar" },
  { id: "winners", name: "G'oliblar", description: "1-3 o'rin va maxsus nominatsiyalar" },
  { id: "finalists", name: "Finalchilar", description: "Final bosqichidagi barcha loyihalar" },
  { id: "appeals", name: "Apellyatsiyalar", description: "Murojatlar va qarorlar" },
  { id: "certificates", name: "Sertifikatlar", description: "Berilgan sertifikatlar" },
  { id: "monitoring", name: "Monitoring", description: "6 oylik kuzatuv natijalari" },
];

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-12-31");

  const handleExport = (format: "csv" | "json" | "excel" | "pdf") => {
    if (!selectedReport) {
      alert("Iltimos, hisobot turini tanlang");
      return;
    }
    // Mock export
    console.log(`Exporting ${selectedReport} as ${format} from ${dateFrom} to ${dateTo}`);
    alert(`${selectedReport} hisoboti ${format.toUpperCase()} formatda eksport qilindi (demo)`);
  };

  return (
    <AdminShell>
      <AdminPageHeader
        title="Hisobotlar"
        subtitle="Turli hisobotlarni yaratish va eksport qilish"
        actions={
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Download size={16} />
            <span>Hisobotni eksport qilish</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Filter size={18} />
              Filtrlar
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Hisobot turi</label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Tanlang...</option>
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Boshlanish sanasi</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Tugash sanasi</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--admin-border)]">
              <h4 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Eksport formati</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm"
                >
                  <FileText size={16} />
                  CSV
                </button>
                <button
                  onClick={() => handleExport("json")}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm"
                >
                  <FileJson size={16} />
                  JSON
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm"
                >
                  <FileSpreadsheet size={16} />
                  Excel
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm"
                >
                  <Printer size={16} />
                  PDF
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-blue-400">
                <strong>Eslatma:</strong> CSV va JSON formatda eksport real ishлайди. Excel/PDF uchun backend yoki kutubxona integratsiyasi talab qilinadi.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Report Types Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`text-left p-6 rounded-xl border-2 transition-all ${
                  selectedReport === type.id
                    ? "bg-blue-500/10 border-blue-500/50"
                    : "bg-[var(--admin-surface)] border-[var(--admin-border)] hover:border-blue-500/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText size={24} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{type.name}</h3>
                    <p className="text-sm text-[var(--admin-text-secondary)]">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
