import {
  TrendingUp, TrendingDown, BookOpen, Calendar,
  Search, Sparkles, BarChart3, LayoutGrid, List
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardSkeleton } from '../components/Skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    themeClasses, isDarkMode,
    computedStats, equityCurveData, calendarDays, assetSummary,
    filteredTrades, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    dashboardViewMode, setDashboardViewMode,
    trades, setSelectedScreenshot,
    dataLoading
  } = useApp();

  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* STAT WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className={`border rounded p-5 flex flex-col justify-between transition hover:border-gray-400 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`flex justify-between items-center text-xs font-mono ${themeClasses.textSub}`}>
            <span>Net Cumulative Returns</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2.5">
            <span className={`font-display font-bold text-2xl ${themeClasses.textMain}`}>${computedStats.totalPnl.toFixed(2)}</span>
            <div className={`text-[10px] mt-1 font-mono ${themeClasses.textSub}`}>absolute return balance</div>
          </div>
        </div>

        <div className={`border rounded p-5 flex flex-col justify-between transition hover:border-gray-400 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`flex justify-between items-center text-xs font-mono ${themeClasses.textSub}`}>
            <span>Win Rate Ratio</span>
            <Sparkles className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2.5">
            <span className={`font-display font-bold text-2xl ${themeClasses.textMain}`}>{computedStats.winRate}%</span>
            <div className={`text-[10px] mt-1 font-mono ${themeClasses.textSub}`}>{computedStats.wins} W / {computedStats.losses} L</div>
          </div>
        </div>

        <div className={`border rounded p-5 flex flex-col justify-between transition hover:border-gray-400 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`flex justify-between items-center text-xs font-mono ${themeClasses.textSub}`}>
            <span>Profit Factor Index</span>
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2.5">
            <span className={`font-display font-bold text-2xl ${themeClasses.textMain}`}>{computedStats.profitFactor}</span>
            <div className={`text-[10px] mt-1 font-mono ${themeClasses.textSub}`}>performance calculation</div>
          </div>
        </div>

        <div className={`border rounded p-5 flex flex-col justify-between transition hover:border-gray-400 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`flex justify-between items-center text-xs font-mono ${themeClasses.textSub}`}>
            <span>Average Return P/L</span>
            <TrendingDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2.5">
            <span className={`font-display font-bold text-2xl ${themeClasses.textMain}`}>${computedStats.averagePnl.toFixed(2)}</span>
            <div className={`text-[10px] mt-1 font-mono ${themeClasses.textSub}`}>{trades.length} entries analyzed</div>
          </div>
        </div>

      </div>

      {/* GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Equity Curve */}
        <div className={`border rounded p-5 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${themeClasses.textMain}`}>Account Balance Equity Curve</span>
            <span className={`text-[10px] border px-2 py-0.5 rounded font-mono ${isDarkMode ? 'border-brand-blue/20 text-brand-blue' : 'border-black/20 text-black'}`}>PREMIUM GRAPHICS</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDarkMode ? '#3a86ff' : '#000000'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={isDarkMode ? '#3a86ff' : '#000000'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="trial" stroke="rgba(128,128,128,0.5)" fontSize={10} />
                <YAxis stroke="rgba(128,128,128,0.5)" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    borderRadius: 4,
                    color: isDarkMode ? '#fff' : '#000'
                  }}
                  labelStyle={{ color: '#aaa', fontSize: 11 }}
                  itemStyle={{ color: isDarkMode ? '#fff' : '#000', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="balance" stroke={isDarkMode ? '#3a86ff' : '#000000'} strokeWidth={1.5} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className={`border rounded p-5 flex flex-col justify-between ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${themeClasses.textMain}`}>Daily Performance Calendar</span>
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-1.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-gray-500 font-semibold mb-1">{d}</div>
              ))}
              {calendarDays.map((d) => {
                let bgColor = isDarkMode
                  ? 'bg-[#181818] border border-white/5 text-gray-400'
                  : 'bg-gray-100 border border-gray-200 text-gray-700';

                if (d.pnl > 0) {
                  bgColor = isDarkMode
                    ? 'bg-brand-emerald/15 border border-brand-emerald/40 text-brand-emerald font-bold'
                    : 'bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold';
                }
                if (d.pnl < 0) {
                  bgColor = isDarkMode
                    ? 'bg-brand-rose/15 border border-brand-rose/30 text-brand-rose font-bold'
                    : 'bg-rose-100 border border-rose-300 text-rose-950 font-bold';
                }

                return (
                  <div
                    key={d.day}
                    title={`Date: ${d.date}\nP/L: $${d.pnl}`}
                    className={`h-10 rounded font-mono flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer relative group p-1 ${bgColor}`}
                  >
                    <span className="text-[9px] font-bold leading-none">{d.day}</span>
                    {d.pnl !== 0 && (
                      <span className="text-[7.5px] scale-95 font-semibold leading-none mt-0.5 opacity-90 font-mono">
                        {d.pnl > 0 ? `+$${Math.round(d.pnl)}` : `-$${Math.round(Math.abs(d.pnl))}`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`text-[10px] mt-4 flex items-center gap-2 font-mono ${themeClasses.textSub}`}>
            <span className={`w-2.5 h-2.5 rounded inline-block ${isDarkMode ? 'bg-brand-emerald/20 border border-brand-emerald/40' : 'bg-emerald-100 border border-emerald-300'}`}></span> Win Day
            <span className={`w-2.5 h-2.5 rounded inline-block ${isDarkMode ? 'bg-brand-rose/20 border border-brand-rose/30' : 'bg-rose-100 border border-rose-300'}`}></span> Loss Day
            <span className={`w-2.5 h-2.5 rounded inline-block ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-gray-200'}`}></span> Flat Day
          </div>
        </div>

        {/* ASSET PERFORMANCE SUMMARY */}
        {assetSummary.rows.length > 0 && (
          <div className={`border rounded p-5 flex flex-col justify-between ${themeClasses.bgPanel} ${themeClasses.border}`}>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider font-mono leading-tight ${themeClasses.textMain}`}>Asset Summary</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono w-max ${themeClasses.bgCard} ${themeClasses.textSub}`}>{assetSummary.rows.length} pairs tracked</span>
                </div>

                <div className="flex flex-col gap-1.5 items-end">
                  {assetSummary.best && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${isDarkMode ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}`}>
                      <TrendingUp className="w-2.5 h-2.5" />
                      {assetSummary.best.asset}: +${assetSummary.best.totalPnl.toFixed(0)}
                    </div>
                  )}
                  {assetSummary.worst && assetSummary.worst.totalPnl < 0 && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${isDarkMode ? 'border-rose-800/60 bg-rose-950/40 text-rose-400' : 'border-rose-300 bg-rose-50 text-rose-700'}`}>
                      <TrendingDown className="w-2.5 h-2.5" />
                      {assetSummary.worst.asset}: ${assetSummary.worst.totalPnl.toFixed(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <table className="w-full text-[10px] font-mono border-collapse">
                  <thead className="sticky top-0 z-10 bg-inherit">
                    <tr className={`border-b ${themeClasses.border}`}>
                      <th className={`text-left py-1.5 pr-2 uppercase tracking-wider ${themeClasses.textSub}`}>Pair</th>
                      <th className={`text-right py-1.5 px-1 uppercase tracking-wider ${themeClasses.textSub}`}>Trds</th>
                      <th className={`text-right py-1.5 px-1 uppercase tracking-wider ${themeClasses.textSub}`}>Win%</th>
                      <th className={`text-right py-1.5 pl-1 uppercase tracking-wider ${themeClasses.textSub}`}>PnL</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${themeClasses.border}`}>
                    {assetSummary.rows.map(row => {
                      const winRate = row.trades > 0 ? Math.round((row.wins / row.trades) * 100) : 0;
                      const isPositive = row.totalPnl >= 0;
                      return (
                        <tr key={row.asset} className={`transition ${themeClasses.bgHover}`}>
                          <td className="py-2 pr-2">
                            <span className={`font-bold tracking-tight ${themeClasses.textMain}`}>{row.asset}</span>
                          </td>
                          <td className={`py-2 px-1 text-right ${themeClasses.textSub}`}>{row.trades}</td>
                          <td className="py-2 px-1 text-right">
                            <span className={`font-semibold ${winRate >= 50 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-rose-400' : 'text-rose-600')}`}>
                              {winRate}%
                            </span>
                          </td>
                          <td className="py-2 pl-1 text-right">
                            <span className={`font-bold ${isPositive ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-rose-400' : 'text-rose-600')}`}>
                              {isPositive ? '+' : ''}{row.totalPnl.toFixed(0)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* TABLE DB */}
      <div className={`border rounded p-5 space-y-4 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${themeClasses.textMain}`}>Logged Trades database</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${themeClasses.bgCard} ${themeClasses.textSub}`}>{filteredTrades.length} Active Records</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border focus:border-gray-400 rounded py-1.5 pl-8 pr-3 text-xs focus:outline-none transition w-full font-mono ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN')}
              className={`border rounded py-1.5 px-3 text-xs focus:outline-none cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">Wins</option>
              <option value="LOSS">Losses</option>
              <option value="BREAKEVEN">Breakevens</option>
            </select>

            <div className={`flex border rounded items-center overflow-hidden ${themeClasses.border}`}>
              <button
                type="button"
                onClick={() => setDashboardViewMode('CARDS')}
                className={`p-1.5 transition cursor-pointer text-xs ${dashboardViewMode === 'CARDS' ? (isDarkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold') : 'text-gray-400 hover:text-white'}`}
                title="Gallery Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDashboardViewMode('TABLE')}
                className={`p-1.5 transition cursor-pointer text-xs ${dashboardViewMode === 'TABLE' ? (isDarkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold') : 'text-gray-400 hover:text-white'}`}
                title="Spreadsheet List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {dashboardViewMode === 'CARDS' ? (
          filteredTrades.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-mono text-xs">No trading logs matched active database records.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrades.map((t) => {
                const entryDate = new Date(t.entryTime).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                const screenshots = t.screenshotUrls && t.screenshotUrls.length > 0
                  ? t.screenshotUrls
                  : (t.screenshotUrl ? [t.screenshotUrl] : []);

                return (
                  <div
                    key={t.id}
                    className={`border rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-gray-400 ${themeClasses.bgPanel} ${themeClasses.border} shadow-sm`}
                  >
                    {/* Screenshot Header (if exists) */}
                    {screenshots.length > 0 ? (
                      <div className="h-36 flex divide-x divide-white/10 overflow-hidden border-b border-border-subtle relative group cursor-pointer">
                        {screenshots.map((url, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-full overflow-hidden relative group/img bg-black/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedScreenshot(url || null);
                            }}
                          >
                            <img
                              src={url}
                              alt={`${t.asset} setup ${idx + 1}`}
                              className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 group-hover/img:scale-105 transition-all duration-300"
                            />
                          </div>
                        ))}
                        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-[9px] font-mono px-1.5 py-0.5 rounded text-white border border-white/10 uppercase pointer-events-none">
                          {screenshots.length > 1 ? `${screenshots.length} Screenshots` : 'Screenshot'}
                        </div>
                      </div>
                    ) : (
                      <div className={`h-36 flex items-center justify-center border-b ${themeClasses.border} ${themeClasses.bgCard} opacity-60 text-gray-500`}>
                        <BookOpen className="w-5 h-5 opacity-40 mr-1.5" />
                        <span className="text-[10px] font-mono tracking-tight uppercase">Journaled Trade Notes Only</span>
                      </div>
                    )}

                    {/* Core Card Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-sm font-bold tracking-tight ${themeClasses.textMain}`}>{t.asset}</h4>
                            <span className="text-[9px] font-mono text-gray-500">{entryDate}</span>
                          </div>
                          <span className={`font-mono text-xs font-bold ${t.netPnl >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                            {t.netPnl >= 0 ? `+$${t.netPnl.toFixed(2)}` : `-$${Math.abs(t.netPnl).toFixed(2)}`}
                          </span>
                        </div>

                        {/* Submetrics row */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.direction === 'LONG' ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                            {t.direction}
                          </span>

                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'WIN' ? 'bg-brand-emerald animate-pulse' : t.status === 'LOSS' ? 'bg-brand-rose' : 'bg-gray-400'}`} />
                            {t.status}
                          </span>

                          {t.strategy && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-sans border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub}`}>
                              🛡️ {t.strategy}
                            </span>
                          )}
                        </div>

                        {/* Tags row */}
                        {t.tags && t.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {t.tags.map((tag) => (
                              <span key={tag} className="text-[8px] font-mono px-1.5 py-0.2 bg-white/5 border border-white/10 rounded text-gray-400">
                                #{tag.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Short notes preview */}
                        <p className={`text-[10px] leading-relaxed mt-2.5 font-sans line-clamp-2 ${themeClasses.textSub}`}>
                          {t.notes}
                        </p>
                      </div>

                      {/* Psychology Tags */}
                      <div className="pt-2 border-t border-border-subtle/40 flex justify-between items-center">
                        <div className="flex gap-1.5 flex-wrap">
                          {t.emotionalState && t.emotionalState.slice(0, 2).map((em) => (
                            <span key={em} className="text-[8px] font-mono text-gray-500 border border-gray-500/20 px-1 py-0.5 rounded">
                              🎭 {em}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => navigate('/trade/' + t.id)}
                          className={`px-2 py-1 border rounded text-[9px] font-bold tracking-tight transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
                        >
                          Review Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-[11px] text-gray-500 font-mono uppercase">
                  <th className="pb-3 pl-3">ID</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Direction</th>
                  <th className="pb-3">Setup Strategy</th>
                  <th className="pb-3">Win/Loss</th>
                  <th className="pb-3">PnL Target ($)</th>
                  <th className="pb-3 text-right pr-3">Action</th>
                </tr>
              </thead>
              <tbody className={`text-xs divide-y font-mono ${isDarkMode ? 'divide-border-subtle/50' : 'divide-gray-100'}`}>
                {filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">No trading logs matched active database records.</td>
                  </tr>
                ) : (
                  filteredTrades.map((t) => (
                    <tr key={t.id} className={`transition ${isDarkMode ? 'hover:bg-[#141414]/50' : 'hover:bg-gray-50'}`}>
                      <td className={`py-3.5 pl-3 font-mono font-medium ${themeClasses.textSub}`}>{t.id.slice(0, 8)}</td>
                      <td className={`py-3.5 font-sans font-bold ${themeClasses.textMain}`}>{t.asset}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.direction === 'LONG' ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                          {t.direction}
                        </span>
                      </td>
                      <td className={`py-3.5 font-sans ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.strategy}</td>
                      <td className="py-3.5">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${t.status === 'WIN' ? 'bg-brand-emerald animate-pulse' : t.status === 'LOSS' ? 'bg-brand-rose' : 'bg-gray-400'}`} />
                        <span className={`text-[11px] uppercase ${themeClasses.textSub}`}>{t.status}</span>
                      </td>
                      <td className={`py-3.5 font-bold ${themeClasses.textMain}`}>
                        {t.netPnl >= 0 ? `+$${t.netPnl.toFixed(2)}` : `-$${Math.abs(t.netPnl).toFixed(2)}`}
                      </td>
                      <td className="py-3.5 text-right pr-3">
                        <button
                          onClick={() => navigate('/trade/' + t.id)}
                          className={`px-2.5 py-1 border rounded text-[10px] transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
                        >
                          Review Post
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
