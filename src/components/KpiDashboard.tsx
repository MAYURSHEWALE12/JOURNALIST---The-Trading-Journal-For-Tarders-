import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import type { Trade } from '../types';
import { computeJournalistScore, type JournalistScoreResult } from '../lib/journalistScore';

interface KpiDashboardProps {
  trades: Trade[];
  computedStats: {
    winRate: number;
    profitFactor: number;
    totalPnl: number;
    averagePnl: number;
    wins: number;
    losses: number;
  };
  themeClasses: {
    bgBase: string; bgPanel: string; bgCard: string; bgHover: string;
    border: string; borderActive: string;
    textMain: string; textSub: string; navActive: string;
  };
  isDarkMode: boolean;
}

type HealthStatus = 'excellent' | 'good' | 'average' | 'needsImprovement';

interface KpiMeta {
  label: string;
  value: string;
  prevValue: string;
  change: number;
  health: HealthStatus;
  benchmark: string;
  tooltip: string;
  insight: string;
  sparklineData?: { v: number }[];
}

function pct(a: number, b: number) {
  if (b === 0) return a > 0 ? 100 : 0;
  return ((a - b) / Math.abs(b)) * 100;
}

function healthLabel(h: HealthStatus) {
  const m: Record<HealthStatus, { label: string; cls: string }> = {
    excellent: { label: 'Excellent', cls: 'text-emerald-500' },
    good: { label: 'Good', cls: 'text-blue-500' },
    average: { label: 'Average', cls: 'text-amber-500' },
    needsImprovement: { label: 'Needs Work', cls: 'text-rose-500' },
  };
  return m[h];
}

