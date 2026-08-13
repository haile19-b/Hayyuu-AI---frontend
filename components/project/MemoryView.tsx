'use client'

import React, { useState } from 'react';
import { HardDrive, Plus, Search, Trash2, X } from 'lucide-react';
import { MemoryItem, Project, MemoryType } from '@/types';

interface MemoryViewProps {
  project: Project;
  memories: MemoryItem[];
  onAddMemory: (memory: { summary: string; type: MemoryType; content: string }) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  project,
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryType>('long_term');

  const filteredMemories = memories.filter((m) =>
    m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !content.trim()) return;

    onAddMemory({
      summary: summary.trim(),
      content: content.trim(),
      type,
    });

    setSummary('');
    setContent('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Memory Inspector</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Inspected vector-remembered preferences, decisions, and architectural rules for "{project.name}".
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Memory Node
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search memory vector embeddings..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 shadow-xs placeholder:text-slate-400"
        />
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg p-4 transition-all space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">
                {mem.type} Memory
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {mem.createdAt ? new Date(mem.createdAt).toLocaleDateString() : ''}
                </span>
                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{mem.summary}</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
              {mem.content}
            </p>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">Add AI Memory Constraint</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Memory Summary *</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Always use Redis Cluster for Session Caching"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Memory Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MemoryType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="working">Working Context</option>
                  <option value="short_term">Short Term Memory</option>
                  <option value="long_term">Long Term / Architecture Rule</option>
                  <option value="episodic">Episodic Session Log</option>
                  <option value="semantic">Semantic Concept</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Content / Instruction *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed rule or context for vector retrieval..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 resize-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Save Memory Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
