import "../global.css";
import "../i18next/i18n";
import { Stack, router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/supabase";
import type { Session } from "@supabase/supabase-js";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "../components/SplashScreen";
import { storage, STORAGE_KEYS } from "@/src/services/storage";
import {
  setupNotificationChannels,
  requestExactAlarmIfNeeded,
} from "@/src/services/notificationService";

// ❌ احذف السطر القديم من هنا تماماً لمنع فشل الـ Export

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const { isDarkMode, checkAndResetDailyHabits, cancelPastDueNotifications } = useAppStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function handleSplashAndReady() {
      try {
        // ✅ انقل أمر المنع هنا داخل الـ useEffect ليكون آمناً أثناء البناء
        await SplashScreen.preventAutoHideAsync();
        
        // تشغيل الـ Habits والـ Theme
        checkAndResetDailyHabits();
        cancelPastDueNotifications();

        // تهيئة قناة الإشعارات عالية الأولوية + فحص إذن الـ Exact Alarm
        setupNotificationChannels().catch((e) =>
          console.warn("Channel setup failed:", e),
        );
        requestExactAlarmIfNeeded().catch((e) =>
          console.warn("Exact alarm check failed:", e),
        );
        
        // الخدعة: نخفي سبلاش النظام فوراً ليظهر السبلاش المخصص حقك
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }
    
    handleSplashAndReady();
  }, [checkAndResetDailyHabits, cancelPastDueNotifications]);

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

  // ───── Auth session → store binding ─────
  useEffect(() => {
    let active = true;
    const applySessionUser = (session: Session | null) => {
      if (!active) return;
      const user = session?.user;
      if (user) {
        useAppStore.getState().setUser({
          id: user.id,
          email: user.email ?? undefined,
          username: (user.user_metadata?.username as string) ?? undefined,
          fullName: (user.user_metadata?.full_name as string) ?? undefined,
          avatarUrl: (user.user_metadata?.avatar_url as string) ?? undefined,
        });
      } else {
        // Signed out / no session: clear user-scoped data from the store
        useAppStore.getState().setUser(null);
      }
    };

    // Restore the persisted session on app start
    supabase.auth
      .getSession()
      .then(({ data }) => {
        applySessionUser(data.session);
        // Pull the latest profile row from the server (no-op when offline)
        useAppStore.getState().refreshProfileFromServer();
      })
      .catch((e) => console.warn("Failed to restore auth session:", e));

    // Keep the store in sync on login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySessionUser(session);
        if (session?.user) {
          // Reconcile with the server profile and flush any queued edits
          // (also covers fresh sign-ins, not just cold starts)
          useAppStore.getState().refreshProfileFromServer();
          useAppStore.getState().syncPendingProfile();
        }
      },
    );
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data = response.notification.request.content.data as any;
          if (data?.itemId) {
            const mode: "study" | "coding" | "faith" =
              data.mode === "coding"
                ? "coding"
                : data.mode === "faith"
                  ? "faith"
                  : "study";
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