import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { BREAKPOINTS } from '../constants/responsive';

interface ResponsiveState {
  width: number;
  height: number;
  isPhone: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  breakpoint: keyof typeof BREAKPOINTS;
}

export const useResponsive = (): ResponsiveState => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isLandscape = width > height;
  const isPortrait = height > width;

  // Determine current breakpoint
  let breakpoint: keyof typeof BREAKPOINTS = 'xs';
  if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
  else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
  else if (width >= BREAKPOINTS.md) breakpoint = 'md';
  else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';

  return {
    width,
    height,
    isPhone: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md,
    isLandscape,
    isPortrait,
    breakpoint,
  };
};

// Hook for responsive values
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T => {
  const { breakpoint } = useResponsive();
  
  // Return the most specific value available for current breakpoint
  if (breakpoint === 'xl' && values.xl !== undefined) return values.xl;
  if (breakpoint === 'lg' && values.lg !== undefined) return values.lg;
  if (breakpoint === 'md' && values.md !== undefined) return values.md;
  if (breakpoint === 'sm' && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  
  return values.default;
};

// Hook for responsive spacing
export const useResponsiveSpacing = () => {
  const { isTablet, isPhone } = useResponsive();
  
  return {
    container: isTablet ? 32 : 16,
    section: isTablet ? 24 : 16,
    element: isTablet ? 16 : 12,
    small: isTablet ? 12 : 8,
    tiny: isTablet ? 8 : 4,
  };
};

// Hook for responsive typography
export const useResponsiveTypography = () => {
  const { isTablet } = useResponsive();
  
  const scale = isTablet ? 1.2 : 1;
  
  return {
    h1: { fontSize: Math.round(32 * scale) },
    h2: { fontSize: Math.round(24 * scale) },
    h3: { fontSize: Math.round(20 * scale) },
    bodyLarge: { fontSize: Math.round(16 * scale) },
    body: { fontSize: Math.round(14 * scale) },
    caption: { fontSize: Math.round(12 * scale) },
  };
};