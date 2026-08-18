import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";
import { useModeTheme } from "@/src/theme";
import { supabase } from "@/supabase";

export default function Register() {
  const { isDarkMode, language, mode } = useAppStore();
  const { palette } = useModeTheme();
  const isStudy = mode === "study";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Creates a new account via Supabase Auth.
   * Validates inputs, shows errors, and navigates to the main app on success.
   */
  const handleSignUp = async () => {
  if (!username.trim() || !email.trim() || !password) {
    setError("الرجاء ملء جميع الحقول");
    return;
  }
  if (password.length < 6) {
    setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    return;
  }

  setLoading(true);
  setError("");
  try {
    const trimmedUsername = username.trim();
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: trimmedUsername,
          display_name: trimmedUsername, // يظهر في عمود Display name بـ Supabase
          full_name: trimmedUsername,    // يدعم التوافق مع الأنظمة المختلفة
        },
      },
    });
    if (authError) throw authError;

    if (data.session) {
      // Session is active immediately (email confirmation disabled)
      router.replace("/");
    } else {
      // Email confirmation required
      Alert.alert(
        "تم إنشاء الحساب",
        "لقد تم إنشاء الحساب بنجاح.",
      );
      router.replace("/Auth/Login");
    }
  } catch (e: any) {
    const message = e?.message || "حدث خطأ غير متوقع";
    setError(message);
    Alert.alert("فشل التسجيل", message);
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

  const titleText = isDarkMode
    ? isStudy ? "text-study-dark-interactive" : "text-dev-dark-interactive"
    : isStudy ? "text-study-header" : "text-dev-header";
  const subtitleText = isDarkMode
    ? isStudy ? "text-study-dark-interactive/70" : "text-dev-dark-interactive/70"
    : isStudy ? "text-study-header/70" : "text-dev-header/70";
  const logoCircle = isDarkMode
    ? isStudy ? "bg-study-dark-accentSoft" : "bg-dev-dark-accentSoft"
    : isStudy ? "bg-study-accentSoft" : "bg-dev-accentSoft";
  const glowCircle = isDarkMode
    ? isStudy ? "bg-study-dark-interactive/15" : "bg-dev-dark-interactive/15"
    : isStudy ? "bg-study-accent/40" : "bg-dev-accent/40";
  const glowCircleAlt = isDarkMode
    ? isStudy ? "bg-study-dark-interactive/10" : "bg-dev-dark-interactive/10"
    : isStudy ? "bg-study-accent/25" : "bg-dev-accent/25";
  const inputBg = isDarkMode
    ? isStudy ? "bg-study-dark-card" : "bg-dev-dark-card"
    : "bg-white";
  const inputBorder = isDarkMode
    ? isStudy ? "border-study-dark-interactive/30" : "border-dev-dark-interactive/30"
    : isStudy ? "border-study-accent/60" : "border-dev-accent/60";
  const inputText = isDarkMode ? "text-white" : "text-slate-900";
  const inputIcon = theme.secondary;
  const placeholderColor = isDarkMode ? "#94A3B8" : "#64748B";
  const footerText = isDarkMode ? "text-gray-300" : "text-gray-500";
  const linkText = titleText;
  const buttonColors: [string, string] = [theme.primary, theme.secondary];
  const buttonText = isDarkMode
    ? isStudy ? "text-study-header" : "text-dev-header"
    : "text-white";
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -10}
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
                أنشئ ملفك الشخصي في BrainCode
              </Text>
            </View>

            {/* Form */}
            <View className="mt-10">
              <View
                className={`${rowDirection} items-center border rounded-2xl px-4 gap-3 ${inputBg} ${inputBorder}`}
              >
                <TextInput
                  className={`flex-1 py-4 text-base ${inputAlign} ${inputText}`}
                  placeholder="اسم المستخدم"
                  placeholderTextColor={placeholderColor}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Ionicons name="person-outline" size={20} color={inputIcon} />
              </View>

              <View
                className={`${rowDirection} items-center border rounded-2xl px-4 gap-3 mt-4 ${inputBg} ${inputBorder}`}
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
              onPress={handleSignUp}
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
                    تسجيل جديد
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle */}
            <View className="flex-row items-center justify-center mt-8">
              <Text className={footerText}>لديك حساب بالفعل؟</Text>
              <TouchableOpacity
                onPress={() => router.push("/Auth/Login")}
                className="ml-2"
              >
                <Text className={`font-bold ${linkText}`}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}