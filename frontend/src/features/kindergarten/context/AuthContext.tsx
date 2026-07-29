import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { apiClient } from '@/shared/api';

interface User {
  id: string;
  kindergarten_id?: string | number;
  login: string;
  role: UserRole;
  full_name: string;
  childId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readSavedUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem('auth_user');
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readSavedUser());

  useEffect(() => {
    setUser(readSavedUser());
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  useEffect(() => {
    const role = String(user?.role || '').toUpperCase();
    if (!user?.id || !['OPERATOR', 'TEACHER', 'NURSE', 'CHEF', 'STOREKEEPER', 'INSPECTOR'].includes(role)) return;

    const sendHeartbeat = () => {
      apiClient.post('/auth/heartbeat', {
        userId: user.id,
        role,
        kindergartenId: user.kindergarten_id,
      }).catch(() => undefined);
    };

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 60_000);
    return () => window.clearInterval(interval);
  }, [user?.id, user?.role, user?.kindergarten_id]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
