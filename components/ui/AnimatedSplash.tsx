import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

// Logo amarillo para el splash
const MiniLogoYellow = require('../../assets/mini-logo-yellow.svg');

interface AnimatedSplashProps {
  onComplete: () => void;
  isReady?: boolean;
}

export function AnimatedSplash({ onComplete, isReady = false }: AnimatedSplashProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const hasStartedExit = useRef(false);

  // Fade in immediately
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
  }, []);

  // When ready, simple fade out and complete
  useEffect(() => {
    if (!isReady || hasStartedExit.current) return;
    hasStartedExit.current = true;

    // Brief hold then fade out
    const timer = setTimeout(() => {
      opacity.value = withTiming(
        0,
        { duration: 300, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (finished) runOnJS(onComplete)();
        }
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [isReady]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }, animatedStyle]}>
      <Image
        source={MiniLogoYellow}
        style={styles.logo}
        contentFit="contain"
        priority="high"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});
