import { CircularProgress, MapPreview, StatusIndicator } from '@/components/ui';
import { FunctionToggleUpDown } from '@/components/ui/FunctionToggleUpDown';
import { JoyStick } from '@/components/ui/JoyStick';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Network from 'expo-network';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { DirectionalPad } from '../components/ui/DirectionalPad';
import { FunctionToggle } from '../components/ui/FunctionToggle';
import { useRobotState } from '../hooks/useRobotState';
import { useTheme } from '../hooks/useTheme';

export default function ManualScreen() {
    const { theme } = useTheme();
    const [BASE_URL, setBaseUrl] = useState('http://192.168.29.35:5000');
    const [localIP, setLocalIP] = useState('');
    const { state: robotState, moveRobot, toggleFunction, startManualControl } = useRobotState();
    const [waterEnabled, setWaterEnabled] = useState(false);
    const [moppingEnabled, setMoppingEnabled] = useState(false);
    const [centreBroomEnabled, setCentreBroomEnabled] = useState(false);
    const [sideBroomEnabled, setSideBroomEnabled] = useState(false);
    const [vacuumEnabled, setVacuumEnabled] = useState(false);
    const [centreBrushEnabled, setCentreBrushEnabled] = useState(false);
    const [sideBrushEnabled, setsideBrushEnabled] = useState(false);
    const [status, setStatus] = useState('Idle');
    const [buttonPressed, setButtonPressed] = useState(false);
    const [controlMode, setControlMode] = useState<'joystick' | 'directional'>('joystick');
    const sendCommand = async (path: string) => {
        const url = `${BASE_URL}/${path}`.replace(/([^:]\/)\/+/g, "$1");
        try {
            const res = await fetch(url);
            const data = await res.json();
            setStatus(data.status || 'Command sent');
        } catch (error) {
            console.error(error);
            setStatus('Error');
        }
    };

    const updateBaseUrl = async () => {
        try {
            const ip = await Network.getIpAddressAsync();
            console.log('📡 Local IP:', ip);

            if (ip) {
                const newBaseUrl = `http://${ip}:5000`;
                setBaseUrl(newBaseUrl);
                setLocalIP(ip);
                setStatus(`Base URL updated to ${newBaseUrl}`);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                setStatus('Could not detect local IP');
            }
        } catch (error) {
            console.error('Error fetching IP:', error);
            setStatus('Error detecting IP')
        }
    };

    const stopCommand = async () => {
        try {
            const response = await fetch(`${BASE_URL}/stop/all`);
            const data = await response.json();
            console.log('Stop All Response:', data);
            setStatus(data.status || 'All systems stopped');
            setWaterEnabled(false);
            setVacuumEnabled(false);
            setCentreBroomEnabled(false);
            setSideBroomEnabled(false);
            setMoppingEnabled(false);
            setCentreBrushEnabled(false);
            setsideBrushEnabled(false);
        } catch (error) {
            console.error('Error stopping all:', error);
            setStatus('Error stopping all');
        }
    };

    const handlepower = async () => {
        await Haptics.impactAsync(
            buttonPressed
                ? Haptics.ImpactFeedbackStyle.Light
                : Haptics.ImpactFeedbackStyle.Medium
        );
        setButtonPressed(!buttonPressed);
        stopCommand();
    }

    const sendDirection = async (direction: 'forward' | 'backward' | 'left' | 'right' | 'stop') => {
        try {
            const response = await fetch(`${BASE_URL}/move/${direction}`);
            const data = await response.json();
            console.log('Response:', data);
        } catch (error) {
            console.error('Error sending command:', error);
        }
    };

    return (
        <LinearGradient colors={theme.mode === 'dark' ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#e3f2fd', '#bbdefb', '#90caf9']}
            style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()}
                            style={[styles.backButton, { backgroundColor: theme.colors.surface + '80' }]}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    {/* Manual IP Input */}
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ color: theme.colors.text, marginBottom: 6, fontWeight: '600' }}>
                            Manual Connection Configuration
                        </Text>

                        {/* Input field for hostname/IP + optional port */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            marginBottom: 10,
                            width: '90%',
                        }}>
                            <View style={{
                                backgroundColor: theme.colors.surface + '80',
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1,
                            }}>
                                <TextInput
                                    placeholder="Enter IP or hostname (e.g. raspberrypi.local:8000)"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    style={{
                                        flex: 1,
                                        color: theme.colors.text,
                                        height: 44,
                                        fontSize: 15,
                                    }}
                                    value={localIP}
                                    onChangeText={setLocalIP}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#4CAF50',
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 10,
                                }}
                                onPress={() => {
                                    if (localIP.trim() !== '') {
                                        // Ensure 'http://' is prefixed if not included
                                        let newBaseUrl = localIP.trim();
                                        if (!/^https?:\/\//i.test(newBaseUrl)) {
                                            newBaseUrl = `http://${newBaseUrl}`;
                                        }

                                        setBaseUrl(newBaseUrl);
                                        setStatus(`Base URL updated to ${newBaseUrl}`);
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    } else {
                                        setStatus('Please enter a valid hostname or IP');
                                    }
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>✅ Set</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Optional: Auto-detect local IP */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#007AFF',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 10,
                            }}
                            onPress={updateBaseUrl}
                        >
                            <Text style={{ color: 'white', fontWeight: '600' }}>🔄 Auto Detect Local IP</Text>
                        </TouchableOpacity>

                        {BASE_URL ? (
                            <Text style={{ marginTop: 5, color: theme.colors.textSecondary }}>
                                Current Base URL: {BASE_URL}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.modeSwitchContainer}>
                        <TouchableOpacity
                            style={[
                                styles.modeButton,
                                controlMode === 'joystick' && styles.activeModeButton,
                            ]}
                            onPress={() => setControlMode('joystick')}>
                            <Text
                                style={[
                                    styles.modeButtonText,
                                    { color: controlMode === 'joystick' ? '#fff' : theme.colors.text },
                                ]}>
                                🎮 Joystick
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.modeButton,
                                controlMode === 'directional' && styles.activeModeButton,
                            ]}
                            onPress={() => setControlMode('directional')}>
                            <Text
                                style={[
                                    styles.modeButtonText,
                                    { color: controlMode === 'directional' ? '#fff' : theme.colors.text },
                                ]}
                            >
                                ⬆️ D-Pad
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Card glassmorphism style={styles.controlCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {controlMode === 'joystick' ? 'Joystick Control' : 'Directional Control'}
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                            {controlMode === 'joystick'
                                ? 'Use the fascinating Joystick to move Klin'
                                : 'Use the directional pad to move Klin'}
                        </Text>
                        <View style={styles.padContainer}>
                            {controlMode === 'joystick' ? (
                                <JoyStick onDirectionPress={sendDirection} />
                            ) : (
                                <DirectionalPad onDirectionPress={sendDirection} size={200} />
                            )}
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
                                <FunctionToggle title="Water Dispenser"
                                    icon="water"
                                    enabled={waterEnabled}
                                    onToggle={(value) => {
                                        setWaterEnabled(value)
                                        sendCommand('toggle/pump')
                                    }} />
                            </View>
                            <View style={styles.functionItem}>
                                <FunctionToggle
                                    title="Vacuum"
                                    icon="vacuum"
                                    enabled={vacuumEnabled}
                                    onToggle={(value) => {
                                        setVacuumEnabled(value)
                                        sendCommand('toggle/vacuum')
                                    }}
                                />
                            </View>

                            <View style={styles.functionItem}>
                                <FunctionToggle
                                    title="Centre Broom"
                                    icon="brush"
                                    enabled={centreBroomEnabled}
                                    onToggle={(value) => {
                                        setCentreBroomEnabled(value)
                                        sendCommand('toggle/centre')
                                    }}
                                />
                            </View>
                            <View style={styles.functionItem}>
                                <FunctionToggle
                                    title="Side Broom"
                                    icon="brush"
                                    enabled={sideBroomEnabled}
                                    onToggle={(value) => {
                                        setSideBroomEnabled(value)
                                        sendCommand('toggle/side')
                                    }}
                                />
                            </View>
                            <View style={styles.functionItem}>
                                <FunctionToggleUpDown
                                    title="Mopping"
                                    icon="broom"
                                    enabled={moppingEnabled}
                                    onToggle={(value) => {
                                        setMoppingEnabled(value)
                                        sendCommand('toggle/mop')
                                    }}
                                    onUp={() => {
                                        sendCommand('mop/up');
                                    }}
                                    onDown={() => {
                                        sendCommand('mop/down');
                                    }}
                                />
                            </View>
                            <View style={styles.functionItem}>
                                <FunctionToggleUpDown
                                    title="Centre Brush"
                                    icon="water"
                                    enabled={centreBrushEnabled}
                                    onToggle={(newValue) => {
                                        setCentreBrushEnabled(newValue);
                                        sendCommand('toggle/centrebrush');
                                    }}
                                    onUp={() => {
                                        sendCommand('centrebrush/up');
                                    }}
                                    onDown={() => {
                                        sendCommand('centrebrush/down');
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    {/* Status and Map Preview */}
                    <View style={styles.statusCardContainer}>
                        {/* Overlapping Top Button */}
                        <TouchableOpacity
                            style={styles.topCenterButton}
                            onPress={handlepower}>
                            <Ionicons
                                name="power"
                                size={33}
                                color='white'
                            />
                        </TouchableOpacity>

                        {/* The Card */}
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
                        </Card>
                    </View>
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
    modeSwitchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginVertical: 12,
    },
    modeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#888',
        backgroundColor: 'transparent',
    },
    activeModeButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
    statusCardContainer: {
        alignItems: 'center',
        position: 'relative',
        marginTop: 7,
    },
    statusCard: {
        width: '90%',
        paddingTop: 50,
        overflow: 'hidden',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    topCenterButton: {
        position: 'absolute',
        top: 0,
        zIndex: 10,
        transform: [{ translateY: -25 }],
        backgroundColor: 'transparent',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f3c5c5ff',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    topCenterButtonText: {
        color: '#fff',
        fontWeight: '600',
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
        width: '48%',
    },
    functionItem1: {
        width: '48%',
        justifyContent: 'center',
        marginLeft: 97
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