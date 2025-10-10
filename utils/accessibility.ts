import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  fontScale: number;
}

class AccessibilityManager {
  private state: AccessibilityState = {
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    fontScale: 1,
  };

  private listeners: Array<(state: AccessibilityState) => void> = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Check screen reader status
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.state.isScreenReaderEnabled = isScreenReaderEnabled;

      // Check reduce motion (iOS only for now)
      if (Platform.OS === 'ios') {
        const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        this.state.isReduceMotionEnabled = isReduceMotionEnabled;
      }

      // Set up listeners
      AccessibilityInfo.addEventListener('screenReaderChanged', this.handleScreenReaderChange);
      
      if (Platform.OS === 'ios') {
        AccessibilityInfo.addEventListener('reduceMotionChanged', this.handleReduceMotionChange);
      }

      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to initialize accessibility manager:', error);
    }
  }

  private handleScreenReaderChange = (isEnabled: boolean) => {
    this.state.isScreenReaderEnabled = isEnabled;
    this.notifyListeners();
  };

  private handleReduceMotionChange = (isEnabled: boolean) => {
    this.state.isReduceMotionEnabled = isEnabled;
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  public subscribe(listener: (state: AccessibilityState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getState(): AccessibilityState {
    return { ...this.state };
  }

  public announceForAccessibility(message: string) {
    AccessibilityInfo.announceForAccessibility(message);
  }

  public setAccessibilityFocus(reactTag: number) {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }
}

export const accessibilityManager = new AccessibilityManager();

// Accessibility helpers
export const accessibilityHelpers = {
  // Create accessible button props
  createButtonProps: (label: string, hint?: string, role: string = 'button') => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role as any,
  }),

  // Create accessible text props
  createTextProps: (text: string, role: string = 'text') => ({
    accessible: true,
    accessibilityLabel: text,
    accessibilityRole: role as any,
  }),

  // Create accessible input props
  createInputProps: (label: string, value?: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityValue: value ? { text: value } : undefined,
    accessibilityHint: hint,
    accessibilityRole: 'textbox' as any,
  }),

  // Create accessible slider props
  createSliderProps: (label: string, value: number, min: number, max: number) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityValue: { 
      min, 
      max, 
      now: value,
      text: `${Math.round(value)}%`
    },
    accessibilityRole: 'adjustable' as any,
  }),

  // Create accessible switch props
  createSwitchProps: (label: string, isOn: boolean, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityState: { checked: isOn },
    accessibilityHint: hint,
    accessibilityRole: 'switch' as any,
  }),

  // Create accessible progress props
  createProgressProps: (label: string, progress: number) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityValue: { 
      min: 0, 
      max: 100, 
      now: progress,
      text: `${Math.round(progress)}% complete`
    },
    accessibilityRole: 'progressbar' as any,
  }),

  // Create accessible navigation props
  createNavigationProps: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint || `Navigate to ${label}`,
    accessibilityRole: 'button' as any,
  }),

  // Create accessible status props
  createStatusProps: (status: string, description?: string) => ({
    accessible: true,
    accessibilityLabel: `Status: ${status}`,
    accessibilityHint: description,
    accessibilityRole: 'text' as any,
    accessibilityLiveRegion: 'polite' as any,
  }),
};

// High contrast color helpers
export const highContrastColors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#333333',
    border: '#000000',
    primary: '#0000FF',
    success: '#008000',
    warning: '#FF8C00',
    error: '#FF0000',
  },
  dark: {
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#FFFFFF',
    primary: '#00BFFF',
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF4444',
  },
};

// Font scaling helpers
export const fontScaling = {
  // Get scaled font size with accessibility considerations
  getScaledFontSize: (baseSize: number, fontScale: number = 1) => {
    // Cap font scaling to prevent layout issues
    const cappedScale = Math.min(fontScale, 1.5);
    return Math.round(baseSize * cappedScale);
  },

  // Get line height that scales with font size
  getScaledLineHeight: (fontSize: number) => {
    return Math.round(fontSize * 1.4);
  },

  // Get minimum touch target size
  getMinTouchTarget: () => 44, // iOS HIG minimum

  // Get comfortable touch target size
  getComfortableTouchTarget: () => 56,
};

// Motion helpers
export const motionHelpers = {
  // Get animation duration based on reduce motion preference
  getAnimationDuration: (baseDuration: number, isReduceMotion: boolean = false) => {
    return isReduceMotion ? 0 : baseDuration;
  },

  // Get spring animation config with reduce motion support
  getSpringConfig: (isReduceMotion: boolean = false) => {
    if (isReduceMotion) {
      return { duration: 0 };
    }
    return {
      tension: 100,
      friction: 8,
    };
  },

  // Get timing animation config with reduce motion support
  getTimingConfig: (duration: number, isReduceMotion: boolean = false) => {
    return {
      duration: isReduceMotion ? 0 : duration,
      useNativeDriver: true,
    };
  },
};