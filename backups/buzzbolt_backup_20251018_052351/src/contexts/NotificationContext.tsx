import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface NotificationContextType {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  showNotification: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('boltquest-notifications-enabled');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [permissionGranted, setPermissionGranted] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Save preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('boltquest-notifications-enabled', JSON.stringify(notificationsEnabled));
    } catch (error) {
      console.error('Failed to save notification preference:', error);
    }
  }, [notificationsEnabled]);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      
      if (granted) {
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notification permission denied');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (!notificationsEnabled || !permissionGranted) {
      // Fallback to toast notifications
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        default:
          toast.info(message);
      }
      return;
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'boltquest-notification',
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to toast
      toast.info(message);
    }
  };

  const value = {
    notificationsEnabled,
    setNotificationsEnabled,
    showNotification,
    requestPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}


