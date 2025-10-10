import React, { createContext, ReactNode, useEffect, useReducer, useState } from 'react';
import type { Device } from 'react-native-ble-plx';
import { bluetoothService } from '../services/bluetoothService';
import { robotApi } from '../services/robotApi';
import { storageService } from '../services/storage';
import { websocketService } from '../services/websocket';
import { CleaningTask, RobotAction, RobotState } from '../types/robot';

interface RobotContextType {
  state: RobotState;
  dispatch: React.Dispatch<RobotAction>;
  isConnected: boolean;
  isApiConnected: boolean;
  isBluetoothConnected: boolean;
  queuedCommandsCount: number;
  availableDevices: Device[];
  startManualControl: () => Promise<void>;
  startAutomaticCleaning: (task: Partial<CleaningTask>) => Promise<void>;
  pauseCleaning: () => Promise<void>;
  resumeCleaning: () => Promise<void>;
  returnToDock: () => Promise<void>;
  moveRobot: (direction: 'forward' | 'backward' | 'left' | 'right') => Promise<void>;
  toggleFunction: (functionName: keyof RobotState['capabilities'], enabled: boolean) => Promise<void>;
  checkConnection: () => Promise<void>;
  scanForBluetoothDevices: () => Promise<void>;
  connectToBluetoothDevice: (deviceId: string) => Promise<boolean>;
  disconnectBluetooth: () => Promise<void>;
}

const initialRobotState: RobotState = {
  id: '',
  name: 'Klin',
  status: 'idle',
  battery: {
    percentage: 100,
    isCharging: false,
    estimatedRuntime: 120
  },
  connectivity: {
    isOnline: false,
    signalStrength: 0,
    lastSeen: new Date()
  },
  position: {
    x: 0,
    y: 0,
    rotation: 0
  },
  capabilities: {
    waterDispenser: true,
    mopping: true,
    brooming: true,
    vacuum: true
  }
};

