import { useApp } from '../context/AppContext';
import { Cell, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsSkeleton } from '../components/Skeleton';

export default function Analytics() {
  const { themeClasses, isDarkMode, activeTrades, computedStats, dataLoading } = useApp();

  if (dataLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-display font-semibold ${themeClasses.textMain}`}>Systematic Analytics Core</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>Discover statistical edges, duration efficiencies, and risk profiles in stark layout.</p>
        </div>
        <button
          onClick={() => alert('Exporting portfolio metrics to CSV...')}
          className={`px-3.5 py-1.5 border text-xs rounded transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
        >
          Export Metrics
        </button>
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
                    data={[
                      { name: 'Wins', value: computedStats.wins },
                      { name: 'Losses', value: computedStats.losses },
                      { name: 'Breakeven', value: activeTrades.filter(t => t.status === 'BREAKEVEN').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                    <Cell fill="#9ca3af" />
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
          {Array.from(new Set(activeTrades.flatMap(t => t.tags))).map((tag, i) => {
            const tagTrades = activeTrades.filter(t => t.tags.includes(tag));
            const wins = tagTrades.filter(t => t.status === 'WIN').length;
            const wr = Math.round((wins / tagTrades.length) * 100);

            return (
              <div key={i} className={`border rounded px-3.5 py-2 flex items-center space-x-3 transition ${themeClasses.bgCard} ${themeClasses.border}`}>
                <span className={`text-xs font-bold font-mono ${themeClasses.textMain}`}>#{tag}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>{wr}% WR</span>
                <span className="text-[10px] text-gray-500 font-mono">{tagTrades.length} entries</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
