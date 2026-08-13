'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  RefreshCw,
  Clock,
  User,
  Copy,
  Check,
} from 'lucide-react';
import {
  Project,
  Conversation,
  RetrievedContext,
} from '@/types';
import { AiService } from '@/services/aiService';
import { StorageService } from '@/services/storage';

interface AiChatViewProps {
  project: Project;
  conversations: Conversation[];
  activeConversation?: Conversation;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onToggleContextInspector: () => void;
  isContextInspectorOpen: boolean;
  activeContext?: RetrievedContext;
  onSetContextForInspector: (ctx?: RetrievedContext, reasoning?: string, tools?: string[]) => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  project,
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onToggleContextInspector,
  isContextInspectorOpen,
  onSetContextForInspector,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isGenerating]);

  // Prompt templates for developers
  const promptTemplates = [
    'Analyze project requirement conflicts & risks',
    'Summarize current architecture & database schemas',
    'Propose task breakdown for idempotency middleware',
    'Verify PCI-DSS JWT token expiration compliance',
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const prompt = customPrompt || inputText;
    if (!prompt.trim() || isGenerating) return;

    setInputText('');

    // Ensure conversation exists
    let currentConv = activeConversation;
    if (!currentConv) {
      currentConv = StorageService.createConversation(project.id, prompt.slice(0, 30));
      onSelectConversation(currentConv.id);
    }

    // 1. Add User Message
    StorageService.addMessageToConversation(project.id, currentConv.id, {
      conversationId: currentConv.id,
      role: 'user',
      content: prompt,
    });

    // 2. Add Assistant Streaming Message Stub
    const assistantMsg = StorageService.addMessageToConversation(project.id, currentConv.id, {
      conversationId: currentConv.id,
      role: 'assistant',
      content: '',
      reasoningSummary: `Retrieved documents, requirements, and knowledge graph context for project "${project.name}".`,
      toolsUsed: ['vector_search', 'graph_query', 'gemini_3.6_flash'],
      retrievedContext: {
        requirements: [
          { id: 'req-102', title: 'REQ-102: JWT Access Token Lifetime Limit', type: 'Security' },
          { id: 'req-104', title: 'REQ-104: Idempotency Key Enforcement', type: 'Functional' },
        ],
        documents: [
          { id: 'doc-01', title: 'NovaPay Architecture Spec v2.1.pdf', excerpt: 'gRPC Settlement & Redis Backpressure' },
        ],
        github: [{ repo: project.repositoryUrl || 'hayyuu-ai/novapay-core', branch: project.branch || 'main' }],
      },
    });

    // Update Inspector context
    onSetContextForInspector(assistantMsg.retrievedContext, assistantMsg.reasoningSummary, assistantMsg.toolsUsed);

    setIsGenerating(true);

    let accumulatedContent = '';

    const prepareHistory = currentConv.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    prepareHistory.push({ role: 'user', content: prompt });

    await AiService.streamChat({
      messages: prepareHistory,
      projectContext: {
        projectName: project.name,
        documentsCount: project.documentsCount,
        requirementsCount: project.requirementsCount,
        tasksCount: project.tasksCount,
        activeConflictsCount: project.conflictsCount,
        githubConnected: !!project.repositoryUrl,
      },
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        assistantMsg.content = accumulatedContent;
        // Trigger re-render by updating storage
        StorageService.addMessageToConversation(project.id, currentConv!.id, {
          ...assistantMsg,
          content: accumulatedContent,
        });
      },
      onComplete: (fullText) => {
        assistantMsg.content = fullText || accumulatedContent;
        setIsGenerating(false);
      },
      onError: (err) => {
        assistantMsg.content += `\n\n[System Error: ${err?.message || 'AI streaming interrupted. Please retry.'}]`;
        setIsGenerating(false);
      },
    });
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex-1 flex h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors select-none">
      {/* LEFT: Conversation History Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full hidden md:flex shrink-0">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Project Chat Sessions
          </div>
          <button
            onClick={onNewConversation}
            className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs cursor-pointer"
            title="Start New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs font-medium">
              No previous chat sessions.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  activeConversation?.id === conv.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="truncate min-w-0 flex-1 pr-2">
                  <div className="truncate text-slate-900 dark:text-slate-100">{conv.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer"
                  title="Delete Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER: Main Chat Window & Composer */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
        {/* Chat Header Bar */}
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="truncate max-w-[200px] sm:max-w-xs">{activeConversation ? activeConversation.title : 'New AI Reasoning Session'}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-blue-700 dark:text-blue-300 font-mono font-semibold">
                  Gemini 3.6 Flash
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleContextInspector}
              className={`p-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                isContextInspectorOpen
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Toggle AI Context Inspector Panel"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Context Inspector</span>
              {isContextInspectorOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Message History Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                <Bot className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Engineering Assistant for {project.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-sans">
                  Ask questions, extract requirements, analyze conflicts, or explore architecture over your project's vector-embedded documents and knowledge graph.
                </p>
              </div>

              {/* Developer Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto pt-2">
                {promptTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(tmpl)}
                    className="p-3 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 text-left text-xs text-slate-800 dark:text-slate-200 transition-all group shadow-xs cursor-pointer"
                  >
                    <div className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tmpl}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeConversation.messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                      isUser
                        ? 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div
                      className={`p-4 rounded-lg border text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-blue-600 border-blue-700 text-white rounded-tr-none font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.content || (isGenerating && !msg.content ? 'AI is reasoning...' : '')}</div>

                      {/* Explainability Tags for Assistant Messages */}
                      {!isUser && msg.retrievedContext && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => {
                                onSetContextForInspector(msg.retrievedContext, msg.reasoningSummary, msg.toolsUsed);
                                if (!isContextInspectorOpen) onToggleContextInspector();
                              }}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                            >
                              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" /> View Context Sources
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopyCode(msg.content, msg.id)}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                            title="Copy text"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-colors"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask Hayyuu AI about ${project.name} requirements, code, or architecture...`}
              disabled={isGenerating}
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-colors shadow-xs cursor-pointer"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
