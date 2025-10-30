
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Permission, Role } from './AuthContext';
import { AuthProvider } from './AuthContext';

// This is the user type for the list of all users, not the authenticated user
export interface User {
  id: string; // Firestore document ID
  name: string;
  email: string;
  password?: string; // Should not be stored or fetched
  roles?: Role[];
  permissions: Permission[];
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>; // Keeping setUsers for now for local updates if needed
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const { user: authUser } = useAuth(); // For checking admin role

  useEffect(() => {
    if (!firestore ||!authUser || !authUser.roles?.includes('admin')) {
      setUsers([]);
      setLoading(false);
      return;
    };

    const usersColRef = collection(firestore, 'users');
    const unsubscribe = onSnapshot(usersColRef, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users collection:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, authUser]);

  return (
    <UsersContext.Provider value={{ users, loading, setUsers }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};

// We need to wrap the UsersProvider in the AuthProvider to access the authUser
export const AppUsersProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <UsersProvider>
                {children}
            </UsersProvider>
        </AuthProvider>
    )
}
