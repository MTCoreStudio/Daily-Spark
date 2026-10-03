/**
 * Curated content seeder: ensures the full Daily Spark category list exists in
 * Supabase and inserts original English quotes for every category (no
 * duplicates by exact text). Then run the multi-language generator:
 *
 *   npx tsx scripts/seed-categories.ts
 *   npx tsx scripts/seed-quotes.ts 6000
 *
 * Requires EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SEED_CATEGORIES } from "../data/seed/categories";
import { EN_QUOTES } from "../data/seed/en-quotes";

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  const envPath = join(process.cwd(), ".env");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

const fileEnv = loadEnv();
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || fileEnv.EXPO_PUBLIC_SUPABASE_URL || "";
const anon =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || fileEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || !anon || url.includes("placeholder")) {
  console.error("Missing Supabase config (EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY).");
  process.exit(1);
}

const supabase: SupabaseClient = createClient(url, anon, { auth: { persistSession: false } });

async function ensureCategories(client: SupabaseClient): Promise<number> {
  let ok = 0;
  for (const name of SEED_CATEGORIES) {
    const { error } = await client.from("categories").upsert({ name }, { onConflict: "name" });
    if (error) {
      console.error(`  category "${name}" failed: ${error.message}`);
    } else {
      ok += 1;
    }
  }
  return ok;
}

async function existingEnglishTexts(client: SupabaseClient): Promise<Set<string>> {
  const set = new Set<string>();
  let offset = 0;
  for (let page = 0; page < 80; page += 1) {
    const { data, error } = await client
      .from("quotes")
      .select("text")
      .eq("language", "English")
      .order("id", { ascending: true })
      .range(offset, offset + 99);
    if (error || !data || data.length === 0) break;
    for (const row of data) set.add(String(row.text));
    offset += data.length;
  }
  return set;
}

async function main() {
  console.log("Daily Spark curated seeder\n");
  console.log(`Ensuring ${SEED_CATEGORIES.length} categories…`);
  const ok = await ensureCategories(supabase);
  console.log(`  ${ok}/${SEED_CATEGORIES.length} categories ensured.`);

  console.log("Loading existing English texts…");
  const existing = await existingEnglishTexts(supabase);

  const rows: {
    text: string;
    author: string;
    category: string;
    language: string;
    country: string;
    original_language: string;
    is_original: boolean;
    source: string;
  }[] = [];

  for (const category of SEED_CATEGORIES) {
    const texts = EN_QUOTES[category] ?? [];
    for (const text of texts) {
      const clean = text.trim();
      if (!clean || existing.has(clean)) continue; // zero duplicates
      rows.push({
        text: clean,
        author: "Unknown",
        category,
        language: "English",
        country: "United States",
        original_language: "en",
        is_original: true,
        source: "Daily Spark (original)",
      });
    }
  }

  console.log(`Inserting ${rows.length} curated English quotes…`);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase.from("quotes").insert(chunk);
    if (error) {
      console.error(`  chunk failed: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }
  console.log(`  done: +${inserted}.`);
  console.log("\nNext: npx tsx scripts/seed-quotes.ts 6000  (multi-language volume)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});