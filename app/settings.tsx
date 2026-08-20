import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import React, { useState, useCallback, useRef } from "react";
import {
  ArrowRight,
  Globe,
  Bell,
  Info,
  Trash2,
  Moon,
  Sun,
  ALargeSmall,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAppStore, type AppUser } from "../store/useAppStore";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "../components/ConfirmationModal";
import AccountModal from "../components/AccountSettingsModal";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
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
    toggleDarkMode,
    isDarkMode,
    language,
    setLanguage,
    notificationsEnabled,
    setNotificationsEnabled,
    fontScale,
    setFontScale,
    user,
  } = useAppStore();
  const { palette } = useModeTheme();
  const mc = useModeClasses();
  const { t } = useTranslation();
  const notifications = notificationsEnabled;
  const [modalVisible, setModalVisible] = useState(false);
  const accountSheetRef = useRef<BottomSheetModal>(null);
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

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  // Font scale factor controls: 0.5 → 1.5, stepping by 0.25, default 1.0
  const FONT_SCALE_MIN = 0.5;
  const FONT_SCALE_MAX = 1.5;
  const FONT_SCALE_STEP = 0.25;
  const decreaseFontSize = () => {
    setFontScale(Math.max(FONT_SCALE_MIN, fontScale - FONT_SCALE_STEP));
  };
  const increaseFontSize = () => {
    setFontScale(Math.min(FONT_SCALE_MAX, fontScale + FONT_SCALE_STEP));
  };
  // Formats the scale for display (e.g. 1 → "1.0", 1.25 → "1.25")
  const formatScale = (n: number) => {
    const s = n.toFixed(2).replace(/\.?0+$/, "");
    return s.includes(".") ? s : `${s}.0`;
  };

  const iconColor = isDarkMode ? palette.accentText : palette.header;
  const trashColor = isDarkMode ? "#fca5a5" : "#dc2626";

  const cardBg = isDarkMode ? mc.darkCard : "bg-white";
  const iconCircleBg = isDarkMode ? mc.darkAccentSoft : mc.accentSoft;
  const titleText = isDarkMode ? "text-gray-100" : "text-gray-800";
  const labelText = isDarkMode ? mc.darkInteractiveText : mc.textHeader;

  const shadowStyle = {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  };

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-screen-dark" : "bg-screen-light"}`}
    >
      {/* Header */}
      <View className="pt-14 pb-2 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-3 rounded-2xl ${iconCircleBg}`}
          >
            <ArrowRight size={22} color={iconColor} />
          </TouchableOpacity>
          <Text
            className={` text-lg font-bold flex-1 text-center ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
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
            className={`${cardBg} rounded-3xl p-4 items-center justify-between flex-row`}
          >
            <View className="flex-col items-end">
              <Text
                className={`text-lg font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                numberOfLines={1}
              >
                {user?.fullName || user?.username || t("settings.username")}
              </Text>
              <Text
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                numberOfLines={1}
              >
                {user?.email || ""}
              </Text>
            </View>
            <View
              className={`w-14 h-14 rounded-full border items-center justify-center ${iconCircleBg} ${isDarkMode ? mc.accentBorderFull : mc.accentBorder}`}
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
          <Text
            className={` text-sm text-center font-bold px-3 mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {t("settings.editProfile")}
          </Text>
        </TouchableOpacity>

        {/* Settings Grid - 2 Columns */}
        <Text
          className={` text-sm font-bold px-3 mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"} ${language === "ar" ? "text-left" : "text-right"}`}
        >
          {t("settings.preferences")}
        </Text>
        <View className="flex-row flex-wrap justify-between mb-4">
          {/* Card 1: Theme */}
          <View
            className={`w-[48%] ${cardBg} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
          >
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${iconCircleBg}`}
            >
              {isDarkMode ? (
                <Moon size={24} color={iconColor} />
              ) : (
                <Sun size={24} color={iconColor} />
              )}
            </View>
            <Text
              className={` text-sm font-bold mt-3 text-center mb-2 ${titleText}`}
            >
              {isDarkMode ? t("settings.darkMode") : t("settings.lightMode")}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={
                isDarkMode
                  ? { false: "#4b5563", true: palette.interactive }
                  : { false: "#d1d5db", true: palette.header }
              }
              thumbColor="#fff"
            />
          </View>

          {/* Card 2: Language */}
          <TouchableOpacity
            className={`w-[48%] ${cardBg} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
            onPress={toggleLanguage}
          >
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${iconCircleBg}`}
            >
              <Globe size={24} color={iconColor} />
            </View>
            <View className="mt-3 items-center justify-center">
              <Text className={` text-sm font-bold text-center ${titleText}`}>
                {t("settings.language")}
              </Text>
              <View className="mt-2 flex-row items-center justify-center">
                <Text
                  className={`text-base font-bold p-2 rounded-3xl ${language === "ar" ? (isDarkMode ? mc.darkInteractiveText : mc.textHeader) : isDarkMode ? "text-slate-300" : "text-slate-500"}`}
                >
                  ع
                </Text>
                <Text
                  className={`text-sm font-bold mx-2 ${isDarkMode ? "text-slate-200" : "text-slate-500"}`}
                >
                  |
                </Text>
                <Text
                  className={`text-base font-bold p-2 rounded-3xl ${language === "en" ? (isDarkMode ? mc.darkInteractiveText : mc.textHeader) : isDarkMode ? "text-slate-300" : "text-slate-500"}`}
                >
                  En
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Font Size */}
          <View
            className={`w-[48%] ${cardBg} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
          >
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${iconCircleBg}`}
            >
              <ALargeSmall size={24} color={iconColor} />
            </View>
            <Text
              className={` text-sm font-bold mt-3 text-center mb-2 ${titleText}`}
            >
              {t("settings.fontSize")}
            </Text>
<View className="flex-row items-center justify-center">
              <TouchableOpacity
                onPress={increaseFontSize}
                className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                  isDarkMode ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <Text className={`font-black text-lg ${titleText}`}>A+</Text>
              </TouchableOpacity>
              <Text className={`font-bold text-base ${titleText}`}>
                {formatScale(fontScale)}
              </Text>
              <TouchableOpacity
                onPress={decreaseFontSize}
                className={`w-9 h-9 rounded-full items-center justify-center ml-3 ${
                  isDarkMode ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <Text className={`font-black text-base ${titleText}`}>A-</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 4: Notifications */}
          <View
            className={`w-[48%] ${cardBg} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
          >
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${iconCircleBg}`}
            >
              <Bell size={24} color={iconColor} />
            </View>
            <Text
              className={` text-sm font-bold mt-3 text-center mb-2 ${titleText}`}
            >
              {t("settings.notifications")}
            </Text>
            <Switch
              value={!!notifications}
              onValueChange={async (v) => {
                // toggle via store which will request permission and schedule/cancel
                await setNotificationsEnabled(v);
              }}
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
            className={` text-sm font-bold mb-3 px-3 mr-1 ${labelText} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {t("settings.dataManagement")}
          </Text>
          <View className={`${cardBg} rounded-3xl`} style={shadowStyle}>
            <Pressable
              className={`flex-row-reverse items-center justify-between p-4 ${cardBg} rounded-t-3xl`}
              onPress={openClearTasksModal}
            >
              <View
                className={
                  " items-center pl-4 justify-between flex-1" +
                  (language === "ar" ? " flex-row-reverse" : " flex-row")
                }
              >
                <View className="w-10 h-10 rounded-2xl items-center justify-center bg-red-50 dark:bg-red-900">
                  <Trash2 size={20} color={trashColor} />
                </View>
                <Text className="mr-3 text-red-600 text-right font-bold">
                  {t("settings.deleteAllTasks")}
                </Text>
              </View>
            </Pressable>
            <Pressable
              className={`flex-row-reverse items-center justify-between p-4 ${cardBg} rounded-b-3xl`}
              onPress={openClearHabitsModal}
            >
              <View
                className={
                  " items-center pl-4 justify-between flex-1" +
                  (language === "ar" ? " flex-row-reverse" : " flex-row")
                }
              >
                <View className="w-10 h-10 rounded-2xl items-center justify-center bg-red-50 dark:bg-red-900">
                  <Trash2 size={20} color={trashColor} />
                </View>
                <Text className="mr-3 text-red-600 text-right font-bold">
                  {t("settings.deleteAllHabits")}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* More */}
        <View className="mx-0 mt-4 mb-8">
          <Text
            className={` text-sm font-bold mb-3 px-3 mr-1 ${labelText} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {t("settings.more")}
          </Text>
          {/* About App (full-width row, matches Data Management rows) */}
          <View className={`${cardBg} rounded-3xl`} style={shadowStyle}>
            <Pressable
              className={`flex-row-reverse items-center justify-between p-4 ${cardBg} rounded-3xl`}
              onPress={() => router.push("../AboutApp")}
            >
              <View
                className={
                  " items-center pl-4 justify-between flex-1" +
                  (language === "ar" ? " flex-row-reverse" : " flex-row")
                }
              >
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${iconCircleBg}`}
                >
                  <Info size={20} color={iconColor} />
                </View>
                <Text className={`text-right font-bold ${titleText}`}>
                  {t("settings.aboutApp")}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
