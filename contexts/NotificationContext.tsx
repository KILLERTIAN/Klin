import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { AppNotification, NotificationState } from '../types/notification';

interface NotificationContextType {
  state: NotificationState;
  showCleaningComplete: (duration: number, areaCovered: number) => void;
  showLowBattery: (batteryLevel: number, onAction?: () => void) => void;
  showConnectivityLost: (onRetry?: () => void) => void;
  showConnectivityRestored: () => void;
  showRobotStuck: (location?: string, onViewMap?: () => void) => void;
  showRobotError: (errorMessage: string, onViewDetails?: () => void) => void;
  showCleaningStarted: (mode: 'manual' | 'automatic', rooms?: string[]) => void;
  showScheduleReminder: (scheduledTime: string, onCancel?: () => void) => void;
  showCustomNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  dismiss: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  clearHistory: () => void;
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, setState] = useState<NotificationState>(notificationService.getState());

  useEffect(() => {
    // Subscribe to notification service updates
    const unsubscribe = notificationService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const contextValue: NotificationContextType = {
    state,
    showCleaningComplete: notificationService.showCleaningComplete.bind(notificationService),
    showLowBattery: notificationService.showLowBattery.bind(notificationService),
    showConnectivityLost: notificationService.showConnectivityLost.bind(notificationService),
    showConnectivityRestored: notificationService.showConnectivityRestored.bind(notificationService),
    showRobotStuck: notificationService.showRobotStuck.bind(notificationService),
    showRobotError: notificationService.showRobotError.bind(notificationService),
    showCleaningStarted: notificationService.showCleaningStarted.bind(notificationService),
    showScheduleReminder: notificationService.showScheduleReminder.bind(notificationService),
    showCustomNotification: notificationService.showCustomNotification.bind(notificationService),
    dismiss: notificationService.dismiss.bind(notificationService),
    markAsRead: notificationService.markAsRead.bind(notificationService),
    clearAll: notificationService.clearAll.bind(notificationService),
    clearHistory: notificationService.clearHistory.bind(notificationService),
    getUnreadCount: notificationService.getUnreadCount.bind(notificationService)
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};