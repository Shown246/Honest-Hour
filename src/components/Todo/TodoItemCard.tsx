import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TodoItem } from "../../types";

interface TodoItemCardProps {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
}

/** Sortable todo row with a drag handle, checkbox, text, and delete button. */
export default function TodoItemCard({
  item,
  onToggle,
  onDelete,
}: TodoItemCardProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/[0.04] transition-colors"
    >
      <button
        type="button"
        className="shrink-0 text-muted hover:text-white cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`shrink-0 w-4 h-4 rounded border transition-colors ${
          item.completed
            ? "bg-accent border-accent"
            : "border-muted hover:border-accent"
        }`}
      >
        {item.completed && (
          <span className="flex items-center justify-center text-white text-[10px]">
            ✓
          </span>
        )}
      </button>

      <span
        className={`flex-1 text-sm truncate ${
          item.completed
            ? "line-through text-muted opacity-50"
            : "text-[#e5e5e5]"
        }`}
      >
        {item.text}
      </span>

      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 text-muted hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
