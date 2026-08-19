'use client'

import React, { useState } from 'react';
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  PlayCircle,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { GitHubRepoInfo, Project, CommitInfo, PullRequestInfo, IssueInfo } from '@/types';

interface GitHubViewProps {
  project: Project;
  githubInfo: GitHubRepoInfo;
  onRefreshSync: () => void;
}

// Global Dummy Data
const globalDummyBranches = [
  { name: 'main', isDefault: true, lastCommit: 'e8f12a4', status: 'Synced' },
  { name: 'develop', isDefault: false, lastCommit: 'b4a91c0', status: 'Synced' },
  { name: 'feature/auth-oidc', isDefault: false, lastCommit: '7a8b9c0', status: 'Ahead by 4 commits' },
  { name: 'feature/idempotency-redis', isDefault: false, lastCommit: 'f2e3d4c', status: 'Active (PR #14)' },
  { name: 'hotfix/ledger-deadlock', isDefault: false, lastCommit: '9b8a7c6', status: 'Merged (Ahead)' },
];

const globalDummyPRs = [
  {
    number: 14,
    title: 'PR #14: Add Redis Distributed Lock for Settlement Idempotency',
    status: 'open' as const,
    author: 'arivera-dev',
    updatedAt: '2026-08-09T19:10:00Z',
    buildStatus: 'Passing',
    reviews: 'Approved by 2 reviewers',
    coverage: '94.2%',
  },
  {
    number: 15,
    title: 'PR #15: Asynchronous Fraud Scoring Webhook Ingestion',
    status: 'open' as const,
    author: 'arivera-dev',
    updatedAt: '2026-08-09T22:30:00Z',
    buildStatus: 'Running',
    reviews: 'Changes requested (1 review)',
    coverage: '89.5%',
  },
  {
    number: 12,
    title: 'PR #12: Update DB Schema Partitions for Monthly Audit Logs',
    status: 'merged' as const,
    author: 'arivera-dev',
    updatedAt: '2026-08-07T11:30:00Z',
    buildStatus: 'Passing',
    reviews: 'Approved',
    coverage: '91.8%',
  },
];

const globalDummyIssues: IssueInfo[] = [
  {
    number: 42,
    title: 'Idempotency Key middleware fails under 5000 QPS concurrent stress test',
    state: 'open' as const,
    labels: ['bug', 'performance', 'p0'],
  },
  {
    number: 45,
    title: 'Audit log table partitions mismatch on first of month boundaries',
    state: 'open' as const,
    labels: ['database', 'regression', 'p1'],
  },
  {
    number: 38,
    title: 'Add health check endpoint for Kubernetes liveness probe',
    state: 'closed' as const,
    labels: ['devops', 'enhancement'],
  },
];

const globalDummyInsights = [
  {
    type: 'Success',
    message: 'JWT Verification module (internal/auth/jwt_verifier.go) is 100% compliant with REQ-102.',
  },
  {
    type: 'Drift Warning',
    message: 'Idempotency Key middleware (pkg/middleware/idempotency.go) implementation lacks database index validation (matches REQ-104 gap).',
  },
  {
    type: 'Coverage Alert',
    message: 'Extended Session Cache (REQ-103) has zero matched codebase files or references.',
  },
  {
    type: 'Performance',
    message: 'Sub-100ms API Settlement SLA (REQ-101) benchmark test passes with p99.9 at 82ms.',
  }
];

