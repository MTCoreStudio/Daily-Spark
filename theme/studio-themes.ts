/**
 * Spark Studio art templates.
 *
 * Every background is a generated gradient with abstract shapes — no
 * copyrighted photography. Templates stay small, fast and dependency-free.
 */

export type StudioTemplateKey =
  | "classic"
  | "minimal"
  | "romantic"
  | "sad"
  | "dark"
  | "elegant"
  | "motivational"
  | "love"
  | "nature"
  | "night"
  | "sunrise";

export interface StudioTemplate {
  key: StudioTemplateKey;
  label: string;
  emoji: string;
  colors: readonly [string, string, string];
  /** Main text color on the art card. */
  text: string;
  /** Secondary text / accent (author, category, branding). */
  softText: string;
  /** Accent used for the sparkle icon. */
  accent: string;
  /** Decorative overlay style. */
  overlay: "none" | "orbs" | "rays" | "aurora";
  /** For light backgrounds, pick a dark title chip. */
  light?: boolean;
}

export const STUDIO_TEMPLATES: readonly StudioTemplate[] = [
  { key: "classic", label: "Classic", emoji: "✨", colors: ["#0F1A2E", "#1E2D47", "#2B3E5F"], text: "#FFFFFF", softText: "rgba(255,255,255,0.75)", accent: "#D4A54A", overlay: "orbs" },
  { key: "minimal", label: "Minimal", emoji: "⬜", colors: ["#F6F5F2", "#FFFFFF", "#EDEBE6"], text: "#1A1C20", softText: "#5F6572", accent: "#8A6B2F", overlay: "none", light: true },
  { key: "romantic", label: "Romantic", emoji: "🌹", colors: ["#7B2D5E", "#C2476B", "#E99BB0"], text: "#FFFFFF", softText: "rgba(255,255,255,0.85)", accent: "#FFE3EA", overlay: "orbs" },
  { key: "sad", label: "Sad", emoji: "🌧️", colors: ["#1F3A5F", "#3E6A97", "#6B8FB5"], text: "#FFFFFF", softText: "rgba(255,255,255,0.8)", accent: "#CDE5FF", overlay: "rays" },
  { key: "dark", label: "Dark", emoji: "🌑", colors: ["#0C1017", "#141A24", "#1D2532"], text: "#F2F4F8", softText: "#AAB3C2", accent: "#D4A54A", overlay: "orbs" },
  { key: "elegant", label: "Elegant", emoji: "🖋️", colors: ["#2B2B24", "#42423A", "#5C5C50"], text: "#FFFDF5", softText: "rgba(255,253,245,0.72)", accent: "#E4C482", overlay: "none" },
  { key: "motivational", label: "Motivational", emoji: "🔥", colors: ["#B45309", "#E8590C", "#F59E0B"], text: "#FFFFFF", softText: "rgba(255,255,255,0.9)", accent: "#FFE2C0", overlay: "rays" },
  { key: "love", label: "Love", emoji: "❤️", colors: ["#8E2C40", "#D9526B", "#F4A7B1"], text: "#FFFFFF", softText: "rgba(255,255,255,0.9)", accent: "#FFE9EE", overlay: "aurora" },
  { key: "nature", label: "Nature", emoji: "🌿", colors: ["#14532D", "#2F9E63", "#6FCF97"], text: "#FFFFFF", softText: "rgba(255,255,255,0.9)", accent: "#DFFFEA", overlay: "orbs" },
  { key: "night", label: "Night", emoji: "🌙", colors: ["#0F1022", "#1E1B4B", "#312E81"], text: "#FFFFFF", softText: "rgba(255,255,255,0.8)", accent: "#C7D2FE", overlay: "aurora" },
  { key: "sunrise", label: "Sunrise", emoji: "🌅", colors: ["#B45309", "#F59E0B", "#FDE68A"], text: "#FFFFFF", softText: "rgba(255,255,255,0.9)", accent: "#FFF7D6", overlay: "rays" },
];

export function getStudioTemplate(key: string | undefined): StudioTemplate {
  return (
    STUDIO_TEMPLATES.find((t) => t.key === key) ?? STUDIO_TEMPLATES[0]
  );
}

/** Font choices for the art card. */
export type StudioFontKey = "regular" | "medium" | "semibold" | "bold";
export const STUDIO_FONTS: readonly { key: StudioFontKey; label: string }[] = [
  { key: "regular", label: "Regular" },
  { key: "medium", label: "Medium" },
  { key: "semibold", label: "Semi Bold" },
  { key: "bold", label: "Bold" },
];

export function fontFamilyFor(key: StudioFontKey): string {
  switch (key) {
    case "regular":
      return "DMSans_400Regular";
    case "medium":
      return "DMSans_500Medium";
    case "semibold":
      return "DMSans_600SemiBold";
    case "bold":
      return "DMSans_700Bold";
  }
}

/** Output aspect ratios supported for export. */
export type StudioAspectKey = "post" | "story" | "wallpaper";
export const STUDIO_ASPECTS: readonly { key: StudioAspectKey; label: string }[] = [
  { key: "post", label: "Post (4:5)" },
  { key: "story", label: "Story (9:16)" },
  { key: "wallpaper", label: "Wallpaper (9:19.5)" },
];

export function aspectRatio(key: StudioAspectKey): number {
  switch (key) {
    case "post":
      return 4 / 5;
    case "story":
      return 9 / 16;
    case "wallpaper":
      return 9 / 19.5;
  }
}