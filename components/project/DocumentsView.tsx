'use client'

import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ProjectDocument, Project } from '@/types';

interface DocumentsViewProps {
  project: Project;
  documents: ProjectDocument[];
  onAddDocument: (doc: { title: string; fileName: string; fileSize: string; fileType: string; summary?: string; file?: File }) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  project,
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.extractedConcepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase() || 'TXT';
    const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    onAddDocument({
      title,
      fileName: file.name,
      fileSize,
      fileType: ext,
      file,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors no-scrollbar select-none">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.doc,.txt,.md,.json,.yaml,.yml"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Document Management</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Upload and vectorize engineering specifications, RFCs, and API documentation for project "{project.name}".
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or concepts..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 shadow-xs placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
            No documents found matching your search.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg p-4 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {doc.fileType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                        doc.status === 'ready'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : doc.status === 'processing'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{doc.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">{doc.summary}</p>

                {doc.extractedConcepts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.extractedConcepts.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{doc.chunksCount} Vector Chunks · {doc.fileSize}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Inspect Details
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Inspector Drawer / Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedDoc(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-6 text-slate-900 dark:text-slate-100 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {selectedDoc.title}
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">File Name:</span>
                  <div className="font-mono text-slate-800 dark:text-slate-200 truncate font-semibold">{selectedDoc.fileName}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Vector Status:</span>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{selectedDoc.status}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Chunks:</span>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold">{selectedDoc.chunksCount} Chunks</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">File Size:</span>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold">{selectedDoc.fileSize}</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Document Summary:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                  {selectedDoc.summary}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Extracted Concepts:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedDoc.extractedConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
