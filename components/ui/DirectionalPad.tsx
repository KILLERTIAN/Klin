import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface DirectionalPadProps {
  onDirectionPress: (direction: 'forward' | 'backward' | 'left' | 'right') => void;
  disabled?: boolean;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DirectionalPad: React.FC<DirectionalPadProps> = ({
  onDirectionPress,
  disabled = false,
  size = 200
}) => {
  const { theme } = useTheme();

  // Animation values for each button
  const forwardScale = useSharedValue(1);
  const backwardScale = useSharedValue(1);
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);

  // Glow animation values
  const forwardGlow = useSharedValue(0);
  const backwardGlow = useSharedValue(0);
  const leftGlow = useSharedValue(0);
  const rightGlow = useSharedValue(0);

  // Pulse animation for the center
  const centerPulse = useSharedValue(1);

  React.useEffect(() => {
    // Subtle breathing animation for the center
    const animate = () => {
      centerPulse.value = withSpring(1.05, { damping: 15, stiffness: 100 }, () => {
        centerPulse.value = withSpring(1, { damping: 15, stiffness: 100 });
      });
    };
    
    const interval = setInterval(animate, 3000);
    return () => clearInterval(interval);
  }, []);

  const createButtonHandlers = (
    direction: 'forward' | 'backward' | 'left' | 'right',
    scaleValue: any,
    glowValue: any
  ) => ({
    onPressIn: () => {
      if (disabled) return;
      
      scaleValue.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      glowValue.value = withTiming(1, { duration: 150 });
      
      // Haptic feedback with varying intensity based on direction
      const intensity = direction === 'forward' ? Haptics.ImpactFeedbackStyle.Medium :
                      direction === 'backward' ? Haptics.ImpactFeedbackStyle.Light :
                      Haptics.ImpactFeedbackStyle.Heavy;
      
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
    }
  });

  // Button handlers
  const forwardHandlers = createButtonHandlers('forward', forwardScale, forwardGlow);
  const backwardHandlers = createButtonHandlers('backward', backwardScale, backwardGlow);
  const leftHandlers = createButtonHandlers('left', leftScale, leftGlow);
  const rightHandlers = createButtonHandlers('right', rightScale, rightGlow);

  // Animated styles
  const forwardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: forwardScale.value }],
  }));

  const backwardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backwardScale.value }],
  }));

  const leftAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
  }));

  const centerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerPulse.value }],
  }));

  // Glow styles
  const forwardGlowStyle = useAnimatedStyle(() => ({
    opacity: forwardGlow.value * 0.8,
  }));

  const backwardGlowStyle = useAnimatedStyle(() => ({
    opacity: backwardGlow.value * 0.8,
  }));

  const leftGlowStyle = useAnimatedStyle(() => ({
    opacity: leftGlow.value * 0.8,
  }));

  const rightGlowStyle = useAnimatedStyle(() => ({
    opacity: rightGlow.value * 0.8,
  }));

  const buttonSize = size * 0.25;
  const centerSize = size * 0.3;

  const getButtonStyle = (position: 'top' | 'bottom' | 'left' | 'right') => {
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
        return {
          ...baseStyle,
          top: 0,
          left: (size - buttonSize) / 2,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 0,
          left: (size - buttonSize) / 2,
        };
      case 'left':
        return {
          ...baseStyle,
          left: 0,
          top: (size - buttonSize) / 2,
        };
      case 'right':
        return {
          ...baseStyle,
          right: 0,
          top: (size - buttonSize) / 2,
        };
    }
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

  const glowStyle = {
    position: 'absolute' as const,
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: theme.borderRadius.medium + 4,
    ...theme.shadows.glow,
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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Forward Button */}
      <AnimatedPressable
        style={[getButtonStyle('top'), forwardAnimatedStyle]}
        {...forwardHandlers}
        disabled={disabled}
      >
        {/* Glow Effect */}
        <Animated.View style={[glowStyle, forwardGlowStyle]} />
        
        {/* Button Background */}
        <LinearGradient
          colors={theme.gradients.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Glassmorphism Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.glassmorphism.background,
              borderWidth: 1,
              borderColor: theme.glassmorphism.border,
              borderRadius: theme.borderRadius.medium,
            }
          ]}
        />
        
        <MaterialCommunityIcons
          name="chevron-up"
          size={24}
          color="#FFFFFF"
          style={{ zIndex: 2 }}
        />
      </AnimatedPressable>

      {/* Backward Button */}
      <AnimatedPressable
        style={[getButtonStyle('bottom'), backwardAnimatedStyle]}
        {...backwardHandlers}
        disabled={disabled}
      >
        {/* Glow Effect */}
        <Animated.View style={[glowStyle, backwardGlowStyle]} />
        
        {/* Button Background */}
        <LinearGradient
          colors={theme.gradients.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Glassmorphism Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.glassmorphism.background,
              borderWidth: 1,
              borderColor: theme.glassmorphism.border,
              borderRadius: theme.borderRadius.medium,
            }
          ]}
        />
        
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color="#FFFFFF"
          style={{ zIndex: 2 }}
        />
      </AnimatedPressable>

      {/* Left Button */}
      <AnimatedPressable
        style={[getButtonStyle('left'), leftAnimatedStyle]}
        {...leftHandlers}
        disabled={disabled}
      >
        {/* Glow Effect */}
        <Animated.View style={[glowStyle, leftGlowStyle]} />
        
        {/* Button Background */}
        <LinearGradient
          colors={theme.gradients.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Glassmorphism Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.glassmorphism.background,
              borderWidth: 1,
              borderColor: theme.glassmorphism.border,
              borderRadius: theme.borderRadius.medium,
            }
          ]}
        />
        
        <MaterialCommunityIcons
          name="chevron-left"
          size={24}
          color="#FFFFFF"
          style={{ zIndex: 2 }}
        />
      </AnimatedPressable>

      {/* Right Button */}
      <AnimatedPressable
        style={[getButtonStyle('right'), rightAnimatedStyle]}
        {...rightHandlers}
        disabled={disabled}
      >
        {/* Glow Effect */}
        <Animated.View style={[glowStyle, rightGlowStyle]} />
        
        {/* Button Background */}
        <LinearGradient
          colors={theme.gradients.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Glassmorphism Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.glassmorphism.background,
              borderWidth: 1,
              borderColor: theme.glassmorphism.border,
              borderRadius: theme.borderRadius.medium,
            }
          ]}
        />
        
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#FFFFFF"
          style={{ zIndex: 2 }}
        />
      </AnimatedPressable>

      {/* Center Circle */}
      <AnimatedPressable style={[centerStyle, centerAnimatedStyle]} disabled>
        {/* Center Glow Effect */}
        <Animated.View
          style={[
            centerGlowStyle,
            {
              opacity: 0.2,
              shadowColor: theme.colors.primary,
            }
          ]}
        />
        
        {/* Center Background */}
        <LinearGradient
          colors={theme.gradients.accent as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Center Glassmorphism Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.glassmorphism.background,
              borderWidth: 2,
              borderColor: theme.glassmorphism.border,
              borderRadius: theme.borderRadius.circular,
            }
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