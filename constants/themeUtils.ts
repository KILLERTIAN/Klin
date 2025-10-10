import { TextStyle, ViewStyle } from 'react-native';
import { AppTheme } from '../types/theme';

/**
 * Glassmorphism styling utilities for creating modern glass-like effects
 */
export class ThemeUtils {
  /**
   * Creates a glassmorphism style object for views
   */
  static createGlassmorphismStyle(theme: AppTheme, intensity: 'light' | 'medium' | 'strong' = 'medium'): ViewStyle {
    const intensityMap = {
      light: 0.1,
      medium: 0.2,
      strong: 0.3
    };

    const opacity = intensityMap[intensity];

    return {
      backgroundColor: theme.glassmorphism.background,
      borderWidth: 1,
      borderColor: theme.glassmorphism.border,
      backdropFilter: `blur(${theme.glassmorphism.blur}px) saturate(${theme.glassmorphism.saturate}%)`,
      // Note: React Native doesn't support backdrop-filter, but we include it for web compatibility
      // For native, we'll use semi-transparent backgrounds to simulate the effect
      opacity: theme.glassmorphism.opacity,
    };
  }

  /**
   * Creates a card style with glassmorphism effects
   */
  static createGlassCard(theme: AppTheme, size: 'small' | 'medium' | 'large' = 'medium'): ViewStyle {
    const shadowMap = {
      small: theme.shadows.small,
      medium: theme.shadows.medium,
      large: theme.shadows.large
    };

    const radiusMap = {
      small: theme.borderRadius.small,
      medium: theme.borderRadius.medium,
      large: theme.borderRadius.large
    };

    return {
      ...this.createGlassmorphismStyle(theme),
      borderRadius: radiusMap[size],
      ...shadowMap[size],
      padding: theme.spacing.md,
    };
  }

  /**
   * Creates a glow effect style for buttons and interactive elements
   */
  static createGlowEffect(theme: AppTheme, color?: string): ViewStyle {
    return {
      ...theme.shadows.glow,
      shadowColor: color || theme.colors.primary,
    };
  }

  /**
   * Creates gradient background colors (for use with LinearGradient)
   */
  static getGradientColors(theme: AppTheme, type: keyof AppTheme['gradients']): string[] {
    return theme.gradients[type];
  }

  /**
   * Creates a button style with glassmorphism and glow effects
   */
  static createGlassButton(
    theme: AppTheme, 
    variant: 'primary' | 'secondary' | 'accent' = 'primary',
    size: 'small' | 'medium' | 'large' = 'medium'
  ): ViewStyle {
    const paddingMap = {
      small: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
      medium: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg },
      large: { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl }
    };

    const radiusMap = {
      small: theme.borderRadius.small,
      medium: theme.borderRadius.medium,
      large: theme.borderRadius.large
    };

    const colorMap = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent
    };

    return {
      ...this.createGlassmorphismStyle(theme, 'medium'),
      ...paddingMap[size],
      borderRadius: radiusMap[size],
      borderColor: colorMap[variant],
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    };
  }

  /**
   * Creates typography styles with theme consistency
   */
  static createTextStyle(
    theme: AppTheme, 
    variant: keyof AppTheme['typography'],
    color?: string
  ): TextStyle {
    return {
      ...theme.typography[variant],
      color: color || theme.colors.text,
      fontFamily: 'System', // Will be enhanced with custom fonts later
    };
  }

  /**
   * Creates a floating action button style
   */
  static createFABStyle(theme: AppTheme, size: number = 56): ViewStyle {
    return {
      width: size,
      height: size,
      borderRadius: theme.borderRadius.circular,
      backgroundColor: theme.colors.primary,
      ...theme.shadows.large,
      ...this.createGlowEffect(theme),
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    };
  }

  /**
   * Creates a toggle switch style with glassmorphism
   */
  static createToggleStyle(theme: AppTheme, isActive: boolean): ViewStyle {
    return {
      ...this.createGlassmorphismStyle(theme, 'light'),
      borderRadius: theme.borderRadius.circular,
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      borderWidth: 2,
      ...(isActive ? this.createGlowEffect(theme) : {}),
    };
  }

  /**
   * Creates a progress bar style with glassmorphism
   */
  static createProgressBarStyle(theme: AppTheme): {
    container: ViewStyle;
    fill: ViewStyle;
  } {
    return {
      container: {
        ...this.createGlassmorphismStyle(theme, 'light'),
        borderRadius: theme.borderRadius.circular,
        height: 8,
        overflow: 'hidden',
      },
      fill: {
        height: '100%',
        borderRadius: theme.borderRadius.circular,
        backgroundColor: theme.colors.primary,
      }
    };
  }

  /**
   * Creates a modal/overlay style with glassmorphism
   */
  static createModalOverlay(theme: AppTheme): ViewStyle {
    return {
      flex: 1,
      backgroundColor: theme.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: `blur(${theme.glassmorphism.blur}px)`,
      alignItems: 'center',
      justifyContent: 'center',
    };
  }

  /**
   * Creates spacing utilities
   */
  static spacing = {
    marginTop: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ marginTop: theme.spacing[size] }),
    marginBottom: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ marginBottom: theme.spacing[size] }),
    marginLeft: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ marginLeft: theme.spacing[size] }),
    marginRight: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ marginRight: theme.spacing[size] }),
    marginHorizontal: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ marginHorizontal: theme.spacing[size] }),
    marginVertical: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ marginVertical: theme.spacing[size] }),
    paddingTop: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ paddingTop: theme.spacing[size] }),
    paddingBottom: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ paddingBottom: theme.spacing[size] }),
    paddingLeft: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ paddingLeft: theme.spacing[size] }),
    paddingRight: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ paddingRight: theme.spacing[size] }),
    paddingHorizontal: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ paddingHorizontal: theme.spacing[size] }),
    paddingVertical: (theme: AppTheme, size: keyof AppTheme['spacing']) => ({ paddingVertical: theme.spacing[size] }),
  };

  /**
   * Creates animation timing configurations
   */
  static animations = {
    // Micro-interactions: 150-200ms ease-out
    micro: {
      duration: 150,
      easing: 'ease-out' as const,
    },
    // Screen transitions: 300ms ease-in-out
    transition: {
      duration: 300,
      easing: 'ease-in-out' as const,
    },
    // Loading states: 1000ms loop with ease-in-out
    loading: {
      duration: 1000,
      easing: 'ease-in-out' as const,
      loop: true,
    },
    // Spring animations: Natural feel
    spring: {
      tension: 100,
      friction: 8,
    },
  };
}