import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  glowEffect?: boolean;
  hapticFeedback?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueLabels?: string[];
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  label,
  showValue = true,
  disabled = false,
  glowEffect = true,
  hapticFeedback = true,
  style,
  labelStyle,
  valueLabels = ['Low', 'Medium', 'High']
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const glowOpacity = useSharedValue(glowEffect ? 0.3 : 0);
  const thumbScale = useSharedValue(1);

  const handleValueChange = (newValue: number) => {
    if (disabled) return;
    
    if (hapticFeedback) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onValueChange(newValue);
  };

  const handlePressIn = () => {
    if (disabled) return;
    thumbScale.value = withSpring(1.1, { damping: 15, stiffness: 300 });
    if (glowEffect) {
      glowOpacity.value = withTiming(0.6, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    thumbScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (glowEffect) {
      glowOpacity.value = withTiming(0.3, { duration: 150 });
    }
  };

  // Animated styles
  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
  }));

  const getValueLabel = () => {
    if (!showValue) return '';
    
    if (valueLabels.length === 3) {
      const normalizedValue = (value - minimumValue) / (maximumValue - minimumValue);
      if (normalizedValue <= 0.33) return valueLabels[0];
      if (normalizedValue <= 0.66) return valueLabels[1];
      return valueLabels[2];
    }
    
    return value.toString();
  };

  const normalizedValue = (value - minimumValue) / (maximumValue - minimumValue);
  const trackWidth = 200; // Fixed width for simplicity
  const thumbPosition = normalizedValue * (trackWidth - 24);

  return (
    <View style={[{ paddingVertical: 16 }, style]}>
      {/* Label and Value */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16 
      }}>
        {label && (
          <Text style={[
            {
              fontSize: 16,
              color: theme.colors.text,
              fontWeight: '500'
            },
            labelStyle
          ]}>
            {label}
          </Text>
        )}
        
        {showValue && (
          <Text style={[
            {
              fontSize: 14,
              color: theme.colors.primary,
              fontWeight: '600'
            },
            labelStyle
          ]}>
            {getValueLabel()}
          </Text>
        )}
      </View>

      {/* Slider Track */}
      <View
        style={{
          height: 40,
          justifyContent: 'center',
          paddingHorizontal: 12,
          width: trackWidth + 24,
        }}
      >
        {/* Background Track */}
        <View
          style={{
            height: 6,
            backgroundColor: theme.colors.border,
            borderRadius: 3,
            position: 'relative',
          }}
        >
          {/* Active Track */}
          <View style={{ width: Math.max(thumbPosition + 12, 12) }}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 6,
                borderRadius: 3,
              }}
            />
          </View>
        </View>

        {/* Thumb */}
        <TouchableOpacity
          style={[
            {
              position: 'absolute',
              left: thumbPosition,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              ...theme.shadows.medium,
              opacity: disabled ? 0.5 : 1,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
        >
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
                  borderRadius: 16,
                  ...theme.shadows.glow,
                },
                animatedGlowStyle,
              ]}
            />
          )}
          
          {/* Thumb gradient */}
          <Animated.View style={[animatedThumbStyle]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Discrete Value Buttons */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingHorizontal: 12,
        width: trackWidth + 24,
      }}>
        {valueLabels.map((valueLabel, index) => {
          const buttonValue = minimumValue + (index * (maximumValue - minimumValue) / (valueLabels.length - 1));
          const isActive = Math.abs(value - buttonValue) < step;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleValueChange(buttonValue)}
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 12,
                backgroundColor: isActive ? theme.colors.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isActive ? '#FFFFFF' : theme.colors.textSecondary,
                  fontWeight: isActive ? '600' : '500',
                }}
              >
                {valueLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};