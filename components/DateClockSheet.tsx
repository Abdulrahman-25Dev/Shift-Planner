import React, { forwardRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Calendar } from "react-native-calendars";
import { useAppStore } from "../store/useAppStore"; // تأكد من مسار الستور

interface DateClockSheetProps {
  onSave: (date: Date) => void;
  initialDate?: Date;
}

const DateClockSheet = forwardRef<BottomSheetModal, DateClockSheetProps>(
  ({ onSave, initialDate }, ref) => {
    // استخدام التوقيت الحالي إذا لم يوجد تاريخ ابتدائي
    const [tempDate, setTempDate] = useState(initialDate || new Date());
    const [mode, setMode] = useState<"date" | "time">("date");

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

    const { mode: appMode } = useAppStore();

    const isStudy = appMode === "study";

    // دالة الحفظ التي تضمن إغلاق الشيت
    const handleConfirm = () => {
      onSave(tempDate);
      // إغلاق الشيت يدوياً
      (ref as any).current?.dismiss();
    };

    const handleTimeChange = (hour: number, minute: number) => {
      const newDate = new Date(tempDate);
      newDate.setHours(hour, minute);
      setTempDate(newDate);
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["75%"]}
        backdropComponent={renderBackdrop}
        // هذا السطر يحل مشكلة التعليق في أندرويد عند فتح الكيبورد أو أدوات النظام
        keyboardBehavior="interactive"
      >
        <BottomSheetView className="flex-1 p-5">
          {/* أزرار التبديل العلوية - شكل أحدث */}
          <View className="flex-row-reverse bg-gray-100 p-1 rounded-2xl mb-6">
            <TouchableOpacity
              onPress={() => setMode("date")}
              className={`flex-1 py-3 rounded-xl items-center ${mode === "date" ? "bg-white shadow-sm" : ""}`}
            >
              <Text
                className={`font-bold ${mode === "date" ? isStudy ? "text-study-primary" : "text-coding-primary/80" : "text-gray-500"}`}
              >
                التاريخ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("time")}
              className={`flex-1 py-3 rounded-xl items-center ${mode === "time" ? "bg-white shadow-sm" : ""}`}
            >
              <Text
                className={`font-bold ${mode === "time" ? isStudy ? "text-study-primary" : "text-coding-primary/80" : "text-gray-500"}`}
              >
                الوقت
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            {mode === "date" ? (
              <Calendar
                current={tempDate.toISOString().split("T")[0]}
                onDayPress={(day) => {
                  const newDate = new Date(tempDate);
                  newDate.setFullYear(day.year, day.month - 1, day.day);
                  setTempDate(newDate);
                }}
                markedDates={{
                  [tempDate.toISOString().split("T")[0]]: {
                    selected: true,
                    selectedColor: isStudy ? "#4F46E5" : "#047857",
                  },
                }}
                theme={{
                  calendarBackground: "transparent",
                  todayTextColor: isStudy ? "#4F46E5" : "#047857",
                }}
              />
            ): (
              <View></View>
            )}
          </View>

          {/* ملخص الاختيار بزر التأكيد */}
          <View className="mt-auto">
            <View className="flex-row justify-between items-center mb-4 px-2">
              <Text className="text-gray-500 font-bold">الموعد:</Text>
              <Text className={`font-black ${isStudy ? "text-study-primary" : "text-coding-primary"}`}>
                {tempDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {tempDate.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`py-4 rounded-2xl items-center shadow-lg ${isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
            >
              <Text className="text-white font-black text-lg">تأكيد وحفظ</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default DateClockSheet;

DateClockSheet.displayName = "DateClockSheet";