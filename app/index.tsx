import React, { useRef, useState } from "react";
import {
  I18nManager,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useAppStore, Task } from "../store/useAppStore";
import { GraduationCap, Code2, Settings, Trash2 } from "lucide-react-native";
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
    toggleTaskComplete,
    completeHabit,
    removeTask,
    removeHabit,
  } = useAppStore();
  const isStudy = mode === "study";

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
      ? "هدفك اليومي مكتمل!"
      : "الهدف اليومي"
    : progressPercentage === 100
      ? "كل مهامك مكتملة!"
      : "استقرار النظام";
      
  const streakCount = habits.reduce(
    (max, habit) => Math.max(max, habit.streak),
    0,
  );

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
    const dueDateLabel = item.dueDate
      ? new Date(item.dueDate).toLocaleDateString(
          I18nManager.isRTL ? "ar-SA" : "en-US",
          {
            day: "numeric",
            month: "short",
          },
        )
      : "بدون تاريخ";
    {
      /* No Date */
    }

    return (
      <Pressable onPress={() => handleOpenDetails(item.id)}>
        <View
          className={`flex-row items-center justify-between mb-3 p-3 rounded-[30px] border ${
            item.completed
              ? "bg-gray-100 border-gray-200"
              : isStudy
                ? "bg-white border-study-primary/20"
                : "bg-white border-coding-primary/20"
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
                ? "bg-gray-200"
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
              className={`font-bold text-base ${item.completed ? "line-through text-gray-500" : "text-gray-800"}`}
            >
              {item.title}
            </Text>
            <Text className="text-gray-600 text-xs">{dueDateLabel}</Text>
          </View>

          <Pressable
            onPress={() => toggleTaskComplete(item.id)}
            className={`flex-row items-center p-1 mb-2 rounded-[24px] ${
              item.completed ? "bg-gray-100 border-gray-200" : "bg-white"
            }`}
          >
            <View
              className={`w-8 h-8 rounded-md border-2 mx-5 flex-row items-center justify-center ${item.completed ? "bg-green-700 border-green-700" : "border-gray-200"}`}
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
            ? "bg-gray-100 border-gray-200"
            : isStudy
              ? "bg-white border-study-primary/10"
              : "bg-white border-coding-primary/10"
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
              ? "bg-gray-200"
              : isStudy
                ? "bg-study-primary/10"
                : "bg-coding-primary/10"
          }`}
        >
          <View
            className={`w-3 h-3 rounded-full ${item.priority === "high" ? "bg-red-500" : item.priority === "medium" ? "bg-yellow-500" : item.priority === "low" ? "bg-green-600" : isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
          />
        </View>

        <View className="mx-3 ml-3 flex-1">
          <Text
            className={`font-bold text-base text-gray-800 ${item.completed ? "line-through text-gray-500" : ""}`}
          >
            {item.title}
          </Text>
          <View className="self-start rounded-full px-3 py-1 border border-gray-200 bg-gray-50">
            <Text className="text-[8px] font-black uppercase text-gray-600">
              {item.priority === "high"
                ? "عالية" /* High */
                : item.priority === "medium"
                  ? "متوسطة" /* Medium */
                  : "منخفضة"}{" "}
              {/* Low */}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => completeHabit(item.id)}
          className="flex-row items-center"
        >
          <View
            className={`w-8 h-8 rounded-md border-2 mx-2 flex-row items-center justify-center ${item.completed ? "bg-green-700 border-green-700" : "border-gray-100"}`}
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
      className={`mb-4 rounded-3xl px-4 py-4 ${isStudy ? "bg-violet-400" : "bg-green-200"}`}
      style={{ minHeight: 128 }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text
            className={`text-xs font-bold uppercase ${isStudy ? "text-violet-500" : "text-green-600"}`}
          >
            {progressLabel}
          </Text>
          <Text
            className={`mt-2 text-3xl font-black ${isStudy ? "text-violet-900" : "text-green-800 font-mono"}`}
          >
            {progressPercentage}%
          </Text>
          <Text
            className={`mt-1 text-sm ${isStudy ? "text-violet-700" : "text-green-700"}`}
          >
            {completedItems} / {totalItems || 1} مكتملة {/* completed */}
          </Text>
        </View>

        <View
          className={`justify-center rounded-full px-4 py-3 ${isStudy ? "bg-violet-100" : "bg-green-100"}`}
        >
          <Text
            className={`text-[10px] text-center uppercase font-bold ${isStudy ? "text-violet-500" : "text-green-500 font-mono"}`}
          >
            السلسلة
          </Text>
          <Text
            className={`mt-1 text-center text-2xl font-black ${isStudy ? "text-violet-900" : "text-green-800 font-mono"}`}
          >
            {streakCount}
          </Text>
          <Text
            className={`text-[10px] text-center ${isStudy ? "text-violet-600" : "text-green-600"}`}
          >
            أيام متصلة {/* consecutive days */}
          </Text>
        </View>
      </View>

      <View className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/20">
        <View
          className={`h-full rounded-full ${isStudy ? "bg-violet-700" : "bg-green-500"}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );

  const HeaderSection = () => (
    <View
      className={`pt-12 pb-5 px-6 shadow-2xl ${
        isStudy ? "bg-study-primary" : "bg-coding-primary"
      }`}
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
            {isStudy ? "STUDY MODE" : "DEV MODE"}
          </Text>
          <Text className="text-white text-2xl font-black">
            {isStudy ? "بيئة الدراسة" : "بيئة البرمجة"}
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
    <View className={`flex-1 ${isStudy ? "bg-study-bg" : "bg-coding-bg"}`}>
      <HeaderSection />

      <View className="flex-1 px-4 mt-2">
        <ProgressDashboard />

        <View className="flex-row justify-between items-center mt-6 mb-3 px-1">
          <Text
            className={`text-lg font-bold ${isStudy ? "text-indigo-900" : "text-emerald-900"}`}
          >
            مهام اليوم {/* ترجمة عربية: Today's Tasks */}
          </Text>
          <Pressable
            onPress={() => router.push("./view-all")}
            className="px-3 py-1 rounded-lg"
          >
            <Text className="text-sm font-bold text-gray-600">عرض الكل</Text>
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

        <View className="flex-row justify-between items-center px-1 mb-3">
          <Text className="text-lg font-bold text-gray-800">عاداتي</Text>
          {/* My Habits */}
          <Pressable
            onPress={() => router.push("./view-all")}
            className="px-3 py-1 rounded-lg"
          >
            <Text className="text-sm font-bold text-gray-600">عرض الكل</Text>
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
