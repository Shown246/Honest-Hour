import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Task } from "../../types";
import TaskCard from "../Tasks/TaskCard";
import AddTaskButton from "../Tasks/AddTaskButton";
import TaskEditModal from "../Tasks/TaskEditModal";

type ModalState =
  | { mode: "closed" }
  | { mode: "add"; category: "important" | "other" }
  | { mode: "edit"; task: Task };

/**
 * Left sidebar showing task cards grouped by category.
 * Tasks can be dragged onto the timeline or clicked to open the edit modal.
 */
export default function Sidebar(): React.JSX.Element {
  const tasks = useAppStore((s) => s.tasks);
  const [importantOpen, setImportantOpen] = useState(true);
  const [otherOpen, setOtherOpen] = useState(true);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const important = tasks.filter((t) => t.category === "important");
  const other = tasks.filter((t) => t.category === "other");

  return (
    <>
      <aside className="w-[280px] shrink-0 bg-surface border-r border-border overflow-y-auto flex flex-col">
        <Section
          label="Important"
          count={important.length}
          open={importantOpen}
          onToggle={() => setImportantOpen(!importantOpen)}
        >
          {important.length === 0 ? (
            <p className="text-xs text-muted py-3 text-center">
              Add a task to get started
            </p>
          ) : (
            important.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onClick={() => setModal({ mode: "edit", task: t })}
              />
            ))
          )}
          <AddTaskButton
            onClick={() => setModal({ mode: "add", category: "important" })}
          />
        </Section>

        <Section
          label="Other"
          count={other.length}
          open={otherOpen}
          onToggle={() => setOtherOpen(!otherOpen)}
        >
          {other.length === 0 ? (
            <p className="text-xs text-muted py-3 text-center">
              Add a task to get started
            </p>
          ) : (
            other.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onClick={() => setModal({ mode: "edit", task: t })}
              />
            ))
          )}
          <AddTaskButton
            onClick={() => setModal({ mode: "add", category: "other" })}
          />
        </Section>
      </aside>

      {modal.mode !== "closed" && (
        <TaskEditModal
          task={modal.mode === "edit" ? modal.task : null}
          defaultCategory={modal.mode === "add" ? modal.category : "important"}
          onClose={() => setModal({ mode: "closed" })}
        />
      )}
    </>
  );
}

interface SectionProps {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({
  label,
  count,
  open,
  onToggle,
  children,
}: SectionProps): React.JSX.Element {
  return (
    <div className="p-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 mb-2 text-sm font-bold text-[#e5e5e5] hover:text-white"
      >
        <span
          className="text-xs transition-transform duration-200"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          ▾
        </span>
        <span>{label}</span>
        <span className="ml-auto text-xs font-normal text-muted bg-[#0f0f0f] px-2 py-0.5 rounded-full">
          {count}
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="flex flex-col gap-1.5">{children}</div>
      </div>
    </div>
  );
}
