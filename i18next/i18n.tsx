import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createMMKV } from "react-native-mmkv";

import ar from "./ar.json";
import en from "./en.json";

const storage = createMMKV();
const initialLanguage = (storage.getString("language") as "ar" | "en") || "ar";

i18n.use(initReactI18next).init({
  lng: initialLanguage,
  fallbackLng: "en",
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
