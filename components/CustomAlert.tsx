import { Modal, View, TouchableOpacity } from "react-native";
import Text from "@/src/components/ScaledText";
import { Ionicons, type IoniconName } from "@/src/components/icons";
import { useAppStore } from "../store/useAppStore";
import { useModeClasses } from "../src/theme";
import { useTranslation } from "react-i18next";

interface CustomAlertProps {
  isVisible: boolean;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  onCancel?: () => void;
}

type IconName = IoniconName;

const ALERT_CONFIG: Record<
  NonNullable<CustomAlertProps["type"]>,
  { icon: IconName; color: string }
> = {
  success: { icon: "checkmark-circle", color: "#16A34A" },
  error: { icon: "close-circle", color: "#DC2626" },
  info: { icon: "information-circle", color: "#64748B" },
};

export default function CustomAlert({
  isVisible,
  title,
  description,
  type = "info",
  onClose,
  onCancel,
}: CustomAlertProps) {
  const { isDarkMode } = useAppStore();
  const mc = useModeClasses();
  const { t } = useTranslation();

  const config = ALERT_CONFIG[type];
  const modalCardBg = isDarkMode ? mc.darkCard : "bg-white";
  const titleColor = isDarkMode ? mc.darkInteractiveText : mc.textHeader;
  const descriptionColor = isDarkMode ? "text-slate-400" : "text-gray-600";

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className={`w-full rounded-3xl p-6 items-center ${modalCardBg}`}>
          <View
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: `${config.color}1A` }}
          >
            <Ionicons name={config.icon} size={36} color={config.color} />
          </View>
          <Text
            className={`text-xl font-black text-center mt-4 mb-2 ${titleColor}`}
          >
            {title}
          </Text>
          {description ? (
            <Text
              className={`text-sm text-center mb-6 leading-6 ${descriptionColor}`}
            >
              {description}
            </Text>
          ) : null}
          <View className="w-full flex-row">
            {onCancel ? (
              <TouchableOpacity
                onPress={onCancel}
                className={`flex-1 py-3.5 rounded-2xl items-center mr-2 ${
                  isDarkMode ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <Text className={`font-bold text-base ${titleColor}`}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3.5 rounded-2xl items-center"
              style={{ backgroundColor: config.color }}
            >
              <Text className="text-white font-bold text-base">
                {t("common.ok")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
