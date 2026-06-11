import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import i18n from "../i18next/i18n";
import {
  requestPermission,
  scheduleDailyNotification,
  cancelNotification,
} from "../src/services/notificationService";

const storage = createMMKV();
const storedLanguage = (storage.getString("language") as "ar" | "en") || "ar";

// ============ Interfaces ============
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: number;
  createdAt: number;
  reminderTime?: string; // ISO string for reminder
  mode: "study" | "coding"; // Separate tasks by mode
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  streak: number;
  lastCompletedDate?: number;
  createdAt: number;
  frequency?: "daily" | "weekly" | "monthly";
  color?: string;
  priority?: "low" | "medium" | "high";
  reminderTime?: string; // ISO string for reminder
  mode: "study" | "coding"; // Separate habits by mode
}

interface AppState {
  mode: "study" | "coding";
  toggleMode: () => void;
  setMode: (m: "study" | "coding") => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;

  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;

  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  // Pending item to open when app is launched from a notification
  pendingOpenItem: { id: string; type: "task" | "habit" } | null;
  setPendingOpenItem: (
    v: { id: string; type: "task" | "habit" } | null,
  ) => void;

  deleteSingleItem: (id: string, type: "task" | "habit") => void;
  clearAllTasks: (mode: "coding" | "study") => void;
  clearAllHabits: (mode: "coding" | "study") => void;

  // All data (unfiltered)
  allTasks: Task[];
  allHabits: Habit[];

  // Tasks (filtered by current mode)
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "mode">) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  getTodayTasks: () => Task[];

  // Habits (filtered by current mode)
  habits: Habit[];
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "mode">) => void;
  removeHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  completeHabit: (id: string) => void;
  resetHabitStreak: (id: string) => void;
  checkAndResetDailyHabits: () => void;
}

const loadFromStorage = <T extends { mode?: string }>(key: string): T[] => {
  const data = storage.getString(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data) as T[];
    // Ensure all items have a mode property (for backward compatibility)
    return parsed.map((item) => ({
      ...item,
      mode: item.mode || "study", // Default to "study" if mode is missing
    }));
  } catch {
    return [];
  }
};

const initialMode =
  (storage.getString("app_mode") as "study" | "coding") || "study";

