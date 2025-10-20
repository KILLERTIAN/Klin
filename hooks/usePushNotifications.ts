import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { notificationService } from '../services/notificationService';
import { pushNotificationService } from '../services/pushNotificationService';

// Dynamically import expo-notifications to handle cases where it's not available
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('expo-notifications not available:', error);
}

export interface PushNotificationState {
  expoPushToken: string | null;
  isInitialized: boolean;
  permissions: any | null;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    expoPushToken: null,
    isInitialized: false,
    permissions: null,
    error: null,
  });

  const appState = useRef(AppState.currentState);
  const lastNotificationResponse = Notifications?.useLastNotificationResponse?.() || null;

  useEffect(() => {
    initializePushNotifications();
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      pushNotificationService.cleanup();
    };
  }, []);

  // Handle notification responses when app is opened from notification
  useEffect(() => {
    if (lastNotificationResponse) {
      handleNotificationResponse(lastNotificationResponse);
    }
  }, [lastNotificationResponse]);

  const initializePushNotifications = async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Initialize the push notification service
      const token = await pushNotificationService.initialize();
      const permissions = await pushNotificationService.getPermissions();
      
      setState(prev => ({
        ...prev,
        expoPushToken: token,
        isInitialized: true,
        permissions,
      }));

      // Update badge count based on unread notifications
      updateBadgeCount();
      
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize notifications',
        isInitialized: false,
      }));
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground, update badge count
      updateBadgeCount();
    }
    appState.current = nextAppState;
  };

  const handleNotificationResponse = (response: any) => {
    const { data } = response.notification.request.content;
    
    // Handle different notification actions based on data
    if (data?.action) {
      switch (data.action) {
        case 'view_map':
          // You can use router.push here if needed
          console.log('Navigate to map from notification');
          break;
        case 'view_robot':
          console.log('Navigate to robot status from notification');
          break;
        case 'open_app':
          console.log('App opened from notification');
          break;
        default:
          console.log('Notification opened:', data);
      }
    }
  };

  const updateBadgeCount = async () => {
    try {
      const unreadCount = notificationService.getUnreadCount();
      await pushNotificationService.setBadgeCount(unreadCount);
    } catch (error) {
      console.error('Failed to update badge count:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const permissions = await pushNotificationService.requestPermissions();
      setState(prev => ({ ...prev, permissions }));
      return permissions.granted;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to request notification permissions',
      }));
      return false;
    }
  };

  const scheduleTestNotification = async (delay: number = 5) => {
    try {
      await pushNotificationService.scheduleLocalNotification({
        title: 'Test Notification 🧪',
        body: `This is a test notification sent ${delay} seconds ago`,
        data: { test: true, timestamp: Date.now() },
        sound: true,
      }, delay);
    } catch (error) {
      console.error('Failed to schedule test notification:', error);
    }
  };

  const sendRobotNotification = async (type: 'cleaning_complete' | 'low_battery' | 'robot_stuck' | 'error', data?: any) => {
    try {
      switch (type) {
        case 'cleaning_complete':
          await pushNotificationService.notifyCleaningComplete(
            data?.duration || 1800, // 30 minutes default
            data?.areaCovered || 45 // 45m² default
          );
          break;
        case 'low_battery':
          await pushNotificationService.notifyLowBattery(data?.batteryLevel || 15);
          break;
        case 'robot_stuck':
          await pushNotificationService.notifyRobotStuck(data?.location);
          break;
        case 'error':
          await pushNotificationService.notifyError(data?.message || 'Unknown error occurred');
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${type} notification:`, error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await pushNotificationService.cancelAllNotifications();
      await pushNotificationService.setBadgeCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return {
    ...state,
    requestPermissions,
    scheduleTestNotification,
    sendRobotNotification,
    clearAllNotifications,
    updateBadgeCount,
  };
}