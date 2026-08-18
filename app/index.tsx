import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { useAppStore, Task, Priority } from "../store/useAppStore";
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
import ConfirmationModal from "../components/ConfirmationModal";
import { useModeTheme } from "@/src/theme";

export default function Index() {
  const {
    mode,
    toggleMode,
    tasks,
    habits,
    isDarkMode,
    toggleTaskComplete,
    completeHabit,
    deleteSingleItem,
    language,
  } = useAppStore();
  const isStudy = mode === "study";
  const { palette } = useModeTheme();
  const { t } = useTranslation();

  const priorityRank = (priority: string | undefined) => {
    if (priority === "high") return 3;
    if (priority === "medium") return 2;
    if (priority === "low") return 1;
    return 0;
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

  // ترتيب حسب الاكتمال ثم الأولوية (Sort by completion then priority)
  const sortByCompletionAndPriority = <
    T extends { completed: boolean; priority?: string },
  >(
    a: T,
    b: T,
  ) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }
    return priorityRank(b.priority) - priorityRank(a.priority);
  };

  const sortedHabits = [...habitsWithCompleted].sort(
    sortByCompletionAndPriority,
  );
  const sortedTasks = [...tasks].sort(sortByCompletionAndPriority);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "task" | "habit";
  } | null>(null);

  const pendingOpenItem = useAppStore((s) => s.pendingOpenItem);
  const setPendingOpenItem = useAppStore((s) => s.setPendingOpenItem);

  // Open details when a notification indicates a pending item
  React.useEffect(() => {
    if (pendingOpenItem && pendingOpenItem.id) {
      setSelectedId(pendingOpenItem.id);
      // present details sheet
      setTimeout(() => detailsSheetRef.current?.present(), 200);
      // clear pending
      setPendingOpenItem(null);
    }
  }, [pendingOpenItem, setPendingOpenItem]);

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
              className={`font-bold text-base ${item.completed ? "line-through text-gray-500" : isDarkMode ? "text-gray-100" : "text-gray-800"}`}
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
                      : " text-gray-500")
                }
              >
                {dueDateLabel} |{" "}
                {dueTimeLabel ? (
                  <Text
                    className={
                      " text-xs" +
                      (item.completed
                        ? " text-gray-400"
                        : isDarkMode
                          ? " text-gray-400"
                          : " text-gray-500")
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

  const renderHabits = ({
    item,
  }: {
    item: {
      completed: boolean;
      id: string;
      title: string;
      streak: number;
      priority?: Priority;
      repeatType?: "daily" | "weekly" | "custom";
      repeatDays?: string[];
      reminderTime?: string;
    };
  }) => {
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
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            item.completed
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

        <View className="mx-3 ml-3 flex-1">
          <Text
            className={`${isDarkMode ? "font-semibold text-gray-100" : "font-bold text-gray-800"} text-base ${item.completed ? "line-through text-gray-400" : ""}`}
          >
            {item.title}
          </Text>
          {repeatText ? (
            <View
              className={`flex-row items-center flex-wrap gap-x-1 ${language === "ar" ? "flex-row" : ""}`}
            >
              <Text
                className={`text-[8px] font-black uppercase ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
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
                    className={`text-[8px] font-black uppercase ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
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
            className={`w-8 h-8 rounded-md border-2 mx-2 flex-row items-center justify-center ${item.completed ? "bg-green-700 border-green-700" : isDarkMode ? (isStudy ? "border-study-dark-interactive/60" : "border-dev-dark-interactive/60") : isStudy ? "border-study-header/30" : "border-dev-header/30"}`}
          >
            {item.completed && (
              <Text className="text-white text-xs font-bold text-center">
                ✓
              </Text>
            )}
          </View>
        </Pressable>

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

  // داشبورد التقدم بدلاً من شريط الأيام (Progress Dashboard replacing Days Row)
  const ProgressDashboard = () => (
    <View
      className={`my-4 rounded-3xl px-4 py-4 border ${
        isDarkMode
          ? isStudy
            ? "bg-study-dark-card border-study-dark-accentSoft"
            : "bg-dev-dark-card border-dev-dark-accentSoft"
          : isStudy
            ? "bg-study-accentSoft border-study-accent/60"
            : "bg-dev-accentSoft border-dev-accent/60"
      }`}
      style={{ minHeight: 128 }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text
            className={`text-sm font-bold uppercase ${language === "ar" ? "text-left" : "text-right"} ${
              isDarkMode
                ? isStudy
                  ? "text-study-dark-interactive"
                  : "text-dev-dark-interactive"
                : isStudy
                  ? "text-study-header"
                  : "text-dev-header"
            }`}
          >
            {progressLabel}
          </Text>
          <Text
            className={`mt-2 text-3xl font-black ${language === "ar" ? "text-left" : "text-right"} ${
              isDarkMode
                ? isStudy
                  ? "text-study-dark-interactive"
                  : "text-dev-dark-interactive"
                : isStudy
                  ? "text-study-header"
                  : "text-dev-header"
            }`}
          >
            {progressPercentage}%
          </Text>
          <Text
            className={`mt-1 text-sm ${language === "ar" ? "text-left" : "text-right"} ${
              isDarkMode
                ? isStudy
                  ? "text-study-dark-interactive/80"
                  : "text-dev-dark-interactive/80"
                : isStudy
                  ? "text-study-header/80"
                  : "text-dev-header/80"
            }`}
          >
            {completedItems} / {totalItems || 0} {t("progress.completed")}
          </Text>
        </View>
      </View>

      <View className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/20">
        <View
          className={`h-full rounded-full ${language === "ar" ? "mr-auto" : "ml-auto"} ${
            isDarkMode
              ? isStudy
                ? "bg-study-dark-interactive"
                : "bg-dev-dark-interactive"
              : isStudy
                ? "bg-study-header"
                : "bg-dev-header"
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );

  const HeaderSection = () => (
    <View
      className={`pt-12 pb-5 px-6 shadow-2xl ${
        isStudy ? "bg-study-header" : "bg-dev-header"
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
            {isStudy ? t("header.modeShortStudy") : t("header.modeShortDev")}
          </Text>
          <Text className="text-white text-2xl font-black">
            {isStudy ? t("header.modeTitleStudy") : t("header.modeTitleDev")}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
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
      className={`flex-1 ${isDarkMode ? "bg-screen-dark" : "bg-screen-light"}`}
    >
      <HeaderSection />

      <View className="flex-1 px-4 mt-2">
        <ProgressDashboard />

        <View
          className={
            " justify-between items-center mt-6 mb-3 px-1" +
            (language === "ar" ? " flex-row" : " flex-row-reverse")
          }
        >
          <Text
            className={`text-lg font-bold ${
              isDarkMode
                ? isStudy
                  ? "text-study-dark-interactive"
                  : "text-dev-dark-interactive"
                : isStudy
                  ? "text-study-header"
                  : "text-dev-header"
            }`}
          >
            {t("common.Tasks")}
          </Text>
          <Pressable
            onPress={() => router.push("./view-all")}
            className="px-3 py-1 rounded-lg"
          >
            <Text
              className={`text-sm font-bold ${
                isDarkMode
                  ? isStudy
                    ? "text-study-dark-interactive"
                    : "text-dev-dark-interactive"
                  : isStudy
                    ? "text-study-header"
                    : "text-dev-header"
              }`}
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

        <View
          className={
            "justify-between items-center px-1 mb-3" +
            (language === "ar" ? " flex-row" : " flex-row-reverse")
          }
        >
          <Text
            className={`text-lg font-bold ${
              isDarkMode
                ? isStudy
                  ? "text-study-dark-interactive"
                  : "text-dev-dark-interactive"
                : isStudy
                  ? "text-study-header"
                  : "text-dev-header"
            }`}
          >
            {t("common.Habits")}
          </Text>
          {/* My Habits */}
          <Pressable
            onPress={() => router.push("./view-all")}
            className="px-3 py-1 rounded-lg"
          >
            <Text
              className={`text-sm font-bold ${
                isDarkMode
                  ? isStudy
                    ? "text-study-dark-interactive"
                    : "text-dev-dark-interactive"
                  : isStudy
                    ? "text-study-header"
                    : "text-dev-header"
              }`}
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

      <AddTaskSheet ref={bottomSheetRef} mode={mode} />
      <DetailsSheet ref={detailsSheetRef} itemId={selectedId} />
      <ConfirmationModal
        isVisible={deleteModalVisible}
        title={t(
          "settings.delete" +
            (pendingDelete?.type === "task" ? "Task" : "Habit") +
            "Title",
        )}
        description={t(
          "settings.delete" +
            (pendingDelete?.type === "task" ? "Task" : "Habit") +
            "Desc",
        )}
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
}
