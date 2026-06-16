import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useAppStore } from "../store/useAppStore";
import { useTranslation } from "react-i18next";

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
  const { isDarkMode, mode, language } = useAppStore();
  const isStudy = mode === "study";
  const { t } = useTranslation();
  const isRtl = language === "ar";

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
          className={`w-full rounded-3xl p-6 ${isDarkMode ? (isStudy ? "bg-study-dark-accent" : "bg-coding-dark-accent") : isStudy ? "bg-study-accent" : "bg-coding-accent"}`}
        >
          <Text
            className={`text-xl font-black text-center mb-2 ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : isStudy ? "text-study-primary" : "text-coding-primary"}`}
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
              className={`flex-1 py-3.5 rounded-2xl items-center ${isDarkMode ? (isStudy ? "bg-study-dark-primary/20" : "bg-coding-dark-primary/20") : isStudy ? "bg-study-primary/20" : "bg-coding-primary/20"}`}
            >
              <Text
                className={`font-bold text-base ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : isStudy ? "text-study-primary" : "text-coding-primary"}`}
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
