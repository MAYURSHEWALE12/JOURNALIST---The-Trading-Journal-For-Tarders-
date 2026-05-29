import { useApp } from '../context/AppContext';
import { Cell, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsSkeleton } from '../components/Skeleton';
import { exportTradesToPDF } from '../lib/pdfExporter';
import JournalistScore from '../components/JournalistScore';
import Seo from '../components/Seo';
import LogoIcon from '../components/LogoIcon';
import { computeJournalistScore } from '../lib/journalistScore';
import { memo, useState } from 'react';
import { Share2, Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';

const CustomScatterTooltip = memo(function CustomScatterTooltip({ active, payload, isDarkMode }: any) {
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

const CustomDonutTooltip = memo(function CustomDonutTooltip({ active, payload, isDarkMode }: any) {
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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [glowTheme, setGlowTheme] = useState<'slate' | 'emerald' | 'indigo'>('indigo');
  const [isExporting, setIsExporting] = useState(false);

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
    { name: 'Wins', value: computedStats.wins, color: '#10b981' },
    { name: 'Losses', value: computedStats.losses, color: '#f43f5e' },
    { name: 'Breakeven', value: activeTrades.filter(t => t.status === 'BREAKEVEN').length, color: '#9ca3af' }
  ];

  const uniqueTags = Array.from(new Set(activeTrades.flatMap(t => t.tags || [])));
  const winRate = activeTrades.length > 0 ? Math.round((computedStats.wins / activeTrades.length) * 100) : 0;

  const scoreObj = computeJournalistScore(activeTrades);
  const activeAccountName = accounts.find(a => a.id === activeAccountId)?.name || 'Default Account';

  const exportPortfolioCard = async () => {
    const cardElement = document.getElementById('journalist-portfolio-card');
    if (!cardElement) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        backgroundColor: null,
        scale: 3, // Ultra-high resolution for professional look
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
    <div className="space-y-6">
      <Seo title="Advanced Analytics & Statistics" path="/analytics" />
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-display font-semibold ${themeClasses.textMain}`}>Systematic Analytics Core</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>Discover statistical edges, duration efficiencies, and risk profiles in stark layout.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer border-indigo-800/40 bg-indigo-900/10 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Performance
          </button>
          <button
            onClick={() => alert('Exporting portfolio metrics to CSV...')}
            className={`px-3.5 py-1.5 border text-xs rounded transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
          >
            Export CSV
          </button>
          <button
            onClick={async () => { setIsExportingPDF(true); try { await exportTradesToPDF(activeTrades, computedStats, accounts.find(a => a.id === activeAccountId), user, calendarDays); } finally { setIsExportingPDF(false); } }}
            className={`px-3.5 py-1.5 border text-xs rounded transition cursor-pointer font-bold ${
              isDarkMode ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-black text-white border-black hover:bg-gray-800'
            }`}
          >
            Export PDF Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1">
          <JournalistScore trades={activeTrades} themeClasses={themeClasses} isDarkMode={isDarkMode} className="h-full" />
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
                    <Scatter name="Trades Performance" data={activeTrades}>
                      {activeTrades.map((entry, index) => (
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
                  <span className="font-semibold text-gray-400">● Breakevens: {activeTrades.filter(t => t.status === 'BREAKEVEN').length}</span>
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
              const tagTrades = activeTrades.filter(t => (t.tags || []).includes(tag));
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

      {/* Portfolio Performance Card Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
          <div className="flex flex-col items-center gap-6 my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center w-full max-w-sm px-2">
              <span className="text-white font-mono text-xs uppercase tracking-widest font-bold">Generate Performance Card</span>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The Sharable Card Container */}
            <div 
              id="journalist-portfolio-card"
              className="w-[340px] aspect-[4/5] bg-gradient-to-br from-[#0e0e11] via-[#09090b] to-[#040405] border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl shrink-0"
            >
              {/* Rotating Logo Watermark */}
              <div className="absolute right-[-30px] top-[-35px] w-56 h-56 text-white/[0.03] rotate-[15deg] pointer-events-none select-none">
                <LogoIcon className="w-full h-full text-white" isDark={true} />
              </div>

              {/* User Profile Header */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                  {user?.username?.slice(0, 2) || 'TR'}
                </div>
                <div>
                  <div className="text-white text-xs font-bold font-mono">{user?.username || 'JournalistTrader'}</div>
                  <div className="text-gray-500 text-[9px] font-mono mt-0.5">
                    Portfolio &bull; {activeAccountName}
                  </div>
                </div>
              </div>

              {/* Core Account Performance Stats */}
              <div className="my-auto relative z-10 py-2">
                <div className="text-gray-500 text-[8px] font-mono uppercase tracking-widest font-bold leading-none">Net cumulative profit</div>
                
                {/* Huge PNL display with selective Glow themes */}
                <div className={`mt-1 font-display text-4.5xl font-black tracking-tight leading-none ${
                  computedStats.totalPnl >= 0 
                    ? glowTheme === 'emerald' 
                      ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                      : glowTheme === 'indigo'
                        ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                    : 'text-rose-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.15)]'
                }`}>
                  {computedStats.totalPnl >= 0 ? '+' : ''}${computedStats.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* Sub-KPI Grid */}
                <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-gray-500 font-bold font-mono leading-none">Win Rate</div>
                    <div className="text-white text-sm font-bold font-mono mt-1.5">{winRate}%</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-gray-500 font-bold font-mono leading-none">Profit Factor</div>
                    <div className="text-white text-sm font-bold font-mono mt-1.5">{computedStats.profitFactor}x</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-gray-500 font-bold font-mono leading-none">Journal Score</div>
                    <div className="text-indigo-400 text-sm font-bold font-mono mt-1.5">{scoreObj.score}</div>
                  </div>
                </div>
              </div>

              {/* Lower detailed metadata */}
              <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 relative z-10 font-mono">
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">Total Trades</div>
                  <div className="text-white text-xs font-semibold mt-0.5">{activeTrades.length} documented</div>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">Journalist Level</div>
                  <div className="text-indigo-400 text-[10px] font-semibold mt-0.5 uppercase tracking-wide leading-tight">
                    {scoreObj.levelLabel}
                  </div>
                </div>
              </div>

              {/* Branding Footer */}
              <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between relative z-10 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-white text-black flex items-center justify-center p-0.5 shrink-0">
                    <LogoIcon className="w-3.5 h-3.5" isDark={false} />
                  </div>
                  <div>
                    <div className="text-white text-[10px] font-extrabold font-display tracking-tight leading-none">JOURNALIST</div>
                    <div className="text-gray-500 text-[7px] font-mono mt-0.5 leading-none">Systematic Portfolio Core</div>
                  </div>
                </div>

                {/* Vector QR Code mock */}
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
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-4 font-mono text-xs w-full max-w-sm px-2">
              {/* Theme selection */}
              <div>
                <label className="block text-[9px] uppercase text-gray-500 mb-1.5 font-bold">Select Glow Theme</label>
                <div className="flex gap-2">
                  {(['slate', 'emerald', 'indigo'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setGlowTheme(t)}
                      className={`px-3 py-1 border text-[10px] font-bold rounded-lg uppercase transition cursor-pointer ${
                        glowTheme === t
                          ? 'bg-white text-black border-white'
                          : `${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-gray-500`
                      }`}
                    >
                      {t} Glow
                    </button>
                  ))}
                </div>
              </div>

              {/* Download CTA */}
              <button
                onClick={exportPortfolioCard}
                disabled={isExporting}
                className="w-full py-3 mt-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer bg-white text-black hover:bg-gray-200"
              >
                {isExporting ? (
                  <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> EXPORTING...</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> DOWNLOAD ACCOUNT CARD</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
