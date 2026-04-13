import { NavLink } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { formatDate, addDays } from "../../utils/date";

const tabs = [
  { to: "/", label: "Timeline" },
  { to: "/tasks", label: "Tasks" },
  { to: "/trends", label: "Trends" },
] as const;

/**
 * Fixed top navigation bar.
 * Left: hamburger (mobile only). Center: page tabs. Right: date navigator.
 */
export default function TopNav(): React.JSX.Element {
  const activeDate = useAppStore((s) => s.activeDate);
  const setActiveDate = useAppStore((s) => s.setActiveDate);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-50">
      {/* Left: hamburger (mobile only) */}
      <div className="w-10 shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-lg text-muted hover:text-white transition-colors"
        >
          ☰
        </button>
      </div>

      {/* Center: tabs */}
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `relative pb-1 text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-muted hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Right: date navigation */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveDate(addDays(activeDate, -1))}
          className="w-7 h-7 flex items-center justify-center rounded text-muted hover:text-white hover:bg-border/50 transition-colors text-sm"
        >
          ‹
        </button>
        <span className="text-xs text-muted min-w-[100px] text-center select-none">
          {formatDate(activeDate)}
        </span>
        <button
          type="button"
          onClick={() => setActiveDate(addDays(activeDate, 1))}
          className="w-7 h-7 flex items-center justify-center rounded text-muted hover:text-white hover:bg-border/50 transition-colors text-sm"
        >
          ›
        </button>
      </div>
    </nav>
  );
}
