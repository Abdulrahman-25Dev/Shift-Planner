import React, { forwardRef, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Task, Priority, useAppStore } from "../../store/useAppStore"; // تأكد من مسار الستور
import { Ionicons } from "@expo/vector-icons";
import { Calendar, Clock, Flame } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateSheet from "../../components/DateSheet";
import TimeSheet from "../../components/TimeSheet";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useModeTheme, useModeClasses } from "@/src/theme";

interface DetailsSheetProps {
  itemId: string | null;
}

const getLast14Days = (): Date[] => {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }
  return days; // Index 13 is ALWAYS Today
};
export const DetailsSheet = forwardRef<BottomSheetModal, DetailsSheetProps>(
  ({ itemId }, ref) => {
    const {
      tasks,
      habits,
      isDarkMode,
      updateTask,
      updateHabit,
      removeTask,
      removeHabit,
      language,
    } = useAppStore();
    const { t } = useTranslation();
    const { palette } = useModeTheme();
    const mc = useModeClasses();

    // 1. جلب البيانات والتعرف على النوع
    const task = useMemo(
      () => tasks.find((t) => t.id === itemId),
      [tasks, itemId],
    );
    const habit = useMemo(
      () => habits.find((h) => h.id === itemId),
      [habits, itemId],
    );

    // آخر 14 يومًا لرسم خريطة الإنجاز (GitHub-style heat map)
    const last14Days = useMemo(() => {
      const streakCount = habit?.streak ?? 0;
      const lit = Math.min(streakCount, 14);
      return getLast14Days()
        .map((d, i) => ({
          key: d.toDateString(),
          status: i < lit ? "completed" : "skipped",
        }))
        .reverse(); // Today first → far right in RTL, far left in LTR
    }, [habit]);

    const item = task || habit;
    const isHabit = !!habit;

    const dateSheetRef = React.useRef<BottomSheetModal>(null);
    const timeSheetRef = React.useRef<BottomSheetModal>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [descHeight, setDescHeight] = useState(48);

    const handleDelete = useCallback(() => {
      if (!item) return;
      if (isHabit) {
        removeHabit(item.id);
      } else {
        removeTask(item.id);
      }
      setDeleteModalVisible(false);
      // @ts-ignore
      ref.current?.dismiss();
    }, [isHabit, item, removeHabit, removeTask, ref]);

    // 2. إعدادات الشيت (Snap Points)
    const snapPoints = useMemo(() => ["88%"], []);

    // 3. خلفية معتمة عند الفتح
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    if (!item) return null;

    const taskDueDate = !isHabit ? (item as Task).dueDate : undefined;
    const taskReminderTime = item.reminderTime;

    const accentText = isDarkMode ? mc.darkInteractiveText : mc.textHeader;
    const inputBg = isDarkMode
      ? ` ${mc.darkAccentSoft} ${mc.darkInteractiveText}`
      : ` ${mc.accentSoft} ${mc.textHeader}`;
    const softBoxBg = isDarkMode ? mc.darkAccentSoft : mc.accentSoft;
    const activePill = isDarkMode ? mc.darkInteractive : mc.headerBg;
    const activePillText = isDarkMode ? mc.textHeader : "text-white";
    const unselectedPill = isDarkMode
      ? `${mc.darkInteractiveBorder30} ${mc.darkAccentSoft}`
      : `${mc.accentBorder} ${mc.accentBg30}`;
    const iconColor = palette.accentText;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        keyboardBehavior="fillParent"
        backgroundStyle={{
          backgroundColor: isDarkMode ? palette.card : "#FFFFFF",
          borderRadius: 40,
        }}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#E5E7EB" }}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView className="flex-1 p-6">
          {/* الهيدر: العنوان مع أيقونة النوع */}
          <View className="flex-row-reverse items-center justify-between mb-6">
            <View className="flex-1 ml-4">
              <Text
                className={
                  " font-bold mb-3 text-left" +
                  " " +
                  accentText +
                  (language === "ar" ? " text-left" : " text-right")
                }
              >
                {isHabit ? t("details.title habit") : t("details.title task")}
              </Text>
              <TextInput
                value={item.title}
                onChangeText={(text) =>
                  isHabit
                    ? updateHabit(item.id, { title: text })
                    : updateTask(item.id, { title: text })
                }
                className={`text-md  font-black px-4 rounded-2xl ${inputBg}`}
                placeholder={
                  isHabit
                    ? t("details.habit title placeholder")
                    : t("details.task title placeholder")
                }
              />
            </View>
          </View>
          {/* حقل الوصف */}
          <View className="mb-6">
            <Text
              className={
                "  font-bold mb-2" +
                " " +
                accentText +
                (language === "ar" ? " text-left" : " text-right")
              }
            >
              {t("details.description " + (isHabit ? "habit" : "task"))}
            </Text>
            <BottomSheetTextInput
              multiline
              value={item.description}
              onChangeText={(text) =>
                isHabit
                  ? updateHabit(item.id, { description: text })
                  : updateTask(item.id, { description: text })
              }
              onContentSizeChange={(e) =>
                setDescHeight(e.nativeEvent.contentSize.height)
              }
              placeholder={t(
                "details.description " +
                  (isHabit ? "habit placeholder" : "task placeholder"),
              )}
              className={` p-4 text-md rounded-2xl font-semibold ${inputBg}`}
              style={{ minHeight: 48, height: Math.max(48, descHeight) }}
              textAlignVertical="top"
            />
          </View>

          {/* قسم الستريك + سجل الإنجاز (يظهر فقط للعدات) */}
          {isHabit && (
            <View className={`p-4 rounded-2xl mb-6 ${softBoxBg}`}>
              {/* العنوان + عداد الستريك المصغر */}
              <View
                className={`items-center justify-between mb-3 flex-row`}
              >
                <Text
                  className={`font-bold ${accentText} ${
                    language === "ar" ? "text-left" : "text-right"
                  }`}
                >
                  {t("details.achievement history")}
                </Text>
              </View>

              {/* خريطة الإنجاز: آخر 14 يومًا */}
              <View className="flex-row items-center gap-[3px]">
                {last14Days.map((day) => {
                  if (day.status === "completed") {
                    return (
                      <LinearGradient
                        key={day.key}
                        colors={[palette.secondary, palette.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="flex-1 aspect-square rounded-[4px]"
                      />
                    );
                  }
                  if (day.status === "skipped") {
                    return (
                      <View
                        key={day.key}
                        className={`flex-1 aspect-square rounded-[4px] ${
                          isDarkMode ? "bg-gray-600/60" : "bg-gray-400/50"
                        }`}
                      />
                    );
                  }
                  return (
                    <View
                      key={day.key}
                      className={`flex-1 aspect-square rounded-[4px] border ${
                        isDarkMode ? "border-gray-500/50" : "border-gray-400/40"
                      }`}
                    />
                  );
                })}
              </View>

              {/* عداد الستريك + رسالة التشجيع في صف واحد */}
              <View
                className={`items-center justify-between mt-3 ${
                  language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <View className="flex-row items-center gap-1">
                  <Flame size={20} color="#FF8400" />
                  <Text className="text-xl font-black text-orange-600">
                    {habit.streak}
                  </Text>
                </View>
                <View className={`${language === "ar" ? "items-start" : "items-end"}`}>
                  <Text className="text-orange-600 font-bold text-sm">
                    {t("details.you are doing great")}
                  </Text>
                  <Text className="text-orange-400 text-xs">
                    {t("details.Keep it up!")}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* قسم الأولوية */}
          <View className="mb-6">
            <Text
              className={`font-bold mb-2 ${accentText} ${language === "ar" ? "text-left" : "text-right"}`}
            >
              {t("details.change priority")}
            </Text>
            <View className="flex-row justify-between">
              {(
                [
                  { value: "none", label: t("priority.none") },
                  { value: "low", label: t("priority.low") },
                  { value: "medium", label: t("priority.medium") },
                  { value: "high", label: t("priority.high") },
                ] as { value: Priority; label: string }[]
              ).map((opt) => {
                const isSelected = item.priority === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() =>
                      isHabit
                        ? updateHabit(item.id, { priority: opt.value })
                        : updateTask(item.id, { priority: opt.value })
                    }
                    className={`flex-1 px-3 py-2 mx-1 rounded-2xl items-center border ${
                      isSelected
                        ? `border-transparent ${activePill}`
                        : unselectedPill
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${isSelected ? activePillText : isDarkMode ? mc.darkInteractiveText : "text-gray-600"}`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* قسم تغيير التاريخ والوقت (صف أفقي واحد) */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={() => dateSheetRef.current?.present()}
              className={`flex-1 gap-2 p-3 rounded-2xl items-center justify-center ${softBoxBg}`}
            >
              <Calendar size={20} color={iconColor} />
              <Text className={`font-bold text-center ${accentText}`}>
                {t("details.date")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => timeSheetRef.current?.present()}
              className={`flex-1 gap-2 p-3 rounded-2xl items-center justify-center ${softBoxBg}`}
            >
              <Clock size={20} color={iconColor} />
              <Text className={`font-bold text-center ${accentText}`}>
                {t("details.time")}
              </Text>
            </Pressable>
          </View>

          {/* زر الحذف في الأسفل */}
          <TouchableOpacity
            onPress={() => setDeleteModalVisible(true)}
            className={
              "mt-auto p-4 rounded-2xl items-center justify-center " +
              (isDarkMode ? " bg-red-600/30" : " bg-red-100") +
              (language === "ar" ? " flex-row" : " flex-row-reverse")
            }
          >
            <Text
              className={
                "text-red-600 font-bold" +
                (language === "ar" ? " mr-2" : " ml-2")
              }
            >
              {t("details.delete")}
            </Text>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </BottomSheetView>
        <ConfirmationModal
          isVisible={deleteModalVisible}
          title={t("details.delete")}
          description={t("details.delete confirmation")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
        />
        <DateSheet
          type={isHabit ? "habit" : "task"}
          ref={dateSheetRef}
          initialDate={
            taskDueDate !== undefined
              ? new Date(taskDueDate)
              : taskReminderTime
                ? new Date(taskReminderTime)
                : new Date()
          }
          onSave={(date, repeatData) => {
            const fixedDate = new Date(date);
            if (isHabit) {
              const isoString = fixedDate.toISOString();
              updateHabit(item.id, {
                reminderTime: isoString,
                ...(repeatData
                  ? {
                      repeatType: repeatData.type,
                      repeatDays: repeatData.days,
                    }
                  : {}),
              });
            } else {
              updateTask(item.id, {
                dueDate: fixedDate.getTime(),
                reminderTime: fixedDate.toISOString(),
              });
            }
          }}
        />
        <TimeSheet
          ref={timeSheetRef}
          initialTimeValue={
            taskDueDate !== undefined
              ? new Date(taskDueDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : taskReminderTime
                ? new Date(taskReminderTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : ""
          }
          onSave={(timeValue) => {
            const existingDate =
              taskDueDate !== undefined
                ? new Date(taskDueDate)
                : taskReminderTime
                  ? new Date(taskReminderTime)
                  : new Date();
            const nextDate = new Date(existingDate);
            if (timeValue) {
              const [hourText, minuteText] = timeValue.split(":");
              const hour = parseInt(hourText, 10);
              const minute = parseInt(minuteText, 10);
              if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
                nextDate.setHours(hour, minute, 0, 0);
              }
            }
            if (isHabit) {
              const isoString = nextDate.toISOString();
              updateHabit(item.id, { reminderTime: isoString });
            } else {
              updateTask(item.id, {
                dueDate: nextDate.getTime(),
                reminderTime: nextDate.toISOString(),
              });
            }
          }}
        />
      </BottomSheetModal>
    );
  },
);

export default DetailsSheet;
const displayName = "DetailsSheet";
DetailsSheet.displayName = displayName;
