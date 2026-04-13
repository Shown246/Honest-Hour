import { useState, useEffect, useCallback } from "react";
import type { Task } from "../../types";
import { useAppStore } from "../../store/useAppStore";

/** Modal for creating or editing a task. Pass `task=null` to create a new one. */

const COLOR_PRESETS = [
  "#6366f1",
  "#f43f5e",
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
] as const;

interface TaskEditModalProps {
  task: Task | null; // null = adding new
  defaultCategory: "important" | "other";
  onClose: () => void;
}

export default function TaskEditModal({
  task,
  defaultCategory,
  onClose,
}: TaskEditModalProps): React.JSX.Element {
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const [name, setName] = useState(task?.name ?? "");
  const [duration, setDuration] = useState(task?.duration ?? 30);
  const [color, setColor] = useState(task?.color ?? COLOR_PRESETS[0]);
  const [icon, setIcon] = useState(task?.icon ?? "📌");
  const [category, setCategory] = useState<"important" | "other">(
    task?.category ?? defaultCategory
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (task) {
      await updateTask({ ...task, name: trimmed, duration, color, icon, category });
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        name: trimmed,
        duration,
        color,
        icon,
        category,
        createdAt: Date.now(),
      };
      await addTask(newTask);
    }
    onClose();
  };

  const handleDelete = async (): Promise<void> => {
    if (!task) return;
    if (window.confirm(`Delete "${task.name}"?`)) {
      await deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[400px] max-w-[calc(100vw-32px)] bg-surface border border-border rounded-xl p-6 flex flex-col gap-4 animate-modal-card">
        <h2 className="text-lg font-semibold text-[#e5e5e5]">
          {task ? "Edit Task" : "Add Task"}
        </h2>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 px-3 rounded-lg bg-[#0f0f0f] border border-border text-[#e5e5e5] text-sm outline-none focus:border-accent"
            autoFocus
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            className="h-9 px-3 rounded-lg bg-[#0f0f0f] border border-border text-[#e5e5e5] text-sm outline-none focus:border-accent"
          />
        </div>

        {/* Color */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Color</label>
          <div className="flex gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#e5e5e5" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Icon */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Icon (emoji)</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="h-9 w-16 px-3 rounded-lg bg-[#0f0f0f] border border-border text-[#e5e5e5] text-sm text-center outline-none focus:border-accent"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Category</label>
          <div className="flex gap-2">
            {(["important", "other"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-accent text-white"
                    : "bg-[#0f0f0f] border border-border text-muted hover:text-[#e5e5e5]"
                }`}
              >
                {cat === "important" ? "Important" : "Other"}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {task && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-400 mr-auto"
            >
              Delete
            </button>
          )}
          <div className={`flex gap-2 ${task ? "" : "ml-auto"}`}>
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-border text-sm text-muted hover:text-[#e5e5e5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:brightness-110 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
