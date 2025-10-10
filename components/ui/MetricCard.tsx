import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  trendValue,
  delay = 0,
  style
}: MetricCardProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const cardColor = color || theme.colors.primary;

  useEffect(() => {
    // Entrance animation with delay
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate counter if value is numeric
      if (typeof value === 'number') {
        Animated.timing(countAnim, {
          toValue: value,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }

      // Subtle pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-neutral';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return theme.colors.textSecondary;
    }
  };

  const displayValue = typeof value === 'number' 
    ? countAnim.interpolate({
        inputRange: [0, value],
        outputRange: [0, value],
        extrapolate: 'clamp',
      })
    : value;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim }
          ],
        },
        style
      ]}
    >
      <LinearGradient
        colors={[
          theme.mode === 'dark' 
            ? 'rgba(255,255,255,0.1)' 
            : 'rgba(255,255,255,0.95)',
          theme.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.8)'
        ]}
        style={[
          styles.card,
          {
            borderColor: theme.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.05)',
          }
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={cardColor}
            />
          </View>
          
          {trend && trendValue && (
            <View style={[styles.trendContainer, { backgroundColor: getTrendColor() + '20' }]}>
              <MaterialCommunityIcons
                name={getTrendIcon() as any}
                size={12}
                color={getTrendColor()}
              />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {title}
          </Text>
          
          {typeof value === 'number' ? (
            <Animated.Text style={[styles.value, { color: theme.colors.text }]}>
              {displayValue}
            </Animated.Text>
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {value}
            </Text>
          )}
          
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Decorative gradient overlay */}
        <LinearGradient
          colors={[cardColor + '10', 'transparent']}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: (screenWidth - 48) / 2, // Account for margins and gap
    maxWidth: (screenWidth - 48) / 2,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    zIndex: -1,
  },
});