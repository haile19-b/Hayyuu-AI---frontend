import { apiFetch } from './api';
import {
  GitHubInstallUrlResponse,
  GitHubStatusResponse,
  GitHubRepositoryItem,
  GitHubLiveDataResponse,
  CommitInfo,
} from '@/types';

export class GitHubApiService {
  /**
   * Fetches the GitHub App installation URL including CSRF state token.
   */
  static async getInstallUrl(projectId: string) {
    return await apiFetch<GitHubInstallUrlResponse>(
      `/api/v1/projects/${projectId}/github/install-url`
    );
  }

  /**
   * Connects the GitHub App installation to the project.
   */
  static async connectInstallation(
    projectId: string,
    installationId: string,
    state?: string,
    selectedRepos?: string[]
  ) {
    return await apiFetch<GitHubStatusResponse>(
      `/api/v1/projects/${projectId}/github/connect`,
      {
        method: 'POST',
        body: JSON.stringify({
          installationId,
          state,
          selectedRepos,
        }),
      }
    );
  }

  /**
   * Fetches current connection status, assigned repositories, and accessible repositories.
   */
  static async getStatus(projectId: string) {
    return await apiFetch<GitHubStatusResponse>(
      `/api/v1/projects/${projectId}/github/status`
    );
  }

  /**
   * Fetches accessible repositories for an installation to allow repo switching or assignment.
   */
  static async getRepositories(projectId: string) {
    return await apiFetch<GitHubRepositoryItem[]>(
      `/api/v1/projects/${projectId}/github/repositories`
    );
  }

  /**
   * Links and activates a specific repository (owner & repo) for this project.
   */
  static async selectRepository(
    projectId: string,
    owner: string,
    repo: string
  ) {
    return await apiFetch<GitHubStatusResponse>(
      `/api/v1/projects/${projectId}/github/select-repo`,
      {
        method: 'POST',
        body: JSON.stringify({
          owner,
          repo,
        }),
      }
    );
  }

  /**
   * Assigns multiple repositories to this project's environment.
   */
  static async assignRepositories(
    projectId: string,
    repositories: { owner: string; repo: string }[],
    activeRepo?: string
  ) {
    return await apiFetch<GitHubStatusResponse>(
      `/api/v1/projects/${projectId}/github/assign-repos`,
      {
        method: 'POST',
        body: JSON.stringify({
          repositories,
          activeRepo,
        }),
      }
    );
  }

  /**
   * Fetches aggregated real-time repository data (branches, commits, PRs, issues, metrics).
   */
  static async getLiveData(projectId: string, repo?: string, branch?: string) {
    const params = new URLSearchParams();
    if (repo) params.set('repo', repo);
    if (branch) params.set('branch', branch);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return await apiFetch<GitHubLiveDataResponse>(
      `/api/v1/projects/${projectId}/github/live-data${queryString}`
    );
  }

  /**
   * Fetches real-time commits for a specific repository and branch.
   */
  static async getCommits(
    projectId: string,
    repo?: string,
    branch?: string,
    perPage: number = 15
  ) {
    const params = new URLSearchParams();
    if (repo) params.set('repo', repo);
    if (branch) params.set('branch', branch);
    params.set('per_page', String(perPage));
    const queryString = `?${params.toString()}`;

    return await apiFetch<CommitInfo[]>(
      `/api/v1/projects/${projectId}/github/commits${queryString}`
    );
  }

  /**
   * Disconnects a specific repository or the entire GitHub integration from the project.
   */
  static async disconnect(projectId: string, repo?: string) {
    const queryString = repo ? `?repo=${encodeURIComponent(repo)}` : '';
    return await apiFetch<{ disconnected: boolean; remainingCount?: number }>(
      `/api/v1/projects/${projectId}/github/disconnect${queryString}`,
      {
        method: 'DELETE',
      }
    );
  }
}

