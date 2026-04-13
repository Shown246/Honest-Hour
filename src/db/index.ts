/**
 * IndexedDB persistence layer using the `idb` wrapper.
 * All reads/writes are no-ops when the DB is unavailable (e.g. private browsing).
 */
import { openDB, type IDBPDatabase } from "idb";
import type { Task, ScheduledBlock, TodoItem } from "../types";

const DB_NAME = "corehour-db";
const DB_VERSION = 4;

interface CoreHourDB {
  tasks: {
    key: string;
    value: Task;
    indexes: { "by-category": string };
  };
  scheduledBlocks: {
    key: string;
    value: ScheduledBlock;
    indexes: { "by-date": string };
  };
  todoItems: {
    key: string;
    value: TodoItem;
  };
  settings: {
    key: string;
    value: string;
  };
}

// Set to true after the first open failure; all subsequent calls skip the DB.
let dbFailed = false;

// Opens (and upgrades) the DB on first call; returns null if unavailable.
async function getDb(): Promise<IDBPDatabase<CoreHourDB> | null> {
  if (dbFailed) return null;
  try {
    return await openDB<CoreHourDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
          taskStore.createIndex("by-category", "category");
          const blockStore = db.createObjectStore("scheduledBlocks", {
            keyPath: "id",
          });
          blockStore.createIndex("by-date", "date");
        }
        if (oldVersion < 2) {
          db.createObjectStore("settings");
        }
        if (oldVersion < 3) {
          db.createObjectStore("todoItems", { keyPath: "id" });
        }
        if (oldVersion < 4) {
          // Recovery: create todoItems if it was missed in a v3 upgrade
          if (!db.objectStoreNames.contains("todoItems")) {
            db.createObjectStore("todoItems", { keyPath: "id" });
          }
        }
      },
    });
  } catch {
    dbFailed = true;
    return null;
  }
}

export function isDbAvailable(): boolean {
  return !dbFailed;
}

// --- Settings ---

export async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  return db.get("settings", key);
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("settings", value, key);
}

// --- Task CRUD ---

export async function createTask(task: Task): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("tasks", task);
}

export async function updateTask(task: Task): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("tasks", task);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete("tasks", id);
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("tasks");
}

export async function getTasksByCategory(
  category: "important" | "other"
): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAllFromIndex("tasks", "by-category", category);
}

// --- ScheduledBlock CRUD ---

export async function createScheduledBlock(
  block: ScheduledBlock
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("scheduledBlocks", block);
}

export async function updateScheduledBlock(
  block: ScheduledBlock
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("scheduledBlocks", block);
}

export async function deleteScheduledBlock(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete("scheduledBlocks", id);
}

export async function getAllScheduledBlocks(): Promise<ScheduledBlock[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("scheduledBlocks");
}

export async function getScheduledBlocksByDate(
  date: string
): Promise<ScheduledBlock[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAllFromIndex("scheduledBlocks", "by-date", date);
}

// --- TodoItem CRUD ---

export async function createTodoItem(item: TodoItem): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("todoItems", item);
}

export async function updateTodoItem(item: TodoItem): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("todoItems", item);
}

export async function deleteTodoItem(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete("todoItems", id);
}

export async function getAllTodoItems(): Promise<TodoItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("todoItems");
}

// Writes all items in a single transaction to preserve consistent order.
export async function reorderTodoItems(items: TodoItem[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const tx = db.transaction("todoItems", "readwrite");
  for (const item of items) {
    tx.store.put(item);
  }
  await tx.done;
}
