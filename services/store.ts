import { create } from 'zustand';
import { StorageService } from './storage';
import {
  Project,
  NavigationSection,
  UserProfile,
  NotificationItem,
  WorkflowJob,
  ProjectDocument,
  Requirement,
  Conflict,
  Task,
  GitHubRepoInfo,
  KnowledgeEntity,
  MemoryItem,
  Conversation,
  Message,
  RetrievedContext,
  TaskStatus,
} from '@/types';

// AI Job state status
export type AiJobStateStatus = 'idle' | 'running' | 'processing' | 'generating' | 'completed' | 'failed';

export interface AiJobState {
  status: AiJobStateStatus;
  jobName: string;
  progress: number;
  message: string;
  updatedAt: string;
}

interface AppState {
  // Navigation & Page routing
  currentPage: 'landing' | 'login' | 'signup' | 'app';
  activeSection: NavigationSection;
  currentProjectId: string | undefined;
  selectedTaskId: string | null;
  selectedRequirementId: string | null;

  // Sidebar & drawer visibility state
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isContextInspectorOpen: boolean;
  isNotificationsOpen: boolean;
  isAuthModalOpen: boolean;
  isCreateProjectModalOpen: boolean;

  // Core global data collections
  projects: Project[];
  user: UserProfile;
  notifications: NotificationItem[];
  workflowJobs: WorkflowJob[];
  aiJobState: AiJobState;

  // Active project data collections
  documents: ProjectDocument[];
  requirements: Requirement[];
  conflicts: Conflict[];
  tasks: Task[];
  githubInfo: GitHubRepoInfo;
  knowledgeEntities: KnowledgeEntity[];
  memories: MemoryItem[];
  conversations: Conversation[];
  activeConversationId: string | undefined;

  // AI context inspector states
  inspectorContext: RetrievedContext | undefined;
  inspectorReasoning: string | undefined;
  inspectorTools: string[] | undefined;

  // Hydration safety flag
  isHydrated: boolean;

  // Operations / Actions
  hydrateStore: () => void;
  setCurrentPage: (page: 'landing' | 'login' | 'signup' | 'app') => void;
  setActiveSection: (sec: NavigationSection) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedRequirementId: (id: string | null) => void;
  setIsSidebarCollapsed: (val: boolean) => void;
  setIsMobileSidebarOpen: (val: boolean) => void;
  setIsContextInspectorOpen: (val: boolean) => void;
  setIsNotificationsOpen: (val: boolean) => void;
  setIsAuthModalOpen: (val: boolean) => void;
  setIsCreateProjectModalOpen: (val: boolean) => void;

  // Business Logic Methods
  selectProject: (projectId: string | undefined) => void;
  createProject: (data: {
    name: string;
    key: string;
    description: string;
    repositoryUrl?: string;
    branch?: string;
    initialUploadedDocs?: Array<{
      title: string;
      fileName: string;
      fileSize: string;
      fileType: string;
      summary?: string;
    }>;
  }) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Documents
  addDocument: (doc: { title: string; fileName: string; fileSize: string; fileType: string; summary?: string }) => void;
  deleteDocument: (id: string) => void;

  // Requirements
  addRequirement: (req: Partial<Requirement>) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;

  // Conflicts
  resolveConflict: (id: string, status: 'Resolved' | 'Ignored') => void;

