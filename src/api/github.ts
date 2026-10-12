import type { Repository } from '../types';
import { request } from './client';
export const fetchRepositories = (username: string) => request<Repository[]>(`/github/repos?username=${encodeURIComponent(username)}`);
export const getProjects = () => request<Repository[]>('/projects');
export const importRepositories = (repoIds: string[]) => request<void>('/projects/import', { method: 'POST', body: JSON.stringify({ repoIds }) });
