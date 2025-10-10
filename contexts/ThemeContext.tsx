import React, { ReactNode, createContext, useEffect, useRef, useState } from 'react';
import { Animated, useColorScheme } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import { storageService } from '../services/storage';
import { AppTheme, ThemeMode, darkTheme, lightTheme } from '../types/theme';
import { highContrastColors } from '../utils/accessibility';

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isHighContrast: boolean;
  isTransitioning: boolean;
  transitionOpacity: Animated.Value;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { isHighContrastEnabled } = useAccessibility();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<AppTheme>(lightTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionOpacityRef = useRef(new Animated.Value(1));
  const transitionOpacity = transitionOpacityRef.current;

  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await storageService.getThemeMode();
        setThemeModeState(savedMode);
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  // Update theme when mode, system preference, or accessibility changes with smooth transition
  useEffect(() => {
    let effectiveMode: 'light' | 'dark';

    if (themeMode === 'system') {
      effectiveMode = systemColorScheme === 'dark' ? 'dark' : 'light';
    } else {
      effectiveMode = themeMode;
    }

    let newTheme = effectiveMode === 'dark' ? darkTheme : lightTheme;
    
    // Apply high contrast colors if enabled
    if (isHighContrastEnabled) {
      const contrastColors = effectiveMode === 'dark' 
        ? highContrastColors.dark 
        : highContrastColors.light;
      
      newTheme = {
        ...newTheme,
        colors: {
          ...newTheme.colors,
          ...contrastColors,
        },
      };
    }
    
    // Only animate if theme actually changes
    if (newTheme.mode !== theme.mode || isHighContrastEnabled !== (theme as any).isHighContrast) {
      setIsTransitioning(true);
      
      // Fade out
      Animated.timing(transitionOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start(() => {
        // Change theme
        setTheme({ ...newTheme, isHighContrast: isHighContrastEnabled } as any);
        
        // Fade in
        Animated.timing(transitionOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }).start(() => {
          setIsTransitioning(false);
        });
      });
    } else {
      setTheme({ ...newTheme, isHighContrast: isHighContrastEnabled } as any);
    }
  }, [themeMode, systemColorScheme, isHighContrastEnabled, theme.mode]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await storageService.saveThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark: theme.mode === 'dark',
    isHighContrast: isHighContrastEnabled,
    isTransitioning,
    transitionOpacity
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};