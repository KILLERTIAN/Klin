import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert, Clipboard, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { BluetoothConnection } from '../../components/ui/BluetoothConnection';
import { Card } from '../../components/ui/Card';
import { Switch } from '../../components/ui/Switch';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useTheme } from '../../hooks/useTheme';
import { storageService } from '../../services/storage';
import { ThemeMode } from '../../types/theme';

interface UserPreferences {
  notifications: {
    cleaningComplete: boolean;
    lowBattery: boolean;
    errors: boolean;
    maintenance: boolean;
  };
  wifi: {
    ssid: string;
    isConnected: boolean;
    signalStrength: number;
  };
  device: {
    name: string;
    model: string;
    firmwareVersion: string;
    serialNumber: string;
  };
}

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const pushNotifications = usePushNotifications();
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      cleaningComplete: true,
      lowBattery: true,
      errors: true,
      maintenance: false,
    },
    wifi: {
      ssid: 'Home WiFi',
      isConnected: true,
      signalStrength: 85,
    },
    device: {
      name: 'Klin Robot Vacuum',
      model: 'KLN-2024',
      firmwareVersion: '2.1.4',
      serialNumber: 'KLN240001234',
    },
  });

  const [storageInfo, setStorageInfo] = useState<{ keys: string[]; size: number }>({ keys: [], size: 0 });
  const headerOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);

  useEffect(() => {
    loadPreferences();
    loadStorageInfo();
    
    // Entrance animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await storageService.getUserPreferences();
      if (saved.notifications) {
        setPreferences(prev => ({ ...prev, ...saved }));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await storageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await storageService.saveUserPreferences(newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setThemeMode(mode);
  };

  const handleNotificationToggle = (key: keyof UserPreferences['notifications']) => {
    const newPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key],
      },
    };
    savePreferences(newPreferences);
  };

  const handleWifiReconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Reconnect WiFi',
      'This will reconnect your robot to the WiFi network.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reconnect',
          onPress: () => {
            // Simulate reconnection
            setPreferences(prev => ({
              ...prev,
              wifi: { ...prev.wifi, isConnected: true, signalStrength: 92 },
            }));
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all cleaning history, preferences, and cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              await loadStorageInfo();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Failed to clear data:', error);
            }
          },
        },
      ]
    );
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
  }));

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSignalIcon = (strength: number) => {
    if (strength >= 75) return 'wifi-strength-4';
    if (strength >= 50) return 'wifi-strength-3';
    if (strength >= 25) return 'wifi-strength-2';
    return 'wifi-strength-1';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <LinearGradient
          colors={theme.gradients.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
            Customize your Klin experience
          </Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedContentStyle}>
          {/* Theme Settings */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Card glassmorphism style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="palette"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Appearance
                </Text>
              </View>

              <View style={styles.themeOptions}>
                {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: themeMode === mode 
                          ? theme.colors.primary + '20' 
                          : 'transparent',
                        borderColor: themeMode === mode 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleThemeChange(mode)}
                  >
                    <MaterialCommunityIcons
                      name={
                        mode === 'light' 
                          ? 'white-balance-sunny' 
                          : mode === 'dark' 
                          ? 'moon-waning-crescent' 
                          : 'theme-light-dark'
                      }
                      size={20}
                      color={themeMode === mode ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themeOptionText,
                        {
                          color: themeMode === mode 
                            ? theme.colors.primary 
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </Animated.View>

          {/* Bluetooth Connection */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <BluetoothConnection />
          </Animated.View>

          {/* WiFi Settings */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Card glassmorphism style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="wifi"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  WiFi Connection
                </Text>
              </View>

              <View style={styles.wifiInfo}>
                <View style={styles.wifiStatus}>
                  <View style={styles.wifiDetails}>
                    <Text style={[styles.wifiSSID, { color: theme.colors.text }]}>
                      {preferences.wifi.ssid}
                    </Text>
                    <View style={styles.wifiMeta}>
                      <View
                        style={[
                          styles.connectionDot,
                          {
                            backgroundColor: preferences.wifi.isConnected
                              ? theme.colors.success
                              : theme.colors.error,
                          },
                        ]}
                      />
                      <Text style={[styles.connectionStatus, { color: theme.colors.textSecondary }]}>
                        {preferences.wifi.isConnected ? 'Connected' : 'Disconnected'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.signalStrength}>
                    <MaterialCommunityIcons
                      name={getSignalIcon(preferences.wifi.signalStrength)}
                      size={20}
                      color={theme.colors.success}
                    />
                    <Text style={[styles.signalText, { color: theme.colors.textSecondary }]}>
                      {preferences.wifi.signalStrength}%
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.reconnectButton, { borderColor: theme.colors.primary }]}
                  onPress={handleWifiReconnect}
                >
                  <MaterialCommunityIcons
                    name="refresh"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.reconnectText, { color: theme.colors.primary }]}>
                    Reconnect
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>

          {/* Notification Settings */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Card glassmorphism style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="bell"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Notifications
                </Text>
              </View>

              <View style={styles.notificationsList}>
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <View key={key} style={styles.notificationItem}>
                    <View style={styles.notificationInfo}>
                      <Text style={[styles.notificationLabel, { color: theme.colors.text }]}>
                        {key === 'cleaningComplete' && 'Cleaning Complete'}
                        {key === 'lowBattery' && 'Low Battery'}
                        {key === 'errors' && 'Error Alerts'}
                        {key === 'maintenance' && 'Maintenance Reminders'}
                      </Text>
                      <Text style={[styles.notificationDescription, { color: theme.colors.textSecondary }]}>
                        {key === 'cleaningComplete' && 'Get notified when cleaning is finished'}
                        {key === 'lowBattery' && 'Alert when battery is running low'}
                        {key === 'errors' && 'Immediate alerts for robot errors'}
                        {key === 'maintenance' && 'Reminders for filter and brush maintenance'}
                      </Text>
                    </View>
                    <Switch
                      value={value}
                      onValueChange={() => handleNotificationToggle(key as keyof UserPreferences['notifications'])}
                      glowEffect
                    />
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>

          {/* Push Notifications */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <Card glassmorphism style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="cellphone-message"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Push Notifications
                </Text>
              </View>

              <View style={styles.pushNotificationInfo}>
                <View style={styles.pushStatusRow}>
                  <View style={styles.pushStatusInfo}>
                    <Text style={[styles.pushStatusLabel, { color: theme.colors.text }]}>
                      Status
                    </Text>
                    <View style={styles.pushStatusMeta}>
                      <View
                        style={[
                          styles.connectionDot,
                          {
                            backgroundColor: pushNotifications.isInitialized && pushNotifications.expoPushToken
                              ? theme.colors.success
                              : theme.colors.error,
                          },
                        ]}
                      />
                      <Text style={[styles.connectionStatus, { color: theme.colors.textSecondary }]}>
                        {pushNotifications.isInitialized && pushNotifications.expoPushToken
                          ? 'Ready'
                          : pushNotifications.error
                          ? 'Error'
                          : 'Initializing...'}
                      </Text>
                    </View>
                  </View>
                  
                  {!pushNotifications.permissions?.granted && (
                    <TouchableOpacity
                      style={[styles.permissionButton, { borderColor: theme.colors.primary }]}
                      onPress={pushNotifications.requestPermissions}
                    >
                      <MaterialCommunityIcons
                        name="shield-check"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={[styles.permissionText, { color: theme.colors.primary }]}>
                        Enable
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {pushNotifications.expoPushToken && (
                  <View style={styles.tokenSection}>
                    <Text style={[styles.tokenLabel, { color: theme.colors.textSecondary }]}>
                      Push Token (for testing)
                    </Text>
                    <TouchableOpacity
                      style={[styles.tokenContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => {
                        Clipboard.setString(pushNotifications.expoPushToken!);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert('Copied!', 'Push token copied to clipboard');
                      }}
                    >
                      <Text style={[styles.tokenText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {pushNotifications.expoPushToken}
                      </Text>
                      <MaterialCommunityIcons
                        name="content-copy"
                        size={16}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {pushNotifications.error && (
                  <View style={styles.errorSection}>
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {pushNotifications.error}
                    </Text>
                  </View>
                )}

                <View style={styles.testButtons}>
                  <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}
                    onPress={() => pushNotifications.scheduleTestNotification(2)}
                    disabled={!pushNotifications.isInitialized}
                  >
                    <MaterialCommunityIcons
                      name="test-tube"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text style={[styles.testButtonText, { color: theme.colors.primary }]}>
                      Test Notification
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}
                    onPress={() => pushNotifications.sendRobotNotification('cleaning_complete', { duration: 1800, areaCovered: 45 })}
                    disabled={!pushNotifications.isInitialized}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color={theme.colors.success}
                    />
                    <Text style={[styles.testButtonText, { color: theme.colors.success }]}>
                      Test Complete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Device Information */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Card glassmorphism style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="robot-vacuum"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Device Information
                </Text>
              </View>

              <View style={styles.deviceInfo}>
                {Object.entries(preferences.device).map(([key, value]) => (
                  <View key={key} style={styles.deviceInfoItem}>
                    <Text style={[styles.deviceInfoLabel, { color: theme.colors.textSecondary }]}>
                      {key === 'name' && 'Device Name'}
                      {key === 'model' && 'Model'}
                      {key === 'firmwareVersion' && 'Firmware Version'}
                      {key === 'serialNumber' && 'Serial Number'}
                    </Text>
                    <Text style={[styles.deviceInfoValue, { color: theme.colors.text }]}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>

          {/* About & Storage */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Card glassmorphism style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  About & Storage
                </Text>
              </View>

              <View style={styles.aboutInfo}>
                <View style={styles.aboutItem}>
                  <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
                    App Version
                  </Text>
                  <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
                    1.0.0
                  </Text>
                </View>

                <View style={styles.aboutItem}>
                  <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
                    Storage Used
                  </Text>
                  <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
                    {formatStorageSize(storageInfo.size)}
                  </Text>
                </View>

                <View style={styles.aboutItem}>
                  <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
                    Data Files
                  </Text>
                  <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
                    {storageInfo.keys.length} files
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.clearDataButton, { borderColor: theme.colors.error }]}
                  onPress={handleClearData}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text style={[styles.clearDataText, { color: theme.colors.error }]}>
                    Clear All Data
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 120,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  wifiInfo: {
    gap: 16,
  },
  wifiStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wifiDetails: {
    flex: 1,
  },
  wifiSSID: {
    fontSize: 16,
    fontWeight: '600',
  },
  wifiMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  signalStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  reconnectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  notificationDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  deviceInfo: {
    gap: 12,
  },
  deviceInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  deviceInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  aboutInfo: {
    gap: 16,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
  },
  clearDataText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pushNotificationInfo: {
    gap: 16,
  },
  pushStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pushStatusInfo: {
    flex: 1,
  },
  pushStatusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pushStatusMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  permissionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenSection: {
    gap: 8,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  tokenText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorSection: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  testButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});