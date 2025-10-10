import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { useRobotState } from '../hooks/useRobotState';
import { robotApi } from '../services/robotApi';
import { websocketService } from '../services/websocket';
import { RobotStatus } from '../types/robot';

interface RealTimeStatusUpdaterProps {
  children: React.ReactNode;
}

export const RealTimeStatusUpdater: React.FC<RealTimeStatusUpdaterProps> = ({ children }) => {
  const { dispatch } = useRobotState();
  const { showCustomNotification } = useNotifications();
  const appState = useRef(AppState.currentState);
  const statusUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionRetryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    initializeWebSocket();

    // Set up periodic status updates as fallback
    startPeriodicStatusUpdates();

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - reconnect and refresh status
        handleAppForeground();
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background - reduce update frequency
        handleAppBackground();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Cleanup
      subscription?.remove();
      websocketService.disconnect();
      if (statusUpdateInterval.current) {
        clearInterval(statusUpdateInterval.current);
      }
      if (connectionRetryTimeout.current) {
        clearTimeout(connectionRetryTimeout.current);
      }
    };
  }, []);

  const initializeWebSocket = async () => {
    try {
      // Set up WebSocket event handlers
      websocketService.on('connected', handleWebSocketConnected);
      websocketService.on('disconnected', handleWebSocketDisconnected);
      websocketService.on('error', handleWebSocketError);
      websocketService.on('robot_status_update', handleRobotStatusUpdate);
      websocketService.on('robot_position_update', handleRobotPositionUpdate);
      websocketService.on('cleaning_progress_update', handleCleaningProgressUpdate);
      websocketService.on('battery_update', handleBatteryUpdate);
      websocketService.on('connectivity_update', handleConnectivityUpdate);
      websocketService.on('error_notification', handleErrorNotification);

      // Attempt to connect
      await websocketService.connect();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      // Fall back to periodic polling
      startPeriodicStatusUpdates();
    }
  };

  const handleWebSocketConnected = () => {
    console.log('WebSocket connected - subscribing to robot updates');
    
    // Subscribe to all robot events
    websocketService.subscribe('robot_status');
    websocketService.subscribe('robot_position');
    websocketService.subscribe('cleaning_progress');
    websocketService.subscribe('battery_status');
    websocketService.subscribe('connectivity');
    websocketService.subscribe('errors');

    // Request immediate status update
    websocketService.requestStatusUpdate();

    // Update connectivity status
    dispatch({
      type: 'UPDATE_CONNECTIVITY',
      payload: {
        isOnline: true,
        signalStrength: 100,
        lastSeen: new Date()
      }
    });
  };

  const handleWebSocketDisconnected = () => {
    console.log('WebSocket disconnected - falling back to polling');
    
    // Update connectivity status
    dispatch({
      type: 'UPDATE_CONNECTIVITY',
      payload: {
        isOnline: false,
        signalStrength: 0,
        lastSeen: new Date()
      }
    });

    // Start periodic updates as fallback
    startPeriodicStatusUpdates();
  };

  const handleWebSocketError = (data: any) => {
    console.error('WebSocket error:', data);
    
    // Show user notification for persistent connection issues
    showCustomNotification({
      type: 'error',
      title: 'Connection Issue',
      message: 'Having trouble connecting to your robot. Retrying...'
    });
  };

  const handleRobotStatusUpdate = (data: { status: RobotStatus; timestamp: string }) => {
    dispatch({
      type: 'UPDATE_STATUS',
      payload: data.status
    });

    // Show notification for important status changes
    if (data.status === 'error') {
      showCustomNotification({
        type: 'error',
        title: 'Robot Error',
        message: 'Your robot has encountered an issue and needs attention.'
      });
    } else if (data.status === 'docked') {
      showCustomNotification({
        type: 'success',
        title: 'Cleaning Complete',
        message: 'Your robot has finished cleaning and returned to dock.'
      });
    }
  };

  const handleRobotPositionUpdate = (data: { x: number; y: number; rotation: number }) => {
    dispatch({
      type: 'UPDATE_POSITION',
      payload: data
    });
  };

  const handleCleaningProgressUpdate = (data: { 
    percentage: number; 
    areaCovered: number; 
    currentRoom: string;
    estimatedTimeRemaining: number;
  }) => {
    dispatch({
      type: 'UPDATE_TASK_PROGRESS',
      payload: {
        percentage: data.percentage,
        areaCovered: data.areaCovered,
        currentRoom: data.currentRoom
      }
    });

    // Update estimated duration based on remaining time
    if (data.estimatedTimeRemaining > 0) {
      dispatch({
        type: 'UPDATE_TASK_DURATION',
        payload: data.estimatedTimeRemaining
      });
    }
  };

  const handleBatteryUpdate = (data: { 
    percentage: number; 
    isCharging: boolean; 
    estimatedRuntime: number 
  }) => {
    dispatch({
      type: 'UPDATE_BATTERY',
      payload: data
    });

    // Show low battery notification
    if (data.percentage <= 20 && !data.isCharging) {
      showCustomNotification({
        type: 'warning',
        title: 'Low Battery',
        message: `Robot battery is at ${data.percentage}%. Consider sending it to dock.`
      });
    }
  };

  const handleConnectivityUpdate = (data: { 
    isOnline: boolean; 
    signalStrength: number; 
    lastSeen: string 
  }) => {
    dispatch({
      type: 'UPDATE_CONNECTIVITY',
      payload: {
        isOnline: data.isOnline,
        signalStrength: data.signalStrength,
        lastSeen: new Date(data.lastSeen)
      }
    });

    // Show connectivity notifications
    if (!data.isOnline) {
      showCustomNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Lost connection to your robot. Trying to reconnect...'
      });
    }
  };

  const handleErrorNotification = (data: { 
    errorCode: string; 
    message: string; 
    severity: 'low' | 'medium' | 'high' 
  }) => {
    const notificationType = data.severity === 'high' ? 'error' : 'warning';
    
    showCustomNotification({
      type: notificationType,
      title: 'Robot Alert',
      message: data.message
    });
  };

  const startPeriodicStatusUpdates = () => {
    // Clear existing interval
    if (statusUpdateInterval.current) {
      clearInterval(statusUpdateInterval.current);
    }

    // Start new interval for periodic status updates
    statusUpdateInterval.current = setInterval(async () => {
      try {
        const status = await robotApi.getRobotState();
        
        // Update robot state with fetched data
        dispatch({
          type: 'UPDATE_FULL_STATE',
          payload: status
        });
      } catch (error) {
        console.error('Failed to fetch robot status:', error);
        
        // Update connectivity to offline if API calls fail
        dispatch({
          type: 'UPDATE_CONNECTIVITY',
          payload: {
            isOnline: false,
            signalStrength: 0,
            lastSeen: new Date()
          }
        });
      }
    }, 10000); // Update every 10 seconds when WebSocket is not available
  };

  const handleAppForeground = async () => {
    console.log('App came to foreground - refreshing status');
    
    // Try to reconnect WebSocket
    if (!websocketService.isConnected) {
      try {
        await websocketService.connect();
      } catch (error) {
        console.error('Failed to reconnect WebSocket:', error);
      }
    }

    // Request immediate status update
    try {
      const status = await robotApi.getRobotState();
      dispatch({
        type: 'UPDATE_FULL_STATE',
        payload: status
      });
    } catch (error) {
      console.error('Failed to refresh status on foreground:', error);
    }

    // Resume normal update frequency
    startPeriodicStatusUpdates();
  };

  const handleAppBackground = () => {
    console.log('App went to background - reducing update frequency');
    
    // Reduce update frequency to save battery
    if (statusUpdateInterval.current) {
      clearInterval(statusUpdateInterval.current);
    }

    // Update every 30 seconds in background
    statusUpdateInterval.current = setInterval(async () => {
      if (websocketService.isConnected) {
        websocketService.requestStatusUpdate();
      }
    }, 30000);
  };

  // Component doesn't render anything, just manages real-time updates
  return <>{children}</>;
};