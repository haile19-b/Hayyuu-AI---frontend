'use client'

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  Lightbulb,
} from 'lucide-react';
import { AISuggestion, Project } from '@/types';

interface SuggestionsViewProps {
  project: Project;
  suggestions: AISuggestion[];
  onUpdateSuggestionStatus: (id: string, status: 'ACCEPTED' | 'REJECTED') => void;
}

export const SuggestionsView: React.FC<SuggestionsViewProps> = ({
  project,
  suggestions,
  onUpdateSuggestionStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredSuggestions = suggestions.filter((sug) => {
    const matchesSearch =
      sug.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.content.reasoning.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : sug.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : sug.content.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Extract unique categories for filter dropdown
  const categories = Array.from(
    new Set(
      suggestions.map((s) => {
        // split or clean up compound categories like "Security / Performance"
        const cat = s.content.category || '';
        return cat.includes('/') ? cat.split('/')[0].trim() : cat.trim();
      })
    )
  ).filter(Boolean);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'REJECTED':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Project Suggestions & Gaps</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Actionable gap analysis, missing requirements, omissions, and engineering improvements identified for "{project.name}".
          </p>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">
              {suggestions.filter((s) => s.status === 'PENDING').length}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Pending Suggestions
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">
              {suggestions.filter((s) => s.status === 'ACCEPTED').length}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Accepted suggestions
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">
              {Math.round(
                (suggestions.filter((s) => s.status === 'ACCEPTED').length /
                  (suggestions.length || 1)) *
                  100
              )}%
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Implementation Acceptance
            </div>
          </div>
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
            placeholder="Search suggestions & gaps..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="PENDING">Pending Suggestions</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Dismissed</option>
            <option value="all">All States</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggestions Cards List */}
      <div className="space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
            No AI suggestions found matching the filter criteria.
          </div>
        ) : (
          filteredSuggestions.map((sug) => (
            <div
              key={sug.id}
              className={`bg-white dark:bg-slate-900 border rounded-lg p-5 transition-all space-y-4 shadow-xs border-slate-200 dark:border-slate-800 ${
                sug.status === 'ACCEPTED'
                  ? 'hover:border-emerald-400 dark:hover:border-emerald-500'
                  : sug.status === 'REJECTED'
                  ? 'opacity-60 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-100 dark:border-blue-800 uppercase tracking-wide">
                      {sug.content.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(sug.status)}`}>
                      {sug.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-1">{sug.content.title}</h3>
                </div>

                {sug.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={() => onUpdateSuggestionStatus(sug.id, 'REJECTED')}
                      className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Dismiss suggestion"
                    >
                      <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                    <button
                      onClick={() => onUpdateSuggestionStatus(sug.id, 'ACCEPTED')}
                      className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Accept and resolve gap"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {sug.content.description}
                </p>
              </div>

              {/* Reasoning */}
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/40 space-y-1">
                <h4 className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" /> AI Reasoning & Gap Justification
                </h4>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {sug.content.reasoning}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
