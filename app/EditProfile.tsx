import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { ArrowRight, Camera, CheckCircle2, WifiOff } from "lucide-react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppStore, type AppUser } from "../store/useAppStore";
import { useTranslation } from "react-i18next";
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

export default function EditProfile() {
  const { user, updateProfile, profileSyncState, isDarkMode, language } =
    useAppStore();
  const { palette } = useModeTheme();
  const mc = useModeClasses();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | undefined>(
    undefined,
  );
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);

  const avatarUri = avatarLocalUri || user?.avatarUrl;
  const canSave = fullName.trim().length > 0 && !saving;

  const iconColor = isDarkMode ? palette.accentText : palette.header;
  const iconCircleBg = isDarkMode ? mc.darkAccentSoft : mc.accentSoft;
  const titleText = isDarkMode ? "text-gray-100" : "text-gray-800";
  const subText = isDarkMode ? "text-slate-400" : "text-gray-500";

  const syncBanner = useMemo(() => {
    if (profileSyncState === "syncing") {
      return {
        icon: <ActivityIndicator size={16} color={palette.accentText} />,
        label: t("settings.profileSyncing"),
      };
    }
    if (profileSyncState === "pending") {
      return {
        icon: <WifiOff size={16} color="#f59e0b" />,
        label: t("settings.profileSyncPending"),
      };
    }
    if (profileSyncState === "synced") {
      return {
        icon: <CheckCircle2 size={16} color="#22c55e" />,
        label: t("settings.profileSynced"),
      };
    }
    return null;
  }, [profileSyncState, palette.accentText, t]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setAvatarLocalUri(result.assets[0].uri);
      }
    } finally {
      setPicking(false);
    }
  };

  const handleSave = async () => {
    const name = fullName.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      await updateProfile({
        fullName: name,
        avatarLocalUri: avatarLocalUri || undefined,
      });
      router.back();
    } finally {
      setSaving(false);
    }
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
            className={`text-lg font-bold flex-1 text-center ${titleText}`}
          >
            {t("settings.editProfile")}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <View className="flex-1 px-6 pt-8">
        {/* Avatar */}
        <View className="items-center mb-8">
          <Pressable onPress={pickImage} disabled={picking}>
            <View className="relative">
              <View
                className={`w-32 h-32 rounded-full border-4 items-center justify-center ${iconCircleBg} ${isDarkMode ? mc.accentBorderFull : mc.accentBorder}`}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="w-32 h-32 rounded-full"
                  />
                ) : (
                  <Text
                    className={`font-black text-4xl ${isDarkMode ? mc.darkInteractiveText : mc.textHeader}`}
                  >
                    {getInitials(user)}
                  </Text>
                )}
              </View>
              <View
                className="absolute -bottom-1 -left-1 w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: palette.interactive }}
              >
                {picking ? (
                  <ActivityIndicator size={18} color="#fff" />
                ) : (
                  <Camera size={18} color={isDarkMode ? "#000" : "#fff"} />
                )}
              </View>
            </View>
          </Pressable>
          <Text className={`text-sm font-bold mt-3 ${subText}`}>
            {t("settings.changePhoto")}
          </Text>
        </View>

        {/* Sync status */}
        {syncBanner && (
          <View
            className={`${language === "ar" ? "flex-row" : "flex-row-reverse"} items-center gap-2 justify-center rounded-2xl px-4 py-3 mb-5 ${isDarkMode ? "bg-slate-800/60" : "bg-slate-100"}`}
          >
            {syncBanner.icon}
            <Text className={`text-xs font-bold mx-2 ${subText} ${language === "ar" ? "text-left" : "text-right"}`}>
              {syncBanner.label}
            </Text>
          </View>
        )}

        {/* Full name */}
        <Text
          className={`text-sm font-bold mb-2 ${language === "ar" ? "text-left" : "text-right"} ${titleText}`}
        >
          {t("settings.fullName")}
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder={t("settings.fullName")}
          placeholderTextColor={isDarkMode ? "#64748b" : "#9ca3af"}
          autoCapitalize="words"
          maxLength={40}
          className={`rounded-2xl px-4 py-3.5 mb-6 text-right font-bold ${
            isDarkMode
              ? "bg-slate-900 text-white"
              : "bg-slate-200 text-slate-900"
          }`}
        />

        {/* Save */}
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          className={`py-3.5 rounded-2xl items-center ${
            isDarkMode ? mc.darkInteractive : mc.headerBg
          } ${canSave ? "" : "opacity-50"}`}
        >
          {saving ? (
            <ActivityIndicator size={20} color={isDarkMode ? palette.accentText : "#fff"} />
          ) : (
            <Text
              className={`font-bold text-base ${isDarkMode ? mc.textHeader : "text-white"}`}
            >
              {t("settings.save")}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}