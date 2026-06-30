import { Navigate, Route, Routes } from 'react-router-dom';

import HomeApp from '../features/home/App';
import AdminApp from '../features/kindergarten-admin/App';
import KindergartenApp from '../features/kindergarten/App';
import { AuthProvider } from '../features/kindergarten/context/AuthContext';
import { NotificationProvider } from '../features/kindergarten/context/NotificationContext';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route
        path="/kindergarten/*"
        element={
          <AuthProvider>
            <NotificationProvider>
              <KindergartenApp />
            </NotificationProvider>
          </AuthProvider>
        }
      />
      <Route path="/stats/*" element={<div>Statistics Feature (To be integrated)</div>} />
      <Route path="/" element={<Navigate to="/viloyat-statistikasi" replace />} />
      <Route path="/*" element={<HomeApp />} />
    </Routes>
  );
}
