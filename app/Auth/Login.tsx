import { Ionicons } from "@/src/components/icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import Text from "@/src/components/ScaledText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";
import { useModeTheme, useModeClasses } from "@/src/theme";
import { supabase } from "@/supabase";
import CustomAlert from "@/components/CustomAlert";

export default function Login() {
  const { isDarkMode, language } = useAppStore();
  const { palette } = useModeTheme();
  const mc = useModeClasses();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    description: string;
    type: "success" | "error" | "info";
    navigateTo?: Href;
  }>({ visible: false, title: "", description: "", type: "info" });

  /**
   * Signs the user in via Supabase Auth.
   * Validates inputs, shows errors, and navigates to the main app on success.
   */
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;

      setAlert({
        visible: true,
        title: "تم تسجيل الدخول",
        description: "تم تسجيل الدخول بنجاح.",
        type: "success",
        navigateTo: "/",
      });
    } catch (e: any) {
      const message = e?.message || "فشل تسجيل الدخول";
      setError(message);
      setAlert({
        visible: true,
        title: "فشل تسجيل الدخول",
        description: message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: palette.screen,
    accent: palette.accentSoft,
    primary: isDarkMode ? palette.interactive : palette.header,
    secondary: palette.secondary,
  };

  const titleText = isDarkMode ? mc.darkInteractiveText : mc.textHeader;
  const subtitleText = isDarkMode ? mc.darkInteractiveText70 : mc.textHeader70;
  const logoCircle = isDarkMode ? mc.darkAccentSoft : mc.accentSoft;
  const glowCircle = isDarkMode ? mc.darkInteractive15 : mc.accentBg40;
  const glowCircleAlt = isDarkMode ? mc.darkInteractive10 : mc.accentBg30;
  const inputBg = isDarkMode ? mc.darkCard : "bg-white";
  const inputBorder = isDarkMode ? mc.darkInteractiveBorder30 : mc.accentBorder;
  const inputText = isDarkMode ? "text-white" : "text-slate-900";
  const inputIcon = theme.secondary;
  const placeholderColor = isDarkMode ? "#94A3B8" : "#64748B";
  const footerText = isDarkMode ? "text-gray-300" : "text-gray-500";
  const linkText = titleText;
  const buttonColors: [string, string] = [theme.primary, theme.secondary];
  const buttonText = isDarkMode ? mc.textHeader : "text-white";
  const buttonRadius = "rounded-full";
  const rowDirection = language === "ar" ? "flex-row-reverse" : "flex-row";
  const inputAlign = language === "ar" ? "text-right" : "text-left";
  const screenBg = theme.bg;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: screenBg }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -50}
      >
        <LinearGradient
          colors={[theme.bg, theme.accent, theme.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 32,
              paddingVertical: 40,
            }}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand */}
            <View className="items-center">
              <View
                className={`absolute w-72 h-72 rounded-full ${glowCircle}`}
              />
              <View
                className={`absolute w-52 h-52 rounded-full ${glowCircleAlt}`}
              />
              <View
                className={`w-52 h-52 rounded-full items-center justify-center ${logoCircle}`}
              >
                <Image
                  source={require("../../assets/images/BrainCodeIconNoBG.png")}
                  className="w-44 h-44 rounded-full"
                />
              </View>
              <Text
                className={`text-4xl font-bold tracking-tight mt-6 ${titleText}`}
              >
                BrainCode
              </Text>
              <Text className={`text-base mt-2 ${subtitleText}`}>
                تسجيل الدخول إلى مسار التعلم
              </Text>
            </View>

            {/* Form */}
            <View className="mt-10">
              <View
                className={`${rowDirection} items-center border rounded-2xl px-4 gap-3 ${inputBg} ${inputBorder}`}
              >
                <TextInput
                  className={`flex-1 py-4 text-base ${inputAlign} ${inputText}`}
                  placeholder="البريد الإلكتروني"
                  placeholderTextColor={placeholderColor}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
                <Ionicons name="mail-outline" size={20} color={inputIcon} />
              </View>

              <View
                className={`${rowDirection} items-center border rounded-2xl px-4 gap-3 mt-4 ${inputBg} ${inputBorder}`}
              >
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={inputIcon}
                  />
                </TouchableOpacity>
                <TextInput
                  className={`flex-1 py-4 text-base ${inputAlign} ${inputText}`}
                  placeholder="كلمة المرور"
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Ionicons name="lock-closed-outline" size={20} color={inputIcon} />
              </View>
            </View>

            {/* Error */}
            {error ? (
              <Text className={`mt-4 text-center text-sm font-semibold ${isDarkMode ? "text-red-300" : "text-red-600"}`}>
                {error}
              </Text>
            ) : null}

            {/* CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={loading}
              onPress={handleLogin}
              className={`mt-8 overflow-hidden ${buttonRadius} ${loading ? "opacity-60" : ""}`}
            >
              <LinearGradient
                colors={buttonColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center"
              >
                {loading ? (
                  <ActivityIndicator color={isDarkMode ? palette.onInteractive : "#ffffff"} />
                ) : (
                  <Text className={`${buttonText} text-lg font-bold`}>
                    تسجيل الدخول
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle */}
            <View className="flex-row items-center justify-center mt-8">
              <Text className={footerText}>ليس لديك حساب؟</Text>
              <TouchableOpacity
                onPress={() => router.push("/Auth/Register")}
                className="ml-2"
              >
                <Text className={`font-bold ${linkText}`}>إنشاء حساب</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </LinearGradient>
      </KeyboardAvoidingView>
      <CustomAlert
        isVisible={alert.visible}
        title={alert.title}
        description={alert.description}
        type={alert.type}
        onClose={() => {
          const dest = alert.navigateTo;
          setAlert({
            visible: false,
            title: "",
            description: "",
            type: "info",
            navigateTo: undefined,
          });
          if (dest) {
            router.replace(dest);
          }
        }}
      />
    </SafeAreaView>
  );
}