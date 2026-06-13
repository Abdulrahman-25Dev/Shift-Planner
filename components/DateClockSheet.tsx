import React, { forwardRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Calendar } from "react-native-calendars";
import { useAppStore } from "../store/useAppStore";

interface DateClockSheetProps {
  onSave: (date: Date) => void;
  initialDate?: Date;
}

const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DateClockSheet = forwardRef<BottomSheetModal, DateClockSheetProps>(
  (
    { onSave, initialDate },
    ref,
  ) => {
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

    const { mode: appMode, isDarkMode } = useAppStore();

    const isStudy = appMode === "study";

    const handleConfirm = () => {
      onSave(tempDate);
      (ref as any).current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["75%"]}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        backgroundStyle={{
          backgroundColor: isDarkMode
            ? isStudy
              ? "#0f172a"
              : "#022c22"
            : "#ffffff",
        }}
      >
        <BottomSheetView
          className={`flex-1 p-5 ${isDarkMode ? (isStudy ? "bg-study-dark-bg" : "bg-coding-dark-bg") : "bg-white"}`}
        >
          <View
            className={`flex-row-reverse p-1 rounded-2xl mb-6 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
          >
            <TouchableOpacity
              onPress={() => setMode("date")}
              className={`flex-1 py-3 rounded-xl items-center ${mode === "date" ? (isDarkMode ? "bg-gray-700" : "bg-white shadow-sm") : ""}`}
            >
              <Text
                className={`font-bold ${mode === "date" ? (isStudy ? "text-study-primary" : "text-coding-primary/80") : isDarkMode ? "text-gray-300" : "text-gray-500"}`}
              >
                التاريخ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("time")}
              className={`flex-1 py-3 rounded-xl items-center ${mode === "time" ? (isDarkMode ? "bg-gray-700" : "bg-white shadow-sm") : ""}`}
            >
              <Text
                className={`font-bold ${mode === "time" ? (isStudy ? "text-study-primary" : "text-coding-primary/80") : isDarkMode ? "text-gray-300" : "text-gray-500"}`}
              >
                الوقت
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            {mode === "date" ? (
              <Calendar
                current={formatDateString(tempDate)}
                onDayPress={(day) => {
                  const newDate = new Date(tempDate);
                  newDate.setFullYear(day.year, day.month - 1, day.day);
                  setTempDate(newDate);
                }}
                markedDates={{
                  [formatDateString(tempDate)]: {
                    selected: true,
                    selectedColor: isStudy
                      ? isDarkMode
                        ? "#818cf8"
                        : "#4F46E5"
                      : isDarkMode
                        ? "#34d399"
                        : "#047857",
                  },
                }}
                theme={{
                  calendarBackground: isDarkMode
                    ? isStudy
                      ? "#0f172a"
                      : "#022c22"
                    : "#ffffff",
                  todayTextColor: isStudy ? "#4F46E5" : "#047857",
                  dayTextColor: isDarkMode ? "#e2e8f0" : "#0f172a",
                  textSectionTitleColor: isDarkMode ? "#94a3b8" : "#64748b",
                  monthTextColor: isDarkMode
                    ? "#e2e8f0"
                    : isStudy
                      ? "#4F46E5"
                      : "#047857",
                  arrowColor: isDarkMode
                    ? "#e2e8f0"
                    : isStudy
                      ? "#4F46E5"
                      : "#047857",
                  selectedDayTextColor: "#ffffff",
                  textDisabledColor: isDarkMode ? "#64748b" : "#9ca3af",
                }}
              />
            ) : (
              <View />
            )}
          </View>

          <View className="mt-auto">
            <View className="flex-row justify-between items-center mb-4 px-2">
              <Text className="text-gray-500 font-bold">الموعد:</Text>
              <Text
                className={`font-black ${isStudy ? "text-study-primary" : "text-coding-primary"}`}
              >
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
