import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';

interface AuthUser {
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  resetPassword: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('phc_current_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const admins = db.getAll<any>('admin_users');
    const found = admins.find((a: any) => a.email === email && a.password === password);
    if (found) {
      const u = { email: found.email, role: found.role, name: found.name };
      setUser(u);
      localStorage.setItem('phc_current_user', JSON.stringify(u));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('phc_current_user');
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    const admins = db.getAll<any>('admin_users');
    const found = admins.find((a: any) => a.email === email);
    if (found) {
      db.update<any>('admin_users', found.id, { password: 'reset123' });
      return true;
    }
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
