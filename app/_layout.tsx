import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { IS_USER_APP } from "@/lib/app-variant";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/hooks/useTheme";
import { initAds } from "@/lib/ads";
import { trackEvent } from "@/services/analytics";
import { initDailyNotification, watchNotificationResponses } from "@/services/notifications";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }} initialRouteName="onboarding">
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quote/[id]" options={{ title: "Quote", headerBackTitle: "Back" }} />
      <Stack.Screen name="category/[id]" options={{ title: "Category", headerBackTitle: "Back" }} />
      <Stack.Screen name="author/[id]" options={{ title: "Author", headerBackTitle: "Back" }} />
      <Stack.Screen name="mood/index" options={{ title: "Mood", headerBackTitle: "Back" }} />
      <Stack.Screen name="mood/[mood]" options={{ title: "Mood", headerBackTitle: "Back" }} />
      <Stack.Screen name="surprise" options={{ title: "Spark of the Moment", headerBackTitle: "Back" }} />
      <Stack.Screen name="feed" options={{ title: "Spark Feed", headerBackTitle: "Back" }} />
      <Stack.Screen name="history" options={{ title: "Spark History", headerBackTitle: "Back" }} />
      <Stack.Screen name="studio/[id]" options={{ title: "Spark Studio", headerBackTitle: "Back" }} />
      <Stack.Screen name="widgets" options={{ title: "Widget Studio", headerBackTitle: "Back" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!IS_USER_APP) return;
    // Best-effort AdMob init; never blocks or throws in Expo Go / web.
    void initAds();
    // Firebase Analytics app-open event (see Firebase Console → Reports).
    trackEvent("app_open");
    // Daily reminder + deep-link routing when a notification is tapped.
    const unwatch = watchNotificationResponses();
    void initDailyNotification();
    return () => {
      if (typeof unwatch === "function") unwatch();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}