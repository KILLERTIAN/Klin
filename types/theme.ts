export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    accent: string[];
    background: string[];
    surface: string[];
    success: string[];
    warning: string[];
    error: string[];
  };
  glassmorphism: {
    background: string;
    border: string;
    blur: number;
    opacity: number;
    saturate: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    glow: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    circular: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: '700';
      letterSpacing: number;
    };
    h2: {
      fontSize: number;
      fontWeight: '600';
      letterSpacing: number;
    };
    h3: {
      fontSize: number;
      fontWeight: '600';
    };
    bodyLarge: {
      fontSize: number;
      fontWeight: '400';
      lineHeight: number;
    };
    body: {
      fontSize: number;
      fontWeight: '400';
      lineHeight: number;
    };
    caption: {
      fontSize: number;
      fontWeight: '500';
      letterSpacing: number;
    };
  };
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    primary: '#007AFF',
    secondary: '#F2F2F7',
    accent: '#34C759',
    background: '#F2F2F7',
    surface: 'rgba(255,255,255,0.95)',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30'
  },
  gradients: {
    primary: ['#007AFF', '#5AC8FA'],
    secondary: ['#F2F2F7', '#FFFFFF'],
    accent: ['#34C759', '#30D158'],
    background: ['#F2F2F7', '#FFFFFF'],
    surface: ['rgba(255,255,255,0.95)', 'rgba(242,242,247,0.9)'],
    success: ['#34C759', '#30D158'],
    warning: ['#FF9500', '#FFCC02'],
    error: ['#FF3B30', '#FF6961']
  },
  glassmorphism: {
    background: 'rgba(255,255,255,0.8)',
    border: 'rgba(255,255,255,0.3)',
    blur: 20,
    opacity: 0.95,
    saturate: 180
  },
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6
    },
    glow: {
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4
    }
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    circular: 9999
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -0.5
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: -0.25
    },
    h3: {
      fontSize: 20,
      fontWeight: '600'
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.5
    }
  }
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    primary: '#0A84FF',
    secondary: '#1C1C1E',
    accent: '#30D158',
    background: '#000000',
    surface: 'rgba(28,28,30,0.95)',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A'
  },
  gradients: {
    primary: ['#0A84FF', '#64D2FF'],
    secondary: ['#1C1C1E', '#2C2C2E'],
    accent: ['#30D158', '#32D74B'],
    background: ['#000000', '#1C1C1E'],
    surface: ['rgba(28,28,30,0.95)', 'rgba(44,44,46,0.9)'],
    success: ['#30D158', '#32D74B'],
    warning: ['#FF9F0A', '#FFCC02'],
    error: ['#FF453A', '#FF6961']
  },
  glassmorphism: {
    background: 'rgba(28,28,30,0.8)',
    border: 'rgba(255,255,255,0.15)',
    blur: 20,
    opacity: 0.95,
    saturate: 180
  },
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 6
    },
    glow: {
      shadowColor: '#0A84FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4
    }
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    circular: 9999
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -0.5
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: -0.25
    },
    h3: {
      fontSize: 20,
      fontWeight: '600'
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.5
    }
  }
};