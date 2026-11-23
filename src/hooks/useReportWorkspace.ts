import { useCallback, useEffect, useState } from "react";
import {
  getCurrentReport,
  getLibrary,
  isActiveJob,
  type CurrentReport,
  type LibraryProject,
} from "../api/reports";
import { errorMessage } from "../api/client";

export function useReportWorkspace() {
  const [data, setData] = useState<{
    report: CurrentReport;
    library: LibraryProject[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      const [report, library] = await Promise.all([
        getCurrentReport(),
        getLibrary(),
      ]);
      setData({ report, library });
      setError(null);
    } catch (error) {
      setError(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getCurrentReport(controller.signal),
      getLibrary(controller.signal),
    ])
      .then(([report, library]) => {
        if (!controller.signal.aborted) {
          setData({ report, library });
          setError(null);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    const visible = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", visible);
    };
  }, [reload]);
  const active = isActiveJob(data?.report.latest_job);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let delay = 4000;
    const tick = async () => {
      try {
        const report = await getCurrentReport();
        const library = !isActiveJob(report.latest_job)
          ? await getLibrary()
          : null;
        if (cancelled) return;
        setData((previous) =>
          previous
            ? { report, library: library ?? previous.library }
            : previous,
        );
        setError(null);
        delay = 4000;
      } catch (error) {
        if (cancelled) return;
        setError(errorMessage(error));
        delay = Math.min(delay * 2, 30000);
      }
      if (!cancelled) timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active]);
  return { data, error, reload };
}
