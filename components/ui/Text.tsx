import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/design-tokens';

type TextVariant = keyof typeof typography.sizes;

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'text' | 'textSecondary' | 'textMuted' | 'textDisabled' | 'primary' | 'danger' | 'success';
  uppercase?: boolean;
}

export function Text({
  variant = 'body',
  color = 'text',
  uppercase = false,
  style,
  children,
  ...props
}: TextProps) {
  const { colors } = useTheme();
  const variantStyle = typography.sizes[variant];

  const textColor = colors[color] || colors.text;

  return (
    <RNText
      style={[
        {
          color: textColor,
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontWeight: variantStyle.fontWeight,
          letterSpacing: 'letterSpacing' in variantStyle ? variantStyle.letterSpacing : undefined,
        },
        uppercase && styles.uppercase,
        style,
      ]}
      {...props}
    >
      {uppercase && typeof children === 'string' ? children.toUpperCase() : children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  uppercase: {
    textTransform: 'uppercase',
  },
});
