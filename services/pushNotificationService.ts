import { Platform } from 'react-native';
import { AppNotification } from '../types/notification';
import { notificationService } from './notificationService';

// Dynamically import expo modules to handle cases where they're not available
let Notifications: any = null;
let Device: any = null;
let Constants: any = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  Constants = require('expo-constants');
} catch (error) {
  console.warn('Some expo modules not available:', error);
}

// Configure notification handler
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export interface PushNotificationData {
  type?: 'cleaning_complete' | 'low_battery' | 'robot_stuck' | 'error' | 'custom';
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean | string;
  badge?: number;
  priority?: 'default' | 'high' | 'max';
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<string | null> {
    if (!Notifications || !Device || !Constants) {
      console.warn('Push notification modules not available');
      return null;
    }

    try {
      // Register for push notifications
      this.expoPushToken = await this.registerForPushNotificationsAsync();
      
      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Set up listeners
      this.setupNotificationListeners();

      console.log('Push notifications initialized. Token:', this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return null;
    }
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Notifications || !Device || !Constants) {
      return null;
    }

    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        token = pushTokenData.data;
      } catch (e) {
        console.error('Error getting push token:', e);
        return null;
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  private async setupAndroidChannels() {
    if (!Notifications) return;

    // Default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // High priority channel for urgent notifications
    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Urgent Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: 'default',
    });

    // Robot status channel
    await Notifications.setNotificationChannelAsync('robot_status', {
      name: 'Robot Status',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0066FF',
    });
  }

  private setupNotificationListeners() {
    if (!Notifications) return;

    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
      this.handleIncomingNotification(notification);
    });

    // Listener for when a user taps on or interacts with a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleIncomingNotification(notification: any) {
    const { title, body, data } = notification.request.content;
    
    // Convert to app notification format
    const appNotification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> = {
      title: title || 'Notification',
      message: body || '',
      type: this.mapNotificationType(data?.type),
      duration: data?.duration || 5000,
      data: data || {}
    };

    // Add to local notification system
    notificationService.showCustomNotification(appNotification);
  }

  private handleNotificationResponse(response: any) {
    const { data } = response.notification.request.content;
    
    // Handle different notification actions
    if (data?.action) {
      switch (data.action) {
        case 'view_map':
          // Navigate to map screen
          break;
        case 'view_robot':
          // Navigate to robot status
          break;
        case 'dismiss':
          // Just dismiss
          break;
        default:
          console.log('Unknown notification action:', data.action);
      }
    }
  }

  private mapNotificationType(type?: string): AppNotification['type'] {
    switch (type) {
      case 'cleaning_complete':
        return 'success';
      case 'low_battery':
      case 'robot_stuck':
      case 'error':
        return 'warning';
      default:
        return 'info';
    }
  }

  private mapPriority(priority?: string): 'low' | 'medium' | 'high' {
    switch (priority) {
      case 'high':
      case 'max':
        return 'high';
      default:
        return 'medium';
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(data: PushNotificationData, delay: number = 0): Promise<string | null> {
    if (!Notifications) {
      console.warn('Notifications not available');
      return null;
    }

    try {
      const channelId = this.getChannelId(data.type, data.priority);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: data.sound === false ? undefined : (typeof data.sound === 'string' ? data.sound : 'default'),
          ...(data.badge !== undefined && { badge: data.badge }),
        },
        trigger: delay > 0 ? {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delay,
          channelId,
        } : {
          channelId,
        } as any,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  private getChannelId(type?: string, priority?: string): string {
    if (priority === 'high' || priority === 'max') {
      return 'urgent';
    }
    
    if (type === 'cleaning_complete' || type === 'robot_stuck' || type === 'low_battery') {
      return 'robot_status';
    }
    
    return 'default';
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    if (!Notifications) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Get the current push token
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    if (!Notifications) return;

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  // Get notification permissions
  async getPermissions(): Promise<any> {
    if (!Notifications) return { granted: false };
    return await Notifications.getPermissionsAsync();
  }

  // Request notification permissions
  async requestPermissions(): Promise<any> {
    if (!Notifications) return { granted: false };
    return await Notifications.requestPermissionsAsync();
  }

  // Cleanup listeners
  cleanup(): void {
    if (!Notifications) return;

    if (this.notificationListener) {
      try {
        this.notificationListener.remove();
      } catch (error) {
        console.warn('Failed to remove notification listener:', error);
      }
    }
    if (this.responseListener) {
      try {
        this.responseListener.remove();
      } catch (error) {
        console.warn('Failed to remove response listener:', error);
      }
    }
  }

  // Convenience methods for common robot notifications
  async notifyCleaningComplete(duration: number, areaCovered: number): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'cleaning_complete',
      title: 'Cleaning Complete! 🎉',
      body: `Cleaned ${areaCovered}m² in ${Math.round(duration / 60)} minutes`,
      data: { duration, areaCovered },
      priority: 'default',
      sound: true,
    });
  }

  async notifyLowBattery(batteryLevel: number): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'low_battery',
      title: 'Low Battery Warning ⚠️',
      body: `Robot battery is at ${batteryLevel}%. Returning to dock.`,
      data: { batteryLevel },
      priority: 'high',
      sound: true,
    });
  }

  async notifyRobotStuck(location?: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'robot_stuck',
      title: 'Robot Needs Help 🤖',
      body: location ? `Robot is stuck ${location}` : 'Robot is stuck and needs assistance',
      data: { location },
      priority: 'high',
      sound: true,
    });
  }

  async notifyError(errorMessage: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'error',
      title: 'Robot Error ❌',
      body: errorMessage,
      data: { errorMessage },
      priority: 'high',
      sound: true,
    });
  }
}

export const pushNotificationService = new PushNotificationService();