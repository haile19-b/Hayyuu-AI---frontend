'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Github,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  FolderGit2,
  Unlink,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Project, GitHubStatusResponse, GitHubRepositoryItem } from '@/types';
import { useAppStore } from '@/services/store';
import { GitHubApiService } from '@/services/githubService';

interface GitHubIntegrationCardProps {
  project: Project;
}

export const GitHubIntegrationCard: React.FC<GitHubIntegrationCardProps> = ({ project }) => {
  const store = useAppStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [status, setStatus] = useState<GitHubStatusResponse | null>(null);
  const [accessibleRepos, setAccessibleRepos] = useState<GitHubRepositoryItem[]>([]);
  const [showRepoSelector, setShowRepoSelector] = useState<boolean>(false);
  const [selectingRepo, setSelectingRepo] = useState<boolean>(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual installation ID fallback for dev/testing
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualInstallationId, setManualInstallationId] = useState<string>('');

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await GitHubApiService.getStatus(project.id);
      if (res.success && res.response) {
        setStatus(res.response);
        setAccessibleRepos(res.response.accessibleRepositories || []);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    let ignore = false;
    GitHubApiService.getStatus(project.id)
      .then((res) => {
        if (ignore) return;
        if (res.success && res.response) {
          setStatus(res.response);
          setAccessibleRepos(res.response.accessibleRepositories || []);
        } else if (res.error) {
          setErrorMessage(res.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch status');
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [project.id]);

  // Check URL query parameters for GitHub installation callback redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const installationId = urlParams.get('installation_id');
    const state = urlParams.get('state');

    if (installationId) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      store.connectGitHubInstallation(project.id, installationId, state || undefined)
        .then((res) => {
          if (res.success) {
            setSuccessMessage('GitHub App connected successfully!');
            fetchStatus();
          } else {
            setErrorMessage(res.error || 'Failed to connect GitHub App');
          }
        })
        .catch((err) => {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to connect GitHub App');
        });
    }
  }, [project.id, store, fetchStatus]);

  // Handle clicking "Connect Repository"
  const handleConnect = async () => {
    setConnecting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await GitHubApiService.getInstallUrl(project.id);
      if (!res.success || !res.response?.installUrl) {
        setErrorMessage(res.error || 'Could not generate GitHub install URL');
        setConnecting(false);
        return;
      }

      const { installUrl, state } = res.response;

      // Open GitHub App installation in a popup window
      const width = 1000;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        installUrl,
        'hayyuu_github_install',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
      );

      // Setup window postMessage listener for popup callback
      const messageHandler = async (event: MessageEvent) => {
        if (event.data?.type === 'HAYYUU_GITHUB_INSTALLED' && event.data?.installationId) {
          window.removeEventListener('message', messageHandler);
          const connectRes = await store.connectGitHubInstallation(
            project.id,
            event.data.installationId,
            event.data.state || state
          );
          if (connectRes.success) {
            setSuccessMessage('GitHub repository linked successfully!');
            await fetchStatus();
          } else {
            setErrorMessage(connectRes.error || 'Failed to complete connection');
          }
          setConnecting(false);
        }
      };
      window.addEventListener('message', messageHandler);

      // Poll in case popup closes or user completes installation without postMessage
      const pollTimer = setInterval(async () => {
        if (popup && popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          // Refresh status to see if installation completed
          await fetchStatus();
          setConnecting(false);
        }
      }, 1500);

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error launching GitHub authorization');
      setConnecting(false);
    }
  };

  // Handle manual installation ID submission
  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInstallationId.trim()) return;

    setConnecting(true);
    setErrorMessage(null);
    try {
      const res = await store.connectGitHubInstallation(project.id, manualInstallationId.trim());
      if (res.success) {
        setSuccessMessage('GitHub installation linked successfully!');
        setManualInstallationId('');
        setShowManualInput(false);
        await fetchStatus();
      } else {
        setErrorMessage(res.error || 'Failed to connect installation ID');
      }
    } finally {
      setConnecting(false);
    }
  };

  // Handle switching repository
  const handleSelectRepository = async (repo: GitHubRepositoryItem) => {
    setSelectingRepo(true);
    setErrorMessage(null);
    try {
      const res = await store.selectGitHubRepository(project.id, repo.owner, repo.name);
      if (res.success) {
        setShowRepoSelector(false);
        setSuccessMessage(`Switched active repository to ${repo.fullName}`);
        await fetchStatus();
      } else {
        setErrorMessage(res.error || 'Failed to link repository');
      }
    } finally {
      setSelectingRepo(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    setDisconnecting(true);
    setErrorMessage(null);
    try {
      const res = await store.disconnectGitHub(project.id);
      if (res.success) {
        setConfirmDisconnect(false);
        setSuccessMessage('GitHub repository unlinked.');
        await fetchStatus();
      } else {
        setErrorMessage(res.error || 'Failed to disconnect');
      }
    } finally {
      setDisconnecting(false);
    }
  };

  const isConnected = !!status?.isConnected;
  const repoOwner = status?.repoOwner || project.githubRepoOwner;
  const repoName = status?.repoName || project.githubRepoName;
  const repoUrl = status?.repoUrl || project.githubRepoUrl || (repoOwner && repoName ? `https://github.com/${repoOwner}/${repoName}` : undefined);
  const connectedAt = status?.connectedAt || project.githubConnectedAt;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-2xs transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0">
            <Github className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              GitHub Repository Integration
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Not Connected
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              GitHub App Model • Scoped Ephemeral Access • Granular Repository Isolation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          disabled={loading}
          title="Refresh connection status"
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {/* Security & Scoped Permissions Explain Box */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Autonomous Agent Security Architecture
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          Hayyuu AI uses the official <strong>GitHub App</strong> architecture. You select only the specific repositories you want to expose. Our LangGraph agents and MCP tools receive short-lived (1-hour) tokens on-demand with strict boundaries:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 text-center">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">Repository Contents</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold">Read-only</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 text-center">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">Pull Requests</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-semibold">Read & Write</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 text-center">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">Issues & Sync</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-semibold">Read & Write</span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !status && (
        <div className="p-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          Loading GitHub integration details...
        </div>
      )}

      {/* CONNECTED STATE */}
      {!loading && isConnected && (
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                    Linked Repository
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
                    {repoOwner}/{repoName}
                    {repoUrl && (
                      <a
                        href={repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1 text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {connectedAt && (
                <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Connected: </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(connectedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Accessible Repos / Switcher */}
            {accessibleRepos.length > 1 && (
              <div className="border-t border-slate-200 dark:border-slate-700/60 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    {accessibleRepos.length} authorized repositories available in this GitHub App installation.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRepoSelector(!showRepoSelector)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Switch Linked Repo <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showRepoSelector && (
                  <div className="mt-2.5 p-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Select repository to associate with this project:
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {accessibleRepos.map((r) => {
                        const isCurrent = r.fullName === `${repoOwner}/${repoName}`;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleSelectRepository(r)}
                            disabled={selectingRepo || isCurrent}
                            className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-mono">{r.fullName}</span>
                            {isCurrent && <Check className="w-4 h-4 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {status?.installationId && (
                <a
                  href={`https://github.com/settings/installations/${status.installationId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Configure on GitHub
                </a>
              )}
            </div>

            <div>
              {confirmDisconnect ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Confirm disconnect?</span>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                    Yes, Disconnect
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDisconnect(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDisconnect(true)}
                  className="px-3 py-1.5 rounded border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Unlink className="w-3.5 h-3.5" /> Disconnect Repository
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISCONNECTED STATE */}
      {!loading && !isConnected && (
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Github className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Connect your repository to Hayyuu AI
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Authenticate once via the Hayyuu AI GitHub App. Your AI agent will be able to cross-reference code against requirements, surface drift warnings, and create pull requests.
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="px-5 py-2.5 rounded-md bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
            </div>
          </div>

          {/* Fallback manual input for developer testing */}
          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              {showManualInput ? 'Hide manual installation ID link' : 'Already installed on GitHub? Link by Installation ID'}
            </button>
          </div>

          {showManualInput && (
            <form onSubmit={handleManualConnect} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Direct GitHub Installation ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInstallationId}
                  onChange={(e) => setManualInstallationId(e.target.value)}
                  placeholder="e.g. 12345678"
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                >
                  {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect ID'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
