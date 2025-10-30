
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore as useFirebaseFirestore } from '@/firebase';

export type Permission = 'create' | 'update' | 'delete' | 'view_reports';
export type Role = 'admin' | 'supervisor' | 'user';

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  roles?: Role[];
  permissions?: Permission[];
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useFirebaseAuth();
  const firestore = useFirebaseFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get custom user data from Firestore
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || firebaseUser.displayName,
            roles: userData.roles || [],
            permissions: userData.permissions || [],
          });
        } else {
          // Handle case where user exists in Auth but not in Firestore
           setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            roles: [], // Default to no roles
            permissions: [], // Default to no permissions
          });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]);

  const logout = () => {
    signOut(auth);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) {
      return false;
    }
    // Admin has all permissions
    if (user.roles?.includes('admin')) {
      return true;
    }
    // Supervisor has most permissions
    if (user.roles?.includes('supervisor')) {
        return ['create', 'update', 'delete', 'view_reports'].includes(permission);
    }
    // Regular user's permissions are checked individually
    if (!user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  const hasRole = (role: Role): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
