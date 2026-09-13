module.exports = ({ config }) => {
  const baseConfig = config;
  const variant =
    process.env.EXPO_PUBLIC_APP_VARIANT === "admin" ? "admin" : "user";
  const isUserApp = variant === "user";

  return {
    ...baseConfig,
    name: isUserApp
      ? "Daily Spark – Motivational Quotes from everywhere"
      : "Daily Spark Admin",
    slug: "daily-spark",
    plugins: [
      ...(baseConfig.plugins ?? []),
      "expo-image",
      "expo-sharing",
      "expo-splash-screen",
      "expo-status-bar",
    ],
    scheme: isUserApp ? "dailyspark" : "dailysparkadmin",
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: isUserApp
        ? "com.dailyspark.quotes"
        : "com.dailyspark.admin",
    },
    android: {
      ...baseConfig.android,
      package: isUserApp
        ? "com.dailyspark.quotes"
        : "com.dailyspark.admin",
      blockedPermissions: isUserApp
        ? [
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.ACCESS_MEDIA_LOCATION",
            "android.permission.CAMERA",
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.READ_MEDIA_IMAGES",
            "android.permission.READ_MEDIA_VIDEO",
            "android.permission.RECORD_AUDIO",
            "android.permission.WRITE_EXTERNAL_STORAGE",
          ]
        : baseConfig.android?.blockedPermissions,
    },
    extra: {
      ...baseConfig.extra,
      appVariant: variant,
    },
  };
};