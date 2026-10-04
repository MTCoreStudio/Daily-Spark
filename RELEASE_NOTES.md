# Daily Spark — Release Notes

## Version 2.8.0 (2026-10-03)

**Build:** Android versionCode `12` · iOS buildNumber `12` · package `com.dailyspark.quotes`

> 💬 **Play Store "What's new" text** (short, multilingual) →
> [`PLAY_STORE_RELEASE_NOTES.md`](./PLAY_STORE_RELEASE_NOTES.md)

### ✨ New in this release

- **Emotional quote discovery** — "How are you feeling today?" lets you find
  the right Spark for your mood: **In Love, Heartbroken, Sad, Lonely, Healing,
  Motivated, Happy, Calm, Hopeful, Romantic, Missing Someone** and more. Moods
  are quote-discovery categories only — never medical advice.
- **Spark of the Moment** — tap "✨ Give Me a Spark" for an animated random
  Spark reveal.
- **Spark Feed** — a beautiful vertical swipe feed of quotes with favorite,
  share, copy and image actions.
- **Spark Studio** — turn any quote into a stunning image or wallpaper (11
  gradient templates, fonts, sizes, alignments, branding toggles). Share or
  save to your photos.
- **Spark History** — a calendar of every day's Spark, saved on your device.
- **Morning & Night Spark** — a gentle time-of-day Spark card on Home
  (optional, dismissible).
- **Collections** — organize your favorite Sparks into custom collections
  (e.g. Love, Motivation, Night, Study, Healing).
- **Widget Studio + Android Home Widgets** — design your own Daily Spark
  widget (small/medium/large, backgrounds, text, alignment, countdown);
  native/widget architecture is included and opt-in via a development build.
- **All Quotes** — browse the full online library with a live quote count.

### 🎨 Redesigned Home

- Cleaner hierarchy: greeting → Today's Spark (with Favorite/Share/More) →
  quick actions → streak → **How are you feeling today?** → All Quotes.
- Branded loading screen with skeletons (no fake quote text while loading).

### 🔌 Online-first content

- Quote content now comes **only from Supabase** (no bundled quote text).
  Offline shows a friendly "You're offline — connect to the internet to
  discover your latest Sparks" state with Retry.
- Mood and category feeds query **server-side by category**, so categories
  with content are never empty (library holds hundreds of thousands of
  native-language quotes).
- Faster, bounded fetches — the app never downloads the whole library.

### 📣 Ads

- **Native Advanced Ads** now appear naturally inside feeds (Home, Explore,
  Moods) — theme-matched, GDPR/UMP-consent aware, frequency-capped.
