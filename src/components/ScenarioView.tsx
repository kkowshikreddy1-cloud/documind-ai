import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Layers, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { ScenarioResult } from '../types';
import { runScenarioSimulation } from '../services/api';

export const ScenarioView: React.FC = () => {
  const [downtimeReduction, setDowntimeReduction] = useState<number>(20);
  const [baselineDowntime, setBaselineDowntime] = useState<number>(18.0);
  const [unitsPerHour, setUnitsPerHour] = useState<number>(75.0);
  const [hourlyCost, setHourlyCost] = useState<number>(450.0);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  useEffect(() => {
    runScenarioSimulation({
      baseline_downtime_hours: baselineDowntime,
      reduction_percentage: downtimeReduction,
      units_per_hour: unitsPerHour,
      hourly_operating_cost: hourlyCost,
    })
      .then(setResult)
      .catch(console.error);
  }, [downtimeReduction, baselineDowntime, unitsPerHour, hourlyCost]);

  const chartData = result ? [
    {
      name: 'Monthly Downtime (Hrs)',
      Baseline: result.baseline_downtime_hours,
      Projected: result.projected_downtime_hours,
    },
    {
      name: 'Recovered Capacity (Hrs)',
      Baseline: 0,
      Projected: result.recovered_hours_monthly,
    }
  ] : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-indigo-400" />
          Scenario Lab (What-If Simulation)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform sensitivity analysis on document metrics. Model how reducing downtime bottlenecks impacts annual throughput and recovered costs.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sliders Control Panel (5 Cols) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Simulation Parameters</span>
            <span className="text-[10px] text-indigo-400 font-mono">Interactive</span>
          </h3>

          {/* Slider 1: Downtime Reduction % */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-200">Reduce Downtime by</label>
              <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {downtimeReduction}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={downtimeReduction}
              onChange={(e) => setDowntimeReduction(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Status Quo)</span>
              <span>25% Target</span>
              <span>50% Max</span>
            </div>
          </div>

          {/* Parameter 2: Baseline Downtime */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300">Baseline Monthly Downtime</label>
              <span className="font-mono text-slate-200 font-semibold">{baselineDowntime} hrs/mo</span>
            </div>
            <p className="text-[10px] text-slate-500">Source: Page 4 Machine Downtime Analysis</p>
          </div>

          {/* Parameter 3: Production Cadence */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300">Production Rate (Primary Assembly)</label>
              <span className="font-mono text-slate-200 font-semibold">{unitsPerHour} units/hr</span>
            </div>
            <p className="text-[10px] text-slate-500">Source: Page 2 Assembly Run Cadence</p>
          </div>

          {/* Parameter 4: Operating Cost */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300">Hourly Operating Stoppage Cost</label>
              <span className="font-mono text-slate-200 font-semibold">${hourlyCost}/hr</span>
            </div>
            <p className="text-[10px] text-slate-500">Includes direct labor and machine overhead</p>
          </div>

          {/* Disclaimer Alert */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Scenario estimate — not a guaranteed prediction.</strong> Projections are calculated directly using documented baselines.
            </span>
          </div>
        </div>

        {/* Projected Impact & Visualization (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Key Metric Cards */}
          {result && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                  Recovered Machine Time
                </span>
                <p className="text-2xl font-bold font-mono text-indigo-300">
                  +{result.recovered_hours_monthly} <span className="text-xs text-slate-400">hrs/mo</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Annualized: +{result.recovered_hours_annual} hours
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Potential Added Output
                </span>
                <p className="text-2xl font-bold font-mono text-emerald-300">
                  +{result.incremental_units_monthly.toLocaleString()} <span className="text-xs text-slate-400">units/mo</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Annualized: +{result.incremental_units_annual.toLocaleString()} units
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                  Monthly Cost Avoidance
                </span>
                <p className="text-2xl font-bold font-mono text-violet-300">
                  ${result.estimated_cost_savings_monthly.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">Direct labor & idle machinery</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                  Annualized Financial Impact
                </span>
                <p className="text-2xl font-bold font-mono text-teal-300">
                  ${result.estimated_cost_savings_annual.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">Total recovery over 12 months</p>
              </div>
            </div>
          )}

          {/* Recharts Comparison Chart */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Downtime Hours: Baseline vs. Projected Scenario
            </h3>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Baseline" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Projected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
