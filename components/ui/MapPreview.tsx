import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface MapPreviewProps {
  robotPosition?: { x: number; y: number };
  size?: number;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  robotPosition = { x: 50, y: 50 },
  size = 120
}) => {
  const { theme } = useTheme();
  
  // Animation for robot position indicator
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const animatedRobotStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.2]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.8, 1]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const robotX = (robotPosition.x / 100) * (size - 20) + 10;
  const robotY = (robotPosition.y / 100) * (size - 20) + 10;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Map Background */}
      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.surface]}
        style={[
          styles.mapBackground,
          {
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.medium,
          }
        ]}
      >
        {/* Grid Pattern */}
        <View style={styles.gridContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.gridLine,
                styles.horizontalLine,
                {
                  backgroundColor: theme.colors.border,
                  top: (i + 1) * (size / 6),
                }
              ]}
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.gridLine,
                styles.verticalLine,
                {
                  backgroundColor: theme.colors.border,
                  left: (i + 1) * (size / 6),
                }
              ]}
            />
          ))}
        </View>

        {/* Room Outlines */}
        <View
          style={[
            styles.room,
            {
              top: size * 0.2,
              left: size * 0.15,
              width: size * 0.3,
              height: size * 0.25,
              borderColor: theme.colors.textSecondary,
            }
          ]}
        />
        <View
          style={[
            styles.room,
            {
              top: size * 0.2,
              right: size * 0.15,
              width: size * 0.35,
              height: size * 0.4,
              borderColor: theme.colors.textSecondary,
            }
          ]}
        />
        <View
          style={[
            styles.room,
            {
              bottom: size * 0.15,
              left: size * 0.15,
              width: size * 0.7,
              height: size * 0.2,
              borderColor: theme.colors.textSecondary,
            }
          ]}
        />

        {/* Robot Position */}
        <Animated.View
          style={[
            styles.robotPosition,
            {
              left: robotX - 6,
              top: robotY - 6,
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
            animatedRobotStyle,
          ]}
        >
          <MaterialCommunityIcons
            name="robot-vacuum"
            size={8}
            color="#FFFFFF"
          />
        </Animated.View>

        {/* Robot Trail */}
        <View
          style={[
            styles.robotTrail,
            {
              left: robotX - 20,
              top: robotY + 5,
              backgroundColor: theme.colors.primary + '40',
            }
          ]}
        />
        <View
          style={[
            styles.robotTrail,
            {
              left: robotX - 35,
              top: robotY + 8,
              backgroundColor: theme.colors.primary + '20',
            }
          ]}
        />
      </LinearGradient>

      {/* Map Label */}
      <View style={styles.labelContainer}>
        <MaterialCommunityIcons
          name="map-marker"
          size={12}
          color={theme.colors.textSecondary}
        />
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Live Position
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mapBackground: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    opacity: 0.3,
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 0.5,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 0.5,
  },
  room: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 4,
    opacity: 0.6,
  },
  robotPosition: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  robotTrail: {
    position: 'absolute',
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});