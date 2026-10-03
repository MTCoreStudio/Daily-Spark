import AsyncStorage from "@react-native-async-storage/async-storage";
import { Quote } from "@/data/quotes";
import { getQuotes as fetchRemoteQuotes, getCategories as fetchRemoteCategories } from "@/lib/quote-storage";

const CACHE_KEY = "ds_quote_cache";
const CACHE_KEY_LANG = "ds_quote_cache_lang";
const DAY_KEY = "ds_quote_day";
const DAILY_KEY = "ds_quote_daily";
const CATS_KEY = "ds_categories_cache";

/** --- cache helpers -------------------------------------------------- */

function cacheKeyFor(language?: string): string {
  return language ? `${CACHE_KEY}_${language}` : CACHE_KEY_LANG;
}

export async function saveQuotesToCache(quotes: Quote[], language?: string): Promise<void> {
  try {
    const json = JSON.stringify(quotes);
    const key = cacheKeyFor(language);
    if (json.length > 1_000_000) {
      // Keep the cache bounded for the offline fallback.
      await AsyncStorage.setItem(key, JSON.stringify(quotes.slice(0, 5000)));
    } else {
      await AsyncStorage.setItem(key, json);
    }
  } catch {}
}

export async function loadQuotesFromCache(language?: string): Promise<Quote[]> {
  try {
    const json = await AsyncStorage.getItem(cacheKeyFor(language));
    const parsed = json ? JSON.parse(json) : null;
    return Array.isArray(parsed) ? (parsed as Quote[]) : [];
  } catch {
    return [];
  }
}

async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(CACHE_KEY_LANG);
    await AsyncStorage.removeItem(CATS_KEY);
  } catch {}
}

/** --- data access (offline-first) ------------------------------------ */

export async function getQuotes(language?: string, country?: string): Promise<Quote[]> {
  // 1) last good cache for this language (instant + offline)
  const cached = await loadQuotesFromCache(language);
  if (cached.length) return cached;
  // 2) remote, then cache it
  try {
    const remote = await fetchRemoteQuotes({ language, country });
    if (remote && remote.length) {
      await saveQuotesToCache(remote, language);
      return remote;
    }
  } catch {}
  // No offline bundled quotes in another language — return empty rather than
  // machine-translate an English quote.
  return [];
}

export async function syncQuotes(language?: string, country?: string): Promise<Quote[]> {
  try {
    const remote = await fetchRemoteQuotes({ language, country });
    if (remote && remote.length) {
      await saveQuotesToCache(remote, language);
      return remote;
    }
  } catch {}
  const cached = await loadQuotesFromCache(language);
  return cached.length ? cached : [];
}

export async function getQuoteById(id: string): Promise<Quote | undefined> {
  if (!id) return undefined;
  const all = await getQuotes();
  return all.find((item) => String(item.id) === String(id));
}

export async function getQuotesByCountry(country: string): Promise<Quote[]> {
  const c = (country || "").toLowerCase();
  const all = await getQuotes();
  return all.filter((item) => (item.country || "").toLowerCase() === c);
}

export async function getQuotesByCategory(category: string): Promise<Quote[]> {
  const all = await getQuotes();
  const cat = (category || "").toLowerCase();
  return all.filter((item) => (item.category || "").toLowerCase() === cat);
}

export async function getQuotesByAuthor(author: string): Promise<Quote[]> {
  const all = await getQuotes();
  const a = (author || "").toLowerCase();
  return all.filter((item) => (item.author || "").toLowerCase() === a);
}

export async function getFeaturedQuotes(limit = 20): Promise<Quote[]> {
  const all = await getQuotes();
  const featured = all.filter((q) => q.featured);
  if (featured.length) return featured.slice(0, limit);
  return all.slice(0, limit);
}

export async function getCategories(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(CATS_KEY);
    if (json) {
      const arr = JSON.parse(json);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {}
  let cats: string[] = [];
  try {
    const remoteCats = await fetchRemoteCategories();
    if (remoteCats && remoteCats.length) {
      cats = remoteCats;
      await AsyncStorage.setItem(CATS_KEY, JSON.stringify(cats)).catch(() => {});
    }
  } catch {}
  return cats.sort();
}

export async function getAuthors(): Promise<string[]> {
  const all = await getQuotes();
  return Array.from(new Set(all.map((q) => q.author || "Unknown"))).sort();
}

export async function searchQuotes(
  query: string,
  language?: string,
  country?: string
): Promise<Quote[]> {
  const all = await getQuotes(language, country);
  const term = (query || "").trim().toLowerCase();
  if (!term) return [];
  return all.filter((item) => {
    return (
      (item.text || "").toLowerCase().includes(term) ||
      (item.author || "").toLowerCase().includes(term) ||
      (item.category || "").toLowerCase().includes(term) ||
      (item.country || "").toLowerCase().includes(term) ||
      (item.original_language || "").toLowerCase().includes(term)
    );
  });
}

/** --- deterministic daily quote -------------------------------------- */

function dayIndex(target: string): number {
  let total = 0;
  for (let i = 0; i < target.length; i += 1) total = (total * 31 + target.charCodeAt(i)) % 100000;
  return total;
}

/**
 * Deterministic Quote of the Day, sourced from Supabase content only.
 * Returns null when no online content is available yet (offline/empty) — the
 * UI must show the offline/empty state instead of a fabricated quote.
 */
export async function getDailyQuote(): Promise<Quote | null> {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const dayKey = `${y}-${m}-${d}`;

  try {
    const [storedDay, storedQuote] = await Promise.all([
      AsyncStorage.getItem(DAY_KEY),
      AsyncStorage.getItem(DAILY_KEY),
    ]);
    if (storedDay === dayKey && storedQuote) {
      const parsed = JSON.parse(storedQuote);
      if (parsed && parsed.text) return parsed as Quote;
    }
  } catch {}

  const all = await getQuotes();
  if (!all.length) return null;
  const quote = all[dayIndex(dayKey) % all.length];
  try {
    await AsyncStorage.multiSet([
      [DAY_KEY, dayKey],
      [DAILY_KEY, JSON.stringify(quote)],
    ]);
  } catch {}
  return quote;
}

export { clearCache as clearQuoteCache };