import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";

const ProfileLoginPage = lazy(() => import("./pages/ProfileLoginPage").then((module) => ({ default: module.ProfileLoginPage })));
const OverviewPage = lazy(() => import("./pages/OverviewPage").then((module) => ({ default: module.OverviewPage })));
const PersonalPage = lazy(() => import("./pages/PersonalPage").then((module) => ({ default: module.PersonalPage })));
const ParticipationPage = lazy(() => import("./pages/ParticipationPage").then((module) => ({ default: module.ParticipationPage })));
const TeamsPage = lazy(() => import("./pages/TeamsPage").then((module) => ({ default: module.TeamsPage })));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage").then((module) => ({ default: module.ApplicationsPage })));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage").then((module) => ({ default: module.CertificatesPage })));
const AppealsPage = lazy(() => import("./pages/AppealsPage").then((module) => ({ default: module.AppealsPage })));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage").then((module) => ({ default: module.RoadmapPage })));
const MonitoringPage = lazy(() => import("./pages/MonitoringPage").then((module) => ({ default: module.MonitoringPage })));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage").then((module) => ({ default: module.NotificationsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));

function ProfileRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-sm font-semibold text-slate-600">
      Yuklanmoqda...
    </div>
  );
}

/** Simple localStorage-based auth guard for demo */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userId } = useParams();
  const storedUser = localStorage.getItem("profileUser");

  if (!storedUser) {
    return <Navigate to="/profile/login" state={{ from: location }} replace />;
  }

  if (userId) {
    const user = JSON.parse(storedUser) as { id?: string };
    if (user.id && user.id !== userId) {
      return <Navigate to={`/profile/${user.id}/overview`} replace />;
    }
  }

  return <>{children}</>;
}

function protectedRoutes(prefix = "") {
  const routePrefix = prefix ? `${prefix}/` : "";

  return [
    <Route key={`${routePrefix}overview`} path={`${routePrefix}overview`} element={<RequireAuth><OverviewPage /></RequireAuth>} />,
    <Route key={`${routePrefix}personal`} path={`${routePrefix}personal`} element={<RequireAuth><PersonalPage /></RequireAuth>} />,
    <Route key={`${routePrefix}participation`} path={`${routePrefix}participation`} element={<RequireAuth><ParticipationPage /></RequireAuth>} />,
    <Route key={`${routePrefix}teams`} path={`${routePrefix}teams`} element={<RequireAuth><TeamsPage /></RequireAuth>} />,
    <Route key={`${routePrefix}applications`} path={`${routePrefix}applications`} element={<RequireAuth><ApplicationsPage /></RequireAuth>} />,
    <Route key={`${routePrefix}certificates`} path={`${routePrefix}certificates`} element={<RequireAuth><CertificatesPage /></RequireAuth>} />,
    <Route key={`${routePrefix}appeals`} path={`${routePrefix}appeals`} element={<RequireAuth><AppealsPage /></RequireAuth>} />,
    <Route key={`${routePrefix}roadmap`} path={`${routePrefix}roadmap`} element={<RequireAuth><RoadmapPage /></RequireAuth>} />,
    <Route key={`${routePrefix}monitoring`} path={`${routePrefix}monitoring`} element={<RequireAuth><MonitoringPage /></RequireAuth>} />,
    <Route key={`${routePrefix}notifications`} path={`${routePrefix}notifications`} element={<RequireAuth><NotificationsPage /></RequireAuth>} />,
    <Route key={`${routePrefix}settings`} path={`${routePrefix}settings`} element={<RequireAuth><SettingsPage /></RequireAuth>} />
  ];
}

export function ProfileRouter() {
  const storedUser = localStorage.getItem("profileUser");
  const storedUserId = storedUser ? (JSON.parse(storedUser) as { id?: string }).id : undefined;
  const defaultProfilePath = storedUserId ? `/profile/${storedUserId}/overview` : "/profile/overview";

  return (
    <Suspense fallback={<ProfileRouteFallback />}>
      <Routes>
        {/* Public: login */}
        <Route path="login" element={<ProfileLoginPage />} />

        {/* Root redirect */}
        <Route index element={<Navigate to={defaultProfilePath} replace />} />

        {/* Protected pages */}
        {protectedRoutes()}
        {protectedRoutes(":userId")}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={defaultProfilePath} replace />} />
      </Routes>
    </Suspense>
  );
}
