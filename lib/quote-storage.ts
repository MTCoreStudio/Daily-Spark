import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const ADMIN_KEY = "admin_logged_in";
const ADMIN_AUTH_MODE_KEY = "admin_auth_mode";
type AdminAuthMode = "supabase_auth" | "legacy_table";

async function persistAdminSession(mode: AdminAuthMode) {
  await AsyncStorage.multiSet([
    [ADMIN_KEY, "true"],
    [ADMIN_AUTH_MODE_KEY, mode],
  ]);
}

async function tryLegacyAdminLogin(email: string, pin: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .eq("pin", pin)
    .maybeSingle();

  if (error) {
    const message = error.message ?? "";
    const missingLegacyColumns =
      /admins\.(email|pin)\s+does\s+not\s+exist/i.test(message) ||
      /Could not find the '(email|pin)' column/i.test(message);

    if (missingLegacyColumns) return false;
    throw new Error(message);
  }

  if (!data) return false;
  await persistAdminSession("legacy_table");
  return true;
}

export async function isAdminLoggedIn() {
  const val = await AsyncStorage.getItem(ADMIN_KEY);
  if (val !== "true") return false;

  const mode = await AsyncStorage.getItem(ADMIN_AUTH_MODE_KEY);
  if (mode === "legacy_table") return true;

  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    await AsyncStorage.multiRemove([ADMIN_KEY, ADMIN_AUTH_MODE_KEY]);
    return false;
  }
  return true;
}

export async function setAdminLoggedIn(val: boolean) {
  if (val) {
    await persistAdminSession("supabase_auth");
  } else {
    await AsyncStorage.multiRemove([ADMIN_KEY, ADMIN_AUTH_MODE_KEY]);
    await supabase.auth.signOut();
  }
}

export async function adminLogin(email: string, pin: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPin = pin.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: normalizedPin,
  });

  if (error) {
    const message = error.message ?? "Login failed";
    if (/invalid login credentials/i.test(message)) {
      return tryLegacyAdminLogin(normalizedEmail, normalizedPin);
    }
    throw new Error(message);
  }

  if (!data.session?.user) throw new Error("No session created.");

  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (adminError) {
    await supabase.auth.signOut();
    throw new Error(adminError.message ?? "Admin verification failed.");
  }

  if (!adminData) {
    await supabase.auth.signOut();
    return tryLegacyAdminLogin(normalizedEmail, normalizedPin);
  }

  await persistAdminSession("supabase_auth");
  return true;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  language?: string;
  country?: string | null;
  original_language?: string | null;
  source?: string | null;
  is_original?: boolean;
  image_url?: string | null;
  created_at?: string;
  is_favorite?: boolean;
  liked?: boolean;
}

export type QuoteInput = {
  text: string;
  author: string;
  category: string;
  language?: string;
  country?: string | null;
  original_language?: string | null;
  source?: string | null;
  is_original?: boolean;
  image_url?: string | null;
};

const FAVORITES_KEY = "user_favorites";
const HIDDEN_KEY = "hidden_quotes";

async function getFavoriteIds(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function getHiddenIds(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(HIDDEN_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

/**
 * Hides a quote from THIS device only (per-user, local). The quote stays in the
 * database and remains visible to every other user.
 */
export async function hideQuote(id: string): Promise<void> {
  const ids = await getHiddenIds();
  if (!ids.includes(id)) {
    await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify([...ids, id]));
  }
}

/** Restores a previously hidden quote to this device's feed. */
export async function unhideQuote(id: string): Promise<void> {
  const ids = await getHiddenIds();
  await AsyncStorage.setItem(
    HIDDEN_KEY,
    JSON.stringify(ids.filter((hid) => hid !== id))
  );
}

export async function getHiddenQuoteIds(): Promise<string[]> {
  return getHiddenIds();
}

/** Restores every hidden quote on this device (quotes stay in Supabase). */
export async function clearHiddenQuotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HIDDEN_KEY);
  } catch {}
}

export interface QuoteFilter {
  /** Filter to a single language (full name, e.g. "English"). */
  language?: string;
  /** Filter to a single country (e.g. "Bangladesh"). */
  country?: string;
  /** Cap the number of rows returned (keeps the query fast / within timeouts). */
  limit?: number;
  /** Filter to exactly one category (server-side). */
  category?: string;
  /** Filter to any of these categories (server-side). */
  categories?: string[];
}

/**
 * Fetches quotes from Supabase. Filters to a single language and/or country
 * (omit both to load everything). Quotes hidden on this device are excluded.
 *
 * Quotes are always native to their language/country — this never machine-
 * translates an English quote into another language.
 */
