import { useEffect, useRef } from "react";
import { View, Image, Animated } from "react-native";
import Text from "@/src/components/ScaledText";
import * as SplashScreen from "expo-splash-screen";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({ onFinish }: SplashScreenProps) {
  // قيم الأنيميشن للشفافية والحجم
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // إخفاء شاشة النظام البدائية فور تحميل المكون
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }

      // تشغيل أنيميشن الظهور والتكبير بالتوازي
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // التوقف لمدة ثانيتين ثم الخروج بأنيميشن اختفاء ناعم (Fade out)
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 1800);
    }

    prepare();
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: "#131615" }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center justify-center"
      >
        {/* أيقونة اللوجو بدون خلفية */}
        <View
          className="shadow-2xl shadow-emerald-400/70" // ظل ناعم بلون زمردي يناسب الهوية
          style={{
            // إضافة الظل كـ inline style لضمان الدعم على أندرويد و iOS
            // (بعض إعدادات Tailwind للظل قد لا تدعم أندرويد بشكل كامل بدون مكتبات إضافية)
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.7,
            shadowRadius: 15,
            elevation: 20, // هذا ضروري جداً للأندرويد
          }}
        >
          <Image
            source={require("../assets/images/BrainCodeIconNoBG.png")}
            resizeMode="contain"
            className="w-40 h-40" // نفس حجمك السابق
          />
        </View>

        {/* اسم التطبيق */}
        <Text className="text-3xl font-bold text-white mt-4 tracking-wider">
          BrainCode
        </Text>

        {/* الوصف الخفيف تحت الاسم */}
        <Text className="text-slate-400 text-xs mt-1 font-medium">
          بيئتك المتكاملة لإدارة عاداتك وتركيزك
        </Text>
      </Animated.View>
    </View>
  );
}
