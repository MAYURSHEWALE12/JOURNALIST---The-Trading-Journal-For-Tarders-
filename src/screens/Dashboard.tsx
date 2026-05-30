import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown,
  Search, LayoutGrid, List, Share2, Download, X, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardSkeleton } from '../components/Skeleton';
import PremiumPnLChart from '../components/PremiumPnLChart';
import KpiDashboard from '../components/KpiDashboard';
import { exportTradesToPDF } from '../lib/pdfExporter';
import { exportTradesToExcel } from '../lib/excelExporter';
import Seo from '../components/Seo';
import LogoIcon from '../components/LogoIcon';
import { computeJournalistScore } from '../lib/journalistScore';
import html2canvas from 'html2canvas-pro';
import { getDirectImageUrl } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    themeClasses, isDarkMode,
    computedStats, calendarDays, assetSummary,
    filteredTrades, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    tagFilter, setTagFilter, allTags,
    dashboardViewMode, setDashboardViewMode,
    dataLoading,
    activeTrades, activeAccountId, accounts, user,
    currentYear, currentMonth, handlePrevMonth, handleNextMonth,
    setIsExportingPDF, selectedDate, setSelectedDate
  } = useApp();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [glowTheme, setGlowTheme] = useState<'slate' | 'emerald' | 'indigo'>('indigo');
  const [isExporting, setIsExporting] = useState(false);

  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  const scoreObj = computeJournalistScore(activeTrades);
  const activeAccountName = accounts.find(a => a.id === activeAccountId)?.name || 'Default Account';
  const winRate = activeTrades.length > 0 ? Math.round((activeTrades.filter(t => t.status === 'WIN').length / activeTrades.length) * 100) : 0;

  const exportPortfolioCard = async () => {
    const cardElement = document.getElementById('journalist-portfolio-card');
    if (!cardElement) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 3,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Journalist_Portfolio_${activeAccountName.replace(/\s+/g, '_')}_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export portfolio card:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Seo title="Overview Workspace" path="/dashboard" />
      
      {/* Dashboard Top Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-xl font-display font-semibold ${themeClasses.textMain}`}>Overview Workspace</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>Track separate portfolios, calendar performance heatmaps, and key statistics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer border-indigo-800/40 bg-indigo-900/10 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Performance
          </button>
        </div>
      </div>

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
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(prev => !prev)}
                className={`border rounded py-1.5 px-3 pr-8 text-xs focus:outline-none cursor-pointer flex items-center justify-between gap-1.5 transition min-w-[115px] sm:min-w-[125px] text-left font-semibold relative ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
              >
                <span className="truncate">
                  {statusFilter === 'ALL' && 'All Outcomes'}
                  {statusFilter === 'WIN' && 'Wins'}
                  {statusFilter === 'LOSS' && 'Losses'}
                  {statusFilter === 'BREAKEVEN' && 'Breakevens'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 absolute right-2.5 transition-transform duration-200 pointer-events-none ${filterDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {filterDropdownOpen && (
                <div className={`absolute top-full right-0 mt-1.5 w-36 rounded-lg border shadow-2xl p-1 z-50 transition-all duration-200 ${
                  isDarkMode ? 'bg-[#121212] border-white/[0.08] text-white' : 'bg-white border-gray-200 text-black'
                }`}>
                  {[
                    { value: 'ALL', label: 'All Outcomes' },
                    { value: 'WIN', label: 'Wins' },
                    { value: 'LOSS', label: 'Losses' },
                    { value: 'BREAKEVEN', label: 'Breakevens' }
                  ].map(opt => {
                    const isActive = opt.value === statusFilter;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value as 'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN');
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded text-xs transition duration-150 cursor-pointer flex justify-between items-center ${
                          isActive
                            ? (isDarkMode ? 'bg-white/10 text-white font-semibold' : 'bg-black/5 text-black font-semibold')
                            : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]' : 'text-gray-600 hover:text-black hover:bg-black/[0.03]')
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && <span className="text-[10px] text-gray-400">✦</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={() => exportTradesToExcel(activeTrades)}
              className={`w-24 sm:w-28 h-10 text-xs border rounded transition cursor-pointer font-bold shrink-0 flex items-center justify-center text-center ${
                isDarkMode ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-black text-white border-black hover:bg-gray-800'
              }`}
            >
              Export Excel
            </button>
            <button
              onClick={async () => { setIsExportingPDF(true); try { await exportTradesToPDF(activeTrades, computedStats, accounts.find(a => a.id === activeAccountId), user, calendarDays); } finally { setIsExportingPDF(false); } }}
              className={`w-24 sm:w-28 h-10 border text-xs rounded transition font-bold flex items-center justify-center text-center cursor-pointer shrink-0 ${
                isDarkMode ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-black text-white border-black hover:bg-gray-800'
              }`}
            >
              Export PDF
            </button>
            <div className={`flex border rounded items-center overflow-hidden shrink-0 h-10 ${themeClasses.border}`}>
               <button
                 type="button"
                 onClick={() => setDashboardViewMode('CARDS')}
                 className={`h-full px-3.5 transition cursor-pointer flex items-center justify-center ${dashboardViewMode === 'CARDS' ? (isDarkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold') : 'text-gray-400 hover:text-white'}`}
                 title="Gallery Cards View"
               >
                 <LayoutGrid className="w-4 h-4" />
               </button>
               <button
                 type="button"
                 onClick={() => setDashboardViewMode('TABLE')}
                 className={`h-full px-3.5 transition cursor-pointer flex items-center justify-center ${dashboardViewMode === 'TABLE' ? (isDarkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold') : 'text-gray-400 hover:text-white'}`}
                 title="Spreadsheet List View"
               >
                 <List className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {allTags.map(tag => {
              const isActive = tagFilter.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => setTagFilter(prev => isActive ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? 'bg-white/15 border-white/40 text-white font-semibold'
                        : 'bg-black/10 border-black/30 text-black font-semibold'
                      : `${themeClasses.border} ${themeClasses.textSub} hover:border-gray-400`
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {tagFilter.length > 0 && (
              <button
                onClick={() => setTagFilter([])}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition cursor-pointer ${themeClasses.textSub} ${themeClasses.border} hover:border-red-400 hover:text-red-400`}
              >
                Clear
              </button>
            )}
          </div>
        )}

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
                const exitTimeRaw = t.exitTime ? new Date(t.exitTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                const exitTime = exitTimeRaw && exitTimeRaw !== entryTime ? exitTimeRaw : '';

                return (
                  <div key={t.id}
                    onClick={() => navigate(`/trade/${t.id}`)}
                    className={`border rounded-xl p-5 md:p-6 transition select-none flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 cursor-pointer ${themeClasses.bgPanel} ${themeClasses.border} hover:border-gray-500`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded leading-none ${t.direction === 'LONG' ? (isDarkMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') : (isDarkMode ? 'bg-rose-950 text-rose-400 border border-rose-900/50' : 'bg-rose-50 text-rose-700 border border-rose-200')}`}>
                            {t.direction}
                          </span>
                          <span className={`text-xs font-black uppercase tracking-tight ${themeClasses.textMain}`}>{t.asset}</span>
                        </div>
                        <p className={`text-[10px] font-mono ${themeClasses.textSub}`}>
                          {entryDate} &bull; {entryTime}{exitTime ? `-${exitTime}` : ''}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded border leading-none ${t.status === 'WIN' ? (isDarkMode ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald' : 'border-emerald-300 bg-emerald-100 text-emerald-800') : t.status === 'LOSS' ? (isDarkMode ? 'border-brand-rose/40 bg-brand-rose/10 text-brand-rose' : 'border-rose-300 bg-rose-100 text-rose-800') : (isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-300 bg-gray-200 text-gray-700')}`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Render elegant, glassmorphic thumbnail if screenshot is present */}
                    {t.screenshotUrl && (
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/[0.04] bg-neutral-950/20 relative transition-colors">
                        <img 
                          src={getDirectImageUrl(t.screenshotUrl)} 
                          alt="Trade chart setup" 
                          className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-end border-t border-dashed border-neutral-700/20 pt-3 mt-1">
                      <div className="space-y-0.5">
                        <span className={`text-[8px] uppercase tracking-widest font-mono ${themeClasses.textSub}`}>Net Result</span>
                        <div className={`font-display text-lg font-extrabold ${t.netPnl >= 0 ? (isDarkMode ? 'text-brand-emerald' : 'text-emerald-600') : (isDarkMode ? 'text-brand-rose' : 'text-rose-600')}`}>
                          {t.netPnl >= 0 ? '+' : ''}${t.netPnl.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className={`text-[8px] uppercase tracking-widest font-mono ${themeClasses.textSub}`}>Realized R</span>
                        <div className={`font-mono text-xs font-semibold ${themeClasses.textMain}`}>{t.realizedR}R</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          filteredTrades.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-mono text-xs">No trading logs matched active database records.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className={`border-b font-mono text-[9px] uppercase tracking-widest ${themeClasses.textSub}`}>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-1">Pair</th>
                    <th className="py-3 px-1">Direction</th>
                    <th className="py-3 px-1">Outcome</th>
                    <th className="py-3 px-1 text-right">Size</th>
                    <th className="py-3 px-1 text-right">R-Multiple</th>
                    <th className="py-3 px-3 text-right">Net P&L</th>
                    <th className="py-3 pr-3"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs font-mono ${themeClasses.border} ${themeClasses.textMain}`}>
                  {filteredTrades.map((t) => {
                    const rowDate = new Date(t.entryTime).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    return (
                      <tr key={t.id}
                        onClick={() => navigate(`/trade/${t.id}`)}
                        className={`transition cursor-pointer ${themeClasses.bgHover}`}>
                        <td className="py-2.5 md:py-3 px-3 text-gray-500">{rowDate}</td>
                        <td className="py-2.5 md:py-3 px-1 font-bold">{t.asset}</td>
                        <td className="py-2.5 md:py-3 px-1">
                          <span className={`font-bold ${t.direction === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.direction}</span>
                        </td>
                        <td className="py-2.5 md:py-3 px-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.status === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'LOSS' ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-500/10 text-gray-400'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 md:py-3 px-1 text-right">{t.quantity}</td>
                        <td className="py-2.5 md:py-3 px-1 text-right">{t.realizedR}R</td>
                        <td className={`py-2.5 md:py-3 px-3 text-right font-bold ${t.netPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.netPnl >= 0 ? '+' : ''}${t.netPnl.toFixed(2)}
                        </td>
                        <td className="py-2.5 md:py-3 pr-3 text-right text-gray-600 hover:text-white transition">&rarr;</td>
                      </tr>
                    );
                  })}
                </tbody>
                {filteredTrades.length > 1 && (
                  <tfoot>
                    <tr className={`border-t border-double font-bold uppercase tracking-widest font-mono text-[9px] ${themeClasses.border} ${themeClasses.textSub}`}>
                      <td className="py-3 px-3">Total Cumulative</td>
                      <td colSpan={5}></td>
                      <td className="py-2.5 md:py-3 font-mono text-xs md:text-sm font-bold text-right" style={{
                        color: (() => {
                          const total = filteredTrades.reduce((s, t) => s + t.netPnl, 0);
                          return total > 0 ? '#10b981' : total < 0 ? '#f43f5e' : isDarkMode ? '#ccc' : '#333';
                        })(),
                      }}>
                        {(() => {
                          const total = filteredTrades.reduce((s, t) => s + t.netPnl, 0);
                          return total >= 0 ? `+$${total.toFixed(2)}` : `-$${Math.abs(total).toFixed(2)}`;
                        })()}
                      </td>
                      <td className="pr-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )
        )}
      </div>

      {/* Portfolio Performance Card Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start sm:items-center justify-center p-3 pt-4 sm:p-6 overflow-y-auto select-none">
          <div className="w-full max-w-[420px] sm:max-w-xl bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-white/[0.06] shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-white/[0.04]">
              <span className="text-white/80 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold">
                Generate Performance Card
              </span>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-500 hover:text-white transition cursor-pointer p-1.5 rounded-full hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card Preview */}
            <div className="px-4 sm:px-6 pt-3 sm:pt-4">
              <div className="flex justify-center">
                <div
                  id="journalist-portfolio-card"
                  className="w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[340px] aspect-[4/5] rounded-2xl p-5 sm:p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl border"
                  style={{
                    background: glowTheme === 'emerald'
                      ? 'linear-gradient(135deg, #0c1410 0%, #09090b 50%, #040405 100%)'
                      : glowTheme === 'indigo'
                        ? 'linear-gradient(135deg, #0e0e16 0%, #09090b 50%, #040405 100%)'
                        : 'linear-gradient(135deg, #0e0e11 0%, #09090b 50%, #040405 100%)',
                    borderColor: glowTheme === 'emerald'
                      ? 'rgba(16,185,129,0.3)'
                      : glowTheme === 'indigo'
                        ? 'rgba(99,102,241,0.3)'
                        : 'rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Soft Ambient Glow Orb */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none transition-all duration-500"
                    style={{
                      background: glowTheme === 'emerald'
                        ? 'radial-gradient(circle at 50% 40%, rgba(16,185,129,0.06) 0%, transparent 60%)'
                        : glowTheme === 'indigo'
                          ? 'radial-gradient(circle at 50% 40%, rgba(99,102,241,0.06) 0%, transparent 60%)'
                          : 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 60%)'
                    }}
                  />

                  {/* Rotating Logo Watermark */}
                  <div className="absolute right-[-30px] top-[-35px] w-56 h-56 text-white/[0.03] rotate-[15deg] pointer-events-none select-none">
                    <LogoIcon className="w-full h-full text-white" isDark={true} />
                  </div>

                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border transition-all duration-300 overflow-hidden relative shrink-0"
                      style={{
                        backgroundColor: glowTheme === 'emerald' ? 'rgba(16,185,129,0.1)' : glowTheme === 'indigo' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.1)',
                        borderColor: glowTheme === 'emerald' ? 'rgba(16,185,129,0.3)' : glowTheme === 'indigo' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.2)',
                        color: glowTheme === 'emerald' ? '#34d399' : glowTheme === 'indigo' ? '#818cf8' : '#ffffff'
                      }}
                    >
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        user?.username?.slice(0, 2) || 'TR'
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold font-mono text-white" style={{ color: '#ffffff' }}>{user?.username || 'JournalistTrader'}</div>
                      <div className="text-[9px] font-mono mt-0.5" style={{ color: '#a3a3a3' }}>
                        {user?.tradingBio || 'Systematic Pro'} &bull; {activeAccountName}
                      </div>
                    </div>
                  </div>

                  {/* Core Account Performance Stats */}
                  <div className="my-auto relative z-10 py-2">
                    <div className="text-[8px] font-mono uppercase tracking-widest font-bold leading-none" style={{ color: '#737373' }}>Net cumulative profit</div>
                    <div
                      className="mt-1 font-display text-4.5xl font-black tracking-tight leading-none"
                      style={{
                        color: computedStats.totalPnl >= 0 ? '#34d399' : '#f87171'
                      }}
                    >
                      {computedStats.totalPnl >= 0 ? '+' : ''}${computedStats.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-2 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div>
                        <div className="text-[8px] uppercase tracking-wider font-bold font-mono leading-none" style={{ color: '#737373' }}>Win Rate</div>
                        <div className="text-sm font-bold font-mono mt-1.5 text-white" style={{ color: '#ffffff' }}>{winRate}%</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase tracking-wider font-bold font-mono leading-none" style={{ color: '#737373' }}>Profit Factor</div>
                        <div className="text-sm font-bold font-mono mt-1.5 text-white" style={{ color: '#ffffff' }}>{computedStats.profitFactor}x</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase tracking-wider font-bold font-mono leading-none" style={{ color: '#737373' }}>Journal Score</div>
                        <div
                          className="text-sm font-bold font-mono mt-1.5 transition-colors duration-300"
                          style={{
                            color: glowTheme === 'emerald' ? '#34d399' : glowTheme === 'indigo' ? '#818cf8' : '#ffffff'
                          }}
                        >
                          {scoreObj.score}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lower detailed metadata */}
                  <div className="border-t pt-4 grid grid-cols-2 gap-4 relative z-10 font-mono" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-[8px] uppercase tracking-widest font-bold" style={{ color: '#737373' }}>Total Trades</div>
                      <div className="text-xs font-semibold mt-0.5 text-white" style={{ color: '#ffffff' }}>{activeTrades.length} documented</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-widest font-bold" style={{ color: '#737373' }}>Journalist Level</div>
                      <div
                        className="text-[10px] font-semibold mt-0.5 uppercase tracking-wide leading-tight transition-colors duration-300"
                        style={{
                          color: glowTheme === 'emerald' ? '#34d399' : glowTheme === 'indigo' ? '#818cf8' : '#ffffff'
                        }}
                      >
                        {scoreObj.levelLabel}
                      </div>
                    </div>
                  </div>

                  {/* Branding Footer */}
                  <div className="border-t pt-4 mt-4 flex items-center justify-between relative z-10 select-none" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white text-black flex items-center justify-center p-0.5 shrink-0">
                        <LogoIcon className="w-3.5 h-3.5" isDark={false} />
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold font-display tracking-tight leading-none text-white" style={{ color: '#ffffff' }}>JOURNALIST</div>
                        <div className="text-[7px] font-mono mt-0.5 leading-none" style={{ color: '#737373' }}>Systematic Portfolio Core</div>
                      </div>
                    </div>
                    {user?.twitterHandle || user?.telegramHandle ? (
                      <div className="text-right font-mono flex flex-col items-end justify-center">
                        {user.twitterHandle && (
                          <span className="text-[8px] font-bold" style={{ color: '#a3a3a3' }}>𝕏 {user.twitterHandle}</span>
                        )}
                        {user.telegramHandle && (
                          <span className="text-[7px] mt-0.5" style={{ color: '#737373' }}>✈️ {user.telegramHandle}</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 p-1 bg-white rounded flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black w-full h-full">
                          <rect x="1" y="1" width="7" height="7" />
                          <rect x="16" y="1" width="7" height="7" />
                          <rect x="16" y="16" width="7" height="7" />
                          <rect x="1" y="16" width="7" height="7" />
                          <rect x="4" y="4" width="1" height="1" strokeWidth="2" />
                          <rect x="19" y="4" width="1" height="1" strokeWidth="2" />
                          <rect x="19" y="19" width="1" height="1" strokeWidth="2" />
                          <rect x="4" y="19" width="1" height="1" strokeWidth="2" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-3 space-y-3 sm:space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-widest mb-2 font-bold" style={{ color: '#737373' }}>Glow Theme</label>
                <div className="flex gap-2">
                  {(['slate', 'emerald', 'indigo'] as const).map(t => {
                    const isActive = glowTheme === t;
                    const btnClass = !isActive
                      ? `${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-gray-500 hover:text-white`
                      : t === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : t === 'indigo'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                          : 'bg-white text-black border-white';
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setGlowTheme(t)}
                        className={`flex-1 py-2 border text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all duration-300 cursor-pointer ${btnClass}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <button
                  onClick={exportPortfolioCard}
                  disabled={isExporting}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer bg-white text-black hover:bg-gray-200 disabled:opacity-50"
                >
                  {isExporting ? (
                    <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> EXPORTING</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> Download</>
                  )}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const card = document.getElementById('journalist-portfolio-card');
                      if (!card) return;
                      const canvas = await html2canvas(card, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 });
                      canvas.toBlob(async (blob) => {
                        if (!blob) return;
                        if (navigator.share) {
                          await navigator.share({
                            title: 'Journalist Portfolio Card',
                            files: [new File([blob], 'portfolio-card.png', { type: 'image/png' })]
                          });
                        }
                      });
                    } catch { /* user cancelled or unsupported */ }
                  }}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={async () => {
                    try {
                      const card = document.getElementById('journalist-portfolio-card');
                      if (!card) return;
                      const canvas = await html2canvas(card, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 });
                      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
                      if (!blob) return;
                      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    } catch { /* fallback silently */ }
                  }}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
