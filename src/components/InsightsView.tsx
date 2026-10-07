import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Lightbulb, 
  ShieldCheck, 
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { InsightItem } from '../types';
import { fetchInsights } from '../services/api';

interface InsightsViewProps {
  onOpenEvidence: (docName: string, pageNum: number, snippet: string, type: 'chart' | 'table' | 'text') => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ onOpenEvidence }) => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchInsights().then(setInsights).catch(console.error);
  }, []);

  const categories = [
    { id: 'all', label: 'All Insights' },
    { id: 'trend', label: '📈 Trends' },
    { id: 'risk', label: '⚠️ Risks' },
    { id: 'anomaly', label: '🔎 Anomalies' },
    { id: 'opportunity', label: '💡 Opportunities' },
  ];

  const filtered = filterCategory === 'all' 
    ? insights 
    : insights.filter(i => i.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Automatic Document Insights</h2>
          <p className="text-xs text-slate-400 mt-1">
            Proactive intelligence surfaced across cross-modal analysis of text, tables, and visual charts.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filterCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isTrend = item.category === 'trend';
          const isRisk = item.category === 'risk';
          const isAnomaly = item.category === 'anomaly';
          const isOpportunity = item.category === 'opportunity';

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isTrend ? 'bg-indigo-500/20 text-indigo-300' :
                    isRisk ? 'bg-rose-500/20 text-rose-300' :
                    isAnomaly ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isTrend && <TrendingUp className="w-3 h-3" />}
                    {isRisk && <AlertTriangle className="w-3 h-3" />}
                    {isAnomaly && <Search className="w-3 h-3" />}
                    {isOpportunity && <Lightbulb className="w-3 h-3" />}
                    {item.category}
                  </span>

                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> High Confidence
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              {/* Card Footer / Evidence button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                  {item.evidence_reference}
                </span>

                <button
                  onClick={() => onOpenEvidence(
                    'Global_Operations_Report_2025.pdf',
                    item.evidence_page || 1,
                    item.description,
                    item.category === 'risk' || item.category === 'trend' ? 'chart' : 'table'
                  )}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                >
                  Verify Page {item.evidence_page}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
