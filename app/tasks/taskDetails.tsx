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
    } = useAppStore();

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
        backgroundStyle={{ backgroundColor: isDarkMode ?  isStudy ? "#0f172a" : "#022c22" : isStudy ? "#f8fafc" : "#f0fdf4", borderRadius: 40 }}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#E5E7EB" }}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView className="flex-1 p-6">
          {/* الهيدر: العنوان مع أيقونة النوع */}
          <View className="flex-row-reverse items-center justify-between mb-6">
            <View className="flex-1 ml-4">
              <Text className={" font-bold mb-3 text-left" + (isDarkMode ? (isStudy ? " text-study-dark-primary" : " text-coding-dark-primary") : (isStudy ? " text-study-secondary" : " text-coding-secondary"))}>
                {isHabit ? "عنوان العادة" : "عنوان المهمة"}
              </Text>
              <TextInput
                value={item.title}
                onChangeText={(text) =>
                  isHabit
                    ? updateHabit(item.id, { title: text })
                    : updateTask(item.id, { title: text })
                }
                className={`text-lg font-black text-right px-4 rounded-2xl ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30 text-study-dark-primary" : " bg-coding-dark-primary/30 text-coding-dark-primary") : (isStudy ? " bg-violet-50 text-study-primary" : " bg-green-100 text-coding-primary")}`}
                placeholder="العنوان..."
              />
            </View>
          </View>

          {/* قسم الستريك (يظهر فقط للعدات) */}
          {isHabit && (
            <View className="bg-orange-50 p-4 rounded-2xl flex-row-reverse items-center mb-6">
              <Text className="text-2xl mr-2">🔥</Text>
              <View>
                <Text className="text-orange-600 font-bold text-right">
                  أنت مستمر لـ {habit?.streak} أيام!
                </Text>
                <Text className="text-orange-400 text-xs text-right">
                  لا توقف الحماس
                </Text>
              </View>
            </View>
          )}

          {/* حقل الوصف */}
          <View className="mb-6">
            <Text className={"text-left  font-bold mb-2" + (isDarkMode ? (isStudy ? " text-study-dark-primary" : " text-coding-dark-primary") : (isStudy ? " text-study-secondary" : " text-coding-secondary"))}>
              تفاصيل {isHabit ? "العادة" : "المهمة"}
            </Text>
            <BottomSheetTextInput
              multiline
              value={item.description}
              onChangeText={(text) =>
                isHabit
                  ? updateHabit(item.id, { description: text })
                  : updateTask(item.id, { description: text })
              }
              placeholder="اكتب تفاصيل إضافية هنا..."
              className={` p-4 text-md rounded-2xl text-right font-semibold min-h-[120px] ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30 text-study-dark-primary" : " bg-coding-dark-primary/30 text-coding-dark-primary") : (isStudy ? " bg-violet-50 text-study-primary" : " bg-green-100 text-coding-primary")}`}
              textAlignVertical="top"
            />
          </View>
          {/* قسم تغيير وقت التذكير (مش مفعل حالياً) */}
          <View className="mb-6">
            <Pressable
              onPress={() => dateSheetRef.current?.present()}
              className={` gap-2 p-4 rounded-2xl flex-row items-center justify-center relative mb-3 ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30" : " bg-coding-dark-primary/30") : (isStudy ? " bg-study-accent" : " bg-coding-accent")}`}
            >
              <Text className={` font-bold text-center ${isDarkMode ? (isStudy ? " text-study-dark-primary" : " text-coding-dark-primary") : (isStudy ? " text-study-primary" : " text-coding-primary")}`}>
                تغيير تاريخ التذكير
              </Text>
              <Calendar
                size={20}
                color={isDarkMode ? (isStudy ? "#E0E7FF" : "#D1FAE5") : (isStudy ? "#1E40AF" : "#065F46")}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
            </Pressable>
            <Pressable
              onPress={() => timeSheetRef.current?.present()}
              className={` gap-2 p-4 rounded-2xl flex-row items-center justify-center relative ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30" : " bg-coding-dark-primary/30") : (isStudy ? " bg-study-accent" : " bg-coding-accent")}`}
            >
              <Text className={` font-bold text-center ${isDarkMode ? (isStudy ? " text-study-dark-primary" : " text-coding-dark-primary") : (isStudy ? " text-study-primary" : " text-coding-primary")}`}>
                تغيير وقت التذكير
              </Text>
              <Clock
                size={20}
                color={isDarkMode ? (isStudy ? "#E0E7FF" : "#D1FAE5") : (isStudy ? "#1E40AF" : "#065F46")}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
            </Pressable>
          </View>

          {/* زر الحذف في الأسفل */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert("حذف", "هل أنت متأكد من حذف هذا العنصر؟", [
                { text: "إلغاء", style: "cancel" },
                {
                  text: "حذف",
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
              ]);
            }}
            className={"mt-auto p-4 rounded-2xl flex-row items-center justify-center " + (isDarkMode ? (isStudy ? " bg-red-600/30" : " bg-red-600/30") : (isStudy ? " bg-red-100" : " bg-red-100"))}
          >
            <Text className="text-red-600 font-bold mr-2">حذف العنصر</Text>
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
          initialIsDuration={false}
          onSave={(timeValue, isDuration) => {
            const existingDate =
              taskDueDate !== undefined
                ? new Date(taskDueDate)
                : taskReminderTime
                  ? new Date(taskReminderTime)
                  : new Date();
            const nextDate = new Date(existingDate);
            if (!isDuration && timeValue) {
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
