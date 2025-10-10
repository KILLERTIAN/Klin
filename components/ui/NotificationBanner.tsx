import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    State,
} from 'react-native-gesture-handler';
import { useTheme } from '../../hooks/useTheme';
import { AppNotification, NotificationType } from '../../types/notification';

interface NotificationBannerProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
  onAction?: () => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  onAction,
  style
}) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss if duration is set
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(notification.id);
    });
  };

  const handleAction = () => {
    if (notification.onAction || onAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      (notification.onAction || onAction)?.();
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Dismiss if swiped far enough or with enough velocity
      if (Math.abs(translationX) > screenWidth * 0.3 || Math.abs(velocityX) > 1000) {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: translationX > 0 ? screenWidth : -screenWidth,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss(notification.id);
        });
      } else {
        // Snap back to center
        Animated.spring(translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    }
  };

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

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 1000,
      marginTop: 60, // Account for status bar and safe area
    },
    banner: {
      borderRadius: theme.borderRadius.large,
      overflow: 'hidden',
      ...theme.shadows.medium,
    },
    blurContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      minHeight: 80,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${getNotificationColor(notification.type)}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    contentContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    title: {
      ...theme.typography.bodyLarge,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    message: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.small,
      backgroundColor: `${theme.colors.primary}20`,
      marginRight: theme.spacing.xs,
    },
    actionText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    dismissButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${theme.colors.textSecondary}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 3,
      backgroundColor: getNotificationColor(notification.type),
      borderBottomLeftRadius: theme.borderRadius.large,
      borderBottomRightRadius: theme.borderRadius.large,
    },
  });

  // Progress bar animation for auto-dismiss notifications
  const progressWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (notification.duration) {
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: notification.duration,
        useNativeDriver: false,
      }).start();
    }
  }, [notification.duration]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
        style,
      ]}
    >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={styles.banner}>
          <BlurView
            intensity={theme.glassmorphism.blur}
            tint={theme.mode === 'dark' ? 'dark' : 'light'}
            style={styles.blurContainer}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getNotificationIcon(notification.type) as any}
                size={20}
                color={getNotificationColor(notification.type)}
              />
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={styles.message} numberOfLines={2}>
                {notification.message}
              </Text>
            </View>

            <View style={styles.actionContainer}>
              {notification.actionLabel && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAction}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionText}>
                    {notification.actionLabel}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </BlurView>

          {notification.duration && (
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};