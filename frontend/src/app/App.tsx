import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const LandingPage = lazy(() => import("../features/home/pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const Login = lazy(() => import("../features/auth/pages/Login").then((module) => ({ default: module.Login })));
const Register = lazy(() => import("../features/auth/pages/Register").then((module) => ({ default: module.Register })));
const AdminDashboard = lazy(() => import("../features/admin/pages/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const UserRouter = lazy(() => import("../features/user/UserRouter").then((module) => ({ default: module.UserRouter })));
const HakamRouter = lazy(() => import("../features/hakam/HakamRouter").then((module) => ({ default: module.HakamRouter })));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm font-semibold text-white">
      Yuklanmoqda...
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin panel */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* User profile cabinet */}
        <Route path="/user/*" element={<UserRouter />} />
        <Route path="/profile/*" element={<UserRouter />} />

        {/* Judge panel */}
        <Route path="/hakam/*" element={<HakamRouter />} />
        <Route path="/judge/*" element={<HakamRouter />} />
      </Routes>
    </Suspense>
  );
}

export default App;
