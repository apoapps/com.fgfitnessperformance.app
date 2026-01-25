import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

const MiniLogoBlanco = require('../../assets/mini-logo-blanco.svg');
const MiniLogoNegro = require('../../assets/mini-logo-negro.svg');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Ionicons names for different themes (monochromatic)
const ICON_SETS = {
  fitness: [
    'barbell-outline',
    'flame-outline',
    'flash-outline',
    'fitness-outline',
    'heart-outline',
    'trophy-outline',
    'star-outline',
    'rocket-outline',
  ],
  nutrition: [
    'nutrition-outline',
    'leaf-outline',
    'water-outline',
    'restaurant-outline',
    'cafe-outline',
    'fish-outline',
    'egg-outline',
    'pizza-outline',
  ],
  profile: [
    'person-outline',
    'settings-outline',
    'stats-chart-outline',
    'medal-outline',
    'ribbon-outline',
    'trending-up-outline',
    'sparkles-outline',
    'shield-checkmark-outline',
  ],
  chat: [
    'chatbubble-outline',
    'document-text-outline',
    'bulb-outline',
    'checkmark-circle-outline',
    'bookmark-outline',
    'notifications-outline',
    'send-outline',
    'happy-outline',
  ],
} as const;

type ThemeType = keyof typeof ICON_SETS;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ThemedDoodleBackgroundProps {
  theme: ThemeType;
  opacity?: number;
  spacing?: number;
  logoFrequency?: number;
}

export function ThemedDoodleBackground({
  theme,
  opacity = 1, // Full opacity - we control visibility via icon color
  spacing = 80,
  logoFrequency = 4,
}: ThemedDoodleBackgroundProps) {
  const { colors, isDark } = useTheme();
  const icons = ICON_SETS[theme];

  const logoSize = 42;  // 50% larger
  const iconSize = 27;  // 50% larger
  const cols = Math.ceil(SCREEN_WIDTH / spacing) + 1;
  const rows = Math.ceil(SCREEN_HEIGHT / spacing) + 2;

  // Color for icons - more visible
  const iconColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
  const logoOpacity = isDark ? 0.08 : 0.06;

  const items = useMemo(() => {
    const elements = [];
    let iconIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offsetX = row % 2 === 0 ? 0 : spacing / 2;
        const x = col * spacing + offsetX;
        const y = row * spacing;
        const rotation = ((row + col) % 5 - 2) * 8;
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
                opacity: logoOpacity,
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
          // Show themed Ionicon
          const iconName = icons[iconIndex % icons.length] as IoniconName;
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
              <Ionicons
                name={iconName}
                size={iconSize}
                color={iconColor}
              />
            </View>
          );
        }
      }
    }
    return elements;
  }, [cols, rows, spacing, logoSize, iconSize, isDark, icons, logoFrequency, iconColor, logoOpacity]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
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
