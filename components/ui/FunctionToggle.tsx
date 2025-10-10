import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface FunctionToggleProps {
  title: string;
  icon: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FunctionToggle: React.FC<FunctionToggleProps> = ({
  title,
  icon,
  enabled,
  onToggle,
  disabled = false
}) => {
  const { theme } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(enabled ? 0.6 : 0);
  const toggleProgress = useSharedValue(enabled ? 1 : 0);

  React.useEffect(() => {
    toggleProgress.value = withSpring(enabled ? 1 : 0, { damping: 15, stiffness: 200 });
    glowOpacity.value = withTiming(enabled ? 0.6 : 0, { duration: 300 });
  }, [enabled]);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled) return;
    
    Haptics.impactAsync(enabled ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    onToggle(!enabled);
  };

  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedToggleStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      toggleProgress.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary]
    );

    return {
      backgroundColor,
    };
  });

  const animatedKnobStyle = useAnimatedStyle(() => {
    const translateX = toggleProgress.value * 24;
    
    return {
      transform: [{ translateX }],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    const iconColor = interpolateColor(
      toggleProgress.value,
      [0, 1],
      [theme.colors.textSecondary, theme.colors.primary]
    );

    return {
      color: iconColor,
    };
  });

  return (
    <AnimatedPressable
      style={[styles.container, animatedCardStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            ...theme.shadows.glow,
            shadowColor: theme.colors.primary,
          },
          animatedGlowStyle,
        ]}
      />

      {/* Card Background */}
      <LinearGradient
        colors={theme.gradients.surface as [string, string, ...string[]]}
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
            borderRadius: theme.borderRadius.large,
          }
        ]}
      />

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Animated.View style={animatedIconStyle as any}>
            <MaterialCommunityIcons
              name={icon as any}
              size={28}
              color={enabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <Animated.View
            style={[
              styles.toggleTrack,
              {
                borderColor: theme.colors.border,
              },
              animatedToggleStyle,
            ]}
          >
            <Animated.View
              style={[
                styles.toggleKnob,
                {
                  backgroundColor: '#FFFFFF',
                  shadowColor: theme.colors.text,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                },
                animatedKnobStyle,
              ]}
            />
          </Animated.View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: enabled ? theme.colors.success : theme.colors.textSecondary,
              }
            ]}
          />
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            {enabled ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    zIndex: 2,
  },
  iconContainer: {
    marginBottom: 12,
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    marginBottom: 12,
  },
  toggleTrack: {
    width: 48,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});