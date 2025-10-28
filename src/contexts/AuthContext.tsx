
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type Permission = 'create' | 'update' | 'delete' | 'view_reports';
export type Role = 'admin' | 'supervisor' | 'user';

export interface User {
  email: string;
  name: string;
  roles?: Role[];
  permissions?: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('authUser', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On initial load, the useLocalStorage hook will update the user state.
    // We can then set loading to false.
    setLoading(false);
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) {
      return false;
    }
    // Admin has all permissions
    if (user.roles?.includes('admin')) {
      return true;
    }
    if (!user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  }

  const hasRole = (role: Role): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  }


  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
