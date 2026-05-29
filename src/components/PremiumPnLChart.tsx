import { useState, useMemo, useCallback, memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine, Cell,
} from 'recharts';
import { Calendar, BarChart3, LineChart } from 'lucide-react';

type ChartMode = 'daily' | 'weekly' | 'monthly' | 'equity';

interface DayData {
  label: string;
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  best: number;
  worst: number;
}

interface PremiumPnLChartProps {
  trades: Array<{
    entryTime: string;
    netPnl: number;
    status: string;
  }>;
  themeClasses: {
    bgBase: string; bgPanel: string; bgCard: string; bgHover: string;
    border: string; borderActive: string;
    textMain: string; textSub: string; navActive: string;
  };
  isDarkMode: boolean;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) { const key = keyFn(item); if (!map.has(key)) map.set(key, []); map.get(key)!.push(item); }
  return map;
}

function computeDayData(trades: PremiumPnLChartProps['trades']): DayData[] {
  const groups = groupBy(trades, t => t.entryTime.slice(0, 10));
  const days: DayData[] = [];
  for (const [date, ts] of groups) {
    const pnl = ts.reduce((s, t) => s + t.netPnl, 0);
    const wins = ts.filter(t => t.status === 'WIN').length;
    const losses = ts.filter(t => t.status === 'LOSS').length;
    const best = ts.reduce((m, t) => Math.max(m, t.netPnl), -Infinity);
    const worst = ts.reduce((m, t) => Math.min(m, t.netPnl), Infinity);
    const d = new Date(date);
    days.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date, pnl, trades: ts.length, wins, losses,
      best: best === -Infinity ? 0 : best,
      worst: worst === Infinity ? 0 : worst,
    });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

function computeWeeklyData(trades: PremiumPnLChartProps['trades']): DayData[] {
  const groups = groupBy(trades, t => {
    const d = new Date(t.entryTime.slice(0, 10));
    const start = new Date(d); start.setDate(d.getDate() - d.getDay());
    return start.toISOString().slice(0, 10);
  });
  const weeks: DayData[] = [];
  for (const [date, ts] of groups) {
    const pnl = ts.reduce((s, t) => s + t.netPnl, 0);
    const wins = ts.filter(t => t.status === 'WIN').length;
    const losses = ts.filter(t => t.status === 'LOSS').length;
    const best = ts.reduce((m, t) => Math.max(m, t.netPnl), -Infinity);
    const worst = ts.reduce((m, t) => Math.min(m, t.netPnl), Infinity);
    const d = new Date(date);
    const end = new Date(d); end.setDate(d.getDate() + 6);
    weeks.push({
      label: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', { day: 'numeric' })}`,
      date, pnl, trades: ts.length, wins, losses,
      best: best === -Infinity ? 0 : best,
      worst: worst === Infinity ? 0 : worst,
    });
  }
  weeks.sort((a, b) => a.date.localeCompare(b.date));
  return weeks;
}

function computeMonthlyData(trades: PremiumPnLChartProps['trades']): DayData[] {
  const groups = groupBy(trades, t => t.entryTime.slice(0, 7));
  const months: DayData[] = [];
  for (const [date, ts] of groups) {
    const pnl = ts.reduce((s, t) => s + t.netPnl, 0);
    const wins = ts.filter(t => t.status === 'WIN').length;
    const losses = ts.filter(t => t.status === 'LOSS').length;
    const best = ts.reduce((m, t) => Math.max(m, t.netPnl), -Infinity);
    const worst = ts.reduce((m, t) => Math.min(m, t.netPnl), Infinity);
    const d = new Date(`${date}-01`);
    months.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      date, pnl, trades: ts.length, wins, losses,
      best: best === -Infinity ? 0 : best,
      worst: worst === Infinity ? 0 : worst,
    });
  }
  months.sort((a, b) => a.date.localeCompare(b.date));
  return months;
}

function computeEquityData(trades: PremiumPnLChartProps['trades']) {
  const sorted = [...trades].sort((a, b) => a.entryTime.localeCompare(b.entryTime));
  let balance = 0;
  const points: { label: string; balance: number }[] = [{ label: 'Start', balance: 0 }];
  for (const t of sorted) {
    balance += t.netPnl;
    points.push({
      label: new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance,
    });
  }
  return points;
}

