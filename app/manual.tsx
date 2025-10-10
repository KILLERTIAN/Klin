import { CircularProgress, MapPreview, StatusIndicator } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../components/ui/Card';
import { DirectionalPad } from '../components/ui/DirectionalPad';
import { FunctionToggle } from '../components/ui/FunctionToggle';
import { useRobotState } from '../hooks/useRobotState';
import { useTheme } from '../hooks/useTheme';

export default function ManualScreen() {
    const { theme } = useTheme();
    const { state: robotState, moveRobot, toggleFunction, startManualControl } = useRobotState();

    const handleDirectionPress = async (direction: 'forward' | 'backward' | 'left' | 'right') => {
        try {
            await moveRobot(direction);
        } catch (error) {
            console.error('Failed to move robot:', error);
        }
    };

    const handleFunctionToggle = async (functionName: keyof typeof robotState.capabilities, enabled: boolean) => {
        try {
            await toggleFunction(functionName, enabled);
        } catch (error) {
            console.error(`Failed to toggle ${functionName}:`, error);
        }
    };

    const handleStartManualCleaning = async () => {
        try {
            await startManualControl();
        } catch (error) {
            console.error('Failed to start manual cleaning:', error);
        }
    };

    return (
        <LinearGradient
            colors={theme.mode === 'dark' ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#e3f2fd', '#bbdefb', '#90caf9']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            style={[styles.backButton, { backgroundColor: theme.colors.surface + '80' }]}
                        >
                            <Ionicons 
                                name="arrow-back" 
                                size={24} 
                                color={theme.colors.text} 
                            />
                        </TouchableOpacity>
                        <View style={styles.headerTitles}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                Manual Control
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                Direct robot movement and functions
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Direction Control */}
                    <Card glassmorphism style={styles.controlCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Direction Control
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                            Use the directional pad to move Klin
                        </Text>

                        <View style={styles.padContainer}>
                            <DirectionalPad
                                onDirectionPress={handleDirectionPress}
                                size={200}
                            />
                        </View>
                    </Card>

                    {/* Function Controls */}
                    <View style={styles.functionsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Function Controls
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                            Enable or disable cleaning functions
                        </Text>

                        <View style={styles.functionsGrid}>
                            <View style={styles.functionItem}>
                                <FunctionToggle
                                    title="Water Dispenser"
                                    icon="water"
                                    enabled={robotState.capabilities.waterDispenser}
                                    onToggle={(enabled) => handleFunctionToggle('waterDispenser', enabled)}
                                />
                            </View>

                            <View style={styles.functionItem}>
                                <FunctionToggle
                                    title="Mopping"
                                    icon="broom"
                                    enabled={robotState.capabilities.mopping}
                                    onToggle={(enabled) => handleFunctionToggle('mopping', enabled)}
                                />
                            </View>

                            <View style={styles.functionItem}>
                                <FunctionToggle
                                    title="Brooming"
                                    icon="brush"
                                    enabled={robotState.capabilities.brooming}
                                    onToggle={(enabled) => handleFunctionToggle('brooming', enabled)}
                                />
                            </View>

                            <View style={styles.functionItem}>
                                <FunctionToggle
                                    title="Vacuum"
                                    icon="vacuum"
                                    enabled={robotState.capabilities.vacuum}
                                    onToggle={(enabled) => handleFunctionToggle('vacuum', enabled)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Status and Map Preview */}
                    <Card glassmorphism style={styles.statusCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Status & Location
                        </Text>

                        <View style={styles.statusContent}>
                            {/* Map Preview */}
                            <View style={styles.mapSection}>
                                <MapPreview
                                    robotPosition={robotState.position}
                                    size={100}
                                />
                            </View>

                            {/* Status Info */}
                            <View style={styles.statusInfo}>
                                <View style={styles.statusRow}>
                                    <StatusIndicator
                                        status={robotState.status}
                                        label="Status"
                                    />
                                </View>

                                <View style={styles.statusRow}>
                                    <CircularProgress
                                        progress={robotState.battery.percentage}
                                        size={40}
                                        strokeWidth={4}
                                        color={theme.colors.success}
                                    />
                                    <View style={styles.batteryInfo}>
                                        <Text style={[styles.batteryText, { color: theme.colors.text }]}>
                                            {robotState.battery.percentage}%
                                        </Text>
                                        <Text style={[styles.batteryLabel, { color: theme.colors.textSecondary }]}>
                                            Battery
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Start Manual Cleaning Button */}
                        <TouchableOpacity
                            onPress={handleStartManualCleaning}
                            style={[styles.startButton, { opacity: robotState.status === 'cleaning' ? 0.5 : 1 }]}
                            disabled={robotState.status === 'cleaning'}
                        >
                            <Text style={styles.startButtonText}>Start Manual Cleaning</Text>
                        </TouchableOpacity>
                    </Card>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 20 : 16,
        paddingBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
    },
    headerTitles: {
        flex: 1,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: -0.8,
        marginBottom: 4,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
        }),
    },
    subtitle: {
        fontSize: 17,
        fontWeight: '400',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
        }),
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 100 : 90,
    },
    controlCard: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 16,
        marginBottom: 24,
    },
    functionsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
        }),
    },
    sectionSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: 24,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
        }),
    },
    padContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    functionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    functionItem: {
        width: '48%', // Two items per row with gap
    },
    statusCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 20,
    },
    mapSection: {
        alignItems: 'center',
    },
    statusInfo: {
        flex: 1,
        gap: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    batteryInfo: {
        alignItems: 'flex-start',
    },
    batteryText: {
        fontSize: 16,
        fontWeight: '600',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
        }),
    },
    batteryLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
        }),
    },
    startButton: {
        marginTop: 8,
        backgroundColor: '#4F8EF7',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});