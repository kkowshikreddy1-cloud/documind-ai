import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Calculator, 
  HelpCircle, 
  FileCheck2, 
  BarChart3, 
  Table as TableIcon, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { QueryResponse, EvidenceItem, DocumentItem } from '../types';
import { sendQuery } from '../services/api';

interface AnalystViewProps {
  documents: DocumentItem[];
  onOpenEvidence: (docName: string, pageNum: number, snippet: string, type: 'chart' | 'table' | 'text' | 'image') => void;
}

export const AnalystView: React.FC<AnalystViewProps> = ({ documents, onOpenEvidence }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [conversation, setConversation] = useState<Array<{ q: string; a: QueryResponse }>>([]);

  const sampleQuestions = [
    "What was the production in Q4?",
    "Which quarter had the highest efficiency?",
    "How much did production increase from Q2 to Q4?",
    "Why did efficiency improve?",
    "What are the biggest operational problems?",
    "How can we improve production efficiency?",
    "What should management prioritize first?",
    "What happens if machine downtime is reduced by 20%?"
  ];

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    try {
      const res = await sendQuery(q, selectedDocIds.length > 0 ? selectedDocIds : undefined);
      setConversation(prev => [...prev, { q, a: res }]);
      setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            AI Document Analyst
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Multimodal Reasoning
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ask complex operational questions. Every calculation, trend, and recommendation is anchored to verified page evidence.
          </p>
        </div>

        {/* Multi-document filter */}
        {documents.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px]">Scope:</span>
            <button
              onClick={() => setSelectedDocIds([])}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedDocIds.length === 0
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Docs ({documents.length})
            </button>
            {documents.slice(0, 3).map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
                    } else {
                      setSelectedDocIds([...selectedDocIds, doc.id]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium truncate max-w-[140px] transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {doc.filename}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Suggested Operational Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(sq)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-slate-300 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {conversation.map((item, idx) => (
          <div key={idx} className="space-y-4 animate-fade-in">
            {/* User Question Bubble */}
            <div className="flex items-start justify-end space-x-3">
              <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm font-medium shadow-md max-w-xl">
                {item.q}
              </div>
            </div>

            {/* Structured AI Answer Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Card Header & Confidence */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">DocuMind Decision Analysis</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                    item.a.confidence === 'high'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.a.confidence.toUpperCase()} CONFIDENCE
                  </span>
                </div>
              </div>

              {/* Direct Answer */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Answer</h4>
                <div 
                  className="text-base text-slate-100 font-medium leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: item.a.answer.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300 font-semibold">$1</strong>') 
                  }}
                />
              </div>

              {/* Why? Explanation */}
              {item.a.explanation && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Why? (Operational Context)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.a.explanation}
                  </p>
                </div>
              )}

              {/* Calculation Block */}
              {item.a.calculation && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <span>Verified Mathematical Calculation</span>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400 bg-black/40 p-3 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {item.a.calculation}
                  </pre>
                </div>
              )}

              {/* Fact / Inference / Recommendation Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {item.a.facts && item.a.facts.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      FACT
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                      {item.a.facts.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}

                {item.a.inferences && item.a.inferences.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      INFERENCE
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                      {item.a.inferences.map((inf, i) => <li key={i}>{inf}</li>)}
                    </ul>
                  </div>
                )}

                {item.a.recommendations && item.a.recommendations.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                      RECOMMENDATION
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                      {item.a.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Clickable Evidence Citations */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Traceable Page Citations (Click to Verify):
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.a.evidence?.map((ev, eIdx) => (
                    <button
                      key={eIdx}
                      onClick={() => onOpenEvidence(ev.document_name, ev.page_number, ev.snippet, ev.content_type)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-all flex items-center gap-2.5 group shadow-sm"
                    >
                      <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                        {ev.content_type === 'chart' ? (
                          <BarChart3 className="w-3.5 h-3.5" />
                        ) : ev.content_type === 'table' ? (
                          <TableIcon className="w-3.5 h-3.5" />
                        ) : (
                          <FileCheck2 className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                          📄 Page {ev.page_number}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {ev.section}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="sticky bottom-4 pt-2">
        <div className="relative rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 focus-within:border-indigo-500 transition-colors">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask questions about text, tables, or charts... (e.g. 'Why did efficiency improve?')"
            rows={2}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Enter</kbd> to submit, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Shift+Enter</kbd> for newline
            </span>

            <button
              onClick={() => handleAsk()}
              disabled={isLoading || !question.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  Reasoning...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Ask Analyst
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
