'use client'

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  FileCheck2,
  Search,
} from 'lucide-react';
import { Conflict, Project, ConflictSeverity } from '@/types';

interface ConflictsViewProps {
  project: Project;
  conflicts: Conflict[];
  onResolveConflict: (conflictId: string, status: 'Resolved' | 'Ignored') => void;
}

export const ConflictsView: React.FC<ConflictsViewProps> = ({
  project,
  conflicts,
  onResolveConflict,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const filteredConflicts = conflicts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.aiExplanation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? c.status === 'Active' || c.status === 'Investigating'
        : c.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (sev: ConflictSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'High':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Medium':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Conflict & Risk Detection</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Automated detection of contradictions, ambiguities, gaps, and compliance risks across project artifacts for "{project.name}".
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search risks & conflicts..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="active">Active Risks Only</option>
            <option value="all">All Conflict States</option>
            <option value="Resolved">Resolved</option>
            <option value="Ignored">Ignored</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Conflicts Cards List */}
      <div className="space-y-4">
        {filteredConflicts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
            No conflicts found matching your filter criteria.
          </div>
        ) : (
          filteredConflicts.map((conf) => (
            <div
              key={conf.id}
              className={`bg-white dark:bg-slate-900 border rounded-lg p-5 transition-all space-y-4 shadow-xs ${
                conf.status === 'Resolved'
                  ? 'border-slate-200 dark:border-slate-800 opacity-60'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(conf.severity)}`}>
                    {conf.severity} Severity
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700">
                    {conf.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{conf.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Status: <strong className="text-slate-800 dark:text-slate-200">{conf.status}</strong>
                  </span>
                  {conf.status !== 'Resolved' && (
                    <button
                      onClick={() => onResolveConflict(conf.id, 'Resolved')}
                      className="px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Conflict
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{conf.description}</p>

              {/* Conflicting Artifacts */}
              {conf.conflictingArtifacts.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Conflicting Artifacts
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conf.conflictingArtifacts.map((art, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-mono font-medium"
                      >
                        {art.type === 'Requirement' ? (
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                        <span>{art.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Explanation & Suggested Resolution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> AI Root Cause Explanation
                  </div>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-[11px] font-sans">{conf.aiExplanation}</p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
                  <div className="font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Recommended Action
                  </div>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-[11px] font-sans">{conf.suggestedAction}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
