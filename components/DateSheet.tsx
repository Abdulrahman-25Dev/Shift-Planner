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

    const { mode: appMode } = useAppStore();
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
      >
        <BottomSheetView className="flex-1 p-5">
          <Text className="text-lg font-black mb-4">اختيار التاريخ</Text>

          <Calendar
            current={selectedDate.toISOString().split("T")[0]}
            onDayPress={(day) => {
              const next = new Date(selectedDate);
              next.setFullYear(day.year, day.month - 1, day.day);
              setSelectedDate(next);
            }}
            markedDates={{
              [selectedDate.toISOString().split("T")[0]]: {
                selected: true,
                selectedColor: isStudy ? "#4F46E5" : "#047857",
              },
            }}
            theme={{
              calendarBackground: "transparent",
              todayTextColor: isStudy ? "#4F46E5" : "#047857",
            }}
          />

          <View className="mt-auto">
            <View className="flex-row justify-between items-center mb-4 px-2">
              <Text className="text-gray-500 font-bold">التاريخ المحدد:</Text>
              <Text
                className={`font-black ${isStudy ? "text-study-primary" : "text-coding-primary"}`}
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
