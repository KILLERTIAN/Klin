# Klin - Smart Robot Vacuum Control App

<div align="center">
  <img src="./assets/images/icon.png" alt="Klin Logo" width="120" height="120" />
  
  <h3>🤖 Control your robot vacuum with style</h3>
  
  [![Expo](https://img.shields.io/badge/Expo-SDK%2054-blue.svg)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-green.svg)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📱 Download

### Android
**Latest Build**: [Download APK](https://expo.dev/accounts/killertian/projects/klin/builds/a01300f2-0e76-497d-a8b5-b81a8800e4f5)

> **Note**: This is a development build with full Bluetooth Low Energy support. You may need to enable "Install from Unknown Sources" in your Android settings.

### iOS
Coming soon! iOS build will be available on TestFlight.

## ✨ Features

### 🎮 **Robot Control**
- **Manual Control**: Direct robot movement with intuitive directional pad
- **Automatic Mode**: Smart room-by-room cleaning with customizable intensity
- **Real-time Status**: Live battery, position, and cleaning progress updates
- **Function Toggles**: Control water dispenser, mopping, brooming, and vacuum functions

### 📡 **Connectivity**
- **Bluetooth Low Energy**: Direct device connection for instant control
- **WiFi Integration**: Network-based control and monitoring
- **WebSocket Support**: Real-time status updates and notifications
- **Offline Mode**: Basic functionality when disconnected

### 🗺️ **Smart Mapping**
- **Interactive Maps**: Visual representation of cleaning areas
- **Room Selection**: Choose specific rooms for targeted cleaning
- **Obstacle Detection**: Real-time obstacle mapping and avoidance
- **Cleaning History**: Track completed cleaning sessions

### 🔔 **Notifications**
- **Smart Alerts**: Cleaning complete, low battery, and error notifications
- **Progress Updates**: Real-time cleaning progress and status changes
- **Maintenance Reminders**: Filter and brush replacement notifications
- **Connection Status**: WiFi and Bluetooth connection alerts

### 🎨 **Beautiful UI**
- **Modern Design**: Glassmorphism effects and smooth animations
- **Dark/Light Themes**: Automatic system theme detection
- **Responsive Layout**: Optimized for phones and tablets
- **Accessibility**: Full screen reader and keyboard navigation support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/killertian/klin.git
   cd klin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

### Development Builds

For full Bluetooth functionality, you need to create a development build:

#### Android Development Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile development
```

#### iOS Development Build
```bash
# Build for iOS (requires macOS)
eas build --platform ios --profile development
```

## 📱 Usage

### First Time Setup
1. **Download and install** the APK from the link above
2. **Grant permissions** when prompted (Bluetooth, Location)
3. **Connect your robot** via Settings → Bluetooth Connection
4. **Start cleaning** from the home screen

### Connecting Your Robot
1. Navigate to **Settings** tab
2. Tap **Bluetooth Connection** section
3. Tap **"Scan for Devices"**
4. Select your robot from the list
5. Wait for connection confirmation

### Manual Control
1. Tap **"Manual Mode"** from home screen
2. Use the **directional pad** to move your robot
3. Toggle **cleaning functions** as needed
4. Monitor **battery and status** in real-time

### Automatic Cleaning
1. Tap **"Automatic Mode"** from home screen
2. **Select rooms** on the interactive map
3. Choose **cleaning intensity** (Low/Medium/High)
4. Tap **"Start Cleaning"** and monitor progress

## 🛠️ Technical Details

### Architecture
- **React Native** with Expo SDK 54
- **TypeScript** for type safety
- **Expo Router** for navigation
- **React Context** for state management
- **Reanimated 3** for smooth animations

### Bluetooth Integration
- **react-native-ble-plx** for Bluetooth Low Energy
- **Smart permissions** handling for Android 12+
- **Auto-reconnection** and error recovery
- **Command queuing** for reliable communication

### Supported Devices
- **Android 7.0+** (API level 24+)
- **iOS 13.0+** (coming soon)
- **Bluetooth 4.0+** required for robot connection

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=https://your-robot-api.com
EXPO_PUBLIC_WEBSOCKET_URL=wss://your-websocket-server.com
```

### Bluetooth Permissions
The app automatically handles Bluetooth permissions:
- **Android 12+**: BLUETOOTH_SCAN, BLUETOOTH_CONNECT, ACCESS_FINE_LOCATION
- **Android 11-**: ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
- **iOS**: Handled automatically by the system

## 📊 Project Structure

```
klin/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   ├── manual.tsx         # Manual control screen
│   └── automatic.tsx      # Automatic cleaning screen
├── components/            # Reusable UI components
│   └── ui/               # Core UI components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── services/             # API and Bluetooth services
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── assets/               # Images and static assets
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Bluetooth not working?**
- Ensure you're using the development build (not Expo Go)
- Check that Bluetooth is enabled on your device
- Grant all requested permissions

**Can't find my robot?**
- Make sure your robot is in pairing mode
- Check that your robot supports Bluetooth Low Energy
- Try moving closer to your robot

**App crashes on startup?**
- Clear app data and restart
- Ensure you have the latest version
- Check device compatibility (Android 7.0+)

### Get Help
- 📧 Email: support@klin-app.com
- 🐛 Issues: [GitHub Issues](https://github.com/killertian/klin/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/killertian/klin/discussions)

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **React Native Community** for the Bluetooth library
- **Design inspiration** from modern smart home apps
- **Beta testers** for their valuable feedback

---

<div align="center">
  <p>Made with ❤️ by the Klin Team</p>
  <p>
    <a href="https://expo.dev/accounts/killertian/projects/klin">View on Expo</a> •
    <a href="https://github.com/killertian/klin">GitHub</a> •
    <a href="mailto:support@klin-app.com">Contact</a>
  </p>
</div>