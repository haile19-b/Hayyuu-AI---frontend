'use client'

import React, { useState } from 'react';
import { Brain, Search, Trash2 } from 'lucide-react';
import { KnowledgeEntity, Project } from '@/types';

interface KnowledgeViewProps {
  project: Project;
  knowledgeEntities: KnowledgeEntity[];
  onAddEntity: (entity: { name: string; type: string; description: string; relatedEntityIds?: string[] }) => void;
  onDeleteEntity: (id: string) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  project,
  knowledgeEntities,
  onAddEntity,
  onDeleteEntity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredEntities = knowledgeEntities.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || k.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Project Knowledge Graph</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Structured graph representation of domain entities, microservices, protocols, and architectural rules for "{project.name}".
          </p>
        </div>
      </div>

      {/* Search & Type Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities or concepts..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium cursor-pointer"
        >
          <option value="all">All Entity Types</option>
          <option value="Domain Model">Domain Model</option>
          <option value="Microservice">Microservice</option>
          <option value="Database">Database</option>
          <option value="Protocol">Protocol</option>
          <option value="Compliance Rule">Compliance Rule</option>
        </select>
      </div>

      {/* Entity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities.map((ent) => (
          <div
            key={ent.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg p-4 transition-all flex flex-col justify-between space-y-3 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-mono font-bold">
                  {ent.type}
                </span>
                <button
                  onClick={() => onDeleteEntity(ent.id)}
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ent.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-sans">{ent.description}</p>
            </div>

            {ent.relatedEntityIds.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-bold">
                  Graph Relationships ({ent.relatedEntityIds.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {ent.relatedEntityIds.map((relId) => (
                    <span
                      key={relId}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-semibold border-purple-200 dark:border-purple-850"
                    >
                      → {relId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
