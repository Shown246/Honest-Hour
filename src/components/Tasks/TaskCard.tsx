import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../../types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

/**
 * Draggable task card shown in the sidebar. Clicking it opens the edit modal.
 * Dragging it onto the timeline creates a new scheduled block.
 */
export default function TaskCard({
  task,
  onClick,
}: TaskCardProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task" as const, task },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...listeners}
      {...attributes}
      className={`group relative w-full flex items-center gap-2 h-12 px-3 rounded-[6px] text-left text-sm text-white transition-opacity duration-150 ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{
        backgroundColor: `${task.color}26`,
        borderLeft: `4px solid ${task.color}`,
      }}
    >
      <div className="absolute inset-0 rounded-[6px] bg-white/0 group-hover:bg-white/[0.08] transition-colors duration-150 pointer-events-none" />
      <span>{task.icon}</span>
      <span className="truncate flex-1">{task.name}</span>
      <span className="text-muted text-xs shrink-0">{task.duration}m</span>
    </button>
  );
}
