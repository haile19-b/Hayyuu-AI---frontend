'use client'

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CheckSquare,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  Requirement,
  Project,
  RequirementPriority,
  RequirementType,
  RequirementStatus,
  Task,
  ProjectDocument,
  Conflict,
  TaskPriority,
  TaskStatus,
} from '@/types';
import { AiService } from '@/services/aiService';

interface RequirementsViewProps {
  project: Project;
  requirements: Requirement[];
  tasks: Task[];
  documents: ProjectDocument[];
  conflicts: Conflict[];
  selectedRequirementId?: string | null;
  onAddRequirement: (req: Partial<Requirement>) => void;
  onUpdateRequirement: (id: string, req: Partial<Requirement>) => void;
  onDeleteRequirement: (id: string) => void;
  onNavigateToTask: (taskId: string) => void;
  onNavigateToDocument: (docId: string) => void;
  onNavigateToConflict: (conflictId: string) => void;
  onAddTask: (task: Partial<Task>) => void;
}

export const RequirementsView: React.FC<RequirementsViewProps> = ({
  project,
  requirements,
  tasks,
  documents,
  conflicts,
  selectedRequirementId,
  onAddRequirement,
  onUpdateRequirement,
  onDeleteRequirement,
  onNavigateToTask,
  onNavigateToDocument,
  onNavigateToConflict,
  onAddTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [targetReqForNewTask, setTargetReqForNewTask] = useState<Requirement | null>(null);

  // Requirement Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RequirementType>('Functional');
  const [priority, setPriority] = useState<RequirementPriority>('High');
  const [status, setStatus] = useState<RequirementStatus>('Draft');
  const [source, setSource] = useState('');

  // Quick New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('Todo');

  // AI Extraction State
  const [extractText, setExtractText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Highlight selected requirement if provided
  const [highlightedReqId, setHighlightedReqId] = useState<string | null>(selectedRequirementId || null);

  useEffect(() => {
    if (selectedRequirementId) {
      setHighlightedReqId(selectedRequirementId);
    }
  }, [selectedRequirementId]);

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleOpenCreateModal = (req?: Requirement) => {
    if (req) {
      setEditingReq(req);
      setTitle(req.title);
      setDescription(req.description);
      setType(req.type);
      setPriority(req.priority);
      setStatus(req.status);
      setSource(req.source);
    } else {
      setEditingReq(null);
      setTitle('');
      setDescription('');
      setType('Functional');
      setPriority('High');
      setStatus('Draft');
      setSource('Manual Specification');
    }
    setIsModalOpen(true);
  };

  const handleSaveRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingReq) {
      onUpdateRequirement(editingReq.id, {
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        status,
        source: source.trim() || 'Manual Input',
      });
    } else {
      onAddRequirement({
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
        status,
        source: source.trim() || 'Manual Specification',
      });
    }

    setIsModalOpen(false);
  };

  const handleOpenCreateTaskForReq = (req: Requirement) => {
    setTargetReqForNewTask(req);
    setNewTaskTitle(`Implement ${req.title}`);
    setNewTaskDesc(`Engineering task to satisfy requirement ${req.id}: ${req.description}`);
    setNewTaskPriority(req.priority === 'Critical' ? 'Critical' : req.priority === 'High' ? 'High' : req.priority === 'Medium' ? 'Medium' : 'Low');
    setNewTaskStatus('Todo');
    setIsCreateTaskModalOpen(true);
  };

  const handleSaveNewTaskForReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !targetReqForNewTask) return;

    onAddTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      status: newTaskStatus,
      linkedRequirementId: targetReqForNewTask.id,
      tags: ['requirement-driven', targetReqForNewTask.type.toLowerCase()],
    });

    setIsCreateTaskModalOpen(false);
    setTargetReqForNewTask(null);
  };

  const handleAiExtractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractText.trim() || isExtracting) return;

    setIsExtracting(true);
    const extracted = await AiService.extractRequirements(extractText, project.name);

    extracted.forEach((req) => {
      onAddRequirement({
        ...req,
        source: 'AI Extracted Spec',
      });
    });

    setIsExtracting(false);
    setExtractText('');
    setIsExtractModalOpen(false);
  };

  const getPriorityBadge = (p: RequirementPriority) => {
    switch (p) {
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

  const getStatusBadge = (s: RequirementStatus) => {
    switch (s) {
      case 'Approved':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Review':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Deprecated':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getTaskStatusBadge = (st: TaskStatus) => {
    switch (st) {
      case 'Done':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200';
      case 'Todo':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Structured Requirements</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Define, extract, and refine engineering requirements with bidirectional task, document, and conflict linking for "{project.name}".
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExtractModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" /> AI Extract Requirements
          </button>
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Requirement
          </button>
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
            placeholder="Search requirements or IDs..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {highlightedReqId && (
            <button
              onClick={() => setHighlightedReqId(null)}
              className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Filter: {highlightedReqId} <X className="w-3 h-3" />
            </button>
          )}

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="all">All Types</option>
            <option value="Functional">Functional</option>
            <option value="Non-Functional">Non-Functional</option>
            <option value="Security">Security</option>
            <option value="Architecture">Architecture</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="In Review">In Review</option>
            <option value="Draft">Draft</option>
            <option value="Deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {filteredRequirements.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
            No requirements found matching your criteria.
          </div>
        ) : (
          filteredRequirements.map((req) => {
            const isHighlighted = highlightedReqId === req.id;
            const relatedTasks = tasks.filter(
              (t) => t.linkedRequirementId === req.id
            );
            const linkedDocs = documents.filter((d) => req.linkedDocIds?.includes(d.id));
            const reqConflicts = conflicts.filter((c) =>
              c.conflictingArtifacts.some((a) => a.id === req.id)
            );

            return (
              <div
                key={req.id}
                id={`req-card-${req.id}`}
                className={`bg-white dark:bg-slate-900 border rounded-lg p-5 transition-all space-y-4 shadow-xs ${
                  isHighlighted
                    ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/40 bg-blue-50/10 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {req.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{req.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getPriorityBadge(req.priority)}`}>
                        {req.priority} Priority
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                        {req.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 font-sans">{req.description}</p>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-medium flex items-center gap-2">
                      <span>Source: <strong className="text-slate-700 dark:text-slate-300">{req.source}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start">
                    <button
                      onClick={() => handleOpenCreateTaskForReq(req)}
                      className="px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-xs transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-800 cursor-pointer"
                      title="Create task for this requirement"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Create Task
                    </button>
                    <button
                      onClick={() => handleOpenCreateModal(req)}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title="Edit Requirement"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteRequirement(req.id)}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Requirement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Related Artifacts & Cross Links Panel */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                  {/* Related Tasks Column */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Related Tasks ({relatedTasks.length})
                      </span>
                      <button
                        onClick={() => handleOpenCreateTaskForReq(req)}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        + Add Task
                      </button>
                    </div>

                    {relatedTasks.length === 0 ? (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic py-1">
                        No development tasks linked yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {relatedTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onNavigateToTask(t.id)}
                            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 rounded text-xs cursor-pointer transition-all hover:shadow-xs group flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                {t.title}
                              </div>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${getTaskStatusBadge(t.status)}`}>
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Linked Documents Column */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-md p-3 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Linked Documents ({linkedDocs.length})
                    </span>

                    {linkedDocs.length === 0 ? (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic py-1">
                        No starter documents directly attached.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {linkedDocs.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => onNavigateToDocument(d.id)}
                            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 rounded text-xs cursor-pointer transition-all hover:shadow-xs group flex items-center justify-between gap-2"
                          >
                            <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              {d.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Conflicts / Risk Alerts */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-md p-3 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Conflict Risks ({reqConflicts.length})
                    </span>

                    {reqConflicts.length === 0 ? (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium py-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> No active conflicts detected
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {reqConflicts.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => onNavigateToConflict(c.id)}
                            className="p-2 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 rounded text-xs cursor-pointer transition-all hover:shadow-xs group"
                          >
                            <div className="font-semibold text-amber-900 dark:text-amber-200 group-hover:text-amber-800 dark:group-hover:text-amber-100 truncate">
                              {c.title}
                            </div>
                            <div className="text-[10px] text-amber-700 dark:text-amber-300 font-mono mt-0.5">
                              {c.severity} Severity · Click to review
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Requirement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {editingReq ? 'Edit Requirement' : 'Create Requirement'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Strict Sub-100ms API Settlement SLA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the requirement specifications..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RequirementType)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Non-Functional">Non-Functional</option>
                    <option value="Security">Security</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RequirementPriority)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RequirementStatus)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Source Artifact</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Security and Compliance Spec v2.1"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500"
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
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task for Requirement Modal */}
      {isCreateTaskModalOpen && targetReqForNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsCreateTaskModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">Create Development Task</h2>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  Linked to Requirement: [{targetReqForNewTask.id}] {targetReqForNewTask.title}
                </div>
              </div>
              <button onClick={() => setIsCreateTaskModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTaskForReq} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Create & Link Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Extraction Modal */}
      {isExtractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsExtractModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" /> AI Requirement Extraction Engine
              </div>
              <button onClick={() => setIsExtractModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAiExtractSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Paste Raw Unstructured Document / Technical Spec
                </label>
                <textarea
                  value={extractText}
                  onChange={(e) => setExtractText(e.target.value)}
                  placeholder="Paste meeting notes, RFC drafts, or technical specs here for Gemini AI extraction..."
                  rows={6}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 resize-none font-sans"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExtractModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExtracting || !extractText.trim()}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Extract Requirements
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
