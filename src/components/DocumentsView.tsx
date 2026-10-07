import React, { useState } from 'react';
import { 
  Files, 
  FileText, 
  Table as TableIcon, 
  BarChart3, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { DocumentItem, DocumentPage, ExtractedElement } from '../types';
import { fetchDocument, fetchPageElements, uploadDocumentFile, getFileUrl, loadDemoDocument } from '../services/api';

interface DocumentsViewProps {
  documents: DocumentItem[];
  refreshDocuments: () => void;
  onOpenEvidence: (docName: string, pageNum: number, snippet: string, type: 'chart' | 'table' | 'text') => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ 
  documents, 
  refreshDocuments,
  onOpenEvidence
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(documents[0]?.id || null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentItem | null>(null);
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [pageElements, setPageElements] = useState<ExtractedElement[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Load document details when selected
  React.useEffect(() => {
    if (selectedDocId) {
      fetchDocument(selectedDocId)
        .then((doc) => {
          setSelectedDocDetails(doc);
          if (doc.pages && doc.pages.length > 0) {
            setSelectedPageNum(1);
          }
        })
        .catch(console.error);
    }
  }, [selectedDocId]);

  // Load page elements when page changes
  React.useEffect(() => {
    if (selectedDocId && selectedPageNum) {
      fetchPageElements(selectedDocId, selectedPageNum)
        .then(setPageElements)
        .catch(console.error);
    }
  }, [selectedDocId, selectedPageNum]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStage('Uploading document...');
    setUploadProgress(20);

    try {
      setTimeout(() => { setUploadStage('Extracting text & page structures...'); setUploadProgress(45); }, 500);
      setTimeout(() => { setUploadStage('Detecting tables & parsing rows...'); setUploadProgress(70); }, 1000);
      setTimeout(() => { setUploadStage('Analyzing charts & building visual knowledge...'); setUploadProgress(90); }, 1500);

      const res = await uploadDocumentFile(file);
      setTimeout(() => {
        setIsUploading(false);
        refreshDocuments();
        setSelectedDocId(res.document_id);
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsUploading(true);
    setUploadStage('Generating & indexing 6-page operations report...');
    setUploadProgress(50);
    try {
      const res = await loadDemoDocument();
      refreshDocuments();
      setSelectedDocId(res.document_id);
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
  };

  const selectedPageObj = selectedDocDetails?.pages?.find(p => p.page_number === selectedPageNum);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Document Repository & Explorer</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse indexed documents, inspect page-level layouts, and examine extracted multimodal elements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDemo}
            className="px-3.5 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Load Sample Report
          </button>

          <label className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-600/20">
            <Upload className="w-4 h-4" />
            Upload PDF
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Upload Progress Modal / Overlay */}
      {isUploading && (
        <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              {uploadStage}
            </span>
            <span className="font-mono text-slate-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Document Selector Pills */}
      {documents.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {documents.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <FileText className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="truncate max-w-[180px]">{doc.filename}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {doc.total_pages}p
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <Files className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No documents indexed yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload your multi-page operational reports or click "Load Sample Report" to explore full text, tables, charts, and evidence citations.
          </p>
          <button
            onClick={handleLoadDemo}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Sparkles className="w-4 h-4" /> Load Demo Report
          </button>
        </div>
      )}

      {/* Document Explorer 3-Column Interface */}
      {selectedDocDetails && (
        <div className="grid grid-cols-12 gap-5 h-[calc(100vh-270px)] min-h-[580px]">
          {/* Column 1: Page Thumbnails (Left - 2 Cols) */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 px-1">
              <span className="text-xs font-semibold text-slate-300">Pages ({selectedDocDetails.total_pages})</span>
              <span className="text-[10px] font-mono text-slate-500">Thumbnails</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
              {selectedDocDetails.pages?.map((p) => {
                const isSelected = selectedPageNum === p.page_number;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageNum(p.page_number)}
                    className={`w-full text-left rounded-xl p-2 border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-slate-950 rounded-lg overflow-hidden border border-slate-800/60 mb-2 flex items-center justify-center">
                      <img
                        src={getFileUrl(p.thumbnail_path)}
                        alt={`Page ${p.page_number}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-semibold ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>
                        Page {p.page_number}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        {p.tables_count > 0 && <TableIcon className="w-3 h-3 text-emerald-400" />}
                        {p.visuals_count > 0 && <BarChart3 className="w-3 h-3 text-indigo-400" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Full Document Page Preview (Center - 5 Cols) */}
          <div className="col-span-12 md:col-span-5 lg:col-span-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Page {selectedPageNum} Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  150 DPI
                </span>
              </div>
              <button
                onClick={() => {
                  if (pageElements[0]) {
                    onOpenEvidence(
                      selectedDocDetails.filename,
                      selectedPageNum,
                      pageElements[0].content,
                      pageElements[0].content_type as any
                    );
                  }
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Inspect Evidence
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/50 p-2">
              {selectedPageObj ? (
                <img
                  src={getFileUrl(selectedPageObj.image_path)}
                  alt={`Full preview page ${selectedPageNum}`}
                  className="max-h-full object-contain rounded-lg shadow-lg border border-slate-800"
                />
              ) : (
                <div className="text-center text-xs text-slate-500">Loading page render...</div>
              )}
            </div>
          </div>

          {/* Column 3: Detected Elements & Intelligence (Right - 4 Cols) */}
          <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-200">
                Detected Elements ({pageElements.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">Structured Data</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
              {pageElements.length > 0 ? (
                pageElements.map((elem) => (
                  <div
                    key={elem.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {elem.content_type === 'table' ? (
                          <TableIcon className="w-4 h-4 text-emerald-400" />
                        ) : elem.content_type === 'chart' ? (
                          <BarChart3 className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-semibold text-slate-200 capitalize">
                          {elem.content_type}: {elem.section}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">P.{elem.page_number}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono max-h-32 overflow-y-auto bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 leading-relaxed whitespace-pre-wrap">
                      {elem.content}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-500 truncate max-w-[160px]">{elem.source_reference}</span>
                      <button
                        onClick={() => onOpenEvidence(
                          selectedDocDetails.filename,
                          elem.page_number,
                          elem.content,
                          elem.content_type as any
                        )}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No elements extracted for this page.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
