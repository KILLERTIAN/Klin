# Push Notifications Setup Guide

This guide explains how to use push notifications in your Klin Smart Home app and how to test them using Expo's push notification tool.

## 🚀 What's Implemented

### 1. **expo-notifications Integration**
- Full push notification support for iOS and Android
- Local and remote notification handling
- Background notification processing
- Notification channels for Android
- Badge count management

### 2. **Push Notification Service**
- `pushNotificationService.ts` - Core service for handling push notifications
- `usePushNotifications.ts` - React hook for managing push notification state
- Integration with existing notification system

### 3. **Features**
- ✅ Push token generation and management
- ✅ Permission handling
- ✅ Local notification scheduling
- ✅ Background notification handling
- ✅ Notification response handling
- ✅ Badge count updates
- ✅ Android notification channels
- ✅ Robot-specific notification templates

## 📱 How to Test Push Notifications

### Step 1: Get Your Push Token
1. Open the app on a physical device (push notifications don't work on simulators)
2. Go to **Settings** tab
3. Scroll down to the **Push Notifications** section
4. Copy the **Push Token** by tapping on it
5. The token will be copied to your clipboard

### Step 2: Use Expo's Push Notification Tool
1. Go to [https://expo.dev/notifications](https://expo.dev/notifications)
2. Paste your push token in the **"Expo push token from your app"** field
3. Fill in the notification details:
   - **Message title**: "Test from Expo Tool"
   - **Message body**: "This is a test notification!"
   - **Data (JSON string)**: `{"test": true, "action": "open_app"}`

### Step 3: Send the Notification
1. Click **"Send a Notification"**
2. You should receive the notification on your device
3. The notification will also appear in your app's notification system

## 🔧 Testing Different Notification Types

### Robot Cleaning Complete
```json
{
  "title": "Cleaning Complete! 🎉",
  "body": "Your robot has finished cleaning the living room",
  "data": {
    "type": "cleaning_complete",
    "duration": 1800,
    "areaCovered": 45,
    "action": "view_map"
  }
}
```

### Low Battery Warning
```json
{
  "title": "Low Battery Warning ⚠️",
  "body": "Robot battery is at 15%. Returning to dock.",
  "data": {
    "type": "low_battery",
    "batteryLevel": 15,
    "action": "view_robot"
  }
}
```

### Robot Stuck Alert
```json
{
  "title": "Robot Needs Help 🤖",
  "body": "Robot is stuck under the couch",
  "data": {
    "type": "robot_stuck",
    "location": "under the couch",
    "action": "view_map"
  }
}
```

### Error Notification
```json
{
  "title": "Robot Error ❌",
  "body": "Dustbin is full. Please empty it.",
  "data": {
    "type": "error",
    "errorMessage": "Dustbin is full",
    "action": "view_robot"
  }
}
```

## 🧪 In-App Testing

The app includes built-in test buttons in the Settings screen:

1. **Test Notification** - Sends a basic test notification
2. **Test Complete** - Sends a "cleaning complete" notification

## 📋 Configuration Details

### App Configuration (app.json)
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification-icon.png",
        "color": "#ffffff",
        "sounds": ["notification.wav"],
        "enableBackgroundRemoteNotifications": true
      }
    ]
  ]
}
```

### Android Notification Channels
- **default** - Standard notifications
- **urgent** - High priority notifications (errors, low battery)
- **robot_status** - Robot status updates

### iOS Configuration
- Background remote notifications enabled
- All notification permissions requested
- Badge count management

## 🔍 Troubleshooting

### No Push Token Generated
- Ensure you're using a physical device
- Check that notification permissions are granted
- Look for errors in the console logs

### Notifications Not Received
- Verify the push token is correct
- Check device notification settings
- Ensure the app has notification permissions
- Try sending a test notification from the app first

### Background Notifications Not Working
- Make sure `enableBackgroundRemoteNotifications` is true in app.json
- Rebuild the app after configuration changes
- Test with the app in background/closed state

## 🚀 Production Setup

For production use, you'll need to:

1. **Set up push notification credentials** in EAS
2. **Configure your backend** to send notifications using the Expo Push API
3. **Handle notification responses** for deep linking
4. **Implement notification preferences** in your backend

### Backend Integration Example
```javascript
// Send notification via Expo Push API
const message = {
  to: userPushToken,
  sound: 'default',
  title: 'Cleaning Complete!',
  body: 'Your robot finished cleaning',
  data: { type: 'cleaning_complete' },
};

await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
```

## 📚 Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notifications Setup Guide](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Push Notification Best Practices](https://docs.expo.dev/push-notifications/what-you-need-to-know/)

---

**Note**: Remember to test on physical devices only, as push notifications don't work on simulators or emulators.