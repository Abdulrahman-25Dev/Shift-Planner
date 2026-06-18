import "../global.css";
import "../i18next/i18n";
import { Stack, router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "@/store/useAppStore";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "../components/SplashScreen";
import { storage, STORAGE_KEYS } from "@/src/services/storage";

// ❌ احذف السطر القديم من هنا تماماً لمنع فشل الـ Export

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const { isDarkMode, checkAndResetDailyHabits } = useAppStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function handleSplashAndReady() {
      try {
        // ✅ انقل أمر المنع هنا داخل الـ useEffect ليكون آمناً أثناء البناء
        await SplashScreen.preventAutoHideAsync();
        
        // تشغيل الـ Habits والـ Theme
        checkAndResetDailyHabits();
        
        // الخدعة: نخفي سبلاش النظام فوراً ليظهر السبلاش المخصص حقك
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }
    
    handleSplashAndReady();
  }, [checkAndResetDailyHabits]);

  // ───── Onboarding redirect ─────
  useEffect(() => {
    if (!appIsReady) return;
    const hasSeenOnboarding = storage.getBoolean(STORAGE_KEYS.hasSeenOnboarding);
    if (!hasSeenOnboarding) {
      router.replace("/onboarding/StuScreen");
    }
  }, [appIsReady]);
  // ────────────────────────────────

  useEffect(() => {
    setColorScheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode, setColorScheme]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data = response.notification.request.content.data as any;
          if (data?.itemId) {
            const mode = data.mode === "coding" ? "coding" : "study";
            const type = data.notificationType === "habit" ? "habit" : "task";
            useAppStore.getState().setMode(mode);
            useAppStore
              .getState()
              .setPendingOpenItem({ id: data.itemId, type });
            router.replace("/");
          }
        } catch (e) {
          console.warn("Notification response handling error:", e);
        }
      },
    );
    return () => sub.remove();
  }, []);

  if (!appIsReady) {
    return <CustomSplashScreen onFinish={() => setAppIsReady(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}