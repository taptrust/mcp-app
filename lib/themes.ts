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
    background: '222 84% 5%',
    foreground: '210 40% 98%',
    primary: '200 90% 52%', // blue-900
    primaryForeground: '0 0% 100%',
    secondary: '180 80% 35%', // teal-600
    secondaryForeground: '0 0% 100%',
    card: '250 20% 10%',
    cardForeground: '210 40% 98%',
    border: '215 25% 27%',
    muted: '222 14% 10%',
    mutedForeground: '215 16% 65%',
    accent: '215 25% 27%',
    accentForeground: '210 40% 98%',
    sidebar: {
      background: '222 84% 5%',
      foreground: '210 40% 98%',
      primary: '220 90% 22%',
      primaryForeground: '0 0% 100%',
      accent: '222 84% 15%',
      accentForeground: '210 40% 98%',
      border: '215 25% 27%',
    },
  },
  forest: {
    background: '7 9% 5%',
    foreground: '151 89% 95%',
    primary: '151 55% 25%',
    primaryForeground: '0 0% 100%',
    secondary: '39 70% 60%',
    secondaryForeground: '0 0% 100%',
    card: '240 10% 15%',
    cardForeground: '151 89% 95%',
    border: '240 10% 20%',
    muted: '240 10% 10%',
    mutedForeground: '240 5% 65%',
    accent: '240 10% 20%',
    accentForeground: '151 89% 95%',
    sidebar: {
      background: '7 9% 5%',
      foreground: '151 89% 95%',
      primary: '151 55% 25%',
      primaryForeground: '0 0% 100%',
      accent: '240 10% 15%',
      accentForeground: '151 89% 95%',
      border: '240 10% 20%',
    },
  },
  space: {
    background: '222 84% 5%',
    foreground: '270 20% 97%',
    primary: '262 83% 58%',
    primaryForeground: '0 0% 100%',
    secondary: '292 84% 61%',
    secondaryForeground: '0 0% 100%',
    card: '240 10% 15%',
    cardForeground: '270 20% 97%',
    border: '240 10% 20%',
    muted: '240 10% 10%',
    mutedForeground: '240 5% 65%',
    accent: '240 10% 20%',
    accentForeground: '270 20% 97%',
    sidebar: {
      background: '222 84% 5%',
      foreground: '270 20% 97%',
      primary: '262 83% 58%',
      primaryForeground: '0 0% 100%',
      accent: '240 10% 15%',
      accentForeground: '270 20% 97%',
      border: '240 10% 20%',
    },
  },
};

/**
 * Get theme colors by theme name
 */
export function getThemeColors(theme: ThemeName): ThemeColors {
  return themeColorPalette[theme];
}

/**
 * Convert HSL color to CSS variable
 */
export function hslToCSS(hsl: HSLColor): string {
  return `hsl(${hsl})`;
}
