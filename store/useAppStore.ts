import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV();

// ============ Interfaces ============
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: number;
  createdAt: number;
  priority?: "low" | "medium" | "high";
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
  selectDay: number;
  setSelectDay: (day: number) => void;

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
}

const today = new Date().getDate();

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

const initialMode = (storage.getString("app_mode") as "study" | "coding") || "study";

export const useAppStore = create<AppState>((set, get) => {
  const allTasks = loadFromStorage<Task>("tasks");
  const allHabits = loadFromStorage<Habit>("habits");

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
    selectDay: today,
    setSelectDay: (day: number) => {
      storage.set("select_day", day);
      set({ selectDay: day });
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
    updateTask: (id: string, updates: Partial<Task>) =>
      set((state) => {
        const updatedAllTasks = state.allTasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task,
        );
        storage.set("tasks", JSON.stringify(updatedAllTasks));
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
  };
});
