import { create } from 'zustand';
import { StorageService } from './storage';
import { apiFetch, clearTokens, setTokens, getAccessToken, getRefreshToken, getOrRefreshToken } from './api';
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
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  TaskPriority,
  ConflictSeverity,
  ConflictStatus,
  ConflictCategory,
} from '@/types';

declare global {
  interface Window {
    __queuePollInterval?: ReturnType<typeof setInterval>;
  }
}

interface RawDocument {
  id: string;
  projectId: string;
  name: string;
  filePath: string;
  fileType: string;
  sizeBytes: number;
  status: string;
  chunksCount?: number;
  extractedConcepts?: string[];
  summary?: string;
}

interface RawRequirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  source: string;
  linkedDocIds?: string[];
  linkedTaskIds?: string[];
  linkedKnowledgeIds?: string[];
  createdAt: string;
  updatedAt: string;
}

interface RawTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  requirementId?: string;
  linkedDocId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface RawConflict {
  id: string;
  projectId: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  conflictingArtifacts?: Array<{ type: string; title: string; id: string }>;
  aiExplanation?: string;
  suggestedAction?: string;
  detectedAt: string;
}

interface QueueJob {
  job_id: string;
  function: string;
  status: string;
}

interface QueueStatusResponse {
  queued: QueueJob[];
  completed: Array<{
    job_id: string;
    function: string;
    success: boolean;
    result: string;
    finish_time: string;
  }>;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId?: string;
  userName?: string;
  fullName?: string;
  githubToken?: string;
  createdAt?: string;
}

interface UserProfileResponse {
  username: string;
  email: string;
  fullName: string;
  id?: string;
  githubToken?: string;
  createdAt?: string;
}

// AI Job state status
export type AiJobStateStatus = 'idle' | 'running' | 'processing' | 'generating' | 'completed' | 'failed';

function mapReqTypeF2B(type: string): string {
  if (type === 'Functional') return 'FUNCTIONAL';
  return 'NON_FUNCTIONAL';
}

function mapReqTypeB2F(type: string): RequirementType {
  if (type === 'FUNCTIONAL') return 'Functional';
  return 'Non-Functional';
}

function mapPriorityF2B(p: string): string {
  if (p === 'Critical' || p === 'High') return 'P0';
  if (p === 'Medium') return 'P1';
  return 'P2';
}

function mapPriorityB2F(p: string): RequirementPriority & TaskPriority {
  if (p === 'P0') return 'High';
  if (p === 'P1') return 'Medium';
  return 'Low';
}

function mapReqStatusF2B(s: string): string {
  if (s === 'Draft') return 'DRAFT';
  if (s === 'In Review') return 'SUGGESTION';
  if (s === 'Approved') return 'APPROVED';
  return 'REJECTED';
}

function mapReqStatusB2F(s: string): RequirementStatus {
  if (s === 'DRAFT') return 'Draft';
  if (s === 'SUGGESTION') return 'In Review';
  if (s === 'APPROVED') return 'Approved';
  return 'Deprecated';
}

function mapTaskStatusF2B(s: string): string {
  if (s === 'In Progress') return 'IN_PROGRESS';
  if (s === 'Done') return 'DONE';
  return 'TODO';
}

function mapTaskStatusB2F(s: string): TaskStatus {
  if (s === 'IN_PROGRESS') return 'In Progress';
  if (s === 'DONE') return 'Done';
  return 'Todo';
}

function mapConflictSeverityB2F(s: string): ConflictSeverity {
  if (s === 'HIGH') return 'High';
  if (s === 'MEDIUM') return 'Medium';
  return 'Low';
}

function mapConflictStatusB2F(s: string): ConflictStatus {
  if (s === 'RESOLVED') return 'Resolved';
  return 'Active';
}