- **Rewarded ads** for Share/Save are optional: choose "Watch ad" to earn the
  unlock or **Skip** to continue right away (safe when ads aren't filling).
- Test/production ad-unit separation (`EXPO_PUBLIC_ADS_ENV`); the app never
  breaks when ads are unavailable.

### 🛠️ Other

- Hidden Quotes manager (restore/clear per device).
- Recent searches, Favorites search + filters, new theme accents
  (Midnight, Calm, Romantic), MT Core Studio branding, Facebook page link in
  Settings, and performance/accessibility polish throughout.

## Version 2.7.0 (2026-09-18)

**Build:** Android versionCode `11` · iOS buildNumber `11` · package `com.dailyspark.quotes`

> 💬 **Play Store "What's new" text** (short, multilingual) →
> [`PLAY_STORE_RELEASE_NOTES.md`](./PLAY_STORE_RELEASE_NOTES.md)

### ✨ New in this release

- **Adjustable reading text size** — On the quote reader, use **A− / A+** to make the
  quote text larger or smaller to suit your eyes. Your preference is remembered across
  launches, so the quote always feels comfortable.

### 🔧 Improvements

- Release hygiene: version bumped to **2.7.0** (Android versionCode `11`) so the
  update installs cleanly over the previously published builds.
## Version 2.6.0 (2026-09-12)
**Build:** Android versionCode `10` · iOS buildNumber `10` · package `com.dailyspark.quotes`

> 💬 **Play Store "What's new" text** (short, multilingual) →
> [`PLAY_STORE_RELEASE_NOTES.md`](./PLAY_STORE_RELEASE_NOTES.md)

### ✨ New in this release
- **Daily Spark is now "Motivational Quotes from everywhere"** — fresh branding with
  quotes from every language, culture and era.
  **Explore**, **Category** and **Author** screens (in addition to Home, Favorites
  and the Quote reader), and interstitials are shown slightly more often at
  natural checkpoints. All ads remain privacy-safe (UMP consent), frequency-capped
  and never interrupt reading.

### 🔧 Improvements
- Consolidated the SDK so the app runs smoothly across devices.
- Squashed an edge case where the daily notification could interfere with startup.

## Version 2.4.0 (2026-09-06)
**Build:** Android versionCode `7` · iOS buildNumber `7` · package `com.dailyspark.quotes`

> 💬 **Play Store "What's new" text** (short, 13 languages, ≤ 500 chars each) →
> [`PLAY_STORE_RELEASE_NOTES.md`](./PLAY_STORE_RELEASE_NOTES.md)

### ✨ New in this release
- **New Spark countdown** — The home screen now shows how long until the next
  Quote of the Day (`New Spark in 6h 12m`), building anticipation and giving you
  another reason to come back each day. Right at midnight the fresh quote is
  revealed automatically — no manual refresh needed.
- **Real AdMob ads are now fully active** — Free and supported by ads:
  - A compliant Google **UMP consent** flow (GDPR / EEA). Personalized ads are
    only served where the user allows; everyone else gets non-personalized ads,
    and ad measurement is delayed until consent.
  - **Interstitial ads are pre-loaded at launch** and shown at natural
    checkpoints (opening quotes, category changes, Surprise Me) with frequency
    capping so they never interrupt.
  - **Banners now also appear** on Favorites and the quote reader, in addition
    to the home feed.

### 🔧 Improvements
- The daily quote now switches at local midnight (matching the countdown and the
  morning notification), so the reveal is consistent across all surfaces.
- Version bumped to 2.4.0 for the Play Store update.

---

## Version 2.3.1 (2026-08-29)
**Build:** Android versionCode `6` · iOS buildNumber `6` · package `com.dailyspark.quotes`

### 🔧 Fixes
- **Fixed quotes not loading** — the home feed now returns quotes reliably. Resolved
  a Supabase query timeout by ordering by id and bounding the result, and aligned
  language/country matching so selected languages always show their native quotes.
- **Improved Explore category layout** — category chips now wrap into a tidy grid
  under a clean "Browse topics" header.

---

## Version 2.3.0 (2026-08-29)
**Build:** Android versionCode `5` · iOS buildNumber `5` · package `com.dailyspark.quotes`

### ✨ New in this release
- **13 native languages, 12 categories** — Quotes are now available in English,
  Hindi, Spanish, French, German, Arabic, Portuguese, Bengali, Urdu, Indonesian,
  Japanese, Korean, and Chinese, across categories including Motivational,
  Inspirational, Life, Success, Wisdom, Love, Friendship, Happiness, Courage, Hope,
  **Romantic ❤️**, and **Sad 💔**.
- **Authentic, native content — no machine translation** — Every quote is
  original to its language/country and is displayed with its home country and
  original language. An English quote is never automatically translated into
  another language.
- **Romantic ❤️ quotes** — emotional quotes about love, first love, long-distance
  love, soulmates, missing someone, and commitment.
- **Sad 💔 quotes** — emotional quotes about heartbreak, lost love, separation,
  loneliness, betrayal, regret, and moving on.
- **Categories managed from Supabase** — Category names are stored and managed in
  the Supabase database and read by the app and seeder at runtime (no hardcoded
  lists in the app).

### 🔧 Improvements
- Expanded the quote database with hundreds of thousands of native quotes across
  all 13 languages and 12 categories.
- Kept all existing features: daily notification, streak calendar, Firebase
  Analytics, favorites, share, and language/country filtering.

### 📱 Getting started
- After updating, allow **notifications** when prompted to get the daily reminder.
- Choose any language/country in Settings to browse its native quotes.

---

## Version 2.2.0 (2026-08-22)
**Build:** Android versionCode `4` · iOS buildNumber `4` · package `com.dailyspark.quotes`

### ✨ New in this release
- **Daily Spark reminder** — A daily local notification every morning nudges you to open
  today's quote. Tapping it jumps straight to the Quote of the Day. (Requires notification
  permission on first launch.)
- **Streak tracker + 7-day flame calendar** — The home screen now shows your current day
  streak and "Best" streak, plus a 7-day flame calendar to help you build a daily habit.
- **Firebase Analytics** — The app now reports opens and key engagement events
  (quote viewed / shared / favorited, category opened, search) so we can understand and
  improve the experience. Data powers "active users / DAU" reporting.

### 🔧 Improvements
- Version bumped to 2.2.0 for the Play Store update.

### 📱 Getting started
- After updating, allow **notifications** when prompted to get the daily morning reminder.

---

## Version 2.1.0
Initial Play Store release.