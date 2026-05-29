import { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
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
    bgBase: string;
    bgPanel: string;
    bgCard: string;
    bgHover: string;
    border: string;
    borderActive: string;
    textMain: string;
    textSub: string;
    navActive: string;
  };
  isDarkMode: boolean;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
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
      date,
      pnl,
      trades: ts.length,
      wins,
      losses,
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
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
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
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    weeks.push({
      label: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric' })}`,
      date,
      pnl,
      trades: ts.length,
      wins,
      losses,
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
      date,
      pnl,
      trades: ts.length,
      wins,
      losses,
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

const toShortDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

function CustomTooltip({ active, payload, label, isDarkMode }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d || d.balance !== undefined) {
    const val = payload[0]?.value ?? 0;
    return (
      <div className={`px-3 py-2 rounded-lg text-xs font-mono shadow-lg border ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="font-semibold mb-0.5">{label}</div>
        <span className={val >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
          {val >= 0 ? '+' : ''}${val.toFixed(2)}
        </span>
      </div>
    );
  }
  return (
    <div className={`px-3 py-2.5 rounded-xl text-xs font-mono shadow-xl border min-w-[180px] ${isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-white border-gray-200'}`}>
      <div className={`font-semibold mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{toShortDate(d.date)}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>P&L</span>
          <span className={`font-semibold ${d.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {d.pnl >= 0 ? '+' : ''}${d.pnl.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Trades</span>
          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{d.trades}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Win Rate</span>
          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {d.trades > 0 ? Math.round((d.wins / d.trades) * 100) : 0}%
          </span>
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
}

const modes: { key: ChartMode; label: string; icon: typeof BarChart3 }[] = [
  { key: 'daily', label: 'Daily', icon: Calendar },
  { key: 'weekly', label: 'Weekly', icon: BarChart3 },
  { key: 'monthly', label: 'Monthly', icon: BarChart3 },
  { key: 'equity', label: 'Equity', icon: LineChart },
];

export default function PremiumPnLChart({ trades, themeClasses, isDarkMode }: PremiumPnLChartProps) {
  const [mode, setMode] = useState<ChartMode>('daily');

  const dayData = useMemo(() => computeDayData(trades), [trades]);
  const weekData = useMemo(() => computeWeeklyData(trades), [trades]);
  const monthData = useMemo(() => computeMonthlyData(trades), [trades]);
  const equityData = useMemo(() => computeEquityData(trades), [trades]);

  const chartData = mode === 'weekly' ? weekData : mode === 'monthly' ? monthData : dayData;

  const visibleData = mode === 'equity' ? equityData : chartData;

  const totalPnl = useMemo(() => trades.reduce((s, t) => s + t.netPnl, 0), [trades]);
  const winningDays = dayData.filter(d => d.pnl > 0).length;
  const losingDays = dayData.filter(d => d.pnl < 0).length;
  const tradingDays = dayData.length;

  const stats = useMemo(() => {
    const adp = tradingDays > 0 ? totalPnl / tradingDays : 0;
    const best = dayData.length > 0 ? Math.max(...dayData.map(d => d.pnl)) : 0;
    const worst = dayData.length > 0 ? Math.min(...dayData.map(d => d.pnl)) : 0;
    const grossWins = trades.filter(t => t.netPnl > 0).reduce((s, t) => s + t.netPnl, 0);
    const grossLosses = Math.abs(trades.filter(t => t.netPnl < 0).reduce((s, t) => s + t.netPnl, 0));
    const pf = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 9.99 : 0;
    return { adp, bestDay: best, worstDay: worst, profitFactor: pf };
  }, [trades, dayData, tradingDays, totalPnl]);

  const handleModeChange = useCallback((m: ChartMode) => setMode(m), []);

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

  return (
    <div className={`border rounded-xl ${themeClasses.bgPanel} ${themeClasses.border}`}>
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] font-mono ${themeClasses.textSub}`}>Net Daily P&L</h3>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-medium ${isDarkMode ? 'bg-white/5 text-gray-500' : 'bg-black/5 text-gray-500'}`}>
                PREMIUM
              </span>
            </div>
            <div className={`text-lg font-display font-bold tracking-tight ${totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} this period
            </div>
            <div className={`text-[10px] font-mono mt-0.5 ${themeClasses.textSub}`}>
              {winningDays} Winning Days • {losingDays} Losing Days • {tradingDays} Total Days
            </div>
          </div>
          {/* Mode switcher */}
          <div className={`inline-flex rounded-lg p-0.5 border self-start ${isDarkMode ? 'bg-black/30 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
            {modes.map(m => (
              <button
                key={m.key}
                onClick={() => handleModeChange(m.key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all duration-200 ${
                  mode === m.key
                    ? isDarkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <m.icon className="w-3 h-3" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI badges */}
      <div className="px-6 pb-3 flex flex-wrap gap-2">
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border ${isDarkMode ? 'bg-white/[0.03] border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          Avg Day <span className={stats.adp >= 0 ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>{stats.adp >= 0 ? '+' : ''}${stats.adp.toFixed(2)}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border ${isDarkMode ? 'bg-white/[0.03] border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          Best Day <span className="text-emerald-500 font-semibold">+${stats.bestDay.toFixed(2)}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border ${isDarkMode ? 'bg-white/[0.03] border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          Worst Day <span className="text-rose-500 font-semibold">${stats.worstDay.toFixed(2)}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border ${isDarkMode ? 'bg-white/[0.03] border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          Profit Factor <span className={`font-semibold ${stats.profitFactor >= 1.5 ? 'text-emerald-500' : stats.profitFactor >= 1 ? 'text-yellow-500' : 'text-rose-500'}`}>{stats.profitFactor.toFixed(2)}x</span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4">
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'equity' ? (
              <AreaChart data={equityData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
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
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                  width={52}
                />
                <Tooltip
                  content={<CustomTooltip isDarkMode={isDarkMode} />}
                  cursor={false}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={isDarkMode ? '#6366f1' : '#4f46e5'}
                  strokeWidth={2}
                  fill="url(#eqGrad)"
                  animationDuration={350}
                />
              </AreaChart>
            ) : (
              <BarChart data={visibleData as DayData[]} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                  width={52}
                />
                <Tooltip
                  content={<CustomTooltip isDarkMode={isDarkMode} />}
                  cursor={false}
                />
                <Bar
                  dataKey="pnl"
                  radius={[3, 3, 0, 0]}
                  animationDuration={350}
                  animationEasing="ease-out"
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    const isPositive = payload.pnl >= 0;
                    const barColor = isPositive
                      ? (isDarkMode ? '#22c55e' : '#16a34a')
                      : (isDarkMode ? '#ef4444' : '#dc2626');
                    const radius = isPositive ? 3 : 0;
                    const baseY = isPositive ? y + height : y;
                    const barH = Math.max(Math.abs(height), 2);
                    return (
                      <rect
                        x={x + width * 0.15}
                        y={baseY}
                        width={width * 0.7}
                        height={barH}
                        fill={barColor}
                        rx={radius}
                        ry={radius}
                        className="transition-opacity duration-200 hover:opacity-80"
                      />
                    );
                  }}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
