import { useEffect } from "react";
import { View, Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await SplashScreen.hideAsync();
      onFinish();
    };
    prepare();
  }, [onFinish]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: "#131615" }}
    >
      <Image
        source={require("../assets/images/DevLearnSplashScreen.png")}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>
  );
}