export const useAppStore = create<AppState>((set, get) => {
  const allTasks = loadFromStorage<Task>("tasks");
  const allHabits = loadFromStorage<Habit>("habits");
  const storedDark = storage.getString("dark_mode");
  const initialDark = storedDark === "true";
  const storedNotifications = storage.getString("notifications_enabled");
  const initialNotifications = storedNotifications === "true";

  return {
    mode: initialMode,
    toggleMode: () =>
      set((state) => {
        const nextMode = state.mode === "study" ? "coding" : "study";
        storage.set("app_mode", nextMode);
        return {
          mode: nextMode,
          tasks: state.allTasks.filter((task) => task.mode === nextMode),
          habits: state.allHabits.filter((habit) => habit.mode === nextMode),
        };
      }),
    setMode: (m) =>
      set((state) => {
        storage.set("app_mode", m);
        return {
          mode: m,
          tasks: state.allTasks.filter((task) => task.mode === m),
          habits: state.allHabits.filter((habit) => habit.mode === m),
        };
      }),

    isDarkMode: initialDark,
    toggleDarkMode: () =>
      set((state) => {
        const next = !state.isDarkMode;
        storage.set("dark_mode", next ? "true" : "false");
        return { isDarkMode: next };
      }),

    language: storedLanguage,
    setLanguage: (lang) =>
      set((state) => {
        storage.set("language", lang);
        i18n.changeLanguage(lang);
        return { language: lang };
      }),

    notificationsEnabled: initialNotifications,
    pendingOpenItem: null,
    setPendingOpenItem: (v) => set(() => ({ pendingOpenItem: v })),
    setNotificationsEnabled: async (enabled: boolean) => {
      const state = get();
      storage.set("notifications_enabled", enabled ? "true" : "false");

      if (enabled) {
        const ok = await requestPermission();
        if (!ok) {
          set({ notificationsEnabled: false });
          return;
        }

        // Schedule for existing tasks
        await Promise.all(
          state.allTasks
            .filter((t) => t.reminderTime)
            .map((t) => {
              try {
                const d = new Date(t.reminderTime as string);
                return scheduleDailyNotification(
                  t.id,
                  t.title,
                  t.description || "",
                  d.getHours(),
                  d.getMinutes(),
                  "task",
                  t.mode || "study",
                );
              } catch {
                return Promise.resolve(null);
              }
            }),
        );

        // Schedule for existing habits
        await Promise.all(
          state.allHabits
            .filter((h) => h.reminderTime)
            .map((h) => {
              try {
                const d = new Date(h.reminderTime as string);
                return scheduleDailyNotification(
                  h.id,
                  h.title,
                  h.description || "",
                  d.getHours(),
                  d.getMinutes(),
                  "habit",
                  h.mode || "study",
                );
              } catch {
                return Promise.resolve(null);
              }
            }),
        );
      } else {
        // Cancel all scheduled notifications for tasks and habits
        await Promise.all([
          ...state.allTasks.map((t) => cancelNotification(t.id)),
          ...state.allHabits.map((h) => cancelNotification(h.id)),
        ]);
      }

      set({ notificationsEnabled: enabled });
    },

    // ============ All Data (unfiltered) ============
    allTasks,
    allHabits,

    // ============ Filtered Data (by current mode) ============
    tasks: allTasks.filter((task) => task.mode === initialMode),
    habits: allHabits.filter((habit) => habit.mode === initialMode),

    // ============ Tasks Management ============
    addTask: (task) =>
      set((state) => {
        const newTask: Task = {
          ...task,
          id: Date.now().toString(),
          createdAt: Date.now(),
          mode: state.mode,
        };
        const updatedAllTasks = [...state.allTasks, newTask];
        storage.set("tasks", JSON.stringify(updatedAllTasks));

        // Schedule notification if enabled and reminder provided
        if (state.notificationsEnabled && newTask.reminderTime) {
          try {
            const d = new Date(newTask.reminderTime);
            scheduleDailyNotification(
              newTask.id,
              newTask.title,
              newTask.description || "",
              d.getHours(),
              d.getMinutes(),
              "task",
              newTask.mode,
            );
          } catch {}
        }
        return {
          allTasks: updatedAllTasks,
          tasks: updatedAllTasks.filter((t) => t.mode === state.mode),
        };
      }),
    removeTask: (id: string) =>
      set((state) => {
        const updatedAllTasks = state.allTasks.filter((task) => task.id !== id);
        storage.set("tasks", JSON.stringify(updatedAllTasks));
        return {
          allTasks: updatedAllTasks,
          tasks: updatedAllTasks.filter((t) => t.mode === state.mode),
        };
      }),
    deleteSingleItem: (id: string, type: "task" | "habit") =>
      set((state) => {
        if (type === "task") {
          const updated = state.allTasks.filter((t) => t.id !== id);
          storage.set("tasks", JSON.stringify(updated));
          cancelNotification(id).catch(() => {});
          return {
            allTasks: updated,
            tasks: updated.filter((t) => t.mode === state.mode),
          };
        }
        const updated = state.allHabits.filter((h) => h.id !== id);
        storage.set("habits", JSON.stringify(updated));
        cancelNotification(id).catch(() => {});
        return {
          allHabits: updated,
          habits: updated.filter((h) => h.mode === state.mode),
        };
      }),
    clearAllTasks: (mode: "coding" | "study") =>
      set((state) => {
        const updated = state.allTasks.filter((t) => t.mode !== mode);
        storage.set("tasks", JSON.stringify(updated));
        return {
          allTasks: updated,
          tasks: updated.filter((t) => t.mode === state.mode),
        };
      }),
    clearAllHabits: (mode: "coding" | "study") =>
      set((state) => {
        const updated = state.allHabits.filter((h) => h.mode !== mode);
        storage.set("habits", JSON.stringify(updated));
        return {
          allHabits: updated,
          habits: updated.filter((h) => h.mode === state.mode),
        };
      }),
    updateTask: (id: string, updates: Partial<Task>) =>
      set((state) => {
        const updatedAllTasks = state.allTasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task,
        );
        storage.set("tasks", JSON.stringify(updatedAllTasks));

        // Manage notification scheduling when reminderTime changed
        const target = updatedAllTasks.find((t) => t.id === id);
        if (target) {
          if (state.notificationsEnabled && target.reminderTime) {
            try {
              const d = new Date(target.reminderTime);
              scheduleDailyNotification(
                target.id,
                target.title,
                target.description || "",
                d.getHours(),
                d.getMinutes(),
                "task",
                target.mode,
              );
            } catch {}
          } else {
            // If notifications disabled or reminder removed, cancel any existing
            cancelNotification(id).catch(() => {});
          }
        }
        return {
          allTasks: updatedAllTasks,
          tasks: updatedAllTasks.filter((t) => t.mode === state.mode),
        };
      }),
    toggleTaskComplete: (id: string) =>
      set((state) => {
        const updatedAllTasks = state.allTasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        );
        storage.set("tasks", JSON.stringify(updatedAllTasks));
        return {
          allTasks: updatedAllTasks,
          tasks: updatedAllTasks.filter((t) => t.mode === state.mode),
        };
      }),
    getTodayTasks: () => {
      const state = get();
      return state.tasks.filter((task) => !task.completed);
    },

    // ============ Habits Management ============
    addHabit: (habit) =>
      set((state) => {
        const newHabit: Habit = {
          ...habit,
          id: Date.now().toString(),
          createdAt: Date.now(),
          streak: 0,
          priority: habit.priority || "medium",
          mode: state.mode,
        };
        const updatedAllHabits = [...state.allHabits, newHabit];
        storage.set("habits", JSON.stringify(updatedAllHabits));

        if (state.notificationsEnabled && newHabit.reminderTime) {
          try {
            const d = new Date(newHabit.reminderTime);
            scheduleDailyNotification(
              newHabit.id,
              newHabit.title,
              newHabit.description || "",
              d.getHours(),
              d.getMinutes(),
              "habit",
              newHabit.mode,
            );
          } catch {}
        }
        return {
          allHabits: updatedAllHabits,
          habits: updatedAllHabits.filter((h) => h.mode === state.mode),
        };
      }),
    removeHabit: (id: string) =>
      set((state) => {
        const updatedAllHabits = state.allHabits.filter(
          (habit) => habit.id !== id,
        );
        storage.set("habits", JSON.stringify(updatedAllHabits));
        return {
          allHabits: updatedAllHabits,
          habits: updatedAllHabits.filter((h) => h.mode === state.mode),
        };
      }),
    updateHabit: (id: string, updates: Partial<Habit>) =>
      set((state) => {
        const updatedAllHabits = state.allHabits.map((habit) =>
          habit.id === id ? { ...habit, ...updates } : habit,
        );
        storage.set("habits", JSON.stringify(updatedAllHabits));

        const target = updatedAllHabits.find((h) => h.id === id);
        if (target) {
          if (state.notificationsEnabled && target.reminderTime) {
            try {
              const d = new Date(target.reminderTime);
              scheduleDailyNotification(
                target.id,
                target.title,
                target.description || "",
                d.getHours(),
                d.getMinutes(),
                "habit",
                target.mode,
              );
            } catch {}
          } else {
            cancelNotification(id).catch(() => {});
          }
        }
        return {
          allHabits: updatedAllHabits,
          habits: updatedAllHabits.filter((h) => h.mode === state.mode),
        };
      }),
    completeHabit: (id: string) =>
      set((state) => {
        const updatedAllHabits = state.allHabits.map((habit) => {
          if (habit.id === id) {
            const today = new Date().toDateString();
            const lastCompleted = habit.lastCompletedDate
              ? new Date(habit.lastCompletedDate).toDateString()
              : null;

            if (lastCompleted === today) {
              // If already completed today, uncomplete it
              return {
                ...habit,
                streak: Math.max(0, habit.streak - 1),
                lastCompletedDate: undefined,
              };
            } else {
              // Complete it
              return {
                ...habit,
                streak: habit.streak + 1,
                lastCompletedDate: Date.now(),
              };
            }
          }
          return habit;
        });
        storage.set("habits", JSON.stringify(updatedAllHabits));
        return {
          allHabits: updatedAllHabits,
          habits: updatedAllHabits.filter((h) => h.mode === state.mode),
        };
      }),
    resetHabitStreak: (id: string) =>
      set((state) => {
        const updatedAllHabits = state.allHabits.map((habit) =>
          habit.id === id
            ? { ...habit, streak: 0, lastCompletedDate: undefined }
            : habit,
        );
        storage.set("habits", JSON.stringify(updatedAllHabits));
        return {
          allHabits: updatedAllHabits,
          habits: updatedAllHabits.filter((h) => h.mode === state.mode),
        };
      }),
    checkAndResetDailyHabits: () => {
      const today = new Date().toDateString();
      const lastChecked = storage.getString("last-checked-date");

      // Only run once per calendar day
      if (lastChecked === today) {
        return;
      }

      set((state) => {
        // Calculate yesterday for streak maintenance check
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        const updatedAllHabits = state.allHabits.map((habit) => {
          // Check if habit was completed yesterday (streak maintenance)
          const wasCompletedYesterday = habit.lastCompletedDate
            ? new Date(habit.lastCompletedDate).toDateString() === yesterdayStr
            : false;

          if (wasCompletedYesterday) {
            // Habit was completed yesterday, maintain streak and clear for new day
            return {
              ...habit,
              lastCompletedDate: undefined,
            };
          } else {
            // Habit was not completed recently, reset streak
            return {
              ...habit,
              streak: 0,
              lastCompletedDate: undefined,
            };
          }
        });

        // Persist changes
        storage.set("habits", JSON.stringify(updatedAllHabits));
        storage.set("last-checked-date", today);

        return {
          allHabits: updatedAllHabits,
          habits: updatedAllHabits.filter((h) => h.mode === state.mode),
        };
      });
    },
  };
});
