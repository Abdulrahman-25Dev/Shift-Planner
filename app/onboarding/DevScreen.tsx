import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
import { storage, STORAGE_KEYS } from "@/src/services/storage";
import { useAppStore } from "../../store/useAppStore";

const DevScreen = () => {
  const { isDarkMode } = useAppStore();
  const handleGetStarted = () => {
    storage.set(STORAGE_KEYS.hasSeenOnboarding, true);
    router.replace("/Auth/Register");
  };

  return (
    <View
      className={
        "flex-1" + (isDarkMode ? " bg-coding-dark-bg" : " bg-coding-bg")
      }
    >
      {/* PLACE YOUR PURPLE GRADIENT BACKGROUND HERE */}

      <View className="flex-1 justify-center items-center px-8">
        {/* PLACE YOUR ONBOARDING ILLUSTRATION HERE */}
        <Image
          source={require("../../assets/images/Dev.png")}
          className="w-72 h-72 rounded-[30px]"
          resizeMode="contain"
        />

        {/* PLACE YOUR TITLE TEXT STYLES HERE */}
        <Text
          className={
            "text-2xl text-center font-bold mt-6 " +
            (isDarkMode ? " text-coding-dark-primary" : " text-coding-primary")
          }
        >
          انطلق في عالم التطوير
        </Text>

        {/* PLACE YOUR DESCRIPTION TEXT STYLES HERE */}
        <Text
          className={
            "text-base text-center mt-3" +
            (isDarkMode
              ? " text-coding-dark-secondary"
              : " text-coding-secondary")
          }
        >
          نظّم أوقات كتابة الكود، وتعلّم اللغات البرمجية المفضلة لديك لتصنع
          أفكارك وتطبيقاتك الخاصة.{" "}
        </Text>

        {/* PLACE YOUR PAGE INDICATOR / DOTS HERE (last dot highlighted) */}
        <View className="flex-row mt-8">
          <View
            className={
              "w-6 h-2 rounded-full mx-1" +
              (isDarkMode ? " bg-coding-dark-primary" : " bg-coding-primary")
            }
          />
          <View
            className={
              "w-2 h-2 rounded-full mx-1" +
              (isDarkMode ? " bg-white" : " bg-black")
            }
          />
        </View>

        {/* PLACE YOUR GET STARTED BUTTON STYLES HERE */}
        <TouchableOpacity
          onPress={handleGetStarted}
          className={
            "mt-12 py-4 px-12 rounded-full w-full items-center" +
            (isDarkMode ? " bg-coding-dark-primary" : " bg-coding-primary")
          }
        >
          <Text
            className={
              " text-lg font-bold" +
              (isDarkMode
                ? " text-coding-primary"
                : " text-coding-dark-primary")
            }
          >إبدأ الآن</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DevScreen;
