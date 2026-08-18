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
import DateSheet from "../../components/DateSheet";
import TimeSheet from "../../components/TimeSheet";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useModeTheme } from "@/src/theme";

interface DetailsSheetProps {
  itemId: string | null;
}
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
      mode,
      language,
    } = useAppStore();
    const { t } = useTranslation();
    const { palette } = useModeTheme();

    // 1. جلب البيانات والتعرف على النوع
    const task = useMemo(
      () => tasks.find((t) => t.id === itemId),
      [tasks, itemId],
    );
    const habit = useMemo(
      () => habits.find((h) => h.id === itemId),
      [habits, itemId],
    );

    const item = task || habit;
    const isHabit = !!habit;

    const isStudy = mode === "study";

    const dateSheetRef = React.useRef<BottomSheetModal>(null);
    const timeSheetRef = React.useRef<BottomSheetModal>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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
    const snapPoints = useMemo(() => ["85%"], []);

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

    const accentText = isDarkMode
      ? isStudy
        ? "text-study-dark-interactive"
        : "text-dev-dark-interactive"
      : isStudy
        ? "text-study-header"
        : "text-dev-header";
    const inputBg = isDarkMode
      ? isStudy
        ? " bg-study-dark-accentSoft text-study-dark-interactive"
        : " bg-dev-dark-accentSoft text-dev-dark-interactive"
      : isStudy
        ? " bg-study-accentSoft text-study-header"
        : " bg-dev-accentSoft text-dev-header";
    const softBoxBg = isDarkMode
      ? isStudy
        ? " bg-study-dark-accentSoft"
        : " bg-dev-dark-accentSoft"
      : isStudy
        ? " bg-study-accentSoft"
        : " bg-dev-accentSoft";
    const activePill = isDarkMode
      ? isStudy
        ? "bg-study-dark-interactive"
        : "bg-dev-dark-interactive"
      : isStudy
        ? "bg-study-header"
        : "bg-dev-header";
    const activePillText = isDarkMode
      ? isStudy
        ? "text-study-header"
        : "text-dev-header"
      : "text-white";
    const unselectedPill = isDarkMode
      ? isStudy
        ? "border-study-dark-interactive/30 bg-study-dark-accentSoft"
        : "border-dev-dark-interactive/30 bg-dev-dark-accentSoft"
      : isStudy
        ? "border-study-accent/60 bg-study-accent/30"
        : "border-dev-accent/60 bg-dev-accent/30";
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
                className={`text-md font-black px-4 rounded-2xl ${inputBg}`}
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
              placeholder={t(
                "details.description " +
                  (isHabit ? "habit placeholder" : "task placeholder"),
              )}
              className={` p-4 text-md rounded-2xl font-semibold min-h-[120px] ${inputBg}`}
              textAlignVertical="top"
            />
          </View>

          {/* قسم الستريك (يظهر فقط للعدات) */}
          {isHabit && (
            <View
              className={
                " p-4 rounded-2xl items-center mb-6 justify-between" +
                softBoxBg +
                (language === "ar" ? " flex-row-reverse" : " flex-row")
              }
            >
              <Flame size={36} color="#FF8400" />
                <Text
                  className={
                    "text-2xl font-bold text-orange-600" 
                  }
                > {habit.streak}
                </Text>
              <View className={"flex-1 "}>
                <Text
                  className={
                    "text-orange-600 font-bold" +
                    (language === "ar" ? " text-left" : " text-right")
                  }
                >
                  {t("details.you are doing great")}
                </Text>
                <Text
                  className={
                    "text-orange-400 text-xs" +
                    (language === "ar" ? " text-left" : " text-right")
                  }
                >
                  {t("details.Keep it up!")}
                </Text>
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
              {([
                { value: "none", label: t("priority.none") },
                { value: "low", label: t("priority.low") },
                { value: "medium", label: t("priority.medium") },
                { value: "high", label: t("priority.high") },
              ] as { value: Priority; label: string }[]).map((opt) => {
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
                      className={`text-xs font-bold ${isSelected ? activePillText : isDarkMode ? (isStudy ? "text-study-dark-interactive" : "text-dev-dark-interactive") : "text-gray-600"}`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* قسم تغيير وقت التذكير (مش مفعل حالياً) */}
          <View className="mb-6">
            <Pressable
              onPress={() => dateSheetRef.current?.present()}
              className={` gap-2 p-4 rounded-2xl items-center justify-center relative mb-3 ${softBoxBg} ${language === "ar" ? " flex-row" : " flex-row-reverse"}`}
            >
              <Text
                className={` font-bold text-center ${accentText}`}
              >
                {t("details.change date")}
              </Text>
              <Calendar
                size={20}
                color={iconColor}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
            </Pressable>
            <Pressable
              onPress={() => timeSheetRef.current?.present()}
              className={` gap-2 p-4 rounded-2xl flex-row items-center justify-center relative ${softBoxBg} ${language === "ar" ? " flex-row" : " flex-row-reverse"}`}
            >
              <Text
                className={` font-bold text-center ${accentText}`}
              >
                {t("details.change time")}
              </Text>
              <Clock
                size={20}
                color={iconColor}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
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
