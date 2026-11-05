import {
  View,
  Pressable,
  TouchableOpacity,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import Text from "@/src/components/ScaledText";
import React, { useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { Task, Habit, useAppStore } from "../store/useAppStore";
import {
  CheckCircle2,
  Check,
  Plus,
  RefreshCw,
  Trash2,
  ChevronRight,
  Flame,
} from "@/src/components/icons";
import { AddTaskSheet } from "../components/AddTaskSheet";
import ConfirmationModal from "../components/ConfirmationModal";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DetailsSheet } from "./tasks/taskDetails";
import BottomSheetModal from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetModal/BottomSheetModal";
import { useModeTheme, useModeClasses } from "@/src/theme";
const ShowAll = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    deleteSingleItem,
    habits,
    toggleTaskComplete,
    completeHabit,
    isDarkMode,
    language,
  } = useAppStore();
  const { palette } = useModeTheme();
  const mc = useModeClasses();
  const screenColor = isDarkMode ? "#0F172A" : "#F7F8FC";
  const textColor = isDarkMode ? "#FFFFFF" : "#1A1A1A";
  const mutedTextColor = isDarkMode ? "#98A2B3" : "#64748B";
  const secondaryTextColor = isDarkMode
    ? "rgba(255,255,255,0.4)"
    : "rgba(0,0,0,0.55)";
  const completedTextColor = isDarkMode
    ? "rgba(255,255,255,0.5)"
    : "rgba(0,0,0,0.4)";
  const surfaceColor = isDarkMode
    ? "rgba(255,255,255,0.03)"
    : "rgba(0,0,0,0.03)";
  const surfaceBorderColor = isDarkMode
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.07)";
  const subtleSurfaceColor = isDarkMode
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.04)";
  const segmentedBackground = isDarkMode ? "bg-white/5" : "bg-slate-100";
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
    const priorityColor =
      item.priority === "high"
        ? "#EF4444"
        : item.priority === "medium"
          ? "#F97316"
          : item.priority === "low"
            ? "#10B981"
            : palette.accent;

    const priorityIndicator = (
      <View
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: priorityColor }}
      />
    );
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
            : isDarkMode
              ? "rgba(255,255,255,0.3)"
              : "rgba(0,0,0,0.25)",
          backgroundColor: item.completed ? palette.accent : "transparent",
        }}
      >
        {item.completed && (
          <Check
            size={18}
            color={isDarkMode ? palette.header : palette.accentText}
          />
        )}
      </Pressable>
    );
    const deleteButton = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("settings.delete")} ${item.title}`}
        onPress={() => {
          setPendingDelete({ id: item.id, type: "task" });
          setDeleteModalVisible(true);
        }}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center"
      >
        <Trash2 size={20} color="rgba(248,113,113,0.82)" />
      </Pressable>
    );
    const taskDetails = (
      <Pressable
        onPress={() => handleOpenDetails(item.id)}
        className="min-h-12 flex-1 justify-center"
        style={{ alignItems: language === "ar" ? "flex-end" : "flex-start" }}
      >
        <Text
          numberOfLines={1}
          className={`text-[15px] font-bold ${item.completed ? "line-through" : ""}`}
          style={{
            color: item.completed ? completedTextColor : textColor,
            textAlign: language === "ar" ? "right" : "left",
          }}
        >
          {item.title}
        </Text>
        <Text
          className="mt-1 text-xs"
          style={{
            color: secondaryTextColor,
            textAlign: language === "ar" ? "right" : "left",
          }}
        >
          {dueDateLabel}
          {dueTimeLabel ? ` · ${dueTimeLabel}` : ""}
        </Text>
      </Pressable>
    );

    return (
      <View
        className="mb-2 items-center gap-4 rounded-2xl border px-3 py-3"
        style={{
          flexDirection: "row",
          direction: "ltr",
          backgroundColor: surfaceColor,
          borderColor: surfaceBorderColor,
        }}
      >
        {language === "ar" ? (
          <>
            <View className="flex-row items-center gap-3">
              {deleteButton}
              {completionButton}
            </View>
            {taskDetails}
            {priorityIndicator}
          </>
        ) : (
          <>
            {completionButton}
            {priorityIndicator}
            {taskDetails}
            {deleteButton}
          </>
        )}
      </View>
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

    const flameIcon = (
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: subtleSurfaceColor }}
      >
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
    );
    const completionButton = (
      <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed }}
          accessibilityLabel={item.title}
          onPress={() => completeHabit(item.id)}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full border-2"
          style={{
            borderColor: completed
              ? palette.accent
              : isDarkMode
                ? "rgba(255,255,255,0.3)"
                : "rgba(0,0,0,0.25)",
            backgroundColor: completed ? palette.accent : "transparent",
          }}
        >
          {completed && (
            <Check
              size={18}
              color={isDarkMode ? palette.header : palette.accentText}
            />
          )}
      </Pressable>
    );
    const deleteButton = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("settings.delete")} ${item.title}`}
        onPress={() => {
          setPendingDelete({ id: item.id, type: "habit" });
          setDeleteModalVisible(true);
        }}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center"
      >
        <Trash2 size={20} color="rgba(248,113,113,0.82)" />
      </Pressable>
    );
    const habitDetails = (
      <Pressable
        onPress={() => handleOpenDetails(item.id)}
        className="min-h-12 flex-1 justify-center"
        style={{ alignItems: language === "ar" ? "flex-end" : "flex-start" }}
      >
          <Text
            numberOfLines={1}
            className={`text-[15px] font-bold ${completed ? "line-through" : ""}`}
            style={{
              color: completed ? completedTextColor : textColor,
              textAlign: language === "ar" ? "right" : "left",
            }}
          >
            {item.title}
          </Text>
        {(repeatText || reminderTimeText) && (
          <Text
            className="mt-1 text-xs"
            style={{
              color: secondaryTextColor,
              textAlign: language === "ar" ? "right" : "left",
            }}
          >
            {repeatText}
            {repeatText && reminderTimeText ? " · " : ""}
            {reminderTimeText}
          </Text>
        )}
      </Pressable>
    );

    return (
      <View
        className="mb-2 items-center gap-4 rounded-2xl border px-3 py-3"
        style={{
          flexDirection: "row",
          direction: "ltr",
          backgroundColor: surfaceColor,
          borderColor: surfaceBorderColor,
        }}
      >
        {language === "ar" ? (
          <>
            <View className="flex-row items-center gap-3">
              {deleteButton}
              {completionButton}
            </View>
            {habitDetails}
            {flameIcon}
          </>
        ) : (
          <>
            {flameIcon}
            {habitDetails}
            {completionButton}
            {deleteButton}
          </>
        )}
      </View>
    );
  };

  return (
    <View
      className="flex-1 px-4 py-6"
      style={{ backgroundColor: screenColor }}
    >
      <Svg
        pointerEvents="none"
        width="100%"
        height={320}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Defs>
          <RadialGradient id="modeGlow" cx="50%" cy="0%" rx="80%" ry="100%">
            <Stop
              offset="0%"
              stopColor={palette.accent}
              stopOpacity={isDarkMode ? "0.14" : "0.05"}
            />
            <Stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height={320} fill="url(#modeGlow)" />
      </Svg>
      <View className="flex-row items-center justify-center mb-6">
        <Text
          className={`text-xl font-bold my-6 mlr-3 text-center ${isDarkMode ? mc.darkInteractiveText : mc.textHeader}`}
        >
          {type === "task" ? t("ViewAll.Tasks") : t("ViewAll.Habits")}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          className={`absolute ${language === "ar" ? "left-2" : "right-2"} top-6 p-2`}
        >
          <ChevronRight color={mutedTextColor} size={20} />
        </TouchableOpacity>
      </View>

      {/* 2. السويتش (مبدل مهمة/عادة) */}
      <View
        className={`flex-row p-1 rounded-full mb-3 ${segmentedBackground}`}
      >
        <TouchableOpacity
          onPress={() => setType("task")}
          accessibilityRole="button"
          accessibilityState={{ selected: type === "task" }}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3 ${language === "ar" ? "" : "flex-row-reverse"}`}
          style={{
            backgroundColor: type === "task" ? palette.accent : "transparent",
          }}
        >
          <Text
            className="font-bold"
            style={{ color: type === "task" ? palette.header : mutedTextColor }}
          >
            {t("ViewAll.inProgress")}
          </Text>
          <CheckCircle2
            size={20}
            color={type === "task" ? palette.header : mutedTextColor}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setType("habit")}
          accessibilityRole="button"
          accessibilityState={{ selected: type === "habit" }}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3 ${language === "ar" ? "" : "flex-row-reverse"}`}
          style={{
            backgroundColor: type === "habit" ? palette.accent : "transparent",
          }}
        >
          <Text
            className="font-bold"
            style={{ color: type === "habit" ? palette.header : mutedTextColor }}
          >
            {t("ViewAll.daily routine")}
          </Text>
          <RefreshCw
            size={20}
            color={type === "habit" ? palette.header : mutedTextColor}
          />
        </TouchableOpacity>
      </View>
      {/* 1. الفلاتر (الكل / مكتملة / غير مكتملة) */}
      <View
        className={`flex-row p-1 rounded-full mb-4 ${segmentedBackground}`}
      >
        {["all", "completed", "incompleted"].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            accessibilityRole="button"
            accessibilityState={{ selected: category === cat }}
            className="flex-1 py-2.5 rounded-full items-center justify-center"
            style={{
              backgroundColor:
                category === cat ? palette.accent : "transparent",
            }}
          >
            <Text
              className="font-bold text-center text-sm"
              style={{ color: category === cat ? palette.header : mutedTextColor }}
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
                <View
                  className="mb-4 h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(15,23,42,0.05)",
                  }}
                >
                  <CheckCircle2 size={28} color={palette.accent} />
                </View>
                <Text
                  className="text-center font-semibold"
                  style={{ color: mutedTextColor }}
                >
                  {t("ViewAll.No tasks")}
                </Text>
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
                <View
                  className="mb-4 h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(15,23,42,0.05)",
                  }}
                >
                  <Flame size={28} color={palette.accent} />
                </View>
                <Text
                  className="text-center font-semibold"
                  style={{ color: mutedTextColor }}
                >
                  {t("ViewAll.No habits")}
                </Text>
              </View>
            ) : (
              <FlashList
                data={filteredHabits}
                renderItem={renderHabits}
                keyExtractor={(item) => item.id}
              />
            );
          })()}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t("home.addTask")}
        onPress={openAddTaskSheet}
        activeOpacity={0.85}
        className="absolute h-[60px] w-[60px] items-center justify-center rounded-full"
        style={{
          backgroundColor: palette.accent,
          bottom: Math.max(insets.bottom, 12) + 16,
          right: 20,
          elevation: 8,
          shadowColor: palette.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.28,
          shadowRadius: 8,
        }}
      >
        <Plus size={28} color={palette.header} strokeWidth={2.5} />
      </TouchableOpacity>
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