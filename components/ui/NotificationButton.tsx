import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../hooks/useTheme';
import { NotificationBadge } from './NotificationBadge';
import { NotificationHistory } from './NotificationHistory';

interface NotificationButtonProps {
  style?: any;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({ style }) => {
  const { theme } = useTheme();
  const { getUnreadCount } = useNotifications();
  const [showHistory, setShowHistory] = useState(false);
  const unreadCount = getUnreadCount();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHistory(true);
  };

  const handleClose = () => {
    setShowHistory(false);
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    button: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonGradient: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.glassmorphism.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      zIndex: 1,
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      flex: 1,
      marginTop: 60,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {unreadCount > 0 && (
        <NotificationBadge
          style={styles.badge}
          size="small"
        />
      )}
      
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.gradients.surface as [string, string, ...string[]]}
          style={styles.buttonGradient}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color={unreadCount > 0 ? theme.colors.primary : theme.colors.textSecondary}
          />
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <NotificationHistory onClose={handleClose} />
          </View>
        </View>
      </Modal>
    </View>
  );
};