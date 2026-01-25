import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';

// Pre-load SVG assets
const MiniLogoBlanco = require('../../assets/mini-logo-blanco.svg');
const MiniLogoNegro = require('../../assets/mini-logo-negro.svg');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DoodleBackgroundProps {
  opacity?: number;
  scale?: number;
  spacing?: number;
}

export function DoodleBackground({
  opacity = 0.03,
  scale = 0.12,
  spacing = 100,
}: DoodleBackgroundProps) {
  const { isDark } = useTheme();

  const logoSize = 300 * scale; // Original SVG is 300x300
  const cols = Math.ceil(SCREEN_WIDTH / spacing) + 1;
  const rows = Math.ceil(SCREEN_HEIGHT / spacing) + 2;

  const logos = useMemo(() => {
    const items = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Offset every other row for organic feel
        const offsetX = row % 2 === 0 ? 0 : spacing / 2;
        const x = col * spacing + offsetX;
        const y = row * spacing;

        // Slight rotation variation based on position
        const rotation = ((row + col) % 3 - 1) * 8;

        items.push(
          <View
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: logoSize,
              height: logoSize,
              transform: [{ rotate: `${rotation}deg` }],
            }}
          >
            <Image
              source={isDark ? MiniLogoBlanco : MiniLogoNegro}
              style={{ width: logoSize, height: logoSize }}
              contentFit="contain"
            />
          </View>
        );
      }
    }
    return items;
  }, [cols, rows, spacing, logoSize, isDark]);

  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {logos}
    </View>
  );
}