function mapDocStatusB2F(status: string): 'ready' | 'processing' | 'failed' {
  if (status === 'COMPLETED') return 'ready';
  if (status === 'FAILED') return 'failed';
  return 'processing';
}

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
  lastVisitedProjectId: string | undefined;

  // Operations / Actions
  hydrateStore: (initialRouteInfo?: { projectId?: string; section?: NavigationSection }) => void;
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
  selectProject: (projectId: string | undefined, section?: NavigationSection) => void;
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
      file?: File;
      content?: string;
    }>;
  }) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Documents
  addDocument: (doc: { title: string; fileName: string; fileSize: string; fileType: string; summary?: string; file?: File; content?: string }) => void;
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

  // Auth Operations
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  register: (email: string, password: string, userName: string, fullName: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => Promise<void>;
  updateUser: (profile: Partial<UserProfile>) => void;
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
  lastVisitedProjectId: undefined,

  projects: [],
  user: { id: '', name: '', email: '', avatarUrl: '', githubConnected: false, joinedAt: '' } as UserProfile,
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

  hydrateStore: async (initialRouteInfo) => {
    // Register event listener for unauthorized requests
    if (typeof window !== 'undefined') {
      window.removeEventListener('hayyuu-unauthorized', get().logout);
      window.addEventListener('hayyuu-unauthorized', get().logout);
    }

    const access = getAccessToken();
    const refresh = getRefreshToken();
    let user: UserProfile = { id: '', name: '', email: '', avatarUrl: '', githubConnected: false, joinedAt: '' };
    let projects: Project[] = [];
    let currentPage: 'landing' | 'login' | 'signup' | 'app' = 'landing';

    if (access || refresh) {
      // Validate access token and refresh using refresh token before making protected requests
      let validToken = access;
      if (access) {
        try {
          const payload = JSON.parse(atob(access.split('.')[1]));
          const exp = payload.exp * 1000;
          if (Date.now() >= exp - 30000) {
            validToken = null;
          }
        } catch {
          validToken = null;
        }
      }

      if (!validToken && refresh) {
        // Attempt to refresh the token using the refresh token
        validToken = await getOrRefreshToken();
      }

      if (validToken) {
        // Try to load user profile
        const resMe = await apiFetch<UserProfileResponse>('/api/v1/auth/me');
        if (resMe.success && resMe.response) {
          user = {
            id: resMe.response.id || 'usr-default',
            name: resMe.response.fullName,
            email: resMe.response.email,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${resMe.response.email}`,
            githubConnected: !!resMe.response.githubToken,
            githubUsername: resMe.response.username,
            joinedAt: resMe.response.createdAt || new Date().toISOString(),
          };

          // Load user projects
          const resProj = await apiFetch<Project[]>('/api/v1/projects');
          if (resProj.success && resProj.response) {
            projects = resProj.response;
          }
          currentPage = 'app';
        } else {
          clearTokens();
        }
      } else {
        clearTokens();
      }
    }

    const notifications = StorageService.getNotifications();
    const workflowJobs = StorageService.getWorkflowJobs();
    const lastVisitedProjectId = typeof window !== 'undefined' ? (localStorage.getItem('hayyuu_last_visited_project_id') || undefined) : undefined;
    
    // Determine the active project ID on reload.
    // If the initial route specifies a project, use it. Otherwise fall back to local storage.
    const activeProjectId = (currentPage === 'app' && initialRouteInfo?.projectId) || StorageService.getActiveProjectId();
    const currentProjectId = projects.some((p) => p.id === activeProjectId)
      ? activeProjectId
      : projects[0]?.id;

    // Determine the target section
    let targetSection: NavigationSection = 'projects';
    if (currentPage === 'app') {
      if (currentProjectId) {
        targetSection = initialRouteInfo?.section || 'overview';
      } else {
        targetSection = 'projects';
      }
    }

    const timeString = new Date().toLocaleTimeString();

    set({
      projects,
      user,
      notifications,
      workflowJobs,
      currentProjectId,
      currentPage,
      activeSection: targetSection,
      lastVisitedProjectId,
      aiJobState: {
        status: 'idle',
        jobName: 'AI Engine Vector Indexer',
        progress: 100,
        message: '',
        updatedAt: timeString,
      },
      isHydrated: true,
    });

    if (currentProjectId) {
      get().selectProject(currentProjectId, targetSection);
    }

    // Set up queue status background polling loop
    if (typeof window !== 'undefined') {
      if (window.__queuePollInterval) {
        clearInterval(window.__queuePollInterval);
      }

      const pollQueue = async () => {
        // Only poll if user is authenticated and on app dashboard
        if (!getAccessToken() || get().currentPage !== 'app') return;

        const res = await apiFetch<QueueStatusResponse>('/api/v1/queue/status');
        if (res.success && res.response) {
          const queued = res.response.queued || [];
          const activeJob = queued.find((j: QueueJob) => j.status === 'in_progress' || j.status === 'queued' || j.status === 'deferred');

          if (activeJob) {
            set({
              aiJobState: {
                status: activeJob.status === 'in_progress' ? 'processing' : 'running',
                jobName: `AI Job: ${activeJob.function}`,
                progress: activeJob.status === 'in_progress' ? 70 : 10,
                message: `Task ${activeJob.job_id} is currently ${activeJob.status}`,
                updatedAt: new Date().toLocaleTimeString(),
              }
            });
          } else {
            const completed = res.response.completed || [];
            const lastCompleted = completed[completed.length - 1];
            // Show completion/failure badge briefly (10 seconds)
            if (lastCompleted && (new Date().getTime() - new Date(lastCompleted.finish_time).getTime() < 10000)) {
              set({
                aiJobState: {
                  status: lastCompleted.success ? 'completed' : 'failed',
                  jobName: `AI Job: ${lastCompleted.function}`,
                  progress: 100,
                  message: lastCompleted.success ? 'Job completed successfully!' : `Job failed: ${lastCompleted.result}`,
                  updatedAt: new Date().toLocaleTimeString(),
                }
              });
            } else {
              set({
                aiJobState: {
                  status: 'idle',
                  jobName: 'AI Engine Vector Indexer',
                  progress: 100,
                  message: '',
                  updatedAt: new Date().toLocaleTimeString(),
                }
              });
            }
          }
        }
      };

      // Execute immediately and then poll every 4 seconds
      pollQueue();
      window.__queuePollInterval = setInterval(pollQueue, 4000);
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

  selectProject: async (projectId, section) => {
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

    const [resDocs, resReqs, resTasks, resConfs] = await Promise.all([
      apiFetch<RawDocument[]>(`/api/v1/projects/${projectId}/documents`),
      apiFetch<RawRequirement[]>(`/api/v1/projects/${projectId}/requirements`),
      apiFetch<RawTask[]>(`/api/v1/projects/${projectId}/tasks`),
      apiFetch<RawConflict[]>(`/api/v1/projects/${projectId}/conflicts`),
    ]);

    const docs = resDocs.success
      ? (resDocs.response || []).map((d: RawDocument) => ({
          ...d,
          status: mapDocStatusB2F(d.status),
          chunksCount: d.chunksCount || 0,
          extractedConcepts: d.extractedConcepts || [],
          fileSize: d.sizeBytes ? `${(d.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : '0.00 MB',
          title: d.name || 'Untitled Document',
          fileName: d.name || '',
          uploadedAt: new Date().toISOString(),
          summary: d.summary || '',
        }))
      : [];
    const reqs = resReqs.success
      ? (resReqs.response || []).map((r: RawRequirement) => ({
          ...r,
          type: mapReqTypeB2F(r.type),
          priority: mapPriorityB2F(r.priority),
          status: mapReqStatusB2F(r.status),
          linkedDocIds: r.linkedDocIds || [],
          linkedTaskIds: r.linkedTaskIds || [],
          linkedKnowledgeIds: r.linkedKnowledgeIds || [],
        }))
      : [];
    const tasks = resTasks.success
      ? (resTasks.response || []).map((t: RawTask) => ({
          ...t,
          linkedRequirementId: t.requirementId,
          status: mapTaskStatusB2F(t.status),
          priority: mapPriorityB2F(t.priority),
          tags: t.tags || [],
        }))
      : [];
    const conflicts = resConfs.success
      ? (resConfs.response || []).map((c: RawConflict) => ({
          ...c,
          category: c.category as ConflictCategory,
          severity: mapConflictSeverityB2F(c.severity),
          status: mapConflictStatusB2F(c.status),
          conflictingArtifacts: (c.conflictingArtifacts || []).map((art) => ({
            id: art.id,
            title: art.title,
            type: art.type as 'Document' | 'Requirement' | 'GitHub Code' | 'Task' | 'Knowledge',
          })),
          aiExplanation: c.aiExplanation || '',
          suggestedAction: c.suggestedAction || '',
        }))
      : [];

    const ghInfo = StorageService.getGitHubRepoInfo(projectId);
    const knEntities = StorageService.getKnowledgeEntities(projectId);
    const memories = StorageService.getMemories(projectId);
    const conversations = StorageService.getConversations(projectId);

    set({
      currentProjectId: projectId,
      activeSection: section || 'overview',
      selectedRequirementId: null,
      selectedTaskId: null,
      documents: docs,
      requirements: reqs,
      conflicts: conflicts,
      tasks: tasks,
      githubInfo: ghInfo,
      knowledgeEntities: knEntities,
      memories: memories,
      conversations: conversations,
      activeConversationId: conversations[0]?.id,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('hayyuu_last_visited_project_id', projectId);
    }
    set({ lastVisitedProjectId: projectId });
  },

  createProject: async (data) => {
    const res = await apiFetch<Project>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
      }),
    });

    if (res.success && res.response) {
      const newProj = res.response;

      if (data.initialUploadedDocs && data.initialUploadedDocs.length > 0) {
        for (const doc of data.initialUploadedDocs) {
          const formData = new FormData();
          let fileObj: File;

          if (doc.file) {
            fileObj = doc.file;
          } else {
            const blob = new Blob([doc.content || ''], { type: 'text/markdown' });
            fileObj = new File([blob], doc.fileName, { type: 'text/markdown' });
          }

          formData.append('file', fileObj);
          await apiFetch(`/api/v1/projects/${newProj.id}/documents`, {
            method: 'POST',
            body: formData,
          });
        }
      }

      const resProj = await apiFetch<Project[]>('/api/v1/projects');
      if (resProj.success && resProj.response) {
        set({ projects: resProj.response });
      }

      await get().selectProject(newProj.id);
      set({ activeSection: 'overview' });
    }
  },

  updateProject: async (projectId, updates) => {
    const res = await apiFetch<Project>(`/api/v1/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (res.success) {
      const resProj = await apiFetch<Project[]>('/api/v1/projects');
      if (resProj.success && resProj.response) {
        set({ projects: resProj.response });
      }
    }
  },

  deleteProject: async (projectId) => {
    const res = await apiFetch<void>(`/api/v1/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (res.success) {
      const resProj = await apiFetch<Project[]>('/api/v1/projects');
      const updatedProjects = resProj.success ? (resProj.response || []) : [];
      set({ projects: updatedProjects });

      if (updatedProjects.length > 0) {
        await get().selectProject(updatedProjects[0].id);
        set({ activeSection: 'overview' });
      } else {
        await get().selectProject(undefined);
        set({ activeSection: 'projects' });
      }
    }
  },

  // Document Operations
  addDocument: async (doc) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    // Create a temporary staging document card for instant visual feedback
    const tempId = `temp-upload-${Date.now()}`;
    const tempDoc: ProjectDocument = {
      id: tempId,
      projectId: pid,
      title: doc.title,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      chunksCount: 0,
      summary: 'Uploading file and initiating AI analysis pipeline...',
      extractedConcepts: [],
    };

    set((state) => ({
      documents: [tempDoc, ...state.documents],
    }));

    const formData = new FormData();
    let fileObj: File;

    if (doc.file) {
      fileObj = doc.file;
    } else {
      const blob = new Blob([doc.content || ''], { type: 'text/markdown' });
      fileObj = new File([blob], doc.fileName, { type: 'text/markdown' });
    }

    formData.append('file', fileObj);

    await apiFetch<RawDocument>(`/api/v1/projects/${pid}/documents`, {
      method: 'POST',
      body: formData,
    });

    const resDocs = await apiFetch<RawDocument[]>(`/api/v1/projects/${pid}/documents`);
    if (resDocs.success) {
      set({
        documents: (resDocs.response || []).map((d: RawDocument) => ({
          ...d,
          status: mapDocStatusB2F(d.status),
          chunksCount: d.chunksCount || 0,
          extractedConcepts: d.extractedConcepts || [],
          fileSize: d.sizeBytes ? `${(d.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : '0.00 MB',
          title: d.name || 'Untitled Document',
          fileName: d.name || '',
          uploadedAt: new Date().toISOString(),
          summary: d.summary || '',
        })),
      });
    } else {
      // Remove temp doc if upload failed
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== tempId),
      }));
    }
  },

  deleteDocument: async (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const res = await apiFetch<void>(`/api/v1/projects/${pid}/documents/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      const resDocs = await apiFetch<RawDocument[]>(`/api/v1/projects/${pid}/documents`);
      if (resDocs.success) {
        set({
          documents: (resDocs.response || []).map((d: RawDocument) => ({
            ...d,
            status: mapDocStatusB2F(d.status),
            chunksCount: d.chunksCount || 0,
            extractedConcepts: d.extractedConcepts || [],
            fileSize: d.sizeBytes ? `${(d.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : '0.00 MB',
            title: d.name || 'Untitled Document',
            fileName: d.name || '',
            uploadedAt: new Date().toISOString(),
            summary: d.summary || '',
          })),
        });
      }
    }
  },

  // Requirements Operations
  addRequirement: async (req) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const res = await apiFetch<Requirement>(`/api/v1/projects/${pid}/requirements`, {
      method: 'POST',
      body: JSON.stringify({
        title: req.title,
        description: req.description,
        type: mapReqTypeF2B(req.type || 'Functional'),
        priority: mapPriorityF2B(req.priority || 'Low'),
      }),
    });

    if (res.success) {
      const resReqs = await apiFetch<RawRequirement[]>(`/api/v1/projects/${pid}/requirements`);
      if (resReqs.success) {
        set({
          requirements: (resReqs.response || []).map((r: RawRequirement) => ({
            ...r,
            type: mapReqTypeB2F(r.type),
            priority: mapPriorityB2F(r.priority),
            status: mapReqStatusB2F(r.status),
            linkedDocIds: r.linkedDocIds || [],
            linkedTaskIds: r.linkedTaskIds || [],
            linkedKnowledgeIds: r.linkedKnowledgeIds || [],
          })),
        });
      }
    }
  },

  updateRequirement: async (id, updates) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const backendUpdates: Record<string, unknown> = { ...updates };
    if (updates.type) backendUpdates.type = mapReqTypeF2B(updates.type);
    if (updates.priority) backendUpdates.priority = mapPriorityF2B(updates.priority);
    if (updates.status) backendUpdates.status = mapReqStatusF2B(updates.status);

    const res = await apiFetch<Requirement>(`/api/v1/projects/${pid}/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates),
    });

    if (res.success) {
      const resReqs = await apiFetch<RawRequirement[]>(`/api/v1/projects/${pid}/requirements`);
      if (resReqs.success) {
        set({
          requirements: (resReqs.response || []).map((r: RawRequirement) => ({
            ...r,
            type: mapReqTypeB2F(r.type),
            priority: mapPriorityB2F(r.priority),
            status: mapReqStatusB2F(r.status),
            linkedDocIds: r.linkedDocIds || [],
            linkedTaskIds: r.linkedTaskIds || [],
            linkedKnowledgeIds: r.linkedKnowledgeIds || [],
          })),
        });
      }
    }
  },

  deleteRequirement: async (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const res = await apiFetch<void>(`/api/v1/projects/${pid}/requirements/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      const resReqs = await apiFetch<RawRequirement[]>(`/api/v1/projects/${pid}/requirements`);
      if (resReqs.success) {
        set({
          requirements: (resReqs.response || []).map((r: RawRequirement) => ({
            ...r,
            type: mapReqTypeB2F(r.type),
            priority: mapPriorityB2F(r.priority),
            status: mapReqStatusB2F(r.status),
            linkedDocIds: r.linkedDocIds || [],
            linkedTaskIds: r.linkedTaskIds || [],
            linkedKnowledgeIds: r.linkedKnowledgeIds || [],
          })),
        });
      }
    }
  },

  // Conflict Operations
  resolveConflict: async (id, status) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const apiStatus = status === 'Resolved' ? 'RESOLVED' : 'ACTIVE';
    const res = await apiFetch<Conflict>(`/api/v1/projects/${pid}/conflicts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: apiStatus }),
    });

    if (res.success) {
      const resConfs = await apiFetch<RawConflict[]>(`/api/v1/projects/${pid}/conflicts`);
      if (resConfs.success) {
        set({
          conflicts: (resConfs.response || []).map((c: RawConflict) => ({
            ...c,
            category: c.category as ConflictCategory,
            severity: mapConflictSeverityB2F(c.severity),
            status: mapConflictStatusB2F(c.status),
            conflictingArtifacts: (c.conflictingArtifacts || []).map((art) => ({
              id: art.id,
              title: art.title,
              type: art.type as 'Document' | 'Requirement' | 'GitHub Code' | 'Task' | 'Knowledge',
            })),
            aiExplanation: c.aiExplanation || '',
            suggestedAction: c.suggestedAction || '',
          })),
        });
      }
    }
  },

  // Task Operations
  addTask: async (task) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const res = await apiFetch<Task>(`/api/v1/projects/${pid}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        description: task.description || '',
        requirementId: task.linkedRequirementId || null,
        priority: mapPriorityF2B(task.priority || 'Low'),
        status: mapTaskStatusF2B(task.status || 'Todo'),
      }),
    });

    if (res.success) {
      const resTasks = await apiFetch<RawTask[]>(`/api/v1/projects/${pid}/tasks`);
      if (resTasks.success) {
        set({
          tasks: (resTasks.response || []).map((t: RawTask) => ({
            ...t,
            linkedRequirementId: t.requirementId,
            status: mapTaskStatusB2F(t.status),
            priority: mapPriorityB2F(t.priority),
            tags: t.tags || [],
          })),
        });
      }
    }
  },

  updateTaskStatus: async (id, status) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const res = await apiFetch<Task>(`/api/v1/projects/${pid}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: mapTaskStatusF2B(status) }),
    });

    if (res.success) {
      const resTasks = await apiFetch<RawTask[]>(`/api/v1/projects/${pid}/tasks`);
      if (resTasks.success) {
        set({
          tasks: (resTasks.response || []).map((t: RawTask) => ({
            ...t,
            linkedRequirementId: t.requirementId,
            status: mapTaskStatusB2F(t.status),
            priority: mapPriorityB2F(t.priority),
            tags: t.tags || [],
          })),
        });
      }
    }
  },

  updateTask: async (id, updates) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const backendUpdates: Record<string, unknown> = { ...updates };
    if (updates.linkedRequirementId !== undefined) {
      backendUpdates.requirementId = updates.linkedRequirementId;
      delete backendUpdates.linkedRequirementId;
    }
    if (updates.priority) backendUpdates.priority = mapPriorityF2B(updates.priority);
    if (updates.status) backendUpdates.status = mapTaskStatusF2B(updates.status);

    const res = await apiFetch<Task>(`/api/v1/projects/${pid}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates),
    });

    if (res.success) {
      const resTasks = await apiFetch<RawTask[]>(`/api/v1/projects/${pid}/tasks`);
      if (resTasks.success) {
        set({
          tasks: (resTasks.response || []).map((t: RawTask) => ({
            ...t,
            linkedRequirementId: t.requirementId,
            status: mapTaskStatusB2F(t.status),
            priority: mapPriorityB2F(t.priority),
            tags: t.tags || [],
          })),
        });
      }
    }
  },

  deleteTask: async (id) => {
    const pid = get().currentProjectId;
    if (!pid) return;

    const res = await apiFetch<void>(`/api/v1/projects/${pid}/tasks/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      const resTasks = await apiFetch<RawTask[]>(`/api/v1/projects/${pid}/tasks`);
      if (resTasks.success) {
        set({
          tasks: (resTasks.response || []).map((t: RawTask) => ({
            ...t,
            linkedRequirementId: t.requirementId,
            status: mapTaskStatusB2F(t.status),
            priority: mapPriorityB2F(t.priority),
            tags: t.tags || [],
          })),
        });
      }
    }
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

  login: async (email, password) => {
    const res = await apiFetch<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (res.success && res.response) {
      const { accessToken, refreshToken, userName, fullName } = res.response;
      setTokens(accessToken, refreshToken);

      const userProfile: UserProfile = {
        id: res.response.userId || `user-${Date.now()}`,
        name: fullName || '',
        email: email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        githubConnected: !!res.response.githubToken,
        githubUsername: userName || '',
        joinedAt: res.response.createdAt || new Date().toISOString(),
      };

      set({
        user: userProfile,
        currentPage: 'app',
        activeSection: 'projects',
      });

      const resProj = await apiFetch<Project[]>('/api/v1/projects');
      if (resProj.success && resProj.response) {
        set({ projects: resProj.response });
      }

      return { success: true, user: userProfile };
    }

    return { success: false, error: res.error || 'Invalid credentials' };
  },

  register: async (email, password, userName, fullName) => {
    const res = await apiFetch<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, userName, fullName }),
      skipAuth: true,
    });

    if (res.success && res.response) {
      const { accessToken, refreshToken } = res.response;
      setTokens(accessToken, refreshToken);

      const userProfile: UserProfile = {
        id: res.response.userId || `user-${Date.now()}`,
        name: fullName,
        email: email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        githubConnected: false,
        githubUsername: userName,
        joinedAt: new Date().toISOString(),
      };

      set({
        user: userProfile,
        currentPage: 'app',
        activeSection: 'projects',
        projects: [],
      });

      return { success: true, user: userProfile };
    }

    return { success: false, error: res.error || 'Registration failed' };
  },

  logout: async () => {
    if (typeof window !== 'undefined' && window.__queuePollInterval) {
      clearInterval(window.__queuePollInterval);
      delete window.__queuePollInterval;
    }

    const refresh = getRefreshToken();
    if (refresh) {
      await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refresh }),
        skipAuth: true,
      });
    }

    clearTokens();

    set({
      user: { id: '', name: '', email: '', avatarUrl: '', githubConnected: false, joinedAt: '' },
      currentPage: 'landing',
      currentProjectId: undefined,
      projects: [],
      documents: [],
      requirements: [],
      tasks: [],
      conflicts: [],
    });
  },

  updateUser: (profile) => {
    set((state) => ({
      user: { ...state.user, ...profile },
    }));
  },
}));
