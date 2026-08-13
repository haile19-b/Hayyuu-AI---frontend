'use client'

import React from 'react';
import { ChevronRight, Folder, Home } from 'lucide-react';
import { NavigationSection, Project } from '@/types';

interface BreadcrumbsProps {
  currentProject?: Project;
  activeSection: NavigationSection;
  selectedRequirementId?: string | null;
  selectedRequirementTitle?: string | null;
  selectedTaskId?: string | null;
  selectedTaskTitle?: string | null;
  selectedDocumentId?: string | null;
  selectedDocumentTitle?: string | null;
  onNavigateSection: (section: NavigationSection) => void;
  onClearArtifactSelection?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentProject,
  activeSection,
  selectedRequirementId,
  selectedRequirementTitle,
  selectedTaskId,
  selectedTaskTitle,
  selectedDocumentId,
  selectedDocumentTitle,
  onNavigateSection,
  onClearArtifactSelection,
}) => {
  const getSectionLabel = (section: NavigationSection): string => {
    switch (section) {
      case 'projects':
        return 'Projects Dashboard';
      case 'overview':
        return 'Project Overview';
      case 'chat':
        return 'AI Chat';
      case 'documents':
        return 'Documents Hub';
      case 'requirements':
        return 'Requirements';
      case 'conflicts':
        return 'Conflicts & Risks';
      case 'tasks':
        return 'Tasks';
      case 'github':
        return 'GitHub Sync';
      case 'knowledge':
        return 'Knowledge Graph';
      case 'memory':
        return 'AI Memory';
      case 'search':
        return 'Search Intelligence';
      case 'settings':
        return 'Settings';
      default:
        return section;
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center text-xs font-medium text-slate-600 dark:text-slate-400 select-none overflow-x-auto shadow-2xs transition-colors shrink-0"
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
        {/* Projects Root Link */}
        <button
          onClick={() => {
            if (onClearArtifactSelection) onClearArtifactSelection();
            onNavigateSection('projects');
          }}
          className={`flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5 px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
            activeSection === 'projects' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
          title="All Projects Dashboard"
        >
          <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Projects</span>
        </button>

        {/* Project Level */}
        {currentProject && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <button
              onClick={() => {
                if (onClearArtifactSelection) onClearArtifactSelection();
                onNavigateSection('overview');
              }}
              className={`flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 max-w-[180px] sm:max-w-[240px] truncate cursor-pointer ${
                activeSection === 'overview'
                  ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800/80'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
              title={`Project: ${currentProject.name}`}
            >
              <Folder className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">{currentProject.name}</span>
            </button>
          </>
        )}

        {/* Section Level */}
        {activeSection !== 'projects' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <button
              onClick={() => {
                if (onClearArtifactSelection) onClearArtifactSelection();
                onNavigateSection(activeSection);
              }}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                !selectedRequirementId && !selectedTaskId && !selectedDocumentId
                  ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60'
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }`}
            >
              {getSectionLabel(activeSection)}
            </button>
          </>
        )}

        {/* Selected Artifact Item Level (Requirements) */}
        {activeSection === 'requirements' && selectedRequirementTitle && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span
              className="px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold max-w-[200px] truncate border border-blue-200 dark:border-blue-800"
              title={selectedRequirementTitle}
            >
              {selectedRequirementTitle}
            </span>
          </>
        )}

        {/* Selected Artifact Item Level (Tasks) */}
        {activeSection === 'tasks' && selectedTaskTitle && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span
              className="px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold max-w-[200px] truncate border border-blue-200 dark:border-blue-800"
              title={selectedTaskTitle}
            >
              {selectedTaskTitle}
            </span>
          </>
        )}

        {/* Selected Artifact Item Level (Documents) */}
        {activeSection === 'documents' && selectedDocumentTitle && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span
              className="px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold max-w-[200px] truncate border border-blue-200 dark:border-blue-800"
              title={selectedDocumentTitle}
            >
              {selectedDocumentTitle}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};
