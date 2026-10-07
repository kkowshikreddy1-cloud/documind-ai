import React, { useEffect, useState } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  AlertCircle, 
  ChevronRight, 
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  ListTodo
} from 'lucide-react';
import { RecommendationItem, ActionPlanTask } from '../types';
import { fetchRecommendations, fetchActionPlans, updateActionPlanStatus } from '../services/api';

interface RecommendationsViewProps {
  onOpenEvidence: (docName: string, pageNum: number, snippet: string, type: 'chart' | 'table' | 'text') => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ onOpenEvidence }) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlanTask[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchRecommendations().then(setRecommendations).catch(console.error);
    fetchActionPlans().then(setActionPlans).catch(console.error);
  };

  const handleStatusChange = async (planId: string, currentStatus: string) => {
    const nextStatus = 
      currentStatus === 'not_started' ? 'in_progress' :
      currentStatus === 'in_progress' ? 'completed' : 'not_started';

    try {
      await updateActionPlanStatus(planId, nextStatus);
      setActionPlans(prev => prev.map(p => p.id === planId ? { ...p, status: nextStatus as any } : p));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: AI Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Evidence-Backed Recommendations
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                AI-GENERATED
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Synthesized from operational vulnerabilities, defect logs, and efficiency metrics across your documents.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-0.5">
                    Identified Bottleneck
                  </span>
                  <p className="font-semibold text-rose-200">{rec.problem}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Proposed Action
                  </span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                    {rec.recommendation}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Operational Rationale
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                    Potential Impact
                  </span>
                  <p className="text-slate-300 font-medium">{rec.potential_impact}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate max-w-[150px] font-mono text-[11px]">{rec.evidence}</span>
                <button
                  onClick={() => onOpenEvidence('Global_Operations_Report_2025.pdf', 4, rec.reason, 'chart')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-[11px]"
                >
                  Verify Source <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Interactive Action Plan Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-400" />
              Decision Support Action Plan
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Convert AI recommendations into prioritized executable management tasks. Click status to cycle states.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Action Item</th>
                <th className="py-3.5 px-4">Driver / Reason</th>
                <th className="py-3.5 px-4">Source Evidence</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {actionPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      plan.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                      plan.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {plan.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-xs">
                    {plan.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-sm">
                    {plan.reason}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    <button
                      onClick={() => onOpenEvidence('Global_Operations_Report_2025.pdf', 4, plan.reason, 'chart')}
                      className="hover:text-indigo-300 text-left underline underline-offset-2"
                    >
                      {plan.evidence}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleStatusChange(plan.id, plan.status)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-sm ${
                        plan.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : plan.status === 'in_progress'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {plan.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {plan.status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                      {plan.status === 'not_started' && <CircleDot className="w-3.5 h-3.5 text-slate-500" />}
                      <span className="capitalize">{plan.status.replace('_', ' ')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
