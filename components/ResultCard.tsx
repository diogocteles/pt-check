'use client';

import { AnalysisResult, Signal, Confidence, SignalImpact, SignalStrength } from '@/types';

interface Props {
  result: AnalysisResult;
}

// SVG arc gauge — 270° sweep
function ProbabilityGauge({ value }: { value: number }) {
  const radius = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° = 75% of full circle

  const filled = Math.max(0, Math.min(1, value / 100)) * arcLength;

  const color =
    value >= 70 ? '#059669' :
    value >= 40 ? '#d97706' :
    '#94a3b8';

  const textColor =
    value >= 70 ? '#065f46' :
    value >= 40 ? '#92400e' :
    '#475569';

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 140 140">
        {/* Track arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
        />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Percentage label */}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          fill={textColor}
          fontSize="26"
          fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {value}%
        </text>
        <text
          x={cx} y={cy + 14}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="0.05em"
        >
          PROBABILITY
        </text>
      </svg>
    </div>
  );
}

const CONFIDENCE_STYLES: Record<Confidence, { bg: string; text: string; label: string }> = {
  high:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'High confidence' },
  medium: { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Medium confidence' },
  low:    { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Low confidence' },
};

function ConfidenceBadge({ level }: { level: Confidence }) {
  const s = CONFIDENCE_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level === 'high' ? 'bg-emerald-500' : level === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
      {s.label}
    </span>
  );
}

const IMPACT_DOT: Record<SignalImpact, string> = {
  positive: 'bg-emerald-500',
  negative: 'bg-red-500',
  neutral:  'bg-slate-400',
};

const IMPACT_ROW: Record<SignalImpact, string> = {
  positive: 'hover:bg-emerald-50/60',
  negative: 'hover:bg-red-50/60',
  neutral:  'hover:bg-slate-50',
};

const STRENGTH_BADGE: Record<SignalStrength, { bg: string; text: string }> = {
  strong:   { bg: 'bg-slate-100', text: 'text-slate-600' },
  moderate: { bg: 'bg-slate-100', text: 'text-slate-500' },
  weak:     { bg: 'bg-slate-50',  text: 'text-slate-400' },
};

function SignalRow({ signal }: { signal: Signal }) {
  const dot = IMPACT_DOT[signal.impact];
  const row = IMPACT_ROW[signal.impact];
  const badge = STRENGTH_BADGE[signal.strength];

  return (
    <li className={`flex items-start gap-3 py-3 px-1 rounded-lg transition-colors ${row}`}>
      <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-800">{signal.factor}</span>
          <code className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[180px]">
            {signal.rawValue}
          </code>
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
            {signal.strength}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{signal.explanation}</p>
      </div>
    </li>
  );
}

export default function ResultCard({ result }: Props) {
  const { probability, confidence, signals, summary, disclaimer } = result;

  return (
    <div className="mt-6 w-full max-w-lg flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Gauge + summary card */}
      <div className="rounded-2xl p-6 bg-white shadow-sm border border-slate-100 flex flex-col items-center gap-4">
        <ProbabilityGauge value={probability} />
        <ConfidenceBadge level={confidence} />
        <p className="text-center text-slate-600 text-sm leading-relaxed max-w-sm">
          {summary}
        </p>
      </div>

      {/* Signals breakdown card */}
      {signals.length > 0 && (
        <div className="rounded-2xl p-6 bg-white shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Signal breakdown</h2>
            <span className="text-xs text-slate-400">{signals.length} factor{signals.length !== 1 ? 's' : ''} analysed</span>
          </div>
          <ul className="flex flex-col divide-y divide-slate-100">
            {signals.map((signal, i) => (
              <SignalRow key={i} signal={signal} />
            ))}
          </ul>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
            {(['positive', 'neutral', 'negative'] as SignalImpact[]).map(impact => (
              <span key={impact} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${IMPACT_DOT[impact]}`} />
                {impact.charAt(0).toUpperCase() + impact.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center px-4 leading-relaxed pb-4">
        {disclaimer}
      </p>
    </div>
  );
}
