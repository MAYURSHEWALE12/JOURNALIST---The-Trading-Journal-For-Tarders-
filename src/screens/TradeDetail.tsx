import React from 'react';
import { ChevronLeft, BookOpen, Compass, Camera, Share2, Download, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TradeDetailSkeleton } from '../components/Skeleton';
import { getWeekOfMonth, getDirectImageUrl } from '../types';
import Seo from '../components/Seo';
import LogoIcon from '../components/LogoIcon';
import html2canvas from 'html2canvas-pro';

export default function TradeDetail() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const {
    themeClasses, isDarkMode, trades,
    handleOpenEditTrade,
    setDeleteConfirmId, setSelectedScreenshot,
    dataLoading, user
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [shareType, setShareType] = React.useState<'pnl' | 'roi' | 'both'>('both');
  const [leverage, setLeverage] = React.useState<number>(10);
  const [isExporting, setIsExporting] = React.useState(false);

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

  const rawCost = (trade.quantity * trade.entryPrice);
  const rawRoi = rawCost > 0 ? (trade.netPnl / rawCost) * 100 : 0;
  const computedRoi = rawRoi * leverage;

  const exportCardImage = async () => {
    const cardElement = document.getElementById('journalist-share-card');
    if (!cardElement) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 3, // Ultra-high resolution 3x scale for professional social posts
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Journalist_${trade.asset}_ShareCard.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto fade-in-on-scroll is-visible">
      <Seo 
        title={`Trade Analysis: ${trade.asset}`} 
        description={`Detailed trading journal analysis of the ${trade.direction} trade on ${trade.asset}. Realized R-Multiple: ${trade.realizedR}R.`}
        path={`/trade/${tradeId}`} 
      />
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
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer border-indigo-800/40 bg-indigo-900/10 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Card
          </button>
          <button
            onClick={() => handleOpenEditTrade(trade)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-white hover:text-white`}
          >
            ✏️ Edit Trade
          </button>
          <button
            onClick={() => setDeleteConfirmId(trade.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer border-rose-800/40 bg-rose-900/10 text-rose-400 hover:border-rose-500 hover:bg-rose-900/20"
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
                  onClick={() => setSelectedScreenshot(getDirectImageUrl(screenshots[activeImageIndex]))}
                >
                  <img
                    src={getDirectImageUrl(screenshots[activeImageIndex])}
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
                          src={getDirectImageUrl(url)}
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

      {/* Share Card Modal Overlay */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
          <div className="flex flex-col items-center gap-6 my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center w-full max-w-sm px-2">
              <span className="text-white font-mono text-xs uppercase tracking-widest font-bold">Generate PNL Card</span>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The Sharable Card DOM Target */}
            <div 
              id="journalist-share-card"
              className="w-[340px] aspect-[4/5] bg-gradient-to-br from-[#0e0e11] via-[#09090b] to-[#040405] border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl shrink-0"
            >
              {/* Rotating Logo Watermark */}
              <div className="absolute right-[-30px] top-[-35px] w-56 h-56 text-white/[0.03] rotate-[15deg] pointer-events-none select-none">
                <LogoIcon className="w-full h-full text-white" isDark={true} />
              </div>

              {/* Top User Profile block */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase overflow-hidden relative shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user?.username?.slice(0, 2) || 'TR'
                  )}
                </div>
                <div>
                  <div className="text-white text-xs font-bold font-mono">{user?.username || 'JournalistTrader'}</div>
                  <div className="text-gray-500 text-[9px] font-mono mt-0.5">
                    {user?.tradingBio || 'Systematic Trader'} &bull; {new Date(trade.entryTime).toISOString().slice(0, 10)}
                  </div>
                </div>
              </div>

              {/* Trade Details Block */}
              <div className="my-auto relative z-10 py-4">
                <div className="text-white font-display text-xl font-black uppercase tracking-tight">
                  {trade.asset}
                </div>
                
                <div className="mt-1 flex items-center gap-1.5 font-mono">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider ${
                    trade.direction === 'LONG' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {trade.direction}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-black tracking-wider bg-white/5 text-gray-400 border border-white/5">
                    {leverage}X Leverage
                  </span>
                </div>

                {/* Big P&L / ROI numbers */}
                <div className="mt-6 space-y-1">
                  {(shareType === 'pnl' || shareType === 'both') && (
                    <div>
                      {shareType === 'both' && <div className="text-gray-500 text-[8px] font-mono uppercase tracking-widest font-bold">Realized profit</div>}
                      <div className={`font-display text-4xl font-extrabold tracking-tighter ${
                        trade.netPnl >= 0 
                          ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.15)]' 
                          : 'text-rose-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.15)]'
                      }`}>
                        {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {(shareType === 'roi' || shareType === 'both') && (
                    <div className={shareType === 'both' ? 'pt-1.5' : ''}>
                      {shareType === 'both' && <div className="text-gray-500 text-[8px] font-mono uppercase tracking-widest font-bold">Return on Investment</div>}
                      <div className={`font-display font-extrabold tracking-tighter ${
                        shareType === 'both' ? 'text-lg font-bold' : 'text-4xl'
                      } ${
                        trade.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {trade.netPnl >= 0 ? '+' : ''}{computedRoi.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Prices Row */}
              <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-gray-500 font-bold font-mono">Entry Price</div>
                  <div className="text-white text-xs font-bold font-mono mt-0.5">
                    {Number(trade.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-gray-500 font-bold font-mono">Exit Price</div>
                  <div className="text-white text-xs font-bold font-mono mt-0.5">
                    {trade.exitPrice 
                      ? Number(trade.exitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) 
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Branding Footer bar */}
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

                {/* Dynamic Social Watermarks or QR Code */}
                {user?.twitterHandle || user?.telegramHandle ? (
                  <div className="text-right font-mono flex flex-col items-end justify-center">
                    {user.twitterHandle && (
                      <span className="text-[8px] font-bold text-gray-400" style={{ color: '#a3a3a3' }}>
                        𝕏 {user.twitterHandle}
                      </span>
                    )}
                    {user.telegramHandle && (
                      <span className="text-[7px] text-gray-500 mt-0.5" style={{ color: '#737373' }}>
                        ✈️ {user.telegramHandle}
                      </span>
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

            {/* Control Panel inside Modal */}
            <div className="space-y-4 font-mono text-xs w-full max-w-sm px-2">
              {/* Type Select */}
              <div>
                <label className="block text-[9px] uppercase text-gray-500 mb-1.5 font-bold">Select Information</label>
                <div className="flex gap-4">
                  {(['pnl', 'roi', 'both'] as const).map(t => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-white select-none">
                      <input
                        type="radio"
                        name="shareType"
                        checked={shareType === t}
                        onChange={() => setShareType(t)}
                        className="accent-indigo-500 cursor-pointer"
                      />
                      <span className="uppercase text-[9px] font-semibold">{t === 'both' ? 'PNL & ROI' : t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Leverage Selection */}
              <div>
                <label className="block text-[9px] uppercase text-gray-500 mb-1.5 font-bold">Leverage multiplier</label>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 3, 5, 10, 20, 50, 100].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLeverage(l)}
                      className={`px-2.5 py-1 border text-[10px] font-bold rounded transition cursor-pointer ${
                        leverage === l
                          ? 'bg-white text-black border-white'
                          : `${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-gray-500`
                      }`}
                    >
                      {l}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Download CTA Button */}
              <button
                onClick={exportCardImage}
                disabled={isExporting}
                className="w-full py-3 mt-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer bg-white text-black hover:bg-gray-200"
              >
                {isExporting ? (
                  <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> EXPORTING...</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> DOWNLOAD CARD IMAGE</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
