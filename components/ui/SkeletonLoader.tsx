import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmerColors?: string[];
  duration?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  shimmerColors,
  duration = 1500,
}) => {
  const { theme } = useTheme();
  const shimmerTranslateX = useSharedValue(-1);

  const defaultShimmerColors = shimmerColors || [
    theme.colors.surface,
    theme.colors.background,
    theme.colors.surface,
  ];

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [shimmerTranslateX, duration]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerTranslateX.value,
      [-1, 1],
      [-100, 100]
    );

    return {
      transform: [{ translateX: `${translateX}%` }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: typeof width === 'string' ? width : width,
          height: height,
          borderRadius,
          backgroundColor: theme.colors.surface,
        } as ViewStyle,
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={defaultShimmerColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.glassmorphism.background,
          borderColor: theme.glassmorphism.border,
        },
        style,
      ]}
    >
      <View style={styles.cardHeader}>
        <SkeletonLoader width={120} height={24} />
        <SkeletonLoader width={60} height={20} />
      </View>
      
      <View style={styles.cardContent}>
        <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={16} />
      </View>
    </View>
  );
};

interface SkeletonListProps {
  itemCount?: number;
  itemHeight?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  itemCount = 5,
  itemHeight = 80,
  style,
}) => {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonCard
          key={index}
          style={{
            ...styles.listItem,
            height: itemHeight, 
            marginBottom: index < itemCount - 1 ? 12 : 0
          }}
        />
      ))}
    </View>
  );
};

interface SkeletonStatusCardProps {
  style?: ViewStyle;
}

export const SkeletonStatusCard: React.FC<SkeletonStatusCardProps> = ({ style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.statusCard,
        {
          backgroundColor: theme.glassmorphism.background,
          borderColor: theme.glassmorphism.border,
        },
        style,
      ]}
    >
      <View style={styles.statusHeader}>
        <View style={styles.statusTitleContainer}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width={100} height={20} />
        </View>
        <SkeletonLoader width={80} height={24} borderRadius={12} />
      </View>

      <View style={styles.statusContent}>
        <View style={styles.batteryContainer}>
          <SkeletonLoader width={60} height={60} borderRadius={30} />
          <View style={styles.batteryInfo}>
            <SkeletonLoader width={40} height={22} />
            <SkeletonLoader width={50} height={12} style={{ marginTop: 4 }} />
          </View>
        </View>

        <View style={styles.statusInfo}>
          <SkeletonLoader width={80} height={20} />
          <SkeletonLoader width={120} height={14} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
};

interface SkeletonMapProps {
  style?: ViewStyle;
}

export const SkeletonMap: React.FC<SkeletonMapProps> = ({ style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.mapContainer,
        {
          backgroundColor: theme.glassmorphism.background,
          borderColor: theme.glassmorphism.border,
        },
        style,
      ]}
    >
      <SkeletonLoader width="100%" height={200} borderRadius={16} />
      
      {/* Overlay elements to simulate map features */}
      <View style={styles.mapOverlay}>
        <SkeletonLoader width={80} height={80} borderRadius={8} style={styles.mapRoom} />
        <SkeletonLoader width={60} height={60} borderRadius={8} style={styles.mapRoom2} />
        <SkeletonLoader width={100} height={40} borderRadius={8} style={styles.mapRoom3} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listItem: {
    borderRadius: 16,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  batteryInfo: {
    alignItems: 'flex-start',
  },
  statusInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  mapContainer: {
    height: 300,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  mapRoom: {
    position: 'absolute',
    top: 30,
    left: 30,
  },
  mapRoom2: {
    position: 'absolute',
    top: 50,
    right: 40,
  },
  mapRoom3: {
    position: 'absolute',
    bottom: 40,
    left: 50,
  },
});