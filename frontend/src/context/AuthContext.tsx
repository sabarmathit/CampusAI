import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  allUsers: User[];
  login: (email: string, password?: string) => User;
  register: (userData: Omit<User, 'id'>, password?: string) => User;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    StorageService.initStorage();
    return StorageService.getCurrentUser();
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    return StorageService.getUsers();
  });

  const refreshState = useCallback(() => {
    const user = StorageService.getCurrentUser();
    const users = StorageService.getUsers();
    setCurrentUserState(user);
    setAllUsers(users);
  }, []);

  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const custom = e as CustomEvent;
      if (!custom.detail || custom.detail.entity === 'currentUser' || custom.detail.entity === 'users' || custom.detail.entity === 'all') {
        refreshState();
      }
    };

    window.addEventListener('campus_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('campus_storage_update', handleStorageUpdate);
    };
  }, [refreshState]);

  const login = useCallback((email: string, password?: string) => {
    const user = StorageService.loginUser(email, password);
    setCurrentUserState(user);
    refreshState();
    return user;
  }, [refreshState]);

  const register = useCallback((userData: Omit<User, 'id'>, password?: string) => {
    const user = StorageService.registerUser(userData, password);
    setCurrentUserState(user);
    refreshState();
    return user;
  }, [refreshState]);

  const logout = useCallback(() => {
    StorageService.logoutUser();
    setCurrentUserState(null);
    refreshState();
  }, [refreshState]);

  const switchUser = useCallback((userId: string) => {
    StorageService.setCurrentUser(userId);
    refreshState();
  }, [refreshState]);

  const switchRole = useCallback((role: UserRole) => {
    const users = StorageService.getUsers();
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      StorageService.setCurrentUser(targetUser.id);
      refreshState();
    }
  }, [refreshState]);

  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    StorageService.updateUser(updated);
    setCurrentUserState(updated);
    refreshState();
  }, [currentUser, refreshState]);

  const resetDemoData = useCallback(() => {
    StorageService.resetAllData();
    setCurrentUserState(null);
    refreshState();
  }, [refreshState]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      allUsers,
      login,
      register,
      logout,
      switchUser,
      switchRole,
      updateCurrentUser,
      resetDemoData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
