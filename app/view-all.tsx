import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { Task, Habit, useAppStore } from "../store/useAppStore";
import {
  CheckCircle2,
  RefreshCw,
  Trash2,
  ChevronLeft,
  Flame,
} from "lucide-react-native";
import { AddTaskSheet } from "../components/AddTaskSheet";
import ConfirmationModal from "../components/ConfirmationModal";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { DetailsSheet } from "./tasks/taskDetails";
import BottomSheetModal from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetModal/BottomSheetModal";
import { useModeTheme } from "@/src/theme";
const ShowAll = () => {
  const { t } = useTranslation();
  const {
    tasks,
    deleteSingleItem,
    habits,
    toggleTaskComplete,
    mode,
    completeHabit,
    isDarkMode,
    language,
  } = useAppStore();
  const { palette } = useModeTheme();
  const [type, setType] = useState<"task" | "habit">("task");
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "task" | "habit";
  } | null>(null);

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
                  ? "bg-study-dark-card border-gray-600/50"
                  : "bg-dev-dark-card border-gray-600/50"
                : isStudy
                  ? "bg-white border-study-accent/60"
                  : "bg-white border-dev-accent/60"
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
                : item.priority === "high"
                  ? "bg-red-500/15"
                  : item.priority === "medium"
                    ? "bg-amber-500/15"
                    : item.priority === "low"
                      ? "bg-emerald-500/15"
                      : isDarkMode
                        ? isStudy
                          ? "bg-study-dark-accentSoft"
                          : "bg-dev-dark-accentSoft"
                        : isStudy
                          ? "bg-study-accent/40"
                          : "bg-dev-accent/40"
            }`}
          >
            <View
              className={`w-4 h-4 rounded-full ${
                item.completed
                  ? "bg-gray-400"
                  : item.priority === "high"
                    ? "bg-red-500"
                    : item.priority === "medium"
                      ? "bg-amber-500"
                      : item.priority === "low"
                        ? "bg-emerald-500"
                        : isDarkMode
                          ? isStudy
                            ? "bg-study-dark-interactive"
                            : "bg-dev-dark-interactive"
                          : isStudy
                            ? "bg-study-header"
                            : "bg-dev-header"
              }`}
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
              {dueDateLabel} | {" "}
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
                  ? "border-gray-600"
                  : "border-gray-200"
                : isDarkMode
                  ? "border-gray-600/50"
                  : isStudy
                    ? "border-study-accent/60"
                    : "border-dev-accent/60"
            }`}
          >
            <View
              className={`w-8 h-8 rounded-md border-2 mx-5 flex-row items-center justify-center ${item.completed ? "bg-green-700 border-green-700" : isDarkMode ? (isStudy ? "border-study-dark-interactive/60" : "border-dev-dark-interactive/60") : isStudy ? "border-study-header/30" : "border-dev-header/30"}`}
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
            onPress={() => {
              setPendingDelete({ id: item.id, type: "task" });
              setDeleteModalVisible(true);
            }}
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

    const getRepeatText = () => {
      const daysMap: Record<string, string> =
        language === "ar"
          ? {
              sun: "الأحد",
              mon: "الإثنين",
              tue: "الثلاثاء",
              wed: "الأربعاء",
              thu: "الخميس",
              fri: "الجمعة",
              sat: "السبت",
            }
          : {
              sun: "Sunday",
              mon: "Monday",
              tue: "Tuesday",
              wed: "Wednesday",
              thu: "Thursday",
              fri: "Friday",
              sat: "Saturday",
            };

      if (!item.repeatType) return "";

      if (item.repeatType === "daily") {
        return language === "ar" ? "يومياً" : "Daily";
      }

      if (item.repeatType === "weekly" && item.repeatDays?.length) {
        return item.repeatDays.map((day) => daysMap[day] || day).join(", ");
      }

      if (item.repeatType === "custom") {
        return language === "ar" ? "مخصص" : "Custom";
      }

      return "";
    };

    const formatReminderTime = () => {
      if (!item.reminderTime) return null;
      try {
        const d = new Date(item.reminderTime);
        if (isNaN(d.getTime())) return null;
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const h12 = hours % 12 || 12;
        const mm = String(minutes).padStart(2, "0");
        if (language === "ar") {
          return `${h12}:${mm} ${hours >= 12 ? "م" : "ص"}`;
        }
        return `${h12}:${mm} ${hours >= 12 ? "PM" : "AM"}`;
      } catch {
        return null;
      }
    };

    const repeatText = getRepeatText();
    const reminderTimeText = formatReminderTime();

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
                ? "bg-study-dark-card border-gray-600/50"
                : "bg-dev-dark-card border-gray-600/50"
              : isStudy
                ? "bg-white border-study-accent/60"
                : "bg-white border-dev-accent/60"
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
                ? isStudy
                  ? "bg-study-dark-accentSoft"
                  : "bg-dev-dark-accentSoft"
                : isStudy
                  ? "bg-study-accent/40"
                  : "bg-dev-accent/40"
          }`}
        >
          <Flame
            size={20}
            color={
              item.priority === "high"
                ? "#EF4444"
                : item.priority === "medium"
                  ? "#F97316"
                  : item.priority === "low"
                    ? "#10B981"
                    : isDarkMode
                      ? "#FFFFFF"
                      : "#000000"
            }
          />
        </View>

        {/* 2. النصوص (العنوان - التكرار - الوقت) */}
        <View className="mx-3 ml-3 flex-1">
          <Text
            className={`${isDarkMode ? "font-semibold text-gray-100" : "font-bold text-gray-800"} text-base ${completed ? "line-through text-gray-400" : ""}`}
          >
            {item.title}
          </Text>
          {repeatText ? (
            <View
              className={`flex-row items-center flex-wrap gap-x-1 ${language === "ar" ? "flex-row" : ""}`}
            >
              <Text
                className={`text-[8px] font-black uppercase ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                {repeatText}
              </Text>
              {reminderTimeText && (
                <>
                  <Text
                    className={`text-[8px] font-black ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {" | "}
                  </Text>
                  <Text
                    className={`text-[8px] font-black uppercase ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {reminderTimeText}
                  </Text>
                </>
              )}
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => completeHabit(item.id)}
          className={`flex-row items-center ${
            completed
              ? isDarkMode
                ? "border-gray-600"
                : "border-gray-200"
              : isDarkMode
                ? "border-gray-600/50"
                : isStudy
                  ? "border-study-accent/60"
                  : "border-dev-accent/60"
          }`}
        >
