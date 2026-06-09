import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { ArrowRight, Globe, Bell, Info, Trash2, Moon, Sun, GraduationCap, Code2 } from 'lucide-react-native'
import { router } from 'expo-router'
import { useAppStore } from '../store/useAppStore'

export default function Settings() {
  const { mode, toggleDarkMode, isDarkMode } = useAppStore()
  const isStudy = mode === 'study'
  const [notifications, setNotifications] = useState(false)

  const primaryColor = isStudy ? '#4f46e5' : '#064e3b'
  const primaryLightColor = isStudy ? '#c7d2fe' : '#d1fae5'
  const primaryBgLight = isStudy ? 'bg-study-primary/10' : 'bg-coding-primary/10'
  const iconColor = isDarkMode ? '#e0e7ff' : primaryColor
  const trashColor = isDarkMode ? '#fca5a5' : '#dc2626'

  const shadowStyle = {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  }

  return (
    <View className={`flex-1 ${isDarkMode ? isStudy ? 'bg-study-dark-bg' : 'bg-coding-dark-bg' : 'bg-gray-100'}`}>
      {/* Header */}
      <View className="pt-14 pb-2 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-3 rounded-2xl ${primaryBgLight}`}
          >
            <ArrowRight size={22} color={iconColor} />
          </TouchableOpacity>
          <Text className={`text-gray-800 text-lg font-bold flex-1 text-center ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-800'}`}>
            الإعدادات
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        {/* User Profile */}
        <View className="items-center mb-6 mt-2">
          <View className={`w-20 h-20 rounded-full items-center justify-center ${primaryBgLight}`}>
            {isStudy ? (
              <GraduationCap size={32} color={iconColor} />
            ) : (
              <Code2 size={32} color={iconColor} />
            )}
          </View>
          <Text className={`text-gray-800 text-base font-bold mt-3 ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-800'}`}>
            اسم المستخدم
          </Text>
        </View>

        {/* Settings Grid - 2 Columns */}
          <Text className={`text-gray-500 text-sm font-bold mb-4 ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-500'}`}>
            التفضيلات
          </Text>
        <View className="flex-row flex-wrap justify-between mb-4">
          {/* Card 1: Theme */}
          <TouchableOpacity
            className={`w-[48%] ${isDarkMode ? isStudy ? 'bg-study-dark-accent' : 'bg-coding-dark-accent' : 'bg-white'} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
            onPress={toggleDarkMode}
          >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${primaryBgLight}`}>
              {isDarkMode ? (
                <Moon size={24} color={iconColor} />
              ) : (
                <Sun size={24} color={iconColor} />
              )}
            </View>
            <Text className={`text-gray-800 text-sm font-bold mt-3 text-center ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-800'}`}>
              الثيم
            </Text>
          </TouchableOpacity>

          {/* Card 2: Language */}
          <TouchableOpacity
            className={`w-[48%] ${isDarkMode ? isStudy ? 'bg-study-dark-accent' : 'bg-coding-dark-accent' : 'bg-white'} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
            onPress={() => {}}
          >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${primaryBgLight}`}>
              <Globe size={24} color={iconColor} />
            </View>
            <Text className={`text-gray-800 text-sm font-bold mt-3 text-center ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-800'}`}>
              اللغة ع | En
            </Text>
          </TouchableOpacity>

          {/* Card 3: About the App */}
          <TouchableOpacity
            className={`w-[48%] ${isDarkMode ? isStudy ? 'bg-study-dark-accent' : 'bg-coding-dark-accent' : 'bg-white'} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
            onPress={() => {}}
          >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${primaryBgLight}`}>
              <Info size={24} color={iconColor} />
            </View>
            <Text className={`text-gray-800 text-sm font-bold mt-3 text-center ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-800'}`}>
              حول التطبيق
            </Text>
          </TouchableOpacity>

          {/* Card 4: Notifications */}
          <View
            className={`w-[48%] ${isDarkMode ? isStudy ? 'bg-study-dark-accent' : 'bg-coding-dark-accent' : 'bg-white'} rounded-3xl p-4 items-center mb-3`}
            style={shadowStyle}
          >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${primaryBgLight}`}>
              <Bell size={24} color={iconColor} />
            </View>
            <Text className={`text-gray-800 text-sm font-bold mt-3 text-center mb-2 ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-800'}`}>
              تشغيل الإشعارات
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={isDarkMode ? { false: '#4b5563', true: primaryLightColor } : { false: '#d1d5db', true: primaryColor }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data Management */}
        <View className="mx-0 mt-4 mb-8">
          <Text className={`text-gray-600 text-sm font-bold mb-3 mr-1 ${isDarkMode ? isStudy ? 'text-study-dark-primary' : 'text-coding-dark-primary' : 'text-gray-600'}`}>
            إدارة البيانات
          </Text>
          <View className="bg-white rounded-3xl" style={shadowStyle}>
            <TouchableOpacity
              className={`flex-row-reverse items-center justify-between p-4 ${isDarkMode ? isStudy ? 'bg-study-dark-accent' : 'bg-coding-dark-accent' : 'bg-white'} rounded-t-3xl`}
              onPress={() => {}}
            >
              <View className="flex-row-reverse items-center pl-4 justify-between flex-1">
                <View className="w-10 h-10 rounded-2xl items-center justify-center bg-red-50 dark:bg-red-900">
                  <Trash2 size={20} color={trashColor} />
                </View>
                <Text className="mr-3 text-red-600 text-right font-bold">مسح جميع المهام</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-row-reverse items-center justify-between p-4 ${isDarkMode ? isStudy ? 'bg-study-dark-accent' : 'bg-coding-dark-accent' : 'bg-white'} rounded-b-3xl`}
              onPress={() => {}}
            >
              <View className="flex-row-reverse items-center pl-4 justify-between flex-1">
                <View className="w-10 h-10 rounded-2xl items-center justify-center bg-red-50 dark:bg-red-900">
                  <Trash2 size={20} color={trashColor} />
                </View>
                <Text className="mr-3 text-red-600 text-right font-bold">مسح جميع العادات</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
