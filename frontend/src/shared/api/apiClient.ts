import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

apiClient.interceptors.request.use((config) => {
  const routeKindergartenId = getKindergartenIdFromPath();
  if (routeKindergartenId) {
    config.headers['x-kindergarten-id'] = routeKindergartenId;
    return config;
  }

  const savedUser = localStorage.getItem('auth_user');
  if (!savedUser) return config;

  try {
    const user = JSON.parse(savedUser);
    const kindergartenId = user.kindergarten_id || user.id;

    if (kindergartenId && user.role !== 'PARENT') {
      config.headers['x-kindergarten-id'] = String(kindergartenId);
    } else if (user.kindergarten_id) {
      config.headers['x-kindergarten-id'] = String(user.kindergarten_id);
    }
  } catch {
    localStorage.removeItem('auth_user');
  }

  return config;
});

export default apiClient;
