'use client'

import React, { useState } from 'react';
import {
  Search,
  FileText,
  FileCheck2,
  AlertTriangle,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import {
  Project,
  ProjectDocument,
  Requirement,
  Conflict,
  Task,
  KnowledgeEntity,
  MemoryItem,
  NavigationSection,
} from '@/types';

interface UnifiedSearchViewProps {
  project: Project;
  documents: ProjectDocument[];
  requirements: Requirement[];
  conflicts: Conflict[];
  tasks: Task[];
  knowledgeEntities: KnowledgeEntity[];
  memories: MemoryItem[];
  onNavigateSection: (section: NavigationSection) => void;
}

export const UnifiedSearchView: React.FC<UnifiedSearchViewProps> = ({
  project,
  documents,
  requirements,
  conflicts,
  tasks,
  knowledgeEntities,
  memories,
  onNavigateSection,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const matchesQuery = (text?: string) => {
    if (!query.trim()) return true;
    return text ? text.toLowerCase().includes(query.toLowerCase()) : false;
  };

  const matchedDocs = documents.filter((d) => matchesQuery(d.title) || matchesQuery(d.summary));
  const matchedReqs = requirements.filter((r) => matchesQuery(r.title) || matchesQuery(r.description));
  const matchedConflicts = conflicts.filter((c) => matchesQuery(c.title) || matchesQuery(c.description));
  const matchedTasks = tasks.filter((t) => matchesQuery(t.title) || matchesQuery(t.description));
  const matchedKnowledge = knowledgeEntities.filter((k) => matchesQuery(k.name) || matchesQuery(k.description));
  const matchedMemories = memories.filter((m) => matchesQuery(m.summary) || matchesQuery(m.content));

  const totalResults =
    matchedDocs.length +
    matchedReqs.length +
    matchedConflicts.length +
    matchedTasks.length +
    matchedKnowledge.length +
    matchedMemories.length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Unified Project Intelligence Search</h1>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Query vector indices, requirements, tasks, knowledge graphs, and memory across "{project.name}".
        </p>

        {/* Big Search Input */}
        <div className="relative max-w-2xl pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any keyword (e.g. JWT, Idempotency, Settlement, SLA)..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 shadow-xs placeholder:text-slate-400"
            autoFocus
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Results ({totalResults})
        </button>
        <button
          onClick={() => setCategoryFilter('documents')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            categoryFilter === 'documents'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Documents ({matchedDocs.length})
        </button>
        <button
          onClick={() => setCategoryFilter('requirements')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            categoryFilter === 'requirements'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Requirements ({matchedReqs.length})
        </button>
        <button
          onClick={() => setCategoryFilter('conflicts')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            categoryFilter === 'conflicts'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Conflicts ({matchedConflicts.length})
        </button>
        <button
          onClick={() => setCategoryFilter('tasks')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            categoryFilter === 'tasks'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tasks ({matchedTasks.length})
        </button>
      </div>

      {/* Results Feed */}
      <div className="space-y-4 max-w-4xl">
        {/* Documents */}
        {(categoryFilter === 'all' || categoryFilter === 'documents') && matchedDocs.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Documents
            </div>
            {matchedDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigateSection('documents')}
                className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{doc.title}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-1">{doc.summary}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Requirements */}
        {(categoryFilter === 'all' || categoryFilter === 'requirements') && matchedReqs.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" /> Requirements
            </div>
            {matchedReqs.map((req) => (
              <div
                key={req.id}
                onClick={() => onNavigateSection('requirements')}
                className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">[{req.id}]</span>
                    <span>{req.title}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-1">{req.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Conflicts */}
        {(categoryFilter === 'all' || categoryFilter === 'conflicts') && matchedConflicts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Conflicts & Risks
            </div>
            {matchedConflicts.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateSection('conflicts')}
                className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-semibold text-amber-800 dark:text-amber-300">{c.title}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-1">{c.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Tasks */}
        {(categoryFilter === 'all' || categoryFilter === 'tasks') && matchedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Tasks
            </div>
            {matchedTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigateSection('tasks')}
                className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-1">{t.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
