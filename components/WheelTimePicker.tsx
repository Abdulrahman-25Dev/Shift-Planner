import React, { useState, useRef, useLayoutEffect } from 'react';
import { View, Text, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';

interface WheelTimePickerProps {
  initialTime: Date;
  onTimeChange: (hour: number, minute: number) => void;
}

const WheelTimePicker: React.FC<WheelTimePickerProps> = ({ initialTime, onTimeChange }) => {
  const [selectedHour, setSelectedHour] = useState(initialTime.getHours());
  const [selectedMinute, setSelectedMinute] = useState(initialTime.getMinutes());

  const hourListRef = useRef<any>(null);
  const minuteListRef = useRef<any>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const itemHeight = 50;
  const paddingTop = 75; // Center selected item inside the visible indicator

  useLayoutEffect(() => {
    setSelectedHour(initialTime.getHours());
    setSelectedMinute(initialTime.getMinutes());
  }, [initialTime]);

  useLayoutEffect(() => {
    // Scroll to initial time with offset so the selected row aligns with the highlight
    if (hourListRef.current) {
      hourListRef.current.scrollToOffset({ offset: paddingTop + selectedHour * itemHeight, animated: false });
    }
    if (minuteListRef.current) {
      minuteListRef.current.scrollToOffset({ offset: paddingTop + selectedMinute * itemHeight, animated: false });
    }
  }, [selectedHour, selectedMinute]);

  const handleHourScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round((offsetY - paddingTop) / itemHeight);
    const hour = Math.max(0, Math.min(23, index));
    setSelectedHour(hour);
    onTimeChange(hour, selectedMinute);
  };

  const handleMinuteScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round((offsetY - paddingTop) / itemHeight);
    const minute = Math.max(0, Math.min(59, index));
    setSelectedMinute(minute);
    onTimeChange(selectedHour, minute);
  };

  const renderItem = ({ item }: { item: number }) => (
    <View className="h-[50px] justify-center items-center">
      <Text className="text-white text-xl font-bold">{item.toString().padStart(2, '0')}</Text>
    </View>
  );

  return (
    <View className="bg-zinc-900 rounded-lg overflow-hidden">
      <View className="flex-row h-[200px]">
        {/* Hours List */}
        <View className="flex-1">
          <FlashList
            ref={hourListRef}
            data={hours}
            renderItem={renderItem}
            keyExtractor={(item) => `hour-${item}`}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleHourScrollEnd}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: paddingTop, paddingBottom: paddingTop }}
          />
        </View>

        {/* Separator */}
        <View className="w-[1px] bg-zinc-700" />

        {/* Minutes List */}
        <View className="flex-1">
          <FlashList
            ref={minuteListRef}
            data={minutes}
            renderItem={renderItem}
            keyExtractor={(item) => `minute-${item}`}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleMinuteScrollEnd}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: paddingTop, paddingBottom: paddingTop }}
          />
        </View>
      </View>

      {/* Selection Indicator */}
      <View className="absolute left-0 right-0 h-[50px] bg-white/20 border-y border-white/30 pointer-events-none" style={{ top: 75 }} />
    </View>
  );
};

export default WheelTimePicker;