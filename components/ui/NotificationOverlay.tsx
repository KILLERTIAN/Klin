import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationBanner } from './NotificationBanner';

export const NotificationOverlay: React.FC = () => {
  const { state, dismiss } = useNotifications();

  if (!state.activeNotification) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <NotificationBanner
        notification={state.activeNotification}
        onDismiss={dismiss}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});