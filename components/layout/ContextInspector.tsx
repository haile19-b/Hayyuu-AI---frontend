'use client'

import React from 'react';
import {
  X,
  FileText,
  FileCheck2,
  CheckSquare,
  Brain,
  HardDrive,
  Github,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { RetrievedContext } from '@/types';

interface ContextInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  context?: RetrievedContext;
  reasoningSummary?: string;
  toolsUsed?: string[];
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  isOpen,
  onClose,
  context,
  reasoningSummary,
  toolsUsed,
}) => {
  if (!isOpen) return null;

  const hasContent =
    context &&
    ((context.documents && context.documents.length > 0) ||
      (context.requirements && context.requirements.length > 0) ||
      (context.tasks && context.tasks.length > 0) ||
      (context.memories && context.memories.length > 0) ||
      (context.knowledge && context.knowledge.length > 0) ||
      (context.github && context.github.length > 0));

  return (
    <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full z-20 text-xs select-none shadow-sm transition-colors shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>AI Context Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Reasoning Summary */}
        {reasoningSummary && (
          <div className="p-2.5 rounded-md bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
            <div className="text-[10px] font-bold tracking-wider text-blue-700 dark:text-blue-400 uppercase mb-1">
              AI Reasoning Summary
            </div>
            <p className="text-xs leading-relaxed">{reasoningSummary}</p>
          </div>
        )}

        {/* Tools Used */}
        {toolsUsed && toolsUsed.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              Tools Executed
            </div>
            <div className="flex flex-wrap gap-1">
              {toolsUsed.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Retrieved Context Sections */}
        {!hasContent ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400 dark:text-slate-500" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No external sources required</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              This response was generated directly from general engineering context or current turn messages.
            </p>
          </div>
        ) : (
          <>
            {/* Documents */}
            {context?.documents && context.documents.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Retrieved Documents ({context.documents.length})
                </div>
                <div className="space-y-1.5">
                  {context.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <div className="font-semibold text-xs text-blue-700 dark:text-blue-400 truncate">{doc.title}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{doc.excerpt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {context?.requirements && context.requirements.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Linked Requirements ({context.requirements.length})
                </div>
                <div className="space-y-1.5">
                  {context.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-xs text-blue-700 dark:text-blue-400">{req.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{req.type} Requirement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {context?.tasks && context.tasks.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Associated Tasks ({context.tasks.length})
                </div>
                <div className="space-y-1.5">
                  {context.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">{task.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Status: {task.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memories */}
            {context?.memories && context.memories.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  Memory Nodes Used ({context.memories.length})
                </div>
                <div className="space-y-1.5">
                  {context.memories.map((mem, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <div className="font-medium text-xs text-purple-900 dark:text-purple-300">{mem.summary}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider font-mono">
                        {mem.type} Memory
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Context */}
            {context?.github && context.github.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Github className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                  GitHub Code Signals
                </div>
                <div className="space-y-1.5">
                  {context.github.map((gh, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px]"
                    >
                      <div>Repo: {gh.repo} ({gh.branch})</div>
                      {gh.commit && <div className="text-slate-500 dark:text-slate-400 mt-0.5">Commit: {gh.commit}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