export async function getQuotes(filter?: QuoteFilter): Promise<Quote[]> {
  const { language, country, limit, category, categories } = filter ?? {};
  const favIds = await getFavoriteIds();
  const hiddenIds = await getHiddenIds();
  const favSet = new Set(favIds);
  const hiddenSet = new Set(hiddenIds);

  let query = supabase.from("quotes").select("*");
  if (language) {
    query = query.eq("language", language);
  }
  if (country) {
    query = query.eq("country", country);
  }
  // Server-side category filtering so moods/categories never look "empty"
  // just because an in-memory slice missed them.
  if (category) {
    query = query.eq("category", category);
  } else if (categories && categories.length) {
    query = query.in("category", categories);
  }
  query = query.order("id", { ascending: false });
  if (limit) {
    query = query.limit(limit);
  }
  const { data, error } = await query;
  if (error) throw error;

  return (data || [])
    .filter((q: any) => !hiddenSet.has(String(q.id)))
    .map((q: any) => ({
      ...q,
      is_favorite: favSet.has(String(q.id)),
      liked: favSet.has(String(q.id)),
    }));
}

/**
 * Exact item count for the official quote library (used by "All Quotes — N").
 * Uses Supabase's head count so it never downloads quote rows.
 */
export async function getQuotesCount(filter?: {
  language?: string;
  country?: string;
}): Promise<number> {
  let query = supabase.from("quotes").select("id", { count: "exact", head: true });
  if (filter?.language) {
    query = query.eq("language", filter.language);
  }
  if (filter?.country) {
    query = query.eq("country", filter.country);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  if (!error && data && data.length) return data.map((c: any) => c.name);

  const { data: quotesData } = await supabase.from("quotes").select("category");
  const categories = Array.from(
    new Set((quotesData || []).map((item: any) => item.category))
  ).filter(Boolean) as string[];
  return categories.sort();
}

export async function addCategory(name: string): Promise<void> {
  const { error } = await supabase.from("categories").insert([{ name }]);
  if (error) throw error;
}

export async function deleteCategory(name: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("name", name);
  if (error) throw error;
}

export async function updateCategoryName(oldName: string, newName: string) {
  const normalized = newName.trim();
  if (!normalized) throw new Error("Category name is required.");

  const { error: categoryError } = await supabase
    .from("categories")
    .update({ name: normalized })
    .eq("name", oldName);
  if (categoryError) throw categoryError;

  const { error: quoteError } = await supabase
    .from("quotes")
    .update({ category: normalized })
    .eq("category", oldName);
  if (quoteError) throw quoteError;
}

export async function getFavorites(): Promise<Quote[]> {
  const favIds = await getFavoriteIds();
  if (favIds.length === 0) return [];

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .in("id", favIds);
  if (error) throw error;

  return (data || []).map((q: any) => ({
    ...q,
    is_favorite: true,
    liked: true,
  }));
}

export async function toggleLike(id: string): Promise<void> {
  const favIds = await getFavoriteIds();
  const newFavIds = favIds.includes(id)
    ? favIds.filter((favId) => favId !== id)
    : [...favIds, id];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavIds));
}

export async function addQuote(text: string, author: string, category: string): Promise<void> {
  await addQuoteRecord({ text, author, category });
}

export async function addQuoteRecord(quote: QuoteInput): Promise<void> {
  const { error } = await supabase.from("quotes").insert([
    {
      text: quote.text,
      author: quote.author,
      category: quote.category,
      language: quote.language || "English",
      country: quote.country || null,
      original_language: quote.original_language || null,
      source: quote.source || null,
      is_original: quote.is_original ?? true,
      image_url: quote.image_url || null,
    },
  ]);
  if (error) throw error;
}

export async function addQuotesBulk(quotes: QuoteInput[]): Promise<number> {
  if (quotes.length === 0) return 0;
  const payload = quotes.map((quote) => ({
    text: quote.text,
    author: quote.author,
    category: quote.category,
    language: quote.language || "English",
    country: quote.country || null,
    original_language: quote.original_language || null,
    source: quote.source || null,
    is_original: quote.is_original ?? true,
    image_url: quote.image_url || null,
  }));
  const { error } = await supabase.from("quotes").insert(payload);
  if (error) throw error;
  return payload.length;
}

export async function updateQuote(
  id: string,
  text: string,
  author: string,
  category: string,
  image_url?: string | null,
  country?: string | null,
  original_language?: string | null,
  source?: string | null
): Promise<void> {
  const { error } = await supabase
    .from("quotes")
    .update({
      text,
      author,
      category,
      image_url: image_url || null,
      country: country || null,
      original_language: original_language || null,
      source: source || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteQuotesBulk(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const { error } = await supabase.from("quotes").delete().in("id", ids);
  if (error) throw error;
  return ids.length;
}

export async function updateQuotesCategoryBulk(ids: string[], category: string): Promise<number> {
  if (ids.length === 0) return 0;
  const { error } = await supabase.from("quotes").update({ category }).in("id", ids);
  if (error) throw error;
  return ids.length;
}
