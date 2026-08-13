'use client'

import React from 'react';
import { Search, Bell, Menu, Brain } from 'lucide-react';
import { Project, UserProfile, NavigationSection, NotificationItem, WorkflowJob } from '@/types';
import { AiJobStatusIndicator } from './AiJobStatusIndicator';
import ThemeToggle from '@/app/theme-toggle';
import { AiJobState, AiJobStateStatus } from '@/services/store';

interface HeaderProps {
  currentProject?: Project;
  projects: Project[];
  onSelectProject: (projectId: string | undefined) => void;
  onOpenCreateProject: () => void;
  activeSection: NavigationSection;
  onNavigateSection: (section: NavigationSection) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  workflowJobs: WorkflowJob[];
  onToggleMobileSidebar: () => void;
  aiJobState?: AiJobState;
  onSimulateJobState?: (status: AiJobStateStatus) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenCreateProject,
  activeSection,
  onNavigateSection,
  user,
  onOpenAuth,
  notifications,
  onOpenNotifications,
  workflowJobs,
  onToggleMobileSidebar,
  aiJobState,
  onSimulateJobState,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-between px-4 sticky top-0 z-30 select-none shadow-xs transition-colors shrink-0">
      {/* Left side: Mobile Menu + Hayyuu Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <div
          onClick={() => onNavigateSection('projects')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to Projects Dashboard"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Hayyuu AI
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-semibold">
                v1.0.0
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => onNavigateSection('search')}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs rounded-md border border-slate-200 dark:border-slate-700 w-72 transition-all shadow-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex-1 text-left font-medium">Search project intelligence...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 font-mono shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: AI Workflow Status + Theme Toggle + Notifications + User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Active AI Job Streaming Status Indicator */}
        <div className="hidden sm:block">
          <AiJobStatusIndicator
            workflowJobs={workflowJobs}
            currentJobState={aiJobState}
            onSimulateJobState={onSimulateJobState}
          />
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title="Project Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Account Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
        >
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{user.name}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none font-medium">V1 Single User</div>
          </div>
        </button>
      </div>
    </header>
  );
};
