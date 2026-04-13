interface AddTaskButtonProps {
  onClick: () => void;
}

export default function AddTaskButton({ onClick }: AddTaskButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-9 rounded-[6px] border border-dashed border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors"
    >
      +
    </button>
  );
}
