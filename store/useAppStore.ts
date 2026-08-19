import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import i18n from "../i18next/i18n";
import {
  requestPermission,
  scheduleDailyNotification,
  scheduleHabitNotification,
  cancelNotification,
} from "../src/services/notificationService";
import { supabase } from "../supabase";

const storage = createMMKV();
const storedLanguage = (storage.getString("language") as "ar" | "en") || "ar";

// ============ Interfaces ============
export type Priority = 'high' | 'medium' | 'low' | 'none';
export type Mode = "study" | "coding" | "faith";

// Fallback id used when no user is signed in (data stays local-only)
export const GUEST_USER_ID = "guest";

export interface AppUser {
  id: string;
  email?: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: number;
  createdAt: number;
  reminderTime?: string; // ISO string for reminder
  priority?: Priority;
  mode: Mode; // Separate tasks by mode
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  streak: number;
  lastCompletedDate?: number;
  createdAt: number;
  color?: string;
  priority?: Priority;
  reminderTime?: string; // ISO string for reminder
  repeatType?: "daily" | "weekly" | "custom";
  repeatDays?: string[];
  mode: Mode; // Separate habits by mode
}

interface AppState {
  mode: Mode;
  toggleMode: () => void;
  setMode: (m: Mode) => void;

  // Authenticated user (null when signed out)
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;

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
  clearAllTasks: (mode: Mode) => void;
  clearAllHabits: (mode: Mode) => void;

  // All data (unfiltered, scoped to current user)
  allTasks: Task[];
  allHabits: Habit[];

  // Tasks (filtered by current user and mode)
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "userId" | "createdAt" | "mode">) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  getTodayTasks: () => Task[];

  // Habits (filtered by current user and mode)
  habits: Habit[];
  addHabit: (habit: Omit<Habit, "id" | "userId" | "createdAt" | "mode">) => void;
  removeHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  completeHabit: (id: string) => void;
  resetHabitStreak: (id: string) => void;
  checkAndResetDailyHabits: () => void;
  cancelPastDueNotifications: () => void;
}

const loadFromStorage = <T extends { mode?: string }>(
  key: string,
  userId: string,
): T[] => {
  const data = storage.getString(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data) as T[];
    // Ensure backward compatibility for legacy items
    return parsed.map((item: any) => ({
      ...item,
      userId: item.userId || userId,
      mode: item.mode || "study",
      ...(key.startsWith("habits")
        ? {
            repeatType: item.repeatType || "daily",
            repeatDays: item.repeatDays || [
              "sun",
              "mon",
              "tue",
              "wed",
              "thu",
              "fri",
              "sat",
            ],
          }
        : {}),
    }));
  } catch {
    return [];
  }
};

const getUserId = (user: AppUser | null): string => user?.id ?? GUEST_USER_ID;

const taskStorageKey = (userId: string) => `tasks:${userId}`;
const habitStorageKey = (userId: string) => `habits:${userId}`;

const filterByUserAndMode = <T extends { userId?: string; mode?: Mode }>(
  items: T[],
  userId: string,
  mode: Mode,
): T[] => items.filter((item) => item.userId === userId && item.mode === mode);

const initialMode =
  (storage.getString("app_mode") as Mode) || "study";

