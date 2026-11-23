import { cn } from "../../lib/utils";
import type { ProjectsTab } from "../../router/paths";
import { PROJECT_TABS } from "./projectsSection";

interface ProjectsTabsProps {
  current: ProjectsTab;
  onSelect: (tab: ProjectsTab) => void;
  hasActiveJob: boolean;
}

export function ProjectsTabs({
  current,
  onSelect,
  hasActiveJob,
}: ProjectsTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Разделы проектов"
      className="mb-8 flex flex-wrap gap-3"
    >
      {PROJECT_TABS.map(({ id, label }) => {
        const selected = current === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`projects-tab-${id}`}
            aria-selected={selected}
            aria-controls={`projects-panel-${id}`}
            onClick={() => onSelect(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors",
              selected
                ? "bg-primary-soft text-primary"
                : "bg-white text-muted hover:bg-field hover:text-ink",
            )}
          >
            {label}
            {id === "tasks" && hasActiveJob && (
              <>
                <span
                  aria-hidden
                  className="size-2 animate-pulse rounded-full bg-primary"
                />
                <span className="sr-only">(есть активная задача)</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}