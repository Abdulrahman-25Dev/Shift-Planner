import React, { forwardRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Task, useAppStore } from "../../store/useAppStore"; // تأكد من مسار الستور
import { Ionicons } from "@expo/vector-icons";
import { Calendar, Clock } from "lucide-react-native";
import DateSheet from "../../components/DateSheet";
import TimeSheet from "../../components/TimeSheet";
import { useTranslation } from "react-i18next";

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

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        keyboardBehavior="fillParent"
        backgroundStyle={{
          backgroundColor: isDarkMode
            ? isStudy
              ? "#0f172a"
              : "#022c22"
            : isStudy
              ? "#f8fafc"
              : "#f0fdf4",
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
                  (isDarkMode
                    ? isStudy
                      ? " text-study-dark-primary"
                      : " text-coding-dark-primary"
                    : isStudy
                      ? " text-study-secondary"
                      : " text-coding-secondary") +
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
                className={`text-md font-black px-4 rounded-2xl ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30 text-study-dark-primary" : " bg-coding-dark-primary/30 text-coding-dark-primary") : isStudy ? " bg-violet-50 text-study-primary" : " bg-green-100 text-coding-primary"}`}
                placeholder={
                  isHabit
                    ? t("details.habit title placeholder")
                    : t("details.task title placeholder")
                }
                placeholderClassName={`${language === "ar" ? " text-left" : " text-right"}`}
              />
            </View>
          </View>
          {/* حقل الوصف */}
          <View className="mb-6">
            <Text
              className={
                "  font-bold mb-2" +
                (isDarkMode
                  ? isStudy
                    ? " text-study-dark-primary"
                    : " text-coding-dark-primary"
                  : isStudy
                    ? " text-study-secondary"
                    : " text-coding-secondary") +
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
              className={` p-4 text-md rounded-2xl font-semibold min-h-[120px] ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30 text-study-dark-primary" : " bg-coding-dark-primary/30 text-coding-dark-primary") : isStudy ? " bg-violet-50 text-study-primary" : " bg-green-100 text-coding-primary"}`}
              textAlignVertical="top"
            />
          </View>

          {/* قسم الستريك (يظهر فقط للعدات) */}
          {isHabit && (
            <View
              className={
                " p-4 rounded-2xl items-center mb-6 justify-between" +
                (isDarkMode
                  ? isStudy
                    ? " bg-study-dark-primary/30"
                    : " bg-coding-dark-primary/30"
                  : isStudy
                    ? " bg-violet-50"
                    : " bg-green-100") +
                (language === "ar" ? " flex-row-reverse" : " flex-row")
              }
            >
              <Text className="text-2xl mr-2">🔥</Text>
              <View className={"flex-1 "}>
                <Text
                  className={
                    "text-sm font-bold" +
                    (language === "ar" ? " text-left" : " text-right") +
                    (isDarkMode
                      ? isStudy
                        ? " text-study-dark-primary"
                        : " text-coding-dark-primary"
                      : isStudy
                        ? " text-study-primary"
                        : " text-coding-primary")
                  }
                >
                  {" "}
                  {t("details.number of days")} {habit.streak}
                </Text>
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

          {/* قسم تغيير وقت التذكير (مش مفعل حالياً) */}
          <View className="mb-6">
            <Pressable
              onPress={() => dateSheetRef.current?.present()}
              className={` gap-2 p-4 rounded-2xl items-center justify-center relative mb-3 ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30" : " bg-coding-dark-primary/30") : isStudy ? " bg-study-accent" : " bg-coding-accent"} ${language === "ar" ? " flex-row" : " flex-row-reverse"}`}
            >
              <Text
                className={` font-bold text-center ${isDarkMode ? (isStudy ? " text-study-dark-primary" : " text-coding-dark-primary") : isStudy ? " text-study-primary" : " text-coding-primary"}`}
              >
                {t("details.change date")}
              </Text>
              <Calendar
                size={20}
                color={
                  isDarkMode
                    ? isStudy
                      ? "#E0E7FF"
                      : "#D1FAE5"
                    : isStudy
                      ? "#1E40AF"
                      : "#065F46"
                }
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
            </Pressable>
            <Pressable
              onPress={() => timeSheetRef.current?.present()}
              className={` gap-2 p-4 rounded-2xl flex-row items-center justify-center relative ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30" : " bg-coding-dark-primary/30") : isStudy ? " bg-study-accent" : " bg-coding-accent"} ${language === "ar" ? " flex-row" : " flex-row-reverse"}`}
            >
              <Text
                className={` font-bold text-center ${isDarkMode ? (isStudy ? " text-study-dark-primary" : " text-coding-dark-primary") : isStudy ? " text-study-primary" : " text-coding-primary"}`}
              >
                {t("details.change time")}
              </Text>
              <Clock
                size={20}
                color={
                  isDarkMode
                    ? isStudy
                      ? "#E0E7FF"
                      : "#D1FAE5"
                    : isStudy
                      ? "#1E40AF"
                      : "#065F46"
                }
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
            </Pressable>
          </View>

          {/* زر الحذف في الأسفل */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                t("details.delete"),
                t("details.delete confirmation"),
                [
                  { text: t("details.cancel"), style: "cancel" },
                  {
                    text: t("details.delete"),
                    style: "destructive",
                    onPress: () => {
                      if (isHabit) {
                        removeHabit(item.id);
                      } else {
                        removeTask(item.id);
                      }
                      // @ts-ignore
                      ref.current?.dismiss();
                    },
                  },
                ],
              );
            }}
            className={
              "mt-auto p-4 rounded-2xl items-center justify-center " +
              (isDarkMode
                ? isStudy
                  ? " bg-red-600/30"
                  : " bg-red-600/30"
                : isStudy
                  ? " bg-red-100"
                  : " bg-red-100") +
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
        <DateSheet
          ref={dateSheetRef}
          initialDate={
            taskDueDate !== undefined
              ? new Date(taskDueDate)
              : taskReminderTime
                ? new Date(taskReminderTime)
                : new Date()
          }
          onSave={(date) => {
            const fixedDate = new Date(date);
            if (isHabit) {
              const isoString = fixedDate.toISOString();
              updateHabit(item.id, { reminderTime: isoString });
            } else {
              updateTask(item.id, { dueDate: fixedDate.getTime() });
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
                })
              : taskReminderTime
                ? new Date(taskReminderTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
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
              updateTask(item.id, { dueDate: nextDate.getTime() });
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
