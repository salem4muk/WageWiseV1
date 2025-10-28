
"use client";

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Permission } from './AuthContext';

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  roles?: string[];
  permissions: Permission[];
}

interface UsersContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);

  return (
    <UsersContext.Provider value={{ users, setUsers }}>
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
