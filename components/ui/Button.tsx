import { animationConfig } from '@/utils';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  glowEffect?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  hapticFeedback = true,
  glowEffect = false,
  accessibilityLabel,
  accessibilityHint
}) => {
  const { theme } = useTheme();
  const { isReduceMotionEnabled } = useAccessibility();
  
  // Animation values
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(glowEffect ? 0.3 : 0);

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(0.95, animationConfig.spring);
    rippleScale.value = 0;
    rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(1, animationConfig.microInteraction);
    rippleOpacity.value = withTiming(0, animationConfig.microInteraction);
    
    if (glowEffect) {
      glowOpacity.value = withTiming(0.6, animationConfig.microInteraction);
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(1, animationConfig.spring);
    
    if (glowEffect) {
      glowOpacity.value = withTiming(0.3, animationConfig.microInteraction);
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Success animation feedback
    scale.value = withSequence(
      withSpring(1.02, { duration: 100 }),
      withSpring(1, animationConfig.spring)
    );
    
    onPress();
  };

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
      position: 'relative'
    };

    // Size styles
    let sizeStyle: ViewStyle = { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 };
    if (size === 'small') {
      sizeStyle = { paddingHorizontal: 12, paddingVertical: 8, minHeight: 32 };
    } else if (size === 'large') {
      sizeStyle = { paddingHorizontal: 24, paddingVertical: 16, minHeight: 52 };
    }

    // Variant styles
    let variantStyle: ViewStyle = {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.shadows.small.shadowColor,
      shadowOffset: theme.shadows.small.shadowOffset,
      shadowOpacity: theme.shadows.small.shadowOpacity,
      shadowRadius: theme.shadows.small.shadowRadius,
      elevation: theme.shadows.small.elevation
    };

    if (variant === 'secondary') {
      variantStyle = {
        backgroundColor: theme.colors.secondary,
        shadowColor: theme.shadows.small.shadowColor,
        shadowOffset: theme.shadows.small.shadowOffset,
        shadowOpacity: theme.shadows.small.shadowOpacity,
        shadowRadius: theme.shadows.small.shadowRadius,
        elevation: theme.shadows.small.elevation
      };
    } else if (variant === 'outline') {
      variantStyle = {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border
      };
    } else if (variant === 'ghost') {
      variantStyle = {
        backgroundColor: 'transparent'
      };
    } else if (variant === 'gradient') {
      variantStyle = {
        backgroundColor: 'transparent',
        shadowColor: theme.shadows.medium.shadowColor,
        shadowOffset: theme.shadows.medium.shadowOffset,
        shadowOpacity: theme.shadows.medium.shadowOpacity,
        shadowRadius: theme.shadows.medium.shadowRadius,
        elevation: theme.shadows.medium.elevation
      };
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      opacity: disabled ? 0.5 : 1
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      zIndex: 2
    };

    // Size styles
    let sizeStyle: TextStyle = { fontSize: 16 };
    if (size === 'small') {
      sizeStyle = { fontSize: 14 };
    } else if (size === 'large') {
      sizeStyle = { fontSize: 18 };
    }

    // Variant styles
    let variantStyle: TextStyle = { color: '#FFFFFF' };
    if (variant === 'secondary') {
      variantStyle = { color: theme.colors.text };
    } else if (variant === 'outline' || variant === 'ghost') {
      variantStyle = { color: theme.colors.primary };
    } else if (variant === 'gradient') {
      variantStyle = { color: '#FFFFFF' };
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle
    };
  };

  const renderButtonContent = () => (
    <>
      {/* Ripple effect */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: theme.borderRadius.medium,
          },
          animatedRippleStyle,
        ]}
      />
      
      {/* Content */}
      <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 2 }}>
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || variant === 'gradient' ? '#FFFFFF' : theme.colors.primary}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={[getTextStyle(), textStyle]}>
          {title}
        </Text>
      </View>
    </>
  );

  if (variant === 'gradient') {
    return (
      <View style={style}>
        {/* Glow effect */}
        {glowEffect && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: theme.borderRadius.medium + 4,
                ...theme.shadows.glow,
              },
              animatedGlowStyle,
            ]}
          />
        )}
        
        <AnimatedTouchable
          style={[getButtonStyle(), animatedButtonStyle]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled || loading}
          activeOpacity={1}
        >
          <LinearGradient
            colors={theme.gradients.primary as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: theme.borderRadius.medium,
            }}
          />
          {renderButtonContent()}
        </AnimatedTouchable>
      </View>
    );
  }

  return (
    <View style={style}>
      {/* Glow effect */}
      {glowEffect && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              borderRadius: theme.borderRadius.medium + 4,
              ...theme.shadows.glow,
            },
            animatedGlowStyle,
          ]}
        />
      )}
      
      <AnimatedTouchable
        style={[getButtonStyle(), animatedButtonStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {renderButtonContent()}
      </AnimatedTouchable>
    </View>
  );
};