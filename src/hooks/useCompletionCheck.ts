import { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { getTodayString } from "../utils/date";
import { sendNotification } from "../utils/notifications";

/**
 * Polls every minute to auto-complete scheduled blocks whose end time has passed.
 * Also fires a desktop notification when a block finishes (skipped on first run
 * to avoid spurious alerts when the app loads).
 */
export function useCompletionCheck(): void {
  const activeDate = useAppStore((s) => s.activeDate);
  const skipNotify = useRef(true);

  useEffect(() => {
    const check = (): void => {
      const {
        scheduledBlocks,
        tasks,
        activeDate: date,
        updateScheduledBlock,
      } = useAppStore.getState();

      const today = getTodayString();
      const now = new Date();
      const currentMinute = now.getHours() * 60 + now.getMinutes();
      // Past days: treat as fully elapsed. Future days: treat as not started.
      const effectiveMinute =
        date < today ? 1440 : date > today ? -1 : currentMinute;

      for (const block of scheduledBlocks) {
        if (
          block.date === date &&
          !block.completed &&
          effectiveMinute >= block.endMinute
        ) {
          updateScheduledBlock({ ...block, completed: true });

          if (!skipNotify.current && date === today) {
            const task = tasks.find((t) => t.id === block.taskId);
            if (task) {
              sendNotification(
                "Task Finished!",
                `${task.icon} ${task.name} — Take a Break!`
              );
            }
          }
        }
      }
      skipNotify.current = false;
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [activeDate]);
}
