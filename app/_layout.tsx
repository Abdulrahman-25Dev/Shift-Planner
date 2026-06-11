import "../global.css";
import "../i18next/i18n"; // تأكد من استيراد ملف i18n
import { Stack, router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "@/store/useAppStore";
import * as Notifications from "expo-notifications";
export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const { isDarkMode, checkAndResetDailyHabits } = useAppStore();

  useEffect(() => {
    // Check and reset daily habits when app boots
    checkAndResetDailyHabits();
  }, [checkAndResetDailyHabits]);

  useEffect(() => {
    // هنا السحر: نحدث وضع nativewind كل ما تغير الستور
    setColorScheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode, setColorScheme]);

  useEffect(() => {
    // Listen for taps on notifications and navigate/open the correct mode
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data = response.notification.request.content.data as any;
          if (data?.itemId) {
            const mode = data.mode === "coding" ? "coding" : "study";
            const type = data.notificationType === "habit" ? "habit" : "task";
            // set app mode and store pending item
            useAppStore.getState().setMode(mode);
            useAppStore
              .getState()
              .setPendingOpenItem({ id: data.itemId, type });
            // navigate to root so Index can open details sheet
            router.replace("/");
          }
        } catch (e) {
          console.warn("Notification response handling error:", e);
        }
      },
    );
    return () => sub.remove();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
