'use client'

import React from 'react';
import { X, User, Github, Shield, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (profile: Partial<UserProfile>) => void;
  onLogOut?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogOut,
}) => {
  const [name, setName] = React.useState(user.name || '');
  const [email, setEmail] = React.useState(user.email || '');
  const [githubUsername, setGithubUsername] = React.useState(user.githubUsername || '');

  // Reset local state when modal opens with new user data
  React.useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setGithubUsername(user.githubUsername || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, email, githubUsername, githubConnected: !!githubUsername });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">Developer Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hayyuu AI Version 1 Single-User Environment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Developer Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> GitHub Username
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> OAuth Active
              </span>
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 font-mono"
              placeholder="e.g. arivera-dev"
            />
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 mt-4">
            <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Single-User Isolation
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold">
                Isolated
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              All projects, requirements, memories, vector embeddings, and knowledge graph entities are securely tied to your user session.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {onLogOut ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogOut();
                }}
                className="px-3 py-2 rounded-md bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
