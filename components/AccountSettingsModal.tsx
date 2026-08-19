import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { User, KeyRound, LogOut, UserX, ChevronLeft } from "lucide-react-native";
import {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import { useTranslation } from "react-i18next";
import { useModeTheme, useModeClasses } from "@/src/theme";
import ConfirmationModal from "./ConfirmationModal";
import { supabase } from "../supabase";

const AccountSettingsModal = forwardRef<BottomSheetModal>(
  (_props, ref) => {
    const { isDarkMode, language, logout, deleteAccount } = useAppStore();
    const { palette } = useModeTheme();
    const mc = useModeClasses();
    const { t } = useTranslation();

    const [step, setStep] = useState<"options" | "password">("options");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);

    const snapPoints = useMemo(() => ["60%"], []);
    const sheetRef = ref as React.RefObject<BottomSheetModal>;

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    const titleText = isDarkMode ? mc.darkInteractiveText : mc.textHeader;
    const subText = isDarkMode ? "text-slate-400" : "text-gray-500";
    const rowBg = isDarkMode ? "bg-slate-800/60" : "bg-slate-50";
    const iconColor = isDarkMode ? palette.accentText : palette.header;
    const trashColor = isDarkMode ? "#fca5a5" : "#dc2626";

    const close = () => {
      setStep("options");
      setNewPassword("");
      sheetRef.current?.dismiss();
    };

    const handleLogout = () => {
      close();
      logout().then(() => router.replace("/Auth/Login"));
    };

    const handleDeleteConfirm = () => {
      setDeleteVisible(false);
      close();
      deleteAccount().then(() => router.replace("/Auth/Login"));
    };

    const handleChangePassword = async () => {
      if (newPassword.trim().length < 6) return;
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword.trim(),
        });
        if (error) throw error;
        setStep("options");
        setNewPassword("");
      } catch (e) {
        console.warn("Password change failed:", e);
      } finally {
        setLoading(false);
      }
    };

    const row = (
      icon: React.ReactNode,
      title: string,
      subtitle: string,
      onPress: () => void,
      red = false,
    ) => (
      <Pressable
        onPress={onPress}
        className={`flex-row items-center p-4 mb-3 rounded-2xl ${rowBg}`}
      >
        <View
          className={`w-11 h-11 rounded-2xl items-center justify-center ${
            red ? "bg-red-50 dark:bg-red-900/60" : "bg-slate-200/60 dark:bg-slate-700/60"
          }`}
        >
          {icon}
        </View>
        <View className="flex-1 mx-4">
          <Text
            className={`font-bold text-base ${red ? "text-red-600 dark:text-red-400" : titleText}`}
          >
            {title}
          </Text>
          <Text className={`text-xs mt-0.5 ${subText}`}>{subtitle}</Text>
        </View>
        <ChevronLeft
          size={18}
          color={red ? trashColor : isDarkMode ? "#64748b" : "#9ca3af"}
          style={{ transform: [{ rotate: language === "ar" ? "0deg" : "180deg" }] }}
        />
      </Pressable>
    );

    return (
      <>
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            borderRadius: 40,
            backgroundColor: isDarkMode ? palette.card : "#FFFFFF",
          }}
          handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 50 }}
          onDismiss={() => {
            setStep("options");
            setNewPassword("");
          }}
        >
          <BottomSheetView className="px-5 pb-8">
            {step === "options" ? (
              <>
                <Text className={`text-xl mt-5 font-black text-center ${titleText}`}>
                  {t("settings.accountSettings")}
                </Text>
                <Text className={`text-sm text-center mt-1 mb-5 ${subText}`}>
                  {t("settings.accountSettingsSub")}
                </Text>

                {row(
                  <User size={20} color={iconColor} />,
                  t("settings.editProfile"),
                  t("settings.editProfileSub"),
                  () => {},
                )}
                {row(
                  <KeyRound size={20} color={iconColor} />,
                  t("settings.changePassword"),
                  t("settings.changePasswordSub"),
                  () => setStep("password"),
                )}
                {row(
                  <LogOut size={20} color={trashColor} />,
                  t("settings.logout"),
                  t("settings.logoutSub"),
                  handleLogout,
                  true,
                )}
                {row(
                  <UserX size={20} color={trashColor} />,
                  t("settings.deleteAccount"),
                  t("settings.deleteAccountSub"),
                  () => setDeleteVisible(true),
                  true,
                )}
              </>
            ) : (
              <>
                <Text className={`text-xl font-black text-center ${titleText}`}>
                  {t("settings.changePassword")}
                </Text>
                <Text className={`text-sm text-center mt-1 mb-5 ${subText}`}>
                  {t("settings.changePasswordSub")}
                </Text>

                <BottomSheetTextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t("settings.newPassword")}
                  placeholderTextColor={isDarkMode ? "#64748b" : "#9ca3af"}
                  secureTextEntry
                  autoCapitalize="none"
                  className={`rounded-2xl px-4 py-3.5 mb-4 text-right font-bold ${
                    isDarkMode
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                />

                <Pressable
                  onPress={handleChangePassword}
                  disabled={loading || newPassword.trim().length < 6}
                  className={`py-3.5 rounded-2xl items-center mb-3 ${
                    loading || newPassword.trim().length < 6 ? "opacity-50" : ""
                  }`}
                  style={{ backgroundColor: palette.interactive }}
                >
                  <Text className="text-white font-bold text-base">
                    {t("settings.save")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setStep("options")}
                  className={`py-3.5 rounded-2xl items-center ${
                    isDarkMode ? "bg-slate-800" : "bg-slate-100"
                  }`}
                >
                  <Text className={`font-bold text-base ${subText}`}>
                    {t("settings.cancel")}
                  </Text>
                </Pressable>
              </>
            )}
          </BottomSheetView>
        </BottomSheetModal>

        <ConfirmationModal
          isVisible={deleteVisible}
          title={t("settings.deleteAccount")}
          description={t("settings.deleteAccountDesc")}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteVisible(false)}
        />
      </>
    );
  },
);

AccountSettingsModal.displayName = "AccountSettingsModal";

export default AccountSettingsModal;