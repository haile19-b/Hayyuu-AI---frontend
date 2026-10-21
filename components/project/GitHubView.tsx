'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  GitMerge,
  Plus,
  Unlink,
  Lock,
  Check,
  FolderGit2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  GitHubRepoInfo,
  Project,
  CommitInfo,
  PullRequestInfo,
  IssueInfo,
  GitHubRepositoryItem,
  ProjectRepository,
} from '@/types';
import { useAppStore } from '@/services/store';
import { GitHubApiService } from '@/services/githubService';

interface GitHubViewProps {
  project: Project;
  githubInfo: GitHubRepoInfo;
  onRefreshSync?: (repo?: string) => void;
}

export const GitHubView: React.FC<GitHubViewProps> = ({
  project,
  githubInfo,
  onRefreshSync,
}) => {
  const store = useAppStore();

  // Tab state
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'insights'>('commits');

  // Connection & action states
  const [connecting, setConnecting] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<'current' | 'all' | null>(null);
  const [showAddRepoModal, setShowAddRepoModal] = useState<boolean>(false);
  const [userSelectedRepo, setUserSelectedRepo] = useState<string>('');
  const [directRepoInput, setDirectRepoInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualInstallationId, setManualInstallationId] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState<boolean>(false);

  // Derived active repository and multi-repo state
  const assignedRepos: ProjectRepository[] = githubInfo.assignedRepositories || [];
  const liveFullName =
    githubInfo.repoOwner && githubInfo.repoName
      ? `${githubInfo.repoOwner}/${githubInfo.repoName}`
      : '';

  const activeAssignedRepo =
    (liveFullName
      ? assignedRepos.find(
          (r) =>
            r.fullName.toLowerCase() === liveFullName.toLowerCase() ||
            r.name.toLowerCase() === githubInfo.repoName?.toLowerCase()
        )
      : null) ||
    assignedRepos.find((r) => r.isActive) ||
    assignedRepos[0] ||
    null;

  const activeRepoFullName =
    activeAssignedRepo?.fullName ||
    liveFullName ||
    (project.githubRepoOwner && project.githubRepoName
      ? `${project.githubRepoOwner}/${project.githubRepoName}`
      : '');

  const activeRepoName =
    activeAssignedRepo?.name ||
    githubInfo.repoName ||
    project.githubRepoName ||
    (activeRepoFullName.includes('/') ? activeRepoFullName.split('/')[1] : activeRepoFullName);

  const activeRepoUrl =
    activeAssignedRepo?.htmlUrl ||
    githubInfo.repoUrl ||
    project.githubRepoUrl ||
    (activeRepoFullName ? `https://github.com/${activeRepoFullName}` : '');

  const isConnected = !!(
    (githubInfo.isConnected || (project.githubInstallationId && project.githubRepoName)) &&
    activeRepoFullName
  );

  // Accessible repositories from GitHub App
  const accessibleRepos: GitHubRepositoryItem[] = githubInfo.accessibleRepositories || [];

  // Derived active accessible repo selection (no setState in effect needed)
  const selectedAccessibleRepo =
    userSelectedRepo && accessibleRepos.some((r) => r.fullName === userSelectedRepo)
      ? userSelectedRepo
      : accessibleRepos.find((r) => !r.isClaimedByOtherProject)?.fullName ||
        accessibleRepos[0]?.fullName ||
        '';

  // Branch data
  const branches = githubInfo.branches || [];
  const selectedBranch = githubInfo.branch || branches.find((b) => b.isDefault)?.name || 'main';

  // Live collections (strictly real data)
  const commits: CommitInfo[] = githubInfo.recentCommits || [];
  const pullRequests: PullRequestInfo[] = githubInfo.recentPRs || [];
  const issues: IssueInfo[] = githubInfo.recentIssues || [];

  // Metrics
  const mergedPRsCount = pullRequests.filter((pr) => pr.status === 'merged').length;
  const activeOpenPRsCount =
    pullRequests.filter((pr) => pr.status === 'open').length ||
    githubInfo.openPullRequestsCount ||
    0;
  const issuesCount = issues.length || githubInfo.openIssuesCount || 0;

  // Keep project ref updated for lifecycle events without triggering re-runs
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Sync lifecycle: Fetch status and conditionally sync live data based on 90s inactivity or initial load
  useEffect(() => {
    if (!project?.id) return;

    void (async () => {
      const state = useAppStore.getState();
      await state.fetchGitHubStatus(project.id);

      const latestGh = useAppStore.getState().githubInfo;
      const hasExistingData = (latestGh.recentCommits && latestGh.recentCommits.length > 0) || !!latestGh.lastSyncAt;
      const lastLeft = useAppStore.getState().lastLeftGitHubAt;
      const awayDuration = lastLeft ? Date.now() - lastLeft : null;
      const isAwayOver90Seconds = awayDuration !== null && awayDuration > 90_000;

      if (!hasExistingData || isAwayOver90Seconds) {
        const assigned = latestGh.assignedRepositories || [];
        const activeAssigned = assigned.find((r) => r.isActive) || assigned[0] || null;
        const targetRepo =
          activeAssigned?.fullName ||
          (latestGh.repoOwner && latestGh.repoName
            ? `${latestGh.repoOwner}/${latestGh.repoName}`
            : project.githubRepoOwner && project.githubRepoName
            ? `${project.githubRepoOwner}/${project.githubRepoName}`
            : undefined);

        if (targetRepo) {
          const targetBranch = latestGh.branch || 'main';
          void useAppStore.getState().fetchGitHubLiveData(project.id, targetRepo, targetBranch);
        }
        useAppStore.getState().setLastLeftGitHubAt(null);
      }
    })();
  }, [project?.id, project.githubRepoOwner, project.githubRepoName]);

  // Track when user leaves the GitHub Sync view or switches browser tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      const storeState = useAppStore.getState();
      if (document.hidden) {
        storeState.setLastLeftGitHubAt(Date.now());
      } else {
        const lastLeft = storeState.lastLeftGitHubAt;
        const currentProj = projectRef.current;
        if (lastLeft && Date.now() - lastLeft > 90_000 && currentProj?.id) {
          const latestGh = storeState.githubInfo;
          const assigned = latestGh.assignedRepositories || [];
          const activeAssigned = assigned.find((r) => r.isActive) || assigned[0] || null;
          const targetRepo =
            activeAssigned?.fullName ||
            (latestGh.repoOwner && latestGh.repoName
              ? `${latestGh.repoOwner}/${latestGh.repoName}`
              : currentProj.githubRepoOwner && currentProj.githubRepoName
              ? `${currentProj.githubRepoOwner}/${currentProj.githubRepoName}`
              : undefined);

          if (targetRepo) {
            const targetBranch = latestGh.branch || 'main';
            void storeState.fetchGitHubLiveData(currentProj.id, targetRepo, targetBranch);
          }
        }
        storeState.setLastLeftGitHubAt(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      useAppStore.getState().setLastLeftGitHubAt(Date.now());
    };
  }, []);

  // Actions
  const handleConnectApp = async () => {
    setConnecting(true);
    setFeedbackMessage(null);
    try {
      const res = await GitHubApiService.getInstallUrl(project.id);
      if (!res.success || !res.response?.installUrl) {
        setFeedbackMessage({
          type: 'error',
          text: res.error || 'Could not generate GitHub install URL',
        });
        setConnecting(false);
        return;
      }

      const { installUrl, state } = res.response;
      const width = 1000;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        installUrl,
        'hayyuu_github_install',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
      );

      const messageHandler = async (event: MessageEvent) => {
        if (event.data?.type === 'HAYYUU_GITHUB_INSTALLED' && event.data?.installationId) {
          window.removeEventListener('message', messageHandler);
          const connectRes = await store.connectGitHubInstallation(
            project.id,
            event.data.installationId,
            event.data.state || state
          );
          if (connectRes.success) {
            setFeedbackMessage({
              type: 'success',
              text: 'GitHub App connected successfully! Accessible repositories loaded.',
            });
            await store.fetchGitHubStatus(project.id);
          } else {
            setFeedbackMessage({
              type: 'error',
              text: connectRes.error || 'Failed to complete connection',
            });
          }
          setConnecting(false);
        }
      };
      window.addEventListener('message', messageHandler);

      const pollTimer = setInterval(async () => {
        if (popup && popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          await store.fetchGitHubStatus(project.id);
          setConnecting(false);
        }
      }, 1500);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error launching GitHub authorization',
      });
      setConnecting(false);
    }
  };

  const handleSelectRepository = async (owner: string, repo: string) => {
    setConnecting(true);
    setFeedbackMessage(null);
    try {
      const res = await store.selectGitHubRepository(project.id, owner, repo);
      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Successfully linked ${owner}/${repo} to ${project.name}`,
        });
        setShowAddRepoModal(false);
        await store.fetchGitHubStatus(project.id);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.error || 'Failed to link repository',
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDirectRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directRepoInput.trim()) return;

    const parts = directRepoInput.trim().replace(/^https:\/\/github\.com\//, '').split('/');
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please enter a valid repository format: owner/repository (e.g. facebook/react)',
      });
      return;
    }

    await handleSelectRepository(parts[0], parts[1]);
    setDirectRepoInput('');
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInstallationId.trim()) return;
    setConnecting(true);
    setFeedbackMessage(null);
    try {
      const res = await store.connectGitHubInstallation(project.id, manualInstallationId.trim());
      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: 'GitHub installation linked successfully!',
        });
        setManualInstallationId('');
        setShowManualInput(false);
        await store.fetchGitHubStatus(project.id);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.error || 'Failed to link installation ID',
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (repoFullName?: string) => {
    setDisconnecting(true);
    setFeedbackMessage(null);
    try {
      const res = await store.disconnectGitHub(project.id, repoFullName);
      if (res.success) {
        setConfirmDisconnect(null);
        setFeedbackMessage({
          type: 'success',
          text: repoFullName ? `Disconnected ${repoFullName}` : 'All GitHub repositories disconnected',
        });
        await store.fetchGitHubStatus(project.id);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.error || 'Failed to disconnect repository',
        });
      }
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSwitchActiveRepo = (repoFullName: string) => {
    if (repoFullName.toLowerCase() === activeRepoFullName.toLowerCase()) return;
    setFeedbackMessage(null);
    void store.fetchGitHubLiveData(project.id, repoFullName);
  };

  const handleBranchChange = (branchName: string) => {
    const targetRepo = activeRepoFullName || undefined;
    void store.changeGitHubBranch(project.id, branchName, targetRepo);
  };

  const handleSync = async () => {
    setFeedbackMessage(null);
    const targetRepo = activeRepoFullName || undefined;
    if (onRefreshSync) {
      onRefreshSync(targetRepo);
    } else {
      await store.fetchGitHubLiveData(project.id, targetRepo, selectedBranch);
    }
    setFeedbackMessage({
      type: 'success',
      text: `Repository ${targetRepo || ''} synchronized successfully.`,
    });
  };

  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true);
    setFeedbackMessage(null);
    try {
      await store.fetchGitHubStatus(project.id);
      setFeedbackMessage({
        type: 'success',
        text: 'GitHub integration status updated successfully.',
      });
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to refresh integration status.',
      });
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-900 dark:text-slate-100" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              GitHub Sync & Integration
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time code repository synchronization, builds monitoring, and requirement-code semantic trace mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={handleSync}
              disabled={githubInfo.isLoadingLive}
              className="px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${
                  githubInfo.isLoadingLive ? 'animate-spin' : ''
                }`}
              />
              <span>{githubInfo.isLoadingLive ? 'Syncing...' : 'Sync Repository'}</span>
            </button>
          )}

          <button
            onClick={handleRefreshStatus}
            disabled={isRefreshingStatus}
            title="Refresh integration status"
            className="p-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Alert / Feedback */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-2 shadow-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {githubInfo.liveError && isConnected && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>GitHub Live Sync: {githubInfo.liveError}</span>
          </div>
          <button
            onClick={handleSync}
            className="text-amber-700 dark:text-amber-400 underline font-semibold hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================
          DISCONNECTED STATE: Dedicated Onboarding Screen
          ======================================================== */}
      {!isConnected && (
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center shadow-xs">
              <Github className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Connect a GitHub Repository to {project.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Authenticate once using the official Hayyuu AI GitHub App. Your autonomous agents will track live
                branches, inspect commits, cross-reference pull requests, and maintain semantic requirement-to-code
                traceability with zero static credentials.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleConnectApp}
                disabled={connecting}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 active:scale-95 text-white dark:text-slate-900 font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authorizing with GitHub...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" /> Connect Repository via GitHub App
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isRefreshingStatus}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} /> Check Accessible Repositories
              </button>
            </div>
          </div>

          {/* Accessible Repositories Dropdown Component */}
          {accessibleRepos.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Available Repositories from GitHub App ({accessibleRepos.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a repository to exclusively assign to this project. Repositories already assigned to other
                    projects cannot be selected.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void store.fetchGitHubStatus(project.id)}
                  title="Refresh repository list"
                  className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>

              {/* Dropdown Selection & Connect Action */}
              {(() => {
                const currentAccessibleChoice =
                  accessibleRepos.find((r) => r.fullName === selectedAccessibleRepo) ||
                  accessibleRepos[0] ||
                  null;

                return (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Choose repository to connect:
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative flex-1">
                        <select
                          value={selectedAccessibleRepo}
                          onChange={(e) => setUserSelectedRepo(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                        >
                          {accessibleRepos.map((repo) => {
                            const statusLabel = repo.isAssignedToThisProject
                              ? '✓ Already Assigned'
                              : repo.isClaimedByOtherProject
                              ? `🔒 Claimed by ${repo.claimedByProjectName || 'Other'}`
                              : repo.private
                              ? 'Private'
                              : 'Public';
                            return (
                              <option
                                key={repo.id}
                                value={repo.fullName}
                                disabled={repo.isClaimedByOtherProject && !repo.isAssignedToThisProject}
                              >
                                {repo.fullName} ({statusLabel})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {currentAccessibleChoice && (
                        <button
                          type="button"
                          onClick={() => handleSelectRepository(currentAccessibleChoice.owner, currentAccessibleChoice.name)}
                          disabled={
                            connecting ||
                            (currentAccessibleChoice.isClaimedByOtherProject && !currentAccessibleChoice.isAssignedToThisProject)
                          }
                          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          {connecting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...
                            </>
                          ) : currentAccessibleChoice.isAssignedToThisProject ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Assigned
                            </>
                          ) : currentAccessibleChoice.isClaimedByOtherProject ? (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Claimed by Other
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Connect Selected Repository
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Selected Repository Detail Card Preview */}
                    {currentAccessibleChoice && (
                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {currentAccessibleChoice.fullName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {currentAccessibleChoice.private ? 'Private' : 'Public'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              default branch: {currentAccessibleChoice.defaultBranch || 'main'}
                            </span>
                          </div>

                          {currentAccessibleChoice.htmlUrl && (
                            <a
                              href={currentAccessibleChoice.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              View on GitHub <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {currentAccessibleChoice.description && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                            {currentAccessibleChoice.description}
                          </p>
                        )}

                        {currentAccessibleChoice.isClaimedByOtherProject && !currentAccessibleChoice.isAssignedToThisProject && (
                          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span>
                              This repository is claimed by <strong>{currentAccessibleChoice.claimedByProjectName || 'another project'}</strong>. In Hayyuu AI, each repository is dedicated exclusively to one project environment.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Input Form by Repository Name */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Connect by Repository Name
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
              Already granted access to a repository via your GitHub App installation? Enter the repository name below
              to claim it for this project.
            </p>
            <form onSubmit={handleDirectRepoSubmit} className="flex gap-2">
              <input
                type="text"
                value={directRepoInput}
                onChange={(e) => setDirectRepoInput(e.target.value)}
                placeholder="e.g. your-org/your-repo"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={connecting || !directRepoInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect Repo'}
              </button>
            </form>
          </div>

          {/* Direct Installation ID Link (Collapsible for Developer/Self-host testing) */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              {showManualInput
                ? 'Hide manual installation ID link'
                : 'Already installed on GitHub? Link directly by Installation ID'}
            </button>
          </div>

          {showManualInput && (
            <form
              onSubmit={handleManualConnect}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
            >
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Direct GitHub Installation ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInstallationId}
                  onChange={(e) => setManualInstallationId(e.target.value)}
                  placeholder="e.g. 54321987"
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                >
                  {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Link Installation ID'}
                </button>
              </div>
            </form>
          )}

          {/* Security & Scoped Permissions Box */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Autonomous Agent Security & Repository Isolation Architecture
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">Read-Only Code</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Codebase files are read-only. Agents cannot commit directly to main branches.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">1-Hour Tokens</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tokens are ephemeral and minted on-demand with zero permanent keys stored.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">Strict Isolation</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Each repository is claimed exclusively by one project to prevent cross-contamination.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">Multi-Repo Projects</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  A single project can connect frontend and backend repositories simultaneously.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONNECTED STATE: Live Repository Dashboard
          ======================================================== */}
      {isConnected && (
        <div className="space-y-6">
          {/* Active Repository & Branch Control Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shrink-0">
                <Github className="w-6 h-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeRepoUrl ? (
                    <a
                      href={activeRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline inline-flex items-center gap-1.5"
                    >
                      {activeRepoFullName}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ) : (
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono truncate">
                      {activeRepoFullName}
                    </h2>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                  {/* Branch Selector Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <select
                      value={selectedBranch}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      disabled={githubInfo.isLoadingLive}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 font-medium cursor-pointer focus:outline-hidden"
                    >
                      {branches.length > 0 ? (
                        branches.map((br) => (
                          <option key={br.name} value={br.name}>
                            {br.name} {br.isDefault ? '(default)' : ''}
                          </option>
                        ))
                      ) : (
                        <option value={selectedBranch}>{selectedBranch}</option>
                      )}
                    </select>
                  </div>

                  {githubInfo.lastSyncAt && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Synced: {new Date(githubInfo.lastSyncAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions (Open in GitHub & Disconnect) */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {activeRepoUrl && (
                <a
                  href={activeRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  Open in GitHub <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Disconnect Action */}
              {confirmDisconnect ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-md border border-rose-200 dark:border-rose-900/60">
                  <button
                    type="button"
                    onClick={() => handleDisconnect(confirmDisconnect === 'current' ? activeRepoFullName : undefined)}
                    disabled={disconnecting}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                    Confirm {confirmDisconnect === 'current' ? 'Unlink' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDisconnect(null)}
                    className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 active:scale-95 text-[11px] cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setConfirmDisconnect('current')}
                    title="Unlink repository from project"
                    className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-200 active:scale-95 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Unlink className="w-3.5 h-3.5" /> Unlink
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Repo Switcher Bar (Rule 2: Project can have multiple repos) */}
          <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Project Repos ({assignedRepos.length || 1}):
              </span>

              {assignedRepos.length > 0 ? (
                assignedRepos.map((repo) => {
                  const isActive = repo.fullName.toLowerCase() === activeRepoFullName.toLowerCase();
                  return (
                    <button
                      key={repo.id || repo.fullName}
                      type="button"
                      onClick={() => handleSwitchActiveRepo(repo.fullName)}
                      disabled={isActive && githubInfo.isLoadingLive}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>{repo.name}</span>
                      {isActive && githubInfo.isLoadingLive ? (
                        <Loader2 className="w-3 h-3 animate-spin ml-0.5 text-white" />
                      ) : (
                        isActive && <Check className="w-3 h-3 ml-0.5" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-blue-600 text-white shadow-2xs flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>{activeRepoName}</span>
                </div>
              )}
            </div>

            {/* Add another repo to this project */}
            <div>
              <button
                type="button"
                onClick={() => setShowAddRepoModal(!showAddRepoModal)}
                className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Repo
              </button>
            </div>
          </div>

          {/* Add Another Repo Modal / Dropdown Box */}
          {showAddRepoModal && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Add Repository to {project.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Assign additional microservices or frontend/backend repositories to this project.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRepoModal(false)}
                  className="text-slate-400 hover:text-slate-600 active:scale-95 text-sm font-bold cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {accessibleRepos.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {accessibleRepos.map((repo) => {
                    const isAlreadyAssigned = assignedRepos.some((r) => r.fullName.toLowerCase() === repo.fullName.toLowerCase());
                    const isClaimedByOther = repo.isClaimedByOtherProject && !isAlreadyAssigned;

                    return (
                      <div
                        key={repo.id}
                        className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {repo.fullName}
                        </span>

                        {isAlreadyAssigned ? (
                          <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Already Linked
                          </span>
                        ) : isClaimedByOther ? (
                          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Claimed by {repo.claimedByProjectName || 'Other'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectRepository(repo.owner, repo.name)}
                            disabled={connecting}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-semibold cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1"
                          >
                            {connecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Assign
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No other accessible repositories found in this GitHub App installation.
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <button
              onClick={() => setActiveTab('commits')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 px-1 cursor-pointer active:scale-95 ${
                activeTab === 'commits'
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-4 h-4" /> Recent Commits
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold font-mono">
                {commits.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('prs')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 px-1 cursor-pointer active:scale-95 ${
                activeTab === 'prs'
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <GitPullRequest className="w-4 h-4" /> Pull Requests & Builds
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold font-mono">
                {pullRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 px-1 cursor-pointer active:scale-95 ${
                activeTab === 'insights'
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Insights & Issues
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold font-mono">
                {issues.length}
              </span>
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs min-h-[360px]">
            {/* Loading Overlay Shimmer */}
            {githubInfo.isLoadingLive && (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold">
                  Syncing real-time signals for branch &quot;{selectedBranch}&quot;...
                </span>
              </div>
            )}

            {!githubInfo.isLoadingLive && (
              <>
                {/* ========================================================
                    TAB 1: RECENT COMMITS (Real data only)
                    ======================================================== */}
                {activeTab === 'commits' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-blue-600" /> Git Commits History on branch &quot;
                        {selectedBranch}&quot;
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {commits.length} commit{commits.length !== 1 ? 's' : ''} retrieved
                      </span>
                    </div>

                    {commits.length === 0 ? (
                      <div className="py-16 text-center space-y-3">
                        <FolderGit2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          No commits found on branch &quot;{selectedBranch}&quot;
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Push commits to this branch on GitHub, or switch branches above to view commit history.
                        </p>
                        <button
                          type="button"
                          onClick={handleSync}
                          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                        >
                          Sync Now
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-[460px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                        {commits.map((c) => {
                          const shortHash = c.hash ? c.hash.substring(0, 7) : 'commit';
                          const commitUrl =
                            c.htmlUrl ||
                            (activeRepoFullName
                              ? `https://github.com/${activeRepoFullName}/commit/${c.hash}`
                              : undefined);

                          return (
                            <div
                              key={c.hash}
                              className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                            >
                              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                  {commitUrl ? (
                                    <a
                                      href={commitUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                      {shortHash} <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  ) : (
                                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                                      {shortHash}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  {c.author}
                                </span>
                              </div>

                              {commitUrl ? (
                                <a
                                  href={commitUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 hover:underline block cursor-pointer"
                                >
                                  {c.message}
                                </a>
                              ) : (
                                <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                                  {c.message}
                                </div>
                              )}

                              <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
                                <span>{c.date ? new Date(c.date).toLocaleString() : ''}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================
                    TAB 2: PULL REQUESTS & BUILDS (Real data only)
                    ======================================================== */}
                {activeTab === 'prs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <GitPullRequest className="w-3.5 h-3.5 text-blue-600" /> Repository Pull Requests & Builds
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {pullRequests.length} PR{pullRequests.length !== 1 ? 's' : ''} retrieved
                      </span>
                    </div>

                    {pullRequests.length === 0 ? (
                      <div className="py-16 text-center space-y-3">
                        <GitPullRequest className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          No pull requests found in {activeRepoFullName}
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Create pull requests on GitHub to trace autonomous reviews, status checks, and requirement
                          coverage.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[460px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                        {pullRequests.map((pr) => {
                          const prUrl =
                            pr.htmlUrl ||
                            (activeRepoFullName
                              ? `https://github.com/${activeRepoFullName}/pull/${pr.number}`
                              : undefined);

                          const isMerged = pr.status === 'merged';
                          const isOpen = pr.status === 'open';

                          return (
                            <div
                              key={pr.number}
                              className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {prUrl ? (
                                    <a
                                      href={prUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-purple-700 dark:text-purple-300 font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                      #{pr.number} <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  ) : (
                                    <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">
                                      #{pr.number}
                                    </span>
                                  )}

                                  {pr.sourceBranch && pr.targetBranch && (
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                      {pr.sourceBranch} → {pr.targetBranch}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase flex items-center gap-1 ${
                                      isOpen
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : isMerged
                                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    {isOpen && <GitPullRequest className="w-3 h-3" />}
                                    {isMerged && <GitMerge className="w-3 h-3" />}
                                    {!isOpen && !isMerged && <XCircle className="w-3 h-3" />}
                                    {pr.status}
                                  </span>
                                </div>
                              </div>

                              {prUrl ? (
                                <a
                                  href={prUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-slate-900 dark:text-slate-100 leading-snug hover:text-purple-700 dark:hover:text-purple-300 hover:underline block cursor-pointer"
                                >
                                  {pr.title}
                                </a>
                              ) : (
                                <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                                  {pr.title}
                                </div>
                              )}

                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 items-center pt-0.5">
                                <span>Author: <strong>{pr.author}</strong></span>
                                {pr.updatedAt && (
                                  <>
                                    <span>·</span>
                                    <span>Updated: {new Date(pr.updatedAt).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================
                    TAB 3: INSIGHTS & ISSUES (Real data only)
                    ======================================================== */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    {/* 4-Column Real Repository Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <GitMerge className="w-3.5 h-3.5 text-purple-600" /> Merged PRs
                        </div>
                        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                          {mergedPRsCount}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <GitPullRequest className="w-3.5 h-3.5 text-blue-600" /> Open PRs
                        </div>
                        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                          {activeOpenPRsCount}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Open Issues
                        </div>
                        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                          {issuesCount}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5 text-emerald-600" /> Active Branch
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-2 truncate">
                          {selectedBranch}
                        </div>
                      </div>
                    </div>

                    {/* Split Section: Real Issues & Requirements Traceability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {/* Left: Real Repository Issues */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1">
                          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Open Repository Issues
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {issues.length} issue{issues.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {issues.length === 0 ? (
                          <div className="py-12 text-center p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                            No open issues reported in {activeRepoFullName}.
                          </div>
                        ) : (
                          <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                            {issues.map((iss) => {
                              const issueUrl =
                                iss.htmlUrl ||
                                (activeRepoFullName
                                  ? `https://github.com/${activeRepoFullName}/issues/${iss.number}`
                                  : undefined);

                              return (
                                <div
                                  key={iss.number}
                                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    {issueUrl ? (
                                      <a
                                        href={issueUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-amber-700 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
                                      >
                                        #{iss.number} <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    ) : (
                                      <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                                        #{iss.number}
                                      </span>
                                    )}

                                    <div className="flex flex-wrap gap-1">
                                      {(iss.labels || []).slice(0, 3).map((l, i) => (
                                        <span
                                          key={i}
                                          className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-semibold"
                                        >
                                          {l}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {issueUrl ? (
                                    <a
                                      href={issueUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold text-slate-800 dark:text-slate-200 leading-snug hover:text-amber-700 dark:hover:text-amber-400 hover:underline block cursor-pointer"
                                    >
                                      {iss.title}
                                    </a>
                                  ) : (
                                    <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                      {iss.title}
                                    </div>
                                  )}

                                  {iss.createdAt && (
                                    <div className="text-[10px] text-slate-400">
                                      Opened on {new Date(iss.createdAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Requirements Traceability & AI Compliance */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1">
                          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            AI Code & Requirement Traceability
                          </h4>
                          <span className="text-[10px] text-emerald-600 font-bold">Active Verification</span>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Connected Repository
                            </span>
                            <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                              {activeRepoFullName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Project Key
                            </span>
                            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                              {project.key}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Assigned Repositories
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {assignedRepos.length || 1} repository
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                            Hayyuu AI agents continuously cross-reference pull requests, commits, and issue discussions
                            against your project specifications to detect architectural drift and ensure test coverage.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