function robotReducer(state: RobotState, action: RobotAction): RobotState {
  switch (action.type) {
    case 'SET_ROBOT_STATE':
      return { ...action.payload };
    
    case 'UPDATE_STATUS':
      return { ...state, status: action.payload };
    
    case 'UPDATE_BATTERY':
      return { ...state, battery: { ...state.battery, ...action.payload } };
    
    case 'UPDATE_POSITION':
      return { ...state, position: { ...state.position, ...action.payload } };
    
    case 'UPDATE_CONNECTIVITY':
      return { ...state, connectivity: { ...state.connectivity, ...action.payload } };
    
    case 'START_TASK':
      return { ...state, currentTask: action.payload, status: 'cleaning' };
    
    case 'UPDATE_TASK_PROGRESS':
      if (!state.currentTask) return state;
      return {
        ...state,
        currentTask: {
          ...state.currentTask,
          progress: { ...state.currentTask.progress, ...action.payload }
        }
      };
    
    case 'UPDATE_TASK_DURATION':
      if (!state.currentTask) return state;
      return {
        ...state,
        currentTask: {
          ...state.currentTask,
          estimatedDuration: action.payload
        }
      };
    
    case 'COMPLETE_TASK':
      return { ...state, currentTask: undefined, status: 'idle' };
    
    case 'SET_CAPABILITIES':
      return { ...state, capabilities: { ...state.capabilities, ...action.payload } };
    
    case 'UPDATE_FULL_STATE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

export const RobotContext = createContext<RobotContextType | null>(null);

interface RobotProviderProps {
  children: ReactNode;
}

export const RobotProvider: React.FC<RobotProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(robotReducer, initialRobotState);
  const [isConnected, setIsConnected] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [queuedCommandsCount, setQueuedCommandsCount] = useState(0);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);

  // Load saved robot state on mount
  useEffect(() => {
    const loadRobotState = async () => {
      try {
        const savedState = await storageService.getRobotState();
        if (savedState) {
          dispatch({ type: 'SET_ROBOT_STATE', payload: savedState });
        }
      } catch (error) {
        console.error('Failed to load robot state:', error);
      }
    };

    loadRobotState();
  }, []);

  // Save robot state when it changes
  useEffect(() => {
    const saveRobotState = async () => {
      try {
        await storageService.saveRobotState(state);
      } catch (error) {
        console.error('Failed to save robot state:', error);
      }
    };

    // Don't save initial empty state
    if (state.id) {
      saveRobotState();
    }
  }, [state]);

  // Set up WebSocket connection
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        // Set up event handlers first
        websocketService.on('robot_status_update', (data) => {
          dispatch({ type: 'UPDATE_STATUS', payload: data.status });
        });

        websocketService.on('battery_update', (data) => {
          dispatch({ type: 'UPDATE_BATTERY', payload: data.battery });
        });

        websocketService.on('position_update', (data) => {
          dispatch({ type: 'UPDATE_POSITION', payload: data.position });
        });

        websocketService.on('task_progress', (data) => {
          dispatch({ type: 'UPDATE_TASK_PROGRESS', payload: data.progress });
        });

        websocketService.on('connected', () => {
          setIsConnected(true);
          dispatch({ 
            type: 'UPDATE_CONNECTIVITY', 
            payload: { isOnline: true, signalStrength: 100, lastSeen: new Date() }
          });
        });

        websocketService.on('disconnected', () => {
          setIsConnected(false);
          dispatch({ 
            type: 'UPDATE_CONNECTIVITY', 
            payload: { isOnline: false, signalStrength: 0, lastSeen: new Date() }
          });
        });

        // Try to connect, but don't fail if server is not available
        await websocketService.connect();
        setIsConnected(true);

      } catch (error) {
        // Silently handle connection errors in development
        setIsConnected(false);
        
        // Set up demo data for development
        dispatch({ 
          type: 'SET_ROBOT_STATE', 
          payload: {
            ...initialRobotState,
            id: 'demo-robot-001',
            battery: { percentage: 85, isCharging: false, estimatedRuntime: 90 },
            connectivity: { isOnline: false, signalStrength: 0, lastSeen: new Date() }
          }
        });
      }
    };

    setupWebSocket();

    return () => {
      try {
        websocketService.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
    };
  }, []);

  // Set up periodic connection checking
  useEffect(() => {
    const checkConnectionInterval = setInterval(async () => {
      try {
        const apiConnected = await robotApi.checkConnection();
        setIsApiConnected(apiConnected);
        setQueuedCommandsCount(robotApi.queuedCommandsCount);
      } catch (error) {
        setIsApiConnected(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkConnectionInterval);
  }, []);

  // Robot control functions
  const startManualControl = async (): Promise<void> => {
    try {
      const success = await robotApi.startManualControl();
      if (success) {
        dispatch({ type: 'UPDATE_STATUS', payload: 'cleaning' });
      }
    } catch (error) {
      console.error('Failed to start manual control:', error);
      dispatch({ type: 'UPDATE_STATUS', payload: 'error' });
    }
  };

  const startAutomaticCleaning = async (task: Partial<CleaningTask>): Promise<void> => {
    try {
      const success = await robotApi.startAutomaticCleaning(task);
      if (success) {
        const fullTask: CleaningTask = {
          id: Date.now().toString(),
          mode: 'automatic',
          startTime: new Date(),
          estimatedDuration: 60,
          selectedRooms: task.selectedRooms || [],
          intensity: task.intensity || 'medium',
          progress: {
            percentage: 0,
            areaCovered: 0,
            currentRoom: task.selectedRooms?.[0] || ''
          }
        };
        dispatch({ type: 'START_TASK', payload: fullTask });
      }
    } catch (error) {
      console.error('Failed to start automatic cleaning:', error);
      dispatch({ type: 'UPDATE_STATUS', payload: 'error' });
    }
  };

  const pauseCleaning = async (): Promise<void> => {
    try {
      const success = await robotApi.pauseCleaning();
      if (success) {
        dispatch({ type: 'UPDATE_STATUS', payload: 'paused' });
      }
    } catch (error) {
      console.error('Failed to pause cleaning:', error);
    }
  };

  const resumeCleaning = async (): Promise<void> => {
    try {
      const success = await robotApi.resumeCleaning();
      if (success) {
        dispatch({ type: 'UPDATE_STATUS', payload: 'cleaning' });
      }
    } catch (error) {
      console.error('Failed to resume cleaning:', error);
    }
  };

  const returnToDock = async (): Promise<void> => {
    try {
      const success = await robotApi.returnToDock();
      if (success) {
        dispatch({ type: 'UPDATE_STATUS', payload: 'returning' });
      }
    } catch (error) {
      console.error('Failed to return to dock:', error);
    }
  };

  const moveRobot = async (direction: 'forward' | 'backward' | 'left' | 'right'): Promise<void> => {
    try {
      // Try Bluetooth first if connected, fallback to API
      if (isBluetoothConnected) {
        await bluetoothService.sendCommand(`MOVE_${direction.toUpperCase()}`);
      } else {
        await robotApi.moveRobot(direction);
      }
    } catch (error) {
      console.error(`Failed to move robot ${direction}:`, error);
    }
  };

  const toggleFunction = async (functionName: keyof RobotState['capabilities'], enabled: boolean): Promise<void> => {
    try {
      const success = await robotApi.toggleFunction(functionName, enabled);
      if (success) {
        dispatch({ 
          type: 'SET_CAPABILITIES', 
          payload: { ...state.capabilities, [functionName]: enabled } 
        });
      }
    } catch (error) {
      console.error(`Failed to toggle ${functionName}:`, error);
    }
  };

  const checkConnection = async (): Promise<void> => {
    try {
      const apiConnected = await robotApi.checkConnection();
      setIsApiConnected(apiConnected);
      setQueuedCommandsCount(robotApi.queuedCommandsCount);
      setIsBluetoothConnected(bluetoothService.getConnectionStatus());
    } catch (error) {
      setIsApiConnected(false);
    }
  };

  const scanForBluetoothDevices = async (): Promise<void> => {
    try {
      setAvailableDevices([]);
      await bluetoothService.scanForDevices((device) => {
        setAvailableDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      });
    } catch (error) {
      console.error('Failed to scan for Bluetooth devices:', error);
    }
  };

  const connectToBluetoothDevice = async (deviceId: string): Promise<boolean> => {
    try {
      const success = await bluetoothService.connectToDevice(deviceId);
      setIsBluetoothConnected(success);
      if (success) {
        dispatch({ 
          type: 'UPDATE_CONNECTIVITY', 
          payload: { isOnline: true, signalStrength: 100, lastSeen: new Date() }
        });
      }
      return success;
    } catch (error) {
      console.error('Failed to connect to Bluetooth device:', error);
      setIsBluetoothConnected(false);
      return false;
    }
  };

  const disconnectBluetooth = async (): Promise<void> => {
    try {
      await bluetoothService.disconnect();
      setIsBluetoothConnected(false);
      dispatch({ 
        type: 'UPDATE_CONNECTIVITY', 
        payload: { isOnline: false, signalStrength: 0, lastSeen: new Date() }
      });
    } catch (error) {
      console.error('Failed to disconnect Bluetooth:', error);
    }
  };

  const contextValue: RobotContextType = {
    state,
    dispatch,
    isConnected,
    isApiConnected,
    isBluetoothConnected,
    queuedCommandsCount,
    availableDevices,
    startManualControl,
    startAutomaticCleaning,
    pauseCleaning,
    resumeCleaning,
    returnToDock,
    moveRobot,
    toggleFunction,
    checkConnection,
    scanForBluetoothDevices,
    connectToBluetoothDevice,
    disconnectBluetooth
  };

  return (
    <RobotContext.Provider value={contextValue}>
      {children}
    </RobotContext.Provider>
  );
};