import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'weak' | 'strong';

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  signalStrength?: number; // 0-100
  showSignalBars?: boolean;
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({
  status,
  signalStrength = 100,
  showSignalBars = true,
  showLabel = true,
  animated = true,
  style,
  labelStyle
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const connectingAnimation = useSharedValue(0);
  const signalAnimation = useSharedValue(0);
  const badgeScale = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      // Connecting animation
      if (status === 'connecting') {
        connectingAnimation.value = withRepeat(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      } else {
        connectingAnimation.value = withTiming(0, { duration: 300 });
      }
      
      // Signal strength animation
      signalAnimation.value = withTiming(signalStrength / 100, { duration: 800 });
      
      // Badge entrance animation
      badgeScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [status, signalStrength, animated]);

  // Status configurations
  const statusConfig = {
    connected: {
      color: theme.colors.success,
      gradient: [theme.colors.success, theme.colors.accent],
      icon: 'wifi' as keyof typeof MaterialCommunityIcons.glyphMap,
      label: 'Connected'
    },
    connecting: {
      color: theme.colors.warning,
      gradient: [theme.colors.warning, '#FFE066'],
      icon: 'wifi-sync' as keyof typeof MaterialCommunityIcons.glyphMap,
      label: 'Connecting...'
    },
    disconnected: {
      color: theme.colors.error,
      gradient: [theme.colors.error, '#FF8A8A'],
      icon: 'wifi-off' as keyof typeof MaterialCommunityIcons.glyphMap,
      label: 'Disconnected'
    },
    weak: {
      color: theme.colors.warning,
      gradient: [theme.colors.warning, '#FFE066'],
      icon: 'wifi-strength-1' as keyof typeof MaterialCommunityIcons.glyphMap,
      label: 'Weak Signal'
    },
    strong: {
      color: theme.colors.success,
      gradient: [theme.colors.success, theme.colors.accent],
      icon: 'wifi-strength-4' as keyof typeof MaterialCommunityIcons.glyphMap,
      label: 'Strong Signal'
    }
  };

  const currentStatus = statusConfig[status];

  // Animated styles
  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const animatedConnectingStyle = useAnimatedStyle(() => {
    const opacity = interpolate(connectingAnimation.value, [0, 1], [0.5, 1]);
    return {
      opacity: status === 'connecting' ? opacity : 1,
    };
  });

  const getSignalBars = () => {
    const bars = [];
    const barCount = 4;
    const strengthPerBar = 100 / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const barStrength = (i + 1) * strengthPerBar;
      const isActive = signalStrength >= barStrength;
      
      bars.push(
        <Animated.View
          key={i}
          style={[
            {
              width: 3,
              height: 4 + i * 2,
              backgroundColor: isActive ? currentStatus.color : theme.colors.border,
              marginHorizontal: 0.5,
              borderRadius: 1,
            },
            useAnimatedStyle(() => ({
              opacity: isActive ? signalAnimation.value : 0.3,
            })),
          ]}
        />
      );
    }
    
    return bars;
  };

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.small,
        },
        animatedBadgeStyle,
        style,
      ]}
    >
      {/* Connection Icon */}
      <Animated.View style={[animatedConnectingStyle]}>
        <MaterialCommunityIcons
          name={currentStatus.icon}
          size={16}
          color={currentStatus.color}
        />
      </Animated.View>
      
      {/* Signal Bars */}
      {showSignalBars && status !== 'disconnected' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginLeft: 4,
            height: 12,
          }}
        >
          {getSignalBars()}
        </View>
      )}
      
      {/* Status Label */}
      {showLabel && (
        <Text
          style={[
            {
              marginLeft: 6,
              fontSize: 12,
              fontWeight: '500',
              color: theme.colors.text,
            },
            labelStyle,
          ]}
        >
          {currentStatus.label}
        </Text>
      )}
      
      {/* Signal Strength Percentage */}
      {status !== 'disconnected' && status !== 'connecting' && (
        <Text
          style={[
            {
              marginLeft: 4,
              fontSize: 10,
              fontWeight: '600',
              color: theme.colors.textSecondary,
            },
            labelStyle,
          ]}
        >
          {Math.round(signalStrength)}%
        </Text>
      )}
    </Animated.View>
  );
};