import type { Repository } from "../types";
import { request } from "./client";

export interface LibraryProject extends Repository {
  repo_id: string;
  github_username: string | null;
  declared_role: string | null;
  started_at: string | null;
  ended_at: string | null;
  full_name?: string;
  report_text: string | null;
  summary_ru: string | null;
  cache_matches_inputs: boolean;
}
export interface JobRepository {
  repo_id: string;
  name: string;
  repository_url: string | null;
  commit_sha: string | null;
  source: "github" | "cache" | null;
}
export type JobStatus =
  | "queued"
  | "preparing"
  | "waiting"
  | "completed"
  | "failed"
  | "timed_out"
  | "superseded";
export interface ReportJob {
  id: string;
  status: JobStatus;
  repo_ids: string[];
  repositories: JobRepository[];
  attempts: number;
  error: string | null;
  created_at: string;
  updated_at: string | null;
}
export interface CurrentReport {
  report_text: string | null;
  summary_ru: string | null;
  is_current: boolean;
  selected_repo_ids: string[];
  report_repo_ids: string[];
  report_job_id: string | null;
  latest_job: ReportJob | null;
}
export interface JobPage {
  items: ReportJob[];
  next_cursor: string | null;
}
export const isActiveJob = (job: ReportJob | null | undefined) =>
  !!job && ["queued", "preparing", "waiting"].includes(job.status);
export const jobStatusText: Record<JobStatus, string> = {
  queued: "В очереди",
  preparing: "Проверяем репозитории",
  waiting: "Ожидаем результат Core",
  completed: "Готово",
  failed: "Ошибка",
  timed_out: "Время ожидания истекло",
  superseded: "Заменено новым запросом",
};
export const getLibrary = (signal?: AbortSignal) =>
  request<LibraryProject[]>("/github/library", { signal });
export const getCurrentReport = (signal?: AbortSignal) =>
  request<CurrentReport>("/github/report", { signal });
export const getReportJob = (id: string) =>
  request<ReportJob>(`/github/report-jobs/${id}`);
export const listReportJobs = (cursor?: string, signal?: AbortSignal) =>
  request<JobPage>(
    `/github/report-jobs?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    { signal },
  );
export const generateReport = (repoIds: string[], requestId: string) =>
  request<ReportJob>("/github/report-jobs", {
    method: "POST",
    body: JSON.stringify({ repo_ids: repoIds, request_id: requestId }),
  });
export const saveLibrary = (
  projects: Pick<
    LibraryProject,
    "repo_id" | "github_username" | "declared_role" | "started_at" | "ended_at"
  >[],
) =>
  request<LibraryProject[]>("/github/library", {
    method: "PUT",
    body: JSON.stringify({ projects }),
  });
