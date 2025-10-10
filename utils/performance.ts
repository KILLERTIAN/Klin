import { InteractionManager, Platform } from 'react-native';

/**
 * Performance optimization utilities for the Klin Smart Home App
 */

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for high-frequency events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Run expensive operations after interactions complete
export function runAfterInteractions<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(callback());
    });
  });
}

// Optimize animation configurations for 60fps
export const animationConfig = {
  // Spring animations with optimized physics
  spring: {
    damping: 15,
    stiffness: 300,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  
  // Timing animations with native driver
  timing: {
    duration: 300,
    useNativeDriver: true,
  },
  
  // Fast micro-interactions
  microInteraction: {
    duration: 150,
    useNativeDriver: true,
  },
  
  // Smooth page transitions
  pageTransition: {
    duration: 400,
    useNativeDriver: true,
  },
  
  // Loading animations
  loading: {
    duration: 1000,
    useNativeDriver: true,
  },
};

// Haptic feedback with optimized timing
export const hapticConfig = {
  light: {
    intensity: 'light' as const,
    delay: 0,
  },
  medium: {
    intensity: 'medium' as const,
    delay: 50,
  },
  heavy: {
    intensity: 'heavy' as const,
    delay: 100,
  },
};

// Memory management utilities
export class MemoryManager {
  private static timers: Set<ReturnType<typeof setTimeout>> = new Set();
  private static intervals: Set<ReturnType<typeof setInterval>> = new Set();
  
  static setTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }
  
  static setInterval(callback: () => void, delay: number): ReturnType<typeof setInterval> {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }
  
  static clearTimeout(timer: ReturnType<typeof setTimeout>): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }
  
  static clearInterval(interval: ReturnType<typeof setInterval>): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }
  
  static cleanup(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    this.timers.clear();
    this.intervals.clear();
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Get optimized image size based on screen density
  getOptimizedSize: (baseSize: number): number => {
    const scale = Platform.select({
      ios: 2, // Assume @2x for iOS
      android: 2, // Assume xxhdpi for Android
      default: 1,
    });
    
    return Math.round(baseSize * scale);
  },
  
  // Lazy loading configuration
  lazyLoadConfig: {
    threshold: 100, // Start loading 100px before entering viewport
    rootMargin: '100px',
  },
};

// Animation performance monitoring
export class AnimationProfiler {
  private static frameCount = 0;
  private static startTime = 0;
  private static isMonitoring = false;
  
  static startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.startTime = Date.now();
    
    const monitor = () => {
      if (!this.isMonitoring) return;
      
      this.frameCount++;
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  static stopMonitoring(): number {
    if (!this.isMonitoring) return 0;
    
    this.isMonitoring = false;
    const duration = (Date.now() - this.startTime) / 1000;
    const fps = this.frameCount / duration;
    
    if (__DEV__) {
      console.log(`Animation FPS: ${fps.toFixed(2)}`);
    }
    
    return fps;
  }
}

// Worklet utilities for Reanimated
export const workletUtils = {
  // Smooth interpolation worklet
  smoothInterpolate: (
    value: number,
    inputRange: number[],
    outputRange: number[],
    extrapolate?: 'extend' | 'clamp' | 'identity'
  ) => {
    'worklet';
    
    // Simple linear interpolation for worklet context
    const input = Math.max(inputRange[0], Math.min(inputRange[1], value));
    const progress = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
    return outputRange[0] + progress * (outputRange[1] - outputRange[0]);
  },
  
  // Easing functions optimized for worklets
  easing: {
    bezier: (t: number) => {
      'worklet';
      return t * t * (3.0 - 2.0 * t); // Smooth step
    },
    
    elastic: (t: number) => {
      'worklet';
      return Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t) + 1.0;
    },
    
    bounce: (t: number) => {
      'worklet';
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    },
  },
};

// Bundle size optimization helpers
export const bundleOptimization = {
  // Lazy import helper
  lazyImport: <T>(importFn: () => Promise<T>) => {
    let cached: T | null = null;
    
    return async (): Promise<T> => {
      if (cached) return cached;
      
      cached = await importFn();
      return cached;
    };
  },
  
  // Code splitting helper for large components
  splitComponent: <P extends object>(
    importFn: () => Promise<{ default: React.ComponentType<P> }>
  ) => {
    const React = require('react');
    return React.lazy(importFn);
  },
};

// Performance monitoring
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    if (__DEV__) {
      const start = performance.now();
      renderFn();
      const end = performance.now();
      console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
    } else {
      renderFn();
    }
  },
  
  // Memory usage tracking
  trackMemory: (label: string) => {
    if (__DEV__ && (performance as any).memory) {
      const memory = (performance as any).memory;
      console.log(`${label} - Memory usage:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  },
};