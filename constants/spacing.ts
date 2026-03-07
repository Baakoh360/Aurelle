/**
 * Modern 8pt-based spacing and radius scale for consistent UI across iOS and Android.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 9999,
} as const;

/** Extra bottom padding so scroll content clears the tab bar (approx tab bar height) */
export const TAB_BAR_PADDING_BOTTOM = 72;
