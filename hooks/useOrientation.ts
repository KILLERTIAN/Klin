import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { useResponsive } from './useResponsive';

export type Orientation = 'portrait' | 'landscape';

interface OrientationState {
  orientation: Orientation;
  isLandscape: boolean;
  isPortrait: boolean;
  width: number;
  height: number;
}

export const useOrientation = (): OrientationState => {
  const [orientation, setOrientation] = useState<OrientationState>(() => {
    const { width, height } = Dimensions.get('window');
    const isLandscape = width > height;
    
    return {
      orientation: isLandscape ? 'landscape' : 'portrait',
      isLandscape,
      isPortrait: !isLandscape,
      width,
      height,
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      const { width, height } = window;
      const isLandscape = width > height;
      
      setOrientation({
        orientation: isLandscape ? 'landscape' : 'portrait',
        isLandscape,
        isPortrait: !isLandscape,
        width,
        height,
      });
    });

    return () => subscription?.remove();
  }, []);

  return orientation;
};

// Hook for orientation-specific values
export const useOrientationValue = <T>(values: {
  portrait: T;
  landscape: T;
}): T => {
  const { isLandscape } = useOrientation();
  return isLandscape ? values.landscape : values.portrait;
};

// Hook for responsive columns based on orientation
export const useOrientationColumns = (baseColumns: number = 1): number => {
  const { isLandscape } = useOrientation();
  const { isTablet } = useResponsive();
  
  if (isTablet) {
    return isLandscape ? Math.min(baseColumns + 1, 3) : baseColumns;
  }
  
  return isLandscape ? Math.min(baseColumns + 1, 2) : baseColumns;
};

