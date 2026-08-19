export type NavigationSection =
  | 'projects'
  | 'overview'
  | 'chat'
  | 'documents'
  | 'requirements'
  | 'suggestions'
  | 'conflicts'
  | 'tasks'
  | 'github'
  | 'knowledge'
  | 'memory'
  | 'search'
  | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  githubConnected: boolean;
  githubUsername?: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  repositoryUrl?: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
  status: 'Active' | 'Archived' | 'Maintenance';
  documentsCount: number;
  requirementsCount: number;
  tasksCount: number;
  conflictsCount: number;
  memoriesCount: number;
  knowledgeEntitiesCount: number;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  chunksCount: number;
  summary: string;
  errorMessage?: string;
  extractedConcepts: string[];
}

export type RequirementType = 'Functional' | 'Non-Functional' | 'Security' | 'Architecture';
export type RequirementPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type RequirementStatus = 'Draft' | 'In Review' | 'Approved' | 'Deprecated';

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  source: string;
  linkedDocIds: string[];
  linkedTaskIds: string[];
  linkedKnowledgeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type ConflictCategory = 'Contradiction' | 'Ambiguity' | 'Gap' | 'Inconsistency';
export type ConflictSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ConflictStatus = 'Active' | 'Investigating' | 'Resolved' | 'Ignored';

export interface ConflictingArtifact {
  type: 'Document' | 'Requirement' | 'GitHub Code' | 'Task' | 'Knowledge';
  title: string;
  id: string;
}

export interface Conflict {
  id: string;
  projectId: string;
  title: string;
  category: ConflictCategory;
  severity: ConflictSeverity;
  status: ConflictStatus;
  description: string;
  conflictingArtifacts: ConflictingArtifact[];
  aiExplanation: string;
  suggestedAction: string;
  detectedAt: string;
}

export type TaskStatus = 'Backlog' | 'Todo' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  linkedRequirementId?: string;
  linkedDocId?: string;
  linkedGithubIssue?: { id: number; title: string; url: string };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface PullRequestInfo {
  number: number;
  title: string;
  status: 'open' | 'merged' | 'closed';
  author: string;
  updatedAt: string;
}

export interface IssueInfo {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: string[];
}

export interface ImplementationSignal {
  requirementTitle: string;
  implementationStatus: 'Synced' | 'Drift Detected' | 'Missing' | 'Unlinked';
  fileMatches: string[];
  lastChecked: string;
}

export interface GitHubRepoInfo {
  isConnected: boolean;
  repoName: string;
  branch: string;
  lastSyncAt: string;
  openIssuesCount: number;
  openPullRequestsCount: number;
  recentCommits: CommitInfo[];
  recentPRs: PullRequestInfo[];
  recentIssues: IssueInfo[];
  implementationSignals: ImplementationSignal[];
}

export type KnowledgeType = 'Technology' | 'Architecture' | 'Pattern' | 'API' | 'Component' | 'Rule';

export interface KnowledgeEntity {
  id: string;
  projectId: string;
  name: string;
  type: KnowledgeType;
  description: string;
  source: string;
  confidence: number;
  relatedEntityIds: string[];
  linkedArtifacts: { type: string; title: string }[];
  createdAt: string;
}

export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: 'depends_on' | 'implements' | 'conflicts_with' | 'references' | 'contains';
  description: string;
}

export type MemoryType = 'working' | 'short_term' | 'long_term' | 'episodic' | 'semantic';

export interface MemoryItem {
  id: string;
  projectId: string;
  type: MemoryType;
  summary: string;
  content: string;
  source: string;
  relevanceScore: number;
  createdAt: string;
  updatedAt: string;
  relatedConversationId?: string;
}

export interface RetrievedContext {
  documents?: { title: string; excerpt: string; id: string }[];
  requirements?: { title: string; type: string; id: string }[];
  tasks?: { title: string; status: string; id: string }[];
  memories?: { summary: string; type: MemoryType }[];
  knowledge?: { name: string; type: KnowledgeType }[];
  github?: { repo: string; branch: string; commit?: string }[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  retrievedContext?: RetrievedContext;
  reasoningSummary?: string;
  toolsUsed?: string[];
}

export interface Conversation {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'requirement' | 'task' | 'conversation' | 'knowledge' | 'memory' | 'github';
  snippet: string;
  relevanceScore: number;
  section: NavigationSection;
  metadata?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  actionSection?: NavigationSection;
}

export interface WorkflowJob {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  startedAt: string;
  details: string;
}

export interface AISuggestion {
  id: string;
  projectId: string;
  type: string; // e.g. "gap_analysis"
  content: {
    title: string;
    description: string;
    reasoning: string;
    category: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}
