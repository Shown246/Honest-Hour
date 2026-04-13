import { useState, useEffect } from "react";
import { getCurrentMinuteOfDay } from "../../utils/time";

const HOUR_HEIGHT = 120;
const PX_PER_MINUTE = HOUR_HEIGHT / 60; // 2

/**
 * Red line that marks the current time on the timeline grid.
 * Updates its position every minute.
 */
export default function CurrentTimeIndicator(): React.JSX.Element {
  const [minuteOfDay, setMinuteOfDay] = useState(getCurrentMinuteOfDay);

  useEffect(() => {
    const id = setInterval(() => {
      setMinuteOfDay(getCurrentMinuteOfDay());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const top = minuteOfDay * PX_PER_MINUTE;

  return (
    <div className="absolute left-0 right-0" style={{ top }}>
      <div className="relative flex items-center">
        <div className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0 -ml-1" />
        <div className="flex-1 h-[2px] bg-[#ef4444]" />
      </div>
    </div>
  );
}
