import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors, ColorScheme } from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ColorScheme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: DarkColors,
  isDark: true,
  mode: 'dark',
  setMode: async () => {},
});

const THEME_KEY = '@synapse:theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    await AsyncStorage.setItem(THEME_KEY, m);
  };

  const isDark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';
  const colors: ColorScheme = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
