import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { getCurrentUser, setCurrentUser, logout as storeLogout, getUsers } from '../services/store';

interface AuthContextType {
  user: User | null;
  login: (email: string, _password: string, role: UserRole) => boolean;
  loginDemo: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_EMAILS: Record<UserRole, string> = {
  patient: 'patient@demo.com',
  emergency: 'emergency@demo.com',
  hospital: 'hospital@demo.com',
  admin: 'admin@demo.com',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const login = (email: string, _password: string, role: UserRole): boolean => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (found) { setUser(found); return true; }
    // also allow demo login by role
    const demoEmail = DEMO_EMAILS[role];
    const demoUser = users.find(u => u.email === demoEmail);
    if (demoUser) { setUser(demoUser); return true; }
    return false;
  };

  const loginDemo = (role: UserRole) => {
    const users = getUsers();
    const demoEmail = DEMO_EMAILS[role];
    const demoUser = users.find(u => u.email === demoEmail);
    if (demoUser) setUser(demoUser);
  };

  const logout = () => {
    storeLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginDemo, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
