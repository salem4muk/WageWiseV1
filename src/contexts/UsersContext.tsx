
"use client";

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Permission, Role } from './AuthContext';

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  roles?: Role[];
  permissions: Permission[];
}

interface UsersContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateUser: (id: string, updatedUser: Partial<User>) => void;
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  
  const updateUser = (id: string, updatedUser: Partial<User>) => {
    setUsers(prevUsers => 
        prevUsers.map(user => 
            user.id === id ? { ...user, ...updatedUser } : user
        )
    );
  };

  return (
    <UsersContext.Provider value={{ users, setUsers, updateUser }}>
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
