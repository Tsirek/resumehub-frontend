import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { isActiveJob } from "../../api/reports";
import { PageHeader } from "../../components/layout/PageHeader";
import { ProjectsTabs } from "../../components/projects/ProjectsTabs";
import { RepositoriesTab } from "../../components/projects/RepositoriesTab";
import { ReportTab } from "../../components/projects/ReportTab";
import { TasksTab } from "../../components/projects/TasksTab";
import {
  PROJECT_TABS,
  parseProjectsTab,
} from "../../components/projects/projectsSection";
import { Button } from "../../components/ui/Button";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useReportWorkspace } from "../../hooks/useReportWorkspace";
import type { ProjectsTab } from "../../router/paths";

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const tab = parseProjectsTab(params.get("tab"));
  const { data, error, reload } = useReportWorkspace();

  const tabLabel = PROJECT_TABS.find((item) => item.id === tab)!.label;
  usePageTitle(tab === "repositories" ? null : `Проекты / ${tabLabel}`);

  const openTab = useCallback(
    (next: ProjectsTab) => {
      setParams(next === "repositories" ? {} : { tab: next });
    },
    [setParams],
  );

  // Вкладкам «Репозитории» и «Мой отчёт» нужны данные /github/report и /github/library
  const workspaceFallback = error ? (
    <>
      <p role="alert" className="text-red-600">
        {error}
      </p>
      <Button onClick={() => void reload()}>Повторить</Button>
    </>
  ) : (
    <p>Загрузка проектов…</p>
  );

  return (
    <>
      <PageHeader
        title="Один профиль. Нужные проекты"
        subtitle="Выберите репозитории, запустите анализ и следите за отчётом и фоновыми задачами в одном разделе."
      />
      <ProjectsTabs
        current={tab}
        onSelect={openTab}
        hasActiveJob={isActiveJob(data?.report.latest_job)}
      />

      <div
        role="tabpanel"
        id="projects-panel-repositories"
        aria-labelledby="projects-tab-repositories"
        hidden={tab !== "repositories"}
      >
        {data ? (
          <RepositoriesTab
            workspace={data}
            refresh={reload}
            loadError={error}
            onOpenTab={openTab}
          />
        ) : (
          workspaceFallback
        )}
      </div>

      {tab === "report" && (
        <div
          role="tabpanel"
          id="projects-panel-report"
          aria-labelledby="projects-tab-report"
        >
          {data ? (
            <ReportTab workspace={data} error={error} onOpenTab={openTab} />
          ) : (
            workspaceFallback
          )}
        </div>
      )}

      {tab === "tasks" && (
        <div
          role="tabpanel"
          id="projects-panel-tasks"
          aria-labelledby="projects-tab-tasks"
        >
          <TasksTab onOpenTab={openTab} />
        </div>
      )}
    </>
  );
}