  // Tasks
  addTask: (task: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Knowledge Graph
  addKnowledge: (entity: Partial<KnowledgeEntity>) => void;
  deleteKnowledge: (id: string) => void;

  // Memory
  addMemory: (memory: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;

  // Chat/Reasoning sessions
  newConversation: () => void;
  deleteConversation: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setActiveConversationId: (id: string | undefined) => void;

  // Inspector Context
  setInspectorData: (ctx: RetrievedContext | undefined, reasoning?: string, tools?: string[]) => void;

  // Notifications
  markNotificationRead: (id: string) => void;

  // Job state simulations
  simulateJobState: (status: AiJobStateStatus) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  currentPage: 'landing',
  activeSection: 'projects',
  currentProjectId: undefined,
  selectedTaskId: null,
  selectedRequirementId: null,

  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  isContextInspectorOpen: false,
  isNotificationsOpen: false,
  isAuthModalOpen: false,
  isCreateProjectModalOpen: false,

  projects: [],
  user: { id: '', name: '', email: '', avatarUrl: '', githubConnected: false, joinedAt: '' },
  notifications: [],
  workflowJobs: [],
  aiJobState: {
    status: 'idle',
    jobName: 'AI Engine Vector Indexer',
    progress: 100,
    message: 'System ready for streaming LLM execution',
    updatedAt: '',
  },

  documents: [],
  requirements: [],
  conflicts: [],
  tasks: [],
  githubInfo: {
    isConnected: false,
    repoName: '',
    branch: 'main',
    lastSyncAt: '',
    openIssuesCount: 0,
    openPullRequestsCount: 0,
    recentCommits: [],
    recentPRs: [],
    recentIssues: [],
    implementationSignals: [],
  },
  knowledgeEntities: [],
  memories: [],
  conversations: [],
  activeConversationId: undefined,

  inspectorContext: undefined,
  inspectorReasoning: undefined,
  inspectorTools: undefined,

  isHydrated: false,

  hydrateStore: () => {
    // This executes safely on client side mounting
    const projects = StorageService.getProjects();
    const user = StorageService.getUserProfile();
    const notifications = StorageService.getNotifications();
    const workflowJobs = StorageService.getWorkflowJobs();

    const activeProjectId = StorageService.getActiveProjectId();
    // Default workspace loading check
    const currentProjectId = projects.some((p) => p.id === activeProjectId)
      ? activeProjectId
      : projects[0]?.id;

    const timeString = new Date().toLocaleTimeString();

    set({
      projects,
      user,
      notifications,
      workflowJobs,
      currentProjectId,
      aiJobState: {
        status: 'idle',
        jobName: 'AI Engine Vector Indexer',
        progress: 100,
        message: 'System ready for streaming LLM execution',
        updatedAt: timeString,
      },
      isHydrated: true,
    });

    if (currentProjectId) {
      get().selectProject(currentProjectId);
    }
  },

  setCurrentPage: (currentPage) => set({ currentPage }),
  setActiveSection: (activeSection) => {
    if (activeSection === 'projects') {
      StorageService.setActiveProjectId('');
      set({ currentProjectId: undefined, selectedRequirementId: null, selectedTaskId: null });
    }
    set({ activeSection, isMobileSidebarOpen: false });
  },
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  setSelectedRequirementId: (selectedRequirementId) => set({ selectedRequirementId }),
  setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setIsMobileSidebarOpen: (isMobileSidebarOpen) => set({ isMobileSidebarOpen }),
  setIsContextInspectorOpen: (isContextInspectorOpen) => set({ isContextInspectorOpen }),
  setIsNotificationsOpen: (isNotificationsOpen) => set({ isNotificationsOpen }),
  setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  setIsCreateProjectModalOpen: (isCreateProjectModalOpen) => set({ isCreateProjectModalOpen }),

  selectProject: (projectId) => {
    if (!projectId) {
      set({
        currentProjectId: undefined,
        activeSection: 'projects',
        selectedRequirementId: null,
        selectedTaskId: null,
        documents: [],
        requirements: [],
        conflicts: [],
        tasks: [],
        knowledgeEntities: [],
        memories: [],
        conversations: [],
        activeConversationId: undefined,
      });
      return;
    }

    StorageService.setActiveProjectId(projectId);
    const docs = StorageService.getDocuments(projectId);
    const reqs = StorageService.getRequirements(projectId);
    const confs = StorageService.getConflicts(projectId);
    const tasks = StorageService.getTasks(projectId);
    const ghInfo = StorageService.getGitHubRepoInfo(projectId);
    const knEntities = StorageService.getKnowledgeEntities(projectId);
    const memories = StorageService.getMemories(projectId);
    const conversations = StorageService.getConversations(projectId);

    set({
      currentProjectId: projectId,
      activeSection: 'overview',
      selectedRequirementId: null,
      selectedTaskId: null,
      documents: docs,
      requirements: reqs,
      conflicts: confs,
      tasks: tasks,
      githubInfo: ghInfo,
      knowledgeEntities: knEntities,
      memories: memories,
      conversations: conversations,
      activeConversationId: conversations[0]?.id,
    });
  },

  createProject: (data) => {
    const newProj = StorageService.createProject(data);
    if (data.initialUploadedDocs && data.initialUploadedDocs.length > 0) {
      data.initialUploadedDocs.forEach((doc) => {
        StorageService.addDocument(newProj.id, doc);
      });
    }

    // Refresh and sync
    const updatedProjects = StorageService.getProjects();
    set({ projects: updatedProjects });
    get().selectProject(newProj.id);
    set({ activeSection: 'overview' });
  },

  updateProject: (projectId, updates) => {
    StorageService.updateProject(projectId, updates);
    const updatedProjects = StorageService.getProjects();
    set({ projects: updatedProjects });

    if (get().currentProjectId === projectId) {
      // Reload current project active metadata
      set({
        githubInfo: StorageService.getGitHubRepoInfo(projectId),
      });
    }
  },

  deleteProject: (projectId) => {
    StorageService.deleteProject(projectId);
    const updatedProjects = StorageService.getProjects();
    set({ projects: updatedProjects });

    if (updatedProjects.length > 0) {
      get().selectProject(updatedProjects[0].id);
      set({ activeSection: 'overview' });
    } else {
      get().selectProject(undefined);
      set({ activeSection: 'projects' });
    }
  },

  // Document Operations
  addDocument: (doc) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.addDocument(pid, doc);
    set({
      documents: StorageService.getDocuments(pid),
      projects: StorageService.getProjects(),
    });
  },

  deleteDocument: (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.deleteDocument(pid, id);
    set({
      documents: StorageService.getDocuments(pid),
      projects: StorageService.getProjects(),
    });
  },

  // Requirements Operations
  addRequirement: (req) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.addRequirement(pid, req);
    set({
      requirements: StorageService.getRequirements(pid),
      projects: StorageService.getProjects(),
    });
  },

