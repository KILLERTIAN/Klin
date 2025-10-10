import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

export const navigationUtils = {
  /**
   * Navigate to a tab with haptic feedback and smooth animation
   */
  navigateToTab: (tabName: string, withHaptics = true) => {
    if (withHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(tabs)/${tabName}` as any);
  },

  /**
   * Navigate to home screen
   */
  goHome: () => {
    navigationUtils.navigateToTab('index');
  },

  /**
   * Navigate to map screen
   */
  goToMap: () => {
    navigationUtils.navigateToTab('map');
  },

  /**
   * Navigate to clean screen (FAB)
   */
  goToClean: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/explore');
  },

  /**
   * Navigate to history screen
   */
  goToHistory: () => {
    navigationUtils.navigateToTab('history');
  },

  /**
   * Navigate to settings screen
   */
  goToSettings: () => {
    navigationUtils.navigateToTab('settings');
  },

  /**
   * Show modal with parameters
   */
  showModal: (type: 'error' | 'success' | 'info', title: string, message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/modal',
      params: { type, title, message }
    });
  },

  /**
   * Go back with haptic feedback
   */
  goBack: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  },
};