import { useEffect, useState } from 'react';
import { AccessibilityState, accessibilityManager } from '../utils/accessibility';

export const useAccessibility = () => {
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>(
    accessibilityManager.getState()
  );

  useEffect(() => {
    const unsubscribe = accessibilityManager.subscribe(setAccessibilityState);
    return unsubscribe;
  }, []);

  return {
    ...accessibilityState,
    announceForAccessibility: accessibilityManager.announceForAccessibility,
    setAccessibilityFocus: accessibilityManager.setAccessibilityFocus,
  };
};

// Hook for high contrast mode
export const useHighContrast = () => {
  const { isHighContrastEnabled } = useAccessibility();
  return isHighContrastEnabled;
};

// Hook for reduced motion
export const useReducedMotion = () => {
  const { isReduceMotionEnabled } = useAccessibility();
  return isReduceMotionEnabled;
};

// Hook for screen reader
export const useScreenReader = () => {
  const { isScreenReaderEnabled } = useAccessibility();
  return isScreenReaderEnabled;
};