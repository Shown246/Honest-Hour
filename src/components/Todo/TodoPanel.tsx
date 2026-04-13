import { useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useAppStore } from "../../store/useAppStore";
import type { TodoItem } from "../../types";
import TodoItemCard from "./TodoItemCard";
import AddTodoButton from "./AddTodoButton";

/**
 * Collapsible side panel for the todo list.
 * Supports drag-to-reorder, toggle completion, add, and delete.
 */
export default function TodoPanel(): React.JSX.Element {
  const todoItems = useAppStore((s) => s.todoItems);
  const todoPanelOpen = useAppStore((s) => s.todoPanelOpen);
  const setTodoPanelOpen = useAppStore((s) => s.setTodoPanelOpen);
  const addTodoItem = useAppStore((s) => s.addTodoItem);
  const updateTodoItem = useAppStore((s) => s.updateTodoItem);
  const deleteTodoItem = useAppStore((s) => s.deleteTodoItem);
  const reorderTodoItems = useAppStore((s) => s.reorderTodoItems);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = todoItems.findIndex((t) => t.id === active.id);
      const newIndex = todoItems.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(todoItems, oldIndex, newIndex).map(
        (item, i) => ({ ...item, order: i })
      );
      reorderTodoItems(reordered);
    },
    [todoItems, reorderTodoItems]
  );

  const handleAdd = useCallback(
    (text: string) => {
      const newItem: TodoItem = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        order: todoItems.length,
        createdAt: Date.now(),
      };
      addTodoItem(newItem);
    },
    [todoItems.length, addTodoItem]
  );

  const handleToggle = useCallback(
    (item: TodoItem) => {
      updateTodoItem({ ...item, completed: !item.completed });
    },
    [updateTodoItem]
  );

  return (
    <aside
      className="shrink-0 bg-surface border-l border-border overflow-y-auto flex flex-col transition-all duration-300 ease-in-out"
      style={{ width: todoPanelOpen ? 250 : 0, minWidth: todoPanelOpen ? 250 : 0 }}
    >
      <div className="p-3 flex flex-col h-full" style={{ minWidth: 250 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#e5e5e5]">To-Do</span>
          <button
            type="button"
            onClick={() => setTodoPanelOpen(false)}
            className="text-muted hover:text-white text-xs transition-colors"
            title="Collapse panel"
          >
            ›
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={todoItems.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {todoItems.map((item) => (
                <TodoItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => handleToggle(item)}
                  onDelete={() => deleteTodoItem(item.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="pt-2">
          <AddTodoButton onAdd={handleAdd} />
        </div>
      </div>
    </aside>
  );
}
