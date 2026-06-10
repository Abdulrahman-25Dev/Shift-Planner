import "../global.css";
import "../i18next/i18n"; // تأكد من استيراد ملف i18n
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "@/store/useAppStore";
export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const { isDarkMode } = useAppStore(); // القيمة من الستور حقك

  useEffect(() => {
    // هنا السحر: نحدث وضع nativewind كل ما تغير الستور
    setColorScheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode, setColorScheme]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
