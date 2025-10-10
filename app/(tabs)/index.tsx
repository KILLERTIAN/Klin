import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SkeletonCard, SkeletonStatusCard } from '../../components/ui';

import { ProfileButton } from '@/components/ui/ProfileButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { ConnectionBadge } from '../../components/ui/ConnectionBadge';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import { NotificationButton } from '../../components/ui/NotificationButton';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useResponsive, useResponsiveSpacing, useResponsiveTypography } from '../../hooks/useResponsive';
import { useRobotState } from '../../hooks/useRobotState';
import { useTheme } from '../../hooks/useTheme';
import { storageService } from '../../services/storage';
import { accessibilityHelpers } from '../../utils/accessibility';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { state: robotState } = useRobotState();
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();
  const { isTablet } = useResponsive();
  const spacing = useResponsiveSpacing();
  const typography = useResponsiveTypography();
  const { announceForAccessibility } = useAccessibility();
  
  const [userName, setUserName] = useState('User');
  const [greeting, setGreeting] = useState('Hello');
  const [isLoading, setIsLoading] = useState(true);
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadUserData();
    setGreetingMessage();
    startAnimations();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const preferences = await storageService.getUserPreferences();
      if (preferences.userName) {
        setUserName(preferences.userName);
      }
      
      // Simulate loading time for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
    }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
    }),
    ]).start();
  };

  const handleManualMode = () => {
    router.push('/manual');
  };

  const handleAutomaticMode = () => {
    router.push('/automatic');
  };

  const handleQuickClean = () => {
    // Start a quick cleaning session
    console.log('Starting quick clean...');
    announceForAccessibility('Quick cleaning started');
    
    // Quick clean functionality would be implemented here
    console.log('Quick clean started');
  };

  const handleReturnToDock = () => {
    // Send robot back to dock
    console.log('Returning to dock...');
    announceForAccessibility('Robot returning to dock');
    
    // Return to dock functionality would be implemented here
    console.log('Returning to dock');
  };

  const handleProfilePress = () => {
    // Navigate to profile/settings screen
    router.push('/settings');
  };

  const handleCardPressIn = (mode: string) => {
    setPressedCard(mode);
  };

  const handleCardPressOut = () => {
    setPressedCard(null);
  };

  const renderGreetingHeader = () => (
    <Animated.View
      style={[
        styles.headerSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
  },
      ]}
    >
      <View style={styles.greetingContent}>
        <View style={styles.greetingText}>
          <Text 
            style={[
              styles.greeting, 
              { 
                color: theme.colors.textSecondary,
                fontSize: typography.body.fontSize,
              }
            ]}
            {...accessibilityHelpers.createTextProps(greeting)}
          >
            {greeting}
          </Text>
          <Text 
            style={[
              styles.userName, 
              { 
                color: theme.colors.text,
                fontSize: isTablet ? 36 : 32,
                lineHeight: isTablet ? 44 : 40,
              }
            ]}
            {...accessibilityHelpers.createTextProps(`Hello ${userName}`, 'header')}
          >
            {userName} 👋
          </Text>
        </View>

        <View style={styles.headerActions}>
          <NotificationButton 
            style={[styles.actionButton, { marginRight: 12 }]}
          />
          <ProfileButton
            style={styles.actionButton}
            userName={userName}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderDeviceStatusCard = () => {
    if (isLoading) {
      return (
        <SkeletonStatusCard
          style={{
            marginHorizontal: spacing.container,
            marginBottom: spacing.section,
          }}
        />
      );
    }

    return (
      <Card 
        glassmorphism 
        style={{
          ...styles.statusCard,
          marginHorizontal: spacing.container,
          marginBottom: spacing.section,
          padding: isTablet ? 24 : 20,
          borderRadius: 20,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }} 
        animated
      >
        <View style={styles.statusHeader}>
          <View style={styles.statusTitleContainer}>
            <MaterialCommunityIcons
              name="robot-vacuum"
              size={isTablet ? 28 : 24}
              color={theme.colors.primary}
            />
            <Text style={[
              styles.statusTitle, 
              { 
                color: theme.colors.text,
                fontSize: typography.h3.fontSize,
              }
            ]}>
              Klin Status
            </Text>
          </View>
          <ConnectionBadge
            status={robotState.connectivity.isOnline ? 'connected' : 'disconnected'}
          />
        </View>

        <View style={[
          styles.statusContent,
          isTablet && styles.statusContentTablet
        ]}>
          <View 
            style={styles.batteryContainer}
            {...accessibilityHelpers.createProgressProps(
              'Battery Level',
              robotState.battery.percentage
            )}
          >
            <CircularProgress
              progress={robotState.battery.percentage}
              size={isTablet ? 80 : 60}
              strokeWidth={isTablet ? 8 : 6}
              color={theme.colors.success}
            />
            <View style={styles.batteryInfo}>
              <Text 
                style={[
                  styles.batteryText, 
                  { 
                    color: theme.colors.text,
                    fontSize: isTablet ? 26 : 22,
                  }
                ]}
                {...accessibilityHelpers.createTextProps(`${robotState.battery.percentage} percent battery`)}
              >
                {robotState.battery.percentage}%
              </Text>
              <Text 
                style={[
                  styles.batteryLabel, 
                  { 
                    color: theme.colors.textSecondary,
                    fontSize: typography.caption.fontSize,
                  }
                ]}
                {...accessibilityHelpers.createTextProps('Battery')}
              >
                Battery
              </Text>
            </View>
          </View>

          <View style={styles.statusInfo}>
            <StatusIndicator
              status={robotState.status}
              label="Current Status"
            />
            <Text 
              style={[
                styles.statusDetail, 
                { 
                  color: theme.colors.textSecondary,
                  fontSize: typography.caption.fontSize,
                }
              ]}
              {...accessibilityHelpers.createStatusProps(
                robotState.battery.isCharging ? 'Charging' :
                  robotState.battery.estimatedRuntime > 0 ?
                    `${robotState.battery.estimatedRuntime} minutes remaining` :
                    'Ready to clean',
                'Robot status information'
              )}
            >
              {robotState.battery.isCharging ? 'Charging' :
                robotState.battery.estimatedRuntime > 0 ?
                  `${robotState.battery.estimatedRuntime}min remaining` :
                  'Ready to clean'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderModeSelectionCards = () => {
    if (isLoading) {
      return (
        <View style={[
          styles.modeContainer,
          {
            paddingHorizontal: spacing.container,
            marginBottom: spacing.section,
            flexDirection: isTablet ? 'row' : 'column',
            gap: spacing.element,
          }
        ]}>
          <SkeletonCard 
            style={{ 
              flex: isTablet ? 1 : undefined, 
              minHeight: isTablet ? 200 : 180,
              borderRadius: 28 
            }} 
          />
          <SkeletonCard 
            style={{ 
              flex: isTablet ? 1 : undefined, 
              minHeight: isTablet ? 200 : 180,
              borderRadius: 28 
            }} 
          />
        </View>
      );
    }

    return (
      <View style={[
        styles.modeContainer,
        {
          paddingHorizontal: spacing.container,
          marginBottom: spacing.section,
          flexDirection: isTablet ? 'row' : 'column',
          gap: spacing.element,
        }
      ]}>
        {/* Manual Mode Card */}
        <TouchableOpacity
          style={[
            styles.modeCardContainer,
            { 
    flex: 1,
              transform: [{ scale: pressedCard === 'manual' ? 0.98 : 1 }]
            }
          ]}
          onPress={handleManualMode}
          onPressIn={() => handleCardPressIn('manual')}
          onPressOut={handleCardPressOut}
          activeOpacity={1}
          {...accessibilityHelpers.createNavigationProps(
            'Manual Mode',
            'Switch to manual control mode for direct robot control'
          )}
        >
          <Card glassmorphism style={{
            ...styles.modeCard,
            minHeight: isTablet ? 220 : 200,
            paddingVertical: spacing.section + 8,
            paddingHorizontal: spacing.element + 8,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: theme.colors.primary + '20',
            overflow: 'hidden',
          }}>
            {/* Animated Gradient Background */}
            <LinearGradient
              colors={[
                theme.colors.primary + '15', 
                theme.colors.primary + '08',
                theme.colors.primary + '02'
              ]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Glow Effect */}
            <View style={[
              styles.cardGlow,
              { 
                backgroundColor: theme.colors.primary + '15',
                opacity: pressedCard === 'manual' ? 0.6 : 0.3
              }
            ]} />
            
            {/* Content Container */}
            <View style={styles.modeContent}>
              {/* Icon with Floating Animation */}
              <View style={[
                styles.modeIconContainer, 
                { 
                  marginBottom: spacing.element + 8,
                  backgroundColor: theme.colors.primary + '12',
                  borderRadius: 24,
                  width: 72,
                  height: 72,
                  borderWidth: 1.5,
                  borderColor: theme.colors.primary + '25',
                }
              ]}>
                <MaterialCommunityIcons
                  name="gamepad-circle-outline"
                  size={isTablet ? 36 : 32}
                  color={theme.colors.primary}
                />
                
                {/* Icon Badge */}
                <View style={[
                  styles.iconBadge,
                  { backgroundColor: theme.colors.primary }
                ]}>
                  <Text style={styles.iconBadgeText}>↑↓</Text>
                </View>
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={[
                  styles.modeTitle, 
                  { 
                    color: theme.colors.text,
                    fontSize: isTablet ? 22 : 20,
                    fontWeight: '800',
                    marginBottom: 8,
                    letterSpacing: -0.5,
                  }
                ]}>
                  Manual Mode
                </Text>
                <Text style={[
                  styles.modeDescription, 
                  { 
                    color: theme.colors.textSecondary,
                    fontSize: isTablet ? 16 : 15,
                    textAlign: 'center',
                    lineHeight: 22,
                    fontWeight: '500',
                  }
                ]}>
                  Take full control with precision movement and real-time navigation
                </Text>
              </View>

              {/* Action Indicator */}
              <View style={styles.actionIndicator}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.primary + '60'}
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Automatic Mode Card */}
        <TouchableOpacity
          style={[
            styles.modeCardContainer,
            { 
              flex: 1,
              transform: [{ scale: pressedCard === 'auto' ? 0.98 : 1 }]
            }
          ]}
          onPress={handleAutomaticMode}
          onPressIn={() => handleCardPressIn('auto')}
          onPressOut={handleCardPressOut}
          activeOpacity={1}
          {...accessibilityHelpers.createNavigationProps(
            'Automatic Mode',
            'Switch to automatic mode for smart cleaning routines'
          )}
        >
          <Card glassmorphism style={{
            ...styles.modeCard,
            minHeight: isTablet ? 220 : 200,
            paddingVertical: spacing.section + 8,
            paddingHorizontal: spacing.element + 8,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: theme.colors.accent + '20',
            overflow: 'hidden',
          }}>
            {/* Animated Gradient Background */}
            <LinearGradient
              colors={[
                theme.colors.accent + '15', 
                theme.colors.accent + '08',
                theme.colors.accent + '02'
              ]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Glow Effect */}
            <View style={[
              styles.cardGlow,
              { 
                backgroundColor: theme.colors.accent + '15',
                opacity: pressedCard === 'auto' ? 0.6 : 0.3
              }
            ]} />
            
            {/* Content Container */}
            <View style={styles.modeContent}>
              {/* Icon with AI Badge */}
              <View style={[
                styles.modeIconContainer, 
                { 
                  marginBottom: spacing.element + 8,
                  backgroundColor: theme.colors.accent + '12',
                  borderRadius: 24,
                  width: 72,
                  height: 72,
                  borderWidth: 1.5,
                  borderColor: theme.colors.accent + '25',
                }
              ]}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={isTablet ? 36 : 32}
                  color={theme.colors.accent}
                />
                
                {/* AI Badge */}
                <View style={[
                  styles.iconBadge,
                  { backgroundColor: theme.colors.accent }
                ]}>
                  <MaterialCommunityIcons
                    name="brain"
                    size={12}
                    color="white"
                  />
                </View>
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={[
                  styles.modeTitle, 
                  { 
                    color: theme.colors.text,
                    fontSize: isTablet ? 22 : 20,
                    fontWeight: '800',
                    marginBottom: 8,
                    letterSpacing: -0.5,
                  }
                ]}>
                  Auto Mode
                </Text>
                <Text style={[
                  styles.modeDescription, 
                  { 
                    color: theme.colors.textSecondary,
                    fontSize: isTablet ? 16 : 15,
                    textAlign: 'center',
                    lineHeight: 22,
                    fontWeight: '500',
                  }
                ]}>
                  Smart AI-powered cleaning with optimized routes and scheduling
                </Text>
              </View>

              {/* Action Indicator */}
              <View style={styles.actionIndicator}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.accent + '60'}
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickActions = () => {
    if (isLoading) {
      return (
        <SkeletonCard
          style={{
            marginHorizontal: spacing.container,
            marginBottom: spacing.section,
            minHeight: 200,
          }}
        />
      );
    }

    return (
      <Card 
        glassmorphism 
        style={{
          ...styles.quickActionsCard,
          marginHorizontal: spacing.container,
          marginBottom: spacing.section,
        }}
      >
        <Text style={[
          styles.quickActionsTitle, 
          { 
            color: theme.colors.text,
            fontSize: typography.h3.fontSize,
            marginBottom: spacing.element,
          }
        ]}>
          Quick Actions
        </Text>

        <View style={[
          styles.quickActionsContainer,
          {
            flexDirection: isTablet ? 'row' : 'column',
            gap: spacing.small,
            marginBottom: spacing.section,
          }
        ]}>
          <TouchableOpacity
            onPress={handleQuickClean}
            style={[
              styles.quickActionButton,
              styles.gradientButton,
              { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
              isTablet ? { flex: 1 } : {}
            ]}
          >
            <Text style={[styles.gradientButtonText, { color: '#FFFFFF' }]}>Quick Clean</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReturnToDock}
            style={[
              styles.quickActionButton,
              styles.outlineButton,
              {
                backgroundColor: theme.colors.primary + '08',
                borderColor: theme.colors.primary,
              },
              isTablet ? { flex: 1 } : {}
            ]}
          >
            <Text style={[styles.outlineButtonText, { color: theme.colors.primary }]}>Return to Dock</Text>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.statsContainer,
          {
            paddingTop: spacing.element,
            borderTopColor: theme.glassmorphism.border,
          }
        ]}>
          <View 
            style={styles.statItem}
            {...accessibilityHelpers.createTextProps('12 cleaning sessions completed')}
          >
            <Text style={[
              styles.statValue, 
              { 
                color: theme.colors.text,
                fontSize: isTablet ? 28 : 24,
              }
            ]}>
              12
            </Text>
            <Text style={[
              styles.statLabel, 
              { 
                color: theme.colors.textSecondary,
                fontSize: typography.caption.fontSize,
              }
            ]}>
              Sessions
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.glassmorphism.border }]} />
          <View 
            style={styles.statItem}
            {...accessibilityHelpers.createTextProps('24 hours total cleaning time')}
          >
            <Text style={[
              styles.statValue, 
              { 
                color: theme.colors.text,
                fontSize: isTablet ? 28 : 24,
              }
            ]}>
              24h
            </Text>
            <Text style={[
              styles.statLabel, 
              { 
                color: theme.colors.textSecondary,
                fontSize: typography.caption.fontSize,
              }
            ]}>
              Total Time
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.glassmorphism.border }]} />
          <View 
            style={styles.statItem}
            {...accessibilityHelpers.createTextProps('156 square meters area cleaned')}
          >
            <Text style={[
              styles.statValue, 
              { 
                color: theme.colors.text,
                fontSize: isTablet ? 28 : 24,
              }
            ]}>
              156m²
            </Text>
            <Text style={[
              styles.statLabel, 
              { 
                color: theme.colors.textSecondary,
                fontSize: typography.caption.fontSize,
              }
            ]}>
              Area Cleaned
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { 
            paddingBottom: spacing.section * 2,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        {renderGreetingHeader()}

        {/* Device Status Card */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderDeviceStatusCard()}
        </Animated.View>

        {/* Connection Status */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={{ marginHorizontal: spacing.container }}>
            <ConnectionStatus showQuickActions={true} />
          </View>
        </Animated.View>

        {/* Mode Selection Cards */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderModeSelectionCards()}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderQuickActions()}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  headerSection: {
    marginBottom: 32,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 16,
  },
  greetingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.7,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'Roboto',
        fontWeight: '700',
      },
    }),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  statusCard: {
    borderRadius: 20,
    padding: 20,
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
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statusContentTablet: {
    gap: 32,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  batteryInfo: {
    alignItems: 'flex-start',
  },
  batteryText: {
    fontSize: 24,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  batteryLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.7,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  statusInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusDetail: {
    fontSize: 14,
    marginTop: 6,
    opacity: 0.8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },

  // Mode Selection Cards
  modeContainer: {
    marginBottom: 32,
  },
  modeCardContainer: {
    marginBottom: 16,
  },
  modeCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 1,
  },
  modeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modeContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
  },
  modeIconContainer: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 20,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
      },
    }),
  },
  modeDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    opacity: 0.8,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Text',
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  iconBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  actionIndicator: {
    marginTop: 'auto',
    paddingTop: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },

  // Quick Actions
  quickActionsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionButton: {
    minHeight: 60,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
  },
  gradientButton: {
    shadowColor: '#4F8EF7',
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
      },
    }),
  },
  outlineButton: {
    shadowColor: '#4F8EF7',
  },
  outlineButtonText: {
    fontSize: 17,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
      },
    }),
  },

  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
      },
    }),
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Text',
      },
    }),
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    opacity: 0.3,
  },

  // Additional Utility Styles
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glassmorphism: {
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
});