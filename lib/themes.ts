type HSLColor = `${number} ${number}% ${number}%`;

export type ThemeName = 'ocean' | 'space' | 'forest';

export interface ThemeColors {
  background: HSLColor;
  foreground: HSLColor;
  primary: HSLColor;
  primaryForeground: HSLColor;
  secondary: HSLColor;
  secondaryForeground: HSLColor;
  card: HSLColor;
  cardForeground: HSLColor;
  border: HSLColor;
  muted: HSLColor;
  mutedForeground: HSLColor;
  accent: HSLColor;
  accentForeground: HSLColor;
  sidebar: {
    background: HSLColor;
    foreground: HSLColor;
    primary: HSLColor;
    primaryForeground: HSLColor;
    accent: HSLColor;
    accentForeground: HSLColor;
    border: HSLColor;
  };
}

export const themeColorPalette: Record<ThemeName, ThemeColors> = {
  ocean: {
    background: '215 60% 8%',           // deep navy
    foreground: '210 25% 92%',          // pale blue-gray
    primary: '210 90% 55%',             // vivid blue
    primaryForeground: '0 0% 100%',
    secondary: '220 70% 45%',           // medium blue (no green)
    secondaryForeground: '0 0% 98%',
    card: '220 25% 15%',
    cardForeground: '210 25% 92%',
    border: '220 25% 30%',
    muted: '215 15% 20%',
    mutedForeground: '215 15% 75%',
    accent: '225 70% 40%',              // rich blue accent
    accentForeground: '0 0% 98%',
    sidebar: {
      background: '215 60% 8%',
      foreground: '210 25% 92%',
      primary: '215 80% 45%',
      primaryForeground: '0 0% 98%',
      accent: '225 60% 25%',
      accentForeground: '210 25% 92%',
      border: '220 25% 30%',
    },
  },
  forest: {
    background: '150 20% 8%',
    foreground: '140 30% 90%',
    primary: '151 55% 30%',
    primaryForeground: '0 0% 98%',
    secondary: '40 70% 50%',
    secondaryForeground: '0 0% 10%',
    card: '150 15% 14%',
    cardForeground: '140 30% 90%',
    border: '150 15% 25%',
    muted: '150 10% 18%',
    mutedForeground: '150 10% 70%',
    accent: '150 25% 22%',
    accentForeground: '140 30% 90%',
    sidebar: {
      background: '150 20% 8%',
      foreground: '140 30% 90%',
      primary: '151 55% 30%',
      primaryForeground: '0 0% 98%',
      accent: '150 25% 20%',
      accentForeground: '140 30% 90%',
      border: '150 15% 25%',
    },
  },
  space: {
    background: '260 40% 7%',
    foreground: '270 30% 92%',
    primary: '260 80% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '280 60% 55%',
    secondaryForeground: '0 0% 98%',
    card: '260 25% 14%',
    cardForeground: '270 30% 92%',
    border: '260 25% 25%',
    muted: '260 20% 18%',
    mutedForeground: '260 10% 70%',
    accent: '270 60% 25%',
    accentForeground: '0 0% 98%',
    sidebar: {
      background: '260 40% 7%',
      foreground: '270 30% 92%',
      primary: '260 80% 45%',
      primaryForeground: '0 0% 98%',
      accent: '260 40% 18%',
      accentForeground: '270 30% 92%',
      border: '260 25% 25%',
    },
  },
};

/** Get theme colors by theme name */
export function getThemeColors(theme: ThemeName): ThemeColors {
  return themeColorPalette[theme] || themeColorPalette.ocean;
}

/** Convert HSL color to CSS variable */
export function hslToCSS(hsl: HSLColor): string {
  return `hsl(${hsl})`;
}