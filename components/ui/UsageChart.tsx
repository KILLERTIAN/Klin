import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

interface ChartDataPoint {
  week: string;
  sessions: number;
  duration: number;
}

interface UsageChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  metric: 'sessions' | 'duration';
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding
const chartHeight = 200;

export function UsageChart({ data, title, subtitle, metric, style }: UsageChartProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate the path drawing
      Animated.timing(pathAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  if (!data || data.length === 0) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
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
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="chart-line"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Data Available
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Start cleaning to see your usage trends
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Prepare chart data
  const values = data.map(point => metric === 'sessions' ? point.sessions : point.duration);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * (chartWidth - 40) + 20;
    const value = metric === 'sessions' ? point.sessions : point.duration;
    const y = chartHeight - 60 - ((value - minValue) / range) * (chartHeight - 100);
    return { x, y, value, label: point.week };
  });

  // Create SVG path
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    // Use smooth curves
    const prevPoint = points[index - 1];
    const cpx1 = prevPoint.x + (point.x - prevPoint.x) / 3;
    const cpy1 = prevPoint.y;
    const cpx2 = point.x - (point.x - prevPoint.x) / 3;
    const cpy2 = point.y;
    return `${path} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
  }, '');

  // Create area path for gradient fill
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight - 40} L ${points[0].x} ${chartHeight - 40} Z`;

  const formatValue = (value: number) => {
    if (metric === 'duration') {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    return value.toString();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
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
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                {metric === 'sessions' ? 'Sessions' : 'Duration'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0.05" />
              </SvgLinearGradient>
            </Defs>
            
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = chartHeight - 60 - ratio * (chartHeight - 100);
              return (
                <Path
                  key={index}
                  d={`M 20 ${y} L ${chartWidth - 20} ${y}`}
                  stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  strokeWidth="1"
                />
              );
            })}

            {/* Area fill */}
            <Animated.View style={{ opacity: pathAnim }}>
              <Path
                d={areaPath}
                fill="url(#gradient)"
              />
            </Animated.View>

            {/* Line */}
            <Animated.View style={{ opacity: pathAnim }}>
              <Path
                d={pathData}
                stroke={theme.colors.primary}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Animated.View>

            {/* Data points */}
            {points.map((point, index) => (
              <Animated.View key={index} style={{ opacity: pathAnim }}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={theme.colors.primary}
                  stroke="white"
                  strokeWidth="2"
                />
              </Animated.View>
            ))}
          </Svg>

          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            {points.map((point, index) => (
              <Text
                key={index}
                style={[
                  styles.axisLabel,
                  { 
                    color: theme.colors.textSecondary,
                    left: point.x - 20,
                  }
                ]}
              >
                {point.label}
              </Text>
            ))}
          </View>
        </View>

        {/* Stats summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Average
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatValue(Math.round(values.reduce((a, b) => a + b, 0) / values.length))}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Peak
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatValue(maxValue)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatValue(values.reduce((a, b) => a + b, 0))}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  legend: {
    alignItems: 'flex-end',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    position: 'relative',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: 20,
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});