import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glassmorphism?: boolean;
  gradient?: boolean;
  padding?: keyof typeof import('../../types/theme').lightTheme.spacing;
  pressable?: boolean;
  onPress?: () => void;
  animated?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Card: React.FC<CardProps> = ({
  children,
  style,
  glassmorphism = false,
  gradient = false,
  padding = 'md',
  pressable = false,
  onPress,
  animated = false
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(animated ? 0 : 1);

  React.useEffect(() => {
    if (animated) {
      opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [animated]);

  const handlePressIn = () => {
    if (!pressable) return;
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (!pressable) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing[padding],
      overflow: 'hidden',
      position: 'relative'
    };

    if (glassmorphism) {
      return {
        ...baseStyle,
        backgroundColor: theme.glassmorphism.background,
        borderWidth: 1,
        borderColor: theme.glassmorphism.border,
        ...theme.shadows.medium
      };
    }

    if (gradient) {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        ...theme.shadows.medium
      };
    }

    return {
      ...baseStyle,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.small
    };
  };

  if (pressable) {
    return (
      <AnimatedView
        style={[getCardStyle(), animatedStyle, style]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
      >
        {gradient && (
          <LinearGradient
            colors={theme.gradients.surface as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <View style={{ zIndex: 1 }}>
          {children}
        </View>
      </AnimatedView>
    );
  }

  return (
    <AnimatedView style={[getCardStyle(), animatedStyle, style]}>
      {gradient && (
        <LinearGradient
          colors={theme.gradients.surface as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
      <View style={{ zIndex: 1 }}>
        {children}
      </View>
    </AnimatedView>
  );
};