import { Platform, StyleSheet } from 'react-native';

// Apple HIG color palette with web uni theme
export const colors = {
  primary: '#d45c3c',
  primaryDark: '#b84a2e',
  primaryLight: '#fce4db',
  dark: '#1a1e0f',
  darkLight: '#2a3018',
  background: '#f0ede4',
  surface: '#ffffff',
  surfaceAlt: '#f7f6f1',
  border: '#e8e2d6',
  borderLight: '#f5f1ea',
  separator: '#e0dcd0',

  label: '#1a1a14',
  secondaryLabel: '#6b6456',
  tertiaryLabel: '#8a7f72',
  quaternaryLabel: '#c4bfb5',
  placeholder: '#c4bfb5',

  systemBlue: '#007aff',
  systemGreen: '#34c759',
  systemRed: '#ff3b30',
  systemOrange: '#ff9500',
  systemYellow: '#ffcc00',

  error: '#c55a11',
  errorLight: '#fff0ed',
  success: '#385723',
  successLight: '#e2f0d9',
  warning: '#b8631c',
  warningLight: '#fefaf0',

  white: '#ffffff',
  sidebarBg: '#1f1e17',

  // HIG specific
  groupedBackground: '#f0ede4',
  opaqueSeparator: '#c6c6c8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 13,
  xl: 16,
  full: 999,
};

// SF Pro on iOS, system on Android — matches Apple HIG
export const typography = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.label,
    letterSpacing: 0.34,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.label,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.label,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.label,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.label,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.secondaryLabel,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.secondaryLabel,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.tertiaryLabel,
    letterSpacing: 0.07,
  },
});

export const statusColors = {
  pending: { bg: '#fefaf0', text: '#b8631c', dot: '#f59e0b', label: 'Pending' },
  in_progress: { bg: '#fce4db', text: '#b84a2e', dot: '#d45c3c', label: 'In Progress' },
  resolved: { bg: '#e2f0d9', text: '#385723', dot: '#16a34a', label: 'Resolved' },
};
