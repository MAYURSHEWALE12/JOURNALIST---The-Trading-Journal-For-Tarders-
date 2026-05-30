import React from 'react';
import { ChevronLeft, BookOpen, Compass, Camera, Share2, Download, X, Pencil, Trash2 } from 'lucide-react';
import { getEmotionIcon } from '../components/NewTradeModal';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TradeDetailSkeleton } from '../components/Skeleton';
import { getWeekOfMonth, getDirectImageUrl } from '../types';
import Seo from '../components/Seo';
import LogoIcon from '../components/LogoIcon';
import html2canvas from 'html2canvas-pro';

const formatTradeTime = (entryStr: string, exitStr: string | null) => {
  const entryDate = new Date(entryStr);
  const entryFormatted = entryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + 
    ', ' + entryDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    
  if (!exitStr) return `${entryFormatted} (${getWeekOfMonth(entryStr)})`;
  
  const exitDate = new Date(exitStr);
  const isSameDay = entryDate.toDateString() === exitDate.toDateString();
  
  const exitFormatted = isSameDay 
    ? exitDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : exitDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + 
      ', ' + exitDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      
  return `${entryFormatted} (${getWeekOfMonth(entryStr)}) ➔ ${exitFormatted}`;
};

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
  const [glowTheme, setGlowTheme] = React.useState<'slate' | 'emerald' | 'indigo'>('indigo');
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    if (isShareModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isShareModalOpen]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer ${themeClasses.textSub} hover:text-white self-start`}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Logs
        </button>
        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border rounded-lg text-[10px] sm:text-xs font-mono uppercase tracking-widest transition cursor-pointer whitespace-nowrap ${
              isDarkMode 
                ? 'border-indigo-800/40 bg-indigo-900/10 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20' 
                : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-100'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Share Card
          </button>
          <button
            onClick={() => handleOpenEditTrade(trade)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border rounded-lg text-[10px] sm:text-xs font-mono uppercase tracking-widest transition cursor-pointer whitespace-nowrap ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} ${
              isDarkMode ? 'hover:border-white hover:text-white' : 'hover:border-gray-500 hover:text-gray-900'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Trade
          </button>
          <button
            onClick={() => setDeleteConfirmId(trade.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border rounded-lg text-[10px] sm:text-xs font-mono uppercase tracking-widest transition cursor-pointer whitespace-nowrap ${
              isDarkMode 
                ? 'border-rose-800/40 bg-rose-900/10 text-rose-400 hover:border-rose-500 hover:bg-rose-900/20' 
                : 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-400 hover:bg-rose-100'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className={`border rounded-xl p-6 md:p-8 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-6 ${isDarkMode ? 'border-border-subtle' : 'border-gray-200'}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className={`font-display text-2xl md:text-4xl font-black ${themeClasses.textMain}`}>{trade.asset}</h2>
              <span className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider rounded border ${trade.status === 'WIN' ? (isDarkMode ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald' : 'border-emerald-300 bg-emerald-100 text-emerald-800') : trade.status === 'LOSS' ? (isDarkMode ? 'border-brand-rose/40 bg-brand-rose/10 text-brand-rose' : 'border-rose-300 bg-rose-100 text-rose-800') : (isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-300 bg-gray-200 text-gray-700')}`}>
                {trade.status}
              </span>
            </div>
            <div className={`text-sm font-mono flex flex-wrap items-center gap-x-4 gap-y-1.5 ${themeClasses.textSub}`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${trade.direction === 'LONG' ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                {trade.direction}
              </span>
              <span className="hidden xs:inline">|</span>
              <span>{trade.strategy}</span>
              <span>|</span>
              <span className="text-[11px] sm:text-xs whitespace-nowrap opacity-90">{formatTradeTime(trade.entryTime, trade.exitTime)}</span>
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
                  <span key={i} className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-semibold rounded border ${isDarkMode ? 'border-brand-amber/30 text-brand-amber bg-brand-amber/5' : 'border-amber-300 text-amber-700 bg-amber-50'}`}>
                    {getEmotionIcon(em)} {em}
                  </span>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start sm:items-center justify-center p-3 pt-4 sm:p-6 overflow-y-auto select-none">
          <div className="w-full max-w-[420px] sm:max-w-xl bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-white/[0.06] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-white/[0.04]">
              <span className="text-white/80 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold">
                Generate PNL Card
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
                  id="journalist-share-card"
                  className="w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[340px] aspect-[4/5] rounded-2xl p-5 sm:p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl border transition-all duration-300"
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
                  {/* Ambient Glow Orb */}
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

                  {/* Top Section: Avatar + User Info */}
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
                      <div className="text-xs font-bold font-mono text-white">{user?.username || 'JournalistTrader'}</div>
                      <div className="text-[9px] font-mono mt-0.5" style={{ color: '#a3a3a3' }}>
                        {user?.tradingBio || 'Systematic Trader'} &bull; {new Date(trade.entryTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Center Section: Trade Info + Hero Metric */}
                  <div className="my-auto relative z-10 py-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-white font-display text-xl font-black uppercase tracking-tight">{trade.asset}</div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider border ${
                        trade.status === 'WIN'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : trade.status === 'LOSS'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>{trade.status}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider border ${
                        trade.direction === 'LONG'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>{trade.direction}</span>
                    </div>

                    <div className="text-[9px] font-mono mt-1.5" style={{ color: '#737373' }}>{trade.strategy}</div>

                    {/* Hero P&L */}
                    <div className="mt-6">
                      <div className="text-[8px] font-mono uppercase tracking-widest font-bold leading-none" style={{ color: '#737373' }}>Net Realized P&L</div>
                      <div
                        className="mt-1 font-display text-4xl sm:text-4.5xl font-black tracking-tight leading-none"
                        style={{
                          color: trade.netPnl >= 0 ? '#34d399' : '#f87171'
                        }}
                      >
                        {trade.netPnl >= 0 ? '+' : ''}${Math.abs(trade.netPnl).toFixed(2)}
                      </div>
                    </div>

                    {/* ROI section */}
                    {(shareType === 'roi' || shareType === 'both') && (
                      <div className="mt-3">
                        <div
                          className="font-display text-sm sm:text-base font-bold tracking-tight"
                          style={{
                            color: trade.netPnl >= 0 ? '#34d399' : '#f87171'
                          }}
                        >
                          {trade.netPnl >= 0 ? '+' : ''}{computedRoi.toFixed(2)}% ROI {shareType === 'both' && <span className="text-xs font-mono font-normal" style={{ color: '#737373' }}>({leverage}x)</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 border-t pt-4 relative z-10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-[8px] uppercase tracking-wider font-bold font-mono leading-none" style={{ color: '#737373' }}>Entry</div>
                      <div className="text-xs font-semibold font-mono mt-1.5 text-white">${Number(trade.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-wider font-bold font-mono leading-none" style={{ color: '#737373' }}>Exit</div>
                      <div className="text-xs font-semibold font-mono mt-1.5 text-white">
                        {trade.exitPrice ? '$' + Number(trade.exitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-wider font-bold font-mono leading-none" style={{ color: '#737373' }}>R Multiple</div>
                      <div
                        className="text-xs font-semibold font-mono mt-1.5"
                        style={{
                          color: trade.realizedR >= trade.plannedR ? '#34d399' : (trade.status === 'LOSS' ? '#f87171' : '#ffffff')
                        }}
                      >
                        {trade.realizedR}R
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
                        <div className="text-[10px] font-extrabold font-display tracking-tight leading-none text-white">JOURNALIST</div>
                        <div className="text-[7px] font-mono mt-0.5 leading-none" style={{ color: '#737373' }}>Single Trade Showcase</div>
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
            <div className="px-4 sm:px-6 pt-3 sm:pt-4 space-y-3 font-mono text-xs">
              {/* Glow Theme */}
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

              {/* Type Select */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest mb-2 font-bold" style={{ color: '#737373' }}>Show On Card</label>
                <div className="flex gap-2">
                  {(['pnl', 'roi', 'both'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setShareType(t)}
                      className={`flex-1 py-1.5 border rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition cursor-pointer ${
                        shareType === t
                          ? 'bg-white text-black border-white'
                          : `${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-gray-500 hover:text-white`
                      }`}
                    >
                      {t === 'both' ? 'Both' : t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leverage Selection */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest mb-2 font-bold" style={{ color: '#737373' }}>Leverage multiplier</label>
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
            </div>

            {/* Action Bar */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-3 border-t border-white/[0.06] mt-3">
              <button
                onClick={exportCardImage}
                disabled={isExporting}
                className="w-full py-2.5 sm:py-3 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer bg-white text-black hover:bg-gray-200 disabled:opacity-50"
              >
                {isExporting ? (
                  <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> EXPORTING</>
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
