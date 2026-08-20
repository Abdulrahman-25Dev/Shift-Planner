import { Modal, View, Pressable } from "react-native";
import Text from "@/src/components/ScaledText";
import { GraduationCap, Code2, Check, Mosque } from "@/src/components/icons";
import { useAppStore, Mode } from "../store/useAppStore";
import { useTranslation } from "react-i18next";

export const MODE_META: Record<
  Mode,
  { icon: any; accent: string; titleKey: string; descKey: string }
> = {
  study: {
    icon: GraduationCap,
    accent: "#FFDCEF",
    titleKey: "modeModal.study",
    descKey: "modeModal.studyDesc",
  },
  coding: {
    icon: Code2,
    accent: "#02F5A1",
    titleKey: "modeModal.coding",
    descKey: "modeModal.codingDesc",
  },
  faith: {
    icon: Mosque,
    accent: "#ADDFF1",
    titleKey: "modeModal.faith",
    descKey: "modeModal.faithDesc",
  },
};

interface ModeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModeSelectionModal({
  visible,
  onClose,
}: ModeSelectionModalProps) {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const { t } = useTranslation();

  const handleSelect = (m: Mode) => {
    setMode(m);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="bg-slate-900 rounded-t-[28px] border-t border-x border-slate-700 px-5 pt-3 pb-10">
          <View className="w-10 h-1 rounded-full bg-slate-700 self-center mb-4" />

          <Text className="text-white text-xl font-black text-center">
            {t("modeModal.title")}
          </Text>
          <Text className="text-slate-400 text-sm text-center mt-1 mb-5">
            {t("modeModal.subtitle")}
          </Text>

          {(Object.keys(MODE_META) as Mode[]).map((m) => {
            const meta = MODE_META[m];
            const Icon = meta.icon;
            const isActive = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => handleSelect(m)}
                className={`flex-row items-center p-4 mb-3 rounded-2xl border ${
                  isActive
                    ? "bg-slate-800 border-slate-500"
                    : "bg-slate-800/50 border-slate-700"
                }`}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${meta.accent}22` }}
                >
                  <Icon color={meta.accent} size={24} />
                </View>

                <View className="flex-1 mx-4">
                  <Text className="text-white font-bold text-base">
                    {t(meta.titleKey)}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {t(meta.descKey)}
                  </Text>
                </View>

                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    isActive ? "" : "border-slate-600"
                  }`}
                  style={isActive ? { borderColor: meta.accent } : undefined}
                >
                  {isActive && <Check color={meta.accent} size={14} />}
                </View>
              </Pressable>
            );
          })}

          <Pressable
            onPress={onClose}
            className="mt-2 py-3 rounded-2xl bg-slate-800 items-center"
          >
            <Text className="text-slate-300 font-bold">{t("modeModal.cancel")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}