import { useState, useCallback, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { ScheduledBlock, Task } from "../../types";
import { minutesToTimeString } from "../../utils/time";
import { useAppStore } from "../../store/useAppStore";
import { PX_PER_MINUTE, snapToGrid, checkOverlap } from "../../utils/grid";

const COMPACT_THRESHOLD = 40; // px height below which only the task name is shown
const MIN_DURATION = 30; // minimum block length in minutes when resizing

interface TimeBlockProps {
  block: ScheduledBlock;
  task: Task;
  isFlashing?: boolean;
  isJustDropped?: boolean;
}

/**
 * Renders a scheduled block on the timeline. Supports drag-to-move and
 * pointer-drag resize from the bottom edge. Dims and shows a checkmark when completed.
 */
export default function TimeBlock({
  block,
  task,
  isFlashing,
  isJustDropped,
}: TimeBlockProps): React.JSX.Element {
  const updateScheduledBlock = useAppStore((s) => s.updateScheduledBlock);
  const scheduledBlocks = useAppStore((s) => s.scheduledBlocks);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: { type: "block" as const, block },
  });

  const [resizeEnd, setResizeEnd] = useState<number | null>(null);
  const resizeEndRef = useRef<number | null>(null);

  const displayEnd = resizeEnd ?? block.endMinute;
  const top = block.startMinute * PX_PER_MINUTE;
  const height = (displayEnd - block.startMinute) * PX_PER_MINUTE;
  const compact = height < COMPACT_THRESHOLD;
  const done = block.completed;

  // Pointer-drag handler on the bottom resize handle.
  // Snaps the end time to 30-min boundaries and rejects changes that would cause overlap.
  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const startY = e.clientY;
      const startEndMinute = block.endMinute;

      const onMove = (me: PointerEvent): void => {
        const deltaMinutes = (me.clientY - startY) / PX_PER_MINUTE;
        const snapped = snapToGrid(startEndMinute + deltaMinutes);
        const clamped = Math.max(
          block.startMinute + MIN_DURATION,
          Math.min(1440, snapped)
        );
        resizeEndRef.current = clamped;
        setResizeEnd(clamped);
      };

      const onUp = (): void => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        const finalEnd = resizeEndRef.current;
        if (finalEnd !== null && finalEnd !== block.endMinute) {
          const overlap = checkOverlap(
            block.startMinute,
            finalEnd,
            scheduledBlocks,
            block.date,
            block.id
          );
          if (!overlap) {
            updateScheduledBlock({ ...block, endMinute: finalEnd });
          }
        }
        resizeEndRef.current = null;
        setResizeEnd(null);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [block, scheduledBlocks, updateScheduledBlock]
  );

  let animClass = "";
  if (isFlashing) animClass = "animate-conflict-flash";
  else if (isJustDropped) animClass = "animate-block-drop";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`absolute left-1 right-1 rounded-[6px] px-2 py-1 text-[13px] overflow-hidden pointer-events-auto select-none transition-[filter] duration-150 ${
        done
          ? "text-[#9ca3af] cursor-default"
          : "text-white cursor-grab active:cursor-grabbing hover:brightness-110"
      } ${animClass}`}
      style={{
        top,
        height,
        backgroundColor: done ? "#374151" : task.color,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      {done && (
        <span className="absolute top-1 right-1.5 text-[10px]">✓</span>
      )}
      {compact ? (
        <span className="truncate block leading-tight mt-0.5">
          {task.name}
        </span>
      ) : (
        <>
          <div className="font-medium truncate">
            {task.icon} {task.name}
          </div>
          <div className="text-[11px] opacity-75 mt-0.5">
            {minutesToTimeString(block.startMinute)} &ndash;{" "}
            {minutesToTimeString(displayEnd)}
          </div>
        </>
      )}
      {!done && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-white/20"
          onPointerDown={handleResizeStart}
        />
      )}
    </div>
  );
}
