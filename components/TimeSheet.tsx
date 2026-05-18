import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useAppStore } from "../store/useAppStore";

interface TimeSheetProps {
  onSave: (timeValue: string, isDuration: boolean) => void;
  initialTimeValue?: string;
  initialIsDuration?: boolean;
}

const ITEM_HEIGHT = 50;
const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const TimeSheet = forwardRef<BottomSheetModal, TimeSheetProps>(
  ({ onSave, initialTimeValue, initialIsDuration }, ref) => {
    const [isDuration, setIsDuration] = useState(initialIsDuration ?? false);

    const hourRef = useRef<FlashListRef<string>>(null);
    const minuteRef = useRef<FlashListRef<string>>(null);
    const durationHourRef = useRef<FlashListRef<string>>(null);
    const durationMinuteRef = useRef<FlashListRef<string>>(null);

    const parseTime = (val?: string) => {
      const parts = val?.split(":");
      const hour24 = parseInt(parts?.[0] || "0", 10);
      const pm = hour24 >= 12;
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const h = String(hour12).padStart(2, "0");
      const m = parts?.[1] && MINUTES.includes(parts[1]) ? parts[1] : "00";
      return { h, m, pm };
    };

    const initialParsed = parseTime(initialTimeValue);
    const [selectedHour, setSelectedHour] = useState(initialParsed.h);
    const [selectedMinute, setSelectedMinute] = useState(initialParsed.m);
    const [isPM, setIsPM] = useState(initialParsed.pm);

    const parseDuration = (val?: string) => {
      const parts = val?.split(":");
      const h = parts?.[0] && HOURS_12.includes(parts[0]) ? parts[0] : "01";
      const m = parts?.[1] && MINUTES.includes(parts[1]) ? parts[1] : "00";
      return { h, m };
    };

    const initialDurationParsed = parseDuration(initialTimeValue);
    const [durationHour, setDurationHour] = useState(initialDurationParsed.h);
    const [durationMinute, setDurationMinute] = useState(initialDurationParsed.m);

    useEffect(() => {
      setIsDuration(initialIsDuration ?? false);
      const p = parseTime(initialTimeValue);
      setSelectedHour(p.h);
      setSelectedMinute(p.m);
      setIsPM(p.pm);

      const dp = parseDuration(initialTimeValue);
      setDurationHour(dp.h);
      setDurationMinute(dp.m);

      setTimeout(() => {
        if (!(initialIsDuration ?? false)) {
          const hourIndex = HOURS_12.indexOf(p.h);
          const minuteIndex = MINUTES.indexOf(p.m);
          hourRef.current?.scrollToOffset({ offset: hourIndex * ITEM_HEIGHT, animated: false });
          minuteRef.current?.scrollToOffset({ offset: minuteIndex * ITEM_HEIGHT, animated: false });
        } else {
          const dHourIndex = HOURS_12.indexOf(dp.h);
          const dMinuteIndex = MINUTES.indexOf(dp.m);
          durationHourRef.current?.scrollToOffset({ offset: dHourIndex * ITEM_HEIGHT, animated: false });
          durationMinuteRef.current?.scrollToOffset({ offset: dMinuteIndex * ITEM_HEIGHT, animated: false });
        }
      }, 50);
    }, [initialTimeValue, initialIsDuration]);

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

    const { mode: appMode } = useAppStore();
    const isStudy = appMode === "study";

    const to24Hour = (h12: string, pm: boolean): string => {
      const num = parseInt(h12, 10);
      if (pm) {
        return String(num === 12 ? 12 : num + 12).padStart(2, "0");
      }
      return String(num === 12 ? 0 : num).padStart(2, "0");
    };

    const handleConfirm = () => {
      if (isDuration) {
        onSave(`${durationHour}:${durationMinute}`, true);
      } else {
        const h24 = to24Hour(selectedHour, isPM);
        onSave(`${h24}:${selectedMinute}`, false);
      }
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

    const onHourScrollEnd = (e: any) => updateHourSelection(e.nativeEvent.contentOffset.y);
    const onHourDragEnd = (e: any) => updateHourSelection(e.nativeEvent.contentOffset.y);
    const onMinuteScrollEnd = (e: any) => updateMinuteSelection(e.nativeEvent.contentOffset.y);
    const onMinuteDragEnd = (e: any) => updateMinuteSelection(e.nativeEvent.contentOffset.y);

    const updateDurationHourSelection = (offsetY: number) => {
      const clamped = Math.max(0, offsetY);
      const index = Math.round(clamped / ITEM_HEIGHT);
      const clampedIndex = Math.min(index, HOURS_12.length - 1);
      setDurationHour(HOURS_12[clampedIndex]);
    };

    const updateDurationMinuteSelection = (offsetY: number) => {
      const clamped = Math.max(0, offsetY);
      const index = Math.round(clamped / ITEM_HEIGHT);
      const clampedIndex = Math.min(index, MINUTES.length - 1);
      setDurationMinute(MINUTES[clampedIndex]);
    };

    const onDurationHourScrollEnd = (e: any) => updateDurationHourSelection(e.nativeEvent.contentOffset.y);
    const onDurationHourDragEnd = (e: any) => updateDurationHourSelection(e.nativeEvent.contentOffset.y);
    const onDurationMinuteScrollEnd = (e: any) => updateDurationMinuteSelection(e.nativeEvent.contentOffset.y);
    const onDurationMinuteDragEnd = (e: any) => updateDurationMinuteSelection(e.nativeEvent.contentOffset.y);

    const selectHour = (item: string) => {
      setSelectedHour(item);
      hourRef.current?.scrollToOffset({ offset: HOURS_12.indexOf(item) * ITEM_HEIGHT, animated: true });
    };

    const selectMinute = (item: string) => {
      setSelectedMinute(item);
      minuteRef.current?.scrollToOffset({ offset: MINUTES.indexOf(item) * ITEM_HEIGHT, animated: true });
    };

    const selectDurationHour = (item: string) => {
      setDurationHour(item);
      durationHourRef.current?.scrollToOffset({ offset: HOURS_12.indexOf(item) * ITEM_HEIGHT, animated: true });
    };

    const selectDurationMinute = (item: string) => {
      setDurationMinute(item);
      durationMinuteRef.current?.scrollToOffset({ offset: MINUTES.indexOf(item) * ITEM_HEIGHT, animated: true });
    };

    const renderHourItem = useCallback(
      ({ item }: { item: string }) => {
        const isSelected = item === selectedHour;
        return (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => selectHour(item)}
            style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: isSelected ? 20 : 16,
                fontWeight: isSelected ? "800" : "400",
                color: isSelected
                  ? isStudy
                    ? "#4f46e5"
                    : "#064e3b"
                  : "#9CA3AF",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      },
      [selectedHour, isStudy],
    );

    const renderMinuteItem = useCallback(
      ({ item }: { item: string }) => {
        const isSelected = item === selectedMinute;
        return (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => selectMinute(item)}
            style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: isSelected ? 20 : 16,
                fontWeight: isSelected ? "800" : "400",
                color: isSelected
                  ? isStudy
                    ? "#4f46e5"
                    : "#064e3b"
                  : "#9CA3AF",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      },
      [selectedMinute, isStudy],
    );

    const renderDurationHourItem = useCallback(
      ({ item }: { item: string }) => {
        const isSelected = item === durationHour;
        return (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => selectDurationHour(item)}
            style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: isSelected ? 20 : 16,
                fontWeight: isSelected ? "800" : "400",
                color: isSelected
                  ? isStudy
                    ? "#4f46e5"
                    : "#064e3b"
                  : "#9CA3AF",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      },
      [durationHour, isStudy],
    );

    const renderDurationMinuteItem = useCallback(
      ({ item }: { item: string }) => {
        const isSelected = item === durationMinute;
        return (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => selectDurationMinute(item)}
            style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: isSelected ? 20 : 16,
                fontWeight: isSelected ? "800" : "400",
                color: isSelected
                  ? isStudy
                    ? "#4f46e5"
                    : "#064e3b"
                  : "#9CA3AF",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      },
      [durationMinute, isStudy],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["75%"]}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
      >
        <BottomSheetView className="flex-1 p-5">
          <Text className="text-lg font-black mb-4">اختيار الوقت</Text>

          <View className="flex-row-reverse bg-gray-100 p-1 rounded-2xl mb-4">
            <TouchableOpacity
              onPress={() => setIsDuration(false)}
              className={`flex-1 py-2 rounded-xl items-center ${!isDuration ? (isStudy ? "bg-study-primary" : "bg-coding-primary") : ""}`}
            >
              <Text
                className={`font-bold ${!isDuration ? "text-white" : "text-gray-500"}`}
              >
                وقت محدد
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsDuration(true)}
              className={`flex-1 py-2 rounded-xl items-center ${isDuration ? (isStudy ? "bg-study-primary" : "bg-coding-primary") : ""}`}
            >
              <Text
                className={`font-bold ${isDuration ? "text-white" : "text-gray-500"}`}
              >
                مدة
              </Text>
            </TouchableOpacity>
          </View>

          {isDuration ? (
            <View className="mb-4">
              <Text className="text-gray-400 font-bold mb-1 ml-1">
                المدة
              </Text>
              <View
                style={{
                  height: ITEM_HEIGHT * 3,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
                className="bg-white rounded-2xl border border-gray-100"
              >
                <View
                  style={{
                    position: "absolute",
                    top: ITEM_HEIGHT,
                    left: 8,
                    right: 8,
                    height: ITEM_HEIGHT,
                    backgroundColor: isStudy ? "#4f46e5" : "#064e3b",
                    opacity: 0.1,
                    borderRadius: 8,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <FlashList
                    ref={durationHourRef}
                    data={HOURS_12}
                    renderItem={renderDurationHourItem}
                    {...{ estimatedItemSize: ITEM_HEIGHT }}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingTop: ITEM_HEIGHT,
                      paddingBottom: ITEM_HEIGHT,
                    }}
                    onMomentumScrollEnd={onDurationHourScrollEnd}
                    onScrollEndDrag={onDurationHourDragEnd}
                  />
                </View>
                <View style={{ paddingHorizontal: 4 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: isStudy ? "#4f46e5" : "#064e3b",
                    }}
                  >
                    :
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <FlashList
                    ref={durationMinuteRef}
                    data={MINUTES}
                    renderItem={renderDurationMinuteItem}
                    {...{ estimatedItemSize: ITEM_HEIGHT }}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingTop: ITEM_HEIGHT,
                      paddingBottom: ITEM_HEIGHT,
                    }}
                    onMomentumScrollEnd={onDurationMinuteScrollEnd}
                    onScrollEndDrag={onDurationMinuteDragEnd}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="mb-4">
              <Text className="text-gray-400 font-bold mb-1 ml-1">
                الوقت
              </Text>
              <View
                style={{
                  height: ITEM_HEIGHT * 3,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
                className="bg-white rounded-2xl border border-gray-100"
              >
                <View
                  style={{
                    position: "absolute",
                    top: ITEM_HEIGHT,
                    left: 8,
                    right: 8,
                    height: ITEM_HEIGHT,
                    backgroundColor: isStudy ? "#4f46e5" : "#064e3b",
                    opacity: 0.1,
                    borderRadius: 8,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <FlashList
                    ref={minuteRef}
                    data={MINUTES}
                    renderItem={renderMinuteItem}
                    {...{ estimatedItemSize: ITEM_HEIGHT }}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
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
                      color: isStudy ? "#4f46e5" : "#064e3b",
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
                    {...{ estimatedItemSize: ITEM_HEIGHT }}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
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
                  className={`px-5 py-2 rounded-xl mx-1 ${!isPM ? (isStudy ? "bg-study-primary" : "bg-coding-primary") : "bg-gray-100"}`}
                >
                  <Text className={`font-bold ${!isPM ? "text-white" : "text-gray-500"}`}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsPM(true)}
                  className={`px-5 py-2 rounded-xl mx-1 ${isPM ? (isStudy ? "bg-study-primary" : "bg-coding-primary") : "bg-gray-100"}`}
                >
                  <Text className={`font-bold ${isPM ? "text-white" : "text-gray-500"}`}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="mt-auto">
            <View className="flex-row justify-between items-center mb-4 px-2">
              <Text className="text-gray-500 font-bold">ملخص الوقت:</Text>
              <Text
                className={`font-black ${isStudy ? "text-study-primary" : "text-coding-primary"}`}
              >
                {isDuration ? `${durationHour}:${durationMinute}` : `${selectedHour}:${selectedMinute} ${isPM ? "PM" : "AM"}`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`py-4 rounded-2xl items-center shadow-lg ${isStudy ? "bg-study-primary" : "bg-coding-primary"}`}
            >
              <Text className="text-white font-black text-lg">تأكيد الوقت</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default TimeSheet;

TimeSheet.displayName = "TimeSheet";
