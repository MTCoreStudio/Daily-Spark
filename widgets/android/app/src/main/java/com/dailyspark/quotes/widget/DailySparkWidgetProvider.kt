package com.dailyspark.quotes.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.widget.RemoteViews

/**
 * Daily Spark home-screen widget (small / medium / large).
 * RemoteViews only (no fake taps) — tapping the widget opens the app.
 * Copy comes from DailySparkWidgetPrefs (SharedPreferences), so the widget
 * works offline and updates when the app writes the current Spark.
 */
class DailySparkWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS = "daily_spark_widget_prefs"

        fun prefs(context: Context): SharedPreferences =
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

        /** Notify all placed widgets that content changed (called from JS side). */
        fun notifyChanged(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, DailySparkWidgetProvider::class.java)
            )
            refresh(context, manager, ids)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        refresh(context, appWidgetManager, appWidgetIds)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == Intent.ACTION_TIME_CHANGED ||
            intent.action == Intent.ACTION_DATE_CHANGED ||
            intent.action == Intent.ACTION_TIMEZONE_CHANGED
        ) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, DailySparkWidgetProvider::class.java)
            )
            refresh(context, manager, ids)
        }
    }

    private fun refresh(context: Context, manager: AppWidgetManager, ids: IntArray) {
        if (ids.isEmpty()) return
        val p = prefs(context)
        val size = p.getString("size", "medium") ?: "medium"
        val layoutId = when (size) {
            "small" -> R.layout.daily_spark_widget_small
            "large" -> R.layout.daily_spark_widget_large
            else -> R.layout.daily_spark_widget_medium
        }
        for (id in ids) manager.updateAppWidget(id, buildWidget(context, p, layoutId))
    }

    private fun buildWidget(context: Context, p: SharedPreferences, layoutId: Int): RemoteViews {
// __KOTLIN_B__
        val views = RemoteViews(context.packageName, layoutId)
        val quote = p.getString("quote_text", "Every new day is a fresh chance to begin.")
        val author = p.getString("quote_author", "Unknown") ?: "Unknown"
        val category = p.getString("quote_category", "Motivation") ?: "Motivation"

        views.setTextViewText(R.id.widget_quote, "\u201C${quote ?: ""}\u201D")
        views.setTextViewText(R.id.widget_author, "— $author")

        if (layoutId != R.layout.daily_spark_widget_small) {
            views.setTextViewText(R.id.widget_category, category)
            views.setTextViewText(R.id.widget_countdown, countdownLabel(p))
        }

        views.setViewVisibility(R.id.widget_category, visibilityFor(p.getBoolean("show_category", true)))
        views.setViewVisibility(R.id.widget_author, visibilityFor(p.getBoolean("show_author", true)))
        views.setViewVisibility(R.id.widget_branding, visibilityFor(p.getBoolean("show_branding", true)))
        views.setViewVisibility(R.id.widget_countdown, visibilityFor(p.getBoolean("show_countdown", true)))

        val scale = when (p.getString("text_size", "medium")) {
            "small" -> 12f
            "large" -> 19f
            else -> 15f
        }
        views.setTextViewTextSize(R.id.widget_quote, android.util.TypedValue.COMPLEX_UNIT_SP, scale)
        views.setTextViewTextSize(R.id.widget_author, android.util.TypedValue.COMPLEX_UNIT_SP, scale * 0.8f)

        val gravity = when (p.getString("alignment", "center")) {
            "left" -> android.view.Gravity.START
            "right" -> android.view.Gravity.END
            else -> android.view.Gravity.CENTER_HORIZONTAL
        }
        views.setInt(R.id.widget_quote, "setGravity", gravity)
        views.setInt(R.id.widget_author, "setGravity", gravity)

        val bgResource = when (p.getString("background", "gradient")) {
            "aurora", "night" -> R.drawable.daily_spark_widget_bg_aurora
            "sunset", "motivational" -> R.drawable.daily_spark_widget_bg_sunset
            else -> R.drawable.daily_spark_widget_bg_dark
        }
        views.setInt(R.id.widget_root, "setBackgroundResource", bgResource)

        val openIntent = Intent(Intent.ACTION_VIEW)
            .setClassName(context.packageName, "com.dailyspark.quotes.MainActivity")
        val flags = if (android.os.Build.VERSION.SDK_INT >= 23) {
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        } else {
            android.app.PendingIntent.FLAG_UPDATE_CURRENT
        }
        views.setOnClickPendingIntent(
            R.id.widget_root,
            android.app.PendingIntent.getActivity(context, 0, openIntent, flags)
        )
        return views
    }

    private fun countdownLabel(p: SharedPreferences): String {
        val end = p.getLong("countdown_target_ms", 0L)
        if (end <= 0L) return "New Spark everyday"
        val diff = end - System.currentTimeMillis()
        if (diff <= 0L) return "New Spark now"
        val mins = (diff / 60_000L).coerceAtLeast(1L)
        val h = mins / 60L
        val m = mins % 60L
        return if (h > 0) "New Spark in ${h}h ${m}m" else "New Spark in ${m}m"
    }

    private fun visibilityFor(show: Boolean): Int =
        if (show) android.view.View.VISIBLE else android.view.View.GONE
}