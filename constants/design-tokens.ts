/**
 * Design System Theme Tokens
 * FG Fitness Performance
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  dark: {
    // Backgrounds
    background: '#09090b',
    surface: '#18181b',
    surfaceHighlight: '#27272a',
    surfaceElevated: '#3f3f46',

    // Primary
    primary: '#ffd801',
    primaryDim: 'rgba(255, 216, 1, 0.15)',
    primaryDark: '#b39700',
    primaryLight: '#ffeb3b',

    // Typography
    text: '#ffffff',
    textSecondary: '#e4e4e7',
    textMuted: '#a1a1aa',
    textDisabled: '#52525b',
    textOnPrimary: '#000000',
    textInverse: '#09090b',

    // Borders
    border: '#27272a',
    borderHighlight: '#3f3f46',
    borderStrong: '#52525b',
    divider: '#27272a',

    // Semantic
    danger: '#ef4444',
    dangerDim: 'rgba(239, 68, 68, 0.15)',
    success: '#22c55e',
    successDim: 'rgba(34, 197, 94, 0.15)',
    warning: '#f59e0b',
    warningDim: 'rgba(245, 158, 11, 0.15)',
    info: '#3b82f6',
    infoDim: 'rgba(59, 130, 246, 0.15)',

    // Glass
    glassBackground: 'rgba(24, 24, 27, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    blurIntensity: 80,

    // Shadows
    shadowColor: '#000000',
    glowColor: '#ffd801',

    // Overlays
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(255, 255, 255, 0.1)',

    // Macros
    macroProtein: '#3b82f6',
    macroCarbs: '#22c55e',
    macroFat: '#ffd801',
  },

  light: {
    background: '#fafafa',
    surface: '#ffffff',
    surfaceHighlight: '#f4f4f5',
    surfaceElevated: '#e4e4e7',

    primary: '#ca8a04',
    primaryDim: 'rgba(202, 138, 4, 0.12)',
    primaryDark: '#a16207',
    primaryLight: '#facc15',

    text: '#09090b',
    textSecondary: '#27272a',
    textMuted: '#71717a',
    textDisabled: '#a1a1aa',
    textOnPrimary: '#ffffff',
    textInverse: '#ffffff',

    border: '#e4e4e7',
    borderHighlight: '#d4d4d8',
    borderStrong: '#a1a1aa',
    divider: '#f4f4f5',

    danger: '#dc2626',
    dangerDim: 'rgba(220, 38, 38, 0.10)',
    success: '#16a34a',
    successDim: 'rgba(22, 163, 74, 0.10)',
    warning: '#d97706',
    warningDim: 'rgba(217, 119, 6, 0.10)',
    info: '#2563eb',
    infoDim: 'rgba(37, 99, 235, 0.10)',

    glassBackground: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    blurIntensity: 60,

    shadowColor: '#71717a',
    glowColor: '#ca8a04',

    overlayDark: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(255, 255, 255, 0.8)',

    macroProtein: '#2563eb',
    macroCarbs: '#16a34a',
    macroFat: '#ca8a04',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fonts: {
    heading: 'Oswald',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  sizes: {
    hero: { fontSize: 40, lineHeight: 36, letterSpacing: -0.8, fontWeight: '800' as const },
    titleLg: { fontSize: 28, lineHeight: 31, letterSpacing: -0.28, fontWeight: '700' as const },
    title: { fontSize: 24, lineHeight: 29, letterSpacing: -0.24, fontWeight: '700' as const },
    titleSm: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
    bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    section: { fontSize: 12, lineHeight: 17, letterSpacing: 1.2, fontWeight: '700' as const },
    metric: { fontSize: 36, lineHeight: 40, fontWeight: '700' as const },
    metricSm: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const },
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  screenPadding: 20,
  cardPadding: 16,
  sectionGap: 24,
  itemGap: 12,
  safeAreaBottom: 20,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  neon: {
    shadowColor: '#ffd801',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  neonLight: {
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardLight: {
    shadowColor: '#71717a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  duration: { fast: 150, normal: 200, slow: 300 },
  easing: {
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// TYPES & HELPERS
// ============================================================================

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.dark;

export const getColor = (colorName: ColorToken, scheme: ColorScheme = 'dark'): string => {
  return colors[scheme][colorName] as string;
};
