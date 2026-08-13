'use client'

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Sparkles,
  Kanban,
  List as ListIcon,
  X,
  Edit2,
  Trash2,
  Github,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Task, Project, TaskPriority, TaskStatus, Requirement, ProjectDocument } from '@/types';

interface TasksViewProps {
  project: Project;
  tasks: Task[];
  requirements: Requirement[];
  documents: ProjectDocument[];
  selectedTaskId?: string | null;
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateTask: (taskId: string, task: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToRequirement: (reqId: string) => void;
  onNavigateToDocument: (docId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  project,
  tasks,
  requirements,
  documents,
  selectedTaskId,
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onNavigateToRequirement,
  onNavigateToDocument,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Backlog');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [linkedReqId, setLinkedReqId] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  // Highlight state
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(selectedTaskId || null);

  useEffect(() => {
    if (selectedTaskId) {
      setHighlightedTaskId(selectedTaskId);
    }
  }, [selectedTaskId]);

  const statuses: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Done'];

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (t?: Task) => {
    if (t) {
      setEditingTask(t);
      setTitle(t.title);
      setDescription(t.description);
      setStatus(t.status);
      setPriority(t.priority);
      setLinkedReqId(t.linkedRequirementId || '');
      setTagsStr(t.tags.join(', '));
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setStatus('Backlog');
      setPriority('Medium');
      setLinkedReqId('');
      setTagsStr('dev, feature');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingTask) {
      onUpdateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        linkedRequirementId: linkedReqId || undefined,
        tags,
      });
    } else {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        linkedRequirementId: linkedReqId || undefined,
        tags,
      });
    }

    setIsModalOpen(false);
  };

  const handleGenerateAiTaskSuggestions = () => {
    // Generate tasks based on unlinked requirements
    const unlinkedReqs = requirements.filter((r) => !tasks.some((t) => t.linkedRequirementId === r.id));
    const targetReqs = unlinkedReqs.length > 0 ? unlinkedReqs : requirements.slice(0, 2);

    targetReqs.slice(0, 2).forEach((req) => {
      onAddTask({
        title: `Implement: ${req.title}`,
        description: `Engineering implementation task auto-suggested by Hayyuu AI based on Requirement ${req.id}: ${req.description}`,
        status: 'Todo',
        priority: req.priority === 'Critical' ? 'Critical' : req.priority === 'High' ? 'High' : req.priority === 'Medium' ? 'Medium' : 'Low',
        linkedRequirementId: req.id,
        tags: ['ai-suggested', req.type.toLowerCase()],
      });
    });
  };

  const getPriorityBadge = (p: TaskPriority) => {
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
            <CheckSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Development Tasks</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Engineering tasks directly connected to requirements, specifications, and code commits for "{project.name}".
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAiTaskSuggestions}
            className="px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Auto-generate tasks from unlinked requirements"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" /> AI Task Suggestions
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Control Bar: Search & View Switcher */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or tags..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {highlightedTaskId && (
            <button
              onClick={() => setHighlightedTaskId(null)}
              className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Selected Task Filter Active <X className="w-3 h-3" />
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {statuses.map((st) => {
            const columnTasks = filteredTasks.filter((t) => t.status === st);

            return (
              <div key={st} className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-3 min-h-[400px]">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{st}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold border border-slate-300 dark:border-slate-700">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {columnTasks.map((task) => {
                    const parentReq = requirements.find((r) => r.id === task.linkedRequirementId);
                    const linkedDoc = documents.find((d) => d.id === task.linkedDocId);
                    const isHighlighted = highlightedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        id={`task-card-${task.id}`}
                        className={`bg-white dark:bg-slate-900 border rounded-md p-3.5 space-y-2.5 transition-all shadow-xs group ${
                          isHighlighted
                            ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/40 bg-blue-50/10 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getPriorityBadge(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenModal(task)}
                              className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                              title="Edit Task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.title}</h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">{task.description}</p>

                        {/* Requirement Relationship Indicator */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Parent Requirement:
                          </div>
                          {parentReq ? (
                            <button
                              onClick={() => onNavigateToRequirement(parentReq.id)}
                              className="w-full text-left p-1.5 rounded bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 transition-colors flex items-center justify-between gap-1 group/link cursor-pointer"
                            >
                              <div className="min-w-0 flex-1 truncate">
                                <span className="font-mono font-bold text-blue-700 dark:text-blue-300 mr-1">[{parentReq.id}]</span>
                                <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">{parentReq.title}</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 group-hover/link:translate-x-0.5 transition-transform" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(task)}
                              className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <AlertCircle className="w-3 h-3" /> Unlinked · Click to Attach
                            </button>
                          )}
                        </div>

                        {/* Linked Document & GitHub Links */}
                        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                          {task.linkedGithubIssue ? (
                            <a
                              href={task.linkedGithubIssue.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-mono font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                            >
                              <Github className="w-3 h-3 text-slate-800 dark:text-slate-200" /> Issue #{task.linkedGithubIssue.id}
                            </a>
                          ) : linkedDoc ? (
                            <button
                              onClick={() => onNavigateToDocument(linkedDoc.id)}
                              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 truncate max-w-[140px] cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" /> {linkedDoc.title}
                            </button>
                          ) : (
                            <span />
                          )}

                          <select
                            value={task.status}
                            onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-hidden font-medium ml-auto cursor-pointer"
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 shadow-xs">
          {filteredTasks.map((task) => {
            const parentReq = requirements.find((r) => r.id === task.linkedRequirementId);

            return (
              <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{task.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-1 leading-relaxed font-sans">{task.description}</p>

                  {parentReq && (
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Requirement:</span>
                      <button
                        onClick={() => onNavigateToRequirement(parentReq.id)}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        [{parentReq.id}] {parentReq.title} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-medium cursor-pointer"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => handleOpenModal(task)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteTask(task.id)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">{editingTask ? 'Edit Task' : 'Create Development Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement Redis Distributed Lock"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide task engineering details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden font-medium cursor-pointer"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Link to Requirement (Optional)</label>
                <select
                  value={linkedReqId}
                  onChange={(e) => setLinkedReqId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="">-- No Requirement Linked --</option>
                  {requirements.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.id}] {r.title}
                    </option>
                  ))}
                </select>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
