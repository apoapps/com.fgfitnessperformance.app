import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';

const MiniLogoBlanco = require('../../assets/mini-logo-blanco.svg');
const MiniLogoNegro = require('../../assets/mini-logo-negro.svg');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Icon sets for different themes
const ICON_SETS = {
  fitness: ['🏋️', '💪', '🔥', '⚡', '🎯', '💥', '🏃', '⭐'],
  nutrition: ['🍎', '🍌', '🥑', '🥦', '🍗', '🥚', '💧', '🥗'],
  profile: ['👤', '⚙️', '📊', '🎖️', '🏆', '📈', '💫', '✨'],
  chat: ['💬', '📝', '💡', '🎯', '✅', '📌', '🔔', '💪'],
} as const;

type ThemeType = keyof typeof ICON_SETS;

interface ThemedDoodleBackgroundProps {
  theme: ThemeType;
  opacity?: number;
  spacing?: number;
  logoFrequency?: number; // How often to show logo vs icons (1 = every item, 3 = every 3rd item)
}

export function ThemedDoodleBackground({
  theme,
  opacity = 0.04,
  spacing = 90,
  logoFrequency = 4,
}: ThemedDoodleBackgroundProps) {
  const { colors, isDark } = useTheme();
  const icons = ICON_SETS[theme];

  const logoSize = 36;
  const iconSize = 24;
  const cols = Math.ceil(SCREEN_WIDTH / spacing) + 1;
  const rows = Math.ceil(SCREEN_HEIGHT / spacing) + 2;

  const items = useMemo(() => {
    const elements = [];
    let iconIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offsetX = row % 2 === 0 ? 0 : spacing / 2;
        const x = col * spacing + offsetX;
        const y = row * spacing;
        const rotation = ((row + col) % 5 - 2) * 6;
        const itemIndex = row * cols + col;
        const showLogo = itemIndex % logoFrequency === 0;

        if (showLogo) {
          // Show FG logo
          elements.push(
            <View
              key={`logo-${row}-${col}`}
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
        } else {
          // Show themed icon
          const icon = icons[iconIndex % icons.length];
          iconIndex++;

          elements.push(
            <View
              key={`icon-${row}-${col}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: iconSize,
                height: iconSize,
                transform: [{ rotate: `${rotation}deg` }],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <RNText
                style={{
                  fontSize: iconSize * 0.8,
                  opacity: isDark ? 0.6 : 0.5,
                }}
              >
                {icon}
              </RNText>
            </View>
          );
        }
      }
    }
    return elements;
  }, [cols, rows, spacing, logoSize, iconSize, isDark, icons, logoFrequency]);

  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {items}
    </View>
  );
}

// Convenience wrapper components
export function FitnessDoodleBackground(props: Omit<ThemedDoodleBackgroundProps, 'theme'>) {
  return <ThemedDoodleBackground theme="fitness" {...props} />;
}

export function NutritionDoodleBackground(props: Omit<ThemedDoodleBackgroundProps, 'theme'>) {
  return <ThemedDoodleBackground theme="nutrition" {...props} />;
}

export function ProfileDoodleBackground(props: Omit<ThemedDoodleBackgroundProps, 'theme'>) {
  return <ThemedDoodleBackground theme="profile" {...props} />;
}

export function ChatDoodleBackground(props: Omit<ThemedDoodleBackgroundProps, 'theme'>) {
  return <ThemedDoodleBackground theme="chat" {...props} />;
}
