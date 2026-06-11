import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';

export default function UltimateAboutScreen() {
  const { t } = useTranslation();
  const appVersion = "1.0.0 (Beta)";
  const { isDarkMode, mode, language } = useAppStore();

  // دالة مشاركة التطبيق الأصلية
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'جرب تطبيق Shift Planner لتنظيم وقتك وعاداتك بين الدراسة والبرمجة! 🚀',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const isStudy = mode === "study";

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-5 pt-8" showsVerticalScrollIndicator={false}>
      
      {/* 1. رأس الصفحة (Hero Header) */}
      <View className="items-center my-6">
        <View className="w-20 h-20 bg-zinc-900 rounded-2xl items-center justify-center border border-zinc-800 shadow-2xl mb-3">
          <Feather name="terminal" size={38} color="#ffffff" />
        </View>
        <Text className="text-2xl font-black text-white tracking-widest">Shift Planner</Text>
        <Text className="text-zinc-500 text-xs mt-1 font-medium">Shift Between Logic & Focus</Text>
        
        <View className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full mt-3">
          <Text className="text-zinc-400 text-[11px] font-mono">{appVersion}</Text>
        </View>
      </View>

      {/* 2. رؤية المطور (Our Story) */}
      <View className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl mb-4">
        <View className={"flex-1 items-center " + (language === "ar" ? " flex-row" : "flex-row-reverse")}>
          <Text className={"text-white font-bold text-base mx-2"}>{t("about.versionOfDev")}</Text>
          <Feather name="eye" size={18} color="#ffffff" />
        </View>
        <Text className={"text-zinc-400 text-sm mt-3 leading-6" + (language === "ar" ? " text-left" : "text-right")}>
          {t("about.versionOfDevDesc")}
        </Text>
      </View>

      {/* 3. فلسفة الانضباط الذكي (Pillars) - مكتوبة بالكامل بشكل مباشر وسهل الترجمة */}
      <View className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl mb-4">
        <View className={" items-center gap-2 " + (language === "ar" ? " flex-row" : "flex-row-reverse")}>
          <Text className={"text-white font-bold text-base p-4" + (language === "ar" ? " text-left" : "text-right")}>{t("about.pillars")}</Text>
          <Feather name="shield" size={18} color="#ffffff" />
        </View>

        <View className="space-y-4 mt-3">
          {/* المبدأ الأول */}
          <View className={"flex-row items-start" + (language === "ar" ? " justify-end" : "justify-start")}>
            <View className={"mr-3 flex-1" + (language === "ar" ? " items-end" : "items-start")}>
              <Text className="text-white font-semibold text-sm mb-0.5">عزل السياق (Context Isolation)</Text>
              <Text className="text-zinc-500 text-xs text-right">{t("about.context-isolation")}</Text>
            </View>
            <View className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2" />
          </View>

          {/* المبدأ الثاني */}
          <View className="flex-row justify-end items-start mt-3">
            <View className="mr-3 items-end flex-1">
              <Text className="text-white font-semibold text-sm mb-0.5">الاستدامة الرمزية (Sustain)</Text>
              <Text className="text-zinc-500 text-xs text-right">{t("about.sustainability")}</Text>
            </View>
            <View className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2" />
          </View>

          {/* المبدأ الثالث */}
          <View className="flex-row justify-end items-start mt-3">
            <View className="mr-3 items-end flex-1">
              <Text className="text-white font-semibold text-sm mb-0.5">التنبيه المدمج (Native Engine)</Text>
              <Text className="text-zinc-500 text-xs text-right">{t("about.native-engine")}</Text>
            </View>
            <View className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2" />
          </View>
        </View>
      </View>

      {/* 4. كرت الترسانة التقنية (Architecture Stack) - تم تفكيك الـ Map ومباشر 100% */}
      <View className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl mb-4">
        <View className="flex-row items-center justify-end mb-3">
          <Text className="text-white font-bold text-base mx-2 text-right">{t("about.architectureStack")}</Text>
          <Feather name="cpu" size={18} color="#ffffff" />
        </View>

        <View className="flex-row justify-between items-center py-2.5 border-b border-zinc-800/40">
          <Text className="text-zinc-300 font-mono text-xs">React Native & Expo</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.framework")}</Text>
        </View>

        <View className="flex-row justify-between items-center py-2.5 border-b border-zinc-800/40">
          <Text className="text-zinc-300 font-mono text-xs">Zustand State</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.state-management")}</Text>
        </View>

        <View className="flex-row justify-between items-center py-2.5 border-b border-zinc-800/40">
          <Text className="text-zinc-300 font-mono text-xs">MMKV Storage</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.local-storage")}</Text>
        </View>

        <View className="flex-row justify-between items-center py-2.5 border-b border-zinc-800/40">
          <Text className="text-zinc-300 font-mono text-xs">NativeWind (Tailwind)</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.design-engine")}</Text>
        </View>

        <View className="flex-row justify-between items-center py-2.5">
          <Text className="text-zinc-300 font-mono text-xs">Expo Notifications</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.notifications")}</Text>
        </View>
      </View>

      {/* 5. بيئة التشغيل ومحددات الأداء (Runtime Specifications) */}
      <View className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl mb-4">
        <View className="flex-row items-center justify-end mb-3">
          <Text className="text-white font-bold text-base mx-2 text-right">{t("about.runtime-specs")}</Text>
          <Feather name="activity" size={18} color="#ffffff" />
        </View>

        <View className="flex-row justify-between items-center py-2 border-b border-zinc-800/40">
          <Text className="text-zinc-300 font-mono text-xs">Hermes Enabled</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.hermes")}</Text>
        </View>
        <View className="flex-row justify-between items-center py-2 border-b border-zinc-800/40">
          <Text className="text-zinc-300 font-mono text-xs">Fully Offline</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.fully-offline")}</Text>
        </View>
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-zinc-300 font-mono text-xs">Zero Analytics Trackers</Text>
          <Text className="text-zinc-500 text-xs text-right">{t("about.privacy-and-security")}</Text>
        </View>
      </View>

      {/* 6. طاقم العمل والمساهمين (Credits) */}
      <View className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl mb-5">
        <View className="flex-row items-center justify-end mb-3">
          <Text className="text-white font-bold text-base mx-2 text-right">{t("about.developer")}</Text>
          <Feather name="user" size={18} color="#ffffff" />
        </View>

        <View className="flex-row justify-between items-center py-2 border-b border-zinc-800/20">
          <Text className="text-zinc-500 text-xs">Lead Developer</Text>
          <Text className="text-white font-bold text-sm text-right">{t("about.lead-developer")}</Text>
        </View>
      </View>

      {/* 7. زر المشاركة السريع */}
      <TouchableOpacity 
        onPress={handleShareApp}
        activeOpacity={0.8}
        className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex-row justify-center items-center mb-8"
      >
        <Text className="text-white font-bold text-sm mx-2">{t("about.share-app")}</Text>
        <Feather name="share-2" size={16} color="#ffffff" />
      </TouchableOpacity>

      {/* 8. التذييل (Footer) */}
      <View className="items-center mb-10">
        <Text className="text-zinc-650 text-[10px] tracking-widest uppercase">Designed for coders & students</Text>
        <Text className="text-zinc-700 text-[9px] mt-1">جميع الحقوق محفوظة © ٢٠٢٦ Shift Planner</Text>
      </View>

    </ScrollView>
  );
}