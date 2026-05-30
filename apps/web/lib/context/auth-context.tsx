'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    window.location.href = '/';
  };

  // Intercept 401 banned dari fetch — handle di client fetch layer
  // Dashboard layout sudah handle redirect jika getMe() gagal

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
