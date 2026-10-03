import AsyncStorage from "@react-native-async-storage/async-storage";
import { Quote } from "@/data/quotes";

/**
 * Local persistence for the new Daily Spark experiences:
 *  - Spark History (today's Spark per calendar day)
 *  - Morning / Night Spark preference
 *  - Recent searches
 *  - Widget Studio configuration
 *
 * All keys are new — existing user data (favorites, hidden quotes, theme,
 * language) is never touched by this module.
 */

// ---------------------------------------------------------------------------
// Spark History
// ---------------------------------------------------------------------------

export interface DailySparkEntry {
  /** Local calendar day, "YYYY-MM-DD". */
  date: string;
  quote: Quote;
  savedAt: number;
}

const HISTORY_KEY = "ds_spark_history";
export const HISTORY_LIMIT = 500;

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getSparkHistory(): Promise<DailySparkEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as DailySparkEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Records today's Spark (idempotent per day — the same day keeps its first
 * quote, which matches the deterministic Quote of the Day). Newest first.
 */
export async function recordSpark(quote: Quote): Promise<void> {
  try {
    const today = localDateKey();
    const history = await getSparkHistory();
    const next = [
      { date: today, quote, savedAt: Date.now() },
      ...history.filter((entry) => entry.date !== today),
    ].slice(0, HISTORY_LIMIT);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Never break the app because history could not be saved.
  }
}

export async function getSparkForDate(
  date: string | undefined
): Promise<Quote | null> {
  if (!date) return null;
  const history = await getSparkHistory();
  const entry = history.find((h) => h.date === date);
  return entry?.quote ?? null;
}

/** Calendar-friendly summaries for the history screen: day -> category. */
export async function getMonthSparkSummaries(
  year: number,
  monthIndex: number
): Promise<Record<string, string>> {
  const history = await getSparkHistory();
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  const out: Record<string, string> = {};
  for (const entry of history) {
    if (entry.date.startsWith(prefix)) {
      out[entry.date] = entry.quote.category ?? "";
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Morning / Night Spark
// ---------------------------------------------------------------------------

const MORNING_NIGHT_KEY = "ds_morning_night_sparks";

export async function isMorningNightSparkEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(MORNING_NIGHT_KEY)) !== "off";
  } catch {
    return true;
  }
}

export async function setMorningNightSparkEnabled(on: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(MORNING_NIGHT_KEY, on ? "on" : "off");
  } catch {}
}

/** Day-part used for the greeting + morning/night Spark sections. */
export type DayPart = "morning" | "afternoon" | "evening" | "night";

export function getDayPart(now: Date = new Date()): DayPart {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function getGreeting(now: Date = new Date()): string {
  const part = getDayPart(now);
  switch (part) {
    case "morning":
      return "Good morning";
    case "afternoon":
      return "Good afternoon";
    case "evening":
      return "Good evening";
    case "night":
      return "Good night";
  }
}
// ---------------------------------------------------------------------------
// Recent searches
// ---------------------------------------------------------------------------

const RECENT_SEARCHES_KEY = "ds_recent_searches";
const RECENT_SEARCHES_LIMIT = 8;

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(term: string): Promise<void> {
  const t = (term || "").trim();
  if (!t) return;
  try {
    const next = [
      t,
      ...(await getRecentSearches()).filter((r) => r !== t),
    ].slice(0, RECENT_SEARCHES_LIMIT);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {}
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {}
}

// ---------------------------------------------------------------------------
// Widget Studio configuration
// ---------------------------------------------------------------------------

export type WidgetSize = "small" | "medium" | "large";
export type WidgetBackground =
  | "minimal"
  | "dark"
  | "light"
  | "gradient"
  | "aurora"
  | "sunset"
  | "ocean"
  | "forest"
  | "elegant";
export type WidgetTextSize = "small" | "medium" | "large";
export type WidgetAlignment = "left" | "center" | "right";
export type WidgetMode = "daily" | "random" | "favorite" | "category" | "quote";

export interface WidgetConfig {
  size: WidgetSize;
  background: WidgetBackground;
  textSize: WidgetTextSize;
  alignment: WidgetAlignment;
  showBranding: boolean;
  showCategory: boolean;
  showAuthor: boolean;
  showCountdown: boolean;
  mode: WidgetMode;
  /** When mode === "category", one category name. */
  category?: string;
  /** When mode === "quote", the selected quote id. */
  quoteId?: string;
  /** Best-effort refresh hint in hours (Android may relax this). */
  refreshHours: 1 | 3 | 6 | 12 | 24;
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  size: "medium",
  background: "gradient",
  textSize: "medium",
  alignment: "center",
  showBranding: true,
  showCategory: true,
  showAuthor: true,
  showCountdown: true,
  mode: "daily",
  refreshHours: 6,
};

const WIDGET_CONFIG_KEY = "ds_widget_config";

export async function getWidgetConfig(): Promise<WidgetConfig> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_CONFIG_KEY);
    if (!raw) return DEFAULT_WIDGET_CONFIG;
    return { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WIDGET_CONFIG;
  }
}

export async function setWidgetConfig(config: WidgetConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}