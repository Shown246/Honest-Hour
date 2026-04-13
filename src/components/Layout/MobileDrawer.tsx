interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  children: React.ReactNode;
}

/**
 * Slide-in drawer for mobile screens.
 * Renders a backdrop overlay and a panel from the specified side (default: left).
 */
export default function MobileDrawer({
  open,
  onClose,
  side = "left",
  children,
}: MobileDrawerProps): React.JSX.Element {
  const isLeft = side === "left";

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-14 bottom-0 w-[280px] bg-surface z-40 transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${
          isLeft ? "left-0 border-r border-border" : "right-0 border-l border-border"
        } ${
          open
            ? "translate-x-0"
            : isLeft
              ? "-translate-x-full"
              : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-3 ${isLeft ? "right-3" : "left-3"} text-muted hover:text-white text-lg z-10`}
        >
          ✕
        </button>
        {children}
      </div>
    </>
  );
}
