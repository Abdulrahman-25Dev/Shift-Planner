import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import i18n from "i18next"; // استيراد مكتبة اللغات لقراءة اللغة الحالية ديناميكياً

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = "daily-reminders";

// ==================== [ بنك الرسائل الذكية والعشوائية ] ====================
const NOTIFICATION_MESSAGES = {
  coding: {
    task: {
      ar: [
        "جاهز للـ Commit القادم؟ حان وقت المهمة: {title} 🚀",
        "الـ Bugs ما تنتظر، اخلص من {title} وارجع للـ Debugging! 🔥",
        "سجل دخولك، وبلوِك وقتك الحين لـ: {title} 🛠️"
      ],
      en: [
        "Ready for the next commit? Time for task: {title} 🚀",
        "Bugs don't wait! Finish {title} and get back to debugging! 🔥",
        "Clock in and block your time for: {title} 🛠️"
      ]
    },
    habit: {
      ar: [
        "لا تخلي الـ Streak ينقطع، كودك يحتاج ترتب عاداتك الحين! 💻",
        "كود نظيف، وعادات نظيفة. العادة الحالية: {title} ✨",
        "إنتاجيتك اليوم تحت التقييم.. وقت عادة: {title} 📈"
      ],
      en: [
        "Don't break the streak! Run your habit: {title} 💻",
        "Clean code, clean habits. Current habit: {title} ✨",
        "Optimize your day. Habit due now: {title} 📈"
      ]
    }
  },
  study: {
    task: {
      ar: [
        "خذ نفس عميق، وركز الحين على مهمة: {title} 🎯",
        "تجميع الدرجات يبدأ بخطوة بسيطة، خلص {title} الحين 📝",
        "حان وقت التركيز العالي (Deep Work) لـ: {title} 🧠"
      ],
      en: [
        "Take a deep breath and focus on task: {title} 🎯",
        "One step closer to your goals. Start {title} now 📝",
        "Deep work session active. Focus on: {title} 🧠"
      ]
    },
    habit: {
      ar: [
        "القمة بانتظارك، لا تؤجل عادة اليوم: {title} 📚",
        "مستقبلك يبدأ من انضباطك الحين. وقت عادة: {title} ✨",
        "الانضباط اليومي يصنع الفارق، حان وقت: {title} 🏆"
      ],
      en: [
        "Success is built daily. Time for your habit: {title} 📚",
        "Your future self will thank you. Time to do: {title} ✨",
        "Daily discipline makes the difference. Habit time: {title} 🏆"
      ]
    }
  }
};

// دالة مساعدة لاختيار رسالة عشوائية
function getRandomBody(mode: "study" | "coding", type: "task" | "habit", title: string): string {
  const currentLng = (i18n.language === "ar" || i18n.language?.startsWith("ar")) ? "ar" : "en";
  const list = NOTIFICATION_MESSAGES[mode][type][currentLng];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex].replace("{title}", title);
}
// =========================================================================

export async function requestPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Daily Reminders",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      enableLights: true,
      lightColor: "#10b981",
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    } as Notifications.NotificationChannelInput);
  }

  return true;
}

export async function cancelNotification(id: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const matches = scheduled.filter((s) => s.content?.data?.itemId === id);
  await Promise.all(
    matches.map((s) =>
      Notifications.cancelScheduledNotificationAsync(s.identifier),
    ),
  );
}

export async function scheduleDailyNotification(
  id: string,
  title: string,
  body: string,
  hour: number,
  minute: number,
  notificationType: "task" | "habit" = "task",
  mode: "study" | "coding" = "study",
): Promise<string | null> {
  await cancelNotification(id);

  // توليد نص إشعار ذكي وعشوائي بناءً على المود والنوع واللغة الحالية الحية للتطبيق
  const dynamicBody = getRandomBody(mode, notificationType, title);

  const notificationTitle =
    notificationType === "task" 
      ? (i18n.language?.startsWith("ar") ? "تذكير بمهمة 📝" : "Task Reminder 📝")
      : (i18n.language?.startsWith("ar") ? "تذكير بالعادة 🎯" : "Habit Reminder 🎯");

  const content: Notifications.NotificationContentInput = {
    title: notificationTitle,
    body: body || dynamicBody, // إذا مررت body مخصص بيستخدمه، وإذا تركته فاضي بياخذ العشوائي الذكي
    sound: "default",
    badge: 1,
    data: { itemId: id, notificationType, mode },
    android: {
      channelId: ANDROID_CHANNEL_ID,
      color: "#10b981",
      priority: Notifications.AndroidNotificationPriority.MAX,
      sticky: false,
      vibrate: true,
      visibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    },
  };

  if (Platform.OS === "android") {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const secondsUntil = Math.max(
      1,
      Math.floor((next.getTime() - now.getTime()) / 1000),
    );

    const triggerAndroid: Notifications.NotificationTriggerInput = {
      seconds: secondsUntil,
      type: "timeInterval",
      repeats: false,
    } as any;

    if (!content.android)
      content.android = {
        channelId: ANDROID_CHANNEL_ID,
        sound: "default",
      } as any;

    const identifier = await Notifications.scheduleNotificationAsync({
      content,
      trigger: triggerAndroid,
    });
    return identifier ?? null;
  }

  const triggerIOS: any = {
    hour,
    minute,
    repeats: true,
    type: "calendar",
  };

  const identifier = await Notifications.scheduleNotificationAsync({
    content,
    trigger: triggerIOS,
  });
  return identifier ?? null;
}

export async function logScheduledNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log("Scheduled notifications:", scheduled);
  Alert.alert("Scheduled", JSON.stringify(scheduled, null, 2).slice(0, 2000));
}

export async function scheduleImmediateTest() {
  try {
    const triggerTest: any =
      Platform.OS === "android"
        ? { seconds: 5, type: "timeInterval", repeats: false }
        : { seconds: 5 };
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test",
        body: "Notification test",
        sound: "default",
        ...(Platform.OS === "android"
          ? { android: { channelId: ANDROID_CHANNEL_ID, sound: "default" } }
          : {}),
      },
      trigger: triggerTest,
    });
    console.log("Immediate test scheduled id:", id);
    Alert.alert("Scheduled test", `id: ${id}`);
  } catch (e) {
    console.error(e);
    Alert.alert("Error", String(e));
  }
}

export async function scheduleImmediateTestWithPayload(
  itemId: string,
  notificationType: "task" | "habit",
  mode: "study" | "coding" = "study",
) {
  try {
    const triggerTest: any =
      Platform.OS === "android"
        ? { seconds: 5, type: "timeInterval", repeats: false }
        : { seconds: 5 };
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title:
          notificationType === "task"
            ? "Task reminder (test)"
            : "Habit reminder (test)",
        body:
          notificationType === "task"
            ? "Tap to open the task."
            : "Tap to open the habit.",
        sound: "default",
        data: { itemId, notificationType, mode },
        ...(Platform.OS === "android"
          ? { android: { channelId: ANDROID_CHANNEL_ID } }
          : {}),
      },
      trigger: triggerTest,
    });
    return id;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export default {
  requestPermission,
  scheduleDailyNotification,
  cancelNotification,
};