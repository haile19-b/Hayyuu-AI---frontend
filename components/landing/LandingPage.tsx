'use client'

import React from 'react';
import {
  Layers,
  Brain,
  Sparkles,
  MessageSquareCode,
  HardDrive,
  FileText,
  ArrowRight,
  Bot,
  CheckCircle2,
  FolderGit2,
  AlertTriangle,
} from 'lucide-react';
import ThemeToggle from '@/app/theme-toggle';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignUp,
  onNavigateToApp,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 select-none">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateToApp}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Hayyuu AI
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-semibold">
                  v1.0.0
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Software Project Intelligence Engine
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Log In */}
            <button
              onClick={onNavigateToLogin}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Log In
            </button>

            {/* Sign Up Primary Button */}
            <button
              onClick={onNavigateToSignUp}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Introducing Hayyuu Project Intelligence Engine</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.15]">
            Hayyuu AI understands your entire software project—
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
              not just your code.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Connect project requirements, documents, tasks, architecture decisions, conversations, repository information, knowledge graphs, and AI memory into a single context-aware engine.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onNavigateToSignUp}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onNavigateToApp}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Live Workspace
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free V1 Release
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Setup Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant GitHub & Document Integration
            </span>
          </div>

          {/* Interactive Workspace Mockup Showcase */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 text-left transition-colors">
              {/* Fake Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
                    project-novapay // Hayyuu Context Engine
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Vector Engine Sync: 100%
                  </span>
                </div>
              </div>

              {/* Grid Content Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Column 1: Ingested Knowledge */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Connected Artifacts
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">4 Active</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="truncate">NovaPay API Spec v2.4.pdf</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono">Synced</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="truncate">REQ-002: JWT Auth SLA</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-mono font-bold">Critical</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Reasoning Chat */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 md:col-span-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Multi-Source Reasoning Engine
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                      Context: 2 Docs + 3 Req + 1 Memory
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200 space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      User: Does our token refresh logic comply with REQ-002 and the latest GitHub commit?
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Hayyuu AI:</span> Yes. Cross-referencing <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">NovaPay_Auth_SLA.pdf</code> and Commit <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">#a81f3</code>: JWT expiry is set to 15m with Redis cluster session revocation. Zero drift detected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Product Features */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Built for engineering teams who demand clarity
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Traditional tools separate your specifications, code, and conversations. Hayyuu AI fuses them into a single living project context.
            </p>
          </div>

          {/* Feature 1: Understand your project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                1. Understand your project
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Hayyuu AI brings together your documents, requirements, code, tasks, and team conversations into one connected project workspace.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Automatic vector indexing of technical specifications & PRDs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Real-time link between requirement IDs and GitHub implementation commits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Unified search across all project knowledge graphs</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Unified Context Map
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Connected</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">SPECIFICATIONS</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">28 Requirements</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">REPOSITORY</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">14 Commits / 3 PRs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Ask your project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
            <div className="space-y-4 md:order-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                2. Ask your project
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Chat with an AI that can reason over the exact knowledge, code, and architectural decisions of your specific project.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Inspect precise document excerpts and citations behind every AI answer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Ask about code dependencies, APIs, SLA requirements, and system trade-offs</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 md:order-1">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Q: What is our idempotency strategy for card payouts?</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">RAG Cited</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  According to <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">REQ-004</span> and <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">API_Spec_v2.pdf</span>: Requests require an <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">Idempotency-Key</code> header stored in Redis with 24-hour TTL.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3: Turn insight into action & Build memory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                3. Turn insight into action
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automatically detect requirement contradictions, missing specification gaps, unlinked tasks, and code implementation drift before bugs hit production.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                4. Build project memory
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Preserve important architectural decisions, constraints, and team choices in vector memory so the AI becomes smarter and more aligned over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Ready to give your software project real intelligence?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Join thousands of developers and engineering managers who build with clarity and zero context drift using Hayyuu AI.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToSignUp}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToLogin}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Hayyuu AI</span>
            <span>— Software Project Intelligence Platform</span>
          </div>
          <div>
            © {new Date().getFullYear()} Hayyuu AI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
