import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const PARENT_PORTAL_API_BASE_URL = import.meta.env.VITE_PARENT_PORTAL_API_BASE_URL || API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getKindergartenIdFromPath = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[0] === 'kindergarten' && parts[1] ? parts[1] : null;
};

const getSavedUser = () => {
  const savedUser = localStorage.getItem('auth_user');
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem('auth_user');
    return null;
  }
};

const isParentPortalPath = (url?: string) => {
  const path = String(url || '');
  return (
    path === '/parents' ||
    path.startsWith('/parents/') ||
    path.startsWith('/parent-portal/') ||
    path === '/auth/parent-login' ||
    path === '/messages' ||
    path.startsWith('/messages?') ||
    path.startsWith('/messages/')
  );
};

apiClient.interceptors.request.use((config) => {
  const savedUser = getSavedUser();
  const isParentUser = String(savedUser?.role || '').toUpperCase() === 'PARENT';
  const shouldUseParentPortalService =
    PARENT_PORTAL_API_BASE_URL !== API_BASE_URL &&
    (isParentPortalPath(config.url) || (isParentUser && String(config.url || '').startsWith('/upload')));

  if (shouldUseParentPortalService) {
    config.baseURL = PARENT_PORTAL_API_BASE_URL;
  }

  const routeKindergartenId = getKindergartenIdFromPath();
  if (routeKindergartenId) {
    config.headers['x-kindergarten-id'] = routeKindergartenId;
    return config;
  }

  if (!savedUser) return config;

  const kindergartenId = savedUser.kindergarten_id || savedUser.id;

  if (kindergartenId && savedUser.role !== 'PARENT') {
    config.headers['x-kindergarten-id'] = String(kindergartenId);
  } else if (savedUser.kindergarten_id) {
    config.headers['x-kindergarten-id'] = String(savedUser.kindergarten_id);
  }

  return config;
});

export default apiClient;
