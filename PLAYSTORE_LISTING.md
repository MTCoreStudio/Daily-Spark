# Daily Spark - Play Store Publishing Pack

Prepared for the public user app.

## App Identity

- App name: `Daily Spark – Motivational Quotes from everywhere`
- Package name: `com.dailyspark.quotes`
- Version: `1.0.0`
- Version code: `1`
- Default language: `en-US`
- Category: `Lifestyle`
- Release track for first upload: `Internal testing`

> IMPORTANT: Create the Play Console app with the package `com.dailyspark.quotes`.
> A package name cannot be changed after the app is created in Play Console.

## Short Description

Daily motivational quotes & inspiration to keep you going, all in one free app.

## Full Description

Daily Spark brings you a growing library of inspirational, motivational and life
quotes — organized by category so you can find the exact mood you need in seconds.

Use Daily Spark for a quick mindset reset before work, study, training, journaling,
or a busy day.

Features:

- Read thousands of motivational and inspirational quotes in a clean, focused layout
- Browse quotes by category (Motivation, Success, Life, Wisdom, Love and more)
- Read quotes in multiple languages: English, Hindi, Spanish, French and more
- Get a fresh Quote of the Day curated for you
- Surprise Me button to discover something new
- Save favorite quotes for quick access later
- Hide quotes you don't like — it only affects your feed, other users still see them
- Share any quote with friends in one tap
- Works offline with a bundled quote library

Daily Spark keeps inspiration simple. Open the app, find the quote that fits your
moment, and carry that thought into your day.

Install Daily Spark today and make positive thinking part of your daily routine.

## Keywords

motivation, motivational quotes, daily quotes, inspirational quotes, quote of the day,
positive thinking, mindset, self improvement, success quotes, life quotes, wisdom,
love quotes, friendship, happiness, courage, hope, free quotes, daily inspiration

## Advertising

Daily Spark is free and supported by Google AdMob ads.

- Implementation uses frequency capping so ads never interrupt your experience.
- AdMob test ads are used during development.
- Users can disable personalized ads via Google's ad settings at any time.

## Privacy Policy Requirement

Google Play requires a privacy policy. A ready-to-publish policy is included in:

`PRIVACY_POLICY.md`

Publish that policy at a public URL (Google Sites / GitHub Pages / Notion), then add
the URL in `Play Console -> App content -> Privacy policy`.

## Data Safety Form Guidance

- Data collected: `No user personal data collected for normal quote browsing`
- Data shared: `No`
- Data encrypted in transit: `Yes`
- Account creation: `No`
- Data deletion request: `Not applicable` (no end-user accounts)
- Ads: `Yes — Google AdMob` (declare ads in the Data Safety form)
- Location / Camera / Microphone / Photos: `No`

Because AdMob is now integrated, be sure to:
1. Declare ads in the Google Play Data Safety form.
2. Add the "Shares data with advertisers for advertising" disclosures that AdMob requires.

## Store Assets Checklist

- App icon: `512 x 512` PNG
- Feature graphic: `1024 x 500` PNG/JPG
- Phone screenshots: at least 2, recommended 5-8
- Privacy policy URL: public and accessible
- AdMob account linked and app registered

Screenshot ideas:
- Home quote feed with Quote of the Day
- Category browsing (Motivation, Success, Love...)
- Favorites screen
- Sharing a quote card

## Build And Submit Commands

Build a fresh AAB (user app) after any package/name change:

```powershell
$env:EXPO_PUBLIC_APP_VARIANT="user"; npx eas build -p android --profile production-user --clear-cache
```

Submit the finished build:

```powershell
npx eas submit -p android --profile production-user --id NEW_BUILD_ID
```

> Note: this project requires a native (development) build or EAS build because
> it uses the AdMob native module. It will not run ads in Expo Go.
