import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({ id: "app-storage" });

export const STORAGE_KEYS = {
  hasSeenOnboarding: "hasSeenOnboarding",
} as const;

export function resetOnboarding() {
  storage.remove(STORAGE_KEYS.hasSeenOnboarding);
}
