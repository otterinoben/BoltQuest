// src/components/notifications/NotificationProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SmartToast } from './SmartToast';
import { smartNotificationManager, SmartNotification } from '@/lib/smartNotifications';

interface NotificationContextType {
  showToast: (notification: SmartNotification) => void;
  generateNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  onAction: (action: string, data?: any) => void;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, onAction }) => {
  const [toasts, setToasts] = useState<SmartNotification[]>([]);

  const showToast = (notification: SmartNotification) => {
    setToasts(prev => [...prev, notification]);
  };

  const removeToast = (notificationId: string) => {
    setToasts(prev => prev.filter(n => n.id !== notificationId));
  };

  const generateNotifications = () => {
    const newNotifications = smartNotificationManager.generateSmartNotifications();
    
    // Show toasts for high priority notifications
    newNotifications.forEach(notification => {
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        showToast(notification);
      }
    });
  };

  // Generate notifications on mount and periodically
  useEffect(() => {
    generateNotifications();
    
    // Generate notifications every 5 minutes
    const interval = setInterval(generateNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const contextValue: NotificationContextType = {
    showToast,
    generateNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render toasts */}
      {toasts.map((notification) => (
        <SmartToast
          key={notification.id}
          notification={notification}
          onClose={() => removeToast(notification.id)}
          onAction={onAction}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
