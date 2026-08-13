import {
  Project,
  ProjectDocument,
  Requirement,
  Conflict,
  Task,
  GitHubRepoInfo,
  KnowledgeEntity,
  KnowledgeRelation,
  MemoryItem,
  Conversation,
  Message,
  SearchResult,
  NotificationItem,
  WorkflowJob,
  UserProfile,
  TaskStatus,
} from '@/types';

import {
  initialUserProfile,
  initialProjects,
  initialDocuments,
  initialRequirements,
  initialConflicts,
  initialTasks,
  initialGitHubRepoInfo,
  initialKnowledgeEntities,
  initialKnowledgeRelations,
  initialMemoryItems,
  initialConversations,
  initialNotifications,
  initialWorkflowJobs,
} from './mockData';

const STORAGE_KEYS = {
  USER: 'hayyuu_user_profile',
  PROJECTS: 'hayyuu_projects',
  ACTIVE_PROJECT: 'hayyuu_active_project_id',
  DOCUMENTS: 'hayyuu_documents',
  REQUIREMENTS: 'hayyuu_requirements',
  CONFLICTS: 'hayyuu_conflicts',
  TASKS: 'hayyuu_tasks',
  GITHUB: 'hayyuu_github',
  KNOWLEDGE: 'hayyuu_knowledge_entities',
  KNOWLEDGE_RELATIONS: 'hayyuu_knowledge_relations',
  MEMORIES: 'hayyuu_memories',
  CONVERSATIONS: 'hayyuu_conversations',
  NOTIFICATIONS: 'hayyuu_notifications',
  WORKFLOWS: 'hayyuu_workflows',
};

