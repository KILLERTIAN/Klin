export type NotificationType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'cleaning_complete' 
  | 'low_battery' 
  | 'connectivity' 
  | 'stuck';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // Auto-dismiss duration in ms, undefined for persistent
  isRead: boolean;
  actionLabel?: string;
  onAction?: () => void;
  data?: any; // Additional data for specific notification types
}

export interface NotificationState {
  notifications: AppNotification[];
  activeNotification: AppNotification | null;
  history: AppNotification[];
}

export type NotificationAction = 
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_ACTIVE'; payload: AppNotification | null };

// Predefined notification templates
export const NotificationTemplates = {
  cleaningComplete: (duration: number, areaCovered: number): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'cleaning_complete',
    title: '🎉 Cleaning Complete!',
    message: `Finished cleaning ${areaCovered}m² in ${Math.round(duration)} minutes`,
    duration: 5000,
    data: { duration, areaCovered }
  }),

  lowBattery: (batteryLevel: number): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'low_battery',
    title: '🔋 Low Battery',
    message: `Battery at ${batteryLevel}%. Returning to dock for charging.`,
    duration: 4000,
    actionLabel: 'View Status',
    data: { batteryLevel }
  }),

  connectivityLost: (): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'connectivity',
    title: '📶 Connection Lost',
    message: 'Lost connection to Klin. Attempting to reconnect...',
    actionLabel: 'Retry',
    data: { type: 'lost' }
  }),

  connectivityRestored: (): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'connectivity',
    title: '✅ Connection Restored',
    message: 'Successfully reconnected to Klin',
    duration: 3000,
    data: { type: 'restored' }
  }),

  robotStuck: (location?: string): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'stuck',
    title: '🚫 Robot Stuck',
    message: location ? `Klin is stuck ${location}. Please check for obstacles.` : 'Klin is stuck. Please check for obstacles.',
    actionLabel: 'View Map',
    data: { location }
  }),

  robotError: (errorMessage: string): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'error',
    title: '⚠️ Robot Error',
    message: errorMessage,
    actionLabel: 'View Details',
    data: { errorMessage }
  }),

  cleaningStarted: (mode: 'manual' | 'automatic', rooms?: string[]): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'info',
    title: '🧹 Cleaning Started',
    message: mode === 'automatic' && rooms?.length 
      ? `Started automatic cleaning in ${rooms.length} room${rooms.length > 1 ? 's' : ''}`
      : `Started ${mode} cleaning`,
    duration: 3000,
    data: { mode, rooms }
  }),

  scheduleReminder: (scheduledTime: string): Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> => ({
    type: 'info',
    title: '⏰ Scheduled Cleaning',
    message: `Scheduled cleaning will start at ${scheduledTime}`,
    duration: 4000,
    actionLabel: 'Cancel',
    data: { scheduledTime }
  })
};