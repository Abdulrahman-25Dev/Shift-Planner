import React, { forwardRef, useCallback, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "@/src/components/ScaledText";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useAppStore } from "../store/useAppStore";
import { useModeTheme, useModeClasses } from "@/src/theme";
import { useTranslation } from "react-i18next";

interface DateSheetProps {
  onSave: (date: Date, repeatData?: { type: 'daily' | 'weekly' | 'custom', days: string[] }) => void;
  initialDate?: Date;
  type: 'task' | 'habit';
}

const HabitRepeatSelector = forwardRef<BottomSheetModal, DateSheetProps>(
  ({ onSave, initialDate, type }, ref) => {
    const [selectedDate, setSelectedDate] = useState(
      initialDate ? new Date(initialDate) : new Date(),
    );

    // الستيتات الخاصة بالتكرار والأيام
    const [repeatInterval, setRepeatInterval] = useState<'daily' | 'weekly' | 'custom'>('daily');
    const [selectedDays, setSelectedDays] = useState<string[]>(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);

    const isHabit = type === 'habit';

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

    const { isDarkMode, language } = useAppStore();
    const { palette } = useModeTheme();
    const mc = useModeClasses();
    const { t } = useTranslation();

    // تلوين العناصر النشطة حسب المود
    const activeBtnClass = isDarkMode
      ? `${mc.darkInteractive} ${mc.darkInteractiveBorder}`
      : `${mc.headerBg} ${mc.headerBorder}`;
    const activeBtnText = isDarkMode ? mc.textHeader : "text-white";
    const tabTrack = isDarkMode ? mc.darkAccentSoft : mc.accentSoft;
    const accentText = isDarkMode ? mc.darkInteractiveText : mc.textHeader;

    const daysOfWeek = language === "ar" 
      ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      
    const daysKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    // التعامل مع ضغط الأيام ديناميكياً
    const handleDayPress = (dayKey: string) => {
      if (repeatInterval === 'weekly') {
        setSelectedDays([dayKey]); // يوم واحد فقط في الأسبوع
      } else if (repeatInterval === 'custom') {
        if (selectedDays.includes(dayKey)) {
          setSelectedDays(selectedDays.filter(d => d !== dayKey));
        } else {
          setSelectedDays([...selectedDays, dayKey]); // اختيار متعدد بحرية
        }
      }
    };

    // تحويل التابات وتحديث الأيام تلقائياً معها
    const handleIntervalChange = (type: 'daily' | 'weekly' | 'custom') => {
      setRepeatInterval(type);
      if (type === 'daily') {
        setSelectedDays(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
      } else if (type === 'weekly') {
        // نختار أول يوم كافتراضي عشان ما يظل فارغ
        setSelectedDays([daysKeys[new Date().getDay()]]); 
      } else {
        setSelectedDays([]); // تصفير لتسهيل الاختيار المخصص
      }
    };

    const handleConfirm = () => {
      onSave(
        new Date(selectedDate), 
        isHabit ? { type: repeatInterval, days: selectedDays } : undefined
      );
      (ref as any).current?.dismiss();
    };

    // تنسيق وعرض التاريخ المحدد الحالي
    const formattedDateDisplay = selectedDate.toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-US', 
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    // 💡 تغيير نص العنوان الفرعي للأيام ديناميكياً حسب التاب المختار
    const getDaysSectionTitle = () => {
      if (language === "ar") {
        if (repeatInterval === "daily") return "أيام التكرار (كل الأيام)";
        if (repeatInterval === "weekly") return "تكرار في يوم معين من الأسبوع";
        return "الأيام المخصصة";
      } else {
        if (repeatInterval === "daily") return "Repeat Days (All Days)";
        if (repeatInterval === "weekly") return "Repeat on a Specific Day";
        return "Custom Selected Days";
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        // صغرنا حجم السناب بوينت لأننا شلنا التقويم والميلادي الطويل وصار جداً ملموم وفخم
        snapPoints={isHabit ? ["52%"] : ["35%"]}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        backgroundStyle={{
          backgroundColor: isDarkMode ? palette.card : "#FFFFFF",
        }}
      >
        <BottomSheetView
          className={`flex-1 p-6 ${isDarkMode ? mc.darkCard : "bg-white"}`}
        >
          {/* العنوان الرئيسي العلوي متعدل بالملي */}
          <Text
            className={`text-xl font-black mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {isHabit 
              ? (language === "ar" ? "تعيين عدد التكرار" : "Set Repeat Count")
              : t("add.Set date")
            }
          </Text>

          {/* سطر التاريخ المحدد الحالي */}
          <View className={`flex-row mb-6 justify-start ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {language === "ar" ? "التاريخ المحدد : " : "Selected Date: "}
            </Text>
            <Text className={`text-sm font-black ${accentText} mx-2`}>
              {formattedDateDisplay}
            </Text>
          </View>

          {/* ================= قسم العادات والتكرار ================= */}
          {isHabit && (
            <View className="w-full">
              <Text className={`text-sm mb-3 font-black ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} ${language === "ar" ? "text-left" : "text-right"}`}>
                {language === "ar" ? "نمط تكرار العادة" : "Habit Repeat Pattern"}
              </Text>

              {/* التابات المحدثة (يومياً | أسبوعياً | مخصص) نفس الصورة بالملي */}
              <View className={` p-1.5 ${tabTrack} rounded-2xl mb-6 ${language === "ar" ? "flex-row" : "flex-row-reverse"}`}>
                <TouchableOpacity 
                  onPress={() => handleIntervalChange('daily')}
                  className={`flex-1 py-3 rounded-xl items-center justify-center ${repeatInterval === 'daily' ? activeBtnClass : 'bg-transparent'}`}
                >
                  <Text className={`text-sm font-black ${repeatInterval === 'daily' ? activeBtnText : 'text-slate-400'}`}>
                    {language === "ar" ? "يومياً" : "Daily"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleIntervalChange('weekly')}
                  className={`flex-1 py-3 rounded-xl items-center justify-center ${repeatInterval === 'weekly' ? activeBtnClass : 'bg-transparent'}`}
                >
                  <Text className={`text-sm font-black ${repeatInterval === 'weekly' ? activeBtnText : 'text-slate-400'}`}>
                    {language === "ar" ? "أسبوعياً" : "Weekly"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleIntervalChange('custom')}
                  className={`flex-1 py-3 rounded-xl items-center justify-center ${repeatInterval === 'custom' ? activeBtnClass : 'bg-transparent'}`}
                >
                  <Text className={`text-sm font-black ${repeatInterval === 'custom' ? activeBtnText : 'text-slate-400'}`}>
                    {language === "ar" ? "مخصص" : "Custom"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* عنوان الأيام المتغير ديناميكياً حسب التاب المختار */}
              <Text className={`text-sm mb-3 font-black ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} ${language === "ar" ? "text-left" : "text-right"}`}>
                {getDaysSectionTitle()}
              </Text>

              {/* شريط الأيام الدائري الفخم الفردي */}
              <View className={`flex-row justify-between mb-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                {daysOfWeek.map((day, index) => {
                  const dayKey = daysKeys[index];
                  const isSelected = selectedDays.includes(dayKey);
                  const isDisabled = repeatInterval === 'daily'; // قفل يدوي لأن التاب يغطيها بالكامل

                  return (
                    <TouchableOpacity 
                      key={index}
                      disabled={isDisabled}
                      onPress={() => handleDayPress(dayKey)}
                      activeOpacity={0.7}
                      className={`w-11 h-11 rounded-full items-center justify-center border-2 ${
                        isSelected 
                          ? activeBtnClass 
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200'
                      }`}
                    >
                      <Text className={`text-sm font-black ${isSelected ? activeBtnText : 'text-slate-400'}`}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
          {/* ============================================================== */}

          {/* زر التأكيد السفلي النهائي */}
          <View className="mt-auto w-full">
            <TouchableOpacity
              onPress={handleConfirm}
              className={`w-full py-4 rounded-2xl items-center shadow-lg ${activeBtnClass}`}
            >
              <Text className={`${activeBtnText} font-black text-lg`}>
                {language === "ar" ? "تأكيد التاريخ" : "Confirm Date"}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default HabitRepeatSelector;

HabitRepeatSelector.displayName = "HabitRepeatSelector";