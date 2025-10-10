import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { animationConfig } from '../../utils/performance';

interface PremiumInteractionsProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  glowEffect?: boolean;
  rippleEffect?: boolean;
  scaleEffect?: boolean;
  breathingEffect?: boolean;
  magneticEffect?: boolean;
}

export const PremiumInteractions: React.FC<PremiumInteractionsProps> = ({
  children,
  style,
  onPress,
  onLongPress,
  disabled = false,
  hapticFeedback = true,
  glowEffect = false,
  rippleEffect = false,
  scaleEffect = true,
  breathingEffect = false,
  magneticEffect = false,
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(glowEffect ? 0.3 : 0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const breathingScale = useSharedValue(1);
  const magneticX = useSharedValue(0);
  const magneticY = useSharedValue(0);

  // Breathing animation effect
  useEffect(() => {
    if (breathingEffect) {
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );
    }
  }, [breathingEffect, breathingScale]);

  const handlePressIn = () => {
    if (disabled) return;

    // Haptic feedback
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scale effect
    if (scaleEffect) {
      scale.value = withSpring(0.96, animationConfig.spring);
    }

    // Glow effect
    if (glowEffect) {
      glowOpacity.value = withTiming(0.6, { duration: 150 });
    }

    // Ripple effect
    if (rippleEffect) {
      rippleScale.value = 0;
      rippleOpacity.value = 0.3;
      rippleScale.value = withTiming(1, { duration: 300 });
      rippleOpacity.value = withTiming(0, { duration: 300 });
    }
  };

  const handlePressOut = () => {
    if (disabled) return;

    // Scale effect
    if (scaleEffect) {
      scale.value = withSpring(1, animationConfig.spring);
    }

    // Glow effect
    if (glowEffect) {
      glowOpacity.value = withTiming(0.3, { duration: 150 });
    }
  };

  const handlePress = () => {
    if (disabled || !onPress) return;

    // Enhanced haptic for press
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress();
  };

  const handleLongPress = () => {
    if (disabled || !onLongPress) return;

    // Strong haptic for long press
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    onLongPress();
  };

  // Magnetic effect (subtle attraction to touch)
  const handleTouchMove = (event: any) => {
    if (!magneticEffect || disabled) return;

    const { locationX, locationY } = event.nativeEvent;
    const centerX = 50; // Assume 100px width, center at 50
    const centerY = 25; // Assume 50px height, center at 25

    const deltaX = (locationX - centerX) * 0.1; // Subtle magnetic pull
    const deltaY = (locationY - centerY) * 0.1;

    magneticX.value = withSpring(deltaX, { damping: 20, stiffness: 300 });
    magneticY.value = withSpring(deltaY, { damping: 20, stiffness: 300 });
  };

  const handleTouchEnd = () => {
    if (magneticEffect) {
      magneticX.value = withSpring(0, animationConfig.spring);
      magneticY.value = withSpring(0, animationConfig.spring);
    }
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const combinedScale = scaleEffect ? scale.value : 1;
    const breathingScaleValue = breathingEffect ? breathingScale.value : 1;
    const finalScale = combinedScale * breathingScaleValue;

    return {
      transform: [
        { scale: finalScale },
        { translateX: magneticEffect ? magneticX.value : 0 },
        { translateY: magneticEffect ? magneticY.value : 0 },
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <Animated.View style={[style, containerAnimatedStyle]}>
      {/* Glow effect */}
      {glowEffect && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.glowContainer,
            {
              shadowColor: theme.colors.primary,
              shadowRadius: 12,
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 0 },
            },
            glowAnimatedStyle,
          ]}
        />
      )}

      {/* Ripple effect */}
      {rippleEffect && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.rippleContainer,
            rippleAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.ripple,
              {
                backgroundColor: theme.colors.primary + '20',
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Main content */}
      <TouchableOpacity
        style={styles.content}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={1}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Floating Action Button with premium interactions
interface PremiumFABProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
  size?: number;
  disabled?: boolean;
}

export const PremiumFAB: React.FC<PremiumFABProps> = ({
  onPress,
  icon,
  style,
  size = 56,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Continuous subtle glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [glowOpacity]);

  const handlePressIn = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.9, animationConfig.spring);
    rotation.value = withSpring(15, animationConfig.spring);
  };

  const handlePressOut = () => {
    if (disabled) return;

    scale.value = withSpring(1, animationConfig.spring);
    rotation.value = withSpring(0, animationConfig.spring);
  };

  const handlePress = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Success animation
    scale.value = withSequence(
      withSpring(1.1, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.fabContainer, { width: size, height: size }, style]}>
      {/* Glow effect */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.fabGlow,
          {
            shadowColor: theme.colors.primary,
            shadowRadius: size * 0.3,
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 4 },
          },
          glowAnimatedStyle,
        ]}
      />

      {/* FAB button */}
      <Animated.View
        style={[
          styles.fab,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
          },
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={1}
          disabled={disabled}
        >
          <View style={styles.content}>
            {icon}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Magnetic button with attraction effect
interface MagneticButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  magneticStrength?: number;
  disabled?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onPress,
  style,
  magneticStrength = 0.15,
  disabled = false,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleTouchMove = (event: any) => {
    if (disabled) return;

    const { locationX, locationY, target } = event.nativeEvent;
    const { width, height } = target;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    const deltaX = (locationX - centerX) * magneticStrength;
    const deltaY = (locationY - centerY) * magneticStrength;

    translateX.value = withSpring(deltaX, { damping: 25, stiffness: 400 });
    translateY.value = withSpring(deltaY, { damping: 25, stiffness: 400 });
    scale.value = withSpring(1.02, { damping: 20, stiffness: 300 });
  };

  const handleTouchEnd = () => {
    translateX.value = withSpring(0, animationConfig.spring);
    translateY.value = withSpring(0, animationConfig.spring);
    scale.value = withSpring(1, animationConfig.spring);
  };

  const handlePress = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Magnetic snap back effect
    translateX.value = withSequence(
      withSpring(0, { damping: 10, stiffness: 500 }),
      withSpring(0, animationConfig.spring)
    );
    translateY.value = withSequence(
      withSpring(0, { damping: 10, stiffness: 500 }),
      withSpring(0, animationConfig.spring)
    );

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={[style, animatedStyle]}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  glowContainer: {
    borderRadius: 12,
  },
  rippleContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  fabContainer: {
    position: 'relative',
  },
  fabGlow: {
    borderRadius: 28,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});