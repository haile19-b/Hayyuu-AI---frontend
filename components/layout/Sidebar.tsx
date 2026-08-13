'use client'

import React from 'react';
import {
  Home,
  Bot,
  LayoutDashboard,
  Search,
  FileText,
  FileCheck2,
  AlertTriangle,
  CheckSquare,
  Github,
  Brain,
  HardDrive,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { NavigationSection, Project } from '@/types';

interface SidebarProps {
  currentProject?: Project;
  activeSection: NavigationSection;
  onNavigateSection: (section: NavigationSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeConflictsCount: number;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ElementType;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentProject,
  activeSection,
  onNavigateSection,
  isCollapsed,
  onToggleCollapse,
  activeConflictsCount,
}) => {
  // Global navigation items when NO project is selected
  const globalNavItems: NavItem[] = [
    { id: 'projects', label: 'All Projects', icon: Home },
    { id: 'search', label: 'Global Intelligence Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Project-specific navigation items when a project IS selected
  const projectNavItems: NavItem[] = [
    { id: 'overview', label: 'Project Overview', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: Bot, highlight: true },
    { id: 'documents', label: 'Documents', icon: FileText, badge: currentProject?.documentsCount },
    { id: 'requirements', label: 'Requirements', icon: FileCheck2, badge: currentProject?.requirementsCount },
    { id: 'conflicts', label: 'Conflicts & Risks', icon: AlertTriangle, badge: activeConflictsCount },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: currentProject?.tasksCount },
    { id: 'github', label: 'GitHub Sync', icon: Github },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Brain, badge: currentProject?.knowledgeEntitiesCount },
    { id: 'memory', label: 'AI Memory Inspector', icon: HardDrive, badge: currentProject?.memoriesCount },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 z-20 select-none shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Project Banner / Dynamic Workspace Info Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between min-h-[52px] bg-slate-50/70 dark:bg-slate-800/50">
        {!isCollapsed ? (
          <div className="min-w-0 flex-1 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase flex items-center gap-1">
                {currentProject ? 'Active Project' : 'Hayyuu AI v1.0.0'}
              </div>
              <div
                className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5"
                title={currentProject?.name || 'All Projects Overview'}
              >
                {currentProject ? currentProject.name : 'Global Projects Hub'}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs" title="Hayyuu AI v1.0.0">
              <Brain className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden lg:block cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 no-scrollbar">
        {!isCollapsed && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pt-2 pb-1">
            {currentProject ? 'Project Navigation' : 'Global Navigation'}
          </div>
        )}

        {/* If Project is active, provide a top "All Projects" switch button */}
        {currentProject && (
          <button
            onClick={() => onNavigateSection('projects')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all mb-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer ${
              activeSection === 'projects' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold' : ''
            }`}
            title={isCollapsed ? 'Switch / All Projects' : undefined}
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left truncate font-semibold">All Projects</span>}
          </button>
        )}

        {/* Render appropriate nav list */}
        {(currentProject ? projectNavItems : globalNavItems).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/80 dark:border-blue-800/80 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    item.id === 'conflicts'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : isActive
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-800 dark:border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 ? ` (${item.badge})` : ''}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* GitHub Repository Quick Footer */}
      {!isCollapsed && currentProject?.repositoryUrl && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Github className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
          <div className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-700 dark:text-slate-300">
            {currentProject.repositoryUrl.replace('https://github.com/', '')}
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Connected" />
        </div>
      )}
    </aside>
  );
};
