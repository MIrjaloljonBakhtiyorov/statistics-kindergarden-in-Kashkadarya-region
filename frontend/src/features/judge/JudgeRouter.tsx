import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { JudgeAuthProvider, useJudgeAuth } from "./context/JudgeAuthContext";

const JudgeLogin = lazy(() => import("./pages/JudgeLogin").then((module) => ({ default: module.JudgeLogin })));
const JudgeDashboard = lazy(() => import("./pages/JudgeDashboard").then((module) => ({ default: module.JudgeDashboard })));
const JudgeProjectsPage = lazy(() => import("./pages/JudgeProjectsPage").then((module) => ({ default: module.JudgeProjectsPage })));
const JudgeProjectDetail = lazy(() => import("./pages/JudgeProjectDetail").then((module) => ({ default: module.JudgeProjectDetail })));
const JudgeEvaluatePage = lazy(() => import("./pages/JudgeEvaluatePage").then((module) => ({ default: module.JudgeEvaluatePage })));
const JudgeCompletedPage = lazy(() => import("./pages/JudgeCompletedPage").then((module) => ({ default: module.JudgeCompletedPage })));
const JudgeGuidelinesPage = lazy(() => import("./pages/JudgeGuidelinesPage").then((module) => ({ default: module.JudgeGuidelinesPage })));
const JudgeProfilePage = lazy(() => import("./pages/JudgeProfilePage").then((module) => ({ default: module.JudgeProfilePage })));
const JudgeNotificationsPage = lazy(() => import("./pages/JudgeNotificationsPage").then((module) => ({ default: module.JudgeNotificationsPage })));

function RequireJudgeAuth({ children }: { children: React.ReactNode }) {
  const { judge, loading } = useJudgeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !judge) {
      navigate("/judge/login", { replace: true });
    }
  }, [judge, loading, navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F5F7FA", fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: "0 auto 12px",
            background: "linear-gradient(135deg, #D6A21E, #b8850f)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "white", fontSize: 22 }}>🏆</span>
          </div>
          <div style={{ fontSize: 14, color: "#667085" }}>Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (!judge) return null;
  return <>{children}</>;
}

function JudgeRoutesInner() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F5F7FA", fontFamily: "'Inter', system-ui, sans-serif", color: "#667085", fontSize: 14
      }}>
        Yuklanmoqda...
      </div>
    }>
      <Routes>
        <Route path="login" element={<JudgeLogin />} />

        <Route path="dashboard" element={
          <RequireJudgeAuth><JudgeDashboard /></RequireJudgeAuth>
        } />
        <Route path="projects" element={
          <RequireJudgeAuth><JudgeProjectsPage /></RequireJudgeAuth>
        } />
        <Route path="projects/pending" element={
          <RequireJudgeAuth><JudgeProjectsPage pendingOnly /></RequireJudgeAuth>
        } />
        <Route path="projects/:projectId" element={
          <RequireJudgeAuth><JudgeProjectDetail /></RequireJudgeAuth>
        } />
        <Route path="projects/:projectId/evaluate" element={
          <RequireJudgeAuth><JudgeEvaluatePage /></RequireJudgeAuth>
        } />
        <Route path="evaluations/completed" element={
          <RequireJudgeAuth><JudgeCompletedPage /></RequireJudgeAuth>
        } />
        <Route path="guidelines" element={
          <RequireJudgeAuth><JudgeGuidelinesPage /></RequireJudgeAuth>
        } />
        <Route path="profile" element={
          <RequireJudgeAuth><JudgeProfilePage /></RequireJudgeAuth>
        } />
        <Route path="notifications" element={
          <RequireJudgeAuth><JudgeNotificationsPage /></RequireJudgeAuth>
        } />
        <Route path="change-password" element={
          <RequireJudgeAuth><JudgeProfilePage /></RequireJudgeAuth>
        } />
        <Route path="help" element={
          <RequireJudgeAuth><JudgeGuidelinesPage /></RequireJudgeAuth>
        } />

        {/* Default redirect */}
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export function JudgeRouter() {
  return (
    <JudgeAuthProvider>
      <JudgeRoutesInner />
    </JudgeAuthProvider>
  );
}
