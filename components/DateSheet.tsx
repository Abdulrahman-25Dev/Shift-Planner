import React, { forwardRef, useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Calendar } from "react-native-calendars";
import { useAppStore } from "../store/useAppStore";

interface DateSheetProps {
  onSave: (date: Date) => void;
  initialDate?: Date;
}

const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DateSheet = forwardRef<BottomSheetModal, DateSheetProps>(
  ({ onSave, initialDate }, ref) => {
    const [selectedDate, setSelectedDate] = useState(
      initialDate ? new Date(initialDate) : new Date(),
    );

    React.useEffect(() => {
      if (initialDate) {
        setSelectedDate(new Date(initialDate));
      }
    }, [initialDate]);

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
      onSave(new Date(selectedDate));
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
          <Text
            className={`text-lg font-black mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
          >
            اختيار التاريخ
          </Text>

          <Calendar
            current={formatDateString(selectedDate)}
            onDayPress={(day) => {
              const next = new Date(selectedDate);
              next.setFullYear(day.year, day.month - 1, day.day);
              setSelectedDate(next);
            }}
            markedDates={{
              [formatDateString(selectedDate)]: {
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

          <View className="mt-auto">
            <View className="flex-row justify-between items-center mb-4 px-2">
              <Text className="text-gray-500 font-bold">التاريخ المحدد:</Text>
              <Text
                className={`font-black ${isStudy ? "text-study-accent" : "text-coding-accent"}`}
              >
                {selectedDate.toLocaleDateString("en-US", {
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
              <Text className="text-white font-black text-lg">
                تأكيد التاريخ
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default DateSheet;

DateSheet.displayName = "DateSheet";
