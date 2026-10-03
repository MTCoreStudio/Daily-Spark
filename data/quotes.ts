/**
 * Quote type used across the app.
 *
 * QUOTE CONTENT IS ONLINE-ONLY: there is deliberately NO bundled quote text in
 * the app. All quote rows are served by the Admin -> Supabase -> app pipeline.
 * This file only defines the shape. When the network is unavailable the app
 * shows a friendly offline state and never fabricates or falls back to
 * hard-coded quotes.
 */

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  source?: string | null;
  language?: string;
  /** Home country the quote's language belongs to. */
  country?: string | null;
  /** ISO-639 code of the language the quote was originally written in. */
  original_language?: string | null;
  /** Whether this quote is original/native to its language (never a translation). */
  is_original?: boolean;
  featured?: boolean;
}