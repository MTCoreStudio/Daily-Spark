# Daily Spark — Google Play Publishing Guide

Complete, step-by-step guide to publish **Daily Spark** on the Google Play Store.

---

## App Identity (use these exactly)

| Field | Value |
|---|---|
| App name | `Daily Spark – Motivational Quotes & Daily Inspiration` |
| Package name | `com.dailyspark.quotes` |
| Version | `1.0.0` |
| Version code | `1` |
| Category | `Lifestyle` |
| Default language | English (United States) — `en-US` |
| Monetization | Free, with AdMob ads |

> ⚠️ A package name **cannot be changed** after you create the app in Play Console.
> Create the app once with `com.dailyspark.quotes` and keep it forever.

---

## 0. Prerequisites

1. **Google Play Developer account** — a **one-time $25 fee** (required; no way around it).
   - Go to <https://play.google.com/console> → Sign in with a Google account
   - Complete payment + the developer verification form (name, address, etc.)
2. **Expo/EAS account** — already set up (`trrahat`); used to build the signed AAB.
3. **AdMob account** — optional but recommended; link your app and get a real App ID.
4. **Privacy policy URL** (READY) — `https://trrahat01.github.io/daily-spark-privacy/`
5. **Store assets** — app icon, feature graphic, screenshots (specs below).

---

## Step 1 — Generate the store-listing assets

Create these files (PNG/JPG):

| Asset | Size | Notes |
|---|---|---|
| App icon | `512 x 512` | Your logo, no transparency bleed |
| Feature graphic | `1024 x 500` | Banner used at the top of the store page |
| Phone screenshots | at least 2 (5–8 recommended) | Sized to your device, e.g. `1080 x 2400` |

> ℹ️ When you give me your logo/images, I will generate these published assets for you.

---

## Step 2 — Build the release AAB (signed)

From the project folder, in PowerShell:

```powershell
cd D:\React Native\Daily-Spark
$env:EXPO_PUBLIC_APP_VARIANT="user"
npx eas login                     # sign in as trrahat
npx eas build -p android --profile production-user --clear-cache
```

- EAS signs the package automatically (keep the remote keystore safe).
- When done it prints a **BUILD_ID** and a link. The output is an **.aab** file (required by Play).
- Each next release must bump `android.versionCode` in `app.json`.

---

## Step 3 — Create the app in Play Console

1. Open <https://play.google.com/console> → **Create app**.
2. Choose: Language **English (United States)**, App name `Daily Spark – Motivational Quotes & Daily Inspiration`, type **App**, **Free**, and **Yes, it contains ads**.
3. Click **Create app**.

> 🖼️ **Ready store assets** are generated in the project at `assets/publish/`:
> - `icon-512.png` (512×512 app icon)
> - `feature-1024x500.png` (1024×500 feature graphic)
> - `screenshot-1..5.jpg` (720×1650 phone screenshots)
> Upload these directly in **Store presence → Main store listing**.

---

## Step 4 — Set up the store listing

**Store presence → Main store listing**

**App name**
```
Daily Spark – Motivational Quotes & Daily Inspiration
```

**Short description** (80 characters max)
```
Daily motivational quotes & inspiration to keep you going, all in one free app.
```

**Full description**
```
Daily Spark brings you a growing library of inspirational, motivational and life
quotes — organized by category so you can find the exact mood you need in seconds.

Use Daily Spark for a quick mindset reset before work, study, training, journaling,
or a busy day.

Features:
• Read thousands of motivational and inspirational quotes in a clean layout
• Browse by category: Motivation, Success, Life, Wisdom, Love and more
• Read quotes in your language (English, Hindi, Spanish, French and more)
• Quote of the Day curated for you every day
• Surprise Me to discover something new
• Save favorites and hide quotes you don't like
• Share any quote as a beautiful image with the Daily Spark logo
• Works offline and keeps you inspired anywhere

Daily Spark keeps inspiration simple. Open the app, find the quote that fits your
moment, and carry that thought into your day.

Install Daily Spark today and make positive thinking part of your routine.
```

**Keywords / tags**
```
motivation, motivational quotes, daily quotes, inspirational quotes, quote of the
day, positive thinking, mindset, self improvement, success quotes, life quotes,
wisdom, love quotes, friendship, happiness, courage, hope, free quotes, daily inspiration
```

