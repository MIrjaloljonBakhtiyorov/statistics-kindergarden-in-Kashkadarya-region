import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface User {
  id: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Development mode: default to a mock director if no user is saved
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) return JSON.parse(savedUser);
    
    return {
      id: 'dev-admin',
      login: 'admin',
      role: 'DIRECTOR',
      full_name: 'Administrator (Auto-login)'
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

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
