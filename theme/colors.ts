export type ColorScheme = "light" | "dark";
export type AccentTheme =
  | "default"
  | "gold"
  | "violet"
  | "teal"
  | "rose"
  | "ocean"
  | "midnight"
  | "calm"
  | "romantic";

/** Semantic color set used across the app. Never rely on color alone. */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  accent: string;
  accentSoft: string;
  success: string;
  error: string;
}

interface BasePalette {
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  success: string;
  error: string;
}

const base: Record<ColorScheme, BasePalette> = {
  light: {
    background: "#F6F5F2",
    surface: "#FFFFFF",
    surfaceSecondary: "#F0EEE9",
    card: "#FFFFFF",
    textPrimary: "#1A1C20",
    textSecondary: "#5F6572",
    textTertiary: "#9AA0AC",
    border: "#E6E4DF",
    success: "#2F9E63",
    error: "#D94A4A",
  },
  dark: {
    background: "#0C1017",
    surface: "#141A24",
    surfaceSecondary: "#1D2532",
    card: "#1B2230",
    textPrimary: "#F2F4F8",
    textSecondary: "#AAB3C2",
    textTertiary: "#6E7888",
    border: "#242D3C",
    success: "#45C477",
    error: "#F06B6B",
  },
};

const accents: Record<AccentTheme, { accent: string; accentSoft: string }> = {
  default: { accent: "#8A6B2F", accentSoft: "#F0E6CB" },
  gold: { accent: "#B8860B", accentSoft: "#F4E7C3" },
  violet: { accent: "#7C3AED", accentSoft: "#EDE7FC" },
  teal: { accent: "#0E9F8B", accentSoft: "#DDF3EF" },
  rose: { accent: "#E0536F", accentSoft: "#FBE6EB" },
  ocean: { accent: "#1D7FD4", accentSoft: "#E1EEFB" },
  midnight: { accent: "#7C8FE0", accentSoft: "#E3E8FB" },
  calm: { accent: "#4F8F7B", accentSoft: "#DEEEE8" },
  romantic: { accent: "#C2476B", accentSoft: "#FBE4EB" },
};

export const ACCENT_THEMES: { key: AccentTheme; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "gold", label: "Gold" },
  { key: "violet", label: "Violet" },
  { key: "teal", label: "Teal" },
  { key: "rose", label: "Rose" },
  { key: "ocean", label: "Ocean" },
  { key: "midnight", label: "Midnight" },
  { key: "calm", label: "Calm" },
  { key: "romantic", label: "Romantic" },
];

export function buildTheme(
  scheme: ColorScheme,
  accent: AccentTheme
): ThemeColors {
  const b = base[scheme];
  const a = accents[accent];
  return { ...b, accent: a.accent, accentSoft: a.accentSoft };
}