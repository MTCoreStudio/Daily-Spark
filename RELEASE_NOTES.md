# Daily Spark — Release Notes

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