import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { useTheme } from '@/contexts/ThemeContext';

// Mini logos (aspect ratio 564.2:414.4 ≈ 1.36:1)
const MiniLogoBlanco = require('../../assets/mini-logo-blanco.svg');
const MiniLogoNegro = require('../../assets/mini-logo-negro.svg');

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  logoSize?: number;
  style?: ViewStyle;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  showLogo = true,
  logoSize = 28,
  style,
  rightElement,
}: ScreenHeaderProps) {
  const { colors, isDark } = useTheme();

  // Calculate logo width based on aspect ratio (564.2:414.4)
  const logoWidth = logoSize * (564.2 / 414.4);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        {showLogo && (
          <Image
            source={isDark ? MiniLogoBlanco : MiniLogoNegro}
            style={{
              width: logoWidth,
              height: logoSize,
            }}
            contentFit="contain"
          />
        )}
        <View style={{ flex: 1 }}>
          {subtitle && (
            <Text variant="caption" color="textMuted">
              {subtitle}
            </Text>
          )}
          <Text variant="hero" style={{ fontSize: 24 }}>
            {title}
          </Text>
        </View>
      </View>
      {rightElement}
    </View>
  );
}
