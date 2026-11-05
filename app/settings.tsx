import {
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import Text from "@/src/components/ScaledText";
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft,
  Bell,
  Info,
  Trash2,
  Sun,
  Moon,
  Smartphone,
} from "@/src/components/icons";
import { router } from "expo-router";
import {
  useAppStore,
  type AppUser,
  type ThemePreference,
} from "../store/useAppStore";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "../components/ConfirmationModal";
import AccountModal from "../components/AccountSettingsModal";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useModeTheme, useModeClasses } from "@/src/theme";

const getInitials = (user: AppUser | null): string => {
  if (!user) return "?";
  const name = user.fullName || user.username || user.email || "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "?";
};

export default function Settings() {
  const {
    mode,
    isDarkMode,
    themePreference,
    setThemePreference,
    language,
    setLanguage,
    notificationsEnabled,
    setNotificationsEnabled,
    user,
  } = useAppStore();
  const { palette } = useModeTheme();
  const mc = useModeClasses();
  const { t } = useTranslation();
  const notifications = notificationsEnabled;
  const [modalVisible, setModalVisible] = useState(false);
  const accountSheetRef = useRef<BottomSheetModal>(null);
  const appearanceSheetRef = useRef<BottomSheetModal>(null);
  const sheetSnapPoints = useMemo(() => ["45%"], []);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ title: "", description: "", onConfirm: () => {} });

  const { clearAllTasks, clearAllHabits } = useAppStore();

  const openClearTasksModal = useCallback(() => {
    setModalConfig({
      title: t("settings.deleteAllTasks"),
      description:
        t("settings.deleteAllTasksDesc") ||
        "Are you sure you want to delete all tasks? This action cannot be undone.",
      onConfirm: () => {
        clearAllTasks(mode);
        setModalVisible(false);
        router.replace("/");
      },
    });
    setModalVisible(true);
  }, [clearAllTasks, mode, t]);

  const openClearHabitsModal = useCallback(() => {
    setModalConfig({
      title: t("settings.deleteAllHabits"),
      description:
        t("settings.deleteAllHabitsDesc") ||
        "Are you sure you want to delete all habits? This action cannot be undone.",
      onConfirm: () => {
        clearAllHabits(mode);
        setModalVisible(false);
        router.replace("/");
      },
    });
    setModalVisible(true);
  }, [clearAllHabits, mode, t]);

  const iconColor = isDarkMode ? palette.accentText : palette.header;
  const trashColor = isDarkMode ? "#fca5a5" : "#dc2626";
  const rowDirection = language === "en" ? "flex-row-reverse" : "flex-row";
  const preferenceRowDirection = "flex-row";

  const screenColor = isDarkMode ? "#0F172A" : "#F7F8FC";
  const textColor = isDarkMode ? "#FFFFFF" : "#1A1A1A";
  const mutedColor = isDarkMode ? "#98A2B3" : "#64748B";
  const surfaceColor = isDarkMode
    ? "rgba(255,255,255,0.03)"
    : "rgba(0,0,0,0.03)";
  const surfaceBorderColor = isDarkMode
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.07)";
  const titleText = isDarkMode ? "text-white" : "text-[#1A1A1A]";
  const secondaryText = isDarkMode ? "text-white/50" : "text-black/50";
  const activeOptionBg = isDarkMode ? palette.interactive : palette.header;
  const activeOptionText = isDarkMode ? palette.header : "#FFFFFF";
  const themeLabels: Record<ThemePreference, string> = {
    light: t("settings.lightMode"),
    dark: t("settings.darkMode"),
    system: t("settings.systemMode"),
  };
  const appearanceSummary = `${themeLabels[themePreference]} • ${t(
    language === "ar" ? "settings.languageArabic" : "settings.languageEnglish",
  )}`;

  const selectLanguage = (nextLanguage: "ar" | "en") => {
    if (language !== nextLanguage) setLanguage(nextLanguage);
    appearanceSheetRef.current?.dismiss();
  };

  const renderSheetBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: screenColor }}
    >
      <Svg
        pointerEvents="none"
        width="100%"
        height={320}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Defs>
          <RadialGradient
            id="settingsModeGlow"
            cx="50%"
            cy="0%"
            rx="80%"
            ry="100%"
          >
            <Stop
              offset="0%"
              stopColor={palette.accent}
              stopOpacity={isDarkMode ? "0.14" : "0.05"}
            />
            <Stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height={320} fill="url(#settingsModeGlow)" />
      </Svg>

      {/* Header */}
      <View className="pt-14 pb-2 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-3"
          >
            <ChevronLeft
              size={22}
              color={iconColor}
              style={{
                transform: [{ rotate: language === "ar" ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>
          <Text
            className="flex-1 text-center text-lg font-bold"
            style={{ color: textColor }}
          >
            {t("settings.title")}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        {/* User Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => accountSheetRef.current?.present()}
          className="mb-6 mt-2"
        >
          <View
            className={`rounded-3xl border p-4 gap-2 items-center flex-row ${
              language === "ar" ? "flex-row" : ""
            }`}
            style={{
              backgroundColor: surfaceColor,
              borderColor: surfaceBorderColor,
            }}
          >
            <View className="flex-1">
              <Text
                className="mb-1 text-lg font-bold"
                style={{ color: textColor, textAlign: language === "ar" ? "right" : "left" }}
                numberOfLines={1}
              >
                {user?.fullName || user?.username || t("settings.username")}
              </Text>
              <Text
                className="text-sm"
                style={{ color: mutedColor, textAlign: language === "ar" ? "right" : "left" }}
                numberOfLines={1}
              >
                {user?.email || ""}
              </Text>
            </View>
            <View
              className={`w-14 h-14 rounded-full border items-center justify-center ${isDarkMode ? mc.accentBorderFull : mc.accentBorder}`}
              style={{ backgroundColor: surfaceColor }}
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  className="w-14 h-14 rounded-full"
                />
              ) : (
                <Text
                  className={`font-bold text-xl ${isDarkMode ? mc.darkInteractiveText : mc.textHeader}`}
                >
                  {getInitials(user)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <Text
          className="mb-4 px-3 text-sm font-bold"
          style={{ color: mutedColor, textAlign: language === "ar" ? "left" : "right" }}
        >
          {t("settings.preferences")}
        </Text>
        <View
          className="mb-4 overflow-hidden rounded-3xl border"
          style={{ backgroundColor: surfaceColor, borderColor: surfaceBorderColor }}
        >
          <Pressable
            onPress={() => appearanceSheetRef.current?.present()}
            className={`min-h-[72px] items-center px-4 py-3 ${preferenceRowDirection}`}
            style={{ borderBottomWidth: 1, borderBottomColor: surfaceBorderColor }}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: surfaceColor }}
            >
              <Sun size={20} color={iconColor} />
            </View>
            <View className="mx-3 flex-1">
              <Text
                className={`font-bold ${titleText}`}
                style={{
                  textAlign: language === "ar" ? "left" : "right",
                  writingDirection: language === "ar" ? "rtl" : "ltr",
                }}
              >
                {t("settings.appearanceLanguage")}
              </Text>
              <Text
                className={`mt-1 text-xs ${secondaryText}`}
                style={{
                  textAlign: language === "ar" ? "left" : "right",
                  writingDirection: language === "ar" ? "rtl" : "ltr",
                }}
              >
                {appearanceSummary}
              </Text>
            </View>
            <ChevronLeft
              size={18}
              color={isDarkMode ? "#94A3B8" : "#64748B"}
              style={{
                transform: [{ rotate: language === "ar" ? "0deg" : "180deg" }],
              }}
            />
          </Pressable>

          <View
            className={`min-h-[72px] items-center px-4 py-3 ${preferenceRowDirection}`}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: surfaceColor }}
            >
              <Bell size={20} color={iconColor} />
            </View>
            <Text
              className={`mx-3 flex-1 font-bold ${titleText}`}
              style={{
                textAlign: language === "ar" ? "left" : "right",
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {t("settings.notifications")}
            </Text>
            <Switch
              value={!!notifications}
              onValueChange={setNotificationsEnabled}
              trackColor={
                isDarkMode
                  ? { false: "#4b5563", true: palette.interactive }
                  : { false: "#d1d5db", true: palette.header }
              }
              thumbColor="#fff"
            />
          </View>

        </View>

        {/* Data Management */}
        <View className="mx-0 mt-4 mb-8">
          <Text
            className="mb-3 mr-1 px-3 text-sm font-bold"
            style={{ color: mutedColor, textAlign: language === "ar" ? "left" : "right" }}
          >
            {t("settings.dataManagement")}
          </Text>
          <View
            className="overflow-hidden rounded-3xl border"
            style={{ backgroundColor: surfaceColor, borderColor: surfaceBorderColor }}
          >
            <Pressable
              className={`min-h-[64px] items-center justify-between border-b px-4 py-3 ${rowDirection}`}
              style={{ borderBottomColor: surfaceBorderColor }}
              onPress={openClearTasksModal}
            >
              <Text className="font-bold text-red-600 dark:text-red-400">
                {t("settings.deleteAllTasks")}
              </Text>
              <Trash2 size={20} color={trashColor} />
            </Pressable>
            <Pressable
              className={`min-h-[64px] items-center justify-between px-4 py-3 ${rowDirection}`}
              onPress={openClearHabitsModal}
            >
              <Text className="font-bold text-red-600 dark:text-red-400">
                {t("settings.deleteAllHabits")}
              </Text>
              <Trash2 size={20} color={trashColor} />
            </Pressable>
          </View>
        </View>

        {/* More */}
        <View className="mx-0 mt-4 mb-8">
          <Text
            className="mb-3 mr-1 px-3 text-sm font-bold"
            style={{ color: mutedColor, textAlign: language === "ar" ? "left" : "right" }}
          >
            {t("settings.more")}
          </Text>
          {/* About App (full-width row, matches Data Management rows) */}
          <View
            className="overflow-hidden rounded-3xl border"
            style={{ backgroundColor: surfaceColor, borderColor: surfaceBorderColor }}
          >
            <Pressable
              className={`min-h-[64px] items-center justify-between px-4 py-3 ${rowDirection}`}
              onPress={() => router.push("../AboutApp")}
            >
              <Text className={`font-bold ${titleText}`}>
                {t("settings.aboutApp")}
              </Text>
              <Info size={20} color={iconColor} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <BottomSheetModal
        ref={appearanceSheetRef}
        index={0}
        snapPoints={sheetSnapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderSheetBackdrop}
        backgroundStyle={{
          borderRadius: 32,
          backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
        }}
        handleIndicatorStyle={{
          backgroundColor: isDarkMode ? "#64748B" : "#CBD5E1",
          width: 48,
        }}
      >
        <BottomSheetView className="px-5 pb-8">
          <Text className={`mt-4 text-center text-xl font-black ${titleText}`}>
            {t("settings.appearanceLanguage")}
          </Text>

          <Text className={`mb-3 mt-6 font-bold ${titleText}`}>
            {t("settings.theme")}
          </Text>
          <View
            className="flex-row gap-2"
            style={{ direction: language === "ar" ? "rtl" : "ltr" }}
          >
            {(["light", "dark", "system"] as const).map((preference) => {
              const selected = themePreference === preference;
              return (
                <Pressable
                  key={preference}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setThemePreference(preference)}
                  className="min-h-16 flex-1 items-center justify-center gap-1 rounded-2xl border px-2 py-2"
                  style={{
                    backgroundColor: selected
                      ? activeOptionBg
                      : surfaceColor,
                    borderColor: selected
                      ? activeOptionBg
                      : surfaceBorderColor,
                  }}
                >
                  {preference === "light" ? (
                    <Sun
                      size={18}
                      color={
                        selected
                          ? activeOptionText
                          : isDarkMode
                            ? "#CBD5E1"
                            : "#475569"
                      }
                    />
                  ) : preference === "dark" ? (
                    <Moon
                      size={18}
                      color={
                        selected
                          ? activeOptionText
                          : isDarkMode
                            ? "#CBD5E1"
                            : "#475569"
                      }
                    />
                  ) : (
                    <Smartphone
                      size={18}
                      color={
                        selected
                          ? activeOptionText
                          : isDarkMode
                            ? "#CBD5E1"
                            : "#475569"
                      }
                    />
                  )}
                  <Text
                    className="text-center text-sm font-bold"
                    style={{
                      color: selected
                        ? activeOptionText
                        : isDarkMode
                          ? "#CBD5E1"
                          : "#475569",
                    }}
                  >
                    {themeLabels[preference]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className={`mb-3 mt-6 font-bold ${titleText}`}>
            {t("settings.language")}
          </Text>
          <View
            className="flex-row gap-2"
            style={{ direction: language === "ar" ? "rtl" : "ltr" }}
          >
            {(
              [
                ["ar", t("settings.languageArabic")],
                ["en", t("settings.languageEnglish")],
              ] as const
            ).map(([nextLanguage, label]) => {
              const selected = language === nextLanguage;
              return (
                <Pressable
                  key={nextLanguage}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => selectLanguage(nextLanguage)}
                  className="min-h-11 flex-1 items-center justify-center rounded-2xl border px-2"
                  style={{
                    backgroundColor: selected
                      ? activeOptionBg
                      : surfaceColor,
                    borderColor: selected
                      ? activeOptionBg
                      : surfaceBorderColor,
                  }}
                >
                  <Text
                    className="text-center text-sm font-bold"
                    style={{
                      color: selected
                        ? activeOptionText
                        : isDarkMode
                          ? "#CBD5E1"
                          : "#475569",
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <ConfirmationModal
        isVisible={modalVisible}
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={() => {
          modalConfig.onConfirm();
        }}
        onCancel={() => setModalVisible(false)}
      />
      <AccountModal ref={accountSheetRef} />
    </View>
  );
}
