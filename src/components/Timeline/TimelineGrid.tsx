import { useEffect, useRef, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useAppStore } from "../../store/useAppStore";
import type { Task } from "../../types";
import TimeBlock from "./TimeBlock";
import CurrentTimeIndicator from "./CurrentTimeIndicator";
import { HOUR_HEIGHT } from "../../utils/grid";

const LABEL_WIDTH = 60; // px width reserved for the hour labels on the left
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

interface TimelineGridProps {
  flashBlockId: string | null;
  justDroppedId: string | null;
}

/**
 * Scrollable 24-hour grid. Each hour row contains two 30-minute droppable slots.
 * Placed blocks are rendered in an absolute overlay above the slots.
 */
export default function TimelineGrid({
  flashBlockId,
  justDroppedId,
}: TimelineGridProps): React.JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tasks = useAppStore((s) => s.tasks);
  const blocks = useAppStore((s) => s.scheduledBlocks);
  const activeDate = useAppStore((s) => s.activeDate);

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const t of tasks) map.set(t.id, t);
    return map;
  }, [tasks]);

  const todayBlocks = useMemo(
    () => blocks.filter((b) => b.date === activeDate),
    [blocks, activeDate]
  );

  // Set of start-minutes (in 30-min steps) already covered by a block,
  // used to colour drop targets red when a drag hovers over a taken slot.
  const occupiedSlots = useMemo(() => {
    const set = new Set<number>();
    for (const b of todayBlocks) {
      for (let m = b.startMinute; m < b.endMinute; m += 30) {
        set.add(m);
      }
    }
    return set;
  }, [todayBlocks]);

  const currentHour = new Date().getHours();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const viewHeight = el.clientHeight;
    const target =
      currentHour * HOUR_HEIGHT - viewHeight / 2 + HOUR_HEIGHT / 2;
    el.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      style={{ height: "calc(100vh - 56px)" }}
    >
      <div className="relative" style={{ height: 24 * HOUR_HEIGHT }}>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="flex border-b border-[#2a2a2a]"
            style={{
              height: HOUR_HEIGHT,
              backgroundColor: hour % 2 === 0 ? "#0f0f0f" : "#141414",
              borderLeft:
                hour === currentHour
                  ? "2px solid rgba(99, 102, 241, 0.4)"
                  : "2px solid transparent",
            }}
          >
            <button
              type="button"
              onClick={() =>
                scrollRef.current?.scrollTo({
                  top: hour * HOUR_HEIGHT,
                  behavior: "smooth",
                })
              }
              className="w-[60px] shrink-0 text-xs text-muted hover:text-[#e5e5e5] pt-1 pr-2 text-right select-none bg-transparent border-none cursor-pointer transition-colors"
            >
              {getHourLabel(hour)}
            </button>
            <div className="flex-1 flex flex-col">
              <DroppableSlot
                startMinute={hour * 60}
                isHalfHour={false}
                isOccupied={occupiedSlots.has(hour * 60)}
              />
              <DroppableSlot
                startMinute={hour * 60 + 30}
                isHalfHour
                isOccupied={occupiedSlots.has(hour * 60 + 30)}
              />
            </div>
          </div>
        ))}

        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: LABEL_WIDTH, right: 0 }}
        >
          {todayBlocks.map((block) => {
            const task = taskMap.get(block.taskId);
            if (!task) return null;
            return (
              <TimeBlock
                key={block.id}
                block={block}
                task={task}
                isFlashing={flashBlockId === block.id}
                isJustDropped={justDroppedId === block.id}
              />
            );
          })}
          <CurrentTimeIndicator />
        </div>
      </div>
    </div>
  );
}

/* ── Single 30-minute drop target within an hour row ── */

interface DroppableSlotProps {
  startMinute: number;
  isHalfHour: boolean;
  isOccupied: boolean;
}

function DroppableSlot({
  startMinute,
  isHalfHour,
  isOccupied,
}: DroppableSlotProps): React.JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${startMinute}`,
  });

  return (
    <div
      ref={setNodeRef}
      data-timeslot={startMinute}
      className={`flex-1 transition-colors duration-150 ${
        isHalfHour ? "border-t border-dashed border-[#1f1f1f]" : ""
      }`}
      style={
        isOver
          ? {
              backgroundColor: isOccupied
                ? "rgba(239, 68, 68, 0.1)"
                : "#2a2a2a",
            }
          : undefined
      }
    />
  );
}
