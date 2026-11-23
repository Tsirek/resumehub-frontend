import type { useReportWorkspace } from "../../hooks/useReportWorkspace";
import type { ProjectsTab } from "../../router/paths";

export type Workspace = NonNullable<
  ReturnType<typeof useReportWorkspace>["data"]
>;

export const PROJECT_TABS: { id: ProjectsTab; label: string }[] = [
  { id: "repositories", label: "Репозитории" },
  { id: "report", label: "Мой отчёт" },
  { id: "tasks", label: "Фоновые задачи" },
];

export const parseProjectsTab = (value: string | null): ProjectsTab =>
  PROJECT_TABS.find((tab) => tab.id === value)?.id ?? "repositories";