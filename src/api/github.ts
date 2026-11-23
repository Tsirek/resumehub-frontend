import type { Repository } from "../types";
import { request } from "./client";

export async function fetchRepositories(
  username: string,
): Promise<Repository[]> {
  return request(
    `/github/repositories?profile_url=${encodeURIComponent(`https://github.com/${username}`)}`,
  );
}
export async function importRepositories(repoIds: string[]): Promise<void> {
  await request("/projects/import", {
    method: "POST",
    body: JSON.stringify({ repoIds }),
  });
}
