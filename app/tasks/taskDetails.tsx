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
  BottomSheetTextInput
} from "@gorhom/bottom-sheet";
import { useAppStore } from "../../store/useAppStore"; // تأكد من مسار الستور
import { Ionicons } from "@expo/vector-icons";
import { Clock } from "lucide-react-native";
import DateClockSheet from "../../components/DateClockSheet";

interface DetailsSheetProps {
  itemId: string | null;
}
export const DetailsSheet = forwardRef<BottomSheetModal, DetailsSheetProps>(
  ({ itemId }, ref) => {
    const {
      tasks,
      habits,
      updateTask,
      updateHabit,
      removeTask,
      removeHabit,
      mode
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
    const themeColor = isHabit ? "#22C55E" : "#3B82F6"; // لون مميز لكل نوع

    const isStudy = mode === "study";

    const clockSheetRef = React.useRef<BottomSheetModal>(null);

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

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        keyboardBehavior="fillParent"
        backgroundStyle={{ backgroundColor: "#FFFFFF", borderRadius: 40 }}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#E5E7EB" }}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView className="flex-1 p-6">
          {/* الهيدر: العنوان مع أيقونة النوع */}
          <View className="flex-row-reverse items-center justify-between mb-6">
            <View className="flex-1 ml-4">
              <Text className="text-gray-400 font-bold mb-3 text-left">
                {isHabit ? "عنوان العادة" : "عنوان المهمة"}
              </Text>
              <TextInput
                value={item.title}
                onChangeText={(text) =>
                  isHabit
                    ? updateHabit(item.id, { title: text })
                    : updateTask(item.id, { title: text })
                }
                className={`text-lg font-black text-right bg-gray-100 px-4 rounded-2xl ${isStudy ? "text-study-secondary" : "text-coding-secondary"}`}
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
            <Text className="text-left text-gray-500 font-bold mb-2">
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
              className={`bg-gray-50 p-4 rounded-2xl text-right font-semibold text-gray-700 min-h-[120px] ${isStudy ? "text-study-primarr" : "text-coding-primary"}`}
              textAlignVertical="top"
            />
          </View>
          {/* قسم تغيير وقت التذكير (مش مفعل حالياً) */}
          <View>
            <Pressable 
              onPress={() => clockSheetRef.current?.present()}
              className={`bg-blue-50 gap-2 p-4 rounded-2xl flex-row items-center justify-center relative mb-6`}>
              <Text className={`text-${isHabit ? "green" :  "blue"}-500 font-bold text-center`}>
                تغيير وقت التذكير
              </Text>
              <Clock
                size={20}
                color="#3B82F6"
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
            className="mt-auto bg-red-50 p-4 rounded-2xl flex-row items-center justify-center"
          >
            <Text className="text-red-600 font-bold mr-2">حذف العنصر</Text>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </BottomSheetView>
        <DateClockSheet
          ref={clockSheetRef}
          initialDate={item.reminderTime ? new Date(item.reminderTime) : new Date()}
          onSave={(date) => {
            const isoString = date.toISOString();
            if (isHabit) {
              updateHabit(item.id, { reminderTime: isoString });
            } else {
              updateTask(item.id, { reminderTime: isoString });
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