<View
            className={`w-8 h-8 rounded-md border-2 mx-2 flex-row items-center justify-center ${completed ? "bg-green-700 border-green-700" : isDarkMode ? (isStudy ? "border-study-dark-interactive/60" : "border-dev-dark-interactive/60") : isStudy ? "border-study-header/30" : "border-dev-header/30"}`}
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
          onPress={() => {
            setPendingDelete({ id: item.id, type: "habit" });
            setDeleteModalVisible(true);
          }}
          className="w-10 h-10 rounded-full bg-red-500 items-center justify-center ml-2"
        >
          <Trash2 color="white" size={20} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View
      className={`flex-1 px-4 py-6 ${isDarkMode ? "bg-screen-dark" : "bg-screen-light"}`}
    >
      <View className="flex-row items-center justify-center mb-6">
        <Text
          className={`text-xl font-bold my-6 mlr-3 text-center 
          ${
            isDarkMode
              ? isStudy
                ? "text-study-dark-interactive"
                : "text-dev-dark-interactive"
              : isStudy
                ? "text-study-header"
                : "text-dev-header"
          }`}
        >
          {type === "task" ? t("ViewAll.Tasks") : t("ViewAll.Habits")}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className={
            "absolute right-4 top-6 p-2 rounded-full " +
            (isDarkMode
              ? isStudy
                ? "bg-study-dark-interactive"
                : "bg-dev-dark-interactive"
              : isStudy
                ? "bg-study-header"
                : "bg-dev-header")
          }
        >
          <ChevronLeft
            color={isDarkMode ? palette.onInteractive : "#FFFFFF"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* 2. السويتش (مبدل مهمة/عادة) */}
      <View
        className={
          "flex-row p-1.5 rounded-2xl mb-4 " +
          (isDarkMode
            ? isStudy
              ? "bg-study-dark-accentSoft"
              : "bg-dev-dark-accentSoft"
            : "bg-gray-200")
        }
      >
        <TouchableOpacity
          onPress={() => setType("task")}
          className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center ${language === "ar" ? "flex-row" : "flex-row-reverse"} space-x-2 ${type === "task" ? (isDarkMode ? (isStudy ? "bg-study-dark-interactive" : "bg-dev-dark-interactive") : isStudy ? "bg-study-header" : "bg-dev-header") : ""}`}
        >
          <Text
            className={`font-bold ${type === "task" ? (isDarkMode ? (isStudy ? "text-study-header" : "text-dev-header") : "text-white") : "text-gray-400"}`}
          >
            {t("ViewAll.inProgress")}
          </Text>
          <CheckCircle2
            size={20}
            color={type === "task" ? (isDarkMode ? palette.onInteractive : "#FFFFFF") : "#9CA3AF"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setType("habit")}
          className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center ${language === "ar" ? "flex-row" : "flex-row-reverse"} ${type === "habit" ? (isDarkMode ? (isStudy ? "bg-study-dark-interactive" : "bg-dev-dark-interactive") : isStudy ? "bg-study-header" : "bg-dev-header") : ""}`}
        >
          <Text
            className={`font-bold ${type === "habit" ? (isDarkMode ? (isStudy ? "text-study-header" : "text-dev-header") : "text-white") : "text-gray-400"}`}
          >
            {t("ViewAll.daily routine")}
          </Text>
          <RefreshCw size={20} color={type === "habit" ? (isDarkMode ? palette.onInteractive : "#FFFFFF") : "#9CA3AF"} />
        </TouchableOpacity>
      </View>
      {/* 1. الفلاتر (الكل / مكتملة / غير مكتملة) */}
      <View
        className={
          "flex-row p-1.5 rounded-2xl mb-4 " +
          (isDarkMode
            ? isStudy
              ? "bg-study-dark-accentSoft"
              : "bg-dev-dark-accentSoft"
            : "bg-gray-200")
        }
      >
        {["all", "completed", "incompleted"].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${category === cat ? (isDarkMode ? (isStudy ? "bg-study-dark-interactive/60" : "bg-dev-dark-interactive/60") : isStudy ? "bg-study-header" : "bg-dev-header") : ""}`}
          >
            <Text
              className={`font-bold text-center text-sm ${category === cat ? (isDarkMode ? (isStudy ? "text-study-header" : "text-dev-header") : "text-white") : "text-gray-400"}`}
            >
              {cat === "all"
                ? t("ViewAll.all")
                : cat === "completed"
                  ? t("ViewAll.completed")
                  : t("ViewAll.InCompleted")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === "task"
        ? (() => {
            const priorityRank = (p: string | undefined) => {
              if (p === "high") return 3;
              if (p === "medium") return 2;
              if (p === "low") return 1;
              return 0;
            };
            const baseTasks = tasks.filter((t) =>
              category === "all"
                ? true
                : category === "completed"
                  ? t.completed
                  : !t.completed,
            );
            const filteredTasks = baseTasks.sort(
              (a, b) => priorityRank(b.priority) - priorityRank(a.priority),
            );
            return filteredTasks.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className={`${isDarkMode ? "text-gray-200" : "text-gray-600"}`}>{t("ViewAll.No tasks")}</Text>
                <TouchableOpacity
                  onPress={openAddTaskSheet}
                  className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center ${
                    isDarkMode
                      ? isStudy
                        ? "bg-study-dark-interactive"
                        : "bg-dev-dark-interactive"
                      : isStudy
                        ? "bg-study-header"
                        : "bg-dev-header"
                  }`}
                  style={{ elevation: 5 }}
                >
                  <Text
                    className={`text-3xl font-bold ${
                      isDarkMode
                        ? isStudy
                          ? "text-study-header"
                          : "text-dev-header"
                        : "text-white"
                    }`}
                  >
                    +
                  </Text>
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
            const priorityRank = (p: string | undefined) => {
              if (p === "high") return 3;
              if (p === "medium") return 2;
              if (p === "low") return 1;
              return 0;
            };
            const filteredHabits = habits
              .filter((h) => {
                const isCompletedToday =
                  h.lastCompletedDate &&
                  new Date(h.lastCompletedDate).toDateString() === today;
                return category === "all"
                  ? true
                  : category === "completed"
                    ? isCompletedToday
                    : !isCompletedToday;
              })
              .sort(
                (a, b) => priorityRank(b.priority) - priorityRank(a.priority),
              );
            return filteredHabits.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className={`${isDarkMode ? "text-gray-200" : "text-gray-600"}`}>{t("ViewAll.No habits")}</Text>
                <TouchableOpacity
                  onPress={openAddTaskSheet}
                  className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center ${
                    isDarkMode
                      ? isStudy
                        ? "bg-study-dark-interactive"
                        : "bg-dev-dark-interactive"
                      : isStudy
                        ? "bg-study-header"
                        : "bg-dev-header"
                  }`}
                  style={{ elevation: 5 }}
                >
                  <Text
                    className={`text-3xl font-bold ${
                      isDarkMode
                        ? isStudy
                          ? "text-study-header"
                          : "text-dev-header"
                        : "text-white"
                    }`}
                  >
                    +
                  </Text>
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
      <ConfirmationModal
        isVisible={deleteModalVisible}
        title={t("settings.delete" + (pendingDelete?.type === "task" ? "TaskTitle" : "HabitTitle"))}
        description={t("settings.delete" + (pendingDelete?.type === "task" ? "TaskDesc" : "HabitDesc"))}
        onConfirm={() => {
          if (pendingDelete) {
            deleteSingleItem(pendingDelete.id, pendingDelete.type);
            setPendingDelete(null);
          }
          setDeleteModalVisible(false);
        }}
        onCancel={() => {
          setPendingDelete(null);
          setDeleteModalVisible(false);
        }}
      />
    </View>
  );
};

export default ShowAll;