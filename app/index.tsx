import React, { useRef, useState } from "react";
import {
  I18nManager,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useAppStore, Task } from "../store/useAppStore";
import { GraduationCap, Code2, Settings, Trash2 } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { AddTaskSheet } from "../components/AddTaskSheet";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { DetailsSheet } from "./tasks/taskDetails";

export default function Index() {
  const {
    mode,
    toggleMode,
    selectDay,
    setSelectDay,
    tasks,
    habits,
    toggleTaskComplete,
    completeHabit,
    removeTask,
    removeHabit,
  } = useAppStore();
  const isStudy = mode === "study";

  const priorityRank = (priority: string | undefined) => {
    if (priority === "high") return 3;
    if (priority === "medium") return 2;
    return 1;
  };

  const today = new Date().toDateString();
  const habitsWithCompleted = habits.map(habit => ({
    ...habit,
    completed: habit.lastCompletedDate ? new Date(habit.lastCompletedDate).toDateString() === today : false,
  }));

  const sortedHabits = [...habitsWithCompleted].sort(
    (a, b) => priorityRank(b.priority) - priorityRank(a.priority),
  );

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const openAddTaskSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const detailsSheetRef = useRef<BottomSheetModal>(null);
const [selectedId, setSelectedId] = useState<string | null>(null);

const handleOpenDetails = (id: string) => {
  setSelectedId(id);
  detailsSheetRef.current?.present();
};

  const generateMonthDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // الشهر الحالي (0-11)

    // عدد الأيام في الشهر الحالي
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        id: i.toString(),
        // 'short' تعطيك (Sat, Sun..)، لو تبيها بالعربي تقدر تغير 'en-US' لـ 'ar-SA'
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return days;
  };

  const renderTasks = ({ item }: { item: Task }) => {
    const dueDateLabel = item.dueDate
      ? new Date(item.dueDate).toLocaleDateString(
          I18nManager.isRTL ? "ar-SA" : "en-US",
          {
            day: "numeric",
            month: "short",
          },
        )
      : "بدون تاريخ";

    return (
      <Pressable onPress={() => handleOpenDetails(item.id)}>
        <View
          className={`flex-row items-center justify-between mb-3 p-3 rounded-[30px] border ${
            item.completed
              ? "bg-gray-100 border-gray-200"
              : isStudy
                ? "bg-white border-study-primary/20"
                : "bg-white border-coding-primary/20"
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
                ? "bg-gray-200"
                : isStudy
                  ? "bg-study-primary/10"
                  : "bg-coding-primary/10"
            }`}
          >
            <View
              className={`w-3 h-3 rounded-full ${item.completed ? "bg-gray-400" : isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
            />
          </View>

          <View className="flex-1 ml-3">
            <Text
              className={`font-bold text-base ${item.completed ? "line-through text-gray-500" : "text-gray-800"}`}
            >
              {item.title}
            </Text>
            <Text className="text-gray-600 text-xs">{dueDateLabel}</Text>
          </View>

          {/* زر إتمام سريع */}
          <Pressable
            onPress={() => toggleTaskComplete(item.id)}
            className={`flex-row items-center p-1 mb-2 rounded-[24px] ${
              item.completed
                ? "bg-gray-100 border-gray-200"
                : isStudy
                  ? "bg-white"
                  : "bg-white"
            }`}
          >
            <View
              className={`w-8 h-8 rounded-md border-2 mx-5 flex-row items-center justify-center ${item.completed ? "bg-green-500 border-green-500" : "border-gray-200"}`}
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
            onPress={() => removeTask(item.id)}
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
      priority?: "low" | "medium" | "high";
    };
  }) => {
    return (

      <Pressable
        
        onPressIn={() => handleOpenDetails(item.id)}
        className={`flex-row justify-between items-center px-4 py-2 mb-3 rounded-[24px] border ${
          item.completed
            ? "bg-gray-100 border-gray-200":
          isStudy
            ? "bg-white border-study-primary/10"
            : "bg-white border-coding-primary/10"
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
                ? "bg-gray-200"
                : isStudy
                  ? "bg-study-primary/10"
                  : "bg-coding-primary/10"
            }`}
          >
            <View
              className={`w-3 h-3 rounded-full ${item.completed ? "bg-gray-400" : isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
            />
          </View>

        {/* 2. النصوص (العنوان والسلسلة) */}
        <View className="mx-3 ml-3 flex-1">
          <Text className={`font-bold text-base text-gray-800 ${item.completed ? "line-through text-gray-500" : ""}`}>
            {item.title}
          </Text>
          <View className="self-start rounded-full px-3 py-1 border border-gray-200 bg-gray-50">
            <Text className="text-[8px] font-black uppercase text-gray-600">
              {item.priority === "high"
                ? "عالية"
                : item.priority === "medium"
                  ? "متوسطة"
                  : "منخفضة"}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => completeHabit(item.id)}
          className={`flex-row items-center ${            item.completed
              ? "bg-white border-gray-200"
              : isStudy
                ? "bg-white"
                : "bg-white"
          }`}
          >

            <View
              className={`w-8 h-8 rounded-md border-2 mx-2 flex-row items-center justify-center ${item.completed ? "bg-green-500 border-green-500" : "border-gray-100"}`}
            >
              {item.completed && (
                <Text className="text-white text-xs font-bold text-center">
                  ✓
                </Text>
              )}
            </View>
          
        </Pressable>

        {/* زر الحذف */}
        <Pressable
          onPress={() => removeHabit(item.id)}
          className="w-10 h-10 rounded-full bg-red-500 items-center justify-center ml-2"
        >
          <Trash2 color="white" size={20} />
        </Pressable>
      </Pressable>
    );
  };

  const daysData = generateMonthDays();

  const renderDays = ({ item }: { item: { id: string; name: string } }) => {
    // الحين بيطلع لك الـ Auto-complete لـ selectedDay
    const isSelected = selectDay === parseInt(item.id);

    return (
      <View className="py-4">
        <Pressable
          onPress={() => setSelectDay(parseInt(item.id))}
          className={`items-center justify-center w-16 h-24 rounded-3xl ${
            isSelected
              ? mode === "study"
                ? "border-4 border-study-primary bg-study-primary/10"
                : "border-4 border-coding-primary bg-coding-primary/10"
              : "bg-white border border-gray-600"
          }`}
        >
          <Text
            className={`text-xl font-black ${isSelected ? (mode === "study" ? "text-study-primary" : "text-coding-primary") : "text-gray-800"}`}
          >
            {item.id}
          </Text>
          <Text
            className={`text-[10px] font-bold uppercase ${isSelected ? (mode === "study" ? "text-study-primary" : "text-coding-primary") : "text-gray-600"}`}
          >
            {item.name}
          </Text>
        </Pressable>
      </View>
    );
  };

  // --- مكون الهيدر (مكتوب هنا لسهولة التعديل) ---
  const HeaderSection = () => (
    <View
      className={`pt-12 pb-5 px-6 shadow-2xl ${
        isStudy ? "bg-study-primary" : "bg-coding-primary"
      }`}
    >
      <View className="flex-row justify-between items-center">
        {/* زر الإعدادات/المود */}
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

        {/* عنوان المود */}
        <View className="flex-1 items-center">
          <Text className="text-white/70 text-xs font-bold mb-1">
            {isStudy ? "STUDY MODE" : "DEV MODE"}
          </Text>
          <Text className="text-white text-2xl font-black">
            {isStudy ? "بيئة الدراسة" : "بيئة البرمجة"}
          </Text>
        </View>
        {/* زر الإعدادات*/}
        <View>
          <Pressable
            onPress={() => router.push("./settings")}
            className="bg-white/20 p-3 rounded-2xl"
          >
            {/* أيقونة للزر */}
            <Settings color="white" size={26} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    // الـ View "العم" - وظيفته فقط الخلفية وتوزيع العناصر الكبيرة

    <View className={`flex-1 ${isStudy ? "bg-study-bg" : "bg-coding-bg"}`}>
      {/* استدعاء الهيدر كقطعة واحدة */}
      <HeaderSection />

      {/* باقي محتويات الصفحة */}
      <View className="flex-1 px-4 mt-2">
        {/* هنا سيأتي صف الأيام والفلاش ليست */}
        <FlashList
          horizontal
          data={daysData} // بيانات الأيام
          renderItem={renderDays} // طريقة عرض كل يوم
          keyExtractor={(item) => item.id.toString()} // مفتاح فريد لكل يوم
          initialScrollIndex={selectDay - 3} // لتحديد اليوم المختار عند البداية
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-4" />}
        />
        <View className="flex-row justify-between items-center mt-6 mb-3 px-1">
          <Text
            className={`text-lg font-bold ${isStudy ? "text-indigo-900" : "text-emerald-900"}`}
          >
            مهام اليوم
          </Text>
          <Pressable
            onPress={() => alert("عرض كل المهام")}
            className="px-3 py-1 rounded-lg"
          >
            <Text className="text-sm font-bold text-gray-600">عرض الكل</Text>
          </Pressable>
        </View>

        {/* مكان الـ FlashList */}
        <View className="h-56">
          <FlashList
            data={tasks.slice(0, 2)} // عرض فقط أول 2 مهام
            renderItem={renderTasks} // طريقة عرض كل مهمة
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View className="flex-row justify-between items-center px-1 mb-3">
          {/* عنوان الفلاش ليست للعادات */}
          <Text className="text-lg font-bold text-gray-800">عاداتي</Text>
          <Pressable
            onPress={() => alert("عرض كل العادات")}
            className="px-3 py-1 rounded-lg"
          >
            <Text className="text-sm font-bold text-gray-600">عرض الكل</Text>
          </Pressable>
        </View>
        <View className="h-64">
          <FlashList
            data={sortedHabits.slice(0, 2)} // عرض فقط أول 2 عادات مرتبة حسب الأولوية
            renderItem={renderHabits} // طريقة عرض كل عادة
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
        {/* زر إضافة مهمة/عادة جديد */}
        <TouchableOpacity
          onPress={openAddTaskSheet}
          className={`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center ${
            isStudy ? "bg-study-primary" : "bg-coding-primary"
          }`}
          style={{ elevation: 5 }}
        >
          <Text className="text-white text-3xl font-bold">+</Text>
        </TouchableOpacity>

        {/* --- مكون الـ Bottom Sheet لإضافة مهمة/عادة جديدة --- */}
      </View>
      <AddTaskSheet ref={bottomSheetRef} mode={mode} />
      <DetailsSheet ref={detailsSheetRef} itemId={selectedId} />
    </View>
  );
}
