import React, { useCallback, useMemo, useState, forwardRef } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { CheckCircle2, Clock1, RefreshCw, Calendar } from "lucide-react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useAppStore } from "../store/useAppStore";
import DateSheet from "../components/DateSheet";
import TimeSheet from "../components/TimeSheet";

export const AddTaskSheet = forwardRef(
  (props: any, ref: React.Ref<BottomSheetModal>) => {
    const [type, setType] = useState<"task" | "habit">("task"); // التحكم بنوع الإضافة
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(
      "medium",
    );

    const dateSheetRef = React.useRef<BottomSheetModal>(null);
    const timeSheetRef = React.useRef<BottomSheetModal>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>(
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    );
    const [selectedIsDuration, setSelectedIsDuration] =
      useState<boolean>(false);
    const isStudy = props.mode === "study";
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    const AddTask = useAppStore((state) => state.addTask);
    const AddHabit = useAppStore((state) => state.addHabit);

    // نقاط التوقف: 50% من الشاشة أو 85%
    const snapPoints = useMemo(() => ["85%"], []);

    // إضافة خلفية مظلمة عند فتح الشيت (Backdrop)
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

    return (
      <BottomSheet
        ref={ref}
        index={-1} // مخفي في البداية
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          borderRadius: 40,
          backgroundColor: isDarkMode
            ? isStudy
              ? "#0f172a"
              : "#022c22"
            : isStudy
              ? "#f8fafc"
              : "#f0fdf4",
        }}
        handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 50 }}
      >
        <BottomSheetView className="p-4">
          {/* 1. السويتش (مبدل مهمة/عادة) */}
          <View
            className={`flex-row p-1.5 rounded-2xl mb-6 ${isDarkMode ? (isStudy ? "bg-study-dark-accent/60" : "bg-coding-dark-accent/60") : "bg-gray-100"}`}
          >
            <TouchableOpacity
              onPress={() => setType("task")}
              className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-2 ${type === "task" ? isDarkMode ? (isStudy ? "bg-study-dark-primary" : "bg-coding-dark-primary") : isStudy ? "bg-study-primary" : "bg-coding-primary" : ""}`}
            >
              <Text
                className={`font-bold ${type === "task" ? "text-white" : "text-gray-400"}`}
              >
                مهمة
              </Text>
              <CheckCircle2
                size={20}
                color={type === "task" ? "white" : "#9CA3AF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType("habit")}
              className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-3 ${type === "habit" ? isDarkMode ? (isStudy ? "bg-study-dark-primary" : "bg-coding-dark-primary") : isStudy ? "bg-study-primary" : "bg-coding-primary" : ""}`}
            >
              <Text
                className={`font-bold ${type === "habit" ? "text-white" : "text-gray-400"}`}
              >
                عادة
              </Text>
              <RefreshCw
                size={20}
                color={type === "habit" ? "white" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          {/* 2. حقل الإدخال */}
          <Text
            className={`font-bold mb-1 ml-1 ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : "text-gray-400"}`}
          >
            عنوان {type === "task" ? "المهمة" : "العادة"}
          </Text>
          <BottomSheetTextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              type === "task" ? "مثلاً: مذاكرة شابتر " : "مثلاً: شرب الماء"
            }
            className={`p-3 rounded-2xl ${isDarkMode ? (isStudy ? "bg-study-dark-primary/30 text-study-dark-primary" : "bg-coding-dark-primary/30 text-coding-dark-primary") : isStudy ? "bg-violet-50 border-transparent text-study-primary" : "bg-green-100 border-transparent text-coding-primary"} text-right font-bold mb-4`}
            placeholderTextColor="#9CA3AF"
          />

          {/* 3. القسم المتغير (وصف المهمة | وصف العادة) */}
          <Text
            className={`font-bold mb-1 ml-1 ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : "text-gray-400"}`}
          >
            وصف {type === "task" ? "المهمة" : "العادة"} (اختياري)
          </Text>
          <BottomSheetTextInput
            value={description}
            onChangeText={setDescription}
            placeholder={
              type === "task"
                ? "مثلاً: مذاكرة شابتر 1"
                : "مثلاً: شرب لتر ماء يومياً"
            }
            className={`p-3 rounded-2xl ${isDarkMode ? (isStudy ? "bg-study-dark-primary/30 text-study-dark-primary" : "bg-coding-dark-primary/30 text-coding-dark-primary") : isStudy ? "bg-violet-50 border-transparent text-study-primary" : "bg-green-100 border-transparent text-coding-primary"} font-bold mb-4`}
            placeholderTextColor="#9CA3AF"
          />

          <View
            className={`flex-row justify-between items-center rounded-2xl p-3 mb-4 ${isDarkMode ? (isStudy ? " bg-study-dark-primary/30" : " bg-coding-dark-primary/30") : isStudy ? " bg-violet-50" : " bg-green-100"}`}
          >
            <View className="flex-1 pr-2">
              <Text
                className={`text-sm mb-1 ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : isStudy ? "text-study-primary" : "text-coding-primary"}`}
              >
                التاريخ
              </Text>
              <Text
                className={`font-bold text-center ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : "text-gray-800"}`}
              >
                {selectedDate.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View
              className={`flex-1 pl-2 border-l ${isDarkMode ? (isStudy ? "border-study-dark-primary/30" : "border-gray-200") : isStudy ? "border-study-primary" : "border-coding-primary"}`}
            >
              <Text
                className={`text-sm mb-1 ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : "text-gray-400"}`}
              >
                الوقت المحدد
              </Text>
              <Text
                className={`font-bold text-center ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : "text-gray-800"}`}
              >
                {selectedIsDuration ? `مدة: ${selectedTime}` : selectedTime}
              </Text>
            </View>
          </View>
          {/* 3. اختيار الأولوية */}
          {type === "habit" && (
            <View className="mb-3">
              <Text
                className={`font-bold mb-1 ml-1 ${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : "text-gray-400"}`}
              >
                مستوى الأولوية
              </Text>
              <View className="flex-row justify-between">
                {[
                  { value: "low", label: "منخفض" },
                  { value: "medium", label: "متوسط" },
                  { value: "high", label: "عالي" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() =>
                      setPriority(item.value as "low" | "medium" | "high")
                    }
                    className={`flex-1 px-3 py-2 mx-1 rounded-2xl items-center border ${
                      priority === item.value
                        ? `border-transparent ${isDarkMode ? (isStudy ? "bg-study-dark-primary" : "bg-coding-dark-primary") : isStudy ? "bg-study-primary" : "bg-coding-primary"} text-white`
                        : `${isDarkMode ? (isStudy ? "border-study-dark-primary/30 bg-study-dark-primary/30" : "border-coding-dark-primary/30 bg-coding-dark-primary/30") : isStudy ? "border-study-primary/30 bg-study-accent/30" : " border-coding-primary/30 bg-coding-accent/30"} text-gray-600`
                    }`}
                  >
                    <Text
                      className={`${priority === item.value ? "text-white" : isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : "text-gray-600"}`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 4. القسم المتغير (تاريخ للمهمة | أيقونة للعادة) */}
          {(type === "task" || type === "habit") && (
            <View className="mb-3">
              <View className="rounded-3xl">
                <Pressable
                  onPress={() => dateSheetRef.current?.present()}
                  className={`p-4 items-center flex-row gap-2 justify-center rounded-2xl mb-3 ${isDarkMode ? (isStudy ? "bg-study-dark-primary/30" : "bg-coding-dark-primary/30") : isStudy ? "bg-study-accent" : "bg-coding-accent"}`}
                >
                  <Text
                    className={`${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : isStudy ? "text-study-primary" : "text-coding-primary"} font-bold text-center`}
                  >
                    اختيار تاريخ {type === "task" ? "المهمة" : "العادة"}
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
                    />
                </Pressable>
                <Pressable
                  onPress={() => timeSheetRef.current?.present()}
                  className={`p-4 items-center flex-row gap-2 justify-center rounded-2xl ${isDarkMode ? (isStudy ? "bg-study-dark-primary/30" : "bg-coding-dark-primary/30") : isStudy ? "bg-study-accent" : "bg-coding-accent"}`}
                >
                  <Text
                    className={`${isDarkMode ? (isStudy ? "text-study-dark-primary" : "text-coding-dark-primary") : isStudy ? "text-study-primary" : "text-coding-primary"} font-bold text-center`}
                  >
                    اختيار وقت {type === "task" ? "المهمة" : "العادة"}
                    {selectedIsDuration ? ` (مدة: ${selectedTime})` : ""}
                  </Text>
                  <Clock1
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
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* 4. زر الحفظ */}
          <TouchableOpacity
            onPress={() => {
              if (title.trim()) {
                if (type === "task") {
                  const dueDate = new Date(selectedDate);
                  if (selectedTime && !selectedIsDuration) {
                    const [hourText, minuteText] = selectedTime.split(":");
                    const hour = parseInt(hourText, 10);
                    const minute = parseInt(minuteText, 10);
                    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
                      dueDate.setHours(hour, minute, 0, 0);
                    }
                  }

                  AddTask({
                    title: title.trim(),
                    description: description.trim(),
                    completed: false,
                    dueDate: dueDate.getTime(),
                  });
                } else {
                  AddHabit({
                    title: title.trim(),
                    description: description.trim(),
                    streak: 0,
                    priority,
                  });
                }
                setTitle("");
                setDescription("");
                setPriority("medium");
                setSelectedDate(new Date());
                setSelectedTime(
                  new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                );
                setSelectedIsDuration(false);
                (ref as React.RefObject<BottomSheet>)?.current?.close();
              }
            }}
            className={`w-full py-4 rounded-[20px] items-center mt-4 ${isDarkMode ? (isStudy ? "bg-study-dark-primary shadow-indigo-200" : "bg-coding-dark-primary shadow-emerald-200") : isStudy ? "bg-study-primary shadow-indigo-200" : "bg-coding-primary shadow-emerald-200"}`}
            style={{ elevation: 5 }}
          >
            <Text className="text-white font-black text-lg">
              إضافة {type === "task" ? "المهمة" : "العادة"}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
        <DateSheet
          ref={dateSheetRef}
          initialDate={selectedDate}
          onSave={(date) => {
            setSelectedDate(new Date(date));
          }}
        />
        <TimeSheet
          ref={timeSheetRef}
          initialTimeValue={selectedTime}
          initialIsDuration={selectedIsDuration}
          onSave={(timeValue, isDuration) => {
            setSelectedTime(timeValue || selectedTime);
            setSelectedIsDuration(isDuration);
          }}
        />
      </BottomSheet>
    );
  },
);
AddTaskSheet.displayName = "AddTaskSheet";
