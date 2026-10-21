'use client'

import React, { useState } from 'react';
import {
  Plus,
  FileText,
  FileCheck2,
  CheckSquare,
  AlertTriangle,
  Github,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { Project, UserProfile } from '@/types';
import { useAppStore } from '@/services/store';

interface DashboardViewProps {
  projects: Project[];
  user: UserProfile;
  onSelectProject: (projectId: string | undefined) => void;
  onOpenCreateProject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectProject,
  onOpenCreateProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name' | 'risks'>('updated');
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_risks' | 'no_risks'>('all');

  // Find recently visited project (or fallback to recently updated)
  const lastVisitedProjectId = useAppStore((state) => state.lastVisitedProjectId);
  const recentlyActiveProject = projects.find((p) => p.id === lastVisitedProjectId) || [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  // Filtering and sorting projects
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'has_risks') return (p.conflictsCount || 0) > 0;
      if (statusFilter === 'no_risks') return (p.conflictsCount || 0) === 0;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'risks') {
        return b.conflictsCount - a.conflictsCount;
      }
      return 0;
    });

  // Exclude active spotlight project from list when default (no search) to prevent duplicate listing
  const listProjects = (!searchTerm && statusFilter === 'all' && recentlyActiveProject)
    ? filteredProjects.filter((p) => p.id !== recentlyActiveProject.id)
    : filteredProjects;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('updated');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              All Projects
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {projects.length} Workspaces
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Isolated engineering spaces with vector specs, requirement graphs, and risk analysis.
          </p>
        </div>

        <button
          onClick={onOpenCreateProject}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-600/30 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Column (Main Content: Recent Active & Full Projects List) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Recent Active Spotlight Banner */}
          {recentlyActiveProject && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    Recent Active Project
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    Updated {new Date(recentlyActiveProject.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold">
                      {recentlyActiveProject.key}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {recentlyActiveProject.name}
                    </h2>
                    {recentlyActiveProject.conflictsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        {recentlyActiveProject.conflictsCount} Risks
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Healthy
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {recentlyActiveProject.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-600 dark:text-slate-400">
                    {(recentlyActiveProject.documentsCount || 0) > 0 && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {recentlyActiveProject.documentsCount} Documents
                      </span>
                    )}
                    {(recentlyActiveProject.requirementsCount || 0) > 0 && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <FileCheck2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        {recentlyActiveProject.requirementsCount} Requirements
                      </span>
                    )}
                    {(recentlyActiveProject.tasksCount || 0) > 0 && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        {recentlyActiveProject.tasksCount} Tasks
                      </span>
                    )}
                    {(recentlyActiveProject.conflictsCount || 0) > 0 && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        {recentlyActiveProject.conflictsCount} Conflicts
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSelectProject(recentlyActiveProject.id)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Resume Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Projects Toolbar & List View */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xs">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & Sorting */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('has_risks')}
                    className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'has_risks'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Risks
                  </button>
                  <button
                    onClick={() => setStatusFilter('no_risks')}
                    className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'no_risks'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Healthy
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'name' | 'risks')}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-2 focus:outline-hidden focus:border-blue-600 cursor-pointer"
                >
                  <option value="updated">Updated</option>
                  <option value="created">Created</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="risks">Risks</option>
                </select>
              </div>
            </div>

            {/* Results Info */}
            {(searchTerm || statusFilter !== 'all') && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 select-none">
                <span>
                  Showing <strong className="text-slate-900 dark:text-slate-100">{filteredProjects.length}</strong> of{' '}
                  {projects.length} projects
                </span>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
              </div>
            )}

            {/* Strictly List View Container */}
            <div className="space-y-2">
              {filteredProjects.length === 0 ? (
                /* Empty State */
                <div className="py-12 px-4 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    No matching projects found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    We couldn&apos;t find any projects matching your search term or active filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              ) : (
                /* Scrollable List Items Container */
                <div className="max-h-[290px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 no-scrollbar">
                  {listProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProject(proj.id)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 rounded-xl p-3.5 transition-all shadow-2xs cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xs"
                    >
                      {/* Left: Key, Name, Description & Repo */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0 mt-0.5">
                          {proj.key}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {proj.name}
                            </h3>
                            {proj.conflictsCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {proj.conflictsCount} Risks
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Healthy
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                            {proj.description || 'No description provided.'}
                          </p>

                          {proj.repositoryUrl && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                              <Github className="w-3 h-3 shrink-0" />
                              <span className="truncate">{proj.repositoryUrl.replace('https://github.com/', '')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Metrics, Updated Date, & Open Button */}
                      <div className="flex items-center justify-between md:justify-end gap-5 text-xs text-slate-600 dark:text-slate-400 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-[11px] font-semibold">
                          {(proj.documentsCount || 0) > 0 && (
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300" title="Documents">
                              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              {proj.documentsCount}
                            </span>
                          )}
                          {(proj.requirementsCount || 0) > 0 && (
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300" title="Requirements">
                              <FileCheck2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                              {proj.requirementsCount}
                            </span>
                          )}
                          {(proj.tasksCount || 0) > 0 && (
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300" title="Tasks">
                              <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              {proj.tasksCount}
                            </span>
                          )}
                          {(proj.conflictsCount || 0) > 0 && (
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300" title="Conflicts">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              {proj.conflictsCount}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden xl:block">
                          {new Date(proj.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>

                        <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer flex items-center gap-1">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Project List Row Button */}
                  <div
                    onClick={onOpenCreateProject}
                    className="group bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-900"
                  >
                    <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <span>Create New Project Workspace</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (How Hayyuu AI Works & Knowledge Stats) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Vertical Step-by-Step Explanation Flow */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  How Hayyuu AI Works
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Specification Reasoning Pipeline
                </p>
              </div>
            </div>

            {/* Vertical Process Timeline */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute -left-[19px] top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Workspace Baseline
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Initial PRDs, architecture goals, and guidelines entered during project setup establish the baseline reasoning context.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute -left-[19px] top-0.5 w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Vector Document Memory
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    PDFs, Markdown, and text specs uploaded in <strong>Documents</strong> are chunked and vectorized for semantic search & RAG retrieval.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute -left-[19px] top-0.5 w-5 h-5 rounded-full bg-amber-505 bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Automated Risk Reasoning
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Hayyuu AI cross-references active tasks and GitHub code commits against your specs to flag contradictions and architectural drift.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Spec updates automatically re-index the project vector graph.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
