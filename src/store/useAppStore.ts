/**
 * Global app store (Zustand).
 * All state mutations go through here and are persisted to IndexedDB via the db module.
 */
import { create } from "zustand";
import type { AppState, Task, ScheduledBlock, TodoItem } from "../types";
import * as db from "../db";
import { getTodayString } from "../utils/date";

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [],
  scheduledBlocks: [],
  activeDate: getTodayString(),
  sidebarOpen: false,
  todoItems: [],
  todoPanelOpen: true,

  addTask: async (task: Task) => {
    await db.createTask(task);
    set({ tasks: [...get().tasks, task] });
  },

  updateTask: async (task: Task) => {
    await db.updateTask(task);
    set({
      tasks: get().tasks.map((t) => (t.id === task.id ? task : t)),
    });
  },

  deleteTask: async (id: string) => {
    await db.deleteTask(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },

  addScheduledBlock: async (block: ScheduledBlock) => {
    await db.createScheduledBlock(block);
    set({ scheduledBlocks: [...get().scheduledBlocks, block] });
  },

  updateScheduledBlock: async (block: ScheduledBlock) => {
    await db.updateScheduledBlock(block);
    set({
      scheduledBlocks: get().scheduledBlocks.map((b) =>
        b.id === block.id ? block : b
      ),
    });
  },

  deleteScheduledBlock: async (id: string) => {
    await db.deleteScheduledBlock(id);
    set({
      scheduledBlocks: get().scheduledBlocks.filter((b) => b.id !== id),
    });
  },

  setActiveDate: (date: string) => {
    set({ activeDate: date });
    db.setSetting("activeDate", date);
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  setTodoPanelOpen: (open: boolean) => {
    set({ todoPanelOpen: open });
  },

  addTodoItem: async (item: TodoItem) => {
    set({ todoItems: [...get().todoItems, item] });
    await db.createTodoItem(item);
  },

  updateTodoItem: async (item: TodoItem) => {
    await db.updateTodoItem(item);
    set({
      todoItems: get().todoItems.map((t) => (t.id === item.id ? item : t)),
    });
  },

  deleteTodoItem: async (id: string) => {
    await db.deleteTodoItem(id);
    set({ todoItems: get().todoItems.filter((t) => t.id !== id) });
  },

  reorderTodoItems: async (items: TodoItem[]) => {
    await db.reorderTodoItems(items);
    set({ todoItems: items });
  },

  // Load all persisted data from IndexedDB on app start.
  // Orphaned blocks (whose task was deleted) are cleaned up here.
  hydrate: async () => {
    const [tasksRes, blocksRes, dateRes, todosRes] = await Promise.allSettled([
      db.getAllTasks(),
      db.getAllScheduledBlocks(),
      db.getSetting("activeDate"),
      db.getAllTodoItems(),
    ]);

    const tasks = tasksRes.status === "fulfilled" ? tasksRes.value : [];
    const scheduledBlocks =
      blocksRes.status === "fulfilled" ? blocksRes.value : [];
    const savedDate = dateRes.status === "fulfilled" ? dateRes.value : undefined;
    const todoItems = todosRes.status === "fulfilled" ? todosRes.value : [];

    // Remove orphaned blocks whose task was deleted
    const taskIds = new Set(tasks.map((t) => t.id));
    const validBlocks: ScheduledBlock[] = [];
    for (const block of scheduledBlocks) {
      if (taskIds.has(block.taskId)) {
        validBlocks.push(block);
      } else {
        db.deleteScheduledBlock(block.id);
      }
    }

    set({
      tasks,
      scheduledBlocks: validBlocks,
      activeDate: savedDate || getTodayString(),
      todoItems: todoItems.sort((a, b) => a.order - b.order),
    });
  },
}));
