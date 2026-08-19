import React, { useCallback, useMemo, useState, forwardRef } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { CheckCircle2, Clock10, RefreshCw, Calendar } from "lucide-react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useAppStore } from "../store/useAppStore";
import { useModeTheme, useModeClasses } from "@/src/theme";
import { useTranslation } from "react-i18next";
import DateSheet from "../components/DateSheet";
import TimeSheet from "../components/TimeSheet";

export const AddTaskSheet = forwardRef(
  (props: any, ref: React.Ref<BottomSheetModal>) => {
    const [type, setType] = useState<"task" | "habit">("task"); // التحكم بنوع الإضافة
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [descHeight, setDescHeight] = useState(0);
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "none">(
      "none",
    );
    const { t } = useTranslation();

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
    const [repeatType, setRepeatType] = useState<"daily" | "weekly" | "custom" | undefined>();
    const [repeatDays, setRepeatDays] = useState<string[] | undefined>();
    const { addTask, addHabit, isDarkMode, language } = useAppStore();
    const { palette } = useModeTheme();
    const mc = useModeClasses();

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

    const inputBg = isDarkMode
      ? `${mc.darkAccentSoft} ${mc.darkInteractiveText}`
      : `${mc.accentSoft} ${mc.textHeader}`;
    const labelText = isDarkMode ? mc.darkInteractiveText : "text-gray-500";
    const activePill = isDarkMode ? mc.darkInteractive : mc.headerBg;
    const activePillText = isDarkMode ? mc.textHeader : "text-white";
    const pillTrack = isDarkMode ? mc.darkAccentSoft : "bg-gray-100";
    const unselectedPill = isDarkMode
      ? `${mc.darkInteractiveBorder30} ${mc.darkAccentSoft}`
      : `${mc.accentBorder} ${mc.accentBg30}`;
    const iconColor = palette.accentText;

    return (
      <BottomSheet
        ref={ref}
        index={-1} // مخفي في البداية
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          borderRadius: 40,
          backgroundColor: isDarkMode ? palette.card : "#FFFFFF",
        }}
        handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 50 }}
      >
        <BottomSheetView className="p-4">
          {/* 1. السويتش (مبدل مهمة/عادة) */}
          <View
            className={`flex-row p-1.5 rounded-2xl mb-6 ${pillTrack}`}
          >
            <TouchableOpacity
              onPress={() => setType("task")}
              className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-2 ${type === "task" ? activePill : ""}`}
            >
              <Text
                className={`font-bold ${type === "task" ? activePillText : "text-gray-400"}`}
              >
                {t("add.task")}
              </Text>
              <CheckCircle2
                size={20}
                color={type === "task" ? (isDarkMode ? palette.onInteractive : "#FFFFFF") : "#9CA3AF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType("habit")}
              className={`flex-1 py-3 gap-2 rounded-xl items-center justify-center flex-row space-x-3 ${type === "habit" ? activePill : ""}`}
            >
              <Text
                className={`font-bold ${type === "habit" ? activePillText : "text-gray-400"}`}
              >
                {t("add.habit")}
              </Text>
              <RefreshCw
                size={20}
                color={type === "habit" ? (isDarkMode ? palette.onInteractive : "#FFFFFF") : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          {/* 2. حقل الإدخال */}
          <Text
            className={`font-bold px-3 mb-1 ml-1 ${labelText} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {type === "task"
              ? t("details.title task")
              : t("details.title habit")}
          </Text>
          <BottomSheetTextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              type === "task"
                ? t("details.task title placeholder")
                : t("details.habit title placeholder")
            }
            className={`p-3 rounded-2xl ${inputBg} font-bold mb-4`}
            placeholderTextColor="#9CA3AF"
          />

          {/* 3. القسم المتغير (وصف المهمة | وصف العادة) */}
          <Text
            className={`font-bold px-3 mb-1 ml-1 ${labelText} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {type === "task"
              ? t("details.description task")
              : t("details.description habit")}
          </Text>
          <BottomSheetTextInput
            value={description}
            onChangeText={setDescription}
            placeholder={
              type === "task"
                ? t("details.description task placeholder")
                : t("details.description habit placeholder")
            }
            multiline
            textAlignVertical="top"
            onContentSizeChange={(e) =>
              setDescHeight(e.nativeEvent.contentSize.height)
            }
            style={{ minHeight: 48, height: Math.max(48, descHeight) }}
            className={`p-3 rounded-2xl ${inputBg} font-bold mb-4`}
            placeholderTextColor="#9CA3AF"
          />

          <View
            className={`flex-row justify-between items-center rounded-2xl p-3 mb-4 ${
              isDarkMode ? mc.darkAccentSoft : mc.accentSoft
            }`}
          >
            <View className="flex-1 pr-2">
              <Text
                className={`text-sm mb-1 ${labelText} ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("add.Selected date")}
              </Text>
              <Text
                className={`font-bold text-center ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
              >
                {selectedDate.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View
              className={`flex-1 pl-2 border-l ${
                isDarkMode ? mc.darkInteractiveBorder40 : mc.accentBorderFull
              }`}
            >
              <Text
                className={`text-sm mb-1 ${labelText} ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("add.Selected time")}
              </Text>
              <Text
                className={`font-bold text-center ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
              >
                {selectedTime}
              </Text>
            </View>
          </View>
          {/* 3. اختيار الأولوية */}
          {(type === "task" || type === "habit") && (
            <View className="mb-3">
              <Text
                className={`font-bold px-3 mb-1 ml-1 ${labelText} ${language === "ar" ? "text-left" : "text-right"}`}
              >
                {t("details.select priority")}
              </Text>
              <View className="flex-row justify-between">
                {[
                  { value: "none", label: t("priority.none") },
                  { value: "low", label: t("priority.low") },
                  { value: "medium", label: t("priority.medium") },
                  { value: "high", label: t("priority.high") },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() =>
                      setPriority(item.value as "low" | "medium" | "high" | "none")
                    }
                    className={`flex-1 px-3 py-2 mx-1 rounded-2xl items-center border ${
                      priority === item.value
                        ? `border-transparent ${activePill}`
                        : unselectedPill
                    }`}
                  >
                    <Text
                      className={`text-xs ${priority === item.value ? activePillText : isDarkMode ? mc.darkInteractiveText : "text-gray-600"}`}
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
            <View className="flex-row gap-3 mb-6">
              <Pressable
                onPress={() => dateSheetRef.current?.present()}
                className={`flex-1 gap-2 p-3 rounded-2xl items-center justify-center ${
                  isDarkMode ? mc.darkAccentSoft : mc.accentSoft
                }`}
              >
                <Calendar size={20} color={iconColor} />
                <Text
                  className={`font-bold text-center ${isDarkMode ? mc.darkInteractiveText : mc.textHeader}`}
                >
                  {t("add.Set date")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => timeSheetRef.current?.present()}
                className={`flex-1 gap-2 p-3 rounded-2xl items-center justify-center ${
                  isDarkMode ? mc.darkAccentSoft : mc.accentSoft
                }`}
              >
                <Clock10 size={20} color={iconColor} />
                <Text
                  className={`font-bold text-center ${isDarkMode ? mc.darkInteractiveText : mc.textHeader}`}
                >
                  {t("add.Set time")}
                </Text>
              </Pressable>
            </View>
          )}

          {/* 4. زر الحفظ */}
          <TouchableOpacity
            onPress={() => {
              if (title.trim()) {
                if (type === "task") {
                  const dueDate = new Date(selectedDate);
                  if (selectedTime) {
                    const [hourText, minuteText] = selectedTime.split(":");
                    const hour = parseInt(hourText, 10);
                    const minute = parseInt(minuteText, 10);
                    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
                      dueDate.setHours(hour, minute, 0, 0);
                    }
                  }

                  addTask({
                    title: title.trim(),
                    description: description.trim(),
                    completed: false,
                    priority,
                    dueDate: dueDate.getTime(),
                    reminderTime: dueDate.toISOString(),
                  });
                } else {
                  // Build a reminder datetime from selected date + selected time
                  const reminderDate = new Date(selectedDate);
                  if (selectedTime) {
                    const [hourText, minuteText] = selectedTime.split(":");
                    const hour = parseInt(hourText, 10);
                    const minute = parseInt(minuteText, 10);
                    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
                      reminderDate.setHours(hour, minute, 0, 0);
                    }
                  }

                  addHabit({
                    title: title.trim(),
                    description: description.trim(),
                    streak: 0,
                    priority,
                    reminderTime: reminderDate.toISOString(),
                    repeatType,
                    repeatDays,
                  });
                }
                setTitle("");
                setDescription("");
                setPriority("none");
                setSelectedDate(new Date());
                setRepeatType(undefined);
                setRepeatDays(undefined);
                setSelectedTime(
                  new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                );
                (ref as React.RefObject<BottomSheet>)?.current?.close();
              }
            }}
            className={`w-full py-4 rounded-[20px] items-center mt-4 ${activePill}`}
            style={{ elevation: 5 }}
          >
            <Text className={`${activePillText} font-black text-lg`}>
              {type === "task" ? t("add.add task") : t("add.add habit")}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
        <DateSheet
          ref={dateSheetRef}
          type={type}
          initialDate={selectedDate}
          onSave={(date, repeatData) => {
            setSelectedDate(new Date(date));
            if (repeatData) {
              setRepeatType(repeatData.type);
              setRepeatDays(repeatData.days);
            }
          }}
        />
        <TimeSheet
          ref={timeSheetRef}
          initialTimeValue={selectedTime}
          onSave={(timeValue) => {
            setSelectedTime(timeValue || selectedTime);
          }}
        />
      </BottomSheet>
    );
  },
);
AddTaskSheet.displayName = "AddTaskSheet";