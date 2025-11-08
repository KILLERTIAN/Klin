import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface DirectionalPadProps {
  onDirectionPress: (
    direction:
      | 'forward'
      | 'backward'
      | 'left'
      | 'right'
      | 'left_uturn'
      | 'right_uturn'
      | 'stop'
  ) => void;
  disabled?: boolean;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DirectionalPad: React.FC<DirectionalPadProps> = ({
  onDirectionPress,
  disabled = false,
  size = 200,
}) => {
  const { theme } = useTheme();

  // Animation values for each button
  const forwardScale = useSharedValue(1);
  const backwardScale = useSharedValue(1);
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftUTurnScale = useSharedValue(1);
  const rightUTurnScale = useSharedValue(1);

  // Glow animation values
  const forwardGlow = useSharedValue(0);
  const backwardGlow = useSharedValue(0);
  const leftGlow = useSharedValue(0);
  const rightGlow = useSharedValue(0);
  const leftUTurnGlow = useSharedValue(0);
  const rightUTurnGlow = useSharedValue(0);

  const centerPulse = useSharedValue(1);

  React.useEffect(() => {
    const animate = () => {
      centerPulse.value = withSpring(1.05, { damping: 15, stiffness: 100 }, () => {
        centerPulse.value = withSpring(1, { damping: 15, stiffness: 100 });
      });
    };
    const interval = setInterval(animate, 3000);
    return () => clearInterval(interval);
  }, []);

  const createButtonHandlers = (
    direction:
      | 'forward'
      | 'backward'
      | 'left'
      | 'right'
      | 'left_uturn'
      | 'right_uturn'
      | 'stop',
    scaleValue: any,
    glowValue: any
  ) => ({
    onPressIn: () => {
      if (disabled) return;
      scaleValue.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      glowValue.value = withTiming(1, { duration: 150 });

      const intensity =
        direction === 'forward'
          ? Haptics.ImpactFeedbackStyle.Medium
          : direction === 'backward'
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Heavy;

      Haptics.impactAsync(intensity);
    },
    onPressOut: () => {
      if (disabled) return;
      scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
      glowValue.value = withTiming(0, { duration: 300 });
    },
    onPress: () => {
      if (disabled) return;
      onDirectionPress(direction);
    },
  });

  // Handlers
  const forwardHandlers = createButtonHandlers('forward', forwardScale, forwardGlow);
  const backwardHandlers = createButtonHandlers('backward', backwardScale, backwardGlow);
  const leftHandlers = createButtonHandlers('left', leftScale, leftGlow);
  const rightHandlers = createButtonHandlers('right', rightScale, rightGlow);
  const leftUTurnHandlers = createButtonHandlers('left_uturn', leftUTurnScale, leftUTurnGlow);
  const rightUTurnHandlers = createButtonHandlers('right_uturn', rightUTurnScale, rightUTurnGlow);

  // Animated styles
  const makeAnimatedStyle = (scaleValue: any) => ({
    transform: [{ scale: scaleValue.value }],
  });

  const buttonSize = size * 0.25;
  const centerSize = size * 0.3;

  const getButtonStyle = (position: string) => {
    const baseStyle = {
      width: buttonSize,
      height: buttonSize,
      borderRadius: theme.borderRadius.medium,
      position: 'absolute' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      overflow: 'hidden' as const,
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, top: 0, left: (size - buttonSize) / 2 };
      case 'bottom':
        return { ...baseStyle, bottom: 0, left: (size - buttonSize) / 2 };
      case 'left':
        return { ...baseStyle, left: 0, top: (size - buttonSize) / 2 };
      case 'right':
        return { ...baseStyle, right: 0, top: (size - buttonSize) / 2 };
      case 'bottomLeft':
        return { ...baseStyle, bottom: 0, left: 10 }; // bottom-left corner
      case 'bottomRight':
        return { ...baseStyle, bottom: 0, right: 10 }; // bottom-right corner
    }
  };

  const glowStyle = {
    position: 'absolute' as const,
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: theme.borderRadius.medium + 4,
    ...theme.shadows.glow,
  };

  const centerStyle = {
    width: centerSize,
    height: centerSize,
    borderRadius: theme.borderRadius.circular,
    position: 'absolute' as const,
    top: (size - centerSize) / 2,
    left: (size - centerSize) / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  };

  const centerGlowStyle = {
    position: 'absolute' as const,
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: theme.borderRadius.circular,
    ...theme.shadows.glow,
  };

  // helper for consistent button UI
  const renderButton = (
    icon: string,
    style: any,
    glowValue: any,
    handlers: any
  ) => (
    <AnimatedPressable style={style} {...handlers} disabled={disabled}>
      <Animated.View style={[glowStyle, { opacity: glowValue.value * 0.8 }]} />
      <LinearGradient
        colors={theme.gradients.primary as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.glassmorphism.background,
            borderWidth: 1,
            borderColor: theme.glassmorphism.border,
            borderRadius: theme.borderRadius.medium,
          },
        ]}
      />
      <MaterialCommunityIcons name={icon as any} size={24} color="#FFFFFF" style={{ zIndex: 2 }} />
    </AnimatedPressable>
  );

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Directional Buttons */}
      {renderButton('chevron-up', [getButtonStyle('top'), makeAnimatedStyle(forwardScale)], forwardGlow, forwardHandlers)}
      {renderButton('chevron-down', [getButtonStyle('bottom'), makeAnimatedStyle(backwardScale)], backwardGlow, backwardHandlers)}
      {renderButton('chevron-left', [getButtonStyle('left'), makeAnimatedStyle(leftScale)], leftGlow, leftHandlers)}
      {renderButton('chevron-right', [getButtonStyle('right'), makeAnimatedStyle(rightScale)], rightGlow, rightHandlers)}

      {/* 🔄 Left U-Turn Button */}
      {renderButton('rotate-left', [getButtonStyle('bottomLeft'), makeAnimatedStyle(leftUTurnScale)], leftUTurnGlow, leftUTurnHandlers)}

      {/* 🔄 Right U-Turn Button */}
      {renderButton('rotate-right', [getButtonStyle('bottomRight'), makeAnimatedStyle(rightUTurnScale)], rightUTurnGlow, rightUTurnHandlers)}

      {/* 🏠 Center (Stop) Button */}
      <AnimatedPressable
        style={[centerStyle, { transform: [{ scale: centerPulse.value }] }]}
        onPressIn={() => {
          if (disabled) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          centerPulse.value = withSpring(0.9, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          if (disabled) return;
          centerPulse.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        onPress={() => {
          if (disabled) return;
          onDirectionPress('stop');
        }}
        disabled={disabled}
      >
        <Animated.View
          style={[
            centerGlowStyle,
            { opacity: 0.2, shadowColor: theme.colors.primary },
          ]}
        />
        <LinearGradient
          colors={theme.gradients.accent as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.glassmorphism.background,
              borderWidth: 2,
              borderColor: theme.glassmorphism.border,
              borderRadius: theme.borderRadius.circular,
            },
          ]}
        />
        <MaterialCommunityIcons
          name="robot-vacuum"
          size={28}
          color={theme.colors.primary}
          style={{ zIndex: 2 }}
        />
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
