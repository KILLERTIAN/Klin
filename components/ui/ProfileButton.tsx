import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ProfileButtonProps {
  style?: any;
  userName?: string;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ style, userName = 'User' }) => {
  const { theme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowProfile(true);
  };

  const handleClose = () => {
    setShowProfile(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    avatarText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
      minHeight: 200,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginVertical: 4,
      backgroundColor: theme.colors.surface,
    },
    menuIcon: {
      marginRight: 16,
    },
    menuText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.gradients.surface as [string, string, ...string[]]}
          style={styles.buttonGradient}
        >
          <Text style={styles.avatarText}>
            {getInitials(userName)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={showProfile}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={styles.modal}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile</Text>
              <Text style={styles.modalSubtitle}>Welcome, {userName}!</Text>
            </View>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={theme.colors.error}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: theme.colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};