export const GitHubView: React.FC<GitHubViewProps> = ({
  project,
  githubInfo,
  onRefreshSync,
}) => {
  // Use project github info if connected, fallback to global dummy datasets
  const repoName = githubInfo.repoName || `${project.key.toLowerCase()}-core`;
  const branchName = githubInfo.branch || 'main';
  const openIssues = githubInfo.recentIssues?.length ? githubInfo.recentIssues : globalDummyIssues;
  const openPRs = githubInfo.recentPRs?.length ? githubInfo.recentPRs : globalDummyPRs;
  const commits = githubInfo.recentCommits?.length ? githubInfo.recentCommits : [
    {
      hash: 'e8f12a4',
      message: 'feat(auth): enforce RS256 token verification with 15m expiration',
      author: 'Alex Rivera',
      date: '2026-08-08T18:20:00Z',
    },
    {
      hash: 'b4a91c0',
      message: 'fix(ledger): atomic transaction rollback on Redis connection timeout',
      author: 'Alex Rivera',
      date: '2026-08-07T14:10:00Z',
    },
    {
      hash: '3d7729e',
      message: 'docs: update OpenAPI specs for idempotency header requirements',
      author: 'Alex Rivera',
      date: '2026-08-06T09:45:00Z',
    },
  ];

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
            Real-time code signals, active branches, PR builds, and AI code compliance insights for "{project.name}".
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
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                {project.repositoryUrl ? project.repositoryUrl.replace('https://github.com/', '') : `hayyuu-ai/${repoName}`}
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-mono font-semibold">
                <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 font-bold" /> Active Branch: {branchName}
              </span>
              <span>·</span>
              <span>Last synced {githubInfo.lastSyncAt ? new Date(githubInfo.lastSyncAt).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <a
          href={project.repositoryUrl || `https://github.com/hayyuu-ai/${repoName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
        >
          Open in GitHub <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Branches */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Active Repository Branches ({globalDummyBranches.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {globalDummyBranches.map((br) => (
              <div key={br.name} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-semibold ${
                    br.name === branchName 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  } truncate`}>
                    {br.name}
                  </span>
                  {br.isDefault && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  <span>{br.lastCommit}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-sans">{br.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Commits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Recent Commits ({commits.length})
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {commits.map((c: CommitInfo) => (
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

        {/* Pull Requests & CI/CD Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Pull Requests & Builds ({openPRs.length})
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {openPRs.map((pr: any) => (
              <div key={pr.number} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">#{pr.number}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold border border-slate-300 dark:border-slate-700">
                      {pr.status}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                      pr.buildStatus === 'Passing' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                        : pr.buildStatus === 'Running'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}>
                      {pr.buildStatus === 'Passing' && <CheckCircle2 className="w-3 h-3" />}
                      {pr.buildStatus === 'Running' && <PlayCircle className="w-3 h-3 animate-spin" />}
                      {pr.buildStatus} Build
                    </span>
                  </div>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{pr.title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 items-center">
                  <span>Author: <strong>{pr.author}</strong></span>
                  <span>·</span>
                  <span>{pr.reviews || 'Pending review'}</span>
                  {pr.coverage && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Cov: {pr.coverage}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Issues & Compliance Insights */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Issues & Compliance Insights ({openIssues.length + globalDummyInsights.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {/* Issues Sublist */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Open Repository Issues
              </div>
              <div className="space-y-2">
                {openIssues.map((iss: IssueInfo) => (
                  <div key={iss.number} className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
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
                    <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{iss.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Code Insights Sublist */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> AI Code Compliance Insights
              </div>
              <div className="space-y-2">
                {globalDummyInsights.map((ins, idx) => (
                  <div key={idx} className={`p-2.5 rounded text-[11px] border leading-normal flex gap-2 items-start ${
                    ins.type === 'Success'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                      : ins.type === 'Drift Warning'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40 text-slate-800 dark:text-slate-200'
                      : ins.type === 'Coverage Alert'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/40 text-slate-800 dark:text-slate-200'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/40 text-slate-800 dark:text-slate-200'
                  }`}>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8px] shrink-0 mt-0.5 ${
                      ins.type === 'Success'
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                        : ins.type === 'Drift Warning'
                        ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        : ins.type === 'Coverage Alert'
                        ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {ins.type}
                    </span>
                    <span className="font-sans text-slate-700 dark:text-slate-300">{ins.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
