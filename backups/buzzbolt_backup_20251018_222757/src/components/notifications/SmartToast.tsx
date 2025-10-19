// src/components/notifications/SmartToast.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SmartNotification } from '@/lib/smartNotifications';

interface SmartToastProps {
  notification: SmartNotification;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
}

export const SmartToast: React.FC<SmartToastProps> = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after 5 seconds for low priority, 8 seconds for medium, 10 seconds for high
    const autoCloseDelay = notification.priority === 'low' ? 5000 : 
                          notification.priority === 'medium' ? 8000 : 10000;
    
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleAction = () => {
    if (notification.action) {
      switch (notification.action.type) {
        case 'navigate':
          onAction('navigate', notification.action.data);
          break;
        case 'play_game':
          onAction('play_game', notification.action.data);
          break;
        case 'view_page':
          onAction('navigate', { page: notification.action.data.page });
          break;
      }
    }
    handleClose();
  };

  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50 shadow-red-200';
      case 'high':
        return 'border-orange-500 bg-orange-50 shadow-orange-200';
      case 'medium':
        return 'border-blue-500 bg-blue-50 shadow-blue-200';
      case 'low':
        return 'border-gray-300 bg-white shadow-gray-200';
      default:
        return 'border-gray-300 bg-white shadow-gray-200';
    }
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'streak': return '🔥';
      case 'achievement': return '🏅';
      case 'social': return '👥';
      case 'learning': return '📚';
      case 'reminder': return '⏰';
      case 'milestone': return '🎉';
      default: return '🔔';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Card className={`w-80 shadow-lg border-l-4 ${getPriorityStyles()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">
                  {notification.title}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  notification.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                  notification.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                  notification.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {notification.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {notification.message}
              </p>
              <div className="flex gap-2">
                {notification.action && (
                  <Button
                    size="sm"
                    onClick={handleAction}
                    className="text-xs h-7"
                  >
                    {notification.action.type === 'play_game' ? 'Play Now' : 'View'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-xs h-7"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
