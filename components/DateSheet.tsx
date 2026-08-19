import React, { forwardRef, useCallback, useState , useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Calendar } from "react-native-calendars";
import { useAppStore } from "../store/useAppStore";
import { useModeTheme, useModeClasses } from "@/src/theme";
import { useTranslation } from "react-i18next";
import HabitRepeatSelector from "./HabitRepeatSelector";

interface DateSheetProps {
  onSave: (date: Date, repeatData?: { type: "daily" | "weekly" | "custom"; days: string[] }) => void;
  initialDate?: Date;
  type: "task" | "habit";
}

const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DateSheet = forwardRef<BottomSheetModal, DateSheetProps>(
  ({ onSave, initialDate, type }, ref) => {
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

    const repeatSheetRef = useRef<BottomSheetModal>(null);

    const handleOpenRepeatSheet = () => {
      repeatSheetRef.current?.present();
    };

    const isHabit = type === "habit";

    const { isDarkMode, language } = useAppStore();
    const { palette } = useModeTheme();
    const mc = useModeClasses();
    const { t } = useTranslation();

    const selectedColor = isDarkMode ? palette.interactive : palette.header;
    const sheetCardBg = isDarkMode ? palette.card : "#FFFFFF";

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
          backgroundColor: isDarkMode ? sheetCardBg : "#FFFFFF",
        }}
      >
        <BottomSheetView
          className={`flex-1 p-5 ${isDarkMode ? mc.darkCard : "bg-white"}`}
        >
          <Text
            className={`text-lg px-3 font-black mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {t("add.Set date")}
          </Text>

          <Calendar
            minDate={formatDateString(new Date())}
            current={formatDateString(selectedDate)}
            onDayPress={(day) => {
              const next = new Date(selectedDate);
              next.setFullYear(day.year, day.month - 1, day.day);
              setSelectedDate(next);
            }}
            markedDates={{
              [formatDateString(selectedDate)]: {
                selected: true,
                selectedColor,
              },
            }}
            theme={{
              calendarBackground: isDarkMode ? sheetCardBg : "#ffffff",
              todayTextColor: selectedColor,
              dayTextColor: isDarkMode ? "#e2e8f0" : "#0f172a",
              textSectionTitleColor: isDarkMode ? "#94a3b8" : "#64748b",
              monthTextColor: isDarkMode ? "#e2e8f0" : selectedColor,
              arrowColor: isDarkMode ? "#e2e8f0" : selectedColor,
              selectedDayTextColor: "#ffffff",
              textDisabledColor: isDarkMode ? "#64748b" : "#9ca3af",
            }}
          />

          <View className="mt-auto">
            {isHabit ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-2xl items-center border ${mc.accentBorder} ${
                    isDarkMode ? mc.darkAccentSoft : mc.accentBg30
                  }`}
                  onPress={() => {
                    handleOpenRepeatSheet();
                  }}
                >
                  <Text
                    className={`${mc.darkInteractiveText} font-black text-base`}
                  >
                    {t("common.repeat")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  className={`flex-1 py-3 rounded-2xl items-center ${
                    isDarkMode ? mc.darkInteractive : mc.headerBg
                  }`}
                >
                  <Text
                    className={`${
                      isDarkMode ? mc.textHeader : "text-white"
                    } font-black text-base`}
                  >
                    {t("add.Confirm date")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleConfirm}
                className={`py-3 rounded-2xl items-center ${
                  isDarkMode ? mc.darkInteractive : mc.headerBg
                }`}
              >
                <Text
                  className={`${
                    isDarkMode ? mc.textHeader : "text-white"
                  } font-black text-base`}
                >
                  {t("add.Confirm date")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </BottomSheetView>
        <HabitRepeatSelector
          ref={repeatSheetRef} // 👈 مررنا له السلك هنا
          type={type}
          initialDate={selectedDate}
          onSave={(date, repeatData) => {
            onSave(date, repeatData);
          }}
        />
      </BottomSheetModal>
    );
  },
);

export default DateSheet;

DateSheet.displayName = "DateSheet";