Upload: **App icon**, **Feature graphic**, **Phone screenshots**.

## Step 5 — Privacy policy

**App content → Privacy policy**
- Select **Privacy policy URL** and enter:
```
https://trrahat01.github.io/daily-spark-privacy/
```
- Review and mark it **Approved**.

---

## Step 6 — Data safety form

**App content → Data safety** (matches the current app):

| Question | Answer |
|---|---|
| Does your app collect or share user data? | **No** (no login, no user accounts) |
| Data collected | **None** for core functionality |
| Declared features | **Advertising or marketing** → Yes (AdMob) |
| Data shared | Ads use the Google advertising ID (after consent) |

> If you later add analytics or login, update this form before release.

---

## Step 7 — Ads declaration

**App content → Ads**
- Ads present: **Yes** — accept Google's ads policy.
- The app now ships your **real AdMob IDs** in `app.json`:
  ```json
  ["react-native-google-mobile-ads", {
    "androidAppId": "ca-app-pub-1463796060515114~9395181817",
    "iosAppId": "ca-app-pub-1463796060515114~9395181817"
  }]
  ```
- **Privacy & messaging (important):** open AdMob → *Privacy & messaging → GDPR* and
  publish a message so EU/EEA users get the in-app consent form. Without it the
  consent flow silently skips the form and the app serves **non-personalized** ads
  (still compliant, just lower revenue).
- Never ship the AdMob **test** IDs (`ca-app-pub-3940256099942544…`) live.

---

## Step 8 — Content rating

**App content → Content rating** — complete the questionnaire (3 steps).
Suggested answers: No realistic violence, No sexual content, No purchase of digital
goods, No user-generated content, No alcohol/tobacco/drugs. Likely rating: **Everyone**.

---

## Step 9 — Target audience & permissions

**App content → Target audience**
- Age range: **18+** (safest with ads), content **All audiences**.
- Ads: **Yes, it shows ads**.

**Permissions** — this app blocks location/camera/mic/media permissions, so declare none.

## Step 10 — Upload the AAB and create a release

**Production (or Testing → Internal testing first) → Create new release**

1. Upload the `.aab` file from Step 2.
2. **Release notes** (What's new):
   ```
   Introducing Daily Spark:
   • Thousands of quotes in multiple languages
   • Quote of the Day, favorites, and share-as-image
   • Language selection, hide quotes, and more
   ```
3. **Save** → **Review release**.

> 🔁 Recommend **Internal testing** first (only your Google account installs it),
> test the live AAB, then promote to Production.

---

## Step 11 — Review, verification, and launch

1. **App content → Policy and programmes → Manage** — review **Ads**, **Permissions**,
   **Data safety**, and **Data deletion**.
2. Accept the **Distribution Agreement**.
3. **Close the loop** / production review: review answers, click "I understand" on
   any red flags, **Save**.
4. Choose **Roll out** on the Production release.
5. The app enters **Review** (usually hours to a couple of days).

---

## Step 12 — Track & maintain

- Watch **Ratings and reviews** after launch.
- For updates: bump `android.versionCode` (1 → 2 → 3 …), rebuild the AAB, upload to the
  same release track.
- Keep the privacy policy and data-safety answers current if features change.

---

## Final checklist

- [ ] Google Play developer account ($25) created
- [ ] EAS login + build succeeds (AAB)
- [ ] App created with package `com.dailyspark.quotes`
- [ ] Icon, feature graphic, screenshots uploaded
- [ ] Store listing text pasted (Step 4)
- [ ] Privacy policy URL set (https://trrahat01.github.io/daily-spark-privacy/)
- [ ] Data safety completed (ads = Yes, no user data collected)
- [ ] Ads declared + real AdMob App ID added
- [ ] Content rating completed
- [ ] Target audience + permissions confirmed
- [ ] AAB uploaded + release notes written
- [ ] Distribution agreement accepted → app in review

---

## Important reminders

- **Package name is permanent** — `com.dailyspark.quotes`.
- **Bump versionCode** every release or Play rejects the update.
- **Never ship the AdMob test IDs** (`ca-app-pub-3940256099942544…`) live.
- **Keep the keystore safe** — losing it means you can never update the app.
- Screens in Play Console change over time; if a screen differs, use the sidebar
  "App content" sections and follow the same answers.
