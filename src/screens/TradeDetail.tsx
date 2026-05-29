import React from 'react';
import { ChevronLeft, BookOpen, Compass, Camera } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TradeDetailSkeleton } from '../components/Skeleton';
import { getWeekOfMonth } from '../types';

export default function TradeDetail() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const {
    themeClasses, isDarkMode, trades,
    handleOpenEditTrade,
    setDeleteConfirmId, setSelectedScreenshot,
    dataLoading
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  if (dataLoading) {
    return <TradeDetailSkeleton />;
  }

  const trade = trades.find(t => t.id === tradeId);
  if (!trade) {
    return (
      <div className={`max-w-5xl mx-auto p-12 border rounded text-center font-mono text-sm ${themeClasses.bgPanel} ${themeClasses.border} ${themeClasses.textSub}`}>
        <p>Trade record not found.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className={`mt-4 px-4 py-2 border rounded text-xs transition ${themeClasses.bgCard} ${themeClasses.border} hover:border-gray-400 text-white`}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const screenshots = trade.screenshotUrls && trade.screenshotUrls.length > 0
    ? trade.screenshotUrls
    : (trade.screenshotUrl ? [trade.screenshotUrl] : []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto fade-in-on-scroll is-visible">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer ${themeClasses.textSub} hover:text-white`}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Logs
        </button>
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditTrade(trade)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-white hover:text-white`}
          >
            ✏️ Edit Trade
          </button>
          <button
            onClick={() => setDeleteConfirmId(trade.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer border-rose-800/40 bg-rose-900/10 text-rose-400 hover:border-rose-500 hover:bg-rose-900/20`}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className={`border rounded p-6 md:p-8 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-6 ${isDarkMode ? 'border-border-subtle' : 'border-gray-200'}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className={`font-display text-2xl md:text-4xl font-black ${themeClasses.textMain}`}>{trade.asset}</h2>
              <span className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider rounded border ${trade.status === 'WIN' ? (isDarkMode ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald' : 'border-emerald-300 bg-emerald-100 text-emerald-800') : trade.status === 'LOSS' ? (isDarkMode ? 'border-brand-rose/40 bg-brand-rose/10 text-brand-rose' : 'border-rose-300 bg-rose-100 text-rose-800') : (isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-300 bg-gray-200 text-gray-700')}`}>
                {trade.status}
              </span>
            </div>
            <div className={`text-sm font-mono flex flex-wrap items-center gap-x-4 gap-y-1 ${themeClasses.textSub}`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${trade.direction === 'LONG' ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                {trade.direction}
              </span>
              <span>|</span>
              <span>{trade.strategy}</span>
              <span>|</span>
              <span>{new Date(trade.entryTime).toLocaleString()} ({getWeekOfMonth(trade.entryTime)}){trade.exitTime ? ` - ${new Date(trade.exitTime).toLocaleString()}` : ''}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-mono uppercase tracking-wider mb-1 ${themeClasses.textSub}`}>Net Result</div>
            <div className={`font-display text-2xl md:text-3xl font-bold ${trade.netPnl >= 0 ? (isDarkMode ? 'text-brand-emerald' : 'text-emerald-600') : (isDarkMode ? 'text-brand-rose' : 'text-rose-600')}`}>
              {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${themeClasses.textSub}`}>Entry Price</div>
            <div className={`font-mono text-lg ${themeClasses.textMain}`}>${trade.entryPrice}</div>
          </div>
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${themeClasses.textSub}`}>Exit Price</div>
            <div className={`font-mono text-lg ${themeClasses.textMain}`}>${trade.exitPrice}</div>
          </div>
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${themeClasses.textSub}`}>Lot Size</div>
            <div className={`font-mono text-lg ${themeClasses.textMain}`}>{trade.quantity}</div>
          </div>
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${themeClasses.textSub}`}>Realized R</div>
            <div className={`font-mono text-lg ${trade.realizedR >= trade.plannedR ? (isDarkMode ? 'text-brand-emerald' : 'text-emerald-600') : themeClasses.textMain}`}>{trade.realizedR}R</div>
          </div>
        </div>

        {/* Tags & Psychology */}
        <div className={`flex flex-col md:flex-row gap-8 border-t pt-6 ${isDarkMode ? 'border-border-subtle' : 'border-gray-200'}`}>
          {trade.tags.length > 0 && (
            <div>
              <div className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${themeClasses.textSub}`}>Setup Tags</div>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map((tag, i) => (
                  <span key={i} className={`px-2.5 py-1 text-[10px] font-mono rounded border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textSub}`}>#{tag}</span>
                ))}
              </div>
            </div>
          )}
          {trade.emotionalState.length > 0 && (
            <div>
              <div className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${themeClasses.textSub}`}>Psychology & State</div>
              <div className="flex flex-wrap gap-2">
                {trade.emotionalState.map((em, i) => (
                  <span key={i} className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded border ${isDarkMode ? 'border-brand-amber/30 text-brand-amber bg-brand-amber/5' : 'border-amber-300 text-amber-700 bg-amber-50'}`}>🎭 {em}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border rounded p-4 md:p-8 flex flex-col h-full ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`flex items-center gap-2 mb-6 border-b pb-4 ${isDarkMode ? 'border-border-subtle' : 'border-gray-200'}`}>
            <BookOpen className={`w-4 h-4 ${themeClasses.textSub}`} />
            <h3 className={`font-mono text-sm uppercase tracking-widest font-semibold ${themeClasses.textMain}`}>Journal Notes</h3>
          </div>
          <div className={`font-sans text-sm leading-relaxed whitespace-pre-wrap flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {trade.notes || "No notes were provided for this trade setup."}
          </div>
        </div>

        <div className={`border rounded p-4 md:p-8 flex flex-col h-full ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className={`flex items-center gap-2 mb-6 border-b pb-4 ${isDarkMode ? 'border-border-subtle' : 'border-gray-200'}`}>
            <Compass className={`w-4 h-4 ${themeClasses.textSub}`} />
            <h3 className={`font-mono text-sm uppercase tracking-widest font-semibold ${themeClasses.textMain}`}>Chart Evidence</h3>
          </div>
          <div className="flex-1 flex flex-col justify-between min-h-[300px]">
            {screenshots.length > 0 ? (
              <div className="space-y-4 w-full h-full flex flex-col">
                <div
                  className={`flex-1 relative group cursor-zoom-in rounded overflow-hidden border aspect-video flex items-center justify-center bg-black/5 ${isDarkMode ? 'border-border-subtle bg-white/5' : 'border-gray-300'}`}
                  onClick={() => setSelectedScreenshot(screenshots[activeImageIndex])}
                >
                  <img
                    src={screenshots[activeImageIndex]}
                    alt={`Trade Chart ${activeImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white font-mono text-xs uppercase tracking-widest border border-white/30 px-3 py-1.5 rounded backdrop-blur-sm bg-black/30">View Fullscreen</span>
                  </div>

                  {screenshots.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 text-white hover:bg-white hover:text-black border border-white/20 transition-all backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 text-white hover:bg-white hover:text-black border border-white/20 transition-all backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                      >
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </>
                  )}
                </div>

                {screenshots.length > 1 && (
                  <div className="flex flex-wrap gap-2 justify-center py-2">
                    {screenshots.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-12 h-12 rounded overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                          idx === activeImageIndex
                            ? (isDarkMode ? 'border-white scale-105' : 'border-black scale-105')
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover grayscale"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 font-mono text-xs max-w-[200px]">
                  <div className={`w-12 h-12 mx-auto rounded-full border border-dashed flex items-center justify-center mb-3 ${themeClasses.border}`}>
                    <Camera className="w-4 h-4 opacity-50" />
                  </div>
                  No screenshot evidence attached to this log.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
