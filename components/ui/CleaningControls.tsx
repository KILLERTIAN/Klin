import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { Card } from './Card';
import { CircularProgress } from './CircularProgress';
import { Slider } from './Slider';

interface CleaningControlsProps {
  intensity: 'low' | 'medium' | 'high';
  onIntensityChange: (intensity: 'low' | 'medium' | 'high') => void;
  isActive: boolean;
  isPaused: boolean;
  onStartPause: () => void;
  onReturnToDock: () => void;
  progress: number;
  estimatedTime: number; // minutes
  currentRoom: string;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CleaningControls: React.FC<CleaningControlsProps> = ({
  intensity,
  onIntensityChange,
  isActive,
  isPaused,
  onStartPause,
  onReturnToDock,
  progress,
  estimatedTime,
  currentRoom,
  disabled = false
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const buttonScale = useSharedValue(1);
  const progressAnimation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const statusCardOpacity = useSharedValue(0);

  // Animate progress
  useEffect(() => {
    progressAnimation.value = withTiming(progress / 100, { duration: 500 });
  }, [progress]);

  // Animate status visibility
  useEffect(() => {
    if (isActive) {
      statusCardOpacity.value = withTiming(1, { duration: 300 });
      glowOpacity.value = withTiming(0.6, { duration: 300 });
    } else {
      statusCardOpacity.value = withTiming(0, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  const intensityToValue = (intensity: 'low' | 'medium' | 'high'): number => {
    switch (intensity) {
      case 'low': return 0.33;
      case 'medium': return 0.66;
      case 'high': return 1;
    }
  };

  const valueToIntensity = (value: number): 'low' | 'medium' | 'high' => {
    if (value <= 0.33) return 'low';
    if (value <= 0.66) return 'medium';
    return 'high';
  };

  const handleIntensityChange = (value: number) => {
    const newIntensity = valueToIntensity(value);
    if (newIntensity !== intensity) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIntensityChange(newIntensity);
    }
  };

  const handleStartPause = () => {
    buttonScale.value = withSpring(0.95, { damping: 15 }, () => {
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartPause();
  };

  const handleReturnToDock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onReturnToDock();
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedStatusStyle = useAnimatedStyle(() => ({
    opacity: statusCardOpacity.value,
    transform: [
      {
        translateY: interpolate(
          statusCardOpacity.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP
        )
      }
    ]
  }));

  const getButtonIcon = () => {
    if (isActive && !isPaused) return 'pause';
    if (isActive && isPaused) return 'play';
    return 'play';
  };

  const getButtonText = () => {
    if (isActive && !isPaused) return 'Pause Cleaning';
    if (isActive && isPaused) return 'Resume Cleaning';
    return 'Start Cleaning';
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Cleaning Intensity Slider */}
      <Card glassmorphism>
        <Text style={[
          theme.typography.h3,
          { color: theme.colors.text, marginBottom: 16 }
        ]}>
          Cleaning Intensity
        </Text>
        
        <Slider
          value={intensityToValue(intensity)}
          onValueChange={handleIntensityChange}
          minimumValue={0}
          maximumValue={1}
          step={0.33}
          disabled={disabled || isActive}
          glowEffect
          valueLabels={['Low', 'Medium', 'High']}
        />
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 12
        }}>
          {['Low', 'Medium', 'High'].map((label, index) => {
            const isSelected = (
              (intensity === 'low' && index === 0) ||
              (intensity === 'medium' && index === 1) ||
              (intensity === 'high' && index === 2)
            );
            
            return (
              <Text
                key={label}
                style={[
                  theme.typography.caption,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: isSelected ? '600' : '400'
                  }
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>
      </Card>    
  {/* Main Control Button */}
      <View style={{ position: 'relative' }}>
        {/* Glow Effect */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: theme.borderRadius.large + 8,
              backgroundColor: theme.colors.primary,
              ...theme.shadows.glow,
            },
            animatedGlowStyle,
          ]}
        />
        
        <AnimatedTouchable
          style={[
            {
              height: 64,
              borderRadius: theme.borderRadius.large,
              overflow: 'hidden',
              opacity: disabled ? 0.5 : 1,
            },
            animatedButtonStyle,
          ]}
          onPress={handleStartPause}
          disabled={disabled}
        >
          <LinearGradient
            colors={theme.gradients.primary as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
          >
            <MaterialCommunityIcons
              name={getButtonIcon() as any}
              size={24}
              color="#FFFFFF"
              style={{ marginRight: 12 }}
            />
            <Text style={[
              theme.typography.body,
              { color: '#FFFFFF', fontWeight: '600', fontSize: 18 }
            ]}>
              {getButtonText()}
            </Text>
          </LinearGradient>
        </AnimatedTouchable>
      </View>

      {/* Return to Dock Button */}
      <TouchableOpacity
        style={{
          height: 48,
          backgroundColor: theme.glassmorphism.background,
          borderRadius: theme.borderRadius.medium,
          borderWidth: 1,
          borderColor: theme.glassmorphism.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || !isActive ? 0.5 : 1,
        }}
        onPress={handleReturnToDock}
        disabled={disabled || !isActive}
      >
        <MaterialCommunityIcons
          name="home-variant"
          size={20}
          color={theme.colors.text}
          style={{ marginRight: 8 }}
        />
        <Text style={[
          theme.typography.body,
          { color: theme.colors.text, fontWeight: '500' }
        ]}>
          Return to Dock
        </Text>
      </TouchableOpacity>

      {/* Status Cards */}
      <Animated.View style={[{ gap: 12 }, animatedStatusStyle]}>
        {/* Progress Card */}
        <Card glassmorphism>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[
                theme.typography.h3,
                { color: theme.colors.text, marginBottom: 4 }
              ]}>
                Cleaning Progress
              </Text>
              <Text style={[
                theme.typography.body,
                { color: theme.colors.textSecondary }
              ]}>
                {currentRoom || 'Preparing...'}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <CircularProgress
                progress={progress}
                size={60}
                strokeWidth={6}
                color={theme.colors.primary}
                backgroundColor={theme.colors.border}
              />
              <Text style={[
                theme.typography.caption,
                { color: theme.colors.text, marginTop: 4, fontWeight: '600' }
              ]}>
                {Math.round(progress)}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Time Estimate Card */}
        <Card glassmorphism>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View>
              <Text style={[
                theme.typography.h3,
                { color: theme.colors.text, marginBottom: 4 }
              ]}>
                Time Remaining
              </Text>
              <Text style={[
                theme.typography.body,
                { color: theme.colors.textSecondary }
              ]}>
                Estimated completion
              </Text>
            </View>
            
            <View style={{
              backgroundColor: theme.colors.primary + '20',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: theme.borderRadius.medium,
              borderWidth: 1,
              borderColor: theme.colors.primary + '40'
            }}>
              <Text style={[
                theme.typography.body,
                { color: theme.colors.primary, fontWeight: '600', fontSize: 16 }
              ]}>
                {formatTime(estimatedTime)}
              </Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    </View>
  );
};