import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { useAppStore } from "../store/useAppStore";
import ModeSelectionModal, { MODE_META } from "./ModeSelectionModal";

export default function ModeSwitcherButton() {
  const mode = useAppStore((s) => s.mode);
  const [modalVisible, setModalVisible] = useState(false);

  const meta = MODE_META[mode];
  const Icon = meta.icon;

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-white/20 px-3 py-3 rounded-2xl items-center justify-center"
        activeOpacity={0.7}
      >
        <Icon color="white" size={26} />
      </TouchableOpacity>

      <ModeSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}