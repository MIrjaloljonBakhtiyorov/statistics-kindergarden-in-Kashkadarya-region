import KindergartenApp from '../features/kindergarten/App';
import { AuthProvider } from '../features/kindergarten/context/AuthContext';
import { NotificationProvider } from '../features/kindergarten/context/NotificationContext';

export default function KindergartenRoute() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <KindergartenApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
