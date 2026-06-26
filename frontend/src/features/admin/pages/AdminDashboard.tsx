import { AdminShell } from "../components/layout/AdminShell";
import { AdminStatCard } from "../components/dashboard/AdminStatCard";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  statsData,
  applicationsTrendData,
  applicationsByDirectionData,
  stagesProgressData,
  recentApplicationsData,
  regionalDistributionData,
} from "../data/dashboard";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, RefreshCw, Calendar, Eye, Edit, Link as LinkIcon, Clock } from "lucide-react";
import { lazy, Suspense, useState } from "react";

const CompetitionsPage = lazy(() => import("./CompetitionsPage").then((module) => ({ default: module.CompetitionsPage })));
const UsersPage = lazy(() => import("./UsersPage").then((module) => ({ default: module.UsersPage })));
const ApplicationsPage = lazy(() => import("./ApplicationsPage").then((module) => ({ default: module.ApplicationsPage })));
const CoordinatorsPage = lazy(() => import("./CoordinatorsPage").then((module) => ({ default: module.CoordinatorsPage })));
const JudgesPage = lazy(() => import("./JudgesPage").then((module) => ({ default: module.JudgesPage })));
const DirectionsPage = lazy(() => import("./DirectionsPage").then((module) => ({ default: module.DirectionsPage })));
const InstitutionsPage = lazy(() => import("./InstitutionsPage").then((module) => ({ default: module.InstitutionsPage })));
const RegionsPage = lazy(() => import("./RegionsPage").then((module) => ({ default: module.RegionsPage })));
const StagesPage = lazy(() => import("./StagesPage").then((module) => ({ default: module.StagesPage })));
const EvaluationsPage = lazy(() => import("./EvaluationsPage").then((module) => ({ default: module.EvaluationsPage })));
const ResultsPage = lazy(() => import("./ResultsPage").then((module) => ({ default: module.ResultsPage })));
const AppealsPage = lazy(() => import("./AppealsPage").then((module) => ({ default: module.AppealsPage })));
const CertificatesPage = lazy(() => import("./CertificatesPage").then((module) => ({ default: module.CertificatesPage })));
const MonitoringPage = lazy(() => import("./MonitoringPage").then((module) => ({ default: module.MonitoringPage })));
const NotificationsPage = lazy(() => import("./NotificationsPage").then((module) => ({ default: module.NotificationsPage })));
const ReportsPage = lazy(() => import("./ReportsPage").then((module) => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import("./SettingsPage").then((module) => ({ default: module.SettingsPage })));

function AdminRouteFallback() {
  return (
    <AdminShell>
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-semibold text-[var(--admin-text-secondary)]">
        Yuklanmoqda...
      </div>
    </AdminShell>
  );
}

function DashboardHome() {
  const [activeTab, setActiveTab] = useState<"regions" | "universities">("regions");

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Boshqaruv paneli</h1>
            <p className="text-[var(--admin-text-secondary)]">
              Qashqadaryo Startup Ligasi bo'yicha asosiy ko'rsatkichlar va jarayonlar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Calendar size={16} />
              <span>Oxirgi 30 kun</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Download size={16} />
              <span>Hisobotni eksport qilish</span>
            </button>
            <button
              className="p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
              aria-label="Yangilash"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => (
          <AdminStatCard key={stat.id} data={stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Applications Trend */}
        <div className="lg:col-span-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Arizalar dinamikasi</h3>
              <p className="text-sm text-[var(--admin-text-muted)]">Oxirgi 6 oy</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={applicationsTrendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f7df6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2f7df6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#aab6c9" style={{ fontSize: 12 }} />
              <YAxis stroke="#aab6c9" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a1b30",
                  border: "1px solid rgba(112, 145, 190, 0.18)",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#2f7df6" strokeWidth={2} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Applications by Direction */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Yo'nalishlar</h3>
            <p className="text-sm text-[var(--admin-text-muted)]">Bo'yicha arizalar</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={applicationsByDirectionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {applicationsByDirectionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a1b30",
                  border: "1px solid rgba(112, 145, 190, 0.18)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {applicationsByDirectionData.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--admin-text-secondary)]">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress + Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stages Progress */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Bosqichlar bo'yicha holat</h3>
          <div className="space-y-4">
            {stagesProgressData.map((stage) => (
              <div key={stage.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--admin-text-secondary)]">{stage.name}</span>
                  <span className="text-sm font-semibold text-white">{stage.percentage}%</span>
                </div>
                <div className="h-2 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stage.status === "completed"
                        ? "bg-green-500"
                        : stage.status === "in-progress"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  {stage.current} / {stage.total}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">So'nggi arizalar</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Barchasini ko'rish →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)]">
                  <th className="text-left py-3 px-2 text-[var(--admin-text-muted)] font-medium">ID</th>
                  <th className="text-left py-3 px-2 text-[var(--admin-text-muted)] font-medium">Jamoa nomi</th>
                  <th className="text-left py-3 px-2 text-[var(--admin-text-muted)] font-medium">Yo'nalish</th>
                  <th className="text-left py-3 px-2 text-[var(--admin-text-muted)] font-medium">Sana</th>
                  <th className="text-left py-3 px-2 text-[var(--admin-text-muted)] font-medium">Holat</th>
                  <th className="text-right py-3 px-2 text-[var(--admin-text-muted)] font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicationsData.map((app) => (
                  <tr key={app.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-3 px-2 text-[var(--admin-text-secondary)]">{app.id}</td>
                    <td className="py-3 px-2 text-white font-medium">{app.teamName}</td>
                    <td className="py-3 px-2 text-[var(--admin-text-secondary)]">{app.direction}</td>
                    <td className="py-3 px-2 text-[var(--admin-text-secondary)]">{app.submittedDate}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === "new"
                            ? "bg-blue-500/20 text-blue-400"
                            : app.status === "sorting"
                            ? "bg-cyan-500/20 text-cyan-400"
                            : app.status === "judging"
                            ? "bg-purple-500/20 text-purple-400"
                            : app.status === "final"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {app.stage}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 hover:bg-[var(--admin-bg)] rounded transition-colors" aria-label="Ko'rish">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-[var(--admin-bg)] rounded transition-colors" aria-label="Tahrirlash">
                          <Edit size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-[var(--admin-bg)] rounded transition-colors" aria-label="Biriktirish">
                          <LinkIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Hududlar va OTMlar bo'yicha taqsimot</h3>
            <p className="text-sm text-[var(--admin-text-muted)]">Arizalar soni</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("regions")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "regions"
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] hover:text-white"
              }`}
            >
              Hududlar
            </button>
            <button
              onClick={() => setActiveTab("universities")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "universities"
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] hover:text-white"
              }`}
            >
              OTMlar
            </button>
          </div>
        </div>

        {activeTab === "regions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simplified Map Placeholder */}
            <div className="bg-[var(--admin-bg)] rounded-xl p-6 flex items-center justify-center border border-[var(--admin-border)]">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <svg viewBox="0 0 200 200" className="w-full h-full p-8">
                    <path
                      d="M100,40 L140,80 L140,140 L100,180 L60,140 L60,80 Z"
                      fill="rgba(47,125,246,0.2)"
                      stroke="#2f7df6"
                      strokeWidth="2"
                    />
                    <circle cx="100" cy="100" r="8" fill="#2f7df6" />
                    <text x="100" y="105" textAnchor="middle" fill="#fff" fontSize="12">
                      Qashqadaryo
                    </text>
                  </svg>
                </div>
                <p className="text-sm text-[var(--admin-text-muted)]">Hududiy taqsimot</p>
              </div>
            </div>

            {/* Regional List */}
            <div className="space-y-3">
              {regionalDistributionData.map((region, idx) => {
                const maxCount = regionalDistributionData[0].count;
                const percentage = (region.count / maxCount) * 100;

                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{region.region}</span>
                      <span className="text-sm font-semibold text-white">{region.count}</span>
                    </div>
                    <div className="h-2 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "universities" && (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto mb-4 text-[var(--admin-text-muted)]" />
            <p className="text-[var(--admin-text-secondary)]">OTMlar bo'yicha ma'lumotlar ishlab chiqilmoqda</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export function AdminDashboard() {
  const location = useLocation();
  const isDashboardHome = location.pathname === "/admin";

  // If on dashboard home, show full dashboard
  if (isDashboardHome) {
    return <DashboardHome />;
  }

  // Otherwise show routed pages
  return (
    <Suspense fallback={<AdminRouteFallback />}>
      <Routes>
        <Route path="competitions" element={<CompetitionsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="coordinators" element={<CoordinatorsPage />} />
        <Route path="judges" element={<JudgesPage />} />
        <Route path="directions" element={<DirectionsPage />} />
        <Route path="institutions" element={<InstitutionsPage />} />
        <Route path="regions" element={<RegionsPage />} />
        <Route path="stages" element={<StagesPage />} />
        <Route path="evaluations" element={<EvaluationsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="appeals" element={<AppealsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
