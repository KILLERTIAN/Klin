import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../hooks/useTheme';

interface NotificationBadgeProps {
  style?: any;
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  style,
  size = 'medium',
  showZero = false,
}) => {
  const { theme } = useTheme();
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(unreadCount > 0 ? 1 : 0)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      // Bounce animation when count increases
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            tension: 150,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!showZero) {
      // Fade out when count reaches zero
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [unreadCount, showZero]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          fontSize: 10,
        };
      case 'large':
        return {
          minWidth: 24,
          height: 24,
          borderRadius: 12,
          fontSize: 12,
        };
      default: // medium
        return {
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          fontSize: 11,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const styles = StyleSheet.create({
    badge: {
      backgroundColor: theme.colors.error,
      minWidth: sizeStyles.minWidth,
      height: sizeStyles.height,
      borderRadius: sizeStyles.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      ...theme.shadows.small,
    },
    text: {
      color: 'white',
      fontSize: sizeStyles.fontSize,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  if (!showZero && unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <Text style={styles.text}>{displayCount}</Text>
    </Animated.View>
  );
};