function niceScale(maxRaw: number, minRaw: number): { min: number; max: number; step: number; ticks: number[] } {
  if (maxRaw === minRaw) return { min: 0, max: 100, step: 25, ticks: [0, 25, 50, 75, 100] };
  const padding = (maxRaw - minRaw) * 0.15;
  const paddedMax = maxRaw + padding;
  const paddedMin = Math.min(0, minRaw - padding);
  const range = paddedMax - paddedMin;
  const roughStep = range / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3.5) niceStep = 2 * magnitude;
  else if (residual <= 7.5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;
  const niceMin = Math.floor(paddedMin / niceStep) * niceStep;
  const niceMax = Math.ceil(paddedMax / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let t = niceMin; t <= niceMax + niceStep / 2; t += niceStep) ticks.push(t);
  return { min: niceMin, max: niceMax, step: niceStep, ticks };
}

const toShortDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const CustomTooltip = memo(function CustomTooltip({ active, payload, label, isDarkMode, bestDay, worstDay }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d || d.balance !== undefined) {
    const val = payload[0]?.value ?? 0;
    return (
      <div className={`px-3 py-2 rounded-lg text-xs font-mono shadow-lg border ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="font-semibold mb-0.5">{label}</div>
        <span className={val >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{val >= 0 ? '+' : ''}${val.toFixed(2)}</span>
      </div>
    );
  }
  const isLoss = d.pnl < 0;
  const isWin = d.pnl > 0;
  const isBestDay = bestDay != null && d.pnl === bestDay && bestDay > 0;
  const isWorstDay = worstDay != null && d.pnl === worstDay && worstDay < 0;
  const badge = isLoss ? 'LOSS DAY' : isBestDay ? 'BEST DAY' : isWorstDay ? 'WORST DAY' : isWin ? 'WINNING DAY' : null;
  const badgeColor = isLoss ? 'text-rose-500' : isBestDay ? 'text-emerald-500' : isWorstDay ? 'text-rose-400' : 'text-emerald-500';
  return (
    <div className={`px-3 py-2.5 rounded-xl text-xs font-mono shadow-xl border min-w-[180px] ${isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-white border-gray-200'}`}>
      <div className={`font-semibold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{toShortDate(d.date)}</div>
      {badge && <div className={`text-[9px] font-semibold uppercase tracking-wider mb-1.5 ${badgeColor}`}>{badge}</div>}
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>P&L</span>
          <span className={`font-semibold ${isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>{d.pnl >= 0 ? '+' : ''}${d.pnl.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Trades</span>
          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{d.trades}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Win Rate</span>
          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{d.trades > 0 ? Math.round((d.wins / d.trades) * 100) : 0}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Best Trade</span>
          <span className="font-semibold text-emerald-500">+${d.best.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Worst Trade</span>
          <span className="font-semibold text-rose-500">${d.worst.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
});

const modes: { key: ChartMode; label: string; icon: typeof BarChart3 }[] = [
  { key: 'daily', label: 'Daily', icon: Calendar },
  { key: 'weekly', label: 'Weekly', icon: BarChart3 },
  { key: 'monthly', label: 'Monthly', icon: BarChart3 },
  { key: 'equity', label: 'Equity', icon: LineChart },
];

const barFormatted = (v: number) => `$${v.toFixed(0)}`;

function PremiumPnLChart({ trades, themeClasses, isDarkMode }: PremiumPnLChartProps) {
  const [mode, setMode] = useState<ChartMode>('daily');

  const dayData = useMemo(() => computeDayData(trades), [trades]);
  const weekData = useMemo(() => computeWeeklyData(trades), [trades]);
  const monthData = useMemo(() => computeMonthlyData(trades), [trades]);
  const equityData = useMemo(() => computeEquityData(trades), [trades]);

  const chartData = useMemo(
    () => mode === 'weekly' ? weekData : mode === 'monthly' ? monthData : dayData,
    [mode, weekData, monthData, dayData]
  );

  const visibleData = useMemo(
    () => mode === 'equity' ? equityData : chartData,
    [mode, equityData, chartData]
  );

  const chartLen = useMemo(
    () => (mode === 'equity' ? Math.max(0, equityData.length - 1) : chartData.length),
    [mode, equityData, chartData]
  );

  const totalPnl = useMemo(() => trades.reduce((s, t) => s + t.netPnl, 0), [trades]);

  const dayStats = useMemo(() => {
    const winning = dayData.filter(d => d.pnl > 0).length;
    const losing = dayData.filter(d => d.pnl < 0).length;
    return { winningDays: winning, losingDays: losing, tradingDays: dayData.length };
  }, [dayData]);

  const winRate = useMemo(() => {
    const { winningDays, tradingDays } = dayStats;
    return tradingDays > 0 ? Math.round((winningDays / tradingDays) * 100) : 0;
  }, [dayStats]);

  const bestDay = useMemo(
    () => dayData.length > 0 ? Math.max(...dayData.map(d => d.pnl)) : 0,
    [dayData]
  );
  const worstDay = useMemo(
    () => dayData.length > 0 ? Math.min(...dayData.map(d => d.pnl)) : 0,
    [dayData]
  );

  const stats = useMemo(() => {
    const { tradingDays } = dayStats;
    const adp = tradingDays > 0 ? totalPnl / tradingDays : 0;
    const grossWins = trades.filter(t => t.netPnl > 0).reduce((s, t) => s + t.netPnl, 0);
    const grossLosses = Math.abs(trades.filter(t => t.netPnl < 0).reduce((s, t) => s + t.netPnl, 0));
    const pf = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 9.99 : 0;
    return { adp, profitFactor: pf };
  }, [trades, dayStats, totalPnl]);

  const avgPnl = useMemo(() => {
    if (mode === 'equity') return 0;
    const vals = chartData.map(d => d.pnl);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [mode, chartData]);

  const scale = useMemo(() => {
    if (mode === 'equity') {
      const balances = equityData.map(d => d.balance);
      const rawMin = Math.min(...balances);
      const rawMax = Math.max(...balances);
      return niceScale(rawMax, rawMin);
    }
    const vals = chartData.map(d => d.pnl);
    const rawMax = Math.max(...vals, 0);
    const rawMin = Math.min(...vals, 0);
    const posPad = rawMax * 0.15;
    const negPad = Math.max(Math.abs(rawMin) * 2, rawMax * 0.2, 100);
    const paddedMax = rawMax + posPad;
    const paddedMin = Math.min(0, rawMin - negPad);
    return niceScale(paddedMax, paddedMin);
  }, [mode, chartData, equityData]);

  const chartHeight = useMemo(() => {
    if (chartLen <= 5) return 'h-36 md:h-44';
    if (chartLen <= 20) return 'h-52 md:h-60';
    return 'h-64 md:h-72';
  }, [chartLen]);

  const handleModeChange = useCallback((m: ChartMode) => setMode(m), []);

  const insufficient = trades.length > 0 && dayData.length < 2;

  if (trades.length === 0) {
    return (
      <div className={`border rounded-xl p-8 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className={`w-10 h-10 mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
          <p className={`text-sm font-mono font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No trades recorded yet.</p>
          <p className={`text-xs font-mono ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Add your first trade to see your P&L chart.</p>
        </div>
      </div>
    );
  }

  if (insufficient) {
    return (
      <div className={`border rounded-xl ${themeClasses.bgPanel} ${themeClasses.border} overflow-hidden`}>
        <div className="px-4 md:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] font-mono ${themeClasses.textSub}`}>Net Daily P&L</h3>
              <div className={`text-lg font-display font-bold tracking-tight mt-1 ${totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div className={`flex flex-col items-center justify-center py-12 text-center border-t border-dashed ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <BarChart3 className={`w-8 h-8 mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
          <p className={`text-xs font-mono font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Not enough data yet.</p>
          <p className={`text-[10px] font-mono mt-0.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Add more trades to unlock analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl ${themeClasses.bgPanel} ${themeClasses.border} overflow-hidden`}>
      {/* Header — inspired by Stripe/Vercel Analytics */}
      <div className="px-4 md:px-6 pt-5 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] font-mono ${themeClasses.textSub}`}>Net Daily P&L</h3>
            <div className={`text-xl md:text-2xl font-display font-bold tracking-tight mt-0.5 ${totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </div>
            <div className={`text-[10px] font-mono mt-0.5 ${themeClasses.textSub}`}>This Period</div>
          </div>
          <div className={`hidden sm:inline-flex rounded-lg p-0.5 border self-start shrink-0 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
            {modes.map(m => (
              <button
                key={m.key}
                onClick={() => handleModeChange(m.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-mono font-medium transition-all duration-200 ${
                  mode === m.key
                    ? `${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} shadow-xs`
                    : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <m.icon className="w-2.5 h-2.5" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="px-4 md:px-6 pb-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            Trading Days <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dayStats.tradingDays}</span>
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            Win Rate <span className={winRate >= 50 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>{winRate}%</span>
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            Avg Day <span className={stats.adp >= 0 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>{stats.adp >= 0 ? '+' : ''}${stats.adp.toFixed(2)}</span>
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            Best Day <span className="text-emerald-500 font-medium">+${bestDay.toFixed(2)}</span>
          </span>
          {dayStats.tradingDays >= 5 && (
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
              Profit Factor <span className={`font-medium ${stats.profitFactor >= 1.5 ? 'text-emerald-500' : stats.profitFactor >= 1 ? 'text-yellow-500' : 'text-rose-500'}`}>{stats.profitFactor.toFixed(2)}x</span>
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 md:px-3 pb-4">
        <div className={chartHeight}>
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'equity' ? (
              <AreaChart data={visibleData as any} margin={{ top: 8, right: 12, bottom: 4, left: -4 }}>
                <defs>
                  <linearGradient id="eqGrad3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDarkMode ? '#6366f1' : '#4f46e5'} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={isDarkMode ? '#6366f1' : '#4f46e5'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[scale.min, scale.max]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
                  tickFormatter={barFormatted}
                  width={44}
                  ticks={scale.ticks}
                />
                <Tooltip
                  content={(props: any) => <CustomTooltip {...props} isDarkMode={isDarkMode} bestDay={bestDay} worstDay={worstDay} />}
                  cursor={false}
                />
                <ReferenceLine
                  y={0}
                  stroke={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={isDarkMode ? '#6366f1' : '#4f46e5'}
                  strokeWidth={2}
                  fill="url(#eqGrad3)"
                  animationDuration={500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            ) : (
              <BarChart data={visibleData as DayData[]} margin={{ top: 8, right: 12, bottom: 4, left: -4 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  domain={[scale.min, scale.max]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
                  tickFormatter={barFormatted}
                  width={44}
                  ticks={scale.ticks}
                />
                <Tooltip
                  content={(props: any) => <CustomTooltip {...props} isDarkMode={isDarkMode} bestDay={bestDay} worstDay={worstDay} />}
                  cursor={false}
                />
                <ReferenceLine
                  y={0}
                  stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                  strokeWidth={1.5}
                />
                {avgPnl !== 0 && chartLen >= 3 && (
                  <ReferenceLine
                    y={avgPnl}
                    stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                    strokeDasharray="6 4"
                    strokeWidth={1}
                    label={{
                      value: `Avg $${avgPnl.toFixed(0)}`,
                      position: 'insideTopRight',
                      fill: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                      fontSize: 9,
                      fontFamily: 'ui-monospace, monospace',
                    }}
                  />
                )}
                <Bar
                  dataKey="pnl"
                  radius={[3, 3, 0, 0]}
                  animationDuration={500}
                  animationEasing="ease-out"
                  maxBarSize={48}
                >
                  {(visibleData as DayData[]).map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.pnl >= 0 ? (isDarkMode ? '#22c55e' : '#16a34a') : (isDarkMode ? '#ef4444' : '#dc2626')}
                      className="transition-opacity duration-200 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mobile segmented control */}
      <div className="sm:hidden px-4 pb-4">
        <div className={`inline-flex rounded-lg p-0.5 border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => handleModeChange(m.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-mono font-medium transition-all duration-200 ${
                mode === m.key
                  ? `${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} shadow-xs`
                  : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <m.icon className="w-2.5 h-2.5" />
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(PremiumPnLChart);
