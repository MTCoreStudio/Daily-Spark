/**
 * AdMob unit configuration with strict environment separation.
 *
 *   ADS_ENV = "test"        (default — development)
 *   ADS_ENV = "production"  (set via eas.json build env)
 *
 * In test mode the Google-official `TestIds` units are used so development
 * never generates impressions on the production ad units. Production unit IDs
 * are only ever resolved when the build profile sets ADS_ENV=production.
 * The module path is never resolvable in Expo Go / web, so this module only
 * touches it lazily and guarded (see lib/ads.ts → isAdsAvailable()).
 */

export type AdsEnv = "test" | "production";

export const ADS_ENV: AdsEnv =
  process.env.EXPO_PUBLIC_ADS_ENV === "production" ? "production" : "test";

export const IS_PRODUCTION_ADS = ADS_ENV === "production";

/** Production Rewarded Ad unit (owner-supplied; release configuration only). */
export const REWARDED_AD_UNIT_PROD = "ca-app-pub-1463792620515064/8379292623";

/** Production Native Advanced Ad unit (owner-supplied; release configuration only). */
export const NATIVE_AD_UNIT_PROD = "ca-app-pub-1463792620515064/8458174511";

// eslint-disable-next-line @typescript-eslint/no-var-requires
function getTestIds(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-google-mobile-ads")?.TestIds ?? null;
  } catch {
    return null;
  }
}

/** Resolves the Rewarded Ad unit for the current build environment. */
export function getRewardedAdUnitId(): string {
  if (IS_PRODUCTION_ADS) return REWARDED_AD_UNIT_PROD;
  return String(getTestIds()?.REWARDED ?? "ca-app-pub-3940256099942544/5354049011");
}

/** Resolves the Native Advanced Ad unit for the current build environment. */
export function getNativeAdUnitId(): string {
  if (IS_PRODUCTION_ADS) return NATIVE_AD_UNIT_PROD;
  return String(getTestIds()?.NATIVE ?? "ca-app-pub-3940256099942544/2247696110");
}