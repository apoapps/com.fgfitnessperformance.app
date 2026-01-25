import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

// Logo amarillo para el splash
const MiniLogoYellow = require('../../assets/mini-logo-yellow.svg');

interface AnimatedSplashProps {
  onComplete: () => void;
  isReady?: boolean; // Indica si el app está cargado
}

export function AnimatedSplash({ onComplete, isReady = false }: AnimatedSplashProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1); // Empieza grande (tamaño completo)
  const bgScale = useSharedValue(0); // Para el fondo amarillo que crece

  useEffect(() => {
    // Fase 1: Fade in rápido (200ms) - Logo aparece grande inmediatamente
    opacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // Fase 2: Esperar hasta que el app esté listo, luego expandir como cortina
  useEffect(() => {
    if (!isReady) return;

    // Pequeño bounce antes de expandir
    scale.value = withSequence(
      withTiming(1.08, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 120, easing: Easing.inOut(Easing.quad) }),
      // Pausa antes del expand
      withTiming(1, { duration: 100 }, (finished) => {
        if (finished) {
          // CORTINA: Expande el fondo amarillo primero (crea la cortina)
          bgScale.value = withTiming(
            25, // Escala muy grande para cubrir toda la pantalla
            { duration: 600, easing: Easing.in(Easing.cubic) }
          );

          // Logo se expande junto con la cortina
          scale.value = withTiming(
            18,
            { duration: 650, easing: Easing.in(Easing.cubic) }
          );

          // Fade out más tardío para que la cortina amarilla sea visible
          opacity.value = withTiming(
            0,
            { duration: 400, easing: Easing.in(Easing.quad) },
            (finished) => {
              if (finished) {
                runOnJS(onComplete)();
              }
            }
          );
        }
      })
    );
  }, [isReady]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedBgStyle = useAnimatedStyle(() => ({
    // Fade in gradual del fondo conforme crece
    opacity: bgScale.value > 0 ? Math.min(bgScale.value / 5, 1) : 0,
    transform: [{ scale: bgScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fondo amarillo que crece con el logo */}
      <Animated.View style={[styles.expandingBg, animatedBgStyle]} />

      {/* Logo animado */}
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <Image
          source={MiniLogoYellow}
          style={styles.logo}
          contentFit="contain"
          priority="high"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Importante para que el expand no salga de la pantalla
  },
  expandingBg: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#ffd801', // Amarillo del logo
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Logo encima del fondo
  },
  logo: {
    width: 200, // Más grande para ser más prominente
    height: 200, // Aspect ratio 1:1 (viewBox 300x300)
  },
});
