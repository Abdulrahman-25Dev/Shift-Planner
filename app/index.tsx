import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useAppStore, Task } from "../store/useAppStore";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Code2,
  Settings,
  Trash2,
  Flame,
} from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { AddTaskSheet } from "../components/AddTaskSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { DetailsSheet } from "./tasks/taskDetails";

export default function Index() {
  const {
    mode,
    toggleMode,
    tasks,
    habits,
    isDarkMode,
    toggleTaskComplete,
    completeHabit,
    removeTask,
    removeHabit,
    language,
  } = useAppStore();
  const isStudy = mode === "study";
  const { t } = useTranslation();

  const priorityRank = (priority: string | undefined) => {
    if (priority === "high") return 3;
    if (priority === "medium") return 2;
    return 1;
  };

  const today = new Date().toDateString();
  const habitsWithCompleted = habits.map((habit) => ({
    ...habit,
    completed: habit.lastCompletedDate
      ? new Date(habit.lastCompletedDate).toDateString() === today
      : false,
  }));

  // حسابات التقدم للداشبورد (Progress Dashboard calculations)
  const totalItems = tasks.length;
  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const completedItems = completedTasksCount;
  const progressRatio = totalItems === 0 ? 0 : completedItems / totalItems;
  const progressPercentage = Math.round(progressRatio * 100);
  const progressLabel = isStudy
    ? progressPercentage === 100
      ? t("progress.completeStudy")
      : t("progress.daily")
    : progressPercentage === 100
      ? t("progress.completeDev")
      : t("progress.devTitle");

  // ترتيب العادات حسب الاكتمال ثم الاولوية (Sort habits by completion then priority)
  const sortedHabits = [...habitsWithCompleted].sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }
    return priorityRank(b.priority) - priorityRank(a.priority);
  });

  // ترتيب المهام حسب الاكتمال (Sort tasks by completion)
  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed),
  );

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openAddTaskSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleOpenDetails = (id: string) => {
    setSelectedId(id);
    detailsSheetRef.current?.present();
  };

  const renderTasks = ({ item }: { item: Task }) => {
    const dateSource = item.dueDate
      ? new Date(item.dueDate)
      : item.reminderTime
        ? new Date(item.reminderTime)
        : null;

    const dueDateLabel = dateSource
      ? dateSource.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
          day: "numeric",
          month: "short",
        })
      : t("task.noDate");

    const dueTimeLabel = dateSource
      ? dateSource.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    return (
      <Pressable onPress={() => handleOpenDetails(item.id)}>
        <View
          className={`flex-row items-center justify-between mb-3 p-3 rounded-[30px] border ${
            item.completed
              ? isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-100 border-gray-200"
              : isDarkMode
                ? isStudy
                  ? "bg-study-dark-bg/60 border-gray-700"
                  : "bg-coding-dark-bg/60 border-gray-700"
                : isStudy
                  ? "bg-violet-100 border-study-primary/20"
                  : "bg-green-50 border-coding-primary/20"
          }`}
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
          }}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              item.completed
                ? isDarkMode
                  ? "bg-gray-600"
                  : "bg-gray-200"
                : isDarkMode
                  ? "bg-gray-600"
                  : isStudy
                    ? "bg-study-primary/10"
                    : "bg-coding-primary/10"
            }`}
          >
            <View
              className={`w-3 h-3 rounded-full ${item.completed ? "bg-gray-400" : isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
            />
          </View>

          <View className="flex-1 ml-3">
            <Text
              className={`font-bold text-base ${item.completed ? "line-through text-gray-500" : isDarkMode ? "line through text-gray-200" : "text-gray-800"}`}
            >
              {item.title}
            </Text>
            <View className="flex-row justify-between items-center mt-1">
              <Text
                className={
                  " text-xs" +
                  (item.completed
                    ? " text-gray-400"
                    : isDarkMode
                      ? " text-gray-400"
                      : " text-gray-600")
                }
              >
                {dueDateLabel}-
                {dueTimeLabel ? (
                  <Text
                    className={
                      " text-xs" +
                      (item.completed
                        ? " text-gray-400"
                        : isDarkMode
                          ? " text-gray-400"
                          : " text-gray-600")
                    }
                  >
                    {dueTimeLabel}
                  </Text>
                ) : null}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => toggleTaskComplete(item.id)}
            className={`flex-row items-center p-1 mb-2 rounded-[24px] ${
              item.completed
                ? isDarkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-200"
                : isDarkMode
                  ? isStudy
                    ? "bg-study-dark-bg/60 border-gray-700"
                    : "bg-coding-dark-bg/60 border-gray-700"
                  : isStudy
                    ? "bg-violet-100 border-study-primary/20"
                    : "bg-green-50 border-coding-primary/20"
            }`}
          >
            <View
              className={`w-8 h-8 rounded-md border-2 mx-5 flex-row items-center justify-center ${item.completed ? "bg-green-700 border-green-700" : isDarkMode ? "border-gray-500" : "border-gray-200"}`}
            >
              {item.completed && (
                <Text className="text-white text-xs font-bold text-center">
                  ✓
                </Text>
              )}
            </View>
          </Pressable>

          <TouchableOpacity
            onPress={() => removeTask(item.id)}
            className="w-10 h-10 rounded-full bg-red-500 items-center justify-center ml-2"
          >
            <Trash2 color="white" size={20} />
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  const renderHabits = ({
    item,
  }: {
    item: {
      completed: boolean;
      id: string;
      title: string;
      streak: number;
      priority?: "low" | "medium" | "high";
    };
  }) => {
    return (
      <Pressable
        onPressIn={() => handleOpenDetails(item.id)}
        className={`flex-row justify-between items-center px-4 py-2 mb-3 rounded-[24px] border ${
          item.completed
            ? isDarkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-100 border-gray-200"
            : isDarkMode
              ? isStudy
                ? "bg-study-dark-bg/60 border-gray-700"
                : "bg-coding-dark-bg/60 border-gray-700"
              : isStudy
                ? "bg-violet-50 border-study-primary/20"
                : "bg-green-50 border-coding-primary/20"
        }`}
        style={{
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
        }}
      >
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            item.completed
              ? isDarkMode
                ? "bg-gray-600"
                : "bg-gray-200"
              : isDarkMode
                ? "bg-gray-600"
                : isStudy
                  ? "bg-study-primary/10"
                  : "bg-coding-primary/10"
          }`}
        >
          <Flame
            size={20}
            color={
              item.priority === "high"
                ? "red"
                : item.priority === "medium"
                  ? "orange"
                  : "green"
            }
          />
        </View>

        <View className="mx-3 ml-3 flex-1">
          <Text
            className={`${isDarkMode ? "font-semibold text-gray-100" : "font-bold text-gray-800"} text-base ${item.completed ? "line-through text-gray-400" : ""}`}
          >
            {item.title}
          </Text>
          <View
            className={`${isDarkMode ? "bg-transparent border-gray-600" : "self-start rounded-full px-3 py-1 border border-gray-200 bg-gray-50"}`}
          >
            <Text
              className={`${isDarkMode ? "text-[8px] font-black uppercase text-gray-300" : "text-[8px] font-black uppercase text-gray-600"}`}
            >
              {item.priority === "high"
                ? t("priority.high")
                : item.priority === "medium"
                  ? t("priority.medium")
                  : t("priority.low")}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => completeHabit(item.id)}
          className={`flex-row items-center ${
            item.completed
              ? isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-200"
              : isDarkMode
                ? "bg-transparent"
                : "bg-white"
          }`}
        >
          <View
            className={`w-8 h-8 rounded-md border-2 mx-2 flex-row items-center justify-center ${item.completed ? "bg-green-700 border-green-700" : isDarkMode ? "border-gray-500" : "border-gray-100"}`}
          >
            {item.completed && (
              <Text className="text-white text-xs font-bold text-center">
                ✓
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => removeHabit(item.id)}
          className="w-10 h-10 rounded-full bg-red-500 items-center justify-center ml-2"
        >
          <Trash2 color="white" size={20} />
        </Pressable>
      </Pressable>
    );
  };

  // داشبورد التقدم بدلاً من شريط الأيام (Progress Dashboard replacing Days Row)
  const ProgressDashboard = () => (
    <View
      className={`my-4 rounded-3xl px-4 py-4 ${isDarkMode ? (isStudy ? "bg-study-dark-accent" : "bg-coding-dark-accent") : isStudy ? "bg-violet-300" : "bg-green-300"}`}
      style={{ minHeight: 128 }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text
            className={`text-sm font-bold uppercase ${language === "ar" ? "text-left" : "text-right"} ${isDarkMode ? (isStudy ? "text-violet-500" : "text-green-600") : isStudy ? "text-violet-600" : "text-green-600"}`}
          >
            {progressLabel}
          </Text>
          <Text
            className={`mt-2 text-3xl font-black ${language === "ar" ? "text-left" : "text-right"} ${isDarkMode ? (isStudy ? "text-violet-500" : "text-green-500") : isStudy ? "text-violet-900" : "text-green-800"}`}
          >
            {progressPercentage}%
          </Text>
          <Text
            className={`mt-1 text-sm ${language === "ar" ? "text-left" : "text-right"} ${isDarkMode ? (isStudy ? "text-violet-500" : "text-green-500") : isStudy ? "text-violet-700" : "text-green-700"}`}
          >
            {completedItems} / {totalItems || 1} {t("progress.completed")}
          </Text>
        </View>
      </View>

      <View className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/20">
        <View
          className={`h-full rounded-full ${language === "ar" ? "mr-auto" : "ml-auto"} ${isStudy ? "bg-violet-700" : "bg-green-600"}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );

  const HeaderSection = () => (
    <View
      className={`pt-12 pb-5 px-6 shadow-2xl 
        ${isDarkMode ? (isStudy ? "bg-study-dark-accent" : "bg-coding-dark-accent") : isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
    >
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={toggleMode}
          className="bg-white/20 p-3 rounded-2xl"
        >
          {isStudy ? (
            <GraduationCap color="white" size={26} />
          ) : (
            <Code2 color="white" size={26} />
          )}
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-white/70 text-xs font-bold mb-1">
            {isStudy ? t("header.modeShortStudy") : t("header.modeShortDev")}
          </Text>
          <Text className="text-white text-2xl font-black">
            {isStudy ? t("header.modeTitleStudy") : t("header.modeTitleDev")}
          </Text>
        </View>

        <View>
          <Pressable
            onPress={() => router.push("./settings")}
            className="bg-white/20 p-3 rounded-2xl"
          >
            <Settings color="white" size={26} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View
      className={`flex-1 ${isDarkMode ? (isStudy ? "bg-study-dark-bg" : "bg-coding-dark-bg") : isStudy ? "bg-study-accent" : "bg-coding-accent"}`}
    >
      <HeaderSection />

      <View className="flex-1 px-4 mt-2">
        <ProgressDashboard />

        <View className={" justify-between items-center mt-6 mb-3 px-1" + (language === "ar" ? " flex-row" : " flex-row-reverse")}>
          <Text
            className={`text-lg font-bold ${isDarkMode ? (isStudy ? "text-violet-500" : "text-green-500") : isStudy ? "text-violet-900" : "text-green-800"}`}
          >
            {t("common.Tasks")}
          </Text>
          <Pressable
            onPress={() => router.push("./view-all")}
            className="px-3 py-1 rounded-lg"
          >
            <Text
              className={`text-sm font-bold ${isDarkMode ? (isStudy ? "text-violet-500" : "text-green-500") : isStudy ? "text-violet-900" : "text-green-800"}`}
            >
              {t("common.viewAll")}
            </Text>
            {/* View All */}
          </Pressable>
        </View>

        <View className="h-56">
          <FlashList
            data={sortedTasks.slice(0, 2)}
            renderItem={renderTasks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View className={"justify-between items-center px-1 mb-3" + (language === "ar" ? " flex-row" : " flex-row-reverse")}>
          <Text
            className={`text-lg font-bold ${isDarkMode ? (isStudy ? "text-violet-500" : "text-green-500") : isStudy ? "text-violet-900" : "text-green-800"}`}
          >
            {t("common.Habits")}
          </Text>
          {/* My Habits */}
          <Pressable
            onPress={() => router.push("./view-all")}
            className="px-3 py-1 rounded-lg"
          >
            <Text
              className={`text-sm font-bold ${isDarkMode ? (isStudy ? "text-violet-500" : "text-green-500") : isStudy ? "text-violet-900" : "text-green-800"}`}
            >
              {t("common.viewAll")}
            </Text>
          </Pressable>
        </View>

        <View className="h-64">
          <FlashList
            data={sortedHabits.slice(0, 2)}
            renderItem={renderHabits}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <TouchableOpacity
          onPress={openAddTaskSheet}
          className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center ${
            isStudy ? "bg-study-primary" : "bg-coding-primary"
          }`}
          style={{ elevation: 5 }}
        >
          <Text className="text-white text-3xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      <AddTaskSheet ref={bottomSheetRef} mode={mode} />
      <DetailsSheet ref={detailsSheetRef} itemId={selectedId} />
    </View>
  );
}
