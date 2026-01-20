import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { borderRadius, spacing, shadows } from '@/constants/design-tokens';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderLeft?: boolean;
}

export function Card({
  variant = 'default',
  padding = 'md',
  borderLeft = false,
  style,
  children,
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'glass':
        return colors.glassBackground;
      case 'elevated':
        return colors.surfaceHighlight;
      default:
        return colors.surface;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.cardPadding;
      case 'lg':
        return spacing.xl;
    }
  };

  const shadowStyle = isDark ? shadows.card : shadows.cardLight;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: colors.border,
          padding: getPadding(),
        },
        borderLeft && {
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        },
        Platform.OS !== 'web' && shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
