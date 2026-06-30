export type AdminRole = 'super_admin' | 'management';

export const SUPER_ADMIN_LOGIN = 'mister_Italiano';
export const SUPER_ADMIN_PASSWORD = 'ug89rwqer[89569+7774$%7';
export const MANAGEMENT_LOGIN = 'ge78rdfgpwe';
export const MANAGEMENT_PASSWORD = 'dsywe672323';

const ADMIN_ROLE_KEY = 'adminRole';
const ADMIN_LABEL_KEY = 'adminUserLabel';

const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  management: 'Boshqarma',
};

export const setAdminSession = (role: AdminRole, options: { demoAuth?: boolean } = { demoAuth: true }) => {
  if (options.demoAuth !== false) {
    localStorage.setItem('isDemoAuth', 'true');
  }
  localStorage.setItem(ADMIN_ROLE_KEY, role);
  localStorage.setItem(ADMIN_LABEL_KEY, roleLabels[role]);
};

export const clearAdminSession = () => {
  localStorage.removeItem('isDemoAuth');
  localStorage.removeItem(ADMIN_ROLE_KEY);
  localStorage.removeItem(ADMIN_LABEL_KEY);
};

export const getStoredAdminRole = (): AdminRole => {
  const role = localStorage.getItem(ADMIN_ROLE_KEY);
  return role === 'management' ? 'management' : 'super_admin';
};

export const getStoredAdminLabel = () => {
  return localStorage.getItem(ADMIN_LABEL_KEY) || roleLabels[getStoredAdminRole()];
};

export const isManagementRole = (role: AdminRole) => role === 'management';

export const hiddenForManagement = new Set(['menu-stats', 'rating']);

export const canAccessAdminPath = (role: AdminRole, path: string) => {
  if (!isManagementRole(role)) return true;
  return !hiddenForManagement.has(path);
};
