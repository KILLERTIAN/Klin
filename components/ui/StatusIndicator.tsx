import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

export type StatusType = 'online' | 'offline' | 'idle' | 'cleaning' | 'charging' | 'error' | 'paused' | 'docked' | 'returning';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'medium',
  showLabel = true,
  animated = true,
  style,
  labelStyle
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const breathingAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      // Breathing animation for active states
      if (['online', 'cleaning', 'charging'].includes(status)) {
        breathingAnimation.value = withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      } else {
        breathingAnimation.value = withTiming(0, { duration: 300 });
      }
      
      // Pulse animation for error states
      if (status === 'error') {
        pulseAnimation.value = withRepeat(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      } else {
        pulseAnimation.value = withTiming(0, { duration: 300 });
      }
    }
  }, [status, animated]);

  // Size configurations
  const sizeConfig = {
    small: {
      dotSize: 8,
      fontSize: 12,
      spacing: 6
    },
    medium: {
      dotSize: 12,
      fontSize: 14,
      spacing: 8
    },
    large: {
      dotSize: 16,
      fontSize: 16,
      spacing: 10
    }
  };

  const config = sizeConfig[size];

  // Status configurations
  const statusConfig = {
    online: {
      color: theme.colors.success,
      gradient: [theme.colors.success, theme.colors.accent],
      label: 'Online'
    },
    offline: {
      color: theme.colors.textSecondary,
      gradient: [theme.colors.textSecondary, theme.colors.border],
      label: 'Offline'
    },
    idle: {
      color: theme.colors.primary,
      gradient: [theme.colors.primary, theme.colors.accent],
      label: 'Idle'
    },
    cleaning: {
      color: theme.colors.primary,
      gradient: [theme.colors.primary, theme.colors.accent],
      label: 'Cleaning'
    },
    charging: {
      color: theme.colors.warning,
      gradient: [theme.colors.warning, '#FFE066'],
      label: 'Charging'
    },
    error: {
      color: theme.colors.error,
      gradient: [theme.colors.error, '#FF8A8A'],
      label: 'Error'
    },
    paused: {
      color: theme.colors.warning,
      gradient: [theme.colors.warning, '#FFE066'],
      label: 'Paused'
    },
    docked: {
      color: theme.colors.success,
      gradient: [theme.colors.success, theme.colors.accent],
      label: 'Docked'
    },
    returning: {
      color: theme.colors.primary,
      gradient: [theme.colors.primary, theme.colors.accent],
      label: 'Returning'
    }
  };

  const currentStatus = statusConfig[status];

  // Animated styles
  const animatedDotStyle = useAnimatedStyle(() => {
    const breathingScale = interpolate(breathingAnimation.value, [0, 1], [1, 1.2]);
    const breathingOpacity = interpolate(breathingAnimation.value, [0, 1], [1, 0.7]);
    
    const pulseScale = interpolate(pulseAnimation.value, [0, 1], [1, 1.3]);
    const pulseOpacity = interpolate(pulseAnimation.value, [0, 1], [1, 0.5]);
    
    return {
      transform: [{ 
        scale: status === 'error' ? pulseScale : breathingScale 
      }],
      opacity: status === 'error' ? pulseOpacity : breathingOpacity,
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      status === 'error' ? pulseAnimation.value : breathingAnimation.value,
      [0, 1],
      [0.3, 0.6]
    );
    
    return {
      opacity: ['online', 'cleaning', 'charging', 'error'].includes(status) ? glowOpacity : 0,
    };
  });

  return (
    <View style={[
      { 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'flex-start'
      }, 
      style
    ]}>
      {/* Status Dot */}
      <View style={{ position: 'relative' }}>
        {/* Glow effect */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -config.dotSize / 2,
              left: -config.dotSize / 2,
              width: config.dotSize * 2,
              height: config.dotSize * 2,
              borderRadius: config.dotSize,
              backgroundColor: currentStatus.color,
              opacity: 0.3,
            },
            animatedGlowStyle,
          ]}
        />
        
        <Animated.View
          style={[
            {
              width: config.dotSize,
              height: config.dotSize,
              borderRadius: config.dotSize / 2,
              overflow: 'hidden',
            },
            animatedDotStyle,
          ]}
        >
          <LinearGradient
            colors={currentStatus.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Animated.View>
      </View>
      
      {/* Status Label */}
      {showLabel && (
        <Text
          style={[
            {
              marginLeft: config.spacing,
              fontSize: config.fontSize,
              fontWeight: '500',
              color: theme.colors.text,
            },
            labelStyle,
          ]}
        >
          {label || currentStatus.label}
        </Text>
      )}
    </View>
  );
};