  updateRequirement: (id, updates) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.updateRequirement(pid, id, updates);
    set({
      requirements: StorageService.getRequirements(pid),
    });
  },

  deleteRequirement: (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.deleteRequirement(pid, id);
    set({
      requirements: StorageService.getRequirements(pid),
      projects: StorageService.getProjects(),
    });
  },

  // Conflict Operations
  resolveConflict: (id, status) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.resolveConflict(pid, id, status);
    set({
      conflicts: StorageService.getConflicts(pid),
      projects: StorageService.getProjects(),
    });
  },

  // Task Operations
  addTask: (task) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.addTask(pid, task);
    set({
      tasks: StorageService.getTasks(pid),
      projects: StorageService.getProjects(),
    });
  },

  updateTaskStatus: (id, status) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.updateTask(pid, id, { status });
    set({
      tasks: StorageService.getTasks(pid),
    });
  },

  updateTask: (id, updates) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.updateTask(pid, id, updates);
    set({
      tasks: StorageService.getTasks(pid),
    });
  },

  deleteTask: (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.deleteTask(pid, id);
    set({
      tasks: StorageService.getTasks(pid),
      projects: StorageService.getProjects(),
    });
  },

  // Knowledge Graph
  addKnowledge: (entity) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.addKnowledgeEntity(pid, entity);
    set({
      knowledgeEntities: StorageService.getKnowledgeEntities(pid),
      projects: StorageService.getProjects(),
    });
  },

  deleteKnowledge: (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.deleteKnowledgeEntity(pid, id);
    set({
      knowledgeEntities: StorageService.getKnowledgeEntities(pid),
      projects: StorageService.getProjects(),
    });
  },

  // Memory
  addMemory: (memory) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.addMemoryItem(pid, memory);
    set({
      memories: StorageService.getMemories(pid),
      projects: StorageService.getProjects(),
    });
  },

  deleteMemory: (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.deleteMemoryItem(pid, id);
    set({
      memories: StorageService.getMemories(pid),
      projects: StorageService.getProjects(),
    });
  },

  // Conversation Operations
  newConversation: () => {
    const pid = get().currentProjectId;
    if (!pid) return;
    const newConv = StorageService.createConversation(pid, 'New AI reasoning session');
    const updated = StorageService.getConversations(pid);
    set({
      conversations: updated,
      activeConversationId: newConv.id,
    });
  },

  deleteConversation: (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;
    StorageService.deleteConversation(pid, id);
    const updated = StorageService.getConversations(pid);
    set({
      conversations: updated,
      activeConversationId: get().activeConversationId === id ? updated[0]?.id : get().activeConversationId,
    });
  },

  addMessage: (message) => {
    const pid = get().currentProjectId;
    const convId = get().activeConversationId;
    if (!pid || !convId) return;

    StorageService.addMessageToConversation(pid, convId, message);
    set({
      conversations: StorageService.getConversations(pid),
    });
  },

  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),

  // Inspector Metadata
  setInspectorData: (inspectorContext, inspectorReasoning, inspectorTools) =>
    set({ inspectorContext, inspectorReasoning, inspectorTools }),

  // Notifications
  markNotificationRead: (id) => {
    StorageService.markNotificationRead(id);
    set({
      notifications: StorageService.getNotifications(),
    });
  },

  // Simulator for AI Jobs
  simulateJobState: (status) => {
    let message = 'Pipeline state updated';
    let progress = 100;
    let jobName = 'AI Streaming Workflow';

    if (status === 'running' || status === 'generating') {
      message = 'Streaming LLM response and extracting vector embeddings...';
      progress = 45;
      jobName = 'Generating Response';
    } else if (status === 'processing') {
      message = 'Analyzing project requirements and detecting conflict drift...';
      progress = 70;
      jobName = 'Processing Project';
    } else if (status === 'completed') {
      message = 'Job completed successfully. Vector graph updated.';
      progress = 100;
      jobName = 'Indexing Complete';
    } else if (status === 'failed') {
      message = 'Job failed: Connection timeout during vector embedding.';
      progress = 30;
      jobName = 'Analysis Error';
    } else if (status === 'idle') {
      message = 'System ready for streaming pipeline execution';
      progress = 100;
      jobName = 'AI Engine Idle';
    }

    set({
      aiJobState: {
        status,
        jobName,
        progress,
        message,
        updatedAt: new Date().toLocaleTimeString(),
      },
    });
  },
}));
