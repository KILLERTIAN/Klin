import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { useRobotState } from '../../hooks/useRobotState';
import { useTheme } from '../../hooks/useTheme';
import { Card } from './Card';

export const BluetoothConnection: React.FC = () => {
  const { theme } = useTheme();
  const { 
    isBluetoothConnected, 
    availableDevices, 
    scanForBluetoothDevices, 
    connectToBluetoothDevice, 
    disconnectBluetooth 
  } = useRobotState();
  const [isScanning, setIsScanning] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{
    hasPermissions: boolean;
    missingPermissions: string[];
  } | null>(null);

  const checkPermissions = async () => {
    try {
      // Import bluetoothService dynamically to check permissions
      const { bluetoothService } = await import('../../services/bluetoothService');
      const status = await bluetoothService.checkPermissionStatus();
      setPermissionStatus(status);
      return status.hasPermissions;
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return false;
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      // Check permissions first
      const hasPermissions = await checkPermissions();
      if (!hasPermissions && permissionStatus) {
        Alert.alert(
          'Permissions Required',
          `Missing permissions: ${permissionStatus.missingPermissions.join(', ')}\n\nPlease grant these permissions to scan for devices.`,
          [{ text: 'OK' }]
        );
        setIsScanning(false);
        return;
      }

      await scanForBluetoothDevices();
    } catch (error) {
      Alert.alert(
        'Scan Error', 
        'Failed to scan for Bluetooth devices. Please ensure Bluetooth is enabled and permissions are granted.',
        [{ text: 'OK' }]
      );
    } finally {
      setTimeout(() => setIsScanning(false), 15000); // Stop scanning indicator after 15s
    }
  };

  // Check permissions on component mount
  React.useEffect(() => {
    checkPermissions();
  }, []);

  const handleConnect = async (deviceId: string, deviceName: string) => {
    try {
      const success = await connectToBluetoothDevice(deviceId);
      if (success) {
        Alert.alert('Connected', `Successfully connected to ${deviceName}`);
      } else {
        Alert.alert('Connection Failed', `Failed to connect to ${deviceName}`);
      }
    } catch (error) {
      Alert.alert('Connection Error', 'An error occurred while connecting to the device.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBluetooth();
      Alert.alert('Disconnected', 'Bluetooth connection has been disconnected.');
    } catch (error) {
      Alert.alert('Disconnect Error', 'Failed to disconnect from the device.');
    }
  };

  const renderDevice = ({ item }: { item: Device }) => {
    const deviceName = item.name || item.localName || 'Unknown Device';
    const isConnectable = item.isConnectable !== false;
    
    return (
      <TouchableOpacity
        style={[
          styles.deviceItem, 
          { 
            backgroundColor: theme.colors.surface,
            opacity: isConnectable ? 1 : 0.6
          }
        ]}
        onPress={() => isConnectable && handleConnect(item.id, deviceName)}
        disabled={!isConnectable}
      >
        <View style={styles.deviceInfo}>
          <Ionicons 
            name="bluetooth" 
            size={24} 
            color={isConnectable ? theme.colors.primary : theme.colors.textSecondary} 
          />
          <View style={styles.deviceDetails}>
            <Text style={[styles.deviceName, { color: theme.colors.text }]}>
              {deviceName}
            </Text>
            <Text style={[styles.deviceId, { color: theme.colors.textSecondary }]}>
              {item.id}
            </Text>
            {item.rssi && (
              <Text style={[styles.deviceRssi, { color: theme.colors.textSecondary }]}>
                Signal: {item.rssi} dBm
              </Text>
            )}
            {!isConnectable && (
              <Text style={[styles.deviceStatus, { color: theme.colors.warning }]}>
                Not connectable
              </Text>
            )}
          </View>
        </View>
        {isConnectable && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Card glassmorphism style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="bluetooth" size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bluetooth Connection
          </Text>
        </View>
        
        {isBluetoothConnected && (
          <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.statusText, { color: theme.colors.success }]}>
              Connected
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        Connect to your robot via Bluetooth for direct control
      </Text>

      {permissionStatus && !permissionStatus.hasPermissions && (
        <View style={[styles.permissionWarning, { backgroundColor: theme.colors.warning + '20' }]}>
          <Ionicons name="warning" size={20} color={theme.colors.warning} />
          <View style={styles.permissionWarningText}>
            <Text style={[styles.permissionWarningTitle, { color: theme.colors.warning }]}>
              Permissions Required
            </Text>
            <Text style={[styles.permissionWarningDescription, { color: theme.colors.textSecondary }]}>
              Missing: {permissionStatus.missingPermissions.join(', ')}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        {!isBluetoothConnected ? (
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleScan}
            disabled={isScanning}
          >
            <Ionicons 
              name={isScanning ? "refresh" : "search"} 
              size={20} 
              color="#FFFFFF" 
              style={isScanning ? styles.spinning : undefined}
            />
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Scanning...' : 'Scan for Devices'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.disconnectButton, { backgroundColor: theme.colors.error }]}
            onPress={handleDisconnect}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <Text style={styles.disconnectButtonText}>
              Disconnect
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!isBluetoothConnected && (
        <View style={styles.devicesList}>
          <View style={styles.devicesHeader}>
            <Text style={[styles.devicesTitle, { color: theme.colors.text }]}>
              {availableDevices.length > 0 ? 'Available Devices' : 'No Devices Found'}
            </Text>
            {availableDevices.length > 0 && !isScanning && (
              <TouchableOpacity
                style={[styles.refreshButton, { borderColor: theme.colors.primary }]}
                onPress={handleScan}
              >
                <Ionicons name="refresh" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          {availableDevices.length > 0 ? (
            <FlatList
              data={availableDevices}
              renderItem={renderDevice}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : !isScanning && (
            <View style={styles.noDevicesContainer}>
              <Ionicons 
                name="bluetooth-outline" 
                size={48} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.noDevicesText, { color: theme.colors.textSecondary }]}>
                No Bluetooth devices found nearby
              </Text>
              <Text style={[styles.noDevicesHint, { color: theme.colors.textSecondary }]}>
                Make sure your robot is in pairing mode and nearby
              </Text>
            </View>
          )}
          
          {isScanning && (
            <View style={styles.scanningContainer}>
              <Ionicons 
                name="search" 
                size={24} 
                color={theme.colors.primary} 
                style={styles.scanningIcon}
              />
              <Text style={[styles.scanningText, { color: theme.colors.text }]}>
                Scanning for devices...
              </Text>
              <Text style={[styles.scanningHint, { color: theme.colors.textSecondary }]}>
                Found {availableDevices.length} device{availableDevices.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  controls: {
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spinning: {
    // Add rotation animation if needed
  },
  devicesList: {
    marginTop: 8,
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  devicesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDevicesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  noDevicesText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  noDevicesHint: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  scanningIcon: {
    // Add rotation animation if needed
  },
  scanningText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  scanningHint: {
    fontSize: 14,
    marginTop: 4,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  deviceId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  deviceRssi: {
    fontSize: 11,
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  permissionWarningText: {
    flex: 1,
  },
  permissionWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  permissionWarningDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});