/**
 * Theme - Design System
 * FG Fitness Performance
 */

export {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  getColor,
} from './design-tokens';

export type { ColorScheme, ColorToken } from './design-tokens';

import { colors } from './design-tokens';

// Legacy Colors export for backward compatibility
export const Colors = {
  light: {
    text: colors.light.text,
    background: colors.light.background,
    tint: colors.light.primary,
    icon: colors.light.textMuted,
    tabIconDefault: colors.light.textMuted,
    tabIconSelected: colors.light.primary,
  },
  dark: {
    text: colors.dark.text,
    background: colors.dark.background,
    tint: colors.dark.primary,
    icon: colors.dark.textMuted,
    tabIconDefault: colors.dark.textMuted,
    tabIconSelected: colors.dark.primary,
  },
};
