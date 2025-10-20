import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationOverlay } from '../components/ui/NotificationOverlay';
import { NotificationProvider } from '../contexts/NotificationContext';
import { RobotProvider } from '../contexts/RobotContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useEffect } from 'react';

export const unstable_settings = {
  initialRouteName: 'index',
};

function AppContent() {
  const pushNotifications = usePushNotifications();

  useEffect(() => {
    // Log push token for testing
    if (pushNotifications.expoPushToken) {
      console.log('📱 Expo Push Token:', pushNotifications.expoPushToken);
    }
  }, [pushNotifications.expoPushToken]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Modal',
          }} 
        />
      </Stack>
      <NotificationOverlay />
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider>
          <RobotProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </RobotProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
