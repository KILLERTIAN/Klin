export interface RobotState {
  id: string;
  name: string;
  status: 'idle' | 'cleaning' | 'docked' | 'paused' | 'error' | 'returning';
  battery: {
    percentage: number;
    isCharging: boolean;
    estimatedRuntime: number; // minutes
  };
  connectivity: {
    isOnline: boolean;
    signalStrength: number; // 0-100
    lastSeen: Date;
  };
  position: {
    x: number;
    y: number;
    rotation: number; // degrees
  };
  capabilities: {
    waterDispenser: boolean;
    mopping: boolean;
    brooming: boolean;
    vacuum: boolean;
  };
  currentTask?: CleaningTask;
}

export interface CleaningTask {
  id: string;
  mode: 'manual' | 'automatic';
  startTime: Date;
  estimatedDuration: number;
  selectedRooms: string[];
  intensity: 'low' | 'medium' | 'high';
  progress: {
    percentage: number;
    areaCovered: number; // square meters
    currentRoom: string;
  };
}

export interface Point {
  x: number;
  y: number;
}

export interface RoomMap {
  id: string;
  name: string;
  lastUpdated: Date;
  dimensions: {
    width: number;
    height: number;
    scale: number; // pixels per meter
  };
  rooms: Room[];
  obstacles: Obstacle[];
  cleaningPath: PathPoint[];
}

export interface Room {
  id: string;
  name: string;
  type: 'kitchen' | 'bedroom' | 'living_room' | 'bathroom' | 'hallway' | 'other';
  polygon: Point[];
  isSelected: boolean;
  cleaningStatus: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface Obstacle {
  id: string;
  type: 'furniture' | 'wall' | 'stairs' | 'no_go_zone';
  polygon: Point[];
  isTemporary: boolean;
}

export interface PathPoint extends Point {
  timestamp: Date;
  action: 'move' | 'clean' | 'pause';
}

// Enhanced map visualization types
export interface MapArea {
  id: string;
  type: 'cleaned' | 'uncleaned' | 'cleaning' | 'no_go';
  polygon: Point[];
  cleanedAt?: Date;
  cleaningProgress?: number; // 0-100
}

export interface NoGoZone {
  id: string;
  name: string;
  polygon: Point[];
  isActive: boolean;
  createdAt: Date;
}

export interface MapMarker {
  id: string;
  position: Point;
  type: 'robot' | 'dock' | 'obstacle' | 'waypoint';
  label?: string;
  icon?: string;
  isVisible: boolean;
}

export interface CleaningZone {
  id: string;
  name: string;
  polygon: Point[];
  intensity: 'low' | 'medium' | 'high';
  isActive: boolean;
  estimatedDuration: number; // minutes
}

// Enhanced room map with visualization data
export interface EnhancedRoomMap extends RoomMap {
  areas: MapArea[];
  noGoZones: NoGoZone[];
  markers: MapMarker[];
  cleaningZones: CleaningZone[];
  viewport: {
    center: Point;
    zoom: number;
    rotation: number;
  };
}

export interface CleaningSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  mode: 'manual' | 'automatic';
  areaCovered: number; // square meters
  batteryUsed: number; // percentage
  roomsCleaned: string[];
  intensity: 'low' | 'medium' | 'high';
  status: 'completed' | 'interrupted' | 'error';
  errorMessage?: string;
}

export interface UsageAnalytics {
  totalSessions: number;
  totalCleaningTime: number; // minutes
  totalAreaCleaned: number; // square meters
  averageSessionDuration: number;
  mostCleanedRooms: Array<{ roomId: string; count: number }>;
  weeklyUsage: Array<{ week: string; sessions: number; duration: number }>;
}

export enum ErrorType {
  CONNECTIVITY = 'connectivity',
  ROBOT_HARDWARE = 'robot_hardware',
  NAVIGATION = 'navigation',
  BATTERY = 'battery',
  USER_INPUT = 'user_input',
  API = 'api'
}

export interface AppError {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  isRecoverable: boolean;
  suggestedAction?: string;
}

export type RobotStatus = RobotState['status'];

export type RobotAction = 
  | { type: 'UPDATE_STATUS'; payload: RobotState['status'] }
  | { type: 'UPDATE_BATTERY'; payload: Partial<RobotState['battery']> }
  | { type: 'UPDATE_POSITION'; payload: Partial<RobotState['position']> }
  | { type: 'UPDATE_CONNECTIVITY'; payload: Partial<RobotState['connectivity']> }
  | { type: 'START_TASK'; payload: CleaningTask }
  | { type: 'UPDATE_TASK_PROGRESS'; payload: Partial<CleaningTask['progress']> }
  | { type: 'UPDATE_TASK_DURATION'; payload: number }
  | { type: 'COMPLETE_TASK' }
  | { type: 'SET_CAPABILITIES'; payload: Partial<RobotState['capabilities']> }
  | { type: 'SET_ROBOT_STATE'; payload: RobotState }
  | { type: 'UPDATE_FULL_STATE'; payload: Partial<RobotState> };