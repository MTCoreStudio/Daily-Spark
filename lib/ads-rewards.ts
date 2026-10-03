import { Platform } from "react-native";
import { getAdsModule, getAdRequestOptions, isAdsAvailable } from "@/lib/ads";
import { getRewardedAdUnitId } from "@/lib/ads-config";

/**
 * Rewarded-Ad gated actions ("watch a short video to unlock this feature").
 *
 * An action (share/save image) is only unlocked after Google reports the
 * reward was EARNED — never merely because the ad was displayed. Outcomes:
 *
 *   earned      → reward callback received → caller may proceed
 *   skipped     → user closed/dismissed before earning
 *   unavailable → ad unavailable (no fill / error / native module absent)
 *   unsupported → environment cannot run rewarded ads (Expo Go / web)
 *
 * The caller decides the message; the app never unlocks without "earned".
 */

export type RewardOutcome = "earned" | "skipped" | "unavailable" | "unsupported";

export interface RewardResult {
  unlocked: boolean;
  outcome: RewardOutcome;
}

const REWARD_TIMEOUT_MS = 20_000;

/** Run the rewarded-ad flow for the action the user just requested. */
export async function unlockWithRewardedAd(): Promise<RewardResult> {
  if (Platform.OS === "web") {
    // Native ads cannot run in the web build.
    return { unlocked: false, outcome: "unsupported" };
  }
  const mod = getAdsModule();
  if (!mod || !isAdsAvailable()) {
    return { unlocked: false, outcome: "unavailable" };
  }
  const RewardedAd = mod.RewardedAd;
  const RewardedAdEventType = mod.RewardedAdEventType;
  const AdEventType = mod.AdEventType;
  if (!RewardedAd || !RewardedAdEventType || !AdEventType) {
    return { unlocked: false, outcome: "unavailable" };
  }

  let ad: any = null;
  try {
    ad = RewardedAd.createForAdRequest(getRewardedAdUnitId(), getAdRequestOptions());
  } catch {
    return { unlocked: false, outcome: "unavailable" };
  }

  return new Promise<RewardResult>((resolve) => {
    let settled = false;
    const cleanup: (() => void)[] = [];
    const finish = (outcome: RewardOutcome) => {
      if (settled) return;
      settled = true;
      for (const fn of cleanup) {
        try {
          fn();
        } catch {}
      }
      try {
        ad?.destroy?.();
      } catch {}
      resolve({ unlocked: outcome === "earned", outcome });
    };

    try {
      cleanup.push(
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => finish("earned"))
      );
      cleanup.push(
        ad.addAdEventListener(AdEventType.CLOSED, () => finish("skipped"))
      );
      cleanup.push(
        ad.addAdEventListener(AdEventType.LOADED, () => {
          try {
            ad.show();
          } catch {
            finish("unavailable");
          }
        })
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      cleanup.push(
        ad.addAdEventListener(AdEventType.ERROR, () => finish("unavailable"))
      );
    } catch {
      finish("unavailable");
      return;
    }

    try {
      ad.load();
    } catch {
      finish("unavailable");
      return;
    }

    // Safety net: if Google never reports anything, never block the user forever.
    setTimeout(() => finish("unavailable"), REWARD_TIMEOUT_MS);
  });
}

/** Human label for the outcome (messaging belongs to the UI layer). */
export function rewardOutcomeMessage(outcome: RewardOutcome): string {
  switch (outcome) {
    case "skipped":
      return "Watch the full video to unlock this feature.";
    case "unavailable":
      return "Rewarded ad isn't available right now. Please try again later.";
    case "unsupported":
      return "Rewarded ads are available in the Android build.";
    case "earned":
      return "";
  }
}