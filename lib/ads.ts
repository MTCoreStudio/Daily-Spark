import { Platform } from "react-native";

/**
 * Resilient wrapper around react-native-google-mobile-ads + Google UMP consent.
 *
 * The native AdMob module is only available on a native (Android / iOS)
 * development or production build — it is NOT available in Expo Go or on web.
 * Every API is guarded so the app keeps working (without ads) in those
 * environments instead of crashing.
 *
 * ## Consent (GDPR / EEA)
 * Google's UMP SDK is consulted at every launch (best-effort, never blocks):
 *  - If a consent form is required it is presented automatically. If the
 *    publisher hasn't configured "Privacy & messaging" in the AdMob console, no
 *    form is available and we simply continue in the safe mode below.
 *  - Ad requests default to NON-personalized (the compliant, safe default)
 *    until we learn the user's consent; personalized ads are then served only
 *    where the user (or their geography) allows it.
 *
 * ## Frequency capping keeps the experience non-intrusive:
 *  - an interstitial only appears every N triggers,
 *  - and never more than once per MIN_INTERSTITIAL_GAP_MS,
 *  - and only if an ad is already loaded.
 */

export const ADS_BANNER_UNIT_ID = "ca-app-pub-1463796060515114/1940463708";
export const ADS_INTERSTITIAL_UNIT_ID =
  "ca-app-pub-1463796060515114/2924428227";

export interface AdRequestOptions {
  requestNonPersonalizedAdsOnly: boolean;
}

type AdsModule = typeof import("react-native-google-mobile-ads") | null;

let adsModule: AdsModule = null;
let adsResolved = false;

/** True when the native AdMob module is present and usable on this device. */
export function isAdsAvailable(): boolean {
  if (adsResolved) return adsModule !== null;
  adsResolved = true;
  if (Platform.OS === "web") {
    adsModule = null;
    return false;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    adsModule = require("react-native-google-mobile-ads") as AdsModule;
  } catch {
    adsModule = null;
  }
  return adsModule !== null;
}

/** Exposes the module to React components (returns null when unavailable). */
export function getAdsModule(): AdsModule {
  return isAdsAvailable() ? adsModule : null;
}

// ---------------------------------------------------------------------------
// Consent-aware request options
// ---------------------------------------------------------------------------

/** Safe default: no personalization until the user consents. */
let nonPersonalizedOnly = true;

/**
 * Options to pass to every ad request. Non-personalized by default; switches to
 * personalized only after UMP tells us it is allowed (or no consent is needed).
 */
export function getAdRequestOptions(): AdRequestOptions {
  return { requestNonPersonalizedAdsOnly: nonPersonalizedOnly };
}

let initialized = false;

/** Must be called once at app startup (best-effort; never throws). */
export async function initAds(): Promise<void> {
  const mod = getAdsModule();
  if (!mod || initialized) return;
  initialized = true;

  // Refresh consent + (if needed) show the Google consent form. Runs in the
  // background so the UI is never blocked; degrades safely if UMP is unusable.
  void runConsentFlow(mod);

  try {
    await mod.MobileAds().initialize();
  } catch {
    // Native module unavailable (e.g. Expo Go) — silently continue.
  }
  ensureInterstitialLoaded();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runConsentFlow(mod: NonNullable<AdsModule>): Promise<void> {
  try {
    // Give the first screen a moment to settle before any form may appear.
    await delay(1500);
    const info = await mod.AdsConsent.requestInfoUpdate();
    if (
      info.status === mod.AdsConsentStatus.REQUIRED &&
      info.isConsentFormAvailable
    ) {
      await mod.AdsConsent.loadAndShowConsentFormIfRequired();
    }
  } catch {
    // Consent unavailable/failed — stay in the safe non-personalized mode.
  }
  await persistConsentMode(mod);
}

async function persistConsentMode(mod: NonNullable<AdsModule>): Promise<void> {
  try {
    const gdprApplies = await mod.AdsConsent.getGdprApplies();
    if (!gdprApplies) {
      // Outside the EEA / regulated US states → personalized targeting is fine.
      nonPersonalizedOnly = false;
      return;
    }
    const choices = await mod.AdsConsent.getUserChoices();
    if (choices.storeAndAccessInformationOnDevice === false) {
      // User refused storage/access on device → serve ads without tracking.
      nonPersonalizedOnly = true;
    } else if (choices.selectPersonalisedAds) {
      nonPersonalizedOnly = false;
    } else {
      nonPersonalizedOnly = true;
    }
  } catch {
    // Keep the safe default.
  }
}

// ---------------------------------------------------------------------------
// Interstitial ads (pre-loaded + frequency capped)
// ---------------------------------------------------------------------------

/** Show an interstitial at most once every 3 triggers. */
const INTERSTITIAL_EVERY_N = 3;
/** Never show an interstitial more often than once per 4 minutes. */
const INTERSTITIAL_MIN_GAP_MS = 4 * 60 * 1000;

let interstitialCounter = 0;
let lastInterstitialShownAt = 0;
let interstitialAd: any = null;

function ensureInterstitialLoaded(): void {
  const mod = getAdsModule();
  if (!mod || interstitialAd) return;
  try {
    interstitialAd = mod.InterstitialAd.createForAdRequest(
      ADS_INTERSTITIAL_UNIT_ID,
      getAdRequestOptions()
    );
    interstitialAd.addAdEventListener(mod.AdEventType.LOADED, () => {
      /* ad is ready to show */
    });
    interstitialAd.addAdEventListener(mod.AdEventType.CLOSED, () => {
      interstitialAd = null;
      ensureInterstitialLoaded();
    });
    interstitialAd.load();
  } catch {
    interstitialAd = null;
  }
}

/**
 * Call whenever a natural in-app checkpoint happens (category switch,
 * "Surprise Me", etc.). Internally caps frequency so users are never spammed.
 */
export function trackInterstitialCheckpoint(): void {
  ensureInterstitialLoaded();

  interstitialCounter += 1;
  if (interstitialCounter % INTERSTITIAL_EVERY_N !== 0) return;

  const now = Date.now();
  if (now - lastInterstitialShownAt < INTERSTITIAL_MIN_GAP_MS) return;

  const mod = getAdsModule();
  if (!mod || !interstitialAd || !interstitialAd.loaded) return;

  try {
    interstitialAd.show();
    lastInterstitialShownAt = now;
    interstitialAd = null;
  } catch {
    interstitialAd = null;
  }
}
