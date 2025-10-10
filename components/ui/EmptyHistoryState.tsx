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
import { Button } from './Button';

interface EmptyHistoryStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export function EmptyHistoryState({
  title = "No Cleaning History",
  message = "Start your first cleaning session to see your history here. Your Klin robot is ready to make your home spotless!",
  actionText = "Start Cleaning",
  onAction,
  icon = "robot-vacuum"
}: EmptyHistoryStateProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
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
    ]).start();

    // Floating animation for the icon
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    floatingAnimation.start();

    return () => {
      floatingAnimation.stop();
    };
  }, []);

  const floatingTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={[
          theme.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.8)',
          theme.mode === 'dark' 
            ? 'rgba(255,255,255,0.02)' 
            : 'rgba(255,255,255,0.6)'
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
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ translateY: floatingTranslateY }],
            }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            style={styles.iconBackground}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={48}
              color="white"
            />
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>

        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          {message}
        </Text>

        {onAction && (
          <View style={styles.actionContainer}>
            <Button
              title={actionText}
              onPress={onAction}
              variant="primary"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Decorative elements */}
        <View style={styles.decorativeElements}>
          <Animated.View 
            style={[
              styles.decorativeCircle,
              styles.circle1,
              {
                backgroundColor: theme.colors.primary + '20',
                transform: [
                  { 
                    rotate: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }
                ],
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.decorativeCircle,
              styles.circle2,
              {
                backgroundColor: theme.colors.accent + '15',
                transform: [
                  { 
                    rotate: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['360deg', '0deg'],
                    })
                  }
                ],
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.decorativeCircle,
              styles.circle3,
              {
                backgroundColor: theme.colors.primary + '10',
                transform: [
                  { 
                    scale: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    })
                  }
                ],
              }
            ]}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionContainer: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
  },
  circle1: {
    width: 60,
    height: 60,
    top: 20,
    right: 20,
  },
  circle2: {
    width: 40,
    height: 40,
    bottom: 60,
    left: 30,
  },
  circle3: {
    width: 80,
    height: 80,
    top: '50%',
    right: -20,
  },
});