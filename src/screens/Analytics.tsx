import { useState, useMemo, memo } from 'react';
import { useApp } from '../context/AppContext';
import { Cell, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsSkeleton } from '../components/Skeleton';
import { exportTradesToPDF } from '../lib/pdfExporter';
import { exportTradesToExcel } from '../lib/excelExporter';
import JournalistScore from '../components/JournalistScore';
import Seo from '../components/Seo';

interface ScatterTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: any; value: number }>;
  isDarkMode: boolean;
}

const CustomScatterTooltip = memo(function CustomScatterTooltip({ active, payload, isDarkMode }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  const isLoss = data.status === 'LOSS';
  const isWin = data.status === 'WIN';
  const colorClass = isWin ? 'text-emerald-500' : (isLoss ? 'text-rose-500' : 'text-gray-400');
  
  return (
    <div className={`px-3 py-2.5 rounded-xl text-xs font-mono shadow-xl border min-w-[180px] ${isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-white border-gray-200'}`}>
      <div className={`font-semibold mb-1 flex justify-between items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <span>{data.asset}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${data.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {data.direction}
        </span>
      </div>
      <div className="space-y-1 text-gray-400">
        <div className="flex justify-between gap-4">
          <span>Status</span>
          <span className={`font-semibold ${colorClass}`}>{data.status}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Planned R</span>
          <span className="font-semibold text-white">{data.plannedR}R</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Realized R</span>
          <span className={`font-semibold ${colorClass}`}>{data.realizedR}R</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/5 pt-1 mt-1">
          <span>Net P&L</span>
          <span className={`font-semibold ${data.netPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {data.netPnl >= 0 ? '+' : ''}${data.netPnl.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
});

interface DonutTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  isDarkMode: boolean;
}

const CustomDonutTooltip = memo(function CustomDonutTooltip({ active, payload, isDarkMode }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  if (!data) return null;
  
  return (
    <div className={`px-2.5 py-1.5 rounded-lg text-xs font-mono shadow-md border ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <span className="font-semibold" style={{ color: data.payload.color }}>
        {data.name}: {data.value}
      </span>
    </div>
  );
});

export default function Analytics() {
  const { themeClasses, isDarkMode, activeTrades, computedStats, dataLoading, activeAccountId, accounts, user, calendarDays, setIsExportingPDF } = useApp();

  const [startDate, setStartDate] = useState(() => {
    const dates = activeTrades.map(t => t.entryTime.split('T')[0]).filter(Boolean).sort();
    return dates.length > 30 ? dates[dates.length - 31] : dates[0] || '';
  });
  const [endDate, setEndDate] = useState(() => {
    const dates = activeTrades.map(t => t.entryTime.split('T')[0]).filter(Boolean).sort();
    return dates[dates.length - 1] || '';
  });

  const dateFilteredTrades = useMemo(() => {
    if (!startDate && !endDate) return activeTrades;
    return activeTrades.filter(t => {
      const d = t.entryTime.split('T')[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [activeTrades, startDate, endDate]);

  const localStats = useMemo(() => {
    const total = dateFilteredTrades.length;
    if (total === 0) return { winRate: 0, profitFactor: 0, totalPnl: 0, averagePnl: 0, wins: 0, losses: 0 };
    const wins = dateFilteredTrades.filter(t => t.status === 'WIN');
    const losses = dateFilteredTrades.filter(t => t.status === 'LOSS');
    const wr = Math.round((wins.length / total) * 100);
    const totalPnl = dateFilteredTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const avgPnl = totalPnl / total;
    const grossWins = wins.reduce((sum, t) => sum + t.netPnl, 0);
    const grossLosses = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
    const pf = grossLosses > 0 ? +(grossWins / grossLosses).toFixed(2) : grossWins > 0 ? 9.99 : 0;
    return { winRate: wr, profitFactor: pf, totalPnl, averagePnl: avgPnl, wins: wins.length, losses: losses.length };
  }, [dateFilteredTrades]);

  if (dataLoading) {
    return <AnalyticsSkeleton />;
  }

  if (activeTrades.length === 0) {
    return (
      <div className={`border rounded p-12 text-center max-w-xl mx-auto space-y-5 my-12 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <Seo title="Advanced Analytics & Statistics" path="/analytics" />
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
        </div>
        <div className="space-y-2">
          <h3 className={`font-display font-bold text-lg ${themeClasses.textMain}`}>Analytics Unavailable</h3>
          <p className={`text-xs max-w-md mx-auto leading-relaxed ${themeClasses.textSub}`}>
            Your systematic dashboard has zero logged trades. Log your first session on the overview panel to compute premium analytics indices.
          </p>
        </div>
      </div>
    );
  }

  const outcomesData = [
    { name: 'Wins', value: localStats.wins, color: '#10b981' },
    { name: 'Losses', value: localStats.losses, color: '#f43f5e' },
    { name: 'Breakeven', value: dateFilteredTrades.filter(t => t.status === 'BREAKEVEN').length, color: '#9ca3af' }
  ];

  const uniqueTags = Array.from(new Set(dateFilteredTrades.flatMap(t => t.tags || [])));
  const winRate = dateFilteredTrades.length > 0 ? Math.round((localStats.wins / dateFilteredTrades.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Seo title="Advanced Analytics & Statistics" path="/analytics" />
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-display font-semibold ${themeClasses.textMain}`}>Systematic Analytics Core</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>Discover statistical edges, duration efficiencies, and risk profiles in stark layout.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTradesToExcel(dateFilteredTrades)}
            className={`w-24 sm:w-28 h-10 text-xs border rounded transition cursor-pointer font-bold flex items-center justify-center text-center ${
              isDarkMode ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-black text-white border-black hover:bg-gray-800'
            }`}
          >
            Export Excel
          </button>
          <button
            onClick={async () => { setIsExportingPDF(true); try { await exportTradesToPDF(dateFilteredTrades, localStats, accounts.find(a => a.id === activeAccountId), user, calendarDays); } finally { setIsExportingPDF(false); } }}
            className={`w-24 sm:w-28 h-10 border text-xs rounded transition cursor-pointer font-bold flex items-center justify-center text-center ${
              isDarkMode ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-black text-white border-black hover:bg-gray-800'
            }`}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${themeClasses.textSub}`}>From</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={`border rounded py-1.5 px-2 text-xs font-mono focus:outline-none ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${themeClasses.textSub}`}>To</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={`border rounded py-1.5 px-2 text-xs font-mono focus:outline-none ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className={`text-[10px] font-mono px-2 py-1.5 border rounded transition cursor-pointer ${themeClasses.border} ${themeClasses.textSub} hover:border-red-400 hover:text-red-400`}
          >
            Clear
          </button>
        )}
        <span className={`text-[10px] font-mono ml-auto ${themeClasses.textSub}`}>
          {dateFilteredTrades.length} of {activeTrades.length} trades
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1">
          <JournalistScore trades={dateFilteredTrades} themeClasses={themeClasses} isDarkMode={isDarkMode} className="h-full" />
        </div>
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-stretch">
            <div className={`border rounded p-5 ${themeClasses.bgPanel} ${themeClasses.border} min-w-0 flex flex-col justify-between h-full`}>
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider font-mono block mb-4 ${themeClasses.textMain}`}>Planned R-Ratio vs Realized R-Ratio Scatter</span>
              </div>
              <div className="flex-1 min-h-[240px] md:min-h-[280px]">
                <ResponsiveContainer width="99%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} />
                    <XAxis type="number" dataKey="plannedR" name="Planned R" stroke="rgba(128,128,128,0.5)" fontSize={10} unit="R" domain={[0, (dataMax: number) => Math.max(3, dataMax + 0.5)]} />
                    <YAxis type="number" dataKey="realizedR" name="Realized R" stroke="rgba(128,128,128,0.5)" fontSize={10} unit="R" domain={[(dataMin: number) => Math.min(-1, dataMin - 0.5), (dataMax: number) => Math.max(2, dataMax + 0.5)]} />
                    <Tooltip content={<CustomScatterTooltip isDarkMode={isDarkMode} />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Trades Performance" data={dateFilteredTrades}>
                      {dateFilteredTrades.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.status === 'WIN' ? '#10b981' : (entry.status === 'BREAKEVEN' ? '#9ca3af' : '#f43f5e')} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`border rounded p-5 flex flex-col justify-between ${themeClasses.bgPanel} ${themeClasses.border} min-w-0 h-full`}>
              <div className="flex-grow flex flex-col justify-between h-full">
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider font-mono block mb-4 ${themeClasses.textMain}`}>Outcome Distribution Donut</span>
                </div>
                <div className="flex-1 min-h-[200px] md:min-h-[240px] relative flex items-center justify-center my-auto">
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {outcomesData.map((entry, index) => (
                          <Cell key={`donut-${index}`} fill={entry.color} stroke={isDarkMode ? '#0c0c0e' : '#ffffff'} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomDonutTooltip isDarkMode={isDarkMode} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center font-mono select-none pointer-events-none">
                    <span className={`text-2xl font-bold ${themeClasses.textMain}`}>{winRate}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Win Rate</span>
                  </div>
                </div>

                <div className={`flex justify-around items-center text-xs border-t pt-3 font-mono ${themeClasses.border} ${themeClasses.textSub} mt-4`}>
                  <span className="font-semibold text-emerald-500">● Wins: {computedStats.wins}</span>
                  <span className="font-semibold text-rose-500">● Losses: {computedStats.losses}</span>
                  <span className="font-semibold text-gray-400">● Breakevens: {dateFilteredTrades.filter(t => t.status === 'BREAKEVEN').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`border rounded p-5 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider font-mono block mb-3 ${themeClasses.textMain}`}>Diagnostic Tag performance matrix</span>
        <div className="flex flex-wrap gap-2.5">
          {uniqueTags.length > 0 ? (
            uniqueTags.map((tag, i) => {
              const tagTrades = dateFilteredTrades.filter(t => (t.tags || []).includes(tag));
              const wins = tagTrades.filter(t => t.status === 'WIN').length;
              const wr = tagTrades.length > 0 ? Math.round((wins / tagTrades.length) * 100) : 0;

              return (
                <div key={i} className={`border rounded px-3.5 py-2 flex items-center space-x-3 transition ${themeClasses.bgCard} ${themeClasses.border}`}>
                  <span className={`text-xs font-bold font-mono ${themeClasses.textMain}`}>#{tag}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>{wr}% WR</span>
                  <span className="text-[10px] text-gray-500 font-mono">{tagTrades.length} entries</span>
                </div>
              );
            })
          ) : (
            <span className={`text-xs font-mono ${themeClasses.textSub}`}>No tags associated with current trades database.</span>
          )}
        </div>
      </div>
    </div>
  );
}
