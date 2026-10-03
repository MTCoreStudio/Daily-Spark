import { Platform, Alert } from "react-native";
import { getAdsModule, getAdRequestOptions, isAdsAvailable } from "@/lib/ads";
import { getRewardedAdUnitId } from "@/lib/ads-config";

/**
 * Rewarded-Ad gated actions ("watch a short video to unlock this feature").
 *
 * The gate is OPTIONAL today — ads may not be filling, so the user can always
 * SKIP and proceed directly. A user who chooses "Watch ad" is only unlocked by
 * the EARNED_REWARD event — never merely because the ad was displayed.
 *
 * Outcomes:
 *   earned      → reward callback received
 *   skipped     → user dismissed the ad before earning
 *   unavailable → no fill / error / native module absent
 *   unsupported → environment cannot run rewarded ads (Expo Go / web)
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

/**
 * Presents the (optional) rewarded-ad prompt and runs `onProceed` when the user
 * either SKIPS or successfully earns the reward. The gate never blocks the
 * action permanently:
 *
 *   - web / Expo Go            → proceeds directly (no ads can run there)
 *   - native, module missing   → proceeds directly
 *   - native, "Skip"           → proceeds immediately
 *   - native, "Watch ad"       → proceeds only after EARNED_REWARD,
 *                                otherwise shows the honest outcome message
 */
export async function requestShareUnlock(onProceed: () => Promise<void>): Promise<void> {
  if (Platform.OS === "web" || !isAdsAvailable()) {
    await onProceed();
    return;
  }

  Alert.alert(
    "Unlock Share & Save",
    "Earn it by watching a short sponsored video, or skip and continue right away.",
    [
      {
        text: "Skip",
        style: "cancel",
        onPress: () => {
          void onProceed();
        },
      },
      {
        text: "Watch ad",
        onPress: () => {
          void (async () => {
            const result = await unlockWithRewardedAd();
            if (result.unlocked) {
              await onProceed();
              return;
            }
            Alert.alert("Not yet unlocked", rewardOutcomeMessage(result.outcome));
          })();
        },
      },
    ]
  );
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