function MetricTooltip({ label, tooltip, isDarkMode }: { label: string; tooltip: string; isDarkMode: boolean }) {
  return (
    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-[10px] font-mono shadow-xl border min-w-[200px] z-50 pointer-events-none ${isDarkMode ? 'bg-[#181818] border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
      <div className={`font-semibold mb-1 text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</div>
      <div className="leading-relaxed">{tooltip}</div>
    </div>
  );
}

function MiniSparkline({ data, color }: { data: { v: number }[]; color: string }) {
  if (data.length < 2) return null;
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sparkGrad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sparkGrad_${color.replace('#', '')})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({
  kpi, isDarkMode, themeClasses, icon,
}: {
  kpi: KpiMeta;
  isDarkMode: boolean;
  themeClasses: any;
  icon: React.ReactNode;
}) {
  const health = healthLabel(kpi.health);
  const isUp = kpi.change > 0;
  const isDown = kpi.change < 0;
  return (
    <div className={`group relative border rounded-xl p-5 transition-all duration-200 hover:border-gray-400 ${themeClasses.bgPanel} ${themeClasses.border}`}>
      {/* Tooltip on hover */}
      <div className="absolute top-3 right-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-help z-10">
        <div className="relative">
          <HelpCircle className="w-3.5 h-3.5" />
          <MetricTooltip label={kpi.label} tooltip={kpi.tooltip} isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="flex items-start justify-between mb-2">
        <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${themeClasses.textSub}`}>{kpi.label}</div>
        <div className="shrink-0">{icon}</div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className={`text-2xl font-display font-bold tracking-tight ${themeClasses.textMain}`}>{kpi.value}</div>
          {kpi.sparklineData && kpi.sparklineData.length >= 2 && (
            <div className="mt-1">
              {/* Sparkline hidden on smallest screens */}
            </div>
          )}
        </div>
        {kpi.sparklineData && kpi.sparklineData.length >= 2 && (
          <MiniSparkline data={kpi.sparklineData} color={kpi.health === 'needsImprovement' ? '#ef4444' : '#22c55e'} />
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] font-mono">
        {isUp && <TrendingUp className="w-3 h-3 text-emerald-500" />}
        {isDown && <TrendingDown className="w-3 h-3 text-rose-500" />}
        {!isUp && !isDown && <Minus className="w-3 h-3 text-gray-400" />}
        <span className={isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-gray-400'}>
          {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
        </span>
        <span className={themeClasses.textSub}>vs prev period</span>
      </div>

      <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono">
        <span className={`text-[9px] font-semibold uppercase tracking-wider ${health.cls}`}>{health.label}</span>
        <span className={`text-[9px] ${themeClasses.textSub}`}>| Bench: {kpi.benchmark}</span>
      </div>

      <div className={`mt-1.5 text-[9px] font-mono leading-relaxed ${themeClasses.textSub}`}>
        {kpi.insight}
      </div>
    </div>
  );
}

export default function KpiDashboard({ trades, computedStats, themeClasses, isDarkMode }: KpiDashboardProps) {
  const score: JournalistScoreResult = useMemo(() => computeJournalistScore(trades), [trades]);

  const { kpis, summary, scoreContrib } = useMemo(() => {
    const total = trades.length;
    if (total === 0) {
      return {
        kpis: [] as KpiMeta[],
        summary: [] as string[],
        scoreContrib: [] as { label: string; pct: number; score: number }[],
      };
    }

    const wins = trades.filter(t => t.status === 'WIN');
    const losses = trades.filter(t => t.status === 'LOSS');
    const winCount = wins.length;
    const lossCount = losses.length;
    const totalPnl = computedStats.totalPnl;
    const avgPnl = totalPnl / total;

    const grossWins = wins.reduce((s, t) => s + t.netPnl, 0);
    const grossLosses = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
    const pf = computedStats.profitFactor;

    const avgWin = winCount > 0 ? grossWins / winCount : 0;
    const avgLoss = lossCount > 0 ? grossLosses / lossCount : 0;

    const expectancy = winCount > 0 && lossCount > 0
      ? ((winCount / total) * avgWin) - ((lossCount / total) * avgLoss)
      : avgPnl;

    const avgRMultiple = trades.filter(t => t.plannedR > 0).reduce((s, t) => s + (t.realizedR / t.plannedR), 0) / Math.max(1, trades.filter(t => t.plannedR > 0).length);

    const holdingTimes = trades.filter(t => t.entryTime && t.exitTime).map(t => {
      const e = new Date(t.entryTime).getTime();
      const x = new Date(t.exitTime).getTime();
      return (x - e) / (1000 * 60 * 60);
    });
    const avgHoldingHours = holdingTimes.length > 0 ? holdingTimes.reduce((s, v) => s + v, 0) / holdingTimes.length : 0;

    const sortedByDate = [...trades].sort((a, b) => a.entryTime.localeCompare(b.entryTime));
    let running = 0;
    let peak = 0;
    let maxDrawdown = 0;
    const equityPoints: { v: number }[] = [{ v: 0 }];
    for (const t of sortedByDate) {
      running += t.netPnl;
      equityPoints.push({ v: Math.max(running, 0) });
      if (running > peak) peak = running;
      const dd = peak - running;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    const recoveryFactor = maxDrawdown > 0 ? totalPnl / maxDrawdown : totalPnl > 0 ? 3 : 0;

    const dailyPnl: number[] = [];
    const dayMap = new Map<string, number>();
    for (const t of trades) {
      const day = t.entryTime.slice(0, 10);
      dayMap.set(day, (dayMap.get(day) || 0) + t.netPnl);
    }
    for (const p of dayMap.values()) dailyPnl.push(p);

    const bestDay = dailyPnl.length > 0 ? Math.max(...dailyPnl) : 0;
    const worstDay = dailyPnl.length > 0 ? Math.min(...dailyPnl) : 0;

    // Split history for trend analysis (first half vs second half)
    const mid = Math.floor(sortedByDate.length / 2);
    const firstHalf = sortedByDate.slice(0, mid);
    const secondHalf = sortedByDate.slice(mid);

    const pnl1 = firstHalf.reduce((s, t) => s + t.netPnl, 0);
    const pnl2 = secondHalf.reduce((s, t) => s + t.netPnl, 0);
    const winRate1 = firstHalf.length > 0 ? (firstHalf.filter(t => t.status === 'WIN').length / firstHalf.length) * 100 : 0;
    const winRate2 = secondHalf.length > 0 ? (secondHalf.filter(t => t.status === 'WIN').length / secondHalf.length) * 100 : 0;

    const sharpeRatio = (() => {
      if (dailyPnl.length < 5) return 0;
      const mean = dailyPnl.reduce((s, v) => s + v, 0) / dailyPnl.length;
      const sqDiffs = dailyPnl.map(v => (v - mean) ** 2);
      const variance = sqDiffs.reduce((s, v) => s + v, 0) / (dailyPnl.length - 1);
      const sd = Math.sqrt(variance);
      if (sd === 0) return 0;
      return (mean / sd) * Math.sqrt(252);
    })();

    function makeKpi(
      label: string,
      value: string,
      prevValue: string,
      change: number,
      health: HealthStatus,
      benchmark: string,
      tooltip: string,
      insight: string,
      sparklineData?: { v: number }[],
    ): KpiMeta {
      return { label, value, prevValue, change, health, benchmark, tooltip, insight, sparklineData };
    }

    const pnLData = sortedByDate.reduce((acc: { v: number }[], t) => {
      const last = acc.length > 0 ? acc[acc.length - 1].v : 0;
      acc.push({ v: last + t.netPnl });
      return acc;
    }, [] as { v: number }[]);

    const kpis: KpiMeta[] = [
      makeKpi(
        'Net P&L',
        `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}`,
        `$${pnl1.toFixed(0)}`,
        pct(pnl2, pnl1),
        totalPnl > 0 ? (pf >= 2 ? 'excellent' : 'good') : 'needsImprovement',
        'Positive',
        'Total profit or loss across all closed trades.',
        totalPnl > 0 ? `Profitable across ${total} trades.` : 'Focus on cutting losses to improve.',
        pnLData,
      ),
      makeKpi(
        'Win Rate',
        `${computedStats.winRate}%`,
        `${Math.round(winRate1)}%`,
        winRate2 - winRate1,
        computedStats.winRate >= 60 ? 'excellent' : computedStats.winRate >= 45 ? 'good' : computedStats.winRate >= 35 ? 'average' : 'needsImprovement',
        '50%',
        'Percentage of trades that were profitable.',
        computedStats.winRate >= 50 ? 'Above breakeven threshold.' : 'Consider reviewing entry criteria.',
        dailyPnl.map(v => ({ v: v > 0 ? v : 0 })),
      ),
      makeKpi(
        'Profit Factor',
        pf.toFixed(2),
        '—',
        0,
        pf >= 2.5 ? 'excellent' : pf >= 1.5 ? 'good' : pf >= 1 ? 'average' : 'needsImprovement',
        '2.0',
        'Gross profit divided by gross loss. Measures how much you earn per dollar risked.',
        pf >= 2 ? 'Your profitability exceeds professional benchmarks.' : pf >= 1 ? 'Profitable but room for improvement.' : 'Outflows exceed inflows.',
      ),
      makeKpi(
        'Trade Expectancy',
        `${expectancy >= 0 ? '+' : ''}$${expectancy.toFixed(0)}`,
        `$${(firstHalf.length > 0 ? firstHalf.reduce((s, t) => s + t.netPnl, 0) / firstHalf.length : 0).toFixed(0)}`,
        pct(
          secondHalf.length > 0 ? secondHalf.reduce((s, t) => s + t.netPnl, 0) / secondHalf.length : 0,
          firstHalf.length > 0 ? firstHalf.reduce((s, t) => s + t.netPnl, 0) / firstHalf.length : 0,
        ),
        expectancy > 0 ? 'excellent' : 'needsImprovement',
        '> $0',
        'Average expected P&L per trade. Positive expectancy means the strategy is profitable over time.',
        expectancy > 0 ? `Each trade generates avg +$${expectancy.toFixed(0)}.` : `Each trade loses $${Math.abs(expectancy).toFixed(0)} on average.`,
      ),
    ];

    const additionalKpis: KpiMeta[] = [
      makeKpi(
        'Avg R Multiple',
        avgRMultiple.toFixed(2),
        '—',
        0,
        avgRMultiple >= 1.5 ? 'excellent' : avgRMultiple >= 1 ? 'good' : 'needsImprovement',
        '1.5R',
        'Average realized R divided by planned R. Measures reward relative to risk.',
        avgRMultiple >= 1.5 ? 'Your average reward exceeds risk targets.' : 'Aim for at least 1.5R average.',
      ),
      makeKpi(
        'Avg Holding Time',
        avgHoldingHours >= 24 ? `${(avgHoldingHours / 24).toFixed(1)}d` : `${avgHoldingHours.toFixed(1)}h`,
        '—',
        0,
        'average' as HealthStatus,
        '—',
        'Average duration a position is held before closing.',
        holdingTimes.length > 0 ? `Average hold time of ${avgHoldingHours >= 24 ? (avgHoldingHours / 24).toFixed(1) + ' days' : avgHoldingHours.toFixed(1) + ' hours'}.` : 'No exit time data available.',
      ),
      makeKpi(
        'Largest Drawdown',
        `-$${maxDrawdown.toFixed(0)}`,
        '—',
        0,
        maxDrawdown <= Math.abs(totalPnl) * 0.3 ? 'excellent' : maxDrawdown <= Math.abs(totalPnl) * 0.5 ? 'average' : 'needsImprovement',
        '< 30%',
        'Maximum peak-to-trough decline in equity curve.',
        maxDrawdown > 0 ? `Peak drawdown of -$${maxDrawdown.toFixed(0)}.` : 'No drawdown recorded.',
      ),
      makeKpi(
        'Recovery Factor',
        recoveryFactor.toFixed(2),
        '—',
        0,
        recoveryFactor >= 2 ? 'excellent' : recoveryFactor >= 1 ? 'good' : 'average',
        '2.0',
        'Net profit divided by maximum drawdown. Measures how well you recover from losses.',
        recoveryFactor >= 2 ? 'Strong recovery ability.' : 'Work on recovering from drawdowns.',
      ),
      makeKpi(
        'Sharpe Ratio (simplified)',
        sharpeRatio.toFixed(2),
        '—',
        0,
        sharpeRatio >= 1.5 ? 'excellent' : sharpeRatio >= 1 ? 'good' : sharpeRatio >= 0.5 ? 'average' : 'needsImprovement',
        '1.0',
        'Risk-adjusted return. Higher values indicate better returns per unit of risk.',
        sharpeRatio >= 1 ? 'Good risk-adjusted returns.' : 'Consider reducing volatility.',
      ),
      makeKpi(
        'Best Day',
        `+$${bestDay.toFixed(0)}`,
        '—',
        0,
        'excellent',
        '—',
        'Highest single-day P&L.',
        bestDay > 0 ? `Best day: +$${bestDay.toFixed(0)}.` : 'No profitable days yet.',
      ),
      makeKpi(
        'Worst Day',
        `$${worstDay.toFixed(0)}`,
        '—',
        0,
        Math.abs(worstDay) <= Math.abs(bestDay) * 0.5 ? 'good' : 'average',
        '—',
        'Lowest single-day P&L.',
        worstDay < 0 ? `Worst day: $${worstDay.toFixed(0)}.` : 'No losing days recorded.',
      ),
    ];

    // Score contribution
    const scoreContrib = [
      { label: 'Win Rate', score: score.winRateScore, pct: (score.winRateScore * 0.25) / (score.score || 1) * 100 },
      { label: 'Profit Factor', score: score.profitFactorScore, pct: (score.profitFactorScore * 0.25) / (score.score || 1) * 100 },
      { label: 'Risk Management', score: score.riskManagementScore, pct: (score.riskManagementScore * 0.20) / (score.score || 1) * 100 },
      { label: 'Consistency', score: score.consistencyScore, pct: (score.consistencyScore * 0.15) / (score.score || 1) * 100 },
      { label: 'Discipline', score: score.disciplineScore, pct: (score.disciplineScore * 0.15) / (score.score || 1) * 100 },
    ];

    // Summary insights
    const summary: string[] = [];
    const bestMetric = [...scoreContrib].sort((a, b) => b.pct - a.pct)[0];
    const worstMetric = [...scoreContrib].sort((a, b) => a.pct - b.pct)[0];

    if (totalPnl > 0) {
      summary.push(`Profitability ${pnl2 > pnl1 ? 'improved' : 'declined'} compared to the previous period.`);
    } else {
      summary.push('Overall profitability is negative. Review your risk management strategy.');
    }
    if (bestMetric) summary.push(`Your strongest scoring area is ${bestMetric.label} (${Math.round(bestMetric.pct)}% contribution).`);
    if (worstMetric && worstMetric.score < 70) summary.push(`${worstMetric.label} needs attention (${Math.round(worstMetric.pct)}% contribution).`);
    if (pf >= 2) summary.push('Profit Factor exceeds professional trader benchmarks.');
    if (avgRMultiple >= 1.5) summary.push('Your average R multiple indicates strong risk-reward execution.');
    if (sharpeRatio >= 1) summary.push('Risk-adjusted returns are solid.');

    return { kpis: [...kpis, ...additionalKpis], summary, scoreContrib };
  }, [trades, computedStats, score]);

  if (trades.length === 0) {
    return (
      <div className={`border rounded-xl p-8 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className={`text-sm font-mono font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add trades to see KPI analytics.</p>
        </div>
      </div>
    );
  }

  const primaryKpis = kpis.slice(0, 4);
  const secondaryKpis = kpis.slice(4);

  return (
    <div className="space-y-6">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryKpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            kpi={kpi}
            isDarkMode={isDarkMode}
            themeClasses={themeClasses}
            icon={
              i === 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> :
              i === 1 ? <TrendingUp className="w-4 h-4 text-blue-500" /> :
              i === 2 ? <TrendingUp className="w-4 h-4 text-indigo-500" /> :
              <TrendingUp className="w-4 h-4 text-amber-500" />
            }
          />
        ))}
      </div>

      {/* Score Contribution + Summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Contribution */}
        <div className={`border rounded-xl p-5 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider mb-3 ${themeClasses.textSub}`}>
            Journalist Score &bull; {score.score}/100
          </div>
          <div className="space-y-2">
            {scoreContrib.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-[10px] font-mono mb-0.5">
                  <span className={themeClasses.textSub}>{s.label}</span>
                  <span className={`font-semibold ${s.score >= 70 ? 'text-emerald-500' : s.score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {s.score} ({Math.round(s.pct)}%)
                  </span>
                </div>
                <div className={`h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      s.score >= 70 ? 'bg-emerald-500' : s.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className={`lg:col-span-2 border rounded-xl p-5 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider mb-3 ${themeClasses.textSub}`}>
            Performance Summary
          </div>
          <div className="space-y-1.5">
            {summary.map((s, i) => (
              <div key={i} className={`text-[11px] font-mono leading-relaxed ${themeClasses.textSub}`}>
                &bull; {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryKpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            kpi={kpi}
            isDarkMode={isDarkMode}
            themeClasses={themeClasses}
            icon={<TrendingUp className="w-4 h-4 text-gray-400" />}
          />
        ))}
      </div>
    </div>
  );
}
