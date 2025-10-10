import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { storageService } from '../services/storage';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Klin',
    subtitle: 'Your Smart Cleaning Companion',
    description: 'Experience the future of home cleaning with intelligent automation and premium control.',
    icon: 'robot-vacuum',
    color: '#4F8EF7',
  },
  {
    id: 'manual',
    title: 'Manual Control',
    subtitle: 'Direct Your Robot',
    description: 'Take full control with intuitive directional controls and customizable cleaning functions.',
    icon: 'gamepad-variant',
    color: '#A8E6CF',
  },
  {
    id: 'automatic',
    title: 'Automatic Mode',
    subtitle: 'Smart Cleaning Routines',
    description: 'Set up intelligent cleaning schedules and let Klin handle your home automatically.',
    icon: 'home-automation',
    color: '#FFB84D',
  },
  {
    id: 'mapping',
    title: 'Room Mapping',
    subtitle: 'Intelligent Navigation',
    description: 'Watch as Klin learns your home layout and creates detailed cleaning maps.',
    icon: 'map-outline',
    color: '#FF6B9D',
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const translateXRef = useRef(new Animated.Value(0));
  const translateX = translateXRef.current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Animate to next step
      Animated.timing(translateX, {
        toValue: -nextStep * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Show name input on last step
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowNameInput(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Animate to previous step
      Animated.timing(translateX, {
        toValue: -prevStep * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleComplete = async () => {
    try {
      // Save user preferences
      await storageService.saveUserPreferences({
        userName: userName.trim() || 'User',
        hasCompletedOnboarding: true,
        themeMode: 'system'
      });
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      // Navigate anyway
      router.replace('/(tabs)');
    }
  };

  const renderStep = (step: OnboardingStep) => (
    <View key={step.id} style={[styles.stepContainer, { width: screenWidth }]}>
      <View style={styles.contentContainer}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: step.color + '20' }]}>
          <MaterialCommunityIcons
            name={step.icon}
            size={80}
            color={step.color}
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {step.title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
            {step.subtitle}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {step.description}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderNameInput = () => (
    <Animated.View style={[styles.nameInputContainer, { opacity: fadeAnim }]}>
      <View style={styles.contentContainer}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <MaterialCommunityIcons
            name="account-circle"
            size={80}
            color={theme.colors.primary}
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            What's your name?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
            Personalize Your Experience
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Help us create a personalized cleaning experience just for you.
          </Text>
        </View>

        {/* Name Input */}
        <Card glassmorphism style={styles.inputCard}>
          <TextInput
            style={[styles.nameInput, { color: theme.colors.text }]}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textSecondary}
            value={userName}
            onChangeText={setUserName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleComplete}
          />
        </Card>
      </View>
    </Animated.View>
  );

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {onboardingSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            {
              backgroundColor: index === currentStep 
                ? theme.colors.primary 
                : theme.colors.border,
              width: index === currentStep ? 24 : 8,
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      
      <LinearGradient
        colors={theme.gradients.background as [string, string, ...string[]]}
        style={styles.gradient}
      >
        {/* Skip Button - Top Right */}
        {!showNameInput && (
          <Pressable
            style={styles.skipButton}
            onPress={handleComplete}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              Skip
            </Text>
          </Pressable>
        )}
        {/* Main Content */}
        <View style={styles.mainContent}>
          {showNameInput ? (
            renderNameInput()
          ) : (
            <Animated.View
              style={[
                styles.stepsContainer,
                {
                  transform: [{ translateX }],
                  width: screenWidth * onboardingSteps.length,
                }
              ]}
            >
              {onboardingSteps.map((step) => renderStep(step))}
            </Animated.View>
          )}
        </View>

        {/* Progress Indicator */}
        {!showNameInput && renderProgressIndicator()}

        {/* Navigation */}
        <SafeAreaView style={styles.navigationContainer} edges={['bottom']}>
          {/* Previous Button */}
          {currentStep > 0 && !showNameInput && (
            <Pressable
              style={[styles.navButton, styles.previousButton, { borderColor: theme.colors.border }]}
              onPress={handlePrevious}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
                Previous
              </Text>
            </Pressable>
          )}
          
          <View style={styles.spacer} />

          {/* Next/Continue Button */}
          {showNameInput ? (
            <Pressable
              style={[
                styles.navButton, 
                styles.primaryButton, 
                { backgroundColor: theme.colors.primary },
                !userName.trim() && { opacity: 0.5 }
              ]}
              onPress={handleComplete}
              disabled={!userName.trim()}
            >
              <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                Get Started
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.navButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNext}
            >
              <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                {currentStep === onboardingSteps.length - 1 ? "Continue" : "Next"}
              </Text>
            </Pressable>
          )}
        </SafeAreaView>

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
  stepsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  nameInputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  inputCard: {
    width: '100%',
    marginTop: 16,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    gap: 16,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});