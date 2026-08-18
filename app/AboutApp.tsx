import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import {
  ChevronRight,
  Bug,
  Lightbulb,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { useModeTheme, useModeClasses } from "@/src/theme";
import { MODE_META } from "../components/ModeSelectionModal";

const RING_RADIUS = 30;
const RING_STROKE = 6;
const RING_SIZE = (RING_RADIUS + RING_STROKE) * 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_CENTER = RING_SIZE / 2;

function ProgressRing({
  value,
  maxValue,
  color,
  trackColor,
  label,
  displayValue,
}: {
  value: number;
  maxValue: number;
  color: string;
  trackColor: string;
  label: string;
  displayValue: string;
}) {
  const percentage = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
  const offset = RING_CIRCUMFERENCE * (1 - percentage);

  return (
    <View className="flex-1 items-center mx-1">
      <View className="items-center justify-center relative">
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            stroke={trackColor}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            stroke={color}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RING_CENTER}, ${RING_CENTER}`}
          />
        </Svg>
        <Text
          style={{ color }}
          className="text-lg font-bold absolute"
        >
          {displayValue}
        </Text>
      </View>
      <Text className="text-slate-400 text-xs mt-2 text-center">{label}</Text>
    </View>
  );
}

export default function AboutApp() {
  const { t } = useTranslation();
  const { isDarkMode, mode, language, tasks, habits } = useAppStore();
  const { palette } = useModeTheme();
  const mc = useModeClasses();

  const accentHex = palette.accentText;

  const pageBg = isDarkMode ? "bg-screen-dark" : "bg-screen-light";

  const cardBg = isDarkMode ? mc.darkCard : "bg-white";

  const cardBorder = isDarkMode ? mc.darkAccentBorder : "border-gray-200/50";

  const accentText = isDarkMode ? mc.darkInteractiveText : mc.textHeader;

  const iconContainerBg = isDarkMode ? mc.darkAccentSoft : mc.accentSoft;

  const titleText = isDarkMode ? "text-gray-100" : "text-gray-800";

  const bodyText = isDarkMode ? "text-slate-300" : "text-gray-700";

  const mutedText = isDarkMode ? "text-slate-500" : "text-gray-400";


  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const activeHabitsCount = habits.length;
  const stabilityPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const ringTrack = isDarkMode ? "#475569" : "#E2E8F0";
  const ringStabilityColor = palette.accentText;
  const ringTasksColor = palette.secondary;
  const ringHabitsColor = palette.accentText;
  const stabilityLabel =
    mode === "study" ? t("about.stabilityStudy") : t("about.stability");

  const BackChevron = language === "ar" ? ChevronRight : ChevronRight;

  return (
    <View className={`flex-1 ${pageBg}`}>
      <View className="pt-14 pb-2 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-3 rounded-2xl ${cardBg} `}
          >
            <BackChevron size={22} color={accentHex} />
          </TouchableOpacity>
          <Text className={`text-lg font-bold flex-1 text-center ${accentText}`}>
            {t("about.appTitle")}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        <View className="items-center my-6">
          <View
            className={`w-20 h-20 ${cardBg} rounded-2xl items-center justify-center mb-3`}
            style={{ borderWidth: 1, borderColor: `${accentHex}40` }}
          >
            {(() => {
              const ModeIcon = MODE_META[mode].icon;
              return <ModeIcon size={40} color={accentHex} />;
            })()}
          </View>
          <Text className={`text-2xl font-black ${accentText} tracking-widest`}>
            BrainCode
          </Text>
          <View
            className={`${iconContainerBg} px-3 py-1 rounded-full mt-3`}
            style={{ borderWidth: 1, borderColor: `${accentHex}30` }}
          >
            <Text className={`${accentText} text-xs font-medium`}>{t("about.appVersion")}</Text>
          </View>
        </View>

        <Text
          className={`text-lg font-bold ${accentText} mb-4 ${language === "ar" ? "text-left" : "text-right"}`}
        >
          {t("about.stats")}
        </Text>
        <View className="flex-row justify-between mb-6 px-1">
          <ProgressRing
            value={stabilityPct}
            maxValue={100}
            color={ringStabilityColor}
            trackColor={ringTrack}
            label={stabilityLabel}
            displayValue={`${stabilityPct}%`}
          />
          <ProgressRing
            value={completedTasks}
            maxValue={Math.max(totalTasks, 1)}
            trackColor={ringTrack}
            color={completedTasks === 0 ? "#64748b" : completedTasks === totalTasks ? ringTasksColor : ringTasksColor}
            label={t("about.completedTasks")}
            displayValue={`${completedTasks}`}
          />
          <ProgressRing
            value={activeHabitsCount}
            maxValue={Math.max(activeHabitsCount, 1)}
            trackColor={ringTrack}
            color={ringHabitsColor}
            label={t("about.activeHabits")}
            displayValue={`${activeHabitsCount}`}
          />
        </View>

        <Text
          className={`text-lg font-bold ${accentText} mb-4 ${language === "ar" ? "text-left" : "text-right"}`}
        >
         {t("about.tools used")}
        </Text>
        <View className={`${cardBg} ${cardBorder} rounded-2xl p-5 mb-6`}>
          <View className="gap-y-4">
            <View className={`flex-row ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
              <Text
                className={`flex-1 ${bodyText} text-sm leading-6 ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("about.reactNative")}
              </Text>
            </View>
            <View className={`flex-row ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
              <Text
                className={`flex-1 ${bodyText} text-sm leading-6 ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("about.zustand")}
              </Text>
            </View>
            <View className={`flex-row ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
              <Text
                className={`flex-1 ${bodyText} text-sm leading-6 ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("about.tailwindcss")}
              </Text>
            </View>
            <View className={`flex-row ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
              <Text
                className={`flex-1 ${bodyText} text-sm leading-6 ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("about.mmkv")}
              </Text>
            </View>
            <View className={`flex-row ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
              <Text
                className={`flex-1 ${bodyText} text-sm leading-6 ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("about.i18next")}
              </Text>
            </View>
          </View>
        </View>

        <Text
          className={`text-lg font-bold ${accentText} mb-4 ${language === "ar" ? "text-left" : "text-right"}`}
        >
          {t("about.supportFeedback")}
        </Text>
        <View className="mb-6">
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "mailto:abdulrahman.dev25@gmail.com?subject=DevLearn Bug Report",
              )
            }
            activeOpacity={0.8}
            className={`${cardBg} ${cardBorder} rounded-2xl p-5 flex-row items-center justify-between mb-3`}
          >
            <View className={`flex-row items-center flex-1 ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
              <View className={`w-10 h-10 rounded-xl ${iconContainerBg} items-center justify-center`}>
                <Bug size={20} color={accentHex} />
              </View>
              <View className={`mx-3 flex-1 ${language === "ar" ? "items-start" : "items-end"}`}>
                <Text className={`${titleText} font-semibold text-sm ${language === "ar" ? "text-left" : "text-right"}`}>
                  {t("about.reportBug")}
                </Text>
                
              </View>
            </View>
            
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "mailto:abdulrahman.dev25@gmail.com?subject=DevLearn Feature Suggestion",
              )
            }
            activeOpacity={0.8}
            className={`${cardBg} ${cardBorder} rounded-2xl p-5 flex-row items-center justify-between`}
          >
            <View className={`flex-row items-center flex-1 ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
              <View className={`w-10 h-10 rounded-xl ${iconContainerBg} items-center justify-center`}>
                <Lightbulb size={20} color={accentHex} />
              </View>
              <View className={`mx-3 flex-1 ${language === "ar" ? "items-start" : "items-end"}`}>
                <Text className={`${titleText} font-semibold text-sm ${language === "ar" ? "text-left" : "text-right"}`}>
                  {t("about.suggestFeature")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View className="items-center mb-10">
          <Text className={`${mutedText} text-sm text-center`}>
            {t("about.developedBy")}
          </Text>
          <Text className="text-slate-600 text-xs mt-2">
            {t("about.copyright")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}