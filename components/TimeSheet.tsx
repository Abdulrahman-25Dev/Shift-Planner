import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useAppStore } from "../store/useAppStore";
import { useModeTheme, useModeClasses } from "@/src/theme";
import { useTranslation } from "react-i18next";

interface TimeSheetProps {
  onSave: (timeValue: string) => void;
  initialTimeValue?: string;
}

const ITEM_HEIGHT = 50;
const HOURS_12 = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const TimeSheet = forwardRef<BottomSheetModal, TimeSheetProps>(
  ({ onSave, initialTimeValue }, ref) => {
    const hourRef = useRef<FlashListRef<string>>(null);
    const minuteRef = useRef<FlashListRef<string>>(null);

    const parseTime = (val?: string) => {
      const value =
        val && val.length > 0
          ? val
          : new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
      const parts = value.split(":");
      const hour24 = parseInt(parts[0] || "0", 10);
      const pm = hour24 >= 12;
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const h = String(hour12).padStart(2, "0");
      const m = parts[1] && MINUTES.includes(parts[1]) ? parts[1] : "00";
      return { h, m, pm };
    };

    const initialParsed = parseTime(initialTimeValue);
    const [selectedHour, setSelectedHour] = useState(initialParsed.h);
    const [selectedMinute, setSelectedMinute] = useState(initialParsed.m);
    const [isPM, setIsPM] = useState(initialParsed.pm);

    // مزامنة الحالة وموضع العجلات من وقت العنصر المحفوظ (أو الوقت الحالي)
    const syncFromInitial = useCallback(() => {
      const p = parseTime(initialTimeValue);
      setSelectedHour(p.h);
      setSelectedMinute(p.m);
      setIsPM(p.pm);

      setTimeout(() => {
        const hourIndex = HOURS_12.indexOf(p.h);
        const minuteIndex = MINUTES.indexOf(p.m);
        hourRef.current?.scrollToOffset({
          offset: hourIndex * ITEM_HEIGHT,
          animated: false,
        });
        minuteRef.current?.scrollToOffset({
          offset: minuteIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }, [initialTimeValue]);

    useEffect(() => {
      syncFromInitial();
    }, [syncFromInitial]);

    const prevHourRef = useRef(selectedHour);
    useEffect(() => {
      const prev = prevHourRef.current;
      if (prev === "12" && selectedHour !== "12") {
        setIsPM(true);
      } else if (selectedHour === "12" && prev !== "12") {
        setIsPM(false);
      }
      prevHourRef.current = selectedHour;
    }, [selectedHour]);

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

    const primaryColor = isDarkMode ? palette.interactive : palette.header;
    const placeholderColor = isDarkMode ? "#94a3b8" : "#9CA3AF";
    const sheetBgClass = isDarkMode ? mc.darkCard : "bg-white";
    const accentText = isDarkMode ? mc.darkInteractiveText : mc.textHeader;
    const activePill = isDarkMode ? mc.darkInteractive : mc.headerBg;
    const activePillText = isDarkMode ? mc.textHeader : "text-white";
    const confirmBtn = isDarkMode ? mc.darkInteractive : mc.headerBg;
    const confirmBtnText = isDarkMode ? mc.textHeader : "text-white";

    const to24Hour = (h12: string, pm: boolean): string => {
      const num = parseInt(h12, 10);
      if (pm) {
        return String(num === 12 ? 12 : num + 12).padStart(2, "0");
      }
      return String(num === 12 ? 0 : num).padStart(2, "0");
    };

    const getHourItemLayout = (_data: string[] | null, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT + ITEM_HEIGHT * index,
      index,
    });

    const getMinuteItemLayout = (_data: string[] | null, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT + ITEM_HEIGHT * index,
      index,
    });

    const handleConfirm = () => {
      const h24 = to24Hour(selectedHour, isPM);
      onSave(`${h24}:${selectedMinute}`);
      (ref as any).current?.dismiss();
    };

    const updateHourSelection = (offsetY: number) => {
      const clamped = Math.max(0, offsetY);
      const index = Math.round(clamped / ITEM_HEIGHT);
      const clampedIndex = Math.min(index, HOURS_12.length - 1);
      setSelectedHour(HOURS_12[clampedIndex]);
    };

    const updateMinuteSelection = (offsetY: number) => {
      const clamped = Math.max(0, offsetY);
      const index = Math.round(clamped / ITEM_HEIGHT);
      const clampedIndex = Math.min(index, MINUTES.length - 1);
      setSelectedMinute(MINUTES[clampedIndex]);
    };

    const onHourScrollEnd = (e: any) =>
      updateHourSelection(e.nativeEvent.contentOffset.y);
    const onHourDragEnd = (e: any) =>
      updateHourSelection(e.nativeEvent.contentOffset.y);
    const onMinuteScrollEnd = (e: any) =>
      updateMinuteSelection(e.nativeEvent.contentOffset.y);
    const onMinuteDragEnd = (e: any) =>
      updateMinuteSelection(e.nativeEvent.contentOffset.y);

    const selectHour = (item: string) => {
      setSelectedHour(item);
      hourRef.current?.scrollToOffset({
        offset: HOURS_12.indexOf(item) * ITEM_HEIGHT,
        animated: true,
      });
    };

    const selectMinute = (item: string) => {
      setSelectedMinute(item);
      minuteRef.current?.scrollToOffset({
        offset: MINUTES.indexOf(item) * ITEM_HEIGHT,
        animated: true,
      });
    };

    const renderHourItem = useCallback(
      ({ item }: { item: string }) => {
        const isSelected = item === selectedHour;
        return (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => selectHour(item)}
            style={{
              height: ITEM_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: isSelected ? 20 : 16,
                fontWeight: isSelected ? "800" : "400",
                color: isSelected ? primaryColor : placeholderColor,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      },
      [selectedHour, primaryColor, placeholderColor],
    );

    const renderMinuteItem = useCallback(
      ({ item }: { item: string }) => {
        const isSelected = item === selectedMinute;
        return (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => selectMinute(item)}
            style={{
              height: ITEM_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: isSelected ? 20 : 16,
                fontWeight: isSelected ? "800" : "400",
                color: isSelected ? primaryColor : placeholderColor,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      },
      [selectedMinute, primaryColor, placeholderColor],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["75%"]}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        enableContentPanningGesture={false}
        onChange={(index) => {
          if (index >= 0) {
            syncFromInitial();
          }
        }}
        backgroundStyle={{
          backgroundColor: isDarkMode ? palette.card : "#FFFFFF",
        }}
      >
        <BottomSheetView className={`flex-1 p-5 ${sheetBgClass}`}>
          <Text
            className={`text-lg font-black mb-4 px-3 ${isDarkMode ? "text-gray-100" : "text-gray-900"} ${language === "ar" ? "text-left" : "text-right"}`}
          >
            {t("add.Set time")}
          </Text>

          <View className="mb-2" />

          <View className="mb-4">
            <View
              style={{
                height: ITEM_HEIGHT * 3,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
              className={`${isDarkMode ? "rounded-2xl border border-gray-700 bg-gray-900" : "bg-white rounded-2xl border border-gray-100"}`}
            >
              <View
                style={{
                  position: "absolute",
                  top: ITEM_HEIGHT,
                  left: 8,
                  right: 8,
                  height: ITEM_HEIGHT,
                  backgroundColor: primaryColor,
                  opacity: 0.08,
                  borderRadius: 8,
                }}
              />
              
              <View style={{ flex: 1 }}>
                <FlashList
                  ref={minuteRef}
                  data={MINUTES}
                  renderItem={renderMinuteItem}
                  getItemLayout={getMinuteItemLayout}
                  {...{ estimatedItemSize: ITEM_HEIGHT }}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingTop: ITEM_HEIGHT,
                    paddingBottom: ITEM_HEIGHT,
                  }}
                  onMomentumScrollEnd={onMinuteScrollEnd}
                  onScrollEndDrag={onMinuteDragEnd}
                />
              </View>
              <View style={{ paddingHorizontal: 4 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: primaryColor,
                  }}
                >
                  :
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <FlashList
                  ref={hourRef}
                  data={HOURS_12}
                  renderItem={renderHourItem}
                  getItemLayout={getHourItemLayout}
                  {...{ estimatedItemSize: ITEM_HEIGHT }}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingTop: ITEM_HEIGHT,
                    paddingBottom: ITEM_HEIGHT,
                  }}
                  onMomentumScrollEnd={onHourScrollEnd}
                  onScrollEndDrag={onHourDragEnd}
                />
              </View>
            </View>

            <View className="flex-row justify-center mt-3">
              <TouchableOpacity
                onPress={() => setIsPM(false)}
                className={`px-5 py-2 rounded-xl mx-1 ${!isPM ? activePill : isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <Text
                  className={`font-bold ${!isPM ? activePillText : isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                >
                  {language === "ar" ? "ص" : "AM"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsPM(true)}
                className={`px-5 py-2 rounded-xl mx-1 ${isPM ? activePill : isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <Text
                  className={`font-bold ${isPM ? activePillText : isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                >
                  {language === "ar" ? "م" : "PM"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-auto">
            <View
              className={
                " justify-between items-center mb-4 px-3 " +
                (language === "ar" ? " flex-row" : " flex-row-reverse")
              }
            >
              <Text
                className={`${isDarkMode ? "text-gray-300" : "text-gray-500"} font-bold`}
              >
                {t("add.Selected time")} :
              </Text>
              <Text
                className={`font-black ${accentText}`}
              >
                {`${selectedHour}:${selectedMinute} ${isPM ? "PM" : "AM"}`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`py-4 rounded-2xl items-center shadow-lg ${confirmBtn}`}
            >
              <Text className={`${confirmBtnText} font-black text-lg`}>
                {t("add.Confirm time")}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default TimeSheet;

TimeSheet.displayName = "TimeSheet";
