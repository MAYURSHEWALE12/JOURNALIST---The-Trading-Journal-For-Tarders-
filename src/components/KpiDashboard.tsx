import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, HelpCircle, Activity, Award, ShieldAlert, Zap } from 'lucide-react';
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
  const m: Record<HealthStatus, { label: string; cls: string; dot: string }> = {
    excellent: { label: 'Excellent', cls: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5', dot: 'bg-emerald-500 animate-pulse' },
    good: { label: 'Good', cls: 'text-sky-500 border-sky-500/20 bg-sky-500/5', dot: 'bg-sky-500' },
    average: { label: 'Average', cls: 'text-amber-500 border-amber-500/20 bg-amber-500/5', dot: 'bg-amber-500' },
    needsImprovement: { label: 'Needs Work', cls: 'text-rose-500 border-rose-500/20 bg-rose-500/5', dot: 'bg-rose-500 animate-ping' },
  };
  return m[h];
}

function MetricTooltip({ label, tooltip, isDarkMode }: { label: string; tooltip: string; isDarkMode: boolean }) {
  const parts = tooltip.split('|');
  const formula = parts[0]?.trim();
  const whatItIs = parts[1]?.trim();
  const whyItMatters = parts[2]?.trim();

  return (
    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-4 rounded-xl text-[10px] font-sans shadow-2xl border min-w-[240px] max-w-[275px] z-50 pointer-events-none transition-all duration-200 backdrop-blur-md leading-relaxed ${
      isDarkMode 
        ? 'bg-black/95 border-white/[0.08] text-gray-300' 
        : 'bg-white/95 border-black/[0.08] text-gray-600'
    }`}>
      <div className={`font-display font-bold text-xs mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</div>
      {formula && (
        <div className="mb-2">
          <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500 block mb-0.5">Formula</span>
          <code className={`px-1.5 py-0.5 rounded font-mono text-[9px] block truncate ${isDarkMode ? 'bg-white/5 text-gray-200' : 'bg-black/5 text-gray-800'}`}>
            {formula}
          </code>
        </div>
      )}
      {whatItIs && (
        <div className="mb-2">
          <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500 block mb-0.5">Calculation</span>
          {whatItIs}
        </div>
      )}
      {whyItMatters && (
        <div>
          <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500 block mb-0.5">Why it matters</span>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{whyItMatters}</span>
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ data, color }: { data: { v: number }[]; color: string }) {
  if (data.length < 2) return null;
  return (
    <div className="h-8 w-20 shrink-0">
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

function ProgressArc({ value, max = 3 }: { value: number; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 16;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="shrink-0 animate-pulse">
      <circle stroke="currentColor" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} r={normalizedRadius} cx={radius} cy={radius} className="text-emerald-500/80 transition-all duration-500" />
      <circle stroke="rgba(128,128,128,0.15)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
    </svg>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 16;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="shrink-0">
      <circle stroke="rgba(128,128,128,0.15)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
      <circle stroke="currentColor" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} r={normalizedRadius} cx={radius} cy={radius} className="text-sky-500 transition-all duration-500" />
    </svg>
  );
}

function KpiCard({
  kpi, isDarkMode, themeClasses, icon, type = 'default',
}: {
  kpi: KpiMeta;
  isDarkMode: boolean;
  themeClasses: any;
  icon: React.ReactNode;
  type?: 'default' | 'winrate' | 'profitfactor';
}) {
  const health = healthLabel(kpi.health);
  const isUp = kpi.change > 0;
  const isDown = kpi.change < 0;
  return (
    <div className={`group relative border rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-[1px] hover:shadow-lg ${themeClasses.bgPanel} ${themeClasses.border} hover:border-neutral-400/50 dark:hover:border-neutral-800`}>
      {/* Tooltip on hover */}
      <div className="absolute top-4 right-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-help z-10">
        <div className="relative">
          <HelpCircle className="w-3.5 h-3.5 hover:text-neutral-300 transition-colors" />
          <MetricTooltip label={kpi.label} tooltip={kpi.tooltip} isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${themeClasses.textSub}`}>{kpi.label}</div>
        <div className="shrink-0 bg-black/5 dark:bg-white/5 p-1.5 rounded-lg border border-neutral-500/10">{icon}</div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className={`text-2xl font-display font-bold tracking-tight ${themeClasses.textMain}`}>{kpi.value}</div>
        </div>
        {type === 'winrate' && (
          <ProgressRing value={parseFloat(kpi.value)} />
        )}
        {type === 'profitfactor' && (
          <ProgressArc value={parseFloat(kpi.value)} />
        )}
        {type === 'default' && kpi.sparklineData && kpi.sparklineData.length >= 2 && (
          <MiniSparkline data={kpi.sparklineData} color={kpi.health === 'needsImprovement' ? '#f43f5e' : '#10b981'} />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-500/5 pt-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          {isUp && <TrendingUp className="w-3 h-3 text-emerald-500" />}
          {isDown && <TrendingDown className="w-3 h-3 text-rose-500" />}
          {!isUp && !isDown && <Minus className="w-3 h-3 text-gray-400" />}
          <span className={isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-gray-400'}>
            {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
          </span>
          <span className="text-gray-400">vs prev period</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-gray-400">Benchmark:</span>
          <span className={`text-[9px] font-semibold ${themeClasses.textMain}`}>{kpi.benchmark}</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${health.cls}`}>
          <span className={`w-1 h-1 rounded-full ${health.dot}`} />
          {health.label}
        </span>
      </div>

      <div className={`mt-2.5 text-[9px] font-mono leading-relaxed border-l-2 border-neutral-500/10 pl-2 py-0.5 ${themeClasses.textSub}`}>
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
        '> $0',
        'Sum(Net PnL) | Total cumulative profit or loss accumulated across all closed trading operations. | Indicates your overall financial viability and bottom-line performance.',
        totalPnl > 0 ? `Highly profitable across ${total} active trades.` : 'Focus on cutting losses to recover equity.',
        pnLData,
      ),
      makeKpi(
        'Win Rate',
        `${computedStats.winRate}%`,
        `${Math.round(winRate1)}%`,
        winRate2 - winRate1,
        computedStats.winRate >= 60 ? 'excellent' : computedStats.winRate >= 45 ? 'good' : computedStats.winRate >= 35 ? 'average' : 'needsImprovement',
        '50%',
        'Wins / Total Trades * 100 | Percentage of trades that were closed in profit. | Helps evaluate strategy entry accuracy and market alignment.',
        computedStats.winRate >= 50 ? 'Strong accuracy, above professional thresholds.' : 'Review entry criteria to improve win ratio.',
        dailyPnl.map(v => ({ v: v > 0 ? v : 0 })),
      ),
      makeKpi(
        'Profit Factor',
        pf.toFixed(2),
        '—',
        0,
        pf >= 2.5 ? 'excellent' : pf >= 1.5 ? 'good' : pf >= 1 ? 'average' : 'needsImprovement',
        '2.0',
        'Gross Profit / Gross Loss | Gross profit divided by gross loss. Measures earnings per dollar risked. | A key institutional metric; values above 2.0 indicate exceptional profit generation.',
        pf >= 2 ? 'Your profitability exceeds standard benchmarks.' : pf >= 1 ? 'Profitable, but consider managing risk tight.' : 'Outflows exceed inflows; system requires adjustment.',
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
        '(Win% * AvgWin) - (Loss% * AvgLoss) | The average expected financial return per trade over time. | Tells you how much each trade is statistically worth on average.',
        expectancy > 0 ? `Each executed trade generates +$${expectancy.toFixed(0)} on average.` : `Each trade loses $${Math.abs(expectancy).toFixed(0)} on average.`,
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
        'Sum(Realized R / Planned R) / Count | Average ratio of realized R-multiple to initial planned R-multiple. | Measures your execution discipline in holding winners and cutting losers.',
        avgRMultiple >= 1.5 ? 'Your average reward significantly exceeds risk targets.' : 'Aim for at least 1.5R average.',
      ),
      makeKpi(
        'Largest Drawdown',
        `-$${maxDrawdown.toFixed(0)}`,
        '—',
        0,
        maxDrawdown <= Math.abs(totalPnl) * 0.3 ? 'excellent' : maxDrawdown <= Math.abs(totalPnl) * 0.5 ? 'average' : 'needsImprovement',
        '< 30%',
        'Peak - Trough | Maximum dollar decline from a peak in your running equity curve. | Standard institutional risk metric measuring worst-case volatility.',
        maxDrawdown > 0 ? `Peak drawdown of -$${maxDrawdown.toFixed(0)} recorded.` : 'Excellent capital preservation; no drawdown.',
      ),
      makeKpi(
        'Recovery Factor',
        recoveryFactor.toFixed(2),
        '—',
        0,
        recoveryFactor >= 2 ? 'excellent' : recoveryFactor >= 1 ? 'good' : 'average',
        '2.0',
        'Net Profit / Max Drawdown | Total net profit divided by your maximum drawdown. | Measures how efficiently your strategy recovers from equity peaks.',
        recoveryFactor >= 2 ? 'Outstanding recovery speed and resilient capital curve.' : 'Ensure risk controls prevent deep equity degradation.',
      ),
      makeKpi(
        'Best Day',
        `+$${bestDay.toFixed(0)}`,
        '—',
        0,
        'excellent',
        '—',
        'Max(Daily PnL) | The highest combined net return recorded in a single calendar day. | Shows the upper boundary of your daily strategy performance.',
        bestDay > 0 ? `Highest daily record: +$${bestDay.toFixed(0)}.` : 'No profitable days yet.',
      ),
      makeKpi(
        'Worst Day',
        `${worstDay >= 0 ? '+' : ''}$${worstDay.toFixed(0)}`,
        '—',
        0,
        Math.abs(worstDay) <= Math.abs(bestDay) * 0.5 ? 'good' : 'average',
        '—',
        'Min(Daily PnL) | The lowest combined net return recorded in a single calendar day. | Highlights your maximum daily downside risk exposure.',
        worstDay < 0 ? `Worst day restricted to $${worstDay.toFixed(0)}.` : 'Excellent, no daily losses registered.',
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
      summary.push(`Profitability increased ${pnl2 > pnl1 ? 'significantly' : 'moderately'} compared to the previous period.`);
    } else {
      summary.push('Overall profitability is negative. Focus strictly on executing premium A+ setups.');
    }
    if (bestMetric) summary.push(`Your strongest scoring area is ${bestMetric.label} (${Math.round(bestMetric.pct)}% contribution).`);
    if (worstMetric && worstMetric.score < 70) summary.push(`${worstMetric.label} requires adjustment (${Math.round(worstMetric.pct)}% contribution).`);
    if (pf >= 2) summary.push('Profit Factor exceeds standard professional benchmarks.');
    if (avgRMultiple >= 1.5) summary.push('Your average R multiple indicates disciplined execution.');

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
      {/* Primary KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryKpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            kpi={kpi}
            isDarkMode={isDarkMode}
            themeClasses={themeClasses}
            type={i === 1 ? 'winrate' : i === 2 ? 'profitfactor' : 'default'}
            icon={
              i === 0 ? <Activity className="w-4 h-4 text-emerald-500" /> :
              i === 1 ? <Award className="w-4 h-4 text-sky-500" /> :
              i === 2 ? <Zap className="w-4 h-4 text-amber-500" /> :
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            }
          />
        ))}
      </div>

      {/* Journalist Score & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Contribution Card */}
        <div className={`border rounded-xl p-6 relative overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-lg ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 border-b border-neutral-500/5 pb-3">
            <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${themeClasses.textSub}`}>
              Journalist Index Score
            </div>
            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
              Active Tier
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-5">
            <span className={`text-4xl font-display font-extrabold tracking-tight ${themeClasses.textMain}`}>
              {score.score}
            </span>
            <span className="text-gray-500 text-xs font-mono">/100</span>
          </div>

          <div className="space-y-3.5">
            {scoreContrib.map(s => (
              <div key={s.label} className="group">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className={`${themeClasses.textSub} transition-colors group-hover:text-white`}>{s.label}</span>
                  <span className={`font-semibold ${s.score >= 70 ? 'text-emerald-500' : s.score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {s.score} <span className="text-gray-500 font-normal">({Math.round(s.pct)}% contribution)</span>
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} group-hover:bg-neutral-800`}>
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

        {/* Performance Insights Summary */}
        <div className={`lg:col-span-2 border rounded-xl p-6 backdrop-blur-md transition-all duration-300 hover:shadow-lg ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className="flex items-center justify-between mb-4 border-b border-neutral-500/5 pb-3">
            <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${themeClasses.textSub}`}>
              Executive Performance Summary
            </div>
            <span className="text-[9px] font-mono text-gray-500">
              Updated Real-Time
            </span>
          </div>
          <div className="space-y-2.5">
            {summary.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">&bull;</span>
                <span className={`text-[11px] font-sans leading-relaxed tracking-normal ${themeClasses.textMain}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {secondaryKpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            kpi={kpi}
            isDarkMode={isDarkMode}
            themeClasses={themeClasses}
            icon={<Zap className="w-3.5 h-3.5 text-gray-400" />}
          />
        ))}
      </div>
    </div>
  );
}
