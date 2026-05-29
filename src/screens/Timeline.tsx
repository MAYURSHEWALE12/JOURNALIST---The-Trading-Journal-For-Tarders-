import { BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimelineSkeleton } from '../components/Skeleton';
import { getWeekOfMonth, getShortTradeId, getDirectImageUrl } from '../types';
import Seo from '../components/Seo';

export default function Timeline() {
  const { themeClasses, isDarkMode, activeTrades, setSelectedScreenshot, dataLoading } = useApp();

  if (dataLoading) {
    return <TimelineSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Seo title="Journal Timeline Feed" path="/timeline" />

      <div>
        <h2 className={`text-xl font-display font-semibold ${themeClasses.textMain}`}>Interactive Journal Feed</h2>
        <p className={`text-xs ${themeClasses.textSub}`}>Review detailed qualitative trade setups in a Notion-inspired workspace timeline.</p>
      </div>

      <div className={`relative border-l pl-4 md:pl-6 space-y-8 font-sans ${themeClasses.border}`}>
        {activeTrades.map((t) => (
          <div key={t.id} className="relative">
            <div className={`absolute left-[-21px] md:left-[-29px] top-1.5 w-2 h-2 rounded-full ring-4 ${isDarkMode ? 'bg-white ring-black' : 'bg-black ring-white'}`} />

            <div className={`border rounded p-4 md:p-5 hover:border-gray-400 transition space-y-3 ${themeClasses.bgPanel} ${themeClasses.border}`}>

              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  <span className={`text-xs font-mono font-medium ${themeClasses.textSub}`}>{getShortTradeId(t.id)}</span>
                  <h3 className={`font-display font-bold text-base ${themeClasses.textMain}`}>{t.asset}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.direction === 'LONG' ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                    {t.direction}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-500/10">
                    {new Date(t.entryTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {getWeekOfMonth(t.entryTime)}{' '}
                    {new Date(t.entryTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                    {t.exitTime ? ` - ${new Date(t.exitTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}` : ''}
                  </span>
                </div>
                <span className={`text-[11px] font-bold font-mono ${themeClasses.textMain}`}>
                  {t.netPnl >= 0 ? `+$${t.netPnl.toFixed(2)}` : `-$${Math.abs(t.netPnl).toFixed(2)}`}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-semibold ${themeClasses.border} ${themeClasses.textMain}`}>{t.strategy}</span>
                {t.tags.map((tag, i) => (
                  <span key={i} className={`text-[10px] border px-2 py-0.5 rounded font-mono ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textSub}`}>#{tag}</span>
                ))}
              </div>

              <p className={`text-xs leading-relaxed font-sans mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.notes}</p>

              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Mindset State:</span>
                {t.emotionalState.map((em, i) => (
                  <span key={i} className="text-[10px] border border-brand-amber/20 text-brand-amber px-2 py-0.5 rounded font-mono font-semibold">
                    <BookOpen className="w-3 h-3 inline mr-0.5" />
                    {em}
                  </span>
                ))}
              </div>

              {t.screenshotUrl && (
                <div className={`mt-4 rounded overflow-hidden border max-h-60 max-w-full sm:max-w-lg cursor-pointer transition hover:border-gray-500 ${themeClasses.border}`} onClick={() => setSelectedScreenshot(getDirectImageUrl(t.screenshotUrl) || null)}>
                  <img src={getDirectImageUrl(t.screenshotUrl)} alt={`${t.asset} screenshot`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-300" />
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
