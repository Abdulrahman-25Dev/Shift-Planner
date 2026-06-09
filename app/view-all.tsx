import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import React, { useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { Task, Habit, useAppStore } from "../store/useAppStore";
import {
  CheckCircle2,
  RefreshCw,
  Trash2,
  ChevronLeft,
} from "lucide-react-native";
import { AddTaskSheet } from "../components/AddTaskSheet";
import { router } from "expo-router";
import { DetailsSheet } from "./tasks/taskDetails";
import BottomSheetModal from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetModal/BottomSheetModal";
const ShowAll = () => {
  const {
    tasks,
    removeTask,
    removeHabit,
    habits,
    toggleTaskComplete,
    mode,
    completeHabit,
    isDarkMode,
  } = useAppStore();
  const [type, setType] = useState<"task" | "habit">("task");
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");

  const handleOpenDetails = (id: string) => {
    setSelectedId(id);
    detailsSheetRef.current?.present();
  };

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openAddTaskSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const isStudy = mode === "study";

  const renderTasks = ({ item }: { item: Task }) => {
    const dateSource = item.dueDate
      ? new Date(item.dueDate)
      : item.reminderTime
        ? new Date(item.reminderTime)
        : null;

    const dueDateLabel = dateSource
      ? dateSource.toLocaleDateString(I18nManager.isRTL ? "ar-SA" : "en-US", {
          day: "numeric",
          month: "short",
        })
      : "بدون تاريخ";

    const dueTimeLabel = dateSource
      ? dateSource.toLocaleTimeString("en-US", {
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
          {/* أيقونة الحالة */}
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
              className={`w-3 h-3 rounded-full ${item.completed ? (isDarkMode ? "bg-gray-400" : "bg-gray-400") : isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
            />
          </View>

          <View className="flex-1 ml-3">
            <Text
              className={`${isDarkMode ? "font-semibold text-gray-100" : "font-bold text-gray-800"} text-base ${item.completed ? "line-through text-gray-400" : ""}`}
            >
              {item.title}
            </Text>
            <Text
              className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-xs`}
            >
              {dueDateLabel} -{" "}
              {dueTimeLabel ? (
                <Text
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-xs`}
                >
                  {dueTimeLabel}
                </Text>
              ) : null}
            </Text>
          </View>

          {/* زر إتمام سريع */}
          <Pressable
            onPress={() => toggleTaskComplete(item.id)}
            className={`flex-row items-center p-1 mb-2 rounded-[24px] ${
              item.completed
                ? isDarkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-200"
                : isDarkMode
                  ? "bg-transparent"
                  : "bg-white"
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

          {/* زر الحذف */}
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

  const renderHabits = ({ item }: { item: Habit }) => {
    const completed = item.lastCompletedDate
      ? new Date(item.lastCompletedDate).toDateString() ===
        new Date().toDateString()
      : false;

    return (
      <Pressable
        onPressIn={() => handleOpenDetails(item.id)}
        className={`flex-row justify-between items-center px-4 py-2 mb-3 rounded-[24px] border ${
          completed
            ? isDarkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-100 border-gray-200"
            : isDarkMode
              ? isStudy
                ? "bg-study-dark-bg/60 border-gray-700"
                : "bg-coding-dark-bg/60 border-gray-700"
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
        {/* أيقونة الحالة */}
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            completed
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
            className={`w-3 h-3 rounded-full ${item.priority === "high" ? "bg-red-500" : item.priority === "medium" ? "bg-yellow-500" : item.priority === "low" ? "bg-green-600" : isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
          />
        </View>

        {/* 2. النصوص (العنوان والسلسلة) */}
        <View className="mx-3 ml-3 flex-1">
          <Text
            className={`${isDarkMode ? "font-semibold text-gray-100" : "font-bold text-gray-800"} text-base ${completed ? "line-through text-gray-400" : ""}`}
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
                ? "عالية"
                : item.priority === "medium"
                  ? "متوسطة"
                  : "منخفضة"}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => completeHabit(item.id)}
          className={`flex-row items-center ${
            completed
              ? isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-200"
              : isDarkMode
                ? "bg-transparent"
                : "bg-white"
          }`}
        >
          <View
            className={`w-8 h-8 rounded-md border-2 mx-2 flex-row items-center justify-center ${completed ? "bg-green-700 border-green-700" : isDarkMode ? "border-gray-500" : "border-gray-100"}`}
          >
            {completed && (
              <Text className="text-white text-xs font-bold text-center">
                ✓
              </Text>
            )}
          </View>
        </Pressable>

        {/* زر الحذف */}
        <Pressable
          onPress={() => removeHabit(item.id)}
          className="w-10 h-10 rounded-full bg-red-500 items-center justify-center ml-2"
        >
          <Trash2 color="white" size={20} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View
      className={`flex-1 px-4 py-6 ${isDarkMode ? (isStudy ? "bg-study-dark-bg" : "bg-coding-dark-bg") : "bg-white"}`}
    >
      <View className="flex-row items-center justify-center mb-6">
        <Text className={`text-xl font-bold my-6 mlr-3 text-center 
          ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : isStudy ? "text-study-primary" : "text-coding-primary"}`}>
          جميع {type === "task" ? "المهام" : "العادات"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className={"absolute right-4 top-6 p-2 rounded-full " + (isDarkMode ? isStudy ? "bg-violet-700" : "bg-green-700" : isStudy ? "bg-study-primary" : "bg-coding-primary")}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
      </View>

      {/* 2. السويتش (مبدل مهمة/عادة) */}
      <View className={"flex-row p-1.5 rounded-2xl mb-4 " + (isDarkMode ? isStudy ? "bg-study-dark-accent/60" : "bg-coding-dark-accent/60" : "bg-gray-100")}>
        <TouchableOpacity
          onPress={() => setType("task")}
          className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-2 ${type === "task" ? isDarkMode ? isStudy ? "bg-study-dark-primary/50" : "bg-coding-dark-primary/50" : (isStudy ? "bg-study-primary" : "bg-coding-primary") : ""}`}
        >
          <Text
            className={`font-bold ${type === "task" ? "text-white" : "text-gray-400"}`}
          >
            قيد الإنجاز
          </Text>
          <CheckCircle2
            size={20}
            color={type === "task" ? "white" : "#9CA3AF"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setType("habit")}
          className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-3 ${type === "habit" ? isDarkMode ? isStudy ? "bg-study-dark-primary" : "bg-coding-dark-primary" : (isStudy ? "bg-study-primary" : "bg-coding-primary") : ""}`}
        >
          <Text
            className={`font-bold ${type === "habit" ? "text-white" : "text-gray-400"}`}
          >
            الروتين اليومي
          </Text>
          <RefreshCw size={20} color={type === "habit" ? "white" : "#9CA3AF"} />
        </TouchableOpacity>
      </View>
      {/* 1. الفلاتر (الكل / مكتملة / غير مكتملة) */}
      <View className={"flex-row p-1.5 rounded-2xl mb-4 " + (isDarkMode ? isStudy ? "bg-study-dark-accent/60" : "bg-coding-dark-accent/60" : "bg-gray-100")}>
        {["all", "completed", "incompleted"].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${category === cat ? (isDarkMode ? isStudy ? "bg-study-dark-primary/50" : "bg-coding-dark-primary/50" : (isStudy ? "bg-study-primary" : "bg-coding-primary")) : ""}`}
          >
            <Text
              className={`font-bold text-sm ${category === cat ? "text-white" : "text-gray-400"}`}
            >
              {cat === "all"
                ? "الكل"
                : cat === "completed"
                  ? "مكتملة"
                  : "غير مكتملة"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === "task"
        ? (() => {
            const filteredTasks = tasks.filter((t) =>
              category === "all"
                ? true
                : category === "completed"
                  ? t.completed
                  : !t.completed,
            );
            return filteredTasks.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">لا توجد مهام حالياً.</Text>
                <Text className="text-gray-500">قم بانشاء مهمة جديدة.</Text>
                <TouchableOpacity
                  onPress={openAddTaskSheet}
                  className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center ${
                    isDarkMode ? (isStudy ? "bg-study-dark-primary" : "bg-coding-dark-primary") : (isStudy ? "bg-study-primary" : "bg-coding-primary")
                  }`}
                  style={{ elevation: 5 }}
                >
                  <Text className="text-white text-3xl font-bold">+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlashList
                data={filteredTasks}
                renderItem={renderTasks}
                keyExtractor={(item) => item.id}
              />
            );
          })()
        : (() => {
            const today = new Date().toDateString();
            const filteredHabits = habits.filter((h) => {
              const isCompletedToday =
                h.lastCompletedDate &&
                new Date(h.lastCompletedDate).toDateString() === today;
              return category === "all"
                ? true
                : category === "completed"
                  ? isCompletedToday
                  : !isCompletedToday;
            });
            return filteredHabits.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">لا توجد عادات حالياً.</Text>
                <Text className="text-gray-500">قم بانشاء عادة جديدة.</Text>
                <TouchableOpacity
                  onPress={openAddTaskSheet}
                  className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center ${
                    isDarkMode ? (isStudy ? "bg-study-dark-primary" : "bg-coding-dark-primary") : (isStudy ? "bg-study-primary" : "bg-coding-primary")
                  }`}
                  style={{ elevation: 5 }}
                >
                  <Text className="text-white text-3xl font-bold">+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlashList
                data={filteredHabits}
                renderItem={renderHabits}
                keyExtractor={(item) => item.id}
              />
            );
          })()}
      <AddTaskSheet ref={bottomSheetRef} />
      <DetailsSheet ref={detailsSheetRef} itemId={selectedId} />
    </View>
  );
};

export default ShowAll;
