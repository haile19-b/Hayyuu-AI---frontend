'use client'

import React from 'react';
import {
  FileText,
  FileCheck2,
  CheckSquare,
  AlertTriangle,
  Brain,
  HardDrive,
  Github,
  Bot,
  ArrowRight,
  Sparkles,
  GitBranch,
  GitCommit,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
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
} from '@/types';

interface ProjectOverviewViewProps {
  project: Project;
  documents: ProjectDocument[];
  requirements: Requirement[];
  conflicts: Conflict[];
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
  tasks,
  githubInfo,
  knowledgeEntities,
  memories,
  onNavigateSection,
  onNavigateToRequirement,
  onNavigateToTask,
  onNavigateToConflict,
  onNavigateToDocument,
}) => {
  const activeConflicts = conflicts.filter((c) => c.status === 'Active' || c.status === 'Investigating');
  const completedTasks = tasks.filter((t) => t.status === 'Done');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const backlogTasks = tasks.filter((t) => t.status === 'Backlog');
  const approvedReqs = requirements.filter((r) => r.status === 'Approved');

  // Calculations for Progress Visualization
  const totalTasksCount = tasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;
  const inProgressPercentage = totalTasksCount > 0 ? Math.round((inProgressTasks.length / totalTasksCount) * 100) : 0;
  const todoPercentage = totalTasksCount > 0 ? Math.round((todoTasks.length / totalTasksCount) * 100) : 0;
  const backlogPercentage = totalTasksCount > 0 ? Math.round((backlogTasks.length / totalTasksCount) * 100) : 0;

  // Requirement task coverage
  const reqsWithTasksCount = requirements.filter((req) =>
    tasks.some((t) => t.linkedRequirementId === req.id)
  ).length;
  const reqCoveragePercentage =
    requirements.length > 0 ? Math.round((reqsWithTasksCount / requirements.length) * 100) : 0;

  // AI Suggestions Generation
  const unlinkedReqs = requirements.filter(
    (req) => !tasks.some((t) => t.linkedRequirementId === req.id)
  );

  const criticalPendingTasks = tasks.filter((t) => t.priority === 'Critical' && t.status !== 'Done');

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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 font-bold" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Development Completion & Progress</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time tracking of task execution and requirement coverage across sprint milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateSection('tasks')}
              className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              View Kanban Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-Segment Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>Overall Development Completion:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{completionPercentage}%</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {completedTasks.length} of {totalTasksCount} tasks completed
            </span>
          </div>

          {/* Segmented Bar */}
          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              style={{ width: `${completionPercentage}%` }}
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
              title={`Done: ${completedTasks.length} tasks (${completionPercentage}%)`}
            />
            <div
              style={{ width: `${inProgressPercentage}%` }}
              className="bg-blue-500 h-full transition-all duration-500"
              title={`In Progress: ${inProgressTasks.length} tasks (${inProgressPercentage}%)`}
            />
            <div
              style={{ width: `${todoPercentage}%` }}
              className="bg-amber-400 h-full transition-all duration-500"
              title={`Todo: ${todoTasks.length} tasks (${todoPercentage}%)`}
            />
            <div
              style={{ width: `${backlogPercentage}%` }}
              className="bg-slate-300 dark:bg-slate-600 h-full rounded-r-full transition-all duration-500"
              title={`Backlog: ${backlogTasks.length} tasks (${backlogPercentage}%)`}
            />
          </div>

          {/* Status Metric Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-md bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Done</div>
              <div className="text-lg font-bold font-mono mt-0.5">{completedTasks.length} <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">({completionPercentage}%)</span></div>
            </div>

            <div className="p-2.5 rounded-md bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">In Progress</div>
              <div className="text-lg font-bold font-mono mt-0.5">{inProgressTasks.length} <span className="text-xs font-normal text-blue-700 dark:text-blue-400">({inProgressPercentage}%)</span></div>
            </div>

            <div className="p-2.5 rounded-md bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Todo</div>
              <div className="text-lg font-bold font-mono mt-0.5">{todoTasks.length} <span className="text-xs font-normal text-amber-700 dark:text-amber-400">({todoPercentage}%)</span></div>
            </div>

            <div className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Backlog</div>
              <div className="text-lg font-bold font-mono mt-0.5">{backlogTasks.length} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">({backlogPercentage}%)</span></div>
            </div>
          </div>
        </div>

        {/* Requirement Coverage Ratio */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Requirement Task Coverage: <strong className="text-slate-900 dark:text-slate-100 font-mono">{reqsWithTasksCount} of {requirements.length} Requirements</strong> have linked tasks ({reqCoveragePercentage}%)</span>
          </div>
          {unlinkedReqs.length > 0 && (
            <button
              onClick={() => onNavigateSection('requirements')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-[11px] underline self-start sm:self-auto cursor-pointer"
            >
              {unlinkedReqs.length} Requirements missing implementation tasks →
            </button>
          )}
        </div>
      </div>

      {/* AI Project Suggestions & Insights Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Project Suggestions & Insights</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable engineering recommendations generated from active project artifacts and requirements.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
            Live Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight 1: Requirement Task Gaps */}
          {unlinkedReqs.length > 0 ? (
            <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase">
                  Coverage Gap
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-semibold">High Priority</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                Requirement "{unlinkedReqs[0].title}" has no development tasks
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                Requirement <strong className="font-mono text-blue-700 dark:text-blue-400">[{unlinkedReqs[0].id}]</strong> was extracted from specs but does not currently have any associated development or testing tasks.
              </p>
              <div className="pt-1 flex items-center gap-2">
                {onNavigateToRequirement && (
                  <button
                    onClick={() => onNavigateToRequirement(unlinkedReqs[0].id)}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    View Requirement <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => onNavigateSection('tasks')}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Generate Task
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase">
                  Task Coverage Complete
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Full Requirement Coverage Achieved</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                All structured project requirements currently have associated implementation tasks linked in the Kanban board.
              </p>
            </div>
          )}

          {/* Insight 2: Active Requirement Conflicts */}
          {activeConflicts.length > 0 ? (
            <div className="p-4 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold text-[10px] uppercase">
                  Requirement Conflict
                </span>
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-mono font-semibold">
                  {activeConflicts[0].severity} Severity
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{activeConflicts[0].title}</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{activeConflicts[0].description}</p>
              <div className="pt-1 flex items-center gap-2">
                {onNavigateToConflict ? (
                  <button
                    onClick={() => onNavigateToConflict(activeConflicts[0].id)}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    Resolve Conflict <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateSection('conflicts')}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] cursor-pointer"
                  >
                    View Conflicts
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-[10px] uppercase">
                  Zero Conflicts
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">No Contradictions Detected</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                Hayyuu AI verified all specifications against active project code signals without finding logical contradictions.
              </p>
            </div>
          )}

          {/* Insight 3: Critical Pending Tasks */}
          {criticalPendingTasks.length > 0 ? (
            <div className="p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-[10px] uppercase">
                  Critical Task Action
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-mono font-semibold">In Progress</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{criticalPendingTasks[0].title}</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{criticalPendingTasks[0].description}</p>
              <div className="pt-1 flex items-center gap-2">
                {onNavigateToTask ? (
                  <button
                    onClick={() => onNavigateToTask(criticalPendingTasks[0].id)}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    Open Task Detail <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateSection('tasks')}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] cursor-pointer"
                  >
                    Open Task
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
                  Code Signals
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">GitHub Commit Sync Active</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                Code signals are synced with branch <strong className="font-mono text-blue-700 dark:text-blue-400">{githubInfo.branch || 'main'}</strong>.
              </p>
            </div>
          )}

          {/* Insight 4: Documents Ingestion */}
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
                Document Vector Index
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{documents.length} Docs Processed</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Vector Memory & Knowledge Graph Ready</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              Upload architecture specs or product guides to automatically populate new requirements and knowledge entities.
            </p>
            <div className="pt-1">
              <button
                onClick={() => onNavigateSection('documents')}
                className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-[11px] border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                Upload Documents <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateSection('documents')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
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

        <div
          onClick={() => onNavigateSection('tasks')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tasks</span>
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{tasks.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{completedTasks.length} Completed</div>
        </div>

        <div
          onClick={() => onNavigateSection('knowledge')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Knowledge</span>
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{knowledgeEntities.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Graph Entities</div>
        </div>

        <div
          onClick={() => onNavigateSection('memory')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">AI Memory</span>
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{memories.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Vector Contexts</div>
        </div>
      </div>

      {/* Main Grid: Left Column (Insights & Conflicts) - Right Column (GitHub & Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
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

        {/* Right Column (1 col): GitHub Integration & Tasks Overview */}
        <div className="space-y-6">
          {/* GitHub Connection Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                  GitHub Integration
                </h2>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Connected" />
            </div>

            {githubInfo.isConnected ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-mono text-xs text-blue-700 dark:text-blue-400 font-bold truncate">{githubInfo.repoName}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-slate-500 dark:text-slate-400" /> {githubInfo.branch}
                    </span>
                    <span>·</span>
                    <span>{githubInfo.openIssuesCount} Issues</span>
                    <span>·</span>
                    <span>{githubInfo.openPullRequestsCount} PRs</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Recent Code Commits
                  </div>
                  <div className="space-y-2">
                    {githubInfo.recentCommits.slice(0, 3).map((c) => (
                      <div key={c.hash} className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px]">
                        <div className="flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          <GitCommit className="w-3 h-3" /> {c.hash}
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 line-clamp-1 leading-relaxed">{c.message}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateSection('github')}
                  className="w-full py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors text-center block border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  View Code Signals
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
                No GitHub repository linked to this project space.
              </div>
            )}
          </div>

          {/* Sprint Tasks Mini Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                  Engineering Tasks
                </h2>
              </div>
              <button
                onClick={() => onNavigateSection('tasks')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer"
              >
                Kanban
              </button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => (onNavigateToTask ? onNavigateToTask(t.id) : onNavigateSection('tasks'))}
                  className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{t.title}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
