import React from 'react';
import { X, ExternalLink, FileText, BarChart3, Table as TableIcon, Layers, ShieldCheck } from 'lucide-react';
import { EvidenceItem } from '../types';
import { getFileUrl } from '../services/api';

interface EvidenceDrawerProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
      <div 
        className="w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {evidence.content_type === 'chart' ? (
                <BarChart3 className="w-5 h-5" />
              ) : evidence.content_type === 'table' ? (
                <TableIcon className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-300">
                  {evidence.content_type} Evidence
                </span>
                <span className="text-xs text-slate-400">Page {evidence.page_number}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 truncate max-w-sm mt-0.5">
                {evidence.section || evidence.source_reference}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-xs">
            <div>
              <p className="text-slate-400">Source Document</p>
              <p className="font-semibold text-slate-200 truncate mt-0.5">{evidence.document_name}</p>
            </div>
            <div>
              <p className="text-slate-400">Verified Page</p>
              <p className="font-semibold text-slate-200 mt-0.5">Page {evidence.page_number}</p>
            </div>
            <div>
              <p className="text-slate-400">Verification Status</p>
              <p className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> High Provenance
              </p>
            </div>
            <div>
              <p className="text-slate-400">Content Modality</p>
              <p className="font-semibold text-indigo-300 capitalize mt-0.5">{evidence.content_type}</p>
            </div>
          </div>

          {/* Excerpt Snippet */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Extracted Evidence Excerpt
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
              {evidence.snippet}
            </div>
          </div>

          {/* Render Page Canvas / High-Res Image Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Source Document Page Preview
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">150 DPI Render</span>
            </div>
            <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center min-h-[300px]">
              <img 
                src={evidence.image_url ? getFileUrl(evidence.image_url) : `http://127.0.0.1:8000/processed/test-doc-1/pages/page_${evidence.page_number}.png`}
                alt={`Page ${evidence.page_number} preview`}
                className="w-full object-contain max-h-[500px]"
                onError={(e) => {
                  // Fallback placeholder if image not yet ready
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur text-[11px] font-mono text-slate-300 border border-white/10">
                Traceable Evidence • Page {evidence.page_number}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Trace ID: {evidence.source_reference}</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
