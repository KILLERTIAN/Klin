import { useCallback, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';
import { ThemeMode } from '../types/theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Enhanced theme switcher hook with system auto-detection
 */
export const useThemeSwitcher = () => {
  const { themeMode, setThemeMode, isDark, isTransitioning } = useTheme();
  const systemColorScheme = useColorScheme();

  const toggleTheme = useCallback(() => {
    if (themeMode === 'system') {
      // If currently on system, switch to opposite of current system theme
      const newMode = systemColorScheme === 'dark' ? 'light' : 'dark';
      setThemeMode(newMode);
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  }, [themeMode, systemColorScheme, setThemeMode]);

  const setLightTheme = useCallback(() => {
    setThemeMode('light');
  }, [setThemeMode]);

  const setDarkTheme = useCallback(() => {
    setThemeMode('dark');
  }, [setThemeMode]);

  const setSystemTheme = useCallback(() => {
    setThemeMode('system');
  }, [setThemeMode]);

  const cycleTheme = useCallback(() => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  }, [themeMode, setThemeMode]);

  return {
    themeMode,
    isDark,
    isTransitioning,
    isSystemTheme: themeMode === 'system',
    systemColorScheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    cycleTheme,
    setThemeMode,
  };
};