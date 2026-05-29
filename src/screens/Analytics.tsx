import { useApp } from '../context/AppContext';
import { Cell, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsSkeleton } from '../components/Skeleton';
import { exportTradesToPDF } from '../lib/pdfExporter';

export default function Analytics() {
  const { themeClasses, isDarkMode, activeTrades, computedStats, dataLoading, activeAccountId, accounts, user, calendarDays, setIsExportingPDF } = useApp();

  if (dataLoading) {
    return <AnalyticsSkeleton />;
  }

  if (activeTrades.length === 0) {
    return (
      <div className={`border rounded p-12 text-center max-w-xl mx-auto space-y-5 my-12 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
        </div>
        <div className="space-y-2">
          <h3 className={`font-display font-bold text-lg ${themeClasses.textMain}`}>No trades logged yet</h3>
          <p className={`text-xs max-w-md mx-auto leading-relaxed ${themeClasses.textSub}`}>
            Analytics require at least one active trade record. Head to the dashboard and log a trade entry to unlock statistical insights, R-ratio distributions, and diagnostic tag matrices.
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-display font-semibold ${themeClasses.textMain}`}>Systematic Analytics Core</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>Discover statistical edges, duration efficiencies, and risk profiles in stark layout.</p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`border rounded p-5 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider font-mono block mb-4 ${themeClasses.textMain}`}>Planned R-Ratio vs Realized R-Ratio Scatter</span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" dataKey="plannedR" name="Planned R" stroke="rgba(128,128,128,0.5)" fontSize={10} unit="R" />
                <YAxis type="number" dataKey="realizedR" name="Realized R" stroke="rgba(128,128,128,0.5)" fontSize={10} unit="R" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Trades Performance" data={activeTrades}>
                  {activeTrades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'WIN' ? '#10b981' : '#f43f5e'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`border rounded p-5 flex flex-col justify-between ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider font-mono block mb-4 ${themeClasses.textMain}`}>Outcome Distribution Donut</span>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {outcomesData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`flex justify-around items-center text-xs border-t pt-3 font-mono ${themeClasses.border} ${themeClasses.textSub}`}>
            <span className="font-semibold">● Wins: {computedStats.wins}</span>
            <span className="font-semibold">● Losses: {computedStats.losses}</span>
            <span className="font-semibold">● Breakevens: {activeTrades.filter(t => t.status === 'BREAKEVEN').length}</span>
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
    </div>
  );
}
