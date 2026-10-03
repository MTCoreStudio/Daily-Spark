/**
 * Mood taxonomy for emotional quote discovery.
 *
 * Moods are a *client-side discovery layer* over the existing quote database:
 * every mood maps to a set of quote categories. This keeps the database model,
 * the Admin app and the Supabase schema untouched — an Admin who adds a category
 * named "Heartbreak" immediately populates the Heartbroken mood.
 *
 * Moods are discovery categories only. They are NOT mental-health diagnoses,
 * therapy or medical advice.
 */

export interface Mood {
  /** Stable id used in routes/storage, e.g. `/mood/heartbroken`. */
  key: string;
  emoji: string;
  /** Short display title, e.g. "Heartbroken". */
  title: string;
  /** One-line description shown on the mood detail screen. */
  description: string;
  /** Gradient used by the mood card / header (never the only signal — text labels are always shown). */
  colors: readonly [string, string];
  /** Quote categories that belong to this mood (exact, case-insensitive matching). */
  categories: readonly string[];
  /** Related mood keys shown at the bottom of the mood detail screen. */
  related: readonly string[];
}

export const MOODS: readonly Mood[] = [
  {
    key: "in-love",
    emoji: "❤️",
    title: "In Love",
    description: "Warm, tender quotes for the heart that is full.",
    colors: ["#7B2D5E", "#E0536F"] as const,
    categories: ["Love", "Romance", "Deep Love", "Couple", "Forever", "First Love", "Relationship"],
    related: ["romantic", "missing-someone", "heartbroken"],
  },
  {
    key: "heartbroken",
    emoji: "💔",
    title: "Heartbroken",
    description: "For the heavy days — gentle words before you heal.",
    colors: ["#3E2C4E", "#6B4A7E"] as const,
    categories: ["Heartbreak", "Breakup", "Moving On", "Lost Love", "Betrayal", "Letting Go"],
    related: ["sad", "missing-someone", "healing"],
  },
  {
    key: "sad",
    emoji: "😔",
    title: "Sad",
    description: "Reflection and comfort for difficult moments.",
    colors: ["#1F3A5F", "#3E6A97"] as const,
    categories: ["Sadness", "Sad Thoughts", "Emotional", "Deep Thoughts", "Late Night Thoughts"],
    related: ["heartbroken", "lonely", "healing"],
  },
  {
    key: "lonely",
    emoji: "🌧️",
    title: "Lonely",
    description: "Soft reminders that you are not as alone as it feels.",
    colors: ["#232B45", "#48546E"] as const,
    categories: ["Loneliness", "Missing Someone", "Difficult Days", "Night Thoughts"],
    related: ["sad", "heartbroken", "healing"],
  },
  {
    key: "healing",
    emoji: "🌱",
    title: "Healing",
    description: "Acceptance, forgiveness and the courage to start again.",
    colors: ["#14532D", "#2F9E63"] as const,
    categories: ["Healing", "Self Love", "Acceptance", "Forgiveness", "Starting Again", "Inner Strength", "Hope"],
    related: ["heartbroken", "calm", "hopeful"],
  },
  {
    key: "motivated",
    emoji: "🔥",
    title: "Motivated",
    description: "Discipline, dreams and the fire to keep moving.",
    colors: ["#B45309", "#E8590C"] as const,
    categories: ["Motivation", "Discipline", "Success", "Failure", "Courage", "Dreams", "Focus", "Growth", "Ambition", "Work"],
    related: ["happy", "hopeful", "thinking"],
  },
  {
    key: "happy",
    emoji: "😊",
    title: "Happy",
    description: "Joy, gratitude and good memories to brighten the day.",
    colors: ["#A16207", "#F5C04A"] as const,
    categories: ["Happiness", "Joy", "Gratitude", "Good Memories", "Positive Life", "Positivity"],
    related: ["motivated", "calm", "hopeful"],
  },
  {
    key: "calm",
    emoji: "🌙",
    title: "Calm",
    description: "Peaceful, quiet thoughts for a steady mind.",
    colors: ["#1E3A44", "#3D6E7E"] as const,
    categories: ["Peace", "Calm", "Mindset", "Spirituality", "Patience", "Night Thoughts", "Sleep", "Relaxation"],
    related: ["healing", "hopeful", "thinking"],
  },
  {
    key: "thinking",
    emoji: "🧠",
    title: "Thinking",
    description: "Wisdom, life and the questions worth pondering.",
    colors: ["#3730A3", "#6366F1"] as const,
    categories: ["Life", "Wisdom", "Time", "Change", "Choices", "Lessons", "Deep Thoughts", "Anxiety"],
    related: ["calm", "hopeful", "motivated"],
  },
  {
    key: "hopeful",
    emoji: "✨",
    title: "Hopeful",
    description: "Light, faith and quiet hope for what comes next.",
    colors: ["#6B4E1B", "#D4A54A"] as const,
    categories: ["Hope", "Faith", "Spirituality", "Islamic Wisdom", "Morning", "Gratitude", "Positivity"],
    related: ["healing", "calm", "happy"],
  },
  {
    key: "romantic",
    emoji: "🌹",
    title: "Romantic",
    description: "Elegant words for love in every season.",
    colors: ["#8E2C40", "#D9526B"] as const,
    categories: ["Romance", "Romantic Love", "Good Night Love", "Good Morning Love", "Love"],
    related: ["in-love", "missing-someone", "happy"],
  },
  {
    key: "missing-someone",
    emoji: "💌",
    title: "Missing Someone",
    description: "Tender thoughts for the ones far from reach.",
    colors: ["#5B3A73", "#8E6BB5"] as const,
    categories: ["Missing Someone", "Long Distance Love", "Missing You"],
    related: ["in-love", "romantic", "heartbroken"],
  },
];

/** Quoted moods on the Home screen chips (curated subset). */
export const HOME_MOODS: readonly Mood[] = MOODS.filter((m) =>
  ["romantic", "in-love", "heartbroken", "sad", "lonely", "healing", "motivated", "happy", "calm", "thinking", "hopeful"]
    .includes(m.key)
);

export function getMood(key: string | undefined): Mood | undefined {
  if (!key) return undefined;
  return MOODS.find((m) => m.key === key);
}

/** Categories are matched case-insensitively. */
const norm = (s: string) => (s || "").trim().toLowerCase();

/** Does the given category belong to any mood? (for badges on quote cards). */
export function moodKeysForCategory(category: string | undefined): string[] {
  if (!category) return [];
  const cat = norm(category);
  return MOODS.filter((m) => m.categories.some((c) => norm(c) === cat)).map((m) => m.key);
}

/** All category names referenced by every mood (for chips / feature detection). */
export const ALL_MOOD_CATEGORIES: string[] = Array.from(
  new Set(MOODS.flatMap((m) => m.categories.map((c) => c)))
).sort();