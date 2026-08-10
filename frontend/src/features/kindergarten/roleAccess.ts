import { UserRole } from './types';

export const KINDERGARTEN_MENU_ROLES: UserRole[] = [
  'DIRECTOR',
  'OPERATOR',
  'TEACHER',
  'NURSE',
  'CHEF',
  'STOREKEEPER',
  'INSPECTOR',
  'LAB_CONTROLLER',
  'ARCHIVE',
  'WEBSITE',
];

const ROLE_MENU_ACCESS: Partial<Record<UserRole, UserRole[]>> = {
  DIRECTOR: KINDERGARTEN_MENU_ROLES,
  ADMIN: KINDERGARTEN_MENU_ROLES,
  OPERATOR: ['OPERATOR', 'ARCHIVE', 'WEBSITE'],
  TEACHER: ['TEACHER'],
  NURSE: ['NURSE'],
  CHEF: ['CHEF'],
  STOREKEEPER: ['STOREKEEPER'],
  INSPECTOR: ['INSPECTOR'],
  LAB_CONTROLLER: ['LAB_CONTROLLER'],
  PARENT: ['PARENT'],
};

export const getAllowedMenuRoles = (role?: UserRole | string | null): UserRole[] => {
  const normalizedRole = String(role || '').toUpperCase() as UserRole;
  return ROLE_MENU_ACCESS[normalizedRole] || (normalizedRole ? [normalizedRole] : []);
};

export const canAccessMenuRole = (userRole: UserRole | string | undefined | null, menuRole: UserRole) =>
  getAllowedMenuRoles(userRole).includes(menuRole);

export const getDefaultMenuRole = (userRole?: UserRole | string | null): UserRole => {
  const allowedRoles = getAllowedMenuRoles(userRole);
  return allowedRoles[0] || 'DIRECTOR';
};
