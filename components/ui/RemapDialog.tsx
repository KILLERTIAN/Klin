import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

import { Card } from './Card';

interface RemapDialogProps {
  visible: boolean;
  onClose: () => void;
  onStartRemap: () => void;
  isRemapping?: boolean;
  progress?: number; // 0-100
}

export const RemapDialog: React.FC<RemapDialogProps> = ({
  visible,
  onClose,
  onStartRemap,
  isRemapping = false,
  progress = 0,
}) => {
  const { theme } = useTheme();
  const [showProgress, setShowProgress] = useState(false);

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const progressValue = useSharedValue(0);
  const scanAnimation = useSharedValue(0);

  // Modal animations
  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  // Progress animations
  useEffect(() => {
    if (isRemapping) {
      setShowProgress(true);
      progressValue.value = withTiming(progress / 100, { duration: 500 });
      
      // Scanning animation
      scanAnimation.value = withTiming(1, { duration: 2000 }, () => {
        scanAnimation.value = withTiming(0, { duration: 2000 });
      });
    } else {
      setShowProgress(false);
      progressValue.value = 0;
      scanAnimation.value = 0;
    }
  }, [isRemapping, progress]);

  // Handle start remap
  const handleStartRemap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartRemap();
  };

  // Handle close
  const handleClose = () => {
    if (!isRemapping) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    }
  };

  // Animated styles
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    )}%`,
  }));

  const scanAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scanAnimation.value,
      [0, 0.5, 1],
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    ),
    transform: [{
      scale: interpolate(
        scanAnimation.value,
        [0, 1],
        [1, 1.1],
        Extrapolate.CLAMP
      )
    }],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <Animated.View style={modalAnimatedStyle}>
          <Card
            glassmorphism
            style={{
              width: '100%',
              maxWidth: 400,
              padding: 24,
            }}
          >
            {!showProgress ? (
              // Initial dialog
              <>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: theme.colors.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <Text style={{
                      fontSize: 32,
                      color: theme.colors.primary,
                    }}>
                      🗺️
                    </Text>
                  </View>
                  
                  <Text style={[
                    theme.typography.h2,
                    { color: theme.colors.text, textAlign: 'center', marginBottom: 8 }
                  ]}>
                    Re-map Room
                  </Text>
                  
                  <Text style={[
                    theme.typography.body,
                    { color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 }
                  ]}>
                    This will create a new map of your space. The robot will systematically scan all accessible areas.
                  </Text>
                </View>

                <View style={{
                  backgroundColor: theme.colors.warning + '10',
                  borderRadius: theme.borderRadius.small,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: theme.colors.warning + '30',
                }}>
                  <Text style={[
                    theme.typography.caption,
                    { color: theme.colors.warning, fontWeight: '600', marginBottom: 4 }
                  ]}>
                    ⚠️ Important Notes:
                  </Text>
                  <Text style={[
                    theme.typography.caption,
                    { color: theme.colors.textSecondary, lineHeight: 18 }
                  ]}>
                    • Ensure all doors are open{'\n'}
                    • Remove obstacles from the floor{'\n'}
                    • Process takes 15-30 minutes{'\n'}
                    • Current map will be replaced
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                }}>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.surface,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleStartRemap}
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.primary,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                      Start Mapping
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Progress dialog
              <>
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                  <Animated.View style={[
                    {
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 20,
                      borderWidth: 3,
                      borderColor: theme.colors.primary + '40',
                    },
                    scanAnimatedStyle
                  ]}>
                    <Text style={{
                      fontSize: 40,
                      color: theme.colors.primary,
                    }}>
                      🤖
                    </Text>
                  </Animated.View>
                  
                  <Text style={[
                    theme.typography.h2,
                    { color: theme.colors.text, textAlign: 'center', marginBottom: 8 }
                  ]}>
                    Mapping in Progress
                  </Text>
                  
                  <Text style={[
                    theme.typography.body,
                    { color: theme.colors.textSecondary, textAlign: 'center' }
                  ]}>
                    Klin is scanning your space...
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={{
                  backgroundColor: theme.colors.surface + '60',
                  height: 8,
                  borderRadius: 4,
                  marginBottom: 16,
                  overflow: 'hidden',
                }}>
                  <Animated.View style={[
                    {
                      height: '100%',
                      backgroundColor: theme.colors.primary,
                      borderRadius: 4,
                    },
                    progressAnimatedStyle
                  ]} />
                </View>

                {/* Progress Text */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                }}>
                  <Text style={[
                    theme.typography.caption,
                    { color: theme.colors.textSecondary }
                  ]}>
                    Progress
                  </Text>
                  <Text style={[
                    theme.typography.caption,
                    { color: theme.colors.primary, fontWeight: '600' }
                  ]}>
                    {Math.round(progress)}%
                  </Text>
                </View>

                {/* Status Messages */}
                <View style={{
                  backgroundColor: theme.colors.primary + '10',
                  borderRadius: theme.borderRadius.small,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: theme.colors.primary + '30',
                }}>
                  <Text style={[
                    theme.typography.caption,
                    { color: theme.colors.primary, fontWeight: '600', marginBottom: 4 }
                  ]}>
                    Current Status:
                  </Text>
                  <Text style={[
                    theme.typography.caption,
                    { color: theme.colors.textSecondary }
                  ]}>
                    {progress < 25 ? 'Initializing sensors and navigation...' :
                     progress < 50 ? 'Scanning main areas...' :
                     progress < 75 ? 'Mapping room boundaries...' :
                     progress < 95 ? 'Finalizing map details...' :
                     'Completing mapping process...'}
                  </Text>
                </View>

                {/* Cancel Button (disabled during mapping) */}
                <TouchableOpacity
                  disabled={true}
                  style={{
                    backgroundColor: theme.colors.surface,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: 0.5,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
                    Mapping in Progress...
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
};