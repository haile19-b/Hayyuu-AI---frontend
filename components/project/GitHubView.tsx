'use client'

import React, { useState, useEffect } from 'react';
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
  Loader2,
  Users,
  GitMerge,
  Info,
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
  {
    number: 10,
    title: 'PR #10: Core Settlement Ledger API endpoints',
    status: 'merged' as const,
    author: 'arivera-dev',
    updatedAt: '2026-08-05T15:20:00Z',
    buildStatus: 'Passing',
    reviews: 'Approved',
    coverage: '90.5%',
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
  {
    number: 35,
    title: 'RS256 JWT key rotation endpoint implementation',
    state: 'closed' as const,
    labels: ['security', 'enhancement'],
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
  const repoName = githubInfo.repoName || `${project.key.toLowerCase()}-core`;
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'insights'>('commits');

  // Branch states (Simulate loading/population of branches)
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loadingBranches, setLoadingBranches] = useState<boolean>(true);
  const [loadingBranchData, setLoadingBranchData] = useState<boolean>(false);

  useEffect(() => {
    // Keep loading branches and delay selection
    setLoadingBranches(true);
    setSelectedBranch('');
    const timer = setTimeout(() => {
      setLoadingBranches(false);
      setSelectedBranch(githubInfo.branch || 'main');
    }, 1200);

    return () => clearTimeout(timer);
  }, [project.id, githubInfo.branch]);

  const handleBranchChange = (branchName: string) => {
    setLoadingBranchData(true);
    setSelectedBranch(branchName);
    const timer = setTimeout(() => {
      setLoadingBranchData(false);
    }, 800);
  };

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
    {
      hash: 'a1b2c3d',
      message: 'refactor: extract settlement validations to middleware sub-packages',
      author: 'Alex Rivera',
      date: '2026-08-05T11:00:00Z',
    },
  ];

  // Insights Calculations
  const mergedPRsCount = openPRs.filter(pr => pr.status === 'merged').length;
  const activeOpenPRsCount = openPRs.filter(pr => pr.status === 'open').length;
  const issuesCount = openIssues.length;
  const contributorsCount = 4; // Mock contributors

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">GitHub Sync & Integration</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time code repository synchronization, builds monitoring, and requirement-code semantic trace mapping.
          </p>
        </div>

        <button
          onClick={onRefreshSync}
          className="px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Sync Repository
        </button>
      </div>

      {/* Control Banner (Branch Selector & Repo Link) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
            <Github className="w-6 h-6" />
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
            
            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-2 mt-2">
              <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="relative">
                {loadingBranches ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>Loading repository branches...</span>
                  </div>
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="px-3 py-1 bg-slate-150 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-250 focus:outline-hidden font-medium cursor-pointer"
                  >
                    {globalDummyBranches.map((br) => (
                      <option key={br.name} value={br.name}>
                        {br.name} {br.isDefault ? '(default)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {!loadingBranches && selectedBranch && (
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                  • Synced codebase signals loaded
                </span>
              )}
            </div>
          </div>
        </div>

        {/* GitHub Page Link */}
        <a
          href={project.repositoryUrl || `https://github.com/hayyuu-ai/${repoName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
        >
          Open repository in GitHub <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('commits')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 px-1 cursor-pointer ${
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
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 px-1 cursor-pointer ${
            activeTab === 'prs'
              ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <GitPullRequest className="w-4 h-4" /> Pull Requests & Builds
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold font-mono">
            {openPRs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 px-1 cursor-pointer ${
            activeTab === 'insights'
              ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Insights & Issues
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold font-mono">
            {openIssues.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs relative">
        {/* Loading Overlay */}
        {(loadingBranchData || loadingBranches) ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold">Syncing codebase signals for branch &quot;{selectedBranch || 'main'}&quot;...</span>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Tab: Commits */}
            {activeTab === 'commits' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                    Git Commits History
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Scrollable list shows 3 items</span>
                </div>
                {/* Scrollable list restricted to exactly 3 items before scrolling is required */}
                <div className="max-h-[310px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {commits.map((c: CommitInfo) => (
                    <div
                      key={c.hash}
                      className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1 flex flex-col justify-between h-[90px]"
                    >
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{c.hash}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{c.author}</span>
                      </div>
                      <div className="font-semibold text-slate-850 dark:text-slate-200 leading-snug line-clamp-1">{c.message}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                        {c.date ? new Date(c.date).toLocaleDateString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Pull Requests */}
            {activeTab === 'prs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                    Repository Pull Requests & Builds
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Scrollable list shows 3 items</span>
                </div>
                {/* Scrollable list restricted to exactly 3 items before scrolling is required */}
                <div className="max-h-[370px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {openPRs.map((pr: any) => (
                    <div
                      key={pr.number}
                      className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 flex flex-col justify-between h-[110px]"
                    >
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
                      <div className="font-semibold text-slate-850 dark:text-slate-200 line-clamp-1">{pr.title}</div>
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
            )}

            {/* Tab: Insights & Issues */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                
                {/* 4-Column Repository Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <GitMerge className="w-3.5 h-3.5 text-purple-600" /> Merged PRs
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                      {mergedPRsCount}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <GitPullRequest className="w-3.5 h-3.5 text-blue-600" /> Open PRs
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                      {activeOpenPRsCount}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Total Issues
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                      {issuesCount}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" /> Contributors
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                      {contributorsCount}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Issues Sublist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Open Repository Issues
                      </h4>
                      <span className="text-[9px] text-slate-400">Scrollable list shows 3 items</span>
                    </div>
                    {/* Scrollable list restricted to exactly 3 items before scrolling is required */}
                    <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                      {openIssues.map((iss: IssueInfo) => (
                        <div
                          key={iss.number}
                          className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5 h-[75px] flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">#{iss.number}</span>
                            <div className="flex flex-wrap gap-1">
                              {(iss.labels || []).slice(0, 2).map((l: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-semibold border border-slate-300 dark:border-slate-700">
                                  {l}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="font-semibold text-slate-850 dark:text-slate-200 line-clamp-1">{iss.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Code Insights Sublist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> AI Code Compliance Insights
                      </h4>
                      <span className="text-[9px] text-slate-400">Scrollable list shows 3 items</span>
                    </div>
                    {/* Scrollable list restricted to exactly 3 items before scrolling is required */}
                    <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                      {globalDummyInsights.map((ins, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded text-[11px] border leading-normal flex gap-2 items-start h-[75px] ${
                            ins.type === 'Success'
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                              : ins.type === 'Drift Warning'
                              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40 text-slate-800 dark:text-slate-200'
                              : ins.type === 'Coverage Alert'
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/40 text-slate-800 dark:text-slate-200'
                              : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/40 text-slate-800 dark:text-slate-200'
                          }`}
                        >
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
                          <span className="font-sans text-slate-700 dark:text-slate-300 text-xs line-clamp-2">{ins.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
