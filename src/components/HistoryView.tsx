import React, { useEffect, useState } from 'react';
import { 
  History as HistoryIcon, 
  MessageSquare, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  Calculator 
} from 'lucide-react';
import { fetchQueryHistory } from '../services/api';

interface HistoryViewProps {
  onOpenEvidence: (docName: string, pageNum: number, snippet: string, type: 'chart' | 'table' | 'text') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onOpenEvidence }) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchQueryHistory().then(setHistory).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-indigo-400" />
          Decision Query History
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review previous analytical queries, mathematical proofs, and associated document citations.
        </p>
      </div>

      <div className="space-y-4">
        {history.length > 0 ? (
          history.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {item.question}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {item.answer}
              </p>

              {item.calculation && (
                <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                  {item.calculation}
                </pre>
              )}

              {item.evidence && item.evidence.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Citations: {item.evidence[0].source_reference}
                  </span>
                  <button
                    onClick={() => onOpenEvidence(
                      item.evidence[0].document_name || 'Global_Operations_Report_2025.pdf',
                      item.evidence[0].page_number || 1,
                      item.evidence[0].snippet || item.answer,
                      item.evidence[0].content_type || 'text'
                    )}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    View Evidence Page <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
            No query history recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
