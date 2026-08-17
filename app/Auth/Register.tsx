import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
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

export default function Register() {
  const { isDarkMode, language } = useAppStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const titleText = isDarkMode ? "text-white" : "text-slate-900";
  const subtitleText = isDarkMode ? "text-purple-200/70" : "text-slate-600";
  const logoCircle = isDarkMode ? "bg-purple-900/20" : "bg-emerald-100/60";
  const glowCircle = isDarkMode
    ? "bg-purple-500/10"
    : "bg-emerald-200/40";
  const glowCircleAlt = isDarkMode
    ? "bg-fuchsia-500/20"
    : "bg-teal-200/30";
  const inputBg = isDarkMode ? "bg-purple-950/40" : "bg-white";
  const inputBorder = isDarkMode ? "border-purple-800/50" : "border-emerald-200/60";
  const inputText = isDarkMode ? "text-white" : "text-slate-900";
  const inputIcon = isDarkMode ? "#94A3B8" : "#475569";
  const placeholderColor = isDarkMode ? "#94A3B8" : "#64748B";
  const footerText = isDarkMode ? "text-purple-200/70" : "text-slate-500";
  const linkText = isDarkMode ? "text-purple-400" : "text-emerald-600";
  const buttonColors: [string, string] = isDarkMode
    ? ["#7C3AED", "#C026D3"]
    : ["#10B981", "#059669"];
  const buttonRadius = "rounded-full";
  const rowDirection = language === "ar" ? "flex-row-reverse" : "flex-row";
  const inputAlign = language === "ar" ? "text-right" : "text-left";
  const screenBg = isDarkMode ? "#0F0C1B" : "#F0FDFA";

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
          colors={
            isDarkMode
              ? ["#0F0C1B", "#2E1065", "#0B0813"]
              : ["#F0FDFA", "#E6FFFA", "#ECFDF5"]
          }
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
                أنشئ ملفك الشخصي في هابيت سكريبت
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

            {/* CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              className={`mt-8 overflow-hidden ${buttonRadius}`}
            >
              <LinearGradient
                colors={buttonColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center"
              >
                <Text className="text-white text-lg font-bold">
                  تسجيل جديد
                </Text>
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
