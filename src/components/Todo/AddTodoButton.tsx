import { useState, useRef, useEffect } from "react";

interface AddTodoButtonProps {
  onAdd: (text: string) => void;
}

/**
 * Toggles between a "+" button and an inline text input.
 * Commits on Enter or blur; cancels on Escape.
 */
export default function AddTodoButton({
  onAdd,
}: AddTodoButtonProps): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onAdd(trimmed);
      setText("");
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setText("");
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder="What needs doing?"
        className="w-full h-9 px-3 rounded-[6px] border border-border bg-[#0f0f0f] text-sm text-[#e5e5e5] placeholder:text-muted outline-none focus:border-accent transition-colors"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full h-9 rounded-[6px] border border-dashed border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors"
    >
      +
    </button>
  );
}
