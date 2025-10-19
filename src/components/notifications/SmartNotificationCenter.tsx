// src/components/notifications/SmartNotificationCenter.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';
import { smartNotificationManager, SmartNotification } from '@/lib/smartNotifications';

interface SmartNotificationCenterProps {
  onAction: (action: string, data?: any) => void;
}

export const SmartNotificationCenter: React.FC<SmartNotificationCenterProps> = ({ onAction }) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Generate and load notifications
    const newNotifications = smartNotificationManager.generateSmartNotifications();
    setNotifications(smartNotificationManager.getNotifications());
  }, []);

  const handleNotificationAction = (notification: SmartNotification) => {
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
    markAsRead(notification.id);
  };

  const markAsRead = (id: string) => {
    smartNotificationManager.markAsRead(id);
    setNotifications(smartNotificationManager.getNotifications());
  };

  const markAllAsRead = () => {
    smartNotificationManager.markAllAsRead();
    setNotifications(smartNotificationManager.getNotifications());
  };

  const deleteNotification = (id: string) => {
    smartNotificationManager.deleteNotification(id);
    setNotifications(smartNotificationManager.getNotifications());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'streak': return '🔥';
      case 'achievement': return '🏅';
      case 'social': return '👥';
      case 'learning': return '📚';
      case 'reminder': return '⏰';
      case 'milestone': return '🎉';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark All Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm">We'll notify you about achievements, streaks, and more!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${
                          notification.read ? 'opacity-60' : ''
                        } ${getPriorityColor(notification.priority)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-lg">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">
                                {notification.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                              {notification.action && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNotificationAction(notification)}
                                  className="text-xs h-6 px-2"
                                >
                                  {notification.action.type === 'play_game' ? 'Play' : 'View'}
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
