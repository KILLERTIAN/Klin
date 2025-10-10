import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { storageService } from '../services/storage';

export default function SplashScreen() {
  const { theme } = useTheme();
  const [, setIsLoading] = useState(true);
  const logoScale = new Animated.Value(0.8);
  const logoOpacity = new Animated.Value(0);

  useEffect(() => {
    // Start logo animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Check onboarding status and navigate
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Wait for minimum splash duration
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isOnboardingCompleted = await storageService.isOnboardingCompleted();

      if (isOnboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // Default to onboarding if there's an error
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.gradients.primary as [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Logo and Branding */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Logo Icon */}
          <View style={[styles.logoIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MaterialCommunityIcons
              name="robot-vacuum"
              size={80}
              color="white"
            />
          </View>

          {/* Brand Name */}
          <Text style={styles.brandName}>Klin</Text>
          <Text style={styles.tagline}>Smart Home Cleaning</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: logoOpacity,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -1,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});