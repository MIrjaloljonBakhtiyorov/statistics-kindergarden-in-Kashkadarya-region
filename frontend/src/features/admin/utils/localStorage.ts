// Local Storage utility functions for admin demo

export const STORAGE_KEYS = {
  COMPETITIONS: 'admin_competitions',
  USERS: 'admin_users',
  TEAMS: 'admin_teams',
  APPLICATIONS: 'admin_applications',
  COORDINATORS: 'admin_coordinators',
  JUDGES: 'admin_judges',
  EXPERTS: 'admin_experts',
  DIRECTIONS: 'admin_directions',
  INSTITUTIONS: 'admin_institutions',
  REGIONS: 'admin_regions',
  STAGES: 'admin_stages',
  EVALUATIONS: 'admin_evaluations',
  RESULTS: 'admin_results',
  APPEALS: 'admin_appeals',
  CERTIFICATES: 'admin_certificates',
  PAYMENTS: 'admin_payments',
  MONITORING: 'admin_monitoring',
  CONTENT: 'admin_content',
  NOTIFICATIONS: 'admin_notifications',
  REPORTS: 'admin_reports',
  AUDIT: 'admin_audit',
  SETTINGS: 'admin_settings',
} as const;

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Audit log utility
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  objectType: string;
  objectId: string;
  oldValue?: any;
  newValue?: any;
  ip: string;
  device: string;
  status: 'success' | 'error';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'ip' | 'device'>): void {
  const logs = getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT, []);
  const newLog: AuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1', // Mock IP
    device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
  };
  logs.unshift(newLog);
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  saveToStorage(STORAGE_KEYS.AUDIT, logs);
}

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Format datetime
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
