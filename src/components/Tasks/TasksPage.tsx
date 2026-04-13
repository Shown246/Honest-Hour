import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Task } from "../../types";
import TaskEditModal from "./TaskEditModal";

type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; task: Task };

export default function TasksPage(): React.JSX.Element {
  const tasks = useAppStore((s) => s.tasks);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const important = tasks.filter((t) => t.category === "important");
  const other = tasks.filter((t) => t.category === "other");

  const handleDelete = async (task: Task): Promise<void> => {
    if (window.confirm(`Delete "${task.name}"?`)) {
      await deleteTask(task.id);
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#e5e5e5]">Task Manager</h1>
        <button
          type="button"
          onClick={() => setModal({ mode: "add" })}
          className="h-9 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:brightness-110 transition-all"
        >
          Add Task
        </button>
      </div>

      {tasks.length === 0 && (
        <p className="text-muted text-sm text-center py-12">
          No tasks yet. Click "Add Task" to create one.
        </p>
      )}

      {important.length > 0 && (
        <TaskGroup
          label="Important"
          tasks={important}
          onEdit={(t) => setModal({ mode: "edit", task: t })}
          onDelete={handleDelete}
        />
      )}

      {other.length > 0 && (
        <TaskGroup
          label="Other"
          tasks={other}
          onEdit={(t) => setModal({ mode: "edit", task: t })}
          onDelete={handleDelete}
        />
      )}

      {modal.mode !== "closed" && (
        <TaskEditModal
          task={modal.mode === "edit" ? modal.task : null}
          defaultCategory="important"
          onClose={() => setModal({ mode: "closed" })}
        />
      )}
    </div>
  );
}

interface TaskGroupProps {
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function TaskGroup({ label, tasks, onEdit, onDelete }: TaskGroupProps): React.JSX.Element {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">{label}</h2>
      <div className="flex flex-col gap-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 h-12 px-4 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: task.color }}
            />
            <span className="text-sm">{task.icon}</span>
            <span className="text-sm text-[#e5e5e5] flex-1 truncate">{task.name}</span>
            <span className="text-xs text-muted">{task.duration}m</span>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="text-xs text-muted hover:text-[#e5e5e5] transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
