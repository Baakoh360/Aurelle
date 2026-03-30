import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { NotificationScheduler } from "@/components/NotificationScheduler";
import { AppStoreProvider } from "@/hooks/useAppStore";
import { ChatStoreProvider } from "@/hooks/useChatStore";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: "#FFF5F9" },
      headerTintColor: "#FF6B9D",
      headerTitleStyle: { fontWeight: "600" },
      contentStyle: { backgroundColor: "#FFF5F9" },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="insight" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // FIX: wrapped in catch to avoid unhandled promise rejection
    SplashScreen.hideAsync().catch((e) =>
      console.warn("[SplashScreen] hideAsync failed:", e)
    );
  }, []);

  useEffect(() => {
    // FIX: added shouldShowAlert for Expo SDK <50 compatibility
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }}>
            <AppStoreProvider>
              <ChatStoreProvider>
                <NotificationScheduler />
                <RootLayoutNav />
              </ChatStoreProvider>
            </AppStoreProvider>
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}