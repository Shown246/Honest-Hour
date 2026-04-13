interface TodoToggleButtonProps {
  onClick: () => void;
}

/** Fixed tab on the right edge that reopens the todo panel when it's collapsed. */
export default function TodoToggleButton({
  onClick,
}: TodoToggleButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-30 w-6 h-16 bg-surface border border-r-0 border-border rounded-l-md flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors"
      title="Open To-Do panel"
    >
      <span className="text-xs">‹</span>
    </button>
  );
}
