# Daily Spark — Android Home-Screen Widgets

Status: **architecture + native template + in-app designer on Android; requires a
development build to activate.** Widgets do not run in Expo Go.

## How it fits the Expo setup

Daily Spark is an **Expo managed (CNG) app** — there is no committed `android/`
folder. EAS Build generates the native project on the cloud from `app.json`
(*continuous native generation*). That is exactly why the widget is delivered as
an **opt-in Expo config plugin**:

```
app.json
  └─ plugins: [ "plugins/withDailySparkWidgets" ]   ← optional, currently OFF
```

When enabled, `expo prebuild` / EAS copies the native widget sources
(`widgets/android/`) into the Android project and registers the
`AppWidgetProvider` + `appwidget-provider` metadata.

## Widget Studio (in-app)

`app/widgets.tsx` is a fully functional designer:

- **Sizes** — Small / Medium / Large (with live preview)
- **Backgrounds** — Minimal, Dark, Light, Gradient, Aurora, Sunset, Ocean, Forest, Elegant
- **Text** — small / medium / large
- **Alignment** — left / center / right
- **Content on/off** — Category, Author, Branding, Countdown
- **Quote source** — Today's Spark, Random Spark, Favorite Spark, Selected Category, Selected Quote
- **Refresh hint** — 1h / 3h / 6h / 12h / Daily

The configuration is persisted in AsyncStorage (`ds_widget_config`). From any
quote, "Add to Widget" opens the Studio pre-configured with that quote.

## Native implementation

| Piece | Path |
|---|---|
| `AppWidgetProvider` (Kotlin) | `widgets/android/.../DailySparkWidgetProvider.kt` |
| Provider metadata | `widgets/android/.../res/xml/daily_spark_widget_info.xml` |
| Small / Medium / Large layouts | `widgets/android/.../res/layout/daily_spark_widget_{small,medium,large}.xml` |
| Gradient backgrounds | `widgets/android/.../res/drawable/daily_spark_widget_bg_{dark,aurora,sunset}.xml` |
| Config plugin | `plugins/withDailySparkWidgets.js` |

Behaviour:

- **Tap the widget** → opens the app (PendingIntent → MainActivity). No fake
  buttons; Android widgets can't host real app-fragment taps.
- **Refresh** → `updatePeriodMillis` = 6h plus explicit re-render on
  `ACTION_TIME_CHANGED`, `ACTION_DATE_CHANGED`, `ACTION_TIMEZONE_CHANGED`
  (handles midnight rollover and timezone changes). Android may *relax* these
  intervals (Doze/standby) — refresh timing is best-effort by design.
- **Data** → the app writes the current Spark + config to SharedPreferences
  (`daily_spark_widget_prefs`); the provider renders RemoteViews from it, fully
  offline.
- **Removal / reconfiguration** → handled by the system via the standard
  `appwidget-provider` metadata (resize modes, categories).

## Required to test (development build)

```bash
# 1. enable the plugin
#    app.json → plugins: add ["plugins/withDailySparkWidgets", {}]
# 2. install the JS bridge (writes quote/config into SharedPreferences)
npm install react-native-android-widget     # or implement the small NativeModule
# 3. prebuild + run on a device
npx expo prebuild --platform android
npx expo run:android                        # development build
# 4. Add the widget: long-press Home → Widgets → Daily Spark
```

## Documented limitations

- Requires a **development build** (Expo Go cannot run widgets).
- Refresh intervals are **best-effort** — Android decides.
- Widget text uses platform fonts (DMSans is app-only; system sans used in RemoteViews).
- The Kotlin/plugin template is provided for integration — enabling it means
  switching the Android build to CNG-with-plugin, so verify with a dev build
  before shipping a production bundle.