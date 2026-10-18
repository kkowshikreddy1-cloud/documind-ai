import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * A small, real-looking slice of the demo report with a question and answer on
 * top of it. Picking a question turns to the page that answers it and the
 * cited passage gets highlighted, the same thing the Evidence Drawer does in
 * the app. All figures below are copied from the bundled demo report
 * (backend/demo_data/Global_Operations_Report_2025.pdf).
 */

const Hl: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) => (
  <span className="hl" data-on={on}>
    {children}
  </span>
);

interface PageProps {
  lit: boolean;
}

const PRODUCTION_ROWS = [
  { quarter: 'Q1 2025', target: '10,000', actual: '9,500', variance: '−500', fulfillment: '95.0%', mark: false },
  { quarter: 'Q2 2025', target: '10,200', actual: '10,000', variance: '−200', fulfillment: '98.0%', mark: true },
  { quarter: 'Q3 2025', target: '11,500', actual: '11,800', variance: '+300', fulfillment: '102.6%', mark: false },
  { quarter: 'Q4 2025', target: '12,200', actual: '13,000', variance: '+800', fulfillment: '106.5%', mark: true },
];

const ProductionPage: React.FC<PageProps> = ({ lit }) => (
  <>
    <h3 className="text-[22px] font-semibold leading-tight">Quarterly Production Breakdown</h3>
    <p className="mt-0.5 text-[13px] italic text-ink/60">Unit volumes, targets, and line distribution</p>
    <table className="mt-4 w-full text-[13px] tabular-nums">
      <thead>
        <tr className="border-b border-ink/30 text-left text-ink/60">
          <th className="py-1 font-medium">Quarter</th>
          <th className="py-1 text-right font-medium">Target</th>
          <th className="py-1 text-right font-medium">Actual</th>
          <th className="py-1 text-right font-medium">Variance</th>
          <th className="py-1 text-right font-medium">Fulfillment</th>
        </tr>
      </thead>
      <tbody>
        {PRODUCTION_ROWS.map((row) => (
          <tr key={row.quarter} className="border-b border-ink/10">
            <td className="py-1">{row.quarter}</td>
            <td className="py-1 text-right">{row.target}</td>
            <td className="py-1 text-right">{row.mark ? <Hl on={lit}>{row.actual}</Hl> : row.actual}</td>
            <td className="py-1 text-right">{row.variance}</td>
            <td className="py-1 text-right">{row.fulfillment}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="mt-4 text-[13px] leading-relaxed">
      <span className="font-semibold">Auditor note: </span>
      <Hl on={lit}>
        Q4 production of 13,000 units represents a 3,000-unit increase (+30.0%) compared to Q2 output of 10,000 units.
      </Hl>{' '}
      Production fulfillment accelerated by 8.5 percentage points between Q2 and Q4.
    </p>
  </>
);

const EFFICIENCY = [
  { label: 'Q1', value: 78, note: 'Baseline prior to automation initiatives' },
  { label: 'Q2', value: 82, note: 'Early commissioning phase of robotic cells' },
  { label: 'Q3', value: 88, note: 'Integration post-training graduation' },
  { label: 'Q4', value: 94, note: 'Full operational stabilization — peak performance' },
];

const EfficiencyPage: React.FC<PageProps> = ({ lit }) => (
  <>
    <h3 className="text-[22px] font-semibold leading-tight">Production Efficiency Analysis</h3>
    <p className="mt-0.5 text-[13px] italic text-ink/60">Quarterly operational efficiency benchmark (%)</p>
    <div className="mt-4 flex h-[72px] items-end gap-3 border-b border-ink/30 px-1" aria-hidden="true">
      {EFFICIENCY.map((q, i) => {
        const peak = i === EFFICIENCY.length - 1;
        return (
          <div key={q.label} className="flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t-[2px] transition-colors duration-700"
              style={{
                height: `${((q.value - 60) / 40) * 64}px`,
                backgroundColor: peak && lit ? '#ffd60a' : 'rgba(19, 26, 51, 0.22)',
              }}
            />
          </div>
        );
      })}
    </div>
    <div className="mt-1 flex gap-3 px-1 text-[12px] tabular-nums text-ink/60" aria-hidden="true">
      {EFFICIENCY.map((q) => (
        <span key={q.label} className="flex-1 text-center">
          {q.label} ({q.value}%)
        </span>
      ))}
    </div>
    <ul className="mt-3 space-y-1 text-[13px] leading-snug">
      {EFFICIENCY.map((q, i) => {
        const text = `${q.label}: ${q.value}% (${q.note})`;
        return <li key={q.label}>{i === EFFICIENCY.length - 1 ? <Hl on={lit}>{text}</Hl> : text}</li>;
      })}
    </ul>
  </>
);

const CAUSES = [
  { label: 'Bearing Fatigue', share: 58 },
  { label: 'Setup Delays', share: 23 },
  { label: 'Sensor Faults', share: 12 },
  { label: 'Misc', share: 7 },
];

const DowntimePage: React.FC<PageProps> = ({ lit }) => (
  <>
    <h3 className="text-[22px] font-semibold leading-tight">Machine Downtime &amp; Equipment Reliability</h3>
    <p className="mt-0.5 text-[13px] italic text-ink/60">Root cause analysis and unplanned stoppages</p>
    <p className="mt-3 text-[13px] leading-relaxed">
      Unplanned equipment stoppage averages 18.0 hours per month across the assembly facility.
    </p>
    <div className="mt-3 space-y-1.5" aria-hidden="true">
      {CAUSES.map((c, i) => (
        <div key={c.label} className="flex items-center gap-3 text-[12px] tabular-nums">
          <span className="w-[104px] shrink-0 text-ink/70">{c.label}</span>
          <div className="h-3 flex-1 rounded-[2px] bg-ink/[0.06]">
            <div
              className="h-full rounded-[2px] transition-colors duration-700"
              style={{
                width: `${c.share}%`,
                backgroundColor: i === 0 && lit ? '#ffd60a' : 'rgba(19, 26, 51, 0.28)',
              }}
            />
          </div>
          <span className="w-8 text-right text-ink/70">{c.share}%</span>
        </div>
      ))}
    </div>
    <p className="mt-3 text-[13px] leading-relaxed">
      <Hl on={lit}>
        Bearing and spindle fatigue in Line 2 account for 10.4 hours/month (57.8% of all recorded line stops).
      </Hl>{' '}
      Adopting scheduled predictive maintenance could potentially recover 3.6 hours/month under a 20% downtime
      reduction scenario.
    </p>
  </>
);

interface Scenario {
  id: string;
  question: string;
  answer: string;
  page: number;
  pageTitle: string;
  Page: React.FC<PageProps>;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'growth',
    question: 'How much did production increase from Q2 to Q4?',
    answer: '13,000 − 10,000 = +3,000 units, a 30% increase.',
    page: 2,
    pageTitle: 'Quarterly Production Breakdown',
    Page: ProductionPage,
  },
  {
    id: 'efficiency',
    question: 'Which quarter had the highest efficiency?',
    answer: 'Q4, at 94%. That is 16 percentage points above Q1’s 78%.',
    page: 3,
    pageTitle: 'Production Efficiency Analysis',
    Page: EfficiencyPage,
  },
  {
    id: 'downtime',
    question: 'What causes most unplanned downtime?',
    answer: 'Bearing and spindle fatigue in Line 2: 10.4 of 18.0 hours per month (57.8%).',
    page: 4,
    pageTitle: 'Machine Downtime & Equipment Reliability',
    Page: DowntimePage,
  },
];

const TYPE_DELAY_FIRST = 600;
const TYPE_DELAY_NEXT = 380;
const TYPE_SPEED = 22;

export const EvidenceStage: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [lit, setLit] = useState(false);
  const [firstRun, setFirstRun] = useState(true);

  const scenario = SCENARIOS[index];
  const finished = typed >= scenario.answer.length;

  // Type the answer, then sweep the highlight across the cited passage.
  useEffect(() => {
    const { answer } = scenario;
    setLit(false);

    if (reduceMotion) {
      setTyped(answer.length);
      setLit(true);
      return;
    }

    setTyped(0);
    let ticker: number | undefined;
    let sweep: number | undefined;

    const start = window.setTimeout(
      () => {
        let n = 0;
        ticker = window.setInterval(() => {
          n += 1;
          setTyped(n);
          if (n >= answer.length) {
            window.clearInterval(ticker);
            sweep = window.setTimeout(() => setLit(true), 260);
          }
        }, TYPE_SPEED);
      },
      firstRun ? TYPE_DELAY_FIRST : TYPE_DELAY_NEXT,
    );

    return () => {
      window.clearTimeout(start);
      if (ticker !== undefined) window.clearInterval(ticker);
      if (sweep !== undefined) window.clearTimeout(sweep);
    };
    // firstRun only changes the initial delay, so it is not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduceMotion]);

  const choose = (i: number) => {
    if (i === index) return;
    setFirstRun(false);
    setIndex(i);
  };

  const replayHighlight = () => {
    setLit(false);
    window.setTimeout(() => setLit(true), reduceMotion ? 0 : 90);
  };

  return (
    <div className="w-full max-w-[580px]">
      {/* The report page, with two more sheets peeking out underneath */}
      <div className="relative pb-3 pr-3">
        <div className="absolute bottom-0 left-3 right-0 top-3 rounded-[3px] bg-paper/45" />
        <div className="absolute bottom-1.5 left-1.5 right-1.5 top-1.5 rounded-[3px] bg-paper/75" />
        <div className="relative grid rounded-[3px] bg-paper font-paper text-ink shadow-[0_30px_60px_-24px_rgba(0,0,0,0.75)]">
          {SCENARIOS.map((s, i) => (
            <div
              key={s.id}
              aria-hidden={i !== index}
              className={`px-8 pb-10 pt-7 transition-opacity duration-300 [grid-area:1/1] ${
                i === index ? 'opacity-100' : 'pointer-events-none select-none opacity-0'
              }`}
            >
              <s.Page lit={i === index && lit} />
            </div>
          ))}
          <span className="absolute bottom-3 right-5 text-[11px] text-ink/50">Page {scenario.page}</span>
        </div>
      </div>

      {/* Questions */}
      <div role="radiogroup" aria-label="Sample questions" className="mt-6 flex flex-wrap gap-2">
        {SCENARIOS.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(i)}
              className={`rounded-full border px-3.5 py-1.5 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1020] ${
                active
                  ? 'border-indigo-400/70 bg-indigo-500/15 text-indigo-100'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {s.question}
            </button>
          );
        })}
      </div>

      {/* Answer and its citation */}
      <div className={compact ? 'mt-4 min-h-[6.5rem]' : 'mt-5 min-h-[7.25rem]'}>
        <div className="flex items-start gap-3">
          <span className="mt-[5px] shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
            Fact
          </span>
          <p className="text-[19px] leading-snug text-slate-100" aria-hidden="true">
            {scenario.answer.slice(0, typed)}
          </p>
          <p className="sr-only" aria-live="polite">
            {finished ? `${scenario.answer} Source: page ${scenario.page}, ${scenario.pageTitle}.` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={replayHighlight}
          aria-label={`Show the source on page ${scenario.page}: ${scenario.pageTitle}`}
          className={`mt-3 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-[13px] text-slate-300 transition-all hover:border-indigo-400/60 hover:text-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            finished ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
          }`}
          tabIndex={finished ? 0 : -1}
        >
          <FileText className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
          Page {scenario.page}: {scenario.pageTitle}
        </button>
      </div>

      {!compact && (
        <p className="mt-4 text-xs text-slate-500">Sample from the demo report, AeroTech Global Manufacturing Corp, Fiscal 2025.</p>
      )}
    </div>
  );
};
