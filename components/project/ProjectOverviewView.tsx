'use client'

import React, { useState } from 'react';
import {
  FileText,
  FileCheck2,
  AlertTriangle,
  Github,
  Bot,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  TrendingUp,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import {
  Project,
  ProjectDocument,
  Requirement,
  Conflict,
  Task,
  GitHubRepoInfo,
  KnowledgeEntity,
  MemoryItem,
  NavigationSection,
  AISuggestion,
} from '@/types';

interface ProjectOverviewViewProps {
  project: Project;
  documents: ProjectDocument[];
  requirements: Requirement[];
  conflicts: Conflict[];
  suggestions: AISuggestion[];
  tasks: Task[];
  githubInfo: GitHubRepoInfo;
  knowledgeEntities: KnowledgeEntity[];
  memories: MemoryItem[];
  onNavigateSection: (section: NavigationSection) => void;
  onNavigateToRequirement?: (reqId: string) => void;
  onNavigateToTask?: (taskId: string) => void;
  onNavigateToConflict?: (conflictId: string) => void;
  onNavigateToDocument?: (docId: string) => void;
}

export const ProjectOverviewView: React.FC<ProjectOverviewViewProps> = ({
  project,
  documents,
  requirements,
  conflicts,
  suggestions,
  tasks,
  githubInfo,
  onNavigateSection,
  onNavigateToConflict,
  onNavigateToDocument,
}) => {
  const activeConflicts = conflicts.filter((c) => c.status === 'Active' || c.status === 'Investigating');
  const completedTasks = tasks.filter((t) => t.status === 'Done');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const approvedReqs = requirements.filter((r) => r.status === 'Approved');

  const doneTasksList = completedTasks.map(t => t.title);
  const inProgressTasksList = inProgressTasks.map(t => t.title);
  const todoTasksList = todoTasks.map(t => t.title);

  const doneCount = completedTasks.length;
  const inProgressCount = inProgressTasks.length;
  const todoCount = todoTasks.length;
  const totalCount = doneCount + inProgressCount + todoCount;

  const donePercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const inProgressPercent = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const todoPercent = totalCount > 0 ? Math.round((todoCount / totalCount) * 100) : 0;



  // Requirement task coverage
  const reqsWithTasksCount = requirements.filter((req) =>
    tasks.some((t) => t.linkedRequirementId === req.id)
  ).length;
  const reqCoveragePercentage =
    requirements.length > 0 ? Math.round((reqsWithTasksCount / requirements.length) * 100) : 0;

  // SVG Radial Circle Calculations
  const radius = 34;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (donePercent / 100) * circumference;



  const [selectedBranch, setSelectedBranch] = useState('feature/new-login');
  const [loadingBranch, setLoadingBranch] = useState(false);
  const handleBranchChange = (branch: string) => {
    setLoadingBranch(true);
    setSelectedBranch(branch);
    setTimeout(() => {
      setLoadingBranch(false);
    }, 800);
  };

  const mockOverviewCommits = [
    { message: 'Update Auth: user profile + update...', author: 'J. Doe', time: 'a few mins ago' },
    { message: "Schema fix: added 'role' field", author: 'A. Smith', time: '1 hour ago' },
    { message: 'Minor UI polish on settings', author: 'M. Chen', time: '3 hours ago' },
  ];

  const globalDummyBranches = [
    { name: 'main', isDefault: true },
    { name: 'develop', isDefault: false },
    { name: 'feature/auth-oidc', isDefault: false },
    { name: 'feature/idempotency-redis', isDefault: false },
    { name: 'feature/new-login', isDefault: false },
    { name: 'hotfix/ledger-deadlock', isDefault: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Top Project Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700">
              {project.key}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-medium text-xs shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Updated <strong className="font-semibold text-slate-900 dark:text-slate-100">{new Date(project.updatedAt).toLocaleDateString()}</strong></span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed font-sans">
            {project.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateSection('documents')}
            className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Upload Starter Spec
          </button>
          <button
            onClick={() => onNavigateSection('chat')}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Bot className="w-4 h-4" /> Start AI Reasoning Session
          </button>
        </div>
      </div>

      {/* Visual Project Development Progress Card */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-5 transition-colors">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-450" />
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">Project Development Completion & Progress</h2>
          </div>
          <button
            onClick={() => onNavigateSection('tasks')}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors border border-slate-250 dark:border-slate-700 font-semibold"
          >
            View Kanban Board <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Content: Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Left Column: Overall Progress & Github Title */}
          <div className="flex flex-col justify-between space-y-6 lg:border-r lg:border-slate-200 lg:dark:border-slate-800 lg:pr-6">
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Overall Progress
              </span>
              <div className="flex items-center gap-4">
                {/* SVG Radial Circle */}
                <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="currentColor"
                      className="text-emerald-500 dark:text-emerald-450 transition-all duration-500 ease-out"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-50 font-mono">{donePercent}%</span>
                    <span className="text-[7.5px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider leading-none">Complete</span>
                  </div>
                </div>

                <div className="text-slate-600 dark:text-slate-400">
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-50 font-mono">
                    {doneCount} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">of</span> {totalCount}
                  </div>
                  <div className="text-xs font-semibold leading-tight">tasks completed</div>
                </div>
              </div>
            </div>

            {/* GitHub Project Stats Section Header */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Github className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">GitHub Project Stats</span>
            </div>
          </div>

          {/* Right Column: 3 Task Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* DONE Card */}
            <div className="border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/15 rounded-md p-3.5 flex flex-col justify-between min-h-[120px]">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/30 pb-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650 dark:text-emerald-400" /> Done
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-450 font-extrabold font-mono text-sm">
                    {doneCount} <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium">({donePercent}%)</span>
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed font-sans">
                  {doneTasksList.slice(0, 3).map((title, i) => (
                    <li key={i} className="truncate" title={title}>{title}</li>
                  ))}
                  {doneTasksList.length === 0 && <li className="text-slate-400 dark:text-slate-500 italic">No items.</li>}
                </ul>
              </div>
            </div>

            {/* IN PROGRESS Card */}
            <div className="border border-blue-200 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/15 rounded-md p-3.5 flex flex-col justify-between min-h-[120px]">
              <div>
                <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900/30 pb-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-650 dark:text-blue-400" /> In Progress
                  </div>
                  <span className="text-blue-700 dark:text-blue-450 font-extrabold font-mono text-sm">
                    {inProgressCount} <span className="text-[10px] text-blue-600 dark:text-blue-500 font-medium">({inProgressPercent}%)</span>
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed font-sans">
                  {inProgressTasksList.slice(0, 3).map((title, i) => (
                    <li key={i} className="truncate" title={title}>{title}</li>
                  ))}
                  {inProgressTasksList.length === 0 && <li className="text-slate-400 dark:text-slate-500 italic">No items.</li>}
                </ul>
              </div>
            </div>

            {/* TODO Card */}
            <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/15 rounded-md p-3.5 flex flex-col justify-between min-h-[120px]">
              <div>
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/30 pb-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-450 text-xs font-extrabold uppercase tracking-wider">
                    <ClipboardList className="w-3.5 h-3.5 text-amber-650 dark:text-amber-450" /> Todo
                  </div>
                  <span className="text-amber-700 dark:text-amber-450 font-extrabold font-mono text-sm">
                    {todoCount} <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">({todoPercent}%)</span>
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed font-sans">
                  {todoTasksList.slice(0, 3).map((title, i) => (
                    <li key={i} className="truncate" title={title}>{title}</li>
                  ))}
                  {todoTasksList.length === 0 && <li className="text-slate-400 dark:text-slate-500 italic">No items.</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Project Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_240px] gap-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
          {/* Commits */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Recent Commits (last 3)
            </span>
            {loadingBranch ? (
              <div className="flex items-center gap-2 py-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                <span>Loading branch commits...</span>
              </div>
            ) : (
              <div className="space-y-1">
                {mockOverviewCommits.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-xs gap-4 py-0.5 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                    <span className="text-slate-800 dark:text-slate-200 truncate font-semibold flex-1 leading-snug" title={c.message}>{c.message}</span>
                    <span className="text-slate-500 dark:text-slate-450 font-medium text-[10px] shrink-0">by {c.author} ({c.time})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="space-y-2 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Overall Metrics
            </span>
            <div className="flex items-center gap-6 mt-1">
              <div>
                <span className="text-slate-505 dark:text-slate-400 text-xs font-semibold">Open PRs:</span>{' '}
                <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{githubInfo.openPullRequestsCount || 7}</span>
              </div>
              <div>
                <span className="text-slate-505 dark:text-slate-400 text-xs font-semibold">Open Issues:</span>{' '}
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-500">{githubInfo.openIssuesCount || 14}</span>
              </div>
            </div>
          </div>

          {/* Branch Selector Dropdown */}
          <div className="space-y-2 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Current Branch
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm truncate max-w-[130px]">{selectedBranch}</span>
              <div className="relative inline-block text-left">
                <select
                  value={selectedBranch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden font-semibold cursor-pointer transition-colors"
                >
                  {globalDummyBranches.map((br) => (
                    <option key={br.name} value={br.name} className="bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100">
                      {br.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Traceability Row */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono whitespace-nowrap text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Requirement-to-Task Traceability: {reqCoveragePercentage}% COVERAGE
            </span>
            {/* Linear Progress Bar */}
            <div className="h-2 flex-1 max-w-lg bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                style={{ width: `${reqCoveragePercentage}%` }}
                className="bg-emerald-500 dark:bg-emerald-450 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono self-end sm:self-auto uppercase tracking-wide">
            <span className="flex items-center gap-1">
              <input type="checkbox" checked readOnly className="rounded-sm border-slate-350 dark:border-slate-700 text-emerald-600 bg-white dark:bg-slate-900 pointer-events-none accent-emerald-500" /> all requirements ({reqsWithTasksCount} of {requirements.length}) linked
            </span>
          </div>
        </div>
      </div>

      {/* AI Project Suggestions Preview Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Project Suggestions & Gaps Preview</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable engineering recommendations and gap analysis generated from active project specifications.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateSection('suggestions')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            View All Suggestions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {suggestions.filter((s) => s.status === 'PENDING').length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
            No pending suggestions. Project requirements are fully covered!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions
              .filter((s) => s.status === 'PENDING')
              .slice(0, 3)
              .map((sug) => (
                <div
                  key={sug.id}
                  onClick={() => onNavigateSection('suggestions')}
                  className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700/80 transition-all cursor-pointer space-y-2 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-[9px] uppercase tracking-wide">
                        {sug.content.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs line-clamp-1">
                      {sug.content.title}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] line-clamp-3">
                      {sug.content.description}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                    Read Reasoning & Resolve →
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateSection('documents')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Documents</span>
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{documents.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Indexed Vector Docs</div>
        </div>

        <div
          onClick={() => onNavigateSection('requirements')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Requirements</span>
            <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{requirements.length}</div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">{approvedReqs.length} Approved</div>
        </div>

        <div
          onClick={() => onNavigateSection('conflicts')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{activeConflicts.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Requirement Risks</div>
        </div>
      </div>
      
      {/* Main Flow: Active Conflicts List & Ingested Documents List */}
      <div className="space-y-6">
        {/* Active Conflicts List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                Active Requirement Conflicts ({activeConflicts.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateSection('conflicts')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          {activeConflicts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs font-medium">
              No active conflicts detected. Project requirements are aligned!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeConflicts.slice(0, 3).map((conf) => (
                <div
                  key={conf.id}
                  onClick={() => (onNavigateToConflict ? onNavigateToConflict(conf.id) : onNavigateSection('conflicts'))}
                  className="py-3 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3 items-start"
                >
                  <div
                    className={`w-1 h-10 rounded-full shrink-0 ${
                      conf.severity === 'High' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{conf.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          conf.severity === 'High'
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {conf.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{conf.description}</p>
                    <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Action: {conf.suggestedAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                Recent Ingested Documents ({documents.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateSection('documents')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer"
            >
              Manage Docs
            </button>
          </div>

          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => (onNavigateToDocument ? onNavigateToDocument(doc.id) : onNavigateSection('documents'))}
                className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{doc.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                    {doc.chunksCount} chunks · {doc.fileSize} · {doc.extractedConcepts.join(', ')}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold ${
                    doc.status === 'ready'
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
