import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated, Easing, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

// Conditionally import AnimatedMeshGradient only on iOS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AnimatedMeshGradient: React.ComponentType<any> | null = null;

if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    AnimatedMeshGradient = require('expo-ios-mesh-gradient').AnimatedMeshGradient;
  } catch {
    // Fallback silently if module not available
  }
}

interface MeshGradientBannerProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  height?: number;
  animated?: boolean;
  testID?: string;
}

/**
 * MeshGradientBanner - Beautiful animated mesh gradient background
 *
 * iOS: Uses expo-ios-mesh-gradient with native SwiftUI animation
 * Android/Web: Animated LinearGradient with flowing color effect
 *
 * Color scheme: Primary yellow (#ffd801) with amber/gold harmonics
 */
export function MeshGradientBanner({
  children,
  style,
  height = 180,
  animated = true,
  testID,
}: MeshGradientBannerProps) {
  const { colors, isDark } = useTheme();

  // Animation values for Android/Web fallback
  const animPhase1 = useRef(new Animated.Value(0)).current;
  const animPhase2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && Platform.OS !== 'ios') {
      // Phase 1: Slow color shift
      Animated.loop(
        Animated.timing(animPhase1, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        })
      ).start();

      // Phase 2: Faster subtle pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(animPhase2, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(animPhase2, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animated, animPhase1, animPhase2]);

  // iOS Mesh gradient colors - flowing ambient palette
  // Using more colors distributed to create a flowing effect
  const meshColors = isDark
    ? [
        '#ffd801', // primary yellow
        '#d4a600', // golden
        '#b38600', // dark gold
        '#1a1409', // very dark amber
        '#2d2106', // dark amber
        '#4a3a0a', // medium amber
      ]
    : [
        '#ffd801', // primary yellow
        '#ffe44d', // light yellow
        '#fbbf24', // amber-400
        '#fde68a', // amber-200
        '#fef3c7', // amber-100
        '#fff7ed', // orange-50
      ];

  // Animated interpolations for fallback gradient
  const gradientStart = animPhase1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '20%', '0%'],
  });

  const gradientOpacity = animPhase2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  // Render iOS animated mesh gradient
  if (Platform.OS === 'ios' && AnimatedMeshGradient) {
    return (
      <View testID={testID} style={[styles.container, { height }, style]}>
        <AnimatedMeshGradient
          style={StyleSheet.absoluteFill}
          columns={3}
          rows={3}
          colors={meshColors}
          smoothsColors
          animated={animated}
          animationSpeed={0.002}
          ignoresSafeArea={false}
        />
        {/* Subtle overlay for text contrast */}
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark
                ? 'rgba(0,0,0,0.25)'
                : 'rgba(255,255,255,0.2)'
            }
          ]}
        />
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  // Fallback for Android/Web - Multi-layer animated gradient
  const fallbackColors = isDark
    ? ['#09090b', '#1a1409', '#3d2f00', '#ffd801', '#3d2f00', '#1a1409', '#09090b'] as const
    : ['#fafafa', '#fef3c7', '#fde68a', '#ffd801', '#fde68a', '#fef3c7', '#fafafa'] as const;

  return (
    <View testID={testID} style={[styles.container, { height }, style]}>
      {/* Base gradient layer */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: gradientOpacity }]}>
        <LinearGradient
          colors={fallbackColors as unknown as readonly [string, string, ...string[]]}
          locations={[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Animated horizontal gradient for radial effect */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: gradientOpacity }]}>
        <LinearGradient
          colors={[
            isDark ? 'rgba(9,9,11,0.85)' : 'rgba(250,250,250,0.75)',
            'transparent',
            'transparent',
            isDark ? 'rgba(9,9,11,0.85)' : 'rgba(250,250,250,0.75)',
          ]}
          locations={[0, 0.25, 0.75, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Diagonal accent gradient for depth */}
      <LinearGradient
        colors={[
          'transparent',
          isDark ? 'rgba(255,216,1,0.15)' : 'rgba(255,216,1,0.2)',
          'transparent',
        ]}
        locations={[0.2, 0.5, 0.8]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle overlay for text contrast */}
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? 'rgba(0,0,0,0.15)'
              : 'rgba(255,255,255,0.1)'
          }
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});

export default MeshGradientBanner;
