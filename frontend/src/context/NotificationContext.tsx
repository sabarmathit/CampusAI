import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshNotifications = useCallback(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const all = StorageService.getNotifications();
    const userNotifs = all.filter(
      n => n.targetUserId === currentUser.id || n.targetUserId === currentUser.role
    );
    setNotifications(userNotifs);
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();

    const handleStorageUpdate = (e: Event) => {
      const custom = e as CustomEvent;
      if (!custom.detail || custom.detail.entity === 'notifications' || custom.detail.entity === 'all') {
        refreshNotifications();
      }
    };

    window.addEventListener('campus_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('campus_storage_update', handleStorageUpdate);
    };
  }, [refreshNotifications]);

  const markAsRead = useCallback((id: string) => {
    StorageService.markNotificationAsRead(id);
    refreshNotifications();
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(() => {
    if (!currentUser) return;
    StorageService.markAllNotificationsAsRead(currentUser.id);
    refreshNotifications();
  }, [currentUser, refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
