import React, { useCallback, useMemo, useState, forwardRef } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { CheckCircle2, Clock1, RefreshCw } from "lucide-react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useAppStore } from "../store/useAppStore";
import DateClockSheet from "./DateClockSheet";

export const AddTaskSheet = forwardRef(
  (props: any, ref: React.Ref<BottomSheetModal>) => {
    const [type, setType] = useState<"task" | "habit">("task"); // التحكم بنوع الإضافة
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(
      "medium",
    );

    const clockSheetRef = React.useRef<BottomSheetModal>(null);
    const [selectedDate, setSelectedDate] = useState<string>(
      new Date().toISOString().split("T")[0],
    );
    const isStudy = props.mode === "study";
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
        backgroundStyle={{ borderRadius: 40, backgroundColor: "#F8F9FE" }}
        handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 50 }}
      >
        <BottomSheetView className="p-4">
          {/* 1. السويتش (مبدل مهمة/عادة) */}
          <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-6">
            <TouchableOpacity
              onPress={() => setType("task")}
              className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-2 ${type === "task" ? (isStudy ? "bg-study-primary" : "bg-coding-primary") : ""}`}
            >
              <Text
                className={`font-bold ${type === "task" ? "text-white" : "text-gray-500"}`}
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
              className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-3 ${type === "habit" ? (isStudy ? "bg-study-primary" : "bg-coding-primary") : ""}`}
            >
              <Text
                className={`font-bold ${type === "habit" ? "text-white" : "text-gray-500"}`}
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
          <Text className="text-gray-400 font-bold mb-1 ml-1">
            عنوان {type === "task" ? "المهمة" : "العادة"}
          </Text>
          <BottomSheetTextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              type === "task" ? "مثلاً: مذاكرة شابتر " : "مثلاً: شرب الماء"
            }
            className="bg-white p-3 rounded-2xl border border-gray-100 text-right font-bold text-gray-800 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* 3. القسم المتغير (وصف المهمة | وصف العادة) */}
          <Text className="text-gray-400 font-bold mb-1 ml-1">
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
            className="bg-white p-3 rounded-2xl border border-gray-100 text-right font-bold text-gray-800 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* 3. اختيار الأولوية */}
          {type === "habit" && (
            <View className="mb-3">
              <Text className="text-gray-400 font-bold mb-1 ml-1 text-right">
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
                        ? `border-transparent ${isStudy ? "bg-study-primary" : "bg-coding-primary"} text-white`
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`${priority === item.value ? "text-white" : "text-gray-600"}`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 4. القسم المتغير (تاريخ للمهمة | أيقونة للعادة) */}
          {type === "task" ? (
            <View className="mb-3">
              <View className="rounded-3xl overflow-hidden bg-white border border-gray-100">
                <Pressable
                  onPress={() => clockSheetRef.current?.present()}
                  className={`p-4 items-center flex-row gap-2 justify-center bg-blue-100 rounded-2xl mb-4`}
                >
                  <Text className="text-blue-600 font-bold text-center">
                    اختيار وقت المهمة
                  </Text>
                  <Clock1 size={20} color="#3B82F6" />
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={() => {}}
                className={`p-4 items-center flex-row gap-2 justify-center bg-blue-100 rounded-2xl mb-4`}
              >
                <Text className="text-blue-600 font-bold text-center">
                  اختيار وقت العادة
                </Text>
                <Clock1 size={20} color="#3B82F6" />
              </Pressable>
            </View>
          )}

          {/* 4. زر الحفظ */}
          <TouchableOpacity
            onPress={() => {
              if (title.trim()) {
                if (type === "task") {
                  AddTask({
                    title: title.trim(),
                    description: description.trim(),
                    completed: false,
                    dueDate: new Date(selectedDate).getTime(),
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
                setSelectedDate(new Date().toISOString().split("T")[0]);
                (ref as React.RefObject<BottomSheet>)?.current?.close();
              }
            }}
            className={`w-full py-4 rounded-[20px] items-center mt-4 ${isStudy ? "bg-study-primary shadow-indigo-200" : "bg-coding-primary shadow-emerald-200"}`}
            style={{ elevation: 5 }}
          >
            <Text className="text-white font-black text-lg">
              إضافة {type === "task" ? "المهمة" : "العادة"}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
        <DateClockSheet
          ref={clockSheetRef}
          initialDate={new Date(selectedDate)}
          onSave={(date) => {
            setSelectedDate(date.toISOString().split("T")[0]);
          }}
        />
      </BottomSheet>
    );
  },
);
AddTaskSheet.displayName = "AddTaskSheet";
