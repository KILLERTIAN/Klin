import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface FunctionToggleUpDownProps {
    title: string;
    icon: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    onUp?: () => void;
    onDown?: () => void;
    disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FunctionToggleUpDown: React.FC<FunctionToggleUpDownProps> = ({
    title,
    icon,
    enabled,
    onToggle,
    onUp,
    onDown,
    disabled = false,
}) => {
    const { theme } = useTheme();

    const scale = useSharedValue(1);
    const toggleProgress = useSharedValue(enabled ? 1 : 0);
    const glowOpacity = useSharedValue(enabled ? 0.5 : 0);

    React.useEffect(() => {
        toggleProgress.value = withSpring(enabled ? 1 : 0, { damping: 15, stiffness: 200 });
        glowOpacity.value = withTiming(enabled ? 0.5 : 0, { duration: 300 });
    }, [enabled]);

    const handlePressIn = () => {
        if (disabled) return;
        scale.value = withSpring(0.96);
    };

    const handlePressOut = () => {
        if (disabled) return;
        scale.value = withSpring(1);
    };

    const handleMainPress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onToggle(!enabled);
    };

    const handleUp = () => {
        if (!enabled || disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onUp?.();
    };

    const handleDown = () => {
        if (!enabled || disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onDown?.();
    };

    // --- Animations ---
    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const animatedIconStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            toggleProgress.value,
            [0, 1],
            [theme.colors.textSecondary, theme.colors.primary],
        );
        return { color };
    });

    const animatedUpDownContainer = useAnimatedStyle(() => ({
        opacity: withTiming(enabled ? 1 : 0, { duration: 300 }),
        transform: [
            {
                translateY: withTiming(enabled ? 0 : 20, { duration: 300 }),
            },
        ],
    }));

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[styles.container, animatedCardStyle]}
        >
            {/* Glow */}
            <Animated.View
                style={[
                    styles.glowEffect,
                    { ...theme.shadows.glow, shadowColor: theme.colors.primary },
                    animatedGlowStyle,
                ]}
            />

            {/* Gradient Background */}
            <LinearGradient
                colors={theme.gradients.surface as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Glass Overlay */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: theme.glassmorphism.background,
                        borderWidth: 1,
                        borderColor: theme.glassmorphism.border,
                        borderRadius: theme.borderRadius.large,
                    },
                ]}
            />

            <View style={styles.content}>
                {/* Icon + Title (click to enable/disable) */}
                <Pressable onPress={handleMainPress} style={styles.iconTitleContainer}>
                    <Animated.View style={animatedIconStyle as any}>
                        <MaterialCommunityIcons
                            name={icon as any}
                            size={28}
                            color={enabled ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    </Animated.View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                </Pressable>

                {/* Up/Down Controls (only when enabled) */}
                <Animated.View style={[styles.upDownContainer, animatedUpDownContainer]}>
                    <Pressable onPress={handleUp} style={[styles.upDownButton, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="arrow-up" size={20} color="#fff" />
                    </Pressable>

                    <Pressable onPress={handleDown} style={[styles.upDownButton, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="arrow-down" size={20} color="#fff" />
                    </Pressable>
                </Animated.View>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 140,
    },
    glowEffect: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 20,
    },
    content: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        zIndex: 2,
    },
    iconTitleContainer: {
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    upDownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 16,
    },
    upDownButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
