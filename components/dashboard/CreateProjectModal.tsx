'use client'

import React, { useState, useRef } from 'react';
import {
  X,
  FolderPlus,
  Github,
  Sparkles,
  FileText,
  Upload,
  Cloud,
  HardDrive,
  Trash2,
  CheckCircle2,
  Link2,
  Plus,
  FileType,
} from 'lucide-react';

export interface UploadedDocItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  source: 'local' | 'cloud' | 'pasted';
  summary?: string;
  content?: string;
  url?: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: {
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
}

// Preset SRS Templates to quickly assist users
const SRS_TEMPLATES = [
  {
    title: 'IEEE 830 SRS Specification Template',
    fileName: 'ieee-830-srs.md',
    fileType: 'SRS Spec',
    fileSize: '12.4 KB',
    content: `# Software Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
This document specifies the software requirements for the system, covering functional scope, security controls, and architectural constraints.

### 1.2 Scope
- High-throughput API routing engine
- Role-based authorization & OAuth integration
- Real-time notification & audit logging

## 2. Overall Description
- User Interfaces: React SPA with REST/GraphQL APIs
- Database: Relational SQL / Vector Memory Store
- External Interfaces: Payment Gateways, Cloud Storage API

## 3. Specific Functional Requirements
- REQ-01: User Authentication via SAML/OAuth2
- REQ-02: Automated Document Vector Indexing
- REQ-03: Real-time Conflict & Exception Monitoring`,
  },
  {
    title: 'OpenAPI 3.0 Architecture Spec',
    fileName: 'openapi-arch-spec.yaml',
    fileType: 'API Spec',
    fileSize: '8.1 KB',
    content: `openapi: 3.0.3
info:
  title: Core Service API
  version: 1.0.0
  description: Technical specification for microservices architecture endpoints and payload contracts.
paths:
  /api/v1/auth/login:
    post:
      summary: User authentication endpoint
      responses:
        '200':
          description: Successful authentication token
  /api/v1/documents/upload:
    post:
      summary: Multi-part file upload for SRS and PRD ingestion
      responses:
        '201':
          description: Document queued for vector processing`,
  },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('main');

  // Active Upload Tab: 'local' | 'cloud' | 'text'
  const [activeUploadTab, setActiveUploadTab] = useState<'local' | 'cloud' | 'text'>('local');

  // Staged Uploaded Documents
  const [stagedDocs, setStagedDocs] = useState<UploadedDocItem[]>([]);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud Drive state
  const [cloudUrl, setCloudUrl] = useState('');
  const [cloudTitle, setCloudTitle] = useState('');
  const [cloudType, setCloudType] = useState('Google Drive SRS');

  // Direct Text / SRS State
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [pastedFormat, setPastedFormat] = useState('SRS Document');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 4) {
      const generated = val
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 4);
      setKey(generated || 'PROJ');
    }
  };

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Determine file type category based on extension
  const getFileTypeCategory = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return 'PDF Spec';
    if (['doc', 'docx'].includes(ext)) return 'Word / SRS';
    if (['md', 'markdown'].includes(ext)) return 'Markdown Spec';
    if (['json', 'yaml', 'yml'].includes(ext)) return 'API / Code Spec';
    if (['srs'].includes(ext)) return 'Software Requirements Spec';
    if (['png', 'jpg', 'jpeg', 'svg', 'drawio'].includes(ext)) return 'Architecture Diagram';
    return 'Project Document';
  };

  // Handle local files selection
  const handleLocalFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const textContent = typeof e.target?.result === 'string' ? e.target.result : undefined;
        const newDoc: UploadedDocItem = {
          id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileType: getFileTypeCategory(file.name),
          source: 'local',
          summary: textContent
            ? textContent.slice(0, 150).replace(/\n/g, ' ') + '...'
            : `Uploaded local file (${getFileTypeCategory(file.name)}). Ready for vector ingestion.`,
          content: textContent,
        };

        setStagedDocs((prev) => [...prev, newDoc]);
      };

      // Try reading as text for SRS/MD/TXT/JSON
      if (
        file.type.startsWith('text/') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.yaml') ||
        file.name.endsWith('.srs') ||
        file.name.endsWith('.txt')
      ) {
        reader.readAsText(file);
      } else {
        // For binary files like PDF/DOCX, store metadata
        const newDoc: UploadedDocItem = {
          id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileType: getFileTypeCategory(file.name),
          source: 'local',
          summary: `Binary local document (${formatBytes(file.size)}). Ready for vector processing pipeline.`,
        };
        setStagedDocs((prev) => [...prev, newDoc]);
      }
    });
  };

  // Handle Cloud Drive Link submission
  const handleAddCloudLink = () => {
    if (!cloudUrl.trim()) return;

    const domainName = cloudUrl.includes('drive.google.com')
      ? 'Google Drive'
      : cloudUrl.includes('onedrive')
      ? 'OneDrive'
      : cloudUrl.includes('dropbox')
      ? 'Dropbox'
      : cloudUrl.includes('notion')
      ? 'Notion Spec'
      : cloudUrl.includes('confluence')
      ? 'Confluence'
      : 'Cloud Drive';

    const newDoc: UploadedDocItem = {
      id: `cloud-${Date.now()}`,
      title: cloudTitle.trim() || `${domainName} Specification`,
      fileName: `${domainName.toLowerCase().replace(/\s+/g, '-')}-link`,
      fileSize: 'Cloud Shared',
      fileType: cloudType,
      source: 'cloud',
      url: cloudUrl.trim(),
      summary: `Synced from ${domainName}: ${cloudUrl.trim()}. Automatically indexed upon project creation.`,
    };

    setStagedDocs((prev) => [...prev, newDoc]);
    setCloudUrl('');
    setCloudTitle('');
  };

  // Handle Pasted Text Submission
  const handleAddPastedSpec = () => {
    if (!pastedContent.trim()) return;

    const newDoc: UploadedDocItem = {
      id: `pasted-${Date.now()}`,
      title: pastedTitle.trim() || `${name || 'Project'} Requirements Specification`,
      fileName: 'starter-requirements-spec.md',
      fileSize: formatBytes(pastedContent.length),
      fileType: pastedFormat,
      source: 'pasted',
      content: pastedContent.trim(),
      summary: pastedContent.trim().slice(0, 160) + '...',
    };

    setStagedDocs((prev) => [...prev, newDoc]);
    setPastedTitle('');
    setPastedContent('');
  };

  // Load Preset SRS Template
  const handleLoadTemplate = (template: typeof SRS_TEMPLATES[0]) => {
    const newDoc: UploadedDocItem = {
      id: `template-${Date.now()}`,
      title: template.title,
      fileName: template.fileName,
      fileSize: template.fileSize,
      fileType: template.fileType,
      source: 'pasted',
      content: template.content,
      summary: template.content.slice(0, 160) + '...',
    };
    setStagedDocs((prev) => [...prev, newDoc]);
  };

  const handleRemoveStagedDoc = (id: string) => {
    setStagedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      key: key.toUpperCase().trim() || 'PROJ',
      description: description.trim(),
      repositoryUrl: repositoryUrl.trim(),
      branch: branch.trim() || 'main',
      initialUploadedDocs: stagedDocs.map((d) => ({
        title: d.title,
        fileName: d.fileName,
        fileSize: d.fileSize,
        fileType: d.fileType,
        summary: d.summary,
      })),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">Create New Intelligence Project</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Initialize an isolated AI workspace with project documentation & SRS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project Name & Key */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. NovaPay Core Engine"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Key</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 5))}
                placeholder="NOVA"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 uppercase font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                maxLength={5}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Short Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the overall engineering goals and purpose of this project..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Project Documents & SRS Upload Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <label className="text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1.5 text-xs">
                  <FileType className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                  Project Documentation & Software Requirements (SRS)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload SRS, PRDs, architecture specifications, or cloud links to feed the AI vector engine.
                </p>
              </div>

              {/* Source Tabs */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveUploadTab('local')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeUploadTab === 'local'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" /> Local Machine
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUploadTab('cloud')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeUploadTab === 'cloud'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" /> Cloud Drive
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUploadTab('text')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeUploadTab === 'text'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Direct Text / SRS
                </button>
              </div>
            </div>

            {/* TAB 1: Local File Drag & Drop / File Picker */}
            {activeUploadTab === 'local' && (
              <div className="space-y-2">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleLocalFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-600 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/50 shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.md,.txt,.json,.yaml,.srs,.png,.jpg,.drawio,.csv"
                    onChange={(e) => handleLocalFiles(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 border border-blue-100 dark:border-blue-800">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Click to browse or drag & drop files from your computer
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports <strong className="text-slate-700 dark:text-slate-300">SRS (.pdf, .docx, .srs)</strong>, PRDs, Markdown (.md), OpenAPI / JSON, & Architecture Diagrams
                  </p>
                </div>

                {/* Preset Templates Quick Add */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Or load preset sample spec:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SRS_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLoadTemplate(tmpl)}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                        {tmpl.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Cloud Drive Link Import */}
            {activeUploadTab === 'cloud' && (
              <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-md space-y-3">
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                  <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Attach Google Drive, OneDrive, or Notion Document
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-0.5 uppercase">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={cloudTitle}
                      onChange={(e) => setCloudTitle(e.target.value)}
                      placeholder="e.g. System SRS Spec v2.1 (Google Drive)"
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-0.5 uppercase">
                      Category Tag
                    </label>
                    <select
                      value={cloudType}
                      onChange={(e) => setCloudType(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 cursor-pointer font-medium"
                    >
                      <option value="Google Drive SRS">Google Drive SRS</option>
                      <option value="OneDrive Spec">OneDrive Spec</option>
                      <option value="Notion PRD">Notion PRD</option>
                      <option value="Confluence Docs">Confluence Docs</option>
                      <option value="Figma Architecture">Figma Architecture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-0.5 uppercase">
                    Cloud Link / Shared URL *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={cloudUrl}
                        onChange={(e) => setCloudUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCloudLink}
                      disabled={!cloudUrl.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Attach Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Direct Text / SRS Paste */}
            {activeUploadTab === 'text' && (
              <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-md space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={pastedTitle}
                      onChange={(e) => setPastedTitle(e.target.value)}
                      placeholder="e.g. System Requirement Specification (SRS) Draft"
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <select
                      value={pastedFormat}
                      onChange={(e) => setPastedFormat(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 cursor-pointer font-medium"
                    >
                      <option value="SRS Document">SRS Document</option>
                      <option value="Technical PRD">Technical PRD</option>
                      <option value="Architecture Spec">Architecture Spec</option>
                      <option value="Markdown Notes">Markdown Notes</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Paste initial technical specifications, architecture notes, functional requirements, or API guidelines here..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 resize-none font-sans text-xs leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddPastedSpec}
                    disabled={!pastedContent.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Document
                  </button>
                </div>
              </div>
            )}

            {/* Staged Uploaded Documents Preview List */}
            {stagedDocs.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Attached Project Files ({stagedDocs.length})
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
                    Queued for Ingestion
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                  {stagedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                          {doc.source === 'cloud' ? (
                            <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate flex items-center gap-2">
                            <span>{doc.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase shrink-0">
                              {doc.fileType}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
                            <span>{doc.fileName}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{doc.fileSize}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveStagedDoc(doc.id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Remove attached file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GitHub Connection */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> GitHub Repository Connection (Optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/org/repo-name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1 text-blue-700 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Automated Vector Memory Provisioning
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Upon project creation, all attached SRS files and specifications will be vectorized, parsed into tracked requirements, and indexed into the project knowledge graph.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" /> Create Environment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
