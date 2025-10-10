import { AppNotification, NotificationAction, NotificationState, NotificationTemplates } from '../types/notification';
import { storageService } from './storage';

class NotificationService {
  private listeners: ((state: NotificationState) => void)[] = [];
  private state: NotificationState = {
    notifications: [],
    activeNotification: null,
    history: []
  };

  constructor() {
    this.loadNotificationHistory();
  }

  // Subscribe to notification state changes
  subscribe(listener: (state: NotificationState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current state
  getState(): NotificationState {
    return this.state;
  }

  // Dispatch notification actions
  private dispatch(action: NotificationAction) {
    switch (action.type) {
      case 'ADD_NOTIFICATION':
        this.addNotification(action.payload);
        break;
      case 'DISMISS_NOTIFICATION':
        this.dismissNotification(action.payload);
        break;
      case 'MARK_AS_READ':
        this.markAsRead(action.payload);
        break;
      case 'CLEAR_ALL':
        this.clearAll();
        break;
      case 'CLEAR_HISTORY':
        this.clearHistory();
        break;
      case 'SET_ACTIVE':
        this.setActive(action.payload);
        break;
    }
    this.notifyListeners();
  }

  private addNotification(notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) {
    const notification: AppNotification = {
      ...notificationData,
      id: this.generateId(),
      timestamp: new Date(),
      isRead: false
    };

    // Add to notifications list
    this.state.notifications.push(notification);

    // Set as active if no active notification
    if (!this.state.activeNotification) {
      this.state.activeNotification = notification;
    }

    // Add to history
    this.state.history.unshift(notification);

    // Limit history to 50 items
    if (this.state.history.length > 50) {
      this.state.history = this.state.history.slice(0, 50);
    }

    // Auto-dismiss if duration is set
    if (notification.duration) {
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, notification.duration);
    }

    // Save to storage
    this.saveNotificationHistory();
  }

  public dismissNotification(id: string) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);

    if (this.state.activeNotification?.id === id) {
      // Set next notification as active
      this.state.activeNotification = this.state.notifications[0] || null;
    }

    // Mark as read in history
    const historyItem = this.state.history.find(n => n.id === id);
    if (historyItem) {
      historyItem.isRead = true;
    }

    this.saveNotificationHistory();
  }



  private setActive(notification: AppNotification | null) {
    this.state.activeNotification = notification;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveNotificationHistory() {
    try {
      await storageService.saveNotificationHistory(this.state.history);
    } catch (error) {
      console.error('Failed to save notification history:', error);
    }
  }

  private async loadNotificationHistory() {
    try {
      const history = await storageService.getNotificationHistory();
      this.state.history = history;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load notification history:', error);
    }
  }

  // Public API methods
  showCleaningComplete(duration: number, areaCovered: number) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: NotificationTemplates.cleaningComplete(duration, areaCovered)
    });
  }

  showLowBattery(batteryLevel: number, onAction?: () => void) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        ...NotificationTemplates.lowBattery(batteryLevel),
        onAction
      }
    });
  }

  showConnectivityLost(onRetry?: () => void) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        ...NotificationTemplates.connectivityLost(),
        onAction: onRetry
      }
    });
  }

  showConnectivityRestored() {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: NotificationTemplates.connectivityRestored()
    });
  }

  showRobotStuck(location?: string, onViewMap?: () => void) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        ...NotificationTemplates.robotStuck(location),
        onAction: onViewMap
      }
    });
  }

  showRobotError(errorMessage: string, onViewDetails?: () => void) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        ...NotificationTemplates.robotError(errorMessage),
        onAction: onViewDetails
      }
    });
  }

  showCleaningStarted(mode: 'manual' | 'automatic', rooms?: string[]) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: NotificationTemplates.cleaningStarted(mode, rooms)
    });
  }

  showScheduleReminder(scheduledTime: string, onCancel?: () => void) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        ...NotificationTemplates.scheduleReminder(scheduledTime),
        onAction: onCancel
      }
    });
  }

  showCustomNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) {
    this.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification
    });
  }

  dismiss(id: string) {
    this.dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  }

  markAsRead(id: string) {
    this.dispatch({ type: 'MARK_AS_READ', payload: id });
  }

  clearAll() {
    this.dispatch({ type: 'CLEAR_ALL' });
  }

  clearHistory() {
    this.dispatch({ type: 'CLEAR_HISTORY' });
  }

  getUnreadCount(): number {
    return this.state.history.filter(n => !n.isRead).length;
  }
}

export const notificationService = new NotificationService();