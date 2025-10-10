import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    label?: string;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    glowEffect?: boolean;
    hapticFeedback?: boolean;
    style?: ViewStyle;
    labelStyle?: TextStyle;
}

export const Switch: React.FC<SwitchProps> = ({
    value,
    onValueChange,
    label,
    disabled = false,
    size = 'medium',
    glowEffect = true,
    hapticFeedback = true,
    style,
    labelStyle
}) => {
    const { theme } = useTheme();

    // Animation values
    const switchAnimation = useSharedValue(value ? 1 : 0);
    const glowOpacity = useSharedValue(value && glowEffect ? 0.4 : 0);
    const scale = useSharedValue(1);

    React.useEffect(() => {
        switchAnimation.value = withSpring(value ? 1 : 0, {
            damping: 15,
            stiffness: 200
        });

        if (glowEffect) {
            glowOpacity.value = withTiming(value ? 0.4 : 0, { duration: 200 });
        }
    }, [value, glowEffect]);

    const handlePress = () => {
        if (disabled) return;

        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        onValueChange(!value);
    };

    const handlePressIn = () => {
        if (disabled) return;
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        if (disabled) return;
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    // Size configurations
    const sizeConfig = {
        small: {
            width: 40,
            height: 24,
            thumbSize: 18,
            padding: 3
        },
        medium: {
            width: 50,
            height: 30,
            thumbSize: 24,
            padding: 3
        },
        large: {
            width: 60,
            height: 36,
            thumbSize: 30,
            padding: 3
        }
    };

    const config = sizeConfig[size];

    // Animated styles
    const animatedSwitchStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            switchAnimation.value,
            [0, 1],
            [theme.colors.border, theme.colors.primary]
        );

        return {
            backgroundColor,
            transform: [{ scale: scale.value }],
        };
    });

    const animatedThumbStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            switchAnimation.value,
            [0, 1],
            [0, config.width - config.thumbSize - config.padding * 2]
        );

        return {
            transform: [{ translateX }],
        };
    });

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const getSwitchStyle = (): ViewStyle => ({
        width: config.width,
        height: config.height,
        borderRadius: config.height / 2,
        padding: config.padding,
        justifyContent: 'center',
        position: 'relative',
        opacity: disabled ? 0.5 : 1,
    });

    const getThumbStyle = (): ViewStyle => ({
        width: config.thumbSize,
        height: config.thumbSize,
        borderRadius: config.thumbSize / 2,
        backgroundColor: '#FFFFFF',
        ...theme.shadows.small,
    });

    return (
        <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
            {label && (
                <Text style={[
                    {
                        marginRight: 12,
                        fontSize: 16,
                        color: theme.colors.text,
                        fontWeight: '500'
                    },
                    labelStyle
                ]}>
                    {label}
                </Text>
            )}

            <View style={{ position: 'relative' }}>
                {/* Glow effect */}
                {glowEffect && (
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                top: -4,
                                left: -4,
                                right: -4,
                                bottom: -4,
                                borderRadius: (config.height + 8) / 2,
                                ...theme.shadows.glow,
                            },
                            animatedGlowStyle,
                        ]}
                    />
                )}

                <TouchableOpacity
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={disabled}
                    activeOpacity={1}
                >
                    <Animated.View style={[getSwitchStyle(), animatedSwitchStyle]}>
                        {/* Gradient overlay for active state */}
                        {value && (
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.accent] as [string, string, ...string[]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: config.height / 2,
                                }}
                            />
                        )}

                        {/* Thumb */}
                        <Animated.View style={[getThumbStyle(), animatedThumbStyle]} />
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </View>
    );
};