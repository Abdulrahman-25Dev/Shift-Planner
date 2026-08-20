import { View, TouchableOpacity, Image } from "react-native";
import Text from "@/src/components/ScaledText";
import React from "react";
import { router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";

const StuScreen = () => {
    const { isDarkMode } = useAppStore();

  const handleNext = () => {
    router.push("/onboarding/DevScreen");
  };

  return (
    <View className={"flex-1" + (isDarkMode ? " bg-screen-dark" : " bg-screen-light")}>

      <View className="flex-1 justify-center items-center px-8">
        {/* App Icon , switch on study mode */}
        <Image
          source={require("../../assets/images/Disk.png")}
          className="w-56 h-56 rounded-[30px]"
          resizeMode="contain"
         />

        {/* PLACE YOUR TITLE TEXT STYLES HERE */}
        <Text className={"text-2xl text-center font-bold mt-6" + (isDarkMode ? " text-study-dark-interactive" : " text-study-header")}>
          نظّم دراستك اليومية
        </Text>

        {/* PLACE YOUR DESCRIPTION TEXT STYLES HERE */}
        <Text className={"text-base text-center mt-3 " + (isDarkMode ? " text-study-dark-interactive/70" : " text-study-header/70")}>
          سجّل مهامك، واصنع روتينك الخاص لتضمن التفوق والاستمرار في موادك العلمية
        </Text>

        {/* PLACE YOUR PAGE INDICATOR / DOTS HERE */}
        <View className="flex-row mt-8">
          <View className={"w-2 h-2 rounded-full mx-1" + (isDarkMode ? " bg-white" : " bg-black")} />
          <View className={"w-6 h-2 rounded-full mx-1" + (isDarkMode ? " bg-study-dark-interactive" : " bg-study-header")} />
        </View>

        {/* PLACE YOUR NEXT BUTTON STYLES HERE */}
        <TouchableOpacity
          onPress={handleNext}
          className={"mt-12 py-4 px-12 rounded-full w-full items-center" + (isDarkMode ? " bg-study-dark-interactive" : " bg-study-header")}
        >
          <Text className={" text-lg font-bold" + (isDarkMode ? " text-study-header" : " text-white")}>التالي</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

export default StuScreen;