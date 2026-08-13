import { Requirement } from '@/types';

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

export class AiService {
  static async streamChat({
    messages,
    projectContext,
    onChunk,
    onComplete,
    onError,
  }: StreamChatParams): Promise<void> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          projectContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with HTTP ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';
      let fullText = '';

      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        if (!reader) throw new Error('Response body is null');

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  fullText += parsed.text;
                  onChunk(parsed.text);
                }
              } catch {
                // Ignore parse errors for raw fragments
              }
            }
          }
        }
        onComplete(fullText);
      } else {
        // Direct stream or plain text response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        if (!reader) throw new Error('Response body is null');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value);
          fullText += textChunk;
          onChunk(textChunk);
        }
        onComplete(fullText);
      }
    } catch (err) {
      console.error('AI Stream Error:', err);
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  static async extractRequirements(text: string, projectName: string): Promise<Partial<Requirement>[]> {
    try {
      const res = await fetch('/api/ai/extract-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, projectName }),
      });
      if (!res.ok) throw new Error('Failed to extract requirements');
      const data = await res.json();
      return data.requirements || [];
    } catch (e) {
      console.error('Extract requirements error:', e);
      return [];
    }
  }
}
