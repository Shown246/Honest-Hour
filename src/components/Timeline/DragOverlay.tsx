import type { Task } from "../../types";
import { HOUR_HEIGHT } from "../../utils/grid";

interface BlockDragPreviewProps {
  task: Task;
  durationMinutes: number;
}

/** Ghost block rendered under the pointer while a drag is in progress. */
export default function BlockDragPreview({
  task,
  durationMinutes,
}: BlockDragPreviewProps): React.JSX.Element {
  const height = (durationMinutes / 60) * HOUR_HEIGHT;

  return (
    <div
      className="rounded-[6px] px-2 py-1 text-white text-[13px] opacity-50 pointer-events-none"
      style={{
        width: 200,
        height: Math.max(24, height),
        backgroundColor: task.color,
      }}
    >
      <div className="font-medium truncate">
        {task.icon} {task.name}
      </div>
      {height >= 40 && (
        <div className="text-[11px] opacity-75 mt-0.5">{durationMinutes}m</div>
      )}
    </div>
  );
}
