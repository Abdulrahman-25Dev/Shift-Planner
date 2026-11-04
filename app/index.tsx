import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/src/components/ScaledText";
import {
  Check,
  CheckCircle2,
  Flame,
  Settings,
  Trash2,
} from "@/src/components/icons";
import { AddTaskSheet } from "../components/AddTaskSheet";
import ConfirmationModal from "../components/ConfirmationModal";
import { DetailsSheet } from "./tasks/taskDetails";
import { useAppStore, type Habit, type Mode, type Priority, type Task } from "../store/useAppStore";
import { useModeTheme } from "../src/theme";

type HabitWithCompletion = Habit & { completed: boolean };
type ItemTab = "tasks" | "habits";
type DeleteTarget = { id: string; type: "task" | "habit" };

const MODES: Mode[] = ["coding", "study", "faith"];
const SCREEN = "#080B12";
const MUTED = "#98A2B3";

export default function Index() {
  const {
    mode,
    setMode,
    tasks,
    habits,
    user,
    toggleTaskComplete,
    completeHabit,
    deleteSingleItem,
    language,
  } = useAppStore();
  const { palette } = useModeTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [selectedTab, setSelectedTab] = useState<ItemTab>("tasks");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<BottomSheetModal>(null);

  const modeOrder = MODES;
  const rowDirection = language === "ar" ? "row-reverse" : "row";
  const headerDirection = language === "ar" ? "row" : "row-reverse";

  const pendingOpenItem = useAppStore((state) => state.pendingOpenItem);
  const setPendingOpenItem = useAppStore((state) => state.setPendingOpenItem);

  useEffect(() => {
    if (!pendingOpenItem?.id) return;

    setSelectedId(pendingOpenItem.id);
    const timeout = setTimeout(() => detailsSheetRef.current?.present(), 200);
    setPendingOpenItem(null);

    return () => clearTimeout(timeout);
  }, [pendingOpenItem, setPendingOpenItem]);

  const priorityRank = (priority: Priority | undefined) => {
    if (priority === "high") return 3;
    if (priority === "medium") return 2;
    if (priority === "low") return 1;
    return 0;
  };

  const sortByCompletionAndPriority = <
    T extends { completed: boolean; priority?: Priority },
  >(
    a: T,
    b: T,
  ) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    return priorityRank(b.priority) - priorityRank(a.priority);
  };

  const today = new Date().toDateString();
  const habitsWithCompleted: HabitWithCompletion[] = habits.map((habit) => ({
    ...habit,
    completed: habit.lastCompletedDate
      ? new Date(habit.lastCompletedDate).toDateString() === today
      : false,
  }));
  const sortedTasks = [...tasks].sort(sortByCompletionAndPriority);
  const sortedHabits = [...habitsWithCompleted].sort(
    sortByCompletionAndPriority,
  );
  const previewTasks = sortedTasks.slice(0, 3);
  const previewHabits = sortedHabits.slice(0, 3);

  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const progressPercentage =
    tasks.length === 0
      ? 0
      : Math.round((completedTasksCount / tasks.length) * 100);

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "home.greetingMorning"
      : hour < 18
        ? "home.greetingAfternoon"
        : "home.greetingEvening";
  const firstName =
    user?.fullName?.trim().split(/\s+/)[0] ||
    user?.username ||
    t("home.guestName");

  const openAddTaskSheet = () => bottomSheetRef.current?.snapToIndex(0);
  const handleOpenDetails = (id: string) => {
    setSelectedId(id);
    detailsSheetRef.current?.present();
  };
  const openDeleteConfirmation = (id: string, type: "task" | "habit") => {
    setPendingDelete({ id, type });
    setDeleteModalVisible(true);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const dateSource = item.dueDate
      ? new Date(item.dueDate)
      : item.reminderTime
        ? new Date(item.reminderTime)
        : null;
    const validDate =
      dateSource && !Number.isNaN(dateSource.getTime()) ? dateSource : null;
    const locale = language === "ar" ? "ar-SA" : "en-US";
    const dueDateLabel = validDate
      ? validDate.toLocaleDateString(locale, { day: "numeric", month: "short" })
      : t("task.noDate");
    const dueTimeLabel = validDate
      ? validDate.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";
    const completionButton = (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
        accessibilityLabel={item.title}
        onPress={() => toggleTaskComplete(item.id)}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full border-2"
        style={{
          borderColor: item.completed
            ? palette.accent
            : "rgba(255,255,255,0.3)",
          backgroundColor: item.completed ? palette.accent : "transparent",
        }}
      >
        {item.completed && <Check size={18} color={palette.header} />}
      </Pressable>
    );
    const taskDetails = (
      <Pressable
        onPress={() => handleOpenDetails(item.id)}
        className="min-h-12 flex-1 justify-center"
      >
        <Text
          numberOfLines={1}
          className={`w-full text-[15px] font-bold ${
            item.completed ? "text-white/40 line-through" : "text-white"
          }`}
          style={{
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {item.title}
        </Text>
        <Text
          className="mt-1 w-full text-xs text-white/40"
          style={{
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {dueDateLabel}
          {dueTimeLabel ? ` · ${dueTimeLabel}` : ""}
        </Text>
      </Pressable>
    );
    const deleteButton = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("settings.delete")} ${item.title}`}
        onPress={() => openDeleteConfirmation(item.id, "task")}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center"
      >
        <Trash2 size={20} color="rgba(248,113,113,0.82)" />
      </Pressable>
    );

    return (
      <View
        className="items-center gap-4 border-b border-white/[0.08] py-4"
        style={{
          flexDirection: "row",
          direction: language === "ar" ? "ltr" : undefined,
        }}
      >
        {language === "ar" ? (
          <>
            <View className="flex-row items-center gap-3">
              {deleteButton}
              {completionButton}
            </View>
            {taskDetails}
          </>
        ) : (
          <>
            {completionButton}
            {taskDetails}
            {deleteButton}
          </>
        )}
      </View>
    );
  };

  const renderHabit = ({ item }: { item: HabitWithCompletion }) => {
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

    let repeatText = "";
    if (item.repeatType === "daily") {
      repeatText = language === "ar" ? "يومياً" : "Daily";
    } else if (item.repeatType === "weekly" && item.repeatDays?.length) {
      repeatText = item.repeatDays.map((day) => daysMap[day] || day).join(", ");
    } else if (item.repeatType === "custom") {
      repeatText = language === "ar" ? "مخصص" : "Custom";
    }

    let reminderTimeText: string | null = null;
    if (item.reminderTime) {
      const date = new Date(item.reminderTime);
      if (!Number.isNaN(date.getTime())) {
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const hour12 = hours % 12 || 12;
        reminderTimeText =
          language === "ar"
            ? `${hour12}:${minutes} ${hours >= 12 ? "م" : "ص"}`
            : `${hour12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
      }
    }

    return (
      <View
        className="items-center gap-4 border-b border-white/[0.08] py-4"
        style={{ flexDirection: rowDirection }}
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
          <Flame
            size={18}
            color={
              item.priority === "high"
                ? "#EF4444"
                : item.priority === "medium"
                  ? "#F97316"
                  : item.priority === "low"
                    ? "#10B981"
                    : palette.accent
            }
          />
        </View>

        <Pressable
          onPress={() => handleOpenDetails(item.id)}
          className="min-h-12 flex-1 justify-center"
          style={{ alignItems: language === "ar" ? "flex-end" : "flex-start" }}
        >
          <Text
            numberOfLines={1}
            className={`text-[15px] font-bold ${
              item.completed ? "text-white/40 line-through" : "text-white"
            }`}
            style={{ textAlign: language === "ar" ? "right" : "left" }}
          >
            {item.title}
          </Text>
          {(repeatText || reminderTimeText) && (
            <Text
              className="mt-1 text-xs text-white/40"
              style={{ textAlign: language === "ar" ? "right" : "left" }}
            >
              {repeatText}
              {repeatText && reminderTimeText ? " · " : ""}
              {reminderTimeText}
            </Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}
          accessibilityLabel={item.title}
          onPress={() => completeHabit(item.id)}
          hitSlop={8}
          className="h-6 w-6 items-center justify-center rounded-full border-2"
          style={{
            borderColor: item.completed ? palette.accent : "rgba(255,255,255,0.3)",
            backgroundColor: item.completed ? palette.accent : "transparent",
          }}
        >
          {item.completed && <Check size={14} color={palette.header} />}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t("settings.delete")} ${item.title}`}
          onPress={() => openDeleteConfirmation(item.id, "habit")}
          hitSlop={10}
          className="h-8 w-8 items-center justify-center"
        >
          <Trash2 size={15} color="rgba(248,113,113,0.72)" />
        </Pressable>
      </View>
    );
  };

  const activeItemsCount =
    selectedTab === "tasks" ? previewTasks.length : previewHabits.length;

  return (
    <View className="flex-1" style={{ backgroundColor: SCREEN }}>
      <Svg
        pointerEvents="none"
        width="100%"
        height={320}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Defs>
          <RadialGradient id="modeGlow" cx="50%" cy="0%" rx="80%" ry="100%">
            <Stop offset="0%" stopColor={palette.accent} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height={320} fill="url(#modeGlow)" />
      </Svg>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
      <View
        className="items-center justify-between pt-14"
        style={{ flexDirection: headerDirection }}
      >
        <View
          style={{
            alignItems: language === "ar" ? "flex-start" : "flex-end",
          }}
        >
          <Text
            className="text-sm"
            style={{
              color: MUTED,
              textAlign: language === "ar" ? "left" : "right",
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {t(greetingKey)}
          </Text>
          <Text
            className="mt-1 text-2xl font-black text-white"
            style={{
              textAlign: language === "ar" ? "left" : "right",
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {firstName}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("settings.title")}
          onPress={() => router.push("./settings")}
          hitSlop={12}
          className="h-11 w-11 items-center justify-center"
        >
          <Settings size={22} color={MUTED} />
        </Pressable>
      </View>

      <View className="mt-6 rounded-full border border-white/10 bg-white/[0.045] p-1">
        <View style={{ flexDirection: rowDirection }}>
          {modeOrder.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === option }}
              onPress={() => setMode(option)}
              className="flex-1 items-center justify-center py-3"
            >
              <Text
                className="text-sm font-bold"
                style={{
                  color: mode === option ? palette.accent : MUTED,
                  writingDirection: language === "ar" ? "rtl" : "ltr",
                }}
              >
                {t(
                  option === "coding"
                    ? "home.modeCoding"
                    : option === "study"
                      ? "home.modeStudy"
                      : "home.modeFaith",
                )}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-7">
        <View
          className="mb-3 items-center justify-between"
          style={{ flexDirection: rowDirection }}
        >
          <Text
            className="text-sm font-semibold text-white/70"
            style={{ writingDirection: language === "ar" ? "rtl" : "ltr" }}
          >
            {completedTasksCount} / {tasks.length} {t("progress.completed")}
          </Text>
          <Text className="text-lg font-black" style={{ color: palette.accent }}>
            {progressPercentage}%
          </Text>
        </View>
        <View className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <View
            className="h-full rounded-full"
            style={{
              width: `${progressPercentage}%`,
              alignSelf: language === "ar" ? "flex-end" : "flex-start",
              backgroundColor: palette.accent,
            }}
          />
        </View>
        <Text
          className="mt-3 text-center text-sm text-white/60"
          style={{ writingDirection: language === "ar" ? "rtl" : "ltr" }}
        >
          {progressPercentage === 100
            ? t(
                mode === "coding"
                  ? "progress.completeDev"
                  : mode === "study"
                    ? "progress.completeStudy"
                    : "progress.completeFaith",
              )
            : t("home.motivation")}
        </Text>
      </View>

      <View
        className="mt-7 rounded-full bg-white/[0.06] p-1"
        style={{ flexDirection: rowDirection, minHeight: 52 }}
      >
        {(["tasks", "habits"] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedTab === tab }}
            onPress={() => setSelectedTab(tab)}
            className="flex-1 items-center justify-center rounded-full py-3"
            style={{
              flexDirection: rowDirection,
              minWidth: 0,
              gap: 8,
              backgroundColor:
                selectedTab === tab ? palette.accent : "transparent",
            }}
          >
            <Text
              className="font-bold"
              style={{
                color: selectedTab === tab ? palette.header : MUTED,
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {t(tab === "tasks" ? "common.Tasks" : "common.Habits")}
            </Text>
            {tab === "tasks" ? (
              <CheckCircle2
                size={16}
                color={selectedTab === tab ? palette.header : MUTED}
              />
            ) : (
              <Flame
                size={16}
                color={selectedTab === tab ? palette.header : MUTED}
              />
            )}
          </Pressable>
        ))}
      </View>

      <View className="mt-3">
        <View className="h-[225px]">
          {activeItemsCount === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-center text-sm text-white/45">
                {t(selectedTab === "tasks" ? "ViewAll.No tasks" : "ViewAll.No habits")}
              </Text>
            </View>
          ) : selectedTab === "tasks" ? (
            <FlashList
              data={previewTasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlashList
              data={previewHabits}
              renderItem={renderHabit}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("./view-all")}
          className="mt-2 items-center justify-center rounded-full border border-white/15 py-3"
        >
          <Text className="text-sm font-bold text-white/70">
            {t("common.viewAll")}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      <View
        className="px-5 pt-3"
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
          alignItems: language === "ar" ? "flex-start" : "flex-end",
          backgroundColor: SCREEN,
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          onPress={openAddTaskSheet}
          className="min-h-[52px] items-center justify-center rounded-full px-6"
          style={{
            backgroundColor: palette.accent,
            elevation: 8,
            flexDirection: rowDirection,
          }}
          activeOpacity={0.85}
        >
          <Text
            className="text-base font-black"
            style={{
              color: palette.header,
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            + {t("home.addTask")}
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