export const useAppStore = create<AppState>((set, get) => {
  const storedDark = storage.getString("dark_mode");
  const initialDark = storedDark === "true";
  const storedNotifications = storage.getString("notifications_enabled");
  const initialNotifications = storedNotifications === "true";

  return {
    mode: initialMode,
    toggleMode: () =>
      set((state) => {
        const order: Mode[] = ["study", "coding", "faith"];
        const idx = order.indexOf(state.mode);
        const nextMode = order[(idx + 1) % order.length];
        storage.set("app_mode", nextMode);
        const uid = getUserId(state.user);
        return {
          mode: nextMode,
          tasks: filterByUserAndMode(state.allTasks, uid, nextMode),
          habits: filterByUserAndMode(state.allHabits, uid, nextMode),
        };
      }),
    setMode: (m) =>
      set((state) => {
        storage.set("app_mode", m);
        const uid = getUserId(state.user);
        return {
          mode: m,
          tasks: filterByUserAndMode(state.allTasks, uid, m),
          habits: filterByUserAndMode(state.allHabits, uid, m),
        };
      }),

    // ============ User & Auth ============
    user: null,
    setUser: (user) =>
      set((state) => {
        if (!user) {
          // Signed out / switched account: drop in-memory data
          return {
            user: null,
            allTasks: [],
            allHabits: [],
            tasks: [],
            habits: [],
          };
        }

        // Load only this user's data (stored under user-scoped keys)
        const tasksKey = taskStorageKey(user.id);
        const habitsKey = habitStorageKey(user.id);
        let tasks = loadFromStorage<Task>(tasksKey, user.id);
        let habits = loadFromStorage<Habit>(habitsKey, user.id);

        // One-time adoption of legacy (pre-userId) data stored under the old keys
        if (tasks.length === 0 && storage.getString("tasks")) {
          tasks = loadFromStorage<Task>("tasks", user.id);
          if (tasks.length > 0) {
            storage.set(tasksKey, JSON.stringify(tasks));
            storage.remove("tasks");
          }
        }
        if (habits.length === 0 && storage.getString("habits")) {
          habits = loadFromStorage<Habit>("habits", user.id);
          if (habits.length > 0) {
            storage.set(habitsKey, JSON.stringify(habits));
            storage.remove("habits");
          }
        }

        return {
          user,
          allTasks: tasks,
          allHabits: habits,
          tasks: filterByUserAndMode(tasks, user.id, state.mode),
          habits: filterByUserAndMode(habits, user.id, state.mode),
        };
      }),
    logout: async () => {
      const state = get();
      // Cancel notifications scheduled for the signed-out user
      // to prevent cross-account leaks
      await Promise.all([
        ...state.allTasks.map((t) => cancelNotification(t.id).catch(() => {})),
        ...state.allHabits.map((h) => cancelNotification(h.id).catch(() => {})),
      ]);
      set({ user: null, allTasks: [], allHabits: [], tasks: [], habits: [] });
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Sign out failed:", e);
      }
    },

    deleteAccount: async () => {
      const state = get();
      const uid = getUserId(state.user);
      // TODO: delete the auth user server-side (requires a Supabase Edge
      // Function using the service role key, called with the user's JWT).
      await Promise.all([
        ...state.allTasks.map((t) => cancelNotification(t.id).catch(() => {})),
        ...state.allHabits.map((h) => cancelNotification(h.id).catch(() => {})),
      ]);
      storage.remove(taskStorageKey(uid));
      storage.remove(habitStorageKey(uid));
      set({ user: null, allTasks: [], allHabits: [], tasks: [], habits: [] });
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Sign out failed:", e);
      }
    },

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
                  d,
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
                return scheduleHabitNotification(
                  h.id,
                  h.title,
                  h.description || "",
                  d.getHours(),
                  d.getMinutes(),
                  h.repeatType || "daily",
                  h.repeatDays || [],
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

    // ============ All Data (unfiltered, scoped to current user) ============
    allTasks: [],
    allHabits: [],

    // ============ Filtered Data (by current user and mode) ============
    tasks: [],
    habits: [],

    // ============ Tasks Management ============
    addTask: (task) =>
      set((state) => {
        const uid = getUserId(state.user);
        const newTask: Task = {
          ...task,
          id: Date.now().toString(),
          userId: uid,
          createdAt: Date.now(),
          priority: task.priority || "none",
          mode: state.mode,
        };
        const updatedAllTasks = [...state.allTasks, newTask];
        storage.set(taskStorageKey(uid), JSON.stringify(updatedAllTasks));

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
              d,
            );
          } catch {}
        }
        return {
          allTasks: updatedAllTasks,
          tasks: filterByUserAndMode(updatedAllTasks, uid, state.mode),
        };
      }),
    removeTask: (id: string) =>
      set((state) => {
        const uid = getUserId(state.user);
        const updatedAllTasks = state.allTasks.filter((task) => task.id !== id);
        storage.set(taskStorageKey(uid), JSON.stringify(updatedAllTasks));
        cancelNotification(id).catch(() => {});
        return {
          allTasks: updatedAllTasks,
          tasks: filterByUserAndMode(updatedAllTasks, uid, state.mode),
        };
      }),
    deleteSingleItem: (id: string, type: "task" | "habit") =>
      set((state) => {
        const uid = getUserId(state.user);
        if (type === "task") {
          const updated = state.allTasks.filter((t) => t.id !== id);
          storage.set(taskStorageKey(uid), JSON.stringify(updated));
          cancelNotification(id).catch(() => {});
          return {
            allTasks: updated,
            tasks: filterByUserAndMode(updated, uid, state.mode),
          };
        }
        const updated = state.allHabits.filter((h) => h.id !== id);
        storage.set(habitStorageKey(uid), JSON.stringify(updated));
        cancelNotification(id).catch(() => {});
        return {
          allHabits: updated,
          habits: filterByUserAndMode(updated, uid, state.mode),
        };
      }),
    clearAllTasks: (mode: Mode) =>
      set((state) => {
        const uid = getUserId(state.user);
        const updated = state.allTasks.filter((t) => t.mode !== mode);
        storage.set(taskStorageKey(uid), JSON.stringify(updated));
        return {
          allTasks: updated,
          tasks: filterByUserAndMode(updated, uid, state.mode),
        };
      }),
    clearAllHabits: (mode: Mode) =>
      set((state) => {
        const uid = getUserId(state.user);
        const updated = state.allHabits.filter((h) => h.mode !== mode);
        storage.set(habitStorageKey(uid), JSON.stringify(updated));
        return {
          allHabits: updated,
          habits: filterByUserAndMode(updated, uid, state.mode),
        };
      }),
    updateTask: (id: string, updates: Partial<Task>) =>
      set((state) => {
        const uid = getUserId(state.user);
        // Never allow a task to be reassigned to another user
        const { userId: _ignored, ...safeUpdates } = updates;
        const updatedAllTasks = state.allTasks.map((task) =>
          task.id === id ? { ...task, ...safeUpdates } : task,
        );
        storage.set(taskStorageKey(uid), JSON.stringify(updatedAllTasks));

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
                d,
              );
            } catch {}
          } else {
            // If notifications disabled or reminder removed, cancel any existing
            cancelNotification(id).catch(() => {});
          }
        }
        return {
          allTasks: updatedAllTasks,
          tasks: filterByUserAndMode(updatedAllTasks, uid, state.mode),
        };
      }),
    toggleTaskComplete: (id: string) =>
      set((state) => {
        const uid = getUserId(state.user);
        const updatedAllTasks = state.allTasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        );
        storage.set(taskStorageKey(uid), JSON.stringify(updatedAllTasks));

        const target = updatedAllTasks.find((t) => t.id === id);
        if (target?.completed) {
          cancelNotification(id).catch(() => {});
        }

        return {
          allTasks: updatedAllTasks,
          tasks: filterByUserAndMode(updatedAllTasks, uid, state.mode),
        };
      }),
    getTodayTasks: () => {
      const state = get();
      return state.tasks.filter((task) => !task.completed);
    },

    // ============ Habits Management ============
    addHabit: (habit) =>
      set((state) => {
        const uid = getUserId(state.user);
        const newHabit: Habit = {
          ...habit,
          id: Date.now().toString(),
          userId: uid,
          createdAt: Date.now(),
          streak: 0,
          priority: habit.priority || "none",
          repeatType: habit.repeatType || "daily",
          repeatDays: habit.repeatDays || [
            "sun",
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
            "sat",
          ],
          mode: state.mode,
        };
        const updatedAllHabits = [...state.allHabits, newHabit];
        storage.set(habitStorageKey(uid), JSON.stringify(updatedAllHabits));

        if (state.notificationsEnabled && newHabit.reminderTime) {
          try {
            const d = new Date(newHabit.reminderTime);
            scheduleHabitNotification(
              newHabit.id,
              newHabit.title,
              newHabit.description || "",
              d.getHours(),
              d.getMinutes(),
              newHabit.repeatType || "daily",
              newHabit.repeatDays || [],
              newHabit.mode,
            );
          } catch {}
        }
        return {
          allHabits: updatedAllHabits,
          habits: filterByUserAndMode(updatedAllHabits, uid, state.mode),
        };
      }),
    removeHabit: (id: string) =>
      set((state) => {
        const uid = getUserId(state.user);
        const updatedAllHabits = state.allHabits.filter(
          (habit) => habit.id !== id,
        );
        storage.set(habitStorageKey(uid), JSON.stringify(updatedAllHabits));
        cancelNotification(id).catch(() => {});
        return {
          allHabits: updatedAllHabits,
          habits: filterByUserAndMode(updatedAllHabits, uid, state.mode),
        };
      }),
    updateHabit: (id: string, updates: Partial<Habit>) =>
      set((state) => {
        const uid = getUserId(state.user);
        // Never allow a habit to be reassigned to another user
        const { userId: _ignored, ...safeUpdates } = updates;
        const updatedAllHabits = state.allHabits.map((habit) =>
          habit.id === id ? { ...habit, ...safeUpdates } : habit,
        );
        storage.set(habitStorageKey(uid), JSON.stringify(updatedAllHabits));

        const target = updatedAllHabits.find((h) => h.id === id);
        if (target) {
          if (state.notificationsEnabled && target.reminderTime) {
            try {
              const d = new Date(target.reminderTime);
              scheduleHabitNotification(
                target.id,
                target.title,
                target.description || "",
                d.getHours(),
                d.getMinutes(),
                target.repeatType || "daily",
                target.repeatDays || [],
                target.mode,
              );
            } catch {}
          } else {
            cancelNotification(id).catch(() => {});
          }
        }
        return {
          allHabits: updatedAllHabits,
          habits: filterByUserAndMode(updatedAllHabits, uid, state.mode),
        };
      }),
    completeHabit: (id: string) =>
      set((state) => {
        const uid = getUserId(state.user);
        let wasCompleted = false;
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
              wasCompleted = true;
              return {
                ...habit,
                streak: habit.streak + 1,
                lastCompletedDate: Date.now(),
              };
            }
          }
          return habit;
        });
        storage.set(habitStorageKey(uid), JSON.stringify(updatedAllHabits));
        if (wasCompleted) {
          cancelNotification(id).catch(() => {});
        }
        return {
          allHabits: updatedAllHabits,
          habits: filterByUserAndMode(updatedAllHabits, uid, state.mode),
        };
      }),
    resetHabitStreak: (id: string) =>
      set((state) => {
        const uid = getUserId(state.user);
        const updatedAllHabits = state.allHabits.map((habit) =>
          habit.id === id
            ? { ...habit, streak: 0, lastCompletedDate: undefined }
            : habit,
        );
        storage.set(habitStorageKey(uid), JSON.stringify(updatedAllHabits));
        return {
          allHabits: updatedAllHabits,
          habits: filterByUserAndMode(updatedAllHabits, uid, state.mode),
        };
      }),
    cancelPastDueNotifications: () => {
      const state = get();
      const now = new Date();
      state.allTasks
        .filter((t) => t.reminderTime && new Date(t.reminderTime) <= now)
        .forEach((t) => cancelNotification(t.id).catch(() => {}));
    },
    checkAndResetDailyHabits: () => {
      const today = new Date().toDateString();
      const lastChecked = storage.getString("last-checked-date");

      // Only run once per calendar day
      if (lastChecked === today) {
        return;
      }

      set((state) => {
        const uid = getUserId(state.user);
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
        storage.set(habitStorageKey(uid), JSON.stringify(updatedAllHabits));
        storage.set("last-checked-date", today);

        return {
          allHabits: updatedAllHabits,
          habits: filterByUserAndMode(updatedAllHabits, uid, state.mode),
        };
      });
    },
  };
});
