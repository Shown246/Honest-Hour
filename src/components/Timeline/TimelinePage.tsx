import { useState, useMemo, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import Sidebar from "../Layout/Sidebar";
import MobileDrawer from "../Layout/MobileDrawer";
import TimelineGrid from "./TimelineGrid";
import BlockDragPreview from "./DragOverlay";
import { useAppStore } from "../../store/useAppStore";
import type { Task, ScheduledBlock } from "../../types";
import { parseSlotId, checkOverlap } from "../../utils/grid";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useCompletionCheck } from "../../hooks/useCompletionCheck";
import TodoPanel from "../Todo/TodoPanel";
import TodoToggleButton from "../Todo/TodoToggleButton";

// Tracks what is currently being dragged: a task card from the sidebar, or an
// existing block on the timeline.
type ActiveDrag =
  | { type: "task"; task: Task }
  | { type: "block"; block: ScheduledBlock; task: Task }
  | null;

/**
 * Main timeline view. Manages drag-and-drop (task → slot and block → slot),
 * conflict detection, and layout for desktop/mobile breakpoints.
 */
export default function TimelinePage(): React.JSX.Element {
  const tasks = useAppStore((s) => s.tasks);
  const blocks = useAppStore((s) => s.scheduledBlocks);
  const activeDate = useAppStore((s) => s.activeDate);
  const addScheduledBlock = useAppStore((s) => s.addScheduledBlock);
  const updateScheduledBlock = useAppStore((s) => s.updateScheduledBlock);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const todoPanelOpen = useAppStore((s) => s.todoPanelOpen);
  const setTodoPanelOpen = useAppStore((s) => s.setTodoPanelOpen);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  useCompletionCheck();

  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      setTodoPanelOpen(false);
    }
  }, [sidebarOpen, isDesktop, setTodoPanelOpen]);

  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [flashBlockId, setFlashBlockId] = useState<string | null>(null);
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null);

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const t of tasks) map.set(t.id, t);
    return map;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Briefly highlight a conflicting block in red to signal a drop rejection.
  const triggerFlash = useCallback((id: string) => {
    setFlashBlockId(id);
    setTimeout(() => setFlashBlockId(null), 600);
  }, []);

  // Play a pop-in animation on the block that was just placed.
  const triggerDropAnim = useCallback((id: string) => {
    setJustDroppedId(id);
    setTimeout(() => setJustDroppedId(null), 200);
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current;
      if (!data) return;
      if (data.type === "task") {
        setActiveDrag({ type: "task", task: data.task as Task });
      } else if (data.type === "block") {
        const block = data.block as ScheduledBlock;
        const task = taskMap.get(block.taskId);
        if (task) setActiveDrag({ type: "block", block, task });
      }
    },
    [taskMap]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);

      if (!over) return;
      const slotMinute = parseSlotId(String(over.id));
      if (slotMinute === null) return;

      const data = active.data.current;
      if (!data) return;

      if (data.type === "task") {
        const task = data.task as Task;
        const startMinute = slotMinute;
        const endMinute = Math.min(1440, startMinute + task.duration);

        const conflict = checkOverlap(
          startMinute,
          endMinute,
          blocks,
          activeDate
        );
        if (conflict) {
          triggerFlash(conflict.id);
          return;
        }

        const newBlock: ScheduledBlock = {
          id: crypto.randomUUID(),
          taskId: task.id,
          date: activeDate,
          startMinute,
          endMinute,
          completed: false,
        };
        await addScheduledBlock(newBlock);
        triggerDropAnim(newBlock.id);
      } else if (data.type === "block") {
        const block = data.block as ScheduledBlock;
        const duration = block.endMinute - block.startMinute;
        const startMinute = slotMinute;
        const endMinute = Math.min(1440, startMinute + duration);

        const conflict = checkOverlap(
          startMinute,
          endMinute,
          blocks,
          activeDate,
          block.id
        );
        if (conflict) {
          triggerFlash(conflict.id);
          return;
        }

        await updateScheduledBlock({ ...block, startMinute, endMinute });
        triggerDropAnim(block.id);
      }
    },
    [
      blocks,
      activeDate,
      addScheduledBlock,
      updateScheduledBlock,
      triggerFlash,
      triggerDropAnim,
    ]
  );

  const overlayDuration = activeDrag
    ? activeDrag.type === "task"
      ? activeDrag.task.duration
      : activeDrag.block.endMinute - activeDrag.block.startMinute
    : 0;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex -mx-4 min-h-[calc(100vh-56px)]">
        {isDesktop && <Sidebar />}
        <TimelineGrid
          flashBlockId={flashBlockId}
          justDroppedId={justDroppedId}
        />
        {isDesktop && <TodoPanel />}
      </div>
      {!isDesktop && (
        <>
          <MobileDrawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          >
            <Sidebar />
          </MobileDrawer>
          <MobileDrawer
            open={todoPanelOpen}
            onClose={() => setTodoPanelOpen(false)}
            side="right"
          >
            <TodoPanel />
          </MobileDrawer>
        </>
      )}
      {isDesktop && !todoPanelOpen && (
        <TodoToggleButton onClick={() => setTodoPanelOpen(true)} />
      )}
      {!isDesktop && (
        <button
          type="button"
          onClick={() => {
            setSidebarOpen(false);
            setTodoPanelOpen(true);
          }}
          className="fixed top-[18px] right-14 z-50 text-muted hover:text-white text-sm md:hidden"
          title="Open To-Do"
        >
          ☑
        </button>
      )}
      <DragOverlay dropAnimation={null}>
        {activeDrag && (
          <BlockDragPreview
            task={activeDrag.task}
            durationMinutes={overlayDuration}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
