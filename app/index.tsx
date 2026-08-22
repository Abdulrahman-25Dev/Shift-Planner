import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import Text from "@/src/components/ScaledText";
import { useAppStore, Task, Priority } from "../store/useAppStore";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Trash2,
  Flame,
  CheckCircle2,
  RefreshCw,
} from "@/src/components/icons";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { AddTaskSheet } from "../components/AddTaskSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { DetailsSheet } from "./tasks/taskDetails";
import ConfirmationModal from "../components/ConfirmationModal";
import ModeSwitcherButton from "../components/ModeSwitcherButton";
import { useModeClasses, useModeTheme } from "../src/theme";

export default function Index() {
  const {
    mode,
    tasks,
    habits,
    isDarkMode,
    toggleTaskComplete,
    completeHabit,
    deleteSingleItem,
    language,
  } = useAppStore();

  const mc = useModeClasses();
  const [selectedTab, setSelectedTab] = useState<"tasks" | "habits">("tasks");
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

  const progressLabel =
    mode === "study"
      ? progressPercentage === 100
        ? t("progress.completeStudy")
        : t("progress.daily")
      : mode === "coding"
        ? progressPercentage === 100
          ? t("progress.completeDev")
          : t("progress.devTitle")
        : progressPercentage === 100
          ? t("progress.completeFaith")
          : t("progress.faithTitle");

  const headerShortKey =
    mode === "study"
      ? "header.modeShortStudy"
      : mode === "coding"
        ? "header.modeShortDev"
        : "header.modeShortFaith";

  const headerTitleKey =
    mode === "study"
      ? "header.modeTitleStudy"
      : mode === "coding"
        ? "header.modeTitleDev"
        : "header.modeTitleFaith";

  // ترتيب حسب الاكتمال ثم الأولوية
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

  // يظهر 3 عناصر فقط في الصفحة الرئيسية
  const previewTasks = sortedTasks.slice(0, 3);
  const previewHabits = sortedHabits.slice(0, 3);

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

  React.useEffect(() => {
    if (pendingOpenItem && pendingOpenItem.id) {
      setSelectedId(pendingOpenItem.id);

      setTimeout(() => {
        detailsSheetRef.current?.present();
      }, 200);

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
                ? `${mc.darkCard} border-gray-600/50`
                : `bg-white ${mc.accentBorder}`
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
                      : mode === "coding"
                        ? isDarkMode
                          ? "bg-gray-600/25"
                          : "bg-gray-200"
                        : isDarkMode
                          ? mc.darkAccentSoft
                          : mc.accentBg40
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
                        : mode === "coding"
                          ? "bg-gray-400"
                          : isDarkMode
                            ? mc.darkInteractive
                            : mc.headerBg
              }`}
            />
          </View>

          <View className="flex-1 ml-3">
            <Text
              className={`font-bold text-base ${
                item.completed
                  ? "line-through text-gray-500"
                  : isDarkMode
                    ? "text-gray-100"
                    : "text-gray-800"
              }`}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View className="flex-row justify-between items-center mt-1">
              <Text
                className={`text-xs ${
                  item.completed
                    ? "text-gray-400"
                    : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              >
                {dueDateLabel} |{" "}
                {dueTimeLabel ? (
                  <Text
                    className={`text-xs ${
                      item.completed
                        ? "text-gray-400"
                        : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                    }`}
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
                  : mc.accentBorder
            }`}
          >
            <View
              className={`w-8 h-8 rounded-md border-2 mx-5 flex-row items-center justify-center ${
                item.completed
                  ? "bg-green-700 border-green-700"
                  : isDarkMode
                    ? mc.darkInteractiveBorder
                    : mc.headerBorder
              }`}
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
              ? `${mc.darkCard} border-gray-600/50`
              : `bg-white ${mc.accentBorder}`
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
                ? mc.darkAccentSoft
                : mc.accentBg40
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
            className={`text-base ${
              isDarkMode
                ? "font-semibold text-gray-100"
                : "font-bold text-gray-800"
            } ${item.completed ? "line-through text-gray-400" : ""}`}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {repeatText ? (
            <View
              className={`flex-row items-center flex-wrap gap-x-1 ${
                language === "ar" ? "flex-row" : ""
              }`}
            >
              <Text
                className={`text-[8px] font-black uppercase ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {repeatText}
              </Text>

              {reminderTimeText && (
                <>
                  <Text
                    className={`text-[8px] font-black ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {" | "}
                  </Text>

                  <Text
                    className={`text-[8px] font-black uppercase ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
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
                : mc.accentBorder
          }`}
        >
          <View
            className={`w-8 h-8 rounded-md border-2 mx-2 flex-row items-center justify-center ${
              item.completed
                ? "bg-green-700 border-green-700"
                : isDarkMode
                  ? mc.darkInteractiveBorder
                  : mc.headerBorder
            }`}
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
      className={`my-3 rounded-3xl px-4 py-4 border ${
        isDarkMode
          ? `${mc.darkCard} ${mc.darkAccentBorder}`
          : `${mc.accentSoft} ${mc.accentBorder}`
      }`}
      style={{ minHeight: 128 }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text
            className={`text-sm font-bold uppercase ${
              language === "ar" ? "text-left" : "text-right"
            } ${isDarkMode ? mc.darkInteractiveText : mc.textHeader}`}
          >
            {progressLabel}
          </Text>

          <Text
            className={`mt-2 text-3xl font-black ${
              language === "ar" ? "text-left" : "text-right"
            } ${isDarkMode ? mc.darkInteractiveText : mc.textHeader}`}
          >
            {progressPercentage}%
          </Text>

          <Text
            className={`mt-1 text-sm ${
              language === "ar" ? "text-left" : "text-right"
            } ${isDarkMode ? mc.darkInteractiveText80 : mc.textHeader80}`}
          >
            {completedItems} / {totalItems || 0} {t("progress.completed")}
          </Text>
        </View>
      </View>

      <View className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/20">
        <View
          className={`h-full rounded-full ${
            language === "ar" ? "mr-auto" : "ml-auto"
          } ${isDarkMode ? mc.darkInteractive : mc.headerBg}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );

  const HeaderSection = () => (
    <View className={`pt-12 pb-5 px-6 shadow-2xl ${mc.headerBg}`}>
      <View className="flex-row justify-between items-center">
        <ModeSwitcherButton />

        <View className="flex-1 items-center">
          <Text className="text-white/70 text-xs font-bold mb-1">
            {t(headerShortKey)}
          </Text>

          <Text className="text-white text-2xl font-black">
            {t(headerTitleKey)}
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

  const activeTabItems = selectedTab === "tasks" ? previewTasks : previewHabits;

  const { palette } = useModeTheme();

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-screen-dark" : "bg-screen-light"}`}
    >
      <HeaderSection />

      <View className="flex-1 px-4 mt-2">
        <ProgressDashboard />

        <View
          className={`flex-row p-1.5 rounded-2xl mb-4 ${
            isDarkMode ? mc.darkAccentSoft : "bg-gray-200"
          }`}
        >
          <TouchableOpacity
            onPress={() => setSelectedTab("tasks")}
            className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center ${
              language === "ar" ? "flex-row" : "flex-row-reverse"
            } space-x-2 ${
              selectedTab === "tasks"
                ? isDarkMode
                  ? mc.darkInteractive
                  : mc.headerBg
                : ""
            }`}
          >
            <Text
              className={`font-bold ${
                selectedTab === "tasks"
                  ? isDarkMode
                    ? mc.textHeader
                    : "text-white"
                  : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              {t("common.Tasks")}
            </Text>

            {selectedTab === "tasks" && (
              <CheckCircle2
                size={20}
                color={isDarkMode ? palette.onInteractive : "#FFFFFF"}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab("habits")}
            className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center ${
              language === "ar" ? "flex-row" : "flex-row-reverse"
            } space-x-2 ${
              selectedTab === "habits"
                ? isDarkMode
                  ? mc.darkInteractive
                  : mc.headerBg
                : ""
            }`}
          >
            <Text
              className={`font-bold ${
                selectedTab === "habits"
                  ? isDarkMode
                    ? mc.textHeader
                    : "text-white"
                  : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              {t("common.Habits")}
            </Text>

            {selectedTab === "habits" && (
              <RefreshCw
                size={20}
                color={isDarkMode ? palette.onInteractive : "#FFFFFF"}
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          {/* قائمة العناصر بارتفاع مناسب */}
          <View className="h-[225px]">
            {activeTabItems.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text
                  className={`text-base ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {selectedTab === "tasks"
                    ? t("ViewAll.No tasks")
                    : t("ViewAll.No habits")}
                </Text>
              </View>
            ) : selectedTab === "tasks" ? (
              <FlashList
                data={activeTabItems as Task[]}
                renderItem={renderTasks}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlashList
                data={activeTabItems}
                renderItem={renderHabits as any}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* زر عرض الكل مطابق تماماً لنموذج التصميم */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("./view-all")}
            className={`w-full py-3.5 mt-3 rounded-full items-center justify-center border-2 bg-transparent ${
              isDarkMode ? mc.darkInteractiveBorder : mc.headerBorder
            }`}
          >
            <Text
              className={`font-bold text-base ${
                isDarkMode ? mc.darkInteractiveText : mc.textHeader
              }`}
            >
              {t("common.viewAll")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={openAddTaskSheet}
        className={`absolute bottom-6 right-6 min-w-16 min-h-16 px-4 py-3 rounded-full items-center justify-center ${
          isDarkMode ? mc.darkInteractive : mc.headerBg
        }`}
        style={{ elevation: 5 }}
      >
        <Text
          className={`text-3xl font-bold ${
            isDarkMode ? mc.textHeader : "text-white"
          }`}
        >
          +
        </Text>
      </TouchableOpacity>

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
