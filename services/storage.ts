import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNotification } from '../types/notification';
import { CleaningSession, RobotState, UsageAnalytics } from '../types/robot';
import { ThemeMode } from '../types/theme';

export class StorageService {
  private static readonly KEYS = {
    ROBOT_STATE: '@klin/robot_state',
    THEME_MODE: '@klin/theme_mode',
    CLEANING_HISTORY: '@klin/cleaning_history',
    USER_PREFERENCES: '@klin/user_preferences',
    USAGE_ANALYTICS: '@klin/usage_analytics',
    ONBOARDING_COMPLETED: '@klin/onboarding_completed',
    NOTIFICATION_HISTORY: '@klin/notification_history'
  };

  // Robot State Management
  async saveRobotState(state: RobotState): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.ROBOT_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save robot state:', error);
      throw error;
    }
  }

  async getRobotState(): Promise<RobotState | null> {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.ROBOT_STATE);
      if (data) {
        const state = JSON.parse(data);
        // Convert date strings back to Date objects
        if (state.connectivity?.lastSeen) {
          state.connectivity.lastSeen = new Date(state.connectivity.lastSeen);
        }
        if (state.currentTask?.startTime) {
          state.currentTask.startTime = new Date(state.currentTask.startTime);
        }
        return state;
      }
      return null;
    } catch (error) {
      console.error('Failed to get robot state:', error);
      return null;
    }
  }

  // Theme Management
  async saveThemeMode(mode: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.THEME_MODE, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
      throw error;
    }
  }

  async getThemeMode(): Promise<ThemeMode> {
    try {
      const mode = await AsyncStorage.getItem(StorageService.KEYS.THEME_MODE);
      return (mode as ThemeMode) || 'system';
    } catch (error) {
      console.error('Failed to get theme mode:', error);
      return 'system';
    }
  }

  // Cleaning History Management
  async saveCleaningSession(session: CleaningSession): Promise<void> {
    try {
      const history = await this.getCleaningHistory();
      const updatedHistory = [session, ...history].slice(0, 100); // Keep last 100 sessions
      await AsyncStorage.setItem(StorageService.KEYS.CLEANING_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save cleaning session:', error);
      throw error;
    }
  }

  async getCleaningHistory(): Promise<CleaningSession[]> {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.CLEANING_HISTORY);
      if (data) {
        const history = JSON.parse(data);
        // Convert date strings back to Date objects
        return history.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get cleaning history:', error);
      return [];
    }
  }

  async clearCleaningHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(StorageService.KEYS.CLEANING_HISTORY);
    } catch (error) {
      console.error('Failed to clear cleaning history:', error);
      throw error;
    }
  }

  // User Preferences
  async saveUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return {};
    }
  }

  // Usage Analytics
  async saveUsageAnalytics(analytics: UsageAnalytics): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.USAGE_ANALYTICS, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to save usage analytics:', error);
      throw error;
    }
  }

  async getUsageAnalytics(): Promise<UsageAnalytics | null> {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.USAGE_ANALYTICS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get usage analytics:', error);
      return null;
    }
  }

  // Onboarding
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      throw error;
    }
  }

  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.ONBOARDING_COMPLETED);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      return false;
    }
  }

  // Notification History Management
  async saveNotificationHistory(notifications: AppNotification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.NOTIFICATION_HISTORY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notification history:', error);
      throw error;
    }
  }

  async getNotificationHistory(): Promise<AppNotification[]> {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.NOTIFICATION_HISTORY);
      if (data) {
        const notifications = JSON.parse(data);
        // Convert date strings back to Date objects
        return notifications.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  async clearNotificationHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(StorageService.KEYS.NOTIFICATION_HISTORY);
    } catch (error) {
      console.error('Failed to clear notification history:', error);
      throw error;
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(StorageService.KEYS));
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  async getStorageInfo(): Promise<{ keys: string[]; size: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const klinKeys = keys.filter(key => key.startsWith('@klin/'));
      
      // Estimate size (this is approximate)
      let totalSize = 0;
      for (const key of klinKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        keys: klinKeys,
        size: totalSize
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { keys: [], size: 0 };
    }
  }
}

export const storageService = new StorageService();