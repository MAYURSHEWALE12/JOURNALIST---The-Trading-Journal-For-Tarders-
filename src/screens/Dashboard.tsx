import {
  TrendingUp, TrendingDown, BookOpen,
  Search, LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardSkeleton } from '../components/Skeleton';
import PremiumPnLChart from '../components/PremiumPnLChart';
import KpiDashboard from '../components/KpiDashboard';
import { exportTradesToPDF } from '../lib/pdfExporter';
import { getWeekOfMonth, getShortTradeId } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    themeClasses, isDarkMode,
    computedStats, calendarDays, assetSummary,
    filteredTrades, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    dashboardViewMode, setDashboardViewMode,
    setSelectedScreenshot,
    dataLoading,
    activeTrades, activeAccountId, accounts, user,
    currentYear, currentMonth, handlePrevMonth, handleNextMonth,
    setIsExportingPDF, selectedDate, setSelectedDate
  } = useApp();

  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* KPI DASHBOARD */}
      <KpiDashboard
        trades={activeTrades}
        computedStats={computedStats}
        themeClasses={themeClasses}
        isDarkMode={isDarkMode}
        calendarDays={calendarDays}
        currentYear={currentYear}
        currentMonth={currentMonth}
        handlePrevMonth={handlePrevMonth}
        handleNextMonth={handleNextMonth}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* Premium P&L Chart */}
      <PremiumPnLChart trades={activeTrades} themeClasses={themeClasses} isDarkMode={isDarkMode} />

      {/* ASSET PERFORMANCE SUMMARY */}
        {assetSummary.rows.length > 0 && (
          <div className={`border rounded p-4 md:p-5 flex flex-col justify-between ${themeClasses.bgPanel} ${themeClasses.border}`}>
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
                <div className="overflow-x-auto">
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
          </div>
        )}

      {/* TABLE DB */}
      <div className={`border rounded p-4 md:p-5 space-y-4 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${themeClasses.textMain}`}>Logged Trades</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${themeClasses.bgCard} ${themeClasses.textSub}`}>{filteredTrades.length} Records</span>
            {selectedDate && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${isDarkMode ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                📅 {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none min-w-[120px] sm:min-w-[140px]">
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
            <button
              onClick={async () => { setIsExportingPDF(true); try { await exportTradesToPDF(activeTrades, computedStats, accounts.find(a => a.id === activeAccountId), user, calendarDays); } finally { setIsExportingPDF(false); } }}
              className={`px-3 py-1.5 border text-xs rounded transition font-bold flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isDarkMode ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-black text-white border-black hover:bg-gray-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <div className={`flex border rounded items-center overflow-hidden shrink-0 ${themeClasses.border}`}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTrades.map((t) => {
                const entryDate = new Date(t.entryTime).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                });
                const entryTime = t.entryTime ? new Date(t.entryTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                const exitTime = t.exitTime ? new Date(t.exitTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

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
                      <div className="h-28 md:h-36 flex divide-x divide-white/10 overflow-hidden border-b border-border-subtle relative group cursor-pointer">
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
                      <div className={`h-28 md:h-36 flex items-center justify-center border-b ${themeClasses.border} ${themeClasses.bgCard} opacity-60 text-gray-500`}>
                        <BookOpen className="w-5 h-5 opacity-40 mr-1.5" />
                        <span className="text-[10px] font-mono tracking-tight uppercase">Journaled Trade Notes Only</span>
                      </div>
                    )}

                    {/* Core Card Body */}
                    <div className="p-3 md:p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 shrink">
                            <h4 className={`text-sm font-bold tracking-tight truncate ${themeClasses.textMain}`}>{t.asset}</h4>
                            <span className="text-[8px] md:text-[9px] font-mono text-gray-500">{entryDate} • {entryTime}{exitTime ? `-${exitTime}` : ''}</span>
                          </div>
                          <span className={`font-mono text-xs font-bold shrink-0 ${t.netPnl >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                            {t.netPnl >= 0 ? `+$${t.netPnl.toFixed(2)}` : `-$${Math.abs(t.netPnl).toFixed(2)}`}
                          </span>
                        </div>

                        {/* Submetrics row */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-mono font-bold border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.direction === 'LONG' ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                            {t.direction}
                          </span>

                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-mono font-bold border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'WIN' ? 'bg-brand-emerald animate-pulse' : t.status === 'LOSS' ? 'bg-brand-rose' : 'bg-gray-400'}`} />
                            {t.status}
                          </span>

                          {t.strategy && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-sans border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub}`}>
                              {t.strategy}
                            </span>
                          )}
                        </div>

                        {/* Tags row */}
                        {t.tags && t.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {t.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[7px] md:text-[8px] font-mono px-1.5 py-0.2 bg-white/5 border border-white/10 rounded text-gray-400">
                                #{tag.toUpperCase()}
                              </span>
                            ))}
                            {t.tags.length > 3 && (
                              <span className="text-[7px] md:text-[8px] font-mono px-1.5 py-0.2 text-gray-500">
                                +{t.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Short notes preview */}
                        <p className={`text-[9px] md:text-[10px] leading-relaxed mt-2.5 font-sans line-clamp-2 ${themeClasses.textSub}`}>
                          {t.notes}
                        </p>
                      </div>

                      {/* Psychology Tags */}
                      <div className="pt-2 border-t border-border-subtle/40 flex justify-between items-center gap-2">
                        <div className="flex gap-1 flex-wrap min-w-0">
                          {t.emotionalState && t.emotionalState.slice(0, 2).map((em) => (
                            <span key={em} className="text-[7px] md:text-[8px] font-mono text-gray-500 border border-gray-500/20 px-1 py-0.5 rounded truncate">
                              {em}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => navigate('/trade/' + t.id)}
                          className={`px-2 py-1 border rounded text-[8px] md:text-[9px] font-bold tracking-tight transition cursor-pointer shrink-0 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
                        >
                          Review
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
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: isDarkMode ? '1px solid #26272B' : '1px solid #e5e7eb' }}>
                  <th className="pb-3 pl-3 font-normal text-[10px] md:text-[11px] text-gray-500 font-mono uppercase">ID</th>
                  <th className="pb-3 font-normal text-[10px] md:text-[11px] text-gray-500 font-mono uppercase">Asset</th>
                  <th className="pb-3 hidden sm:table-cell font-normal text-[10px] md:text-[11px] text-gray-500 font-mono uppercase">Direction</th>
                  <th className="pb-3 hidden md:table-cell font-normal text-[10px] md:text-[11px] text-gray-500 font-mono uppercase">Strategy</th>
                  <th className="pb-3 font-normal text-[10px] md:text-[11px] text-gray-500 font-mono uppercase">W/L</th>
                  <th className="pb-3 font-normal text-[10px] md:text-[11px] text-gray-500 font-mono uppercase">PnL</th>
                  <th className="pb-3 pr-3 text-right font-normal text-[10px] md:text-[11px] text-gray-500 font-mono uppercase"></th>
                </tr>
              </thead>
              <tbody className="text-[10px] md:text-xs font-mono">
                {filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-sm font-sans">
                      No trades matched your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((t) => (
                    <tr key={t.id} className="transition" style={{ borderBottom: isDarkMode ? '1px solid #26272B' : '1px solid #f3f4f6' }}>
                      <td className={`py-2.5 md:py-3.5 pl-3 font-mono font-medium ${themeClasses.textSub}`}>
                        <div className="truncate max-w-[50px] md:max-w-none">{getShortTradeId(t.id)}</div>
                        <div className="text-[8px] md:text-[9px] text-gray-400 font-sans mt-0.5">{getWeekOfMonth(t.entryTime)}</div>
                      </td>
                      <td className={`py-2.5 md:py-3.5 font-sans font-bold ${themeClasses.textMain}`}>{t.asset}</td>
                      <td className="py-2.5 md:py-3.5 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-1.5 md:px-2 py-0.5 rounded text-[9px] md:text-[10px] font-semibold border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.direction === 'LONG' ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                          {t.direction}
                        </span>
                      </td>
                      <td className={`py-2.5 md:py-3.5 font-sans hidden md:table-cell ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.strategy}</td>
                      <td className="py-2.5 md:py-3.5 whitespace-nowrap">
                        <span className={`inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-2 ${t.status === 'WIN' ? 'bg-brand-emerald animate-pulse' : t.status === 'LOSS' ? 'bg-brand-rose' : 'bg-gray-400'}`} />
                        <span className={`text-[9px] md:text-[11px] uppercase ${themeClasses.textSub}`}>{t.status}</span>
                      </td>
                      <td className={`py-2.5 md:py-3.5 font-bold ${themeClasses.textMain} whitespace-nowrap`}>
                        <span className="text-[10px] md:text-xs" style={{ color: t.netPnl > 0 ? '#10b981' : t.netPnl < 0 ? '#f43f5e' : undefined }}>
                          {t.netPnl >= 0 ? `+$${t.netPnl.toFixed(0)}` : `-$${Math.abs(t.netPnl).toFixed(0)}`}
                        </span>
                      </td>
                      <td className="py-2.5 md:py-3.5 pr-3 text-right">
                        <button
                          onClick={() => navigate('/trade/' + t.id)}
                          className={`px-2 md:px-2.5 py-1 border rounded text-[9px] md:text-[10px] transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredTrades.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: isDarkMode ? '2px solid #26272B' : '2px solid #e5e7eb' }}>
                    <td colSpan={4} className="py-2.5 md:py-3 pl-3">
                      <span className={`font-mono text-[9px] md:text-[10px] uppercase tracking-wider`} style={{ color: isDarkMode ? '#666' : '#999' }}>
                        Total
                      </span>
                    </td>
                    <td className="py-2.5 md:py-3 font-mono text-xs md:text-sm font-bold" style={{
                      color: (() => {
                        const total = filteredTrades.reduce((s, t) => s + t.netPnl, 0);
                        return total > 0 ? '#10b981' : total < 0 ? '#f43f5e' : isDarkMode ? '#ccc' : '#333';
                      })(),
                    }}>
                      {(() => {
                        const total = filteredTrades.reduce((s, t) => s + t.netPnl, 0);
                        return total >= 0 ? `+$${total.toFixed(0)}` : `-$${Math.abs(total).toFixed(0)}`;
                      })()}
                    </td>
                    <td className="pr-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </>
  );
}
