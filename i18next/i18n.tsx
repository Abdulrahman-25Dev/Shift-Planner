import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { storage } from "../src/services/storage";

import ar from "./ar.json";
import en from "./en.json";

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
