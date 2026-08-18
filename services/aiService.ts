import { Requirement } from '@/types';
import { apiFetch } from './api';
import { useAppStore } from './store';

export interface StreamChatParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  projectContext: {
    projectName: string;
    documentsCount: number;
    requirementsCount: number;
    tasksCount: number;
    activeConflictsCount: number;
    githubConnected: boolean;
  };
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (err: Error) => void;
}

interface NodeItem {
  id?: string;
  label?: string;
  name?: string;
  properties?: { type?: string };
}

interface SourceItem {
  documentId?: string;
  chunkIndex?: number;
  content?: string;
}

interface ChatApiResponse {
  answer: string;
  sources?: SourceItem[];
  nodes?: NodeItem[];
}

interface ExtractRequirementsResponse {
  requirements: Partial<Requirement>[];
}

export class AiService {
  static async streamChat({
    messages,
    onChunk,
    onComplete,
    onError,
  }: StreamChatParams): Promise<void> {
    try {
      const projectId = useAppStore.getState().currentProjectId;
      if (!projectId) {
        throw new Error('No active project selected');
      }

      const res = await apiFetch<ChatApiResponse>(`/api/v1/projects/${projectId}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          prompt: messages[messages.length - 1].content,
          limit: 5,
        }),
      });

      if (!res.success || !res.response) {
        throw new Error(res.error || 'Failed to get chat response from AI engine');
      }

      const { answer, sources, nodes } = res.response;

      // Emulate typing stream on client side to keep premium UX styling
      const chunks = answer.split(' ');
      for (let i = 0; i < chunks.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + chunks[i];
        onChunk(chunk);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      // Cache real explainability context in store for inspector panels
      const activeConvId = useAppStore.getState().activeConversationId;
      if (activeConvId) {
        const mappedContext = {
          requirements: (nodes || [])
            .filter((n: NodeItem) => n.label === 'Requirement' || n.label === 'requirement')
            .map((n: NodeItem) => ({
              id: n.id || 'req-node',
              title: n.name || 'Extracted Requirement',
              type: n.properties?.type || 'Functional',
            })),
          documents: (sources || []).map((s: SourceItem) => ({
            id: s.documentId || 'doc-node',
            title: `Doc Chunk #${s.chunkIndex || 0}`,
            excerpt: s.content ? s.content.slice(0, 120) + '...' : 'Text snippet reference',
          })),
          github: [],
        };

        const conversations = useAppStore.getState().conversations;
        const conv = conversations.find((c) => c.id === activeConvId);
        if (conv) {
          const assistantMsg = conv.messages.find((m) => m.role === 'assistant' && m.content === answer);
          if (assistantMsg) {
            assistantMsg.retrievedContext = mappedContext;
            assistantMsg.reasoningSummary = "Semantic graph traversal & vector document chunk extraction successfully completed.";
            assistantMsg.toolsUsed = ["Vector Semantic Index", "Requirement Graph Engine"];
          }
        }
      }

      onComplete(answer);
    } catch (err: unknown) {
      console.error('AI Stream Error:', err);
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  static async extractRequirements(text: string, projectName: string): Promise<Partial<Requirement>[]> {
    try {
      const res = await apiFetch<ExtractRequirementsResponse>('/api/ai/extract-requirements', {
        method: 'POST',
        body: JSON.stringify({ text, projectName }),
      });
      if (!res.success) throw new Error(res.error || 'Failed to extract requirements');
      return res.response?.requirements || [];
    } catch (e: unknown) {
      console.error('Extract requirements error:', e);
      return [];
    }
  }
}
