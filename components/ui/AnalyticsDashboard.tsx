import { useTheme } from '@/hooks/useTheme';
import { historyService } from '@/services/historyService';
import { UsageAnalytics } from '@/types/robot';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyHistoryState } from './EmptyHistoryState';
import { MetricCard } from './MetricCard';
import { UsageChart } from './UsageChart';

interface AnalyticsDashboardProps {
  onRefresh?: () => void;
  style?: any;
}

export function AnalyticsDashboard({ onRefresh, style }: AnalyticsDashboardProps) {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'sessions' | 'duration'>('sessions');
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await historyService.calculateAnalytics();
      setAnalytics(data);
      
      // Animate in the content
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    if (onRefresh) {
      onRefresh();
    }
    setRefreshing(false);
  };

  const handleMetricToggle = (metric: 'sessions' | 'duration') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMetric(metric);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Calculating analytics...
          </Text>
        </View>
      </View>
    );
  }

  if (!analytics || analytics.totalSessions === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyHistoryState
          title="No Analytics Available"
          message="Start cleaning to see detailed analytics and usage trends for your Klin robot."
          actionText="View History"
          onAction={() => {
            // Navigate to history tab
            console.log('Navigate to history');
          }}
          icon="chart-line"
        />
      </View>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = (minutes % 60).toFixed(2);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatArea = (area: number) => {
    return `${area.toFixed(0)} m²`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name="chart-box"
              size={28}
              color={theme.colors.primary}
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Usage Analytics
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Insights from {analytics.totalSessions} cleaning sessions
          </Text>
        </View>

        {/* Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Sessions"
            value={analytics.totalSessions}
            subtitle="cleaning runs"
            icon="robot-vacuum"
            color={theme.colors.primary}
            delay={0}
          />
          
          <MetricCard
            title="Total Time"
            value={formatDuration(analytics.totalCleaningTime)}
            subtitle="cleaning time"
            icon="clock"
            color="#10B981"
            delay={100}
          />
          
          <MetricCard
            title="Area Cleaned"
            value={formatArea(analytics.totalAreaCleaned)}
            subtitle="total coverage"
            icon="vector-square"
            color="#F59E0B"
            delay={200}
          />
          
          <MetricCard
            title="Avg Duration"
            value={formatDuration(analytics.averageSessionDuration)}
            subtitle="per session"
            icon="speedometer"
            color="#8B5CF6"
            delay={300}
          />
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Weekly Trends
            </Text>
            
            <View style={styles.metricToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedMetric === 'sessions' && styles.toggleButtonActive,
                  {
                    backgroundColor: selectedMetric === 'sessions' 
                      ? theme.colors.primary 
                      : theme.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.05)',
                  }
                ]}
                onPress={() => handleMetricToggle('sessions')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color: selectedMetric === 'sessions' 
                        ? 'white' 
                        : theme.colors.textSecondary
                    }
                  ]}
                >
                  Sessions
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedMetric === 'duration' && styles.toggleButtonActive,
                  {
                    backgroundColor: selectedMetric === 'duration' 
                      ? theme.colors.primary 
                      : theme.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.05)',
                  }
                ]}
                onPress={() => handleMetricToggle('duration')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color: selectedMetric === 'duration' 
                        ? 'white' 
                        : theme.colors.textSecondary
                    }
                  ]}
                >
                  Duration
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <UsageChart
            data={analytics.weeklyUsage}
            title={`Weekly ${selectedMetric === 'sessions' ? 'Sessions' : 'Duration'}`}
            subtitle="Last 8 weeks"
            metric={selectedMetric}
          />
        </View>

        {/* Most Cleaned Rooms */}
        {analytics.mostCleanedRooms.length > 0 && (
          <View style={styles.roomsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Most Cleaned Rooms
            </Text>
            
            <View style={styles.roomsList}>
              {analytics.mostCleanedRooms.slice(0, 5).map((room, index) => {
                const percentage = (room.count / analytics.totalSessions) * 100;
                
                return (
                  <View key={room.roomId} style={styles.roomItem}>
                    <View style={styles.roomInfo}>
                      <Text style={[styles.roomName, { color: theme.colors.text }]}>
                        {room.roomId}
                      </Text>
                      <Text style={[styles.roomCount, { color: theme.colors.textSecondary }]}>
                        {room.count} times ({percentage.toFixed(0)}%)
                      </Text>
                    </View>
                    
                    <View style={styles.roomProgress}>
                      <View
                        style={[
                          styles.roomProgressBar,
                          {
                            backgroundColor: theme.mode === 'dark' 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'rgba(0,0,0,0.1)',
                          }
                        ]}
                      >
                        <View
                          style={[
                            styles.roomProgressFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: theme.colors.primary,
                            }
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginLeft: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  metricToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roomsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  roomsList: {
    gap: 12,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  roomInfo: {
    flex: 1,
    marginRight: 16,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  roomCount: {
    fontSize: 14,
  },
  roomProgress: {
    width: 100,
  },
  roomProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  roomProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
});