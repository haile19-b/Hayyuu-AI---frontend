'use client'

import React, { useState } from 'react';
import { Cpu, Sparkles, CheckCircle2, AlertCircle, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { WorkflowJob } from '@/types';
import { useAppStore, AiJobStateStatus, AiJobState } from '@/services/store';

interface AiJobStatusIndicatorProps {
  workflowJobs?: WorkflowJob[];
  currentJobState?: AiJobState;
  onSimulateJobState?: (status: AiJobStateStatus) => void;
}

export const AiJobStatusIndicator: React.FC<AiJobStatusIndicatorProps> = ({
  workflowJobs = [],
  currentJobState,
  onSimulateJobState,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fallback or active state derived from props
  const activeJob = workflowJobs.find((j) => j.status === 'running');
  const jobState: AiJobState = currentJobState || {
    status: activeJob ? 'running' : 'idle',
    jobName: activeJob ? activeJob.name : 'AI Engine Ingestion',
    progress: activeJob ? activeJob.progress : 100,
    message: activeJob ? activeJob.details : 'System ready for vector indexing',
    updatedAt: new Date().toLocaleTimeString(),
  };

  const renderStatusBadge = () => {
    switch (jobState.status) {
      case 'running':
      case 'generating':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs font-semibold text-amber-800 dark:text-amber-300 transition-all shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Loader2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
            <span className="font-mono text-[11px]">
              AI Job Running <span className="text-amber-600 dark:text-amber-400">● Generating...</span>
            </span>
            <ChevronDown className="w-3 h-3 text-amber-600 dark:text-amber-400 opacity-70 ml-0.5" />
          </div>
        );

      case 'processing':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md text-xs font-semibold text-blue-800 dark:text-blue-300 transition-all shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-bounce" />
            <span className="font-mono text-[11px]">Processing Project...</span>
            <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400 opacity-70 ml-0.5" />
          </div>
        );

      case 'completed':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-all shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-[11px]">Job Completed</span>
            <ChevronDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-70 ml-0.5" />
          </div>
        );

      case 'failed':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-md text-xs font-semibold text-rose-800 dark:text-rose-300 transition-all shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span className="font-mono text-[11px]">Job Failed</span>
            <ChevronDown className="w-3 h-3 text-rose-600 dark:text-rose-400 opacity-70 ml-0.5" />
          </div>
        );

      case 'idle':
      default:
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-[11px]">AI Engine Idle</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </div>
        );
    }
  };

  return (
    <div className="relative inline-block select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded-md cursor-pointer"
        title="Click to view active AI streaming job status"
      >
        {renderStatusBadge()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 p-4 space-y-3 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>AI Streaming & Background Pipeline</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{jobState.updatedAt}</span>
            </div>

            {/* Active Job Information */}
            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{jobState.jobName}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase">
                  {jobState.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                {jobState.message}
              </p>

              {/* Progress Bar */}
              {(jobState.status === 'running' ||
                jobState.status === 'generating' ||
                jobState.status === 'processing') && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    <span>Pipeline Step Execution</span>
                    <span>{jobState.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 animate-pulse"
                      style={{ width: `${jobState.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Simulated State Switcher for Testing/Demoing */}
            {onSimulateJobState && (
              <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simulate Job State (Test Harness)
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => {
                      onSimulateJobState('running');
                      setIsOpen(false);
                    }}
                    className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-slate-800 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-600" />
                    <span>AI Generating...</span>
                  </button>

                  <button
                    onClick={() => {
                      onSimulateJobState('processing');
                      setIsOpen(false);
                    }}
                    className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-medium text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Processing</span>
                  </button>

                  <button
                    onClick={() => {
                      onSimulateJobState('completed');
                      setIsOpen(false);
                    }}
                    className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Job Completed</span>
                  </button>

                  <button
                    onClick={() => {
                      onSimulateJobState('failed');
                      setIsOpen(false);
                    }}
                    className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-medium text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    <span>Job Failed</span>
                  </button>

                  <button
                    onClick={() => {
                      onSimulateJobState('idle');
                      setIsOpen(false);
                    }}
                    className="col-span-2 p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-center cursor-pointer"
                  >
                    Reset to Idle
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
