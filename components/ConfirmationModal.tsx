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
  const { isDarkMode, mode } = useAppStore();
  const isStudy = mode === "study";
  const { t } = useTranslation();
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className={"w-full rounded-3xl p-6 " + (isDarkMode ? isStudy ? "bg-study-dark-accent" : "bg-coding-dark-bg " : isStudy ? "bg-study-primary" : "bg-coding-primary")}>
          <Text className={" text-xl font-black text-center mb-2" + (isDarkMode ? isStudy ? " text-study-dark-primary" : " text-coding-dark-primary" : isStudy ? " text-study-accent" : " text-coding-accent")}>
            {title}
          </Text>
          <Text className={" text-sm text-center mb-6 leading-5" + (isDarkMode ? isStudy ? " text-study-dark-secondary" : " text-coding-dark-secondary" : isStudy ? " text-study-accent" : " text-coding-accent")}>
            {description}
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className={"flex-1 py-3.5 rounded-2xl items-center" + (isDarkMode ? isStudy ? " bg-study-primary" : " bg-coding-primary" : isStudy ? " bg-study-secondary" : " bg-coding-secondary")}
            >
              <Text className={" font-bold text-base" + (isDarkMode ? isStudy ? " text-study-dark-secondary" : " text-coding-dark-secondary" : isStudy ? " text-study-accent" : " text-coding-accent")}>
                {t("settings.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-red-700 items-center"
            >
              <Text className="text-white font-bold text-base">{t("settings.delete")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
