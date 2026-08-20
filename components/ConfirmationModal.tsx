import { Modal, View, TouchableOpacity } from "react-native";
import Text from "@/src/components/ScaledText";
import { useAppStore } from "../store/useAppStore";
import { useTranslation } from "react-i18next";
import { useModeClasses } from "../src/theme";

interface ConfirmationModalProps {
  isVisible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isVisible,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const { isDarkMode, language } = useAppStore();
  const mc = useModeClasses();
  const { t } = useTranslation();
  const isRtl = language === "ar";

  const modalCardBg = isDarkMode ? mc.darkCard : "bg-white";
  const titleColor = isDarkMode ? mc.darkInteractiveText : mc.textHeader;
  const cancelBg = isDarkMode ? mc.darkAccentSoft : mc.accentBg40;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View
          className={`w-full rounded-3xl p-6 ${modalCardBg}`}
        >
          <Text
            className={`text-xl font-black text-center mb-2 ${titleColor}`}
          >
            {title}
          </Text>
          <Text
            className={`text-sm text-center mb-6 leading-6 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
          >
            {description}
          </Text>
          <View className={`flex-row gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-red-600 items-center"
            >
              <Text className="text-white font-bold text-base">
                {t("settings.delete") || "حذف"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancel}
              className={`flex-1 py-3.5 rounded-2xl items-center ${cancelBg}`}
            >
              <Text
                className={`font-bold text-base ${titleColor}`}
              >
                {t("settings.cancel") || "إلغاء"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
