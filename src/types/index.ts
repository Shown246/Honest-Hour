/** A user-defined reusable task template (name, color, icon, duration). */
export interface Task {
  id: string;
  name: string;
  duration: number; // minutes
  color: string; // hex
  icon: string; // emoji
  category: "important" | "other";
  createdAt: number; // Date.now()
}

/** A task placed on the timeline for a specific date and time range. */
export interface ScheduledBlock {
  id: string;
  taskId: string;
  date: string; // "YYYY-MM-DD"
  startMinute: number; // 0-1439
  endMinute: number;
  completed: boolean;
}

/** A single item in the side todo list. */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  order: number; // display order for drag-to-reorder
  createdAt: number;
}

/** Global Zustand store shape — state + all action signatures. */
export interface AppState {
  tasks: Task[];
  scheduledBlocks: ScheduledBlock[];
  activeDate: string;
  sidebarOpen: boolean;
  todoItems: TodoItem[];
  todoPanelOpen: boolean;

  // Task actions
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // ScheduledBlock actions
  addScheduledBlock: (block: ScheduledBlock) => Promise<void>;
  updateScheduledBlock: (block: ScheduledBlock) => Promise<void>;
  deleteScheduledBlock: (id: string) => Promise<void>;

  // Date & UI
  setActiveDate: (date: string) => void;
  setSidebarOpen: (open: boolean) => void;

  // Todo actions
  addTodoItem: (item: TodoItem) => Promise<void>;
  updateTodoItem: (item: TodoItem) => Promise<void>;
  deleteTodoItem: (id: string) => Promise<void>;
  reorderTodoItems: (items: TodoItem[]) => Promise<void>;
  setTodoPanelOpen: (open: boolean) => void;

  // Hydration
  hydrate: () => Promise<void>;
}
