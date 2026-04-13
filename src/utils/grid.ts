import type { ScheduledBlock } from "../types";

/** Pixel height of one hour row in the timeline grid. */
export const HOUR_HEIGHT = 120;
/** Pixels per minute derived from HOUR_HEIGHT. */
export const PX_PER_MINUTE = HOUR_HEIGHT / 60;

/** Snaps a raw minute value to the nearest 30-minute boundary. */
export function snapToGrid(rawMinute: number): number {
  return Math.round(rawMinute / 30) * 30;
}

/**
 * Returns the first block on `date` that overlaps the given range,
 * ignoring `excludeId` (used when moving an existing block).
 */
export function checkOverlap(
  startMinute: number,
  endMinute: number,
  blocks: ScheduledBlock[],
  date: string,
  excludeId?: string
): ScheduledBlock | null {
  return (
    blocks.find(
      (b) =>
        b.date === date &&
        b.id !== excludeId &&
        b.startMinute < endMinute &&
        b.endMinute > startMinute
    ) ?? null
  );
}

/** Extracts the start-minute number from a droppable slot id like "slot-90". */
export function parseSlotId(id: string): number | null {
  if (!id.startsWith("slot-")) return null;
  const num = Number(id.slice(5));
  return Number.isNaN(num) ? null : num;
}
