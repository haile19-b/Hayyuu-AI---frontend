'use client'

import React from 'react';
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { GitHubRepoInfo, Project, CommitInfo, PullRequestInfo, IssueInfo } from '@/types';

interface GitHubViewProps {
  project: Project;
  githubInfo: GitHubRepoInfo;
  onRefreshSync: () => void;
}

export const GitHubView: React.FC<GitHubViewProps> = ({
  project,
  githubInfo,
  onRefreshSync,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">GitHub Code & Repo Signals</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time code signals, commits, pull requests, and AI static analysis for "{project.name}".
          </p>
        </div>

        <button
          onClick={onRefreshSync}
          className="px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Refresh Code Sync
        </button>
      </div>

      {/* Connection Info Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
            <Github className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">{githubInfo.repoName || 'Not configured'}</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-mono font-semibold">
                <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 font-bold" /> Branch: {githubInfo.branch}
              </span>
              <span>·</span>
              <span>Last synced {githubInfo.lastSyncAt ? new Date(githubInfo.lastSyncAt).toLocaleTimeString() : 'never'}</span>
            </div>
          </div>
        </div>

        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            Open in GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Main Grid: Commits, Pull Requests, Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Commits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Recent Commits ({(githubInfo.recentCommits || []).length})
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {(githubInfo.recentCommits || []).map((c: CommitInfo) => (
              <div key={c.hash} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{c.hash}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{c.author}</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{c.message}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  {c.date ? new Date(c.date).toLocaleDateString() : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pull Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Open Pull Requests ({githubInfo.openPullRequestsCount || 0})
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {(githubInfo.recentPRs || []).map((pr: PullRequestInfo) => (
              <div key={pr.number} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">#{pr.number}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold border border-slate-300 dark:border-slate-700">
                    {pr.status}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{pr.title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Author: {pr.author} · {new Date(pr.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Issues & Static Analysis */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Linked Issues ({githubInfo.openIssuesCount || 0})
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {(githubInfo.recentIssues || []).map((iss: IssueInfo) => (
              <div key={iss.number} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">#{iss.number}</span>
                  <div className="flex flex-wrap gap-1">
                    {(iss.labels || []).map((l: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-semibold border border-slate-300 dark:border-slate-700">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{iss.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
