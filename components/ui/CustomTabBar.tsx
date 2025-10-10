import { animationConfig } from '@/utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

type IconName =
  | 'home'
  | 'map'
  | 'robot-vacuum'
  | 'history'
  | 'cog';

interface TabItem {
  name: string;
  title: string;
  icon: IconName;
  activeIcon?: IconName;
  iconSize?: number;
  centerIconSize?: number;
  isFAB?: boolean;
}
const tabs: TabItem[] = [
  {
    name: 'index',
    title: 'Dashboard',
    icon: 'view-dashboard-outline' as any,
    activeIcon: 'view-dashboard' as any,
    iconSize: 24
  },
  {
    name: 'map',
    title: 'Rooms',
    icon: 'door-open' as any,
    activeIcon: 'door' as any,
    iconSize: 24
  },
  {
    name: 'explore',
    title: 'Start',
    icon: 'robot-vacuum' as any,
    activeIcon: 'robot-vacuum' as any,
    centerIconSize: 26,
    isFAB: true
  },
  {
    name: 'history',
    title: 'Activity',
    icon: 'chart-timeline' as any,
    activeIcon: 'chart-timeline-variant' as any,
    iconSize: 24
  },
  {
    name: 'settings',
    title: 'Settings',
    icon: 'cog-outline' as any,
    activeIcon: 'cog' as any,
    iconSize: 24
  },
];

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const fabScale = useSharedValue(1);
  const fabGlow = useSharedValue(0.4);
  const fabRotation = useSharedValue(0);

  const handlePress = (route: any, index: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Special animation for FAB
    if (route.name === 'explore') {
      // Enhanced FAB animation with rotation and glow
      fabScale.value = withSequence(
        withSpring(0.85, animationConfig.spring),
        withSpring(1.05, animationConfig.spring),
        withSpring(1, animationConfig.spring)
      );
      
      fabRotation.value = withSequence(
        withSpring(15, { duration: 150 }),
        withSpring(0, animationConfig.spring)
      );
      
      fabGlow.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0.4, { duration: 300 })
      );
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: fabScale.value },
        { rotate: `${fabRotation.value}deg` }
      ],
    };
  });

  const fabGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: fabGlow.value,
  }));

  const styles = getThemedStyles(theme, insets);

  return (
    <View style={styles.container}>
      {/* Background with blur effect */}
      <View style={styles.background} />

      {/* Tab Items */}
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = tabs.find(t => t.name === route.name);

          if (!tab) return null;

          // Special handling for FAB (Clean) tab
          if (tab.isFAB) {
            const centerIconSize = tab.centerIconSize || 28;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => handlePress(route, index)}
                style={styles.centerTabContainer}
                activeOpacity={0.9}
              >
                <Animated.View style={[styles.centerTab, fabAnimatedStyle]}>
                  <LinearGradient
                    colors={isFocused ?
                      [theme.colors.primary, theme.colors.primary + 'DD'] :
                      [theme.colors.primary, theme.colors.primary + 'CC']
                    }
                    style={styles.centerTabGradient}
                  >
                    <View style={styles.centerTabInner}>
                      <MaterialCommunityIcons
                        name={tab.activeIcon || tab.icon}
                        size={centerIconSize}
                        color="white"
                      />
                    </View>
                  </LinearGradient>

                  {/* Enhanced Glow effect */}
                  <Animated.View style={[
                    styles.centerTabGlow,
                    fabGlowStyle,
                    {
                      backgroundColor: theme.colors.primary + '40',
                      opacity: isFocused ? 0.6 : 0.3
                    }
                  ]} />
                </Animated.View>

                <Text style={[
                  styles.centerTabLabel,
                  {
                    color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: isFocused ? '700' : '600'
                  }
                ]}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          }

          // Regular tabs
          const iconSize = tab.iconSize || 26;
          const iconName = isFocused ? (tab.activeIcon || tab.icon) : tab.icon;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => handlePress(route, index)}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabIconContainer,
                isFocused && [
                  styles.tabIconContainerActive,
                  {
                    backgroundColor: theme.colors.primary + '15',
                    borderColor: theme.colors.primary + '30'
                  }
                ]
              ]}>
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={iconSize}
                  color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                />

                {/* Active indicator dot */}
                {isFocused && (
                  <View style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.primary }
                  ]} />
                )}
              </View>

              <Text style={[
                styles.tabLabel,
                {
                  color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                  fontWeight: isFocused ? '700' : '600'
                }
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const getThemedStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        borderTopWidth: 0,
      },
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: Math.max(insets.bottom, 12),
    ...Platform.select({
      ios: {
        minHeight: 60 + Math.max(insets.bottom, 8),
      },
      android: {
        minHeight: 70 + Math.max(insets.bottom, 12),
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: 'relative',
  },
  tabIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  tabIconContainerActive: {
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    marginTop: -20, // Elevate the center tab
  },
  centerTab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
        shadowColor: theme.colors.primary,
      },
    }),
  },
  centerTabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  centerTabGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    top: -4,
    left: -4,
    zIndex: -1,
  },
  centerTabLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});

export default CustomTabBar;