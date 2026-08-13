'use client'

import React, { useState } from 'react';
import { Settings as SettingsIcon, Github, Save, Trash2, ShieldAlert, Sun, Moon, Palette } from 'lucide-react';
import { Project } from '@/types';
import { useTheme } from 'next-themes';

interface SettingsViewProps {
  project: Project;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  project,
  onUpdateProject,
  onDeleteProject,
}) => {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(project.name);
  const [key, setKey] = useState(project.key);
  const [description, setDescription] = useState(project.description);
  const [repositoryUrl, setRepositoryUrl] = useState(project.repositoryUrl || '');
  const [branch, setBranch] = useState(project.branch || 'main');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject(project.id, {
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
      repositoryUrl: repositoryUrl.trim(),
      branch: branch.trim() || 'main',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 max-w-4xl transition-colors no-scrollbar select-none">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Project Workspace Settings</h1>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Configure metadata, display themes, GitHub repository integration, and vector intelligence indexing for "{project.name}".
        </p>
      </div>

      {/* Theme Selection Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Application Visual Theme
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Select your preferred application color palette. Theme settings are saved across your local browser session.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border flex items-center gap-3 text-left transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs">Bright / Light Mode</div>
              <div className="text-[11px] opacity-75">Clean, crisp high-contrast daylight theme</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border flex items-center gap-3 text-left transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-blue-950/50 dark:bg-blue-900/40 border-blue-500 text-blue-200 ring-2 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 border border-slate-700">
              <Moon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-xs">Dark Mode</div>
              <div className="text-[11px] opacity-75">Eye-safe low-light developer palette</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Basic Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            General Project Configuration
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Key</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden focus:border-blue-600 uppercase"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 resize-none font-sans"
            />
          </div>
        </div>

        {/* GitHub Repository Integration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
            <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" /> GitHub Repository Link
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Repository URL</label>
              <input
                type="text"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/org/repo-name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Project Settings
          </button>
          {savedSuccess && <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs animate-bounce">Settings saved successfully!</span>}
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-5 space-y-3 mt-8">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-700 dark:text-rose-400" /> Danger Zone
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          Permanently remove this project space along with all associated vector documents, requirements, conflicts, tasks, knowledge graphs, and AI memories.
        </p>

        <button
          type="button"
          onClick={() => {
            if (confirm(`Are you sure you want to permanently delete project "${project.name}"?`)) {
              onDeleteProject(project.id);
            }
          }}
          className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Delete Isolated Project Environment
        </button>
      </div>
    </div>
  );
};
