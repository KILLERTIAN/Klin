import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface DirectionalPadProps {
    size?: number;
    onDirectionPress: (
        direction:
            | 'forward'
            | 'backward'
            | 'left'
            | 'right'
            | 'left_uturn'
            | 'right_uturn'
            | 'stop'
    ) => void;
}

export const JoyStick: React.FC<DirectionalPadProps> = ({
    size = 200,
    onDirectionPress,
}) => {
    const { theme } = useTheme();

    const knobX = useSharedValue(0);
    const knobY = useSharedValue(0);
    const radius = size / 2 - 40;

    const getDirection = (x: number, y: number) => {
        const threshold = radius * 0.4;
        if (Math.abs(x) < threshold && Math.abs(y) < threshold) return 'stop';

        const angle = (Math.atan2(y, x) * 180) / Math.PI;

        // 🔄 Diagonal bottom-left & bottom-right = U-turns
        if (angle > 120 && angle < 160) return 'left_uturn';   // bottom-left
        if (angle > 20 && angle < 60) return 'right_uturn';    // bottom-right

        // 🧭 Normal directions
        if (Math.abs(y) > Math.abs(x)) {
            return y < 0 ? 'forward' : 'backward';
        } else {
            return x < 0 ? 'left' : 'right';
        }
    };

    const handleGesture = (event: any) => {
        const { translationX, translationY } = event.nativeEvent;

        const distance = Math.sqrt(translationX ** 2 + translationY ** 2);
        const angle = Math.atan2(translationY, translationX);
        const limitedDistance = Math.min(distance, radius);

        const x = limitedDistance * Math.cos(angle);
        const y = limitedDistance * Math.sin(angle);

        knobX.value = x;
        knobY.value = y;

        const direction = getDirection(x, y);
        runOnJS(onDirectionPress)(direction);
    };

    const handleEnd = () => {
        knobX.value = withSpring(0, { damping: 15 });
        knobY.value = withSpring(0, { damping: 15 });
        runOnJS(onDirectionPress)('stop');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const animatedKnobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: knobX.value }, { translateY: knobY.value }],
    }));

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View
                style={[
                    styles.pad,
                    { width: size, height: size, borderColor: theme.colors.border },
                ]}
            >
                <PanGestureHandler
                    onGestureEvent={handleGesture as any}
                    onEnded={handleEnd}
                    onCancelled={handleEnd}
                >
                    <Animated.View
                        style={[
                            styles.knob,
                            {
                                backgroundColor: theme.colors.primary,
                                shadowColor: theme.colors.primary,
                            },
                            animatedKnobStyle,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="robot-vacuum"
                            size={32}
                            color={theme.dark ? '#fff' : '#000'}
                        />
                    </Animated.View>
                </PanGestureHandler>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pad: {
        borderRadius: 999,
        borderWidth: 2,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    knob: {
        width: 80,
        height: 80,
        borderRadius: 40,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 5,
    },
});
