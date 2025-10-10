import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// Device type detection
export const DEVICE_TYPES = {
  phone: SCREEN_WIDTH < BREAKPOINTS.md,
  tablet: SCREEN_WIDTH >= BREAKPOINTS.md && SCREEN_WIDTH < BREAKPOINTS.xl,
  desktop: SCREEN_WIDTH >= BREAKPOINTS.xl,
} as const;

// Screen size utilities
export const screenUtils = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH < 375,
  isMediumScreen: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeScreen: SCREEN_WIDTH >= 414,
  isTablet: DEVICE_TYPES.tablet,
  isPhone: DEVICE_TYPES.phone,
  
  // Responsive scaling
  scale: (size: number) => {
    const baseWidth = 375; // iPhone X width as base
    return (SCREEN_WIDTH / baseWidth) * size;
  },
  
  // Responsive font scaling
  fontScale: (size: number) => {
    const scale = SCREEN_WIDTH / 375;
    const newSize = size * scale;
    return Math.max(size * 0.8, Math.min(newSize, size * 1.3));
  },
  
  // Responsive spacing
  spacing: (base: number) => {
    if (DEVICE_TYPES.tablet) return base * 1.5;
    if (screenUtils.isSmallScreen) return base * 0.8;
    return base;
  },
  
  // Touch target optimization
  touchTarget: {
    minSize: 44, // iOS HIG minimum
    recommended: 48, // Material Design recommendation
    comfortable: 56, // Comfortable for most users
  },
  
  // Safe area calculations
  getSafeAreaPadding: () => ({
    paddingTop: DEVICE_TYPES.phone ? 20 : 32,
    paddingBottom: DEVICE_TYPES.phone ? 20 : 32,
    paddingHorizontal: DEVICE_TYPES.tablet ? 32 : 16,
  }),
};

// Responsive breakpoint hooks
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T => {
  const width = SCREEN_WIDTH;
  
  if (width >= BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
  if (width >= BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
  if (width >= BREAKPOINTS.md && values.md !== undefined) return values.md;
  if (width >= BREAKPOINTS.sm && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  
  return values.default;
};

// Orientation utilities
export const orientationUtils = {
  isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  isPortrait: SCREEN_HEIGHT > SCREEN_WIDTH,
  
  // Get responsive columns based on screen size and orientation
  getColumns: () => {
    if (DEVICE_TYPES.tablet) {
      return orientationUtils.isLandscape ? 3 : 2;
    }
    return orientationUtils.isLandscape ? 2 : 1;
  },
  
  // Get responsive grid spacing
  getGridSpacing: () => {
    if (DEVICE_TYPES.tablet) return 24;
    return 16;
  },
};

// Accessibility utilities
export const accessibilityUtils = {
  // Minimum touch target size
  ensureMinTouchTarget: (size: number) => 
    Math.max(size, screenUtils.touchTarget.minSize),
  
  // High contrast detection (would need native module for real detection)
  isHighContrast: false, // Placeholder - would be set by native module
  
  // Reduced motion detection (would need native module for real detection)
  isReducedMotion: false, // Placeholder - would be set by native module
  
  // Font scaling for accessibility
  getAccessibleFontSize: (baseSize: number) => {
    const fontScale = PixelRatio.getFontScale();
    return baseSize * Math.min(fontScale, 1.3); // Cap at 130% for layout stability
  },
};

// Responsive style helpers
export const responsiveStyles = {
  // Container styles based on device type
  container: {
    phone: {
      paddingHorizontal: 16,
      maxWidth: '100%',
    },
    tablet: {
      paddingHorizontal: 32,
      maxWidth: 768,
      alignSelf: 'center' as const,
    },
  },
  
  // Grid layouts
  grid: {
    phone: {
      numColumns: 1,
      spacing: 16,
    },
    tablet: {
      numColumns: 2,
      spacing: 24,
    },
  },
  
  // Typography scaling
  typography: {
    h1: {
      phone: { fontSize: 28 },
      tablet: { fontSize: 36 },
    },
    h2: {
      phone: { fontSize: 22 },
      tablet: { fontSize: 28 },
    },
    h3: {
      phone: { fontSize: 18 },
      tablet: { fontSize: 22 },
    },
    body: {
      phone: { fontSize: 14 },
      tablet: { fontSize: 16 },
    },
  },
};

export default {
  BREAKPOINTS,
  DEVICE_TYPES,
  screenUtils,
  useResponsiveValue,
  orientationUtils,
  accessibilityUtils,
  responsiveStyles,
};