import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Custom favorites collections ("Saved Sparks").
 *
 * Collections are a NEW, purely additive layer. Existing favorites (the flat
 * `ds_favorites` list) are untouched, and every favorite stays visible even
 * without a collection. Removals from a quote's card remove it from the flat
 * favorites list (existing behavior); removing from a collection only removes
 * the collection membership (the quote may still be a flat favorite).
 */

export interface QuoteCollection {
  id: string;
  name: string;
  emoji: string;
  quoteIds: string[];
  createdAt: number;
}

const COLLECTIONS_KEY = "ds_collections";

export async function getCollections(): Promise<QuoteCollection[]> {
  try {
    const raw = await AsyncStorage.getItem(COLLECTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as QuoteCollection[]) : [];
  } catch {
    return [];
  }
}

async function saveCollections(list: QuoteCollection[]): Promise<void> {
  await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(list)).catch(
    () => {}
  );
}

function makeId(): string {
  return `col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createCollection(
  name: string,
  emoji = "❤️"
): Promise<QuoteCollection> {
  const collections = await getCollections();
  const collection: QuoteCollection = {
    id: makeId(),
    name: (name || "New collection").trim(),
    emoji,
    quoteIds: [],
    createdAt: Date.now(),
  };
  await saveCollections([...collections, collection]);
  return collection;
}

export async function deleteCollection(id: string): Promise<void> {
  const collections = await getCollections();
  await saveCollections(collections.filter((c) => c.id !== id));
}

export async function renameCollection(
  id: string,
  name: string,
  emoji?: string
): Promise<void> {
  const collections = await getCollections();
  await saveCollections(
    collections.map((c) =>
      c.id === id
        ? { ...c, name: (name || c.name).trim(), emoji: emoji ?? c.emoji }
        : c
    )
  );
}

export async function addQuoteToCollection(
  collectionId: string,
  quoteId: string
): Promise<void> {
  const collections = await getCollections();
  await saveCollections(
    collections.map((c) =>
      c.id === collectionId && !c.quoteIds.includes(quoteId)
        ? { ...c, quoteIds: [...c.quoteIds, quoteId] }
        : c
    )
  );
}

export async function removeQuoteFromCollection(
  collectionId: string,
  quoteId: string
): Promise<void> {
  const collections = await getCollections();
  await saveCollections(
    collections.map((c) =>
      c.id === collectionId
        ? { ...c, quoteIds: c.quoteIds.filter((q) => q !== quoteId) }
        : c
    )
  );
}

export async function isQuoteInCollection(
  collectionId: string,
  quoteId: string
): Promise<boolean> {
  const collections = await getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  return collection ? collection.quoteIds.includes(quoteId) : false;
}

/** All collection ids that already contain the given quote. */
export async function collectionIdsContainingQuote(
  quoteId: string
): Promise<string[]> {
  const collections = await getCollections();
  return collections.filter((c) => c.quoteIds.includes(quoteId)).map((c) => c.id);
}