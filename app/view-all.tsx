import { View, Text } from "react-native";
import React from "react";
import { FlashList } from "@shopify/flash-list";
import { useAppStore } from "../store/useAppStore";

const ShowAll = () => {
  const { tasks } = useAppStore();

  return (
    <View className="flex-1 px-4 py-6 bg-white">
      <Text className="text-2xl font-bold mb-4">جميع المهام</Text>

      {tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">لا توجد مهام حالياً.</Text>
        </View>
      ) : (
        <FlashList
          data={tasks}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-lg mb-3 w-full">
              <Text className="text-lg font-bold mb-2">{item.title}</Text>
              {item.description ? (
                <Text className="text-gray-500">{item.description}</Text>
              ) : null}
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          className="w-full"
        />
      )}
    </View>
  );
};

export default ShowAll;
