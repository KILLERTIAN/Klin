import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';

export class BluetoothService {
  private manager: BleManager;
  private device: Device | null = null;
  private isConnected = false;

  constructor() {
    this.manager = new BleManager();
    console.log('Bluetooth service initialized');
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        // Check Android API level to determine which permissions to request
        const androidVersion = Platform.Version;
        console.log('Android API level:', androidVersion);

        let permissions: string[] = [];
        
        if (androidVersion >= 31) {
          // Android 12+ (API 31+) - requires new Bluetooth permissions
          permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        } else {
          // Android 11 and below - use legacy permissions
          permissions = [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ];
        }

        console.log('Requesting permissions:', permissions);

        const granted = await PermissionsAndroid.requestMultiple(permissions as any);
        console.log('Permission results:', granted);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          const deniedPermissions = Object.entries(granted)
            .filter(([_, status]) => status !== PermissionsAndroid.RESULTS.GRANTED)
            .map(([permission, _]) => permission.split('.').pop());
          
          console.warn('Denied Bluetooth permissions:', deniedPermissions);
          
          Alert.alert(
            'Bluetooth Permissions Required',
            `This app needs the following permissions to connect to your robot:\n\n${deniedPermissions.join('\n')}\n\nPlease grant all permissions to continue. You can also enable them manually in Settings > Apps > Klin > Permissions.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => {
                // Note: Opening settings requires additional setup
                console.log('User requested to open settings');
              }}
            ]
          );
        }

        return allGranted;
      } catch (error) {
        console.error('Permission request error:', error);
        Alert.alert(
          'Permission Error',
          'Failed to request Bluetooth permissions. This might be due to device restrictions or system settings. Please check your device settings manually.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    
    // iOS permissions are handled automatically by the system when BLE is accessed
    return true;
  }

  async checkPermissionStatus(): Promise<{ hasPermissions: boolean; missingPermissions: string[] }> {
    if (Platform.OS !== 'android') {
      return { hasPermissions: true, missingPermissions: [] };
    }

    const androidVersion = Platform.Version;
    let permissions: string[] = [];
    
    if (androidVersion >= 31) {
      permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
    } else {
      permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];
    }

    const missingPermissions: string[] = [];
    
    for (const permission of permissions) {
      const result = await PermissionsAndroid.check(permission as any);
      if (!result) {
        missingPermissions.push(permission.split('.').pop() || permission);
      }
    }

    return {
      hasPermissions: missingPermissions.length === 0,
      missingPermissions
    };
  }

  async initialize(): Promise<boolean> {
    try {
      // First check if we already have permissions
      const permissionStatus = await this.checkPermissionStatus();
      
      if (!permissionStatus.hasPermissions) {
        console.log('Missing permissions:', permissionStatus.missingPermissions);
        const hasPermissions = await this.requestPermissions();
        if (!hasPermissions) {
          throw new Error('Bluetooth permissions not granted');
        }
      } else {
        console.log('All Bluetooth permissions already granted');
      }

      const state = await this.manager.state();
      console.log('Bluetooth state:', state);

      if (state !== State.PoweredOn) {
        let message = 'Please turn on Bluetooth to connect to your robot.';
        let title = 'Bluetooth Not Available';
        
        switch (state) {
          case State.PoweredOff:
            message = 'Bluetooth is turned off. Please enable Bluetooth in your device settings.';
            title = 'Bluetooth Disabled';
            break;
          case State.Unauthorized:
            message = 'Bluetooth access is not authorized. Please check your app permissions.';
            title = 'Bluetooth Unauthorized';
            break;
          case State.Unsupported:
            message = 'This device does not support Bluetooth Low Energy.';
            title = 'Bluetooth Not Supported';
            break;
          case State.Unknown:
            message = 'Bluetooth state is unknown. Please restart the app and try again.';
            title = 'Bluetooth State Unknown';
            break;
        }

        Alert.alert(title, message, [{ text: 'OK' }]);
        throw new Error(`Bluetooth is not available. Current state: ${state}`);
      }

      console.log('Bluetooth initialized successfully');
      return true;
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
      throw error;
    }
  }

  async scanForDevices(onDeviceFound: (device: Device) => void): Promise<void> {
    try {
      console.log('Starting Bluetooth scan...');
      await this.initialize();
      
      // Clear any previous scan
      this.manager.stopDeviceScan();
      
      const foundDevices = new Set<string>();

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          Alert.alert(
            'Scan Error',
            'Failed to scan for Bluetooth devices. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        }

        if (device && device.name && !foundDevices.has(device.id)) {
          foundDevices.add(device.id);
          console.log('Found device:', device.name, device.id);
          
          // Call the callback for any device with a name
          // You can add filtering logic here if needed
          onDeviceFound(device);
        }
      });

      // Stop scanning after 15 seconds
      setTimeout(() => {
        console.log('Stopping Bluetooth scan');
        this.manager.stopDeviceScan();
      }, 15000);

    } catch (error) {
      console.error('Failed to start scan:', error);
      Alert.alert(
        'Scan Failed',
        'Could not start Bluetooth scan. Please check your permissions and try again.',
        [{ text: 'OK' }]
      );
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      console.log('Connecting to device:', deviceId);
      
      // Stop any ongoing scan
      this.manager.stopDeviceScan();
      
      // Connect to the device
      this.device = await this.manager.connectToDevice(deviceId);
      console.log('Connected to device:', this.device.name || deviceId);
      
      // Discover services and characteristics
      await this.device.discoverAllServicesAndCharacteristics();
      console.log('Services and characteristics discovered');
      
      this.isConnected = true;
      
      // Set up disconnect listener
      this.device.onDisconnected((error, device) => {
        console.log('Device disconnected:', device?.name || deviceId);
        if (error) {
          console.error('Disconnect error:', error);
        }
        this.isConnected = false;
        this.device = null;
      });

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Failed',
        `Failed to connect to the device. Please make sure the device is nearby and try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  async sendCommand(command: string): Promise<boolean> {
    if (!this.device || !this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      console.log(`Sending command: ${command}`);
      
      // Get services
      const services = await this.device.services();
      console.log('Available services:', services.length);
      
      if (services.length === 0) {
        throw new Error('No services found on device');
      }

      // Use the first service (you may need to find the correct service UUID)
      const service = services[0];
      const characteristics = await service.characteristics();
      console.log('Available characteristics:', characteristics.length);

      // Find a writable characteristic
      const writeCharacteristic = characteristics.find(char => 
        char.isWritableWithResponse || char.isWritableWithoutResponse
      );

      if (!writeCharacteristic) {
        throw new Error('No writable characteristic found');
      }

      // Convert command to base64
      const commandBuffer = Buffer.from(command, 'utf8');
      const base64Command = commandBuffer.toString('base64');

      // Write the command
      if (writeCharacteristic.isWritableWithResponse) {
        await writeCharacteristic.writeWithResponse(base64Command);
      } else {
        await writeCharacteristic.writeWithoutResponse(base64Command);
      }

      console.log('Command sent successfully');
      return true;
    } catch (error) {
      console.error('Send command error:', error);
      Alert.alert(
        'Command Failed',
        `Failed to send command to the robot.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        console.log('Disconnecting from device...');
        await this.device.cancelConnection();
        console.log('Device disconnected successfully');
      } catch (error) {
        console.error('Disconnect error:', error);
      } finally {
        this.device = null;
        this.isConnected = false;
      }
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConnectedDevice(): Device | null {
    return this.device;
  }

  async getBluetoothState(): Promise<State> {
    return await this.manager.state();
  }

  destroy(): void {
    try {
      this.manager.stopDeviceScan();
      if (this.device) {
        this.device.cancelConnection();
      }
      this.manager.destroy();
      console.log('Bluetooth service destroyed');
    } catch (error) {
      console.error('Destroy error:', error);
    }
  }
}

export const bluetoothService = new BluetoothService();