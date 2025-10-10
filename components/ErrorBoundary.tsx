import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to crash reporting service in production
    if (__DEV__) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReportError = () => {
    const { error } = this.state;
    if (error) {
      Alert.alert(
        'Report Error',
        'Would you like to report this error to help us improve the app?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Report',
            onPress: () => {
              // In a real app, send error to crash reporting service
              console.log('Reporting error:', error.message);
              Alert.alert('Thank you', 'Error report sent successfully.');
            },
          },
        ]
      );
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color="#FF3B30"
              style={styles.icon}
            />

            <Text style={styles.title}>Something went wrong</Text>

            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reportButton}
                onPress={this.handleReportError}
              >
                <Text style={styles.reportButtonText}>Report Issue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  errorDetails: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});