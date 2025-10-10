import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../hooks/useTheme';
import { AppNotification, NotificationType } from '../../types/notification';
import { Button } from './Button';

interface NotificationHistoryProps {
  onClose?: () => void;
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { state, markAsRead, clearHistory, getUnreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = state.history.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'success':
      case 'cleaning_complete':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
      case 'low_battery':
        return 'alert';
      case 'info':
        return 'information';
      case 'connectivity':
        return 'wifi';
      case 'stuck':
        return 'robot-vacuum';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'success':
      case 'cleaning_complete':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
      case 'low_battery':
        return theme.colors.warning;
      case 'connectivity':
      case 'stuck':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const handleNotificationPress = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (notification.onAction) {
      notification.onAction();
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Notification History',
      'Are you sure you want to clear all notification history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const renderRightActions = (notification: AppNotification) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleNotificationPress(notification)}
        >
          <MaterialCommunityIcons name="eye" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderNotificationItem = ({ item }: { item: AppNotification }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.isRead 
              ? theme.glassmorphism.background 
              : `${theme.colors.primary}10`,
            borderColor: theme.glassmorphism.border,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: `${getNotificationColor(item.type)}20` }
          ]}>
            <MaterialCommunityIcons
              name={getNotificationIcon(item.type) as any}
              size={18}
              color={getNotificationColor(item.type)}
            />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={[
                styles.title,
                { 
                  color: theme.colors.text,
                  fontWeight: item.isRead ? '500' : '600'
                }
              ]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
            
            <Text style={[
              styles.message,
              { color: theme.colors.textSecondary }
            ]} numberOfLines={2}>
              {item.message}
            </Text>

            {item.actionLabel && (
              <Text style={[
                styles.actionLabel,
                { color: theme.colors.primary }
              ]}>
                {item.actionLabel}
              </Text>
            )}
          </View>

          {!item.isRead && (
            <View style={[
              styles.unreadIndicator,
              { backgroundColor: theme.colors.primary }
            ]} />
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="bell-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
        {filter === 'unread' 
          ? "You're all caught up! No unread notifications."
          : "You'll see your notification history here."}
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.glassmorphism.border,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.glassmorphism.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: theme.glassmorphism.border,
    },
    filterText: {
      ...theme.typography.body,
      fontWeight: '500',
    },
    filterTextActive: {
      color: 'white',
    },
    filterTextInactive: {
      color: theme.colors.textSecondary,
    },
    list: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    notificationItem: {
      marginVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      overflow: 'hidden',
    },
    notificationContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: theme.spacing.md,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    textContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    title: {
      ...theme.typography.bodyLarge,
      flex: 1,
      marginRight: theme.spacing.xs,
    },
    timestamp: {
      ...theme.typography.caption,
    },
    message: {
      ...theme.typography.body,
      lineHeight: 18,
      marginBottom: 4,
    },
    actionLabel: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
    unreadIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: theme.spacing.xs,
      marginTop: 4,
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: theme.spacing.sm,
    },
    actionButton: {
      width: 60,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.medium,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      ...theme.typography.h3,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    emptyMessage: {
      ...theme.typography.body,
      textAlign: 'center',
      lineHeight: 20,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.glassmorphism.border,
    },
  });

  const unreadCount = getUnreadCount();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' ? styles.filterTextActive : styles.filterTextInactive,
          ]}>
            All ({state.history.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' ? styles.filterButtonActive : styles.filterButtonInactive,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterText,
            filter === 'unread' ? styles.filterTextActive : styles.filterTextInactive,
          ]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredNotifications.length === 0 ? { flex: 1 } : undefined}
      />

      {state.history.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Clear History"
            onPress={handleClearHistory}
            variant="outline"
            size="small"
          />
        </View>
      )}
    </View>
  );
};