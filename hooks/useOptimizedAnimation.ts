import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { animationConfig, hapticConfig } from '../utils/performance';

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  useNativeDriver?: boolean;
  hapticFeedback?: keyof typeof hapticConfig;
  onComplete?: () => void;
}

export interface SpringOptions {
  damping?: number;
  stiffness?: number;
  mass?: number;
  velocity?: number;
  hapticFeedback?: keyof typeof hapticConfig;
  onComplete?: () => void;
}

/**
 * Optimized animation hook using Reanimated 3 with native driver
 */
export const useOptimizedAnimation = () => {
  // Fade animation
  const useFadeAnimation = (
    initialValue = 0,
    options: AnimationOptions = {}
  ) => {
    const opacity = useSharedValue(initialValue);
    
    const fadeIn = (toValue = 1) => {
      if (options.hapticFeedback) {
        runOnJS(Haptics.impactAsync)(
          Haptics.ImpactFeedbackStyle.Medium
        );
      }
      
      opacity.value = withTiming(
        toValue,
        {
          duration: options.duration || animationConfig.timing.duration,
        },
        (finished) => {
          if (finished && options.onComplete) {
            runOnJS(options.onComplete)();
          }
        }
      );
    };
    
    const fadeOut = (toValue = 0) => {
      opacity.value = withTiming(toValue, {
        duration: options.duration || animationConfig.timing.duration,
      });
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));
    
    return { fadeIn, fadeOut, animatedStyle, opacity };
  };

  // Scale animation with spring physics
  const useScaleAnimation = (
    initialValue = 1,
    options: SpringOptions = {}
  ) => {
    const scale = useSharedValue(initialValue);
    
    const scaleIn = (toValue = 1) => {
      if (options.hapticFeedback) {
        runOnJS(Haptics.impactAsync)(
          Haptics.ImpactFeedbackStyle.Medium
        );
      }
      
      scale.value = withSpring(
        toValue,
        {
          damping: options.damping || animationConfig.spring.damping,
          stiffness: options.stiffness || animationConfig.spring.stiffness,
          mass: options.mass || animationConfig.spring.mass,
          velocity: options.velocity || 0,
        },
        (finished) => {
          if (finished && options.onComplete) {
            runOnJS(options.onComplete)();
          }
        }
      );
    };
    
    const scaleOut = (toValue = 0.95) => {
      scale.value = withSpring(toValue, animationConfig.spring);
    };
    
    const pulse = () => {
      scale.value = withSequence(
        withSpring(1.05, { duration: 100 }),
        withSpring(1, { duration: 100 })
      );
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    
    return { scaleIn, scaleOut, pulse, animatedStyle, scale };
  };

  // Slide animation
  const useSlideAnimation = (
    initialValue = 0,
    direction: 'horizontal' | 'vertical' = 'vertical',
    options: AnimationOptions = {}
  ) => {
    const translateValue = useSharedValue(initialValue);
    
    const slideIn = (toValue = 0) => {
      if (options.hapticFeedback) {
        runOnJS(Haptics.impactAsync)(
          Haptics.ImpactFeedbackStyle.Medium
        );
      }
      
      translateValue.value = withSpring(
        toValue,
        animationConfig.spring,
        (finished) => {
          if (finished && options.onComplete) {
            runOnJS(options.onComplete)();
          }
        }
      );
    };
    
    const slideOut = (toValue = direction === 'vertical' ? -50 : -50) => {
      translateValue.value = withSpring(toValue, animationConfig.spring);
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        direction === 'vertical'
          ? { translateY: translateValue.value }
          : { translateX: translateValue.value },
      ],
    }));
    
    return { slideIn, slideOut, animatedStyle, translateValue };
  };

  // Rotation animation
  const useRotationAnimation = (
    initialValue = 0,
    options: AnimationOptions = {}
  ) => {
    const rotation = useSharedValue(initialValue);
    
    const rotate = (toValue: number) => {
      rotation.value = withTiming(
        toValue,
        {
          duration: options.duration || animationConfig.timing.duration,
        },
        (finished) => {
          if (finished && options.onComplete) {
            runOnJS(options.onComplete)();
          }
        }
      );
    };
    
    const spin = () => {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));
    
    return { rotate, spin, animatedStyle, rotation };
  };

  // Shimmer animation for loading states
  const useShimmerAnimation = () => {
    const shimmerTranslateX = useSharedValue(-1);
    
    useEffect(() => {
      shimmerTranslateX.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    }, [shimmerTranslateX]);
    
    const animatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmerTranslateX.value,
        [-1, 1],
        [-100, 100],
        Extrapolate.CLAMP
      );
      
      return {
        transform: [{ translateX: `${translateX}%` }],
      };
    });
    
    return { animatedStyle };
  };

  // Glow animation for premium effects
  const useGlowAnimation = (
    initialValue = 0.3,
    options: AnimationOptions = {}
  ) => {
    const glowOpacity = useSharedValue(initialValue);
    
    const startGlow = () => {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    };
    
    const stopGlow = () => {
      glowOpacity.value = withTiming(initialValue, { duration: 300 });
    };
    
    const pulseGlow = () => {
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(initialValue, { duration: 150 })
      );
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      shadowOpacity: glowOpacity.value,
    }));
    
    return { startGlow, stopGlow, pulseGlow, animatedStyle, glowOpacity };
  };

  // Breathing animation for status indicators
  const useBreathingAnimation = (
    initialValue = 1,
    options: AnimationOptions = {}
  ) => {
    const breathingScale = useSharedValue(initialValue);
    
    useEffect(() => {
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }, [breathingScale]);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: breathingScale.value }],
    }));
    
    return { animatedStyle };
  };

  // Progress animation
  const useProgressAnimation = (
    initialValue = 0,
    options: AnimationOptions = {}
  ) => {
    const progress = useSharedValue(initialValue);
    
    const animateToProgress = (toValue: number) => {
      progress.value = withTiming(
        toValue,
        {
          duration: options.duration || 800,
        },
        (finished) => {
          if (finished && options.onComplete) {
            runOnJS(options.onComplete)();
          }
        }
      );
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      width: `${progress.value}%`,
    }));
    
    return { animateToProgress, animatedStyle, progress };
  };

  return {
    useFadeAnimation,
    useScaleAnimation,
    useSlideAnimation,
    useRotationAnimation,
    useShimmerAnimation,
    useGlowAnimation,
    useBreathingAnimation,
    useProgressAnimation,
  };
};

/**
 * Legacy Animated API hook for components that need it
 */
export const useLegacyAnimation = () => {
  const createAnimatedValue = (initialValue = 0) => {
    return useRef(new Animated.Value(initialValue)).current;
  };
  
  const createTimingAnimation = (
    animatedValue: Animated.Value,
    toValue: number,
    options: AnimationOptions = {}
  ) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration: options.duration || animationConfig.timing.duration,
      useNativeDriver: options.useNativeDriver ?? true,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };
  
  const createSpringAnimation = (
    animatedValue: Animated.Value,
    toValue: number,
    options: SpringOptions = {}
  ) => {
    return Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      tension: options.stiffness || 300,
      friction: options.damping || 15,
    });
  };
  
  return {
    createAnimatedValue,
    createTimingAnimation,
    createSpringAnimation,
    Animated,
  };
};