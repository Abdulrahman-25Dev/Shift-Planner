import {
  View,
  TouchableOpacity,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Text from "@/src/components/ScaledText";
import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound } from "@/src/components/icons";
import { router } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import { useTranslation } from "react-i18next";
import { useModeTheme, useModeClasses } from "@/src/theme";
import { supabase } from "../supabase";
import CustomAlert from "../components/CustomAlert";

export default function ChangePassword() {
  const { user, isDarkMode, language } = useAppStore();
  const { palette } = useModeTheme();
  const mc = useModeClasses();
  const { t } = useTranslation();

  // ── Form state ────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Toggles for showing/hiding each password field
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Request + feedback state
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    description: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", description: "", type: "info" });

  const iconColor = isDarkMode ? palette.accentText : palette.header;
  const iconCircleBg = isDarkMode ? mc.darkAccentSoft : mc.accentSoft;
  const titleText = isDarkMode ? "text-gray-100" : "text-gray-800";
  const subText = isDarkMode ? "text-slate-400" : "text-gray-500";
  const inputBg = isDarkMode ? "bg-slate-900" : "bg-slate-200";
  const inputText = isDarkMode ? "text-white" : "text-slate-900";
  const inputAlign = language === "ar" ? "text-right" : "text-left";
  const rowDirection = language === "ar" ? "flex-row" : "flex-row-reverse";

  const showAlert = (
    title: string,
    description: string,
    type: "success" | "error",
  ) => setAlert({ visible: true, title, description, type });

  /**
   * Validates the form client-side:
   * 1. No field may be empty.
   * 2. New password must be at least 6 characters.
   * 3. New password must match the confirmation field.
   * Returns the first error message, or null when valid.
   */
  const validate = (): string | null => {
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      return t("settings.passwordEmpty");
    }
    if (newPassword.trim().length < 6) {
      return t("settings.passwordMinLength");
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      return t("settings.passwordMismatch");
    }
    return null;
  };

  const handleChangePassword = async () => {
    // ── 1) Client-side validation before touching the network ──
    const validationError = validate();
    if (validationError) {
      showAlert(t("settings.passwordChangeFailed"), validationError, "error");
      return;
    }

    // The current email is required to re-authenticate the user
    const email = user?.email;
    if (!email) {
      showAlert(
        t("settings.passwordChangeFailed"),
        t("settings.noEmailError"),
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      // ── 2) Re-authenticate with the current password ──────────
      // signInWithPassword verifies the OLD password against Supabase.
      // This prevents a hijacked/stale session from silently changing
      // the password without knowing the current one.
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword.trim(),
      });
      if (reAuthError) {
        // e.g. "Invalid login credentials" — treat as wrong current password
        showAlert(
          t("settings.passwordChangeFailed"),
          t("settings.currentPasswordIncorrect"),
          "error",
        );
        return;
      }

      // ── 3) Current password verified → update to the new one ──
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });
      if (updateError) {
        showAlert(
          t("settings.passwordChangeFailed"),
          updateError.message,
          "error",
        );
        return;
      }

      // ── 4) Success: clear the form and confirm to the user ──
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showAlert(
        t("settings.passwordChanged"),
        t("settings.passwordChangedDesc"),
        "success",
      );
    } catch (e: any) {
      // Network errors, unexpected failures, etc.
      showAlert(
        t("settings.passwordChangeFailed"),
        e?.message || t("settings.passwordChangeFailed"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared styles for a password input row (icon button + TextInput)
  const inputRowClass = `${rowDirection} items-center rounded-2xl px-4 mb-4 ${inputBg}`;
  const eyeBtnClass = "p-2";

  const EyeToggle = ({
    visible,
    onToggle,
  }: {
    visible: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity onPress={onToggle} className={eyeBtnClass}>
      {visible ? (
        <EyeOff size={20} color={iconColor} />
      ) : (
        <Eye size={20} color={iconColor} />
      )}
    </TouchableOpacity>
  );

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
            {t("settings.changePassword")}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <View className="flex-1 px-6 pt-8">
        {/* Icon + subtitle */}
        <View className="items-center mb-8">
          <View
            className={`w-20 h-20 rounded-full items-center justify-center ${iconCircleBg}`}
          >
            <KeyRound size={34} color={iconColor} />
          </View>
          <Text className={`text-sm font-bold mt-3 text-center ${subText}`}>
            {t("settings.changePasswordSub")}
          </Text>
        </View>

        {/* Current password */}
        <View className={inputRowClass}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t("settings.oldPassword")}
            placeholderTextColor={isDarkMode ? "#64748b" : "#9ca3af"}
            secureTextEntry={!showCurrent}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            className={`flex-1 py-3.5 font-bold ${inputAlign} ${inputText}`}
          />
          <EyeToggle visible={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
        </View>

        {/* New password */}
        <View className={inputRowClass}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("settings.newPassword")}
            placeholderTextColor={isDarkMode ? "#64748b" : "#9ca3af"}
            secureTextEntry={!showNew}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            className={`flex-1 py-3.5 font-bold ${inputAlign} ${inputText}`}
          />
          <EyeToggle visible={showNew} onToggle={() => setShowNew((v) => !v)} />
        </View>

        {/* Confirm new password */}
        <View className={inputRowClass}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("settings.confirmPassword")}
            placeholderTextColor={isDarkMode ? "#64748b" : "#9ca3af"}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            className={`flex-1 py-3.5 font-bold ${inputAlign} ${inputText}`}
          />
          <EyeToggle visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleChangePassword}
          disabled={loading}
          className={`py-3.5 rounded-2xl items-center ${
            isDarkMode ? mc.darkInteractive : mc.headerBg
          } ${loading ? "opacity-50" : ""}`}
        >
          {loading ? (
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

      {/* Success / error feedback */}
      <CustomAlert
        isVisible={alert.visible}
        title={alert.title}
        description={alert.description}
        type={alert.type}
        onClose={() => {
          const wasSuccess = alert.type === "success";
          setAlert({ visible: false, title: "", description: "", type: "info" });
          // Leave the screen on success so the user can log in with the new password
          if (wasSuccess) router.back();
        }}
      />
    </View>
  );
}