import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  glowEffect?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  backgroundColor?: string;
}

// Remove AnimatedCircle since we're using a simpler approach

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  showPercentage = true,
  label,
  animated = true,
  glowEffect = true,
  style,
  textStyle,
  color,
  backgroundColor
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const animatedProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(glowEffect ? 0.3 : 0);

  React.useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration: 1000,
        easing: Easing.out(Easing.cubic)
      });
      
      if (glowEffect) {
        glowOpacity.value = withTiming(progress > 0 ? 0.4 : 0, { duration: 300 });
      }
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated, glowEffect]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animated styles
  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // For SVG animations, we'll use a simpler approach without useAnimatedStyle
  const [currentProgress, setCurrentProgress] = React.useState(0);

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentProgress(progress);
    }
  }, [progress, animated]);

  const getProgressColor = () => {
    if (color) return color;
    
    // Color based on progress level
    if (progress >= 60) return theme.colors.success;
    if (progress >= 30) return theme.colors.warning;
    return theme.colors.error;
  };

  const getBackgroundColor = () => {
    return backgroundColor || theme.colors.border;
  };

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <View style={{ position: 'relative' }}>
        {/* Glow effect */}
        {glowEffect && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -strokeWidth,
                left: -strokeWidth,
                right: -strokeWidth,
                bottom: -strokeWidth,
                borderRadius: (size + strokeWidth * 2) / 2,
                ...theme.shadows.glow,
                shadowColor: getProgressColor(),
              },
              animatedGlowStyle,
            ]}
          />
        )}
        
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Defs>
            <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={getProgressColor()} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.colors.accent} stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={getBackgroundColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (currentProgress / 100) * circumference}
            strokeLinecap="round"
          />
        </Svg>
        
        {/* Center Content */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showPercentage && (
            <Text
              style={[
                {
                  fontSize: size * 0.2,
                  fontWeight: '700',
                  color: theme.colors.text,
                  textAlign: 'center',
                },
                textStyle,
              ]}
            >
              {Math.round(currentProgress)}%
            </Text>
          )}
          
          {label && (
            <Text
              style={[
                {
                  fontSize: size * 0.12,
                  fontWeight: '500',
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 2,
                },
                textStyle,
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};