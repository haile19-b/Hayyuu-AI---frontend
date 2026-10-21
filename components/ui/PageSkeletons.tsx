import React from 'react';

// Shadcn standard Skeleton primitive
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800/80 transition-colors ${className || ''}`} />
  );
};

// 1. Project Overview Page Skeleton
export const ProjectOverviewSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Top Project Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="w-12 h-5" />
            <Skeleton className="w-28 h-5" />
          </div>
          <Skeleton className="w-64 h-7" />
          <Skeleton className="w-full max-w-xl h-4" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="w-36 h-9" />
          <Skeleton className="w-44 h-9" />
        </div>
      </div>

      {/* Visual Project Development Progress Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="w-72 h-5" />
            <Skeleton className="w-96 h-4" />
          </div>
          <Skeleton className="w-36 h-8 shrink-0" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <Skeleton className="w-28 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
          <Skeleton className="w-full h-2.5 rounded-full" />
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spec Documents & Extracted Requirements */}
        <div className="lg:col-span-8 space-y-6">
          {/* Spec Documents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="w-48 h-4" />
                      <Skeleton className="w-32 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Requirements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="w-64 h-4" />
                    <Skeleton className="w-full max-w-lg h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-16 h-5" />
                    <Skeleton className="w-16 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detected Conflicts & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Conflicts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Skeleton className="w-36 h-5" />
              <Skeleton className="w-16 h-5" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-2/3 h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Repo activity / knowledge stats info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-4">
            <Skeleton className="w-40 h-5 border-b border-slate-100 dark:border-slate-800 pb-3" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <Skeleton className="w-16 h-3" />
                  <Skeleton className="w-8 h-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Requirements View Page Skeleton
export const RequirementsSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors select-none">
      {/* Left sidebar panel list */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <Skeleton className="w-40 h-5" />
          <Skeleton className="w-full h-8" />
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg space-y-2">
              <Skeleton className="w-full h-4" />
              <div className="flex items-center gap-1.5 pt-1">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right details workspace view */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="w-16 h-5" />
                <Skeleton className="w-16 h-5" />
              </div>
              <Skeleton className="w-96 h-6" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-20 h-8" />
              <Skeleton className="w-20 h-8" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-4/5 h-4" />
          </div>
        </div>

        {/* Linked specs & tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-3">
            <Skeleton className="w-36 h-5 border-b border-slate-100 dark:border-slate-800 pb-2" />
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 border border-slate-100 dark:border-slate-800 rounded-md">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-32 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-3">
            <Skeleton className="w-36 h-5 border-b border-slate-100 dark:border-slate-800 pb-2" />
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 border border-slate-100 dark:border-slate-800 rounded-md">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-40 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Tasks View (Kanban Board) Page Skeleton
export const TasksSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 p-6 space-y-6 overflow-hidden select-none">
      {/* Board top toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
        <Skeleton className="w-64 h-8" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-28 h-8" />
        </div>
      </div>

      {/* 4 Column Kanban Grid Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-hidden">
        {['Backlog', 'Todo', 'In Progress', 'Done'].map((col) => (
          <div key={col} className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-3 flex flex-col h-full overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-6 h-5 rounded-full" />
              </div>
              <Skeleton className="w-5 h-5 rounded" />
            </div>

            {/* Task Card items list */}
            <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3.5 rounded-lg shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-4 h-4 rounded" />
                  </div>
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-4" />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
                    <Skeleton className="w-20 h-4.5" />
                    <Skeleton className="w-14 h-4.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Documents View Page Skeleton
export const DocumentsSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-6 no-scrollbar select-none">
      {/* Top Header Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-2xs flex justify-between items-center gap-4">
        <div className="space-y-1">
          <Skeleton className="w-44 h-5" />
          <Skeleton className="w-72 h-3.5" />
        </div>
        <Skeleton className="w-36 h-9 shrink-0" />
      </div>

      {/* Grid listing items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="w-36 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-16 h-5 shrink-0" />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Skeleton className="w-full h-3.5" />
              <Skeleton className="w-full h-3.5" />
              <Skeleton className="w-4/5 h-3.5" />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <Skeleton className="w-24 h-4.5" />
              <Skeleton className="w-16 h-4.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Conflicts View Page Skeleton
export const ConflictsSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-6 no-scrollbar select-none">
      {/* Header Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg shadow-2xs flex justify-between items-center gap-4">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-56 h-5" />
          <Skeleton className="w-96 h-3.5" />
        </div>
        <Skeleton className="w-24 h-6 shrink-0" />
      </div>

      {/* Main Conflict items list */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1.5">
                <Skeleton className="w-80 h-5" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-24 h-4.5" />
                  <Skeleton className="w-16 h-4.5" />
                </div>
              </div>
              <Skeleton className="w-28 h-8 shrink-0" />
            </div>

            <div className="space-y-2">
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-11/12 h-4" />
            </div>

            {/* Conflicting entities list */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-2.5">
              <Skeleton className="w-36 h-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[1, 2].map((j) => (
                  <div key={j} className="p-2 border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation block */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-lg space-y-2">
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-full h-3.5" />
              <Skeleton className="w-5/6 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
