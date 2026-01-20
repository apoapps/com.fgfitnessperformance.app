import { colors, typography, spacing, borderRadius, getColor } from '@/constants/design-tokens';

describe('Design Tokens - Colors', () => {
  describe('Dark Mode', () => {
    it('background is #09090b (Zinc 950)', () => {
      expect(colors.dark.background).toBe('#09090b');
    });

    it('primary is #ffd801 (Electric Yellow)', () => {
      expect(colors.dark.primary).toBe('#ffd801');
    });

    it('text is white', () => {
      expect(colors.dark.text).toBe('#ffffff');
    });

    it('textOnPrimary is black for contrast', () => {
      expect(colors.dark.textOnPrimary).toBe('#000000');
    });

    it('has all semantic colors', () => {
      expect(colors.dark.danger).toBe('#ef4444');
      expect(colors.dark.success).toBe('#22c55e');
      expect(colors.dark.warning).toBe('#f59e0b');
      expect(colors.dark.info).toBe('#3b82f6');
    });

    it('has macro chart colors', () => {
      expect(colors.dark.macroProtein).toBe('#3b82f6');
      expect(colors.dark.macroCarbs).toBe('#22c55e');
      expect(colors.dark.macroFat).toBe('#ffd801');
    });
  });

  describe('Light Mode', () => {
    it('background is #fafafa (Zinc 50)', () => {
      expect(colors.light.background).toBe('#fafafa');
    });

    it('primary is #ca8a04 (Yellow 600) for better contrast', () => {
      expect(colors.light.primary).toBe('#ca8a04');
    });

    it('text is dark for light backgrounds', () => {
      expect(colors.light.text).toBe('#09090b');
    });

    it('textOnPrimary is white', () => {
      expect(colors.light.textOnPrimary).toBe('#ffffff');
    });
  });

  describe('getColor helper', () => {
    it('returns dark color by default', () => {
      expect(getColor('primary')).toBe('#ffd801');
    });

    it('returns light color when specified', () => {
      expect(getColor('primary', 'light')).toBe('#ca8a04');
    });

    it('returns background color', () => {
      expect(getColor('background', 'dark')).toBe('#09090b');
      expect(getColor('background', 'light')).toBe('#fafafa');
    });
  });
});

describe('Design Tokens - Typography', () => {
  it('has correct font families', () => {
    expect(typography.fonts.heading).toBe('Oswald');
    expect(typography.fonts.body).toBe('Inter');
    expect(typography.fonts.mono).toBe('JetBrains Mono');
  });

  it('hero size is 40px with tight line height', () => {
    expect(typography.sizes.hero.fontSize).toBe(40);
    expect(typography.sizes.hero.lineHeight).toBe(36);
    expect(typography.sizes.hero.fontWeight).toBe('800');
  });

  it('section has wide letter spacing', () => {
    expect(typography.sizes.section.letterSpacing).toBe(1.2);
    expect(typography.sizes.section.fontWeight).toBe('700');
  });
});

describe('Design Tokens - Spacing', () => {
  it('has correct base values', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.base).toBe(16);
    expect(spacing.xl).toBe(24);
  });

  it('has screen padding of 20', () => {
    expect(spacing.screenPadding).toBe(20);
  });
});

describe('Design Tokens - Border Radius', () => {
  it('has standard card radius of 12', () => {
    expect(borderRadius.lg).toBe(12);
  });

  it('has full radius for pills', () => {
    expect(borderRadius.full).toBe(9999);
  });
});
