import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRobotState } from '../../hooks/useRobotState';
import { useTheme } from '../../hooks/useTheme';

interface ConnectionStatusProps {
  showQuickActions?: boolean;
  compact?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showQuickActions = false, 
  compact = false 
}) => {
  const { theme } = useTheme();
  const { 
    isConnected, 
    isApiConnected, 
    isBluetoothConnected, 
    state: robotState,
    scanForBluetoothDevices 
  } = useRobotState();

  const getConnectionStatus = () => {
    if (isBluetoothConnected) {
      return {
        status: 'Bluetooth Connected',
        color: theme.colors.success,
        icon: 'bluetooth' as const,
        description: 'Direct Bluetooth connection active'
      };
    } else if (isApiConnected) {
      return {
        status: 'WiFi Connected',
        color: theme.colors.success,
        icon: 'wifi' as const,
        description: 'Connected via WiFi network'
      };
    } else if (isConnected) {
      return {
        status: 'WebSocket Connected',
        color: theme.colors.warning,
        icon: 'globe' as const,
        description: 'Real-time connection active'
      };
    } else {
      return {
        status: 'Disconnected',
        color: theme.colors.error,
        icon: 'close-circle' as const,
        description: 'No active connection'
      };
    }
  };

  const connectionInfo = getConnectionStatus();

  const handleQuickConnect = async () => {
    if (!isBluetoothConnected && !isApiConnected) {
      // Try to scan for Bluetooth devices first
      try {
        await scanForBluetoothDevices();
      } catch (error) {
        console.error('Quick connect failed:', error);
      }
    }
  };

  const handleOpenSettings = () => {
    router.push('/(tabs)/settings');
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: connectionInfo.color + '20' }]}>
        <Ionicons 
          name={connectionInfo.icon} 
          size={16} 
          color={connectionInfo.color} 
        />
        <Text style={[styles.compactStatus, { color: connectionInfo.color }]}>
          {connectionInfo.status}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: connectionInfo.color + '30' }]}>
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={connectionInfo.icon} 
              size={24} 
              color={connectionInfo.color} 
            />
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              Connection Status
            </Text>
          </View>
          
          <View style={styles.statusDetails}>
            <View style={[styles.statusDot, { backgroundColor: connectionInfo.color }]} />
            <Text style={[styles.statusText, { color: connectionInfo.color }]}>
              {connectionInfo.status}
            </Text>
          </View>
          
          <Text style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
            {connectionInfo.description}
          </Text>
        </View>

        {robotState.connectivity.isOnline && (
          <View style={styles.signalStrength}>
            <Text style={[styles.signalText, { color: theme.colors.textSecondary }]}>
              Signal: {robotState.connectivity.signalStrength}%
            </Text>
            <View style={styles.signalBars}>
              {[1, 2, 3, 4].map((bar) => (
                <View
                  key={bar}
                  style={[
                    styles.signalBar,
                    {
                      backgroundColor: 
                        robotState.connectivity.signalStrength >= bar * 25
                          ? connectionInfo.color
                          : theme.colors.border,
                      height: bar * 3 + 6,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {showQuickActions && (
        <View style={styles.quickActions}>
          {!isBluetoothConnected && !isApiConnected && (
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleQuickConnect}
            >
              <Ionicons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Quick Connect</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.quickActionButton, { 
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: theme.colors.primary 
            }]}
            onPress={handleOpenSettings}
          >
            <Ionicons name="settings" size={16} color={theme.colors.primary} />
            <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  compactStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusInfo: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  signalStrength: {
    alignItems: 'center',
    gap: 4,
  },
  signalText: {
    fontSize: 10,
    fontWeight: '500',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});