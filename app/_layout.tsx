import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationOverlay } from '../components/ui/NotificationOverlay';
import { NotificationProvider } from '../contexts/NotificationContext';
import { RobotProvider } from '../contexts/RobotContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider>
          <RobotProvider>
            <NotificationProvider>
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
            </NotificationProvider>
          </RobotProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
