export const DarkColors = {
  background: '#0A0B14',
  surface: '#12131F',
  surfaceLight: '#1A1B2E',
  border: '#232437',

  primary: '#7B61FF',
  primaryLight: '#9B85FF',
  primaryDark: '#5A43D4',

  streak: '#FF6B35',
  streakLight: '#FF8C5E',
  xp: '#FFD700',
  xpLight: '#FFE44D',

  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',

  text: '#FFFFFF',
  textSecondary: '#9091A4',
  textMuted: '#55566A',

  white: '#FFFFFF',
  black: '#000000',
};

export const LightColors = {
  background: '#F5F6FC',
  surface: '#FFFFFF',
  surfaceLight: '#ECEEF8',
  border: '#DDE0F0',

  primary: '#6B4EFF',
  primaryLight: '#8B72FF',
  primaryDark: '#4C30D4',

  streak: '#FF6B35',
  streakLight: '#FF8C5E',
  xp: '#D97706',
  xpLight: '#F59E0B',

  success: '#059669',
  error: '#DC2626',
  warning: '#D97706',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  white: '#FFFFFF',
  black: '#000000',
};

export type ColorScheme = typeof DarkColors;

// Default export for files that haven't migrated to useTheme yet
export const Colors = DarkColors;

export const Gradients = {
  primary: ['#7B61FF', '#5A43D4'] as const,
  streak: ['#FF6B35', '#FF4500'] as const,
  xp: ['#FFD700', '#FFA500'] as const,
  course1: ['#F857A6', '#FF5858'] as const,
  course2: ['#4776E6', '#8E54E9'] as const,
  course3: ['#11998E', '#38EF7D'] as const,
  dark: ['#1A1B2E', '#0A0B14'] as const,
  success: ['#4ADE80', '#22C55E'] as const,
};
