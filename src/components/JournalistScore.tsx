import { useMemo } from 'react';
import { computeJournalistScore, type JournalistScoreResult } from '../lib/journalistScore';
import type { Trade } from '../types';

interface JournalistScoreProps {
  trades: Trade[];
  themeClasses: {
    bgBase: string; bgPanel: string; bgCard: string; bgHover: string;
    border: string; borderActive: string;
    textMain: string; textSub: string; navActive: string;
  };
  isDarkMode: boolean;
  className?: string;
}

const radarMetrics = [
  { key: 'winRateScore', label: 'Win Rate' },
  { key: 'profitFactorScore', label: 'Profit Factor' },
  { key: 'riskManagementScore', label: 'Risk Mgmt' },
  { key: 'consistencyScore', label: 'Consistency' },
  { key: 'disciplineScore', label: 'Discipline' },
] as const;

const levelColors: Record<string, string> = {
  institutional: 'text-emerald-400',
  elite: 'text-emerald-500',
  advanced: 'text-blue-500',
  consistent: 'text-indigo-500',
  developing: 'text-amber-500',
  needsImprovement: 'text-rose-500',
};

const levelBadgeColors: Record<string, string> = {
  institutional: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  elite: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
  advanced: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  consistent: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
  developing: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
  needsImprovement: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
};

// Pure dynamic SVG Radar Chart for maximum reliability and React 19 compatibility
function SvgRadarChart({ data, isDarkMode }: { data: { metric: string; value: number }[]; isDarkMode: boolean }) {
  const center = 100;
  const maxVal = 100;
  const r = 60; // Max radius

  // Calculate points for the 5 axes
  const points = useMemo(() => {
    return data.map((d, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Offset by 90deg to start at top
      const valueRatio = Math.min(d.value / maxVal, 1);
      const x = center + r * valueRatio * Math.cos(angle);
      const y = center + r * valueRatio * Math.sin(angle);
      return { x, y, label: d.metric, angle };
    });
  }, [data]);

  // Polygon path string for the filled area
  const polyPath = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Grid rings (100%, 75%, 50%, 25%)
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[190px] overflow-visible">
        {/* Grid Rings */}
        {gridRings.map((ratio, idx) => {
          const ringPoints = Array.from({ length: 5 }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = center + r * ratio * Math.cos(angle);
            const y = center + r * ratio * Math.sin(angle);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');
          
          return (
            <polygon
              key={`ring-${idx}`}
              points={ringPoints}
              fill="none"
              stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              strokeWidth="0.75"
            />
          );
        })}

        {/* Axis Lines & Labels */}
        {points.map((p, i) => {
          const outerX = center + r * Math.cos(p.angle);
          const outerY = center + r * Math.sin(p.angle);
          
          // Position labels slightly outside the outer point
          const labelDist = r + 15;
          const labelX = center + labelDist * Math.cos(p.angle);
          const labelY = center + labelDist * Math.sin(p.angle);
          
          // Text alignments based on position
          let textAnchor: 'inherit' | 'end' | 'middle' | 'start' = 'middle';
          if (Math.abs(Math.cos(p.angle)) > 0.1) {
            textAnchor = Math.cos(p.angle) > 0 ? 'start' : 'end';
          }

          return (
            <g key={`axis-${i}`}>
              {/* Line */}
              <line
                x1={center}
                y1={center}
                x2={outerX}
                y2={outerY}
                stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="0.75"
              />
              {/* Metric Name Label */}
              <text
                x={labelX}
                y={labelY + 2}
                textAnchor={textAnchor}
                fill={isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'}
                className="text-[7.5px] font-mono select-none"
              >
                {p.label}
              </text>
            </g>
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={polyPath}
          fill={isDarkMode ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.12)'}
          stroke={isDarkMode ? '#818cf8' : '#6366f1'}
          strokeWidth="1.5"
          className="transition-all duration-500"
        />

        {/* Data points (dots on corners) */}
        {points.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={isDarkMode ? '#818cf8' : '#6366f1'}
            className="transition-all duration-500"
          />
        ))}
      </svg>
    </div>
  );
}

function JournalistScore({ trades, themeClasses, isDarkMode, className = '' }: JournalistScoreProps) {
  const score = useMemo(() => computeJournalistScore(trades), [trades]);

  const radarData = useMemo(() => [
    { metric: 'Win Rate', value: score.winRateScore },
    { metric: 'Profit Factor', value: score.profitFactorScore },
    { metric: 'Risk Mgmt', value: score.riskManagementScore },
    { metric: 'Consistency', value: score.consistencyScore },
    { metric: 'Discipline', value: score.disciplineScore },
  ], [score]);

  if (trades.length < 2) {
    return (
      <div className={`border rounded-xl ${themeClasses.bgPanel} ${themeClasses.border} overflow-hidden ${className}`}>
        <div className="px-4 md:px-6 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              BETA
            </span>
          </div>
          <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] font-mono ${themeClasses.textSub}`}>Journalist Score&trade;</h3>
        </div>
        <div className={`flex flex-col items-center justify-center py-12 text-center border-t border-dashed ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <p className={`text-xs font-mono font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Trade more to unlock your score.</p>
          <p className={`text-[10px] font-mono mt-0.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Journalist Score requires at least 2 trades.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl ${themeClasses.bgPanel} ${themeClasses.border} overflow-hidden flex flex-col justify-between ${className}`}>
      <div className="px-4 md:px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            BETA
          </span>
        </div>
        <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] font-mono ${themeClasses.textSub}`}>Journalist Score&trade;</h3>
      </div>

      {/* Score + Level */}
      <div className="px-4 md:px-6 pb-4 flex items-end gap-4">
        <div>
          <div className={`text-4xl md:text-5xl font-display font-bold tracking-tight ${levelColors[score.level] || 'text-gray-500'}`}>
            {score.score}
          </div>
          <div className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${levelBadgeColors[score.level] || ''}`}>
            {score.levelLabel}
          </div>
        </div>
        <div className={`text-[9px] font-mono ${themeClasses.textSub} pb-1`}>
          <div>out of 100</div>
        </div>
      </div>

      {/* Dynamic SVG Radar Chart */}
      <div className="px-2 h-44 md:h-52 lg:h-56 flex items-center justify-center">
        <SvgRadarChart data={radarData} isDarkMode={isDarkMode} />
      </div>

      {/* Score breakdown */}
      <div className="px-4 md:px-6 pb-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {radarMetrics.map(m => {
          const val = score[m.key];
          return (
            <div key={m.key} className="flex items-center justify-between text-[10px] font-mono">
              <span className={themeClasses.textSub}>{m.label}</span>
              <span className={`font-semibold ${val >= 70 ? 'text-emerald-500' : val >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      {score.insights.length > 0 && (
        <div className={`px-4 md:px-6 py-3.5 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <div className={`text-[9px] font-mono font-semibold uppercase tracking-wider mb-2.5 ${themeClasses.textSub}`}>Insights</div>
          <div className="space-y-2">
            {score.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] font-mono leading-relaxed">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">&bull;</span>
                <span className={themeClasses.textSub}>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalistScore;
export type { JournalistScoreResult };
