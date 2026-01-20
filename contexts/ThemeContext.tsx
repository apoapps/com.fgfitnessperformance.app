import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useNativeColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ColorScheme } from '@/constants/design-tokens';

const THEME_STORAGE_KEY = 'USER_THEME_PREFERENCE';

type ThemePreference = 'system' | 'dark' | 'light';

interface ThemeContextType {
  scheme: ColorScheme;
  preference: ThemePreference;
  colors: typeof colors.dark;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useNativeColorScheme() ?? 'dark';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setPreferenceState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  // Calculate actual scheme
  const scheme: ColorScheme = preference === 'system' ? systemScheme : preference;
  const isDark = scheme === 'dark';

  // Save preference
  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
  };

  const value: ThemeContextType = {
    scheme,
    preference,
    colors: colors[scheme],
    isDark,
    setPreference,
  };

  // Don't render until we load saved preference to avoid flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook to get a specific color
export function useThemeColor(colorName: keyof typeof colors.dark) {
  const { colors } = useTheme();
  return colors[colorName];
}
