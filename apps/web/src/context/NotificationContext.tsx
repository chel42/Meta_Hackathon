import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { MOCK_NOTIFICATIONS } from '../mocks/mockData';
import { safeStorage } from '../utils/storage';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY_NOTIFS = 'vera_notifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEY_NOTIFS);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
        safeStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(MOCK_NOTIFICATIONS));
      }
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    safeStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(items));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: 'À l’instant',
      read: false,
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const removeNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
      }}
    >
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
