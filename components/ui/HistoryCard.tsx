import { useTheme } from '@/hooks/useTheme';
import { historyService } from '@/services/historyService';
import { CleaningSession } from '@/types/robot';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface HistoryCardProps {
  session: CleaningSession;
  onPress?: (session: CleaningSession) => void;
  onDelete?: (sessionId: string) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export function HistoryCard({ session, onPress, onDelete, style }: HistoryCardProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  const statusColor = historyService.getStatusColor(session.status);
  const statusIcon = historyService.getStatusIcon(session.status);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress(session);
    } else {
      toggleExpanded();
    }
  };

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(slideAnim, {
      toValue,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onDelete) {
      onDelete(session.id);
    }
  };

  const expandedHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const rotateIcon = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        style
      ]}
    >
      <LinearGradient
        colors={[
          theme.mode === 'dark' 
            ? 'rgba(255,255,255,0.1)' 
            : 'rgba(255,255,255,0.9)',
          theme.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.7)'
        ]}
        style={[
          styles.card,
          {
            borderColor: theme.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)',
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.header}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
              <MaterialCommunityIcons 
                name={statusIcon as any} 
                size={16} 
                color="white" 
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {historyService.formatDate(session.startTime)}
              </Text>
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                {session.startTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.quickStats}>
              <Text style={[styles.durationText, { color: theme.colors.text }]}>
                {historyService.formatDuration(session.duration)}
              </Text>
              <Text style={[styles.areaText, { color: theme.colors.textSecondary }]}>
                {historyService.formatArea(session.areaCovered)}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
              <MaterialCommunityIcons 
                name="chevron-down" 
                size={24} 
                color={theme.colors.textSecondary} 
              />
            </Animated.View>
          </View>
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.expandedContent,
            { height: expandedHeight }
          ]}
        >
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name="robot-vacuum" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Mode:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {session.mode === 'automatic' ? 'Automatic' : 'Manual'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name="speedometer" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Intensity:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {session.intensity.charAt(0).toUpperCase() + session.intensity.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name="battery" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Battery Used:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {session.batteryUsed}%
              </Text>
            </View>

            <View style={styles.roomsContainer}>
              <Text style={[styles.roomsLabel, { color: theme.colors.textSecondary }]}>
                Rooms Cleaned:
              </Text>
              <View style={styles.roomTags}>
                {session.roomsCleaned.map((room, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.roomTag,
                      { 
                        backgroundColor: theme.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.05)',
                        borderColor: theme.mode === 'dark' 
                          ? 'rgba(255,255,255,0.2)' 
                          : 'rgba(0,0,0,0.1)'
                      }
                    ]}
                  >
                    <Text style={[styles.roomTagText, { color: theme.colors.text }]}>
                      {room}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {session.errorMessage && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={16} 
                  color="#EF4444" 
                />
                <Text style={[styles.errorText, { color: '#EF4444' }]}>
                  {session.errorMessage}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {isExpanded && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { 
                  backgroundColor: theme.mode === 'dark' 
                    ? 'rgba(239,68,68,0.2)' 
                    : 'rgba(239,68,68,0.1)',
                  borderColor: '#EF4444'
                }
              ]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete" size={16} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStats: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  areaText: {
    fontSize: 12,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  roomsContainer: {
    marginTop: 8,
  },
  roomsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  roomTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roomTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roomTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});