// Helper for local storage read/write with server-side check
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export class StorageService {
  // User Profile
  static getUserProfile(): UserProfile {
    return getItem<UserProfile>(STORAGE_KEYS.USER, initialUserProfile);
  }

  static updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    setItem(STORAGE_KEYS.USER, updated);
    return updated;
  }

  static saveUserProfile(profile: UserProfile): UserProfile {
    setItem(STORAGE_KEYS.USER, profile);
    return profile;
  }

  // Active Project ID
  static getActiveProjectId(): string {
    const projects = this.getProjects();
    const active = getItem<string>(STORAGE_KEYS.ACTIVE_PROJECT, projects[0]?.id || 'proj-novapay');
    if (projects.some((p) => p.id === active)) return active;
    return projects[0]?.id || 'proj-novapay';
  }

  static setActiveProjectId(projectId: string): void {
    setItem(STORAGE_KEYS.ACTIVE_PROJECT, projectId);
  }

  // Projects
  static getProjects(): Project[] {
    return getItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  }

  static getProject(projectId: string): Project | undefined {
    return this.getProjects().find((p) => p.id === projectId);
  }

  static createProject(newProjectData: {
    name: string;
    key: string;
    description: string;
    repositoryUrl?: string;
    branch?: string;
  }): Project {
    const projects = this.getProjects();
    const id = `proj-${Date.now()}`;
    const newProj: Project = {
      id,
      name: newProjectData.name,
      key: newProjectData.key.toUpperCase(),
      description: newProjectData.description,
      repositoryUrl: newProjectData.repositoryUrl || '',
      branch: newProjectData.branch || 'main',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Active',
      documentsCount: 0,
      requirementsCount: 0,
      tasksCount: 0,
      conflictsCount: 0,
      memoriesCount: 1,
      knowledgeEntitiesCount: 0,
    };

    projects.unshift(newProj);
    setItem(STORAGE_KEYS.PROJECTS, projects);
    this.setActiveProjectId(id);

    // Seed empty arrays for new project
    const memories = getItem<Record<string, MemoryItem[]>>(STORAGE_KEYS.MEMORIES, initialMemoryItems);
    memories[id] = [
      {
        id: `mem-${Date.now()}`,
        projectId: id,
        type: 'working',
        summary: `Project "${newProj.name}" Initialized`,
        content: `Project setup created with repository ${newProj.repositoryUrl || 'Local'}. Ready to import documents and define engineering requirements.`,
        source: 'System Initialization',
        relevanceScore: 1.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setItem(STORAGE_KEYS.MEMORIES, memories);

    return newProj;
  }

  static updateProject(projectId: string, updates: Partial<Project>): Project | undefined {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index === -1) return undefined;

    projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.PROJECTS, projects);
    return projects[index];
  }

  static deleteProject(projectId: string): void {
    let projects = this.getProjects();
    projects = projects.filter((p) => p.id !== projectId);
    setItem(STORAGE_KEYS.PROJECTS, projects);

    if (this.getActiveProjectId() === projectId) {
      if (projects.length > 0) {
        this.setActiveProjectId(projects[0].id);
      }
    }
  }

  // Documents
  static getDocuments(projectId: string): ProjectDocument[] {
    const docs = getItem<Record<string, ProjectDocument[]>>(STORAGE_KEYS.DOCUMENTS, initialDocuments);
    return docs[projectId] || [];
  }

  static addDocument(
    projectId: string,
    fileData: { title: string; fileName: string; fileSize: string; fileType: string; summary?: string }
  ): ProjectDocument {
    const docsMap = getItem<Record<string, ProjectDocument[]>>(STORAGE_KEYS.DOCUMENTS, initialDocuments);
    const list = docsMap[projectId] || [];

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      projectId,
      title: fileData.title,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      fileType: fileData.fileType,
      uploadedAt: new Date().toISOString(),
      status: 'ready',
      chunksCount: Math.floor(Math.random() * 50) + 12,
      summary: fileData.summary || 'Uploaded engineering documentation ingested and indexed into vector graph memory.',
      extractedConcepts: ['Ingested Context', 'Domain Specifications'],
    };

    list.unshift(newDoc);
    docsMap[projectId] = list;
    setItem(STORAGE_KEYS.DOCUMENTS, docsMap);

    // Update project stats
    this.updateProject(projectId, { documentsCount: list.length });
    return newDoc;
  }

  static deleteDocument(projectId: string, docId: string): void {
    const docsMap = getItem<Record<string, ProjectDocument[]>>(STORAGE_KEYS.DOCUMENTS, initialDocuments);
    if (docsMap[projectId]) {
      docsMap[projectId] = docsMap[projectId].filter((d) => d.id !== docId);
      setItem(STORAGE_KEYS.DOCUMENTS, docsMap);
      this.updateProject(projectId, { documentsCount: docsMap[projectId].length });
    }
  }

  // Requirements
  static getRequirements(projectId: string): Requirement[] {
    const reqsMap = getItem<Record<string, Requirement[]>>(STORAGE_KEYS.REQUIREMENTS, initialRequirements);
    return reqsMap[projectId] || [];
  }

  static addRequirement(projectId: string, reqData: Partial<Requirement>): Requirement {
    const reqsMap = getItem<Record<string, Requirement[]>>(STORAGE_KEYS.REQUIREMENTS, initialRequirements);
    const list = reqsMap[projectId] || [];

    const newReq: Requirement = {
      id: `req-${Date.now()}`,
      projectId,
      title: reqData.title || 'New Software Requirement',
      description: reqData.description || '',
      type: reqData.type || 'Functional',
      priority: reqData.priority || 'Medium',
      status: reqData.status || 'Draft',
      source: reqData.source || 'Manual Input',
      linkedDocIds: reqData.linkedDocIds || [],
      linkedTaskIds: reqData.linkedTaskIds || [],
      linkedKnowledgeIds: reqData.linkedKnowledgeIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newReq);
    reqsMap[projectId] = list;
    setItem(STORAGE_KEYS.REQUIREMENTS, reqsMap);
    this.updateProject(projectId, { requirementsCount: list.length });
    return newReq;
  }

  static updateRequirement(projectId: string, reqId: string, updates: Partial<Requirement>): Requirement | undefined {
    const reqsMap = getItem<Record<string, Requirement[]>>(STORAGE_KEYS.REQUIREMENTS, initialRequirements);
    const list = reqsMap[projectId] || [];
    const index = list.findIndex((r) => r.id === reqId);
    if (index === -1) return undefined;

    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    reqsMap[projectId] = list;
    setItem(STORAGE_KEYS.REQUIREMENTS, reqsMap);
    return list[index];
  }

  static deleteRequirement(projectId: string, reqId: string): void {
    const reqsMap = getItem<Record<string, Requirement[]>>(STORAGE_KEYS.REQUIREMENTS, initialRequirements);
    if (reqsMap[projectId]) {
      reqsMap[projectId] = reqsMap[projectId].filter((r) => r.id !== reqId);
      setItem(STORAGE_KEYS.REQUIREMENTS, reqsMap);
      this.updateProject(projectId, { requirementsCount: reqsMap[projectId].length });
    }
  }

  // Conflicts
  static getConflicts(projectId: string): Conflict[] {
    const confMap = getItem<Record<string, Conflict[]>>(STORAGE_KEYS.CONFLICTS, initialConflicts);
    return confMap[projectId] || [];
  }

  static resolveConflict(projectId: string, conflictId: string, status: 'Resolved' | 'Ignored'): void {
    const confMap = getItem<Record<string, Conflict[]>>(STORAGE_KEYS.CONFLICTS, initialConflicts);
    const list = confMap[projectId] || [];
    const item = list.find((c) => c.id === conflictId);
    if (item) {
      item.status = status;
      confMap[projectId] = list;
      setItem(STORAGE_KEYS.CONFLICTS, confMap);
      const activeCount = list.filter((c) => c.status === 'Active' || c.status === 'Investigating').length;
      this.updateProject(projectId, { conflictsCount: activeCount });
    }
  }

  static addConflict(projectId: string, newConf: Partial<Conflict>): Conflict {
    const confMap = getItem<Record<string, Conflict[]>>(STORAGE_KEYS.CONFLICTS, initialConflicts);
    const list = confMap[projectId] || [];

    const conflict: Conflict = {
      id: `conf-${Date.now()}`,
      projectId,
      title: newConf.title || 'Requirement Conflict Detected',
      category: newConf.category || 'Contradiction',
      severity: newConf.severity || 'Medium',
      status: 'Active',
      description: newConf.description || '',
      conflictingArtifacts: newConf.conflictingArtifacts || [],
      aiExplanation: newConf.aiExplanation || 'Discrepancy detected across engineering artifacts.',
      suggestedAction: newConf.suggestedAction || 'Review conflicting specifications and update draft parameters.',
      detectedAt: new Date().toISOString(),
    };

    list.unshift(conflict);
    confMap[projectId] = list;
    setItem(STORAGE_KEYS.CONFLICTS, confMap);
    const activeCount = list.filter((c) => c.status === 'Active' || c.status === 'Investigating').length;
    this.updateProject(projectId, { conflictsCount: activeCount });
    return conflict;
  }

  // Tasks
  static getTasks(projectId: string): Task[] {
    const tasksMap = getItem<Record<string, Task[]>>(STORAGE_KEYS.TASKS, initialTasks);
    return tasksMap[projectId] || [];
  }

  static addTask(projectId: string, taskData: Partial<Task>): Task {
    const tasksMap = getItem<Record<string, Task[]>>(STORAGE_KEYS.TASKS, initialTasks);
    const list = tasksMap[projectId] || [];

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId,
      title: taskData.title || 'New Engineering Task',
      description: taskData.description || '',
      status: taskData.status || 'Backlog',
      priority: taskData.priority || 'Medium',
      linkedRequirementId: taskData.linkedRequirementId,
      linkedDocId: taskData.linkedDocId,
      tags: taskData.tags || ['dev'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newTask);
    tasksMap[projectId] = list;
    setItem(STORAGE_KEYS.TASKS, tasksMap);
    this.updateProject(projectId, { tasksCount: list.length });
    return newTask;
  }

  static updateTask(projectId: string, taskId: string, updates: Partial<Task>): Task | undefined {
    const tasksMap = getItem<Record<string, Task[]>>(STORAGE_KEYS.TASKS, initialTasks);
    const list = tasksMap[projectId] || [];
    const index = list.findIndex((t) => t.id === taskId);
    if (index === -1) return undefined;

    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    tasksMap[projectId] = list;
    setItem(STORAGE_KEYS.TASKS, tasksMap);
    return list[index];
  }

  static deleteTask(projectId: string, taskId: string): void {
    const tasksMap = getItem<Record<string, Task[]>>(STORAGE_KEYS.TASKS, initialTasks);
    if (tasksMap[projectId]) {
      tasksMap[projectId] = tasksMap[projectId].filter((t) => t.id !== taskId);
      setItem(STORAGE_KEYS.TASKS, tasksMap);
      this.updateProject(projectId, { tasksCount: tasksMap[projectId].length });
    }
  }

  // GitHub Info
  static getGitHubRepoInfo(projectId: string): GitHubRepoInfo {
    const ghMap = getItem<Record<string, GitHubRepoInfo>>(STORAGE_KEYS.GITHUB, initialGitHubRepoInfo);
    return (
      ghMap[projectId] || {
        isConnected: false,
        repoName: '',
        branch: 'main',
        lastSyncAt: new Date().toISOString(),
        openIssuesCount: 0,
        openPullRequestsCount: 0,
        recentCommits: [],
        recentPRs: [],
        recentIssues: [],
        implementationSignals: [],
      }
    );
  }

  static updateGitHubRepoInfo(projectId: string, updates: Partial<GitHubRepoInfo>): GitHubRepoInfo {
    const ghMap = getItem<Record<string, GitHubRepoInfo>>(STORAGE_KEYS.GITHUB, initialGitHubRepoInfo);
    const current = this.getGitHubRepoInfo(projectId);
    const updated = { ...current, ...updates, lastSyncAt: new Date().toISOString() };
    ghMap[projectId] = updated;
    setItem(STORAGE_KEYS.GITHUB, ghMap);
    return updated;
  }

  // Knowledge Entities & Relations
  static getKnowledgeEntities(projectId: string): KnowledgeEntity[] {
    const knMap = getItem<Record<string, KnowledgeEntity[]>>(STORAGE_KEYS.KNOWLEDGE, initialKnowledgeEntities);
    return knMap[projectId] || [];
  }

  static addKnowledgeEntity(projectId: string, entityData: Partial<KnowledgeEntity>): KnowledgeEntity {
    const knMap = getItem<Record<string, KnowledgeEntity[]>>(STORAGE_KEYS.KNOWLEDGE, initialKnowledgeEntities);
    const list = knMap[projectId] || [];

    const newEntity: KnowledgeEntity = {
      id: `kn-${Date.now()}`,
      projectId,
      name: entityData.name || 'New Knowledge Node',
      type: entityData.type || 'Technology',
      description: entityData.description || '',
      source: entityData.source || 'Inferred Knowledge',
      confidence: entityData.confidence || 0.9,
      relatedEntityIds: entityData.relatedEntityIds || [],
      linkedArtifacts: entityData.linkedArtifacts || [],
      createdAt: new Date().toISOString(),
    };

    list.unshift(newEntity);
    knMap[projectId] = list;
    setItem(STORAGE_KEYS.KNOWLEDGE, knMap);
    this.updateProject(projectId, { knowledgeEntitiesCount: list.length });
    return newEntity;
  }

  static deleteKnowledgeEntity(projectId: string, entityId: string): void {
    const knMap = getItem<Record<string, KnowledgeEntity[]>>(STORAGE_KEYS.KNOWLEDGE, initialKnowledgeEntities);
    if (knMap[projectId]) {
      knMap[projectId] = knMap[projectId].filter((k) => k.id !== entityId);
      setItem(STORAGE_KEYS.KNOWLEDGE, knMap);
      this.updateProject(projectId, { knowledgeEntitiesCount: knMap[projectId].length });
    }
  }

  static getKnowledgeRelations(projectId: string): KnowledgeRelation[] {
    const relMap = getItem<Record<string, KnowledgeRelation[]>>(STORAGE_KEYS.KNOWLEDGE_RELATIONS, initialKnowledgeRelations);
    return relMap[projectId] || [];
  }

  // Memories
  static getMemoryItems(projectId: string): MemoryItem[] {
    const memMap = getItem<Record<string, MemoryItem[]>>(STORAGE_KEYS.MEMORIES, initialMemoryItems);
    return memMap[projectId] || [];
  }

  static getMemories(projectId: string): MemoryItem[] {
    return this.getMemoryItems(projectId);
  }

  static addMemoryItem(projectId: string, memData: Partial<MemoryItem>): MemoryItem {
    const memMap = getItem<Record<string, MemoryItem[]>>(STORAGE_KEYS.MEMORIES, initialMemoryItems);
    const list = memMap[projectId] || [];

    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      projectId,
      type: memData.type || 'working',
      summary: memData.summary || 'Working Session Memory',
      content: memData.content || '',
      source: memData.source || 'AI Conversation',
      relevanceScore: memData.relevanceScore || 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newMem);
    memMap[projectId] = list;
    setItem(STORAGE_KEYS.MEMORIES, memMap);
    this.updateProject(projectId, { memoriesCount: list.length });
    return newMem;
  }

  static addMemory(projectId: string, memData: Partial<MemoryItem>): MemoryItem {
    return this.addMemoryItem(projectId, memData);
  }

  static deleteMemoryItem(projectId: string, memoryId: string): void {
    const memMap = getItem<Record<string, MemoryItem[]>>(STORAGE_KEYS.MEMORIES, initialMemoryItems);
    if (memMap[projectId]) {
      memMap[projectId] = memMap[projectId].filter((m) => m.id !== memoryId);
      setItem(STORAGE_KEYS.MEMORIES, memMap);
      this.updateProject(projectId, { memoriesCount: memMap[projectId].length });
    }
  }

  static deleteMemory(projectId: string, memoryId: string): void {
    this.deleteMemoryItem(projectId, memoryId);
  }

  static clearWorkingMemory(projectId: string): void {
    const memMap = getItem<Record<string, MemoryItem[]>>(STORAGE_KEYS.MEMORIES, initialMemoryItems);
    if (memMap[projectId]) {
      memMap[projectId] = memMap[projectId].filter((m) => m.type !== 'working');
      setItem(STORAGE_KEYS.MEMORIES, memMap);
      this.updateProject(projectId, { memoriesCount: memMap[projectId].length });
    }
  }

  // Conversations & Messages
  static getConversations(projectId: string): Conversation[] {
    const convMap = getItem<Record<string, Conversation[]>>(STORAGE_KEYS.CONVERSATIONS, initialConversations);
    return convMap[projectId] || [];
  }

  static createConversation(projectId: string, title?: string): Conversation {
    const convMap = getItem<Record<string, Conversation[]>>(STORAGE_KEYS.CONVERSATIONS, initialConversations);
    const list = convMap[projectId] || [];

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      projectId,
      title: title || 'New Architecture Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    list.unshift(newConv);
    convMap[projectId] = list;
    setItem(STORAGE_KEYS.CONVERSATIONS, convMap);
    return newConv;
  }

  static addMessageToConversation(projectId: string, conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const convMap = getItem<Record<string, Conversation[]>>(STORAGE_KEYS.CONVERSATIONS, initialConversations);
    const list = convMap[projectId] || [];
    let conv = list.find((c) => c.id === conversationId);

    if (!conv) {
      conv = this.createConversation(projectId, 'Engineering Inquiry');
      list.unshift(conv);
    }

    const newMsg: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };

    conv.messages.push(newMsg);
    conv.updatedAt = new Date().toISOString();

    // Auto update conversation title if first message
    if (conv.messages.length === 1 && newMsg.role === 'user') {
      conv.title = newMsg.content.slice(0, 42) + (newMsg.content.length > 42 ? '...' : '');
    }

    convMap[projectId] = list;
    setItem(STORAGE_KEYS.CONVERSATIONS, convMap);
    return newMsg;
  }

  static deleteConversation(projectId: string, conversationId: string): void {
    const convMap = getItem<Record<string, Conversation[]>>(STORAGE_KEYS.CONVERSATIONS, initialConversations);
    if (convMap[projectId]) {
      convMap[projectId] = convMap[projectId].filter((c) => c.id !== conversationId);
      setItem(STORAGE_KEYS.CONVERSATIONS, convMap);
    }
  }

  // Unified Search Across All Project Artifacts
  static performUnifiedSearch(projectId: string, query: string, mode: 'keyword' | 'semantic' | 'hybrid' | 'graph'): SearchResult[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search Documents
    const docs = this.getDocuments(projectId);
    docs.forEach((d) => {
      if (d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q) || d.extractedConcepts.some((c) => c.toLowerCase().includes(q))) {
        results.push({
          id: d.id,
          title: d.title,
          type: 'document',
          snippet: d.summary,
          relevanceScore: d.title.toLowerCase().includes(q) ? 0.98 : 0.82,
          section: 'documents',
          metadata: { fileName: d.fileName, chunks: d.chunksCount },
        });
      }
    });

    // Search Requirements
    const reqs = this.getRequirements(projectId);
    reqs.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.source.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          title: r.title,
          type: 'requirement',
          snippet: r.description,
          relevanceScore: r.title.toLowerCase().includes(q) ? 0.99 : 0.85,
          section: 'requirements',
          metadata: { priority: r.priority, status: r.status, reqType: r.type },
        });
      }
    });

    // Search Tasks
    const tasks = this.getTasks(projectId);
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))) {
        results.push({
          id: t.id,
          title: t.title,
          type: 'task',
          snippet: t.description,
          relevanceScore: t.title.toLowerCase().includes(q) ? 0.95 : 0.78,
          section: 'tasks',
          metadata: { status: t.status, priority: t.priority },
        });
      }
    });

    // Search Knowledge Entities
    const entities = this.getKnowledgeEntities(projectId);
    entities.forEach((k) => {
      if (k.name.toLowerCase().includes(q) || k.description.toLowerCase().includes(q)) {
        results.push({
          id: k.id,
          title: k.name,
          type: 'knowledge',
          snippet: k.description,
          relevanceScore: k.name.toLowerCase().includes(q) ? 0.96 : 0.80,
          section: 'knowledge',
          metadata: { entityType: k.type, confidence: k.confidence },
        });
      }
    });

    // Search Memory Items
    const memories = this.getMemoryItems(projectId);
    memories.forEach((m) => {
      if (m.summary.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)) {
        results.push({
          id: m.id,
          title: m.summary,
          type: 'memory',
          snippet: m.content,
          relevanceScore: m.summary.toLowerCase().includes(q) ? 0.91 : 0.75,
          section: 'memory',
          metadata: { memoryType: m.type, source: m.source },
        });
      }
    });

    // Search GitHub Info
    const gh = this.getGitHubRepoInfo(projectId);
    if (gh.isConnected) {
      gh.recentCommits.forEach((c) => {
        if (c.message.toLowerCase().includes(q) || c.hash.includes(q)) {
          results.push({
            id: `commit-${c.hash}`,
            title: `Commit ${c.hash}: ${c.message}`,
            type: 'github',
            snippet: `Authored by ${c.author} on ${new Date(c.date).toLocaleDateString()}`,
            relevanceScore: 0.88,
            section: 'github',
            metadata: { commitHash: c.hash },
          });
        }
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    return getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  }

  static markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  static addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newNotif);
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  }

  // Workflows
  static getWorkflowJobs(): WorkflowJob[] {
    return getItem<WorkflowJob[]>(STORAGE_KEYS.WORKFLOWS, initialWorkflowJobs);
  }
}
