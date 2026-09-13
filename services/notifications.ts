import { Platform } from "react-native";
import { getDailyQuote } from "@/lib/quote-service";
import { go } from "@/lib/navigation";

/**
 * Daily "Spark" local notification.
 *
 * Schedules a repeating local notification every morning at DAILY_HOUR so users
 * are nudged back to open today's quote (which drives the streak). Works
 * entirely offline, needs no server/push infra, and is a no-op on web or when
 * permission is denied. Tapping the notification deep-links to today's quote.
 *
 * NOTE: `expo-notifications` is resolved lazily (never at module scope). Expo Go
 * removed push-notifications (SDK 53+), so importing it at the top level throws
 * inside Expo Go and would crash the app. In real native builds it still works.
 */

const NOTIF_ID = "daily-spark-qotd";
const DAILY_HOUR = 8; // 8:00 AM local time.

const SCREEN_KEY = "screen";
const SCREEN_QOTD = "quote-of-the-day";

// eslint-disable-next-line @typescript-eslint/no-var-requires
function getNotifications(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-notifications");
  } catch {
    return null;
  }
}

/** Ask for permission (if needed) and (re)schedule the daily reminder. */
export async function initDailyNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    let status = (await Notifications.getPermissionsAsync()).status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return;

    // Cancel any previously scheduled instance so we never stack duplicates.
    await Notifications.cancelScheduledNotificationAsync(NOTIF_ID).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_ID,
      content: {
        title: "Daily Spark",
        body: "Your Spark for today is ready. Open it to keep your streak alive.",
        sound: "default",
        data: { [SCREEN_KEY]: SCREEN_QOTD },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: DAILY_HOUR,
        minute: 0,
      },
    });
  } catch {
    // Never let a notification failure break the app.
  }
}

/** Route a tapped notification to the right screen. */
async function handleResponse(
  response: any // expo-notifications NotificationResponse
): Promise<void> {
  if (!response) return;
  try {
    const data = response.notification.request.content.data as Record<string, unknown> | null;
    if (data && data[SCREEN_KEY] === SCREEN_QOTD) {
      const quote = await getDailyQuote();
      go(`/quote/${encodeURIComponent(String(quote.id))}`);
    }
  } catch {
    go("/");
  }
}

/**
 * Called once at app start. Registers the tap listener and, if the app was
 * cold-started by tapping a notification, routes the initial response.
 * Returns a cleanup function.
 */
export function watchNotificationResponses(): () => void {
  if (Platform.OS === "web") return () => {};
  const Notifications = getNotifications();
  if (!Notifications) return () => {};
  // Cold start via notification tap.
  Notifications.getLastNotificationResponseAsync()
    .then((r: any) => handleResponse(r))
    .catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener((r: any) =>
    handleResponse(r)
  );
  return () => sub.remove();
}