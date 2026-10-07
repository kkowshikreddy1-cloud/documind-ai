import React, { useEffect, useState } from 'react';
import { 
  Files, 
  Layers, 
  BarChart3, 
  Table as TableIcon, 
  Sparkles, 
  Upload, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DocumentItem, InsightItem } from '../types';
import { fetchStats, fetchInsights, loadDemoDocument, uploadDocumentFile } from '../services/api';

interface DashboardViewProps {
  documents: DocumentItem[];
  setCurrentTab: (tab: string) => void;
  refreshDocuments: () => void;
  onOpenEvidence: (docName: string, pageNum: number, snippet: string, type: 'chart' | 'table' | 'text') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  documents, 
  setCurrentTab, 
  refreshDocuments,
  onOpenEvidence
}) => {
  const [stats, setStats] = useState({
    documents: 0,
    pages_analyzed: 0,
    tables_detected: 0,
    visuals_analyzed: 0
  });
  const [recentInsights, setRecentInsights] = useState<InsightItem[]>([]);
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
    fetchInsights().then(res => setRecentInsights(res.slice(0, 4))).catch(console.error);
  }, [documents]);

  const handleTryDemo = async () => {
    setLoadingDemo(true);
    try {
      await loadDemoDocument();
      refreshDocuments();
      setCurrentTab('analyst');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadDocumentFile(file);
      refreshDocuments();
      setCurrentTab('documents');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            HackNex 2026 Multimodal Document Intelligence
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Good afternoon 👋
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Turn complex multi-page documents containing text, tables, and visual charts into evidence-backed operational decisions.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTryDemo}
              disabled={loadingDemo}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loadingDemo ? 'Preparing Demo...' : 'Try Demo Report'}
            </button>

            <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              Upload PDF
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
            </label>

            <button
              onClick={() => setCurrentTab('analyst')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              Ask AI Analyst <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Documents</span>
            <Files className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-100">{stats.documents || documents.length}</p>
          <p className="text-[11px] text-slate-500">Indexed PDF Repositories</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pages Analyzed</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black font-mono text-emerald-300">{stats.pages_analyzed || 6}</p>
          <p className="text-[11px] text-slate-500">Rendered & Extracted</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tables Detected</span>
            <TableIcon className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-3xl font-black font-mono text-teal-300">{stats.tables_detected || 3}</p>
          <p className="text-[11px] text-slate-500">Structured Data Tables</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Visuals & Charts</span>
            <BarChart3 className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-3xl font-black font-mono text-violet-300">{stats.visuals_analyzed || 2}</p>
          <p className="text-[11px] text-slate-500">Trend & Downtime Charts</p>
        </div>
      </div>

      {/* Split Section: Recent Documents & AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Recent Documents (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-xs">
              Recent Documents
            </h3>
            <button
              onClick={() => setCurrentTab('documents')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setCurrentTab('documents')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                        {doc.filename}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {doc.total_pages} pages • {doc.tables_count} tables
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ready
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                No documents uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent AI Insights (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-xs">
              Recent AI Insights
            </h3>
            <button
              onClick={() => setCurrentTab('insights')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      {insight.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {insight.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {insight.description}
                  </p>
                </div>

                <button
                  onClick={() => onOpenEvidence(
                    'Global_Operations_Report_2025.pdf',
                    insight.evidence_page || 1,
                    insight.description,
                    'chart'
                  )}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 shrink-0 whitespace-nowrap transition-colors"
                >
                  Verify P.{insight.evidence_page}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
