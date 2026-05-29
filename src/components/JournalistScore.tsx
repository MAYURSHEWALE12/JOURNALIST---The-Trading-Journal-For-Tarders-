import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
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

function JournalistScore({ trades, themeClasses, isDarkMode }: JournalistScoreProps) {
  const score = useMemo(() => computeJournalistScore(trades), [trades]);

  const radarData = useMemo(() => [
    { metric: 'Win Rate', value: score.winRateScore, fullMark: 100 },
    { metric: 'Profit Factor', value: score.profitFactorScore, fullMark: 100 },
    { metric: 'Risk Mgmt', value: score.riskManagementScore, fullMark: 100 },
    { metric: 'Consistency', value: score.consistencyScore, fullMark: 100 },
    { metric: 'Discipline', value: score.disciplineScore, fullMark: 100 },
  ], [score]);

  if (trades.length < 2) {
    return (
      <div className={`border rounded-xl ${themeClasses.bgPanel} ${themeClasses.border} overflow-hidden`}>
        <div className="px-6 pt-5 pb-4">
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
    <div className={`border rounded-xl ${themeClasses.bgPanel} ${themeClasses.border} overflow-hidden`}>
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            BETA
          </span>
        </div>
        <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] font-mono ${themeClasses.textSub}`}>Journalist Score&trade;</h3>
      </div>

      {/* Score + Level */}
      <div className="px-6 pb-4 flex items-end gap-4">
        <div>
          <div className={`text-5xl font-display font-bold tracking-tight ${levelColors[score.level] || 'text-gray-500'}`}>
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

      {/* Radar Chart */}
      <div className="px-2 h-52 md:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <PolarGrid
              stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
              axisLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', fontSize: 8, fontFamily: 'ui-monospace, monospace' }}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                if (!d) return null;
                return (
                  <div className={`px-3 py-2 rounded-xl text-xs font-mono shadow-xl border min-w-[140px] ${isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{d.payload.metric}</div>
                    <div className={`text-lg font-bold ${d.value >= 70 ? 'text-emerald-500' : d.value >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {d.value}/100
                    </div>
                  </div>
                );
              }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={isDarkMode ? '#818cf8' : '#6366f1'}
              fill={isDarkMode ? '#818cf8' : '#6366f1'}
              fillOpacity={0.1}
              strokeWidth={1.5}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score breakdown */}
      <div className="px-6 pb-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
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
        <div className={`px-6 py-3 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <div className={`text-[9px] font-mono font-semibold uppercase tracking-wider mb-2 ${themeClasses.textSub}`}>Insights</div>
          <div className="space-y-1">
            {score.insights.map((insight, i) => (
              <div key={i} className={`text-[10px] font-mono ${themeClasses.textSub}`}>
                &bull; {insight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { JournalistScore };
export type { JournalistScoreResult };
