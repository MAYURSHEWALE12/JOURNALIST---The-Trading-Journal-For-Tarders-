import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchMonthNotes, upsertDayNote } from '../lib/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  TrendingUp, 
  StickyNote,
  X
} from 'lucide-react';
import { getDirectImageUrl, getShortTradeId, type Trade } from '../types';
import Seo from '../components/Seo';
import { useNavigate } from 'react-router-dom';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
  const navigate = useNavigate();
  const { themeClasses, isDarkMode, activeTrades, user } = useApp();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ day: number; trades: Trade[]; date: string } | null>(null);
  const [dayNote, setDayNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [dayNotes, setDayNotes] = useState<Record<string, string>>({});
  const [dayNoteIds, setDayNoteIds] = useState<Record<string, string>>({});

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  useEffect(() => {
    fetchMonthNotes(monthKey).then(notes => {
      const contentMap: Record<string, string> = {};
      const idMap: Record<string, string> = {};
      for (const n of notes) {
        contentMap[n.date] = n.content;
        idMap[n.date] = n.id;
      }
      setDayNotes(contentMap);
      setDayNoteIds(idMap);
    }).catch(() => {});
  }, [monthKey]);

  const handleSaveDayNote = async (date: string, content: string) => {
    const existingId = dayNoteIds[date];
    await upsertDayNote(date, content, existingId, user?.id);
    setDayNotes(prev => {
      const next = { ...prev };
      if (content.trim()) {
        next[date] = content.trim();
      } else {
        delete next[date];
      }
      return next;
    });
    if (!existingId && content.trim()) {
      // Fetch again to get the new server-assigned ID
      fetchMonthNotes(monthKey).then(notes => {
        const idMap: Record<string, string> = {};
        for (const n of notes) idMap[n.date] = n.id;
        setDayNoteIds(idMap);
      }).catch(() => {});
    }
    if (!content.trim() && existingId) {
      setDayNoteIds(prev => { const next = { ...prev }; delete next[date]; return next; });
    }
  };

  // iOS Drag-to-Dismiss Gesture States
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleDragStart = (clientY: number) => {
    if (window.innerWidth >= 640) return; // Disable dragging on desktop
    setIsDragging(true);
    setStartY(clientY);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - startY;
    // Only allow dragging downwards
    if (delta > 0) {
      setTranslateY(delta);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // If pulled down by more than 100px, dismiss the modal
    if (translateY > 100) {
      setSelectedDayTrades(null);
    }
    setTranslateY(0);
  };

  // Navigation handlers
  const todayDate = new Date();
  const isNextMonthDisabled = currentYear > todayDate.getFullYear() || 
    (currentYear === todayDate.getFullYear() && currentMonth >= todayDate.getMonth());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compute calendar cells
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const cells: { day: number; isCurrentMonth: boolean; dateString: string }[] = [];

  // Padding days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayVal = prevMonthDays - i;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, dayVal);
    cells.push({
      day: dayVal,
      isCurrentMonth: false,
      dateString: prevMonthDate.toISOString().split('T')[0]
    });
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const currDateObj = new Date(currentYear, currentMonth, i);
    cells.push({
      day: i,
      isCurrentMonth: true,
      dateString: currDateObj.toISOString().split('T')[0]
    });
  }

  // Padding days for next month to complete the grid (usually multiples of 7)
  const remaining = 42 - cells.length; // Complete a 6-week layout (6 * 7 = 42)
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(currentYear, currentMonth + 1, i);
    cells.push({
      day: i,
      isCurrentMonth: false,
      dateString: nextMonthDate.toISOString().split('T')[0]
    });
  }

  // Group trades by date string "YYYY-MM-DD"
  const tradesByDate = activeTrades.reduce((acc, t) => {
    try {
      const dateStr = new Date(t.entryTime).toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(t);
    } catch {
      // Catch malformed date exceptions
    }
    return acc;
  }, {} as Record<string, Trade[]>);

  // Compute overall stats for the current visible month
  const monthlyAggregate = activeTrades.filter(t => {
    try {
      const d = new Date(t.entryTime);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    } catch {
      return false;
    }
  });

  const monthlyPnl = monthlyAggregate.reduce((sum, t) => sum + t.netPnl, 0);
  const monthlyWins = monthlyAggregate.filter(t => t.status === 'WIN').length;
  const monthlyWinRate = monthlyAggregate.length > 0 
    ? Math.round((monthlyWins / monthlyAggregate.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-12">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <Seo title="Trading Calendar" path="/calendar" />

      {/* Header Info Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl md:text-2xl font-display font-extrabold tracking-tight ${themeClasses.textMain}`}>
            Trading Calendar
          </h2>
          <p className={`text-xs md:text-sm font-sans mt-0.5 ${themeClasses.textSub}`}>
            Detailed monthly timeline overview of your aggregate execution performance.
          </p>
        </div>

        {/* Aggregated Quick-Stats bar (Grid-cols-3 to maintain identical uniform widths across both mobile and desktop) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full md:w-[420px] shrink-0">
          <div className={`px-2 py-1.5 sm:px-4 sm:py-2.5 border rounded-xl flex items-center gap-1.5 sm:gap-3 transition-colors duration-200 bg-white/40 dark:bg-white/[0.02] ${themeClasses.border} w-full justify-center sm:justify-start`}>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${monthlyPnl >= 0 ? 'bg-brand-emerald animate-pulse' : 'bg-brand-rose'} shrink-0`} />
            <div>
              <p className="text-[7px] sm:text-[9px] uppercase font-mono tracking-widest text-gray-400">Month PNL</p>
              <p className={`text-[10px] sm:text-xs md:text-sm font-mono font-bold leading-none mt-0.5 ${monthlyPnl >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                {monthlyPnl >= 0 ? '+' : ''}${monthlyPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          
          <div className={`px-2 py-1.5 sm:px-4 sm:py-2.5 border rounded-xl flex items-center gap-1.5 sm:gap-3 transition-colors duration-200 bg-white/40 dark:bg-white/[0.02] ${themeClasses.border} w-full justify-center sm:justify-start`}>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[7px] sm:text-[9px] uppercase font-mono tracking-widest text-gray-400">Win Rate</p>
              <p className={`text-[10px] sm:text-xs md:text-sm font-mono font-bold leading-none mt-0.5 ${themeClasses.textMain}`}>{monthlyWinRate}%</p>
            </div>
          </div>

          <div className={`px-2 py-1.5 sm:px-4 sm:py-2.5 border rounded-xl flex items-center gap-1.5 sm:gap-3 transition-colors duration-200 bg-white/40 dark:bg-white/[0.02] ${themeClasses.border} w-full justify-center sm:justify-start`}>
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[7px] sm:text-[9px] uppercase font-mono tracking-widest text-gray-400">Trades</p>
              <p className={`text-[10px] sm:text-xs md:text-sm font-mono font-bold leading-none mt-0.5 ${themeClasses.textMain}`}>{monthlyAggregate.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Navigation Box */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl transition-all duration-200 p-4 md:p-6 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        {/* Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevMonth}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textMain}`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              className={`p-2 rounded-xl border transition-all ${isNextMonthDisabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-gray-500'} ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textMain}`}
              title="Next Month"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleToday}
              className={`px-3 py-2 text-xs font-bold font-mono border rounded-xl transition-all cursor-pointer ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textMain}`}
            >
              Today
            </button>
          </div>

          <h3 className={`font-display text-xl font-extrabold tracking-tight ${themeClasses.textMain}`}>
            {MONTHS[currentMonth]} {currentYear}
          </h3>

          <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-neutral-900/5 dark:bg-white/5 border-neutral-700/10 dark:border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Active Sync</span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 md:gap-3 text-center mb-3">
          {WEEKDAYS.map(w => (
            <span key={w} className="text-xs uppercase font-mono font-bold tracking-widest text-gray-400 py-1">
              {w}
            </span>
          ))}
        </div>

        {/* Premium Grid of Day Cards (Separated by Gap, matching reference design) */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {cells.map((cell, index) => {
            const dayTrades = tradesByDate[cell.dateString] || [];
            const dayPnl = dayTrades.reduce((sum, t) => sum + t.netPnl, 0);
            const hasTrades = dayTrades.length > 0;
            
            // Premium background and border computations (soft glassmorphism)
            let cellBg: string;
            let cellHover = 'hover:border-neutral-400 dark:hover:border-neutral-700';
            let pnlColor = 'text-gray-500';
            const numberColor = cell.isCurrentMonth ? themeClasses.textMain : 'text-gray-400 dark:text-gray-600';
            
            if (cell.isCurrentMonth) {
              if (hasTrades) {
                if (dayPnl > 0) {
                  cellBg = isDarkMode 
                    ? 'bg-emerald-950/20 border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(16,185,129,0.05)]' 
                    : 'bg-emerald-50 border-emerald-200/80';
                  cellHover = isDarkMode ? 'hover:bg-emerald-950/35 hover:border-emerald-500/40' : 'hover:bg-emerald-100 hover:border-emerald-300';
                  pnlColor = isDarkMode ? 'text-brand-emerald' : 'text-emerald-700';
                } else if (dayPnl < 0) {
                  cellBg = isDarkMode 
                    ? 'bg-rose-950/20 border-rose-500/20 shadow-[inset_0_1px_1px_rgba(239,68,68,0.05)]' 
                    : 'bg-rose-50 border-rose-200/80';
                  cellHover = isDarkMode ? 'hover:bg-rose-950/35 hover:border-rose-500/40' : 'hover:bg-rose-100 hover:border-rose-300';
                  pnlColor = isDarkMode ? 'text-brand-rose' : 'text-rose-700';
                } else {
                  cellBg = isDarkMode ? 'bg-neutral-800/10 border-neutral-700/15' : 'bg-gray-100 border-gray-300/60';
                  pnlColor = themeClasses.textSub;
                }
              } else {
                // Empty days inside the active month - solid clean grey boxes!
                cellBg = isDarkMode 
                  ? 'bg-neutral-900/40 border-white/[0.04]' 
                  : 'bg-gray-100/90 border-black/[0.04]';
                cellHover = ''; // Disable hover scale for untraded days
              }
            } else {
              // Outside month padding cells (fully transparent/invisible)
              cellBg = 'bg-transparent border-transparent';
              cellHover = 'pointer-events-none opacity-20';
            }

            return (
              <div 
                key={`${cell.dateString}-${index}`}
                onClick={() => {
                  if (!hasTrades && !dayNotes[cell.dateString]) return;
                  setSelectedDayTrades({ day: cell.day, trades: dayTrades, date: cell.dateString });
                  setDayNote(dayNotes[cell.dateString] || '');
                  setSavedNote(dayNotes[cell.dateString] || '');
                }}
                className={`h-14 md:h-[76px] p-1.5 md:p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-200 select-none ${cellBg} ${(hasTrades || dayNotes[cell.dateString]) ? 'cursor-pointer hover:shadow-md' : 'pointer-events-none'} ${cellHover}`}
              >
                {/* Day label */}
                <div className="flex justify-between items-start leading-none">
                  <span className={`text-[10px] md:text-xs font-mono font-bold ${numberColor}`}>
                    {cell.day}
                  </span>
                  
                  {/* Subtle dots for notes / screenshots */}
                  {(hasTrades || dayNotes[cell.dateString]) && cell.isCurrentMonth && (
                    <div className="flex items-center gap-0.5">
                      {dayNotes[cell.dateString] && (
                        <span className="w-1 h-1 rounded-full bg-amber-500/80 dark:bg-amber-400/80" title="Day Note" />
                      )}
                      {dayTrades.some(t => t.notes && t.notes.trim().length > 0) && (
                        <span className="w-1 h-1 rounded-full bg-blue-500/80 dark:bg-blue-400/80" title="Has Notes" />
                      )}
                      {dayTrades.some(t => t.screenshotUrl) && (
                        <span className="w-1 h-1 rounded-full bg-violet-500/80 dark:bg-violet-400/80" title="Has Screenshots" />
                      )}
                    </div>
                  )}
                </div>

                {/* Day aggregates (PNL & Trades Count) */}
                {hasTrades && cell.isCurrentMonth ? (
                  <div className="space-y-0 text-right mt-1 leading-none">
                    <p className={`text-[10px] md:text-xs font-mono font-extrabold ${pnlColor}`}>
                      {dayPnl >= 0 ? '+' : ''}${Math.round(dayPnl).toLocaleString()}
                    </p>
                    <p className={`text-[7px] md:text-[8px] uppercase font-mono tracking-widest ${themeClasses.textSub}`}>
                      {dayTrades.length} {dayTrades.length === 1 ? 'tr' : 'trs'}
                    </p>
                  </div>
                ) : (
                  <div className="h-4" /> // Placeholder layout balancer
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Elegant glassmorphic iPhone-style Bottom Sheet */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setSelectedDayTrades(null)} />
          
          {/* iOS Bottom Sheet Container */}
          <div 
            style={{
              transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
              transition: isDragging ? 'none' : 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className={`w-full max-w-xl rounded-t-[2.5rem] border-t shadow-2xl flex flex-col justify-between overflow-hidden relative max-h-[82vh] ${isDragging ? '' : 'animate-slide-up'} ${themeClasses.bgPanel} ${themeClasses.border}`}
          >
            
            {/* iOS Grab Handle & Pull Area (Hidden on desktop) */}
            <div 
              className="w-full pt-3.5 pb-2 cursor-grab active:cursor-grabbing select-none shrink-0 sm:hidden"
              onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
              onMouseDown={(e) => handleDragStart(e.clientY)}
              onMouseMove={(e) => {
                if (e.buttons === 1) handleDragMove(e.clientY);
              }}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-800 rounded-full mx-auto" />
            </div>
            
            {/* Drawer Header (acts as drag handle on mobile, standard header on desktop) */}
            <div 
              className={`px-5 pb-4 pt-3.5 sm:pt-5 border-b flex items-center justify-between bg-neutral-950/10 cursor-grab active:cursor-grabbing sm:cursor-default sm:active:cursor-default select-none shrink-0 ${themeClasses.border}`}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
              onMouseDown={(e) => handleDragStart(e.clientY)}
              onMouseMove={(e) => {
                if (e.buttons === 1) handleDragMove(e.clientY);
              }}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <div>
                <h3 className={`font-display text-base font-black ${themeClasses.textMain}`}>
                  Trades Log &bull; Day {selectedDayTrades.day}
                </h3>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
                  {MONTHS[currentMonth]} {currentYear}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDayTrades(null)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer hidden sm:block ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textSub}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Day Note Section */}
            {selectedDayTrades && (
              <div className={`border-b px-5 py-4 ${themeClasses.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Day Note</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayNote !== savedNote && (
                      <span className="text-[9px] font-mono text-amber-500/70">Unsaved</span>
                    )}
                    {dayNote === savedNote && dayNote.trim() && (
                      <span className="text-[9px] font-mono text-emerald-500/70">Saved</span>
                    )}
                    <button
                      onClick={async () => {
                        await handleSaveDayNote(selectedDayTrades.date, dayNote);
                        setSavedNote(dayNote);
                      }}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                        dayNote !== savedNote
                          ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                          : 'bg-gray-500/10 text-gray-500 cursor-default'
                      }`}
                    >
                      Save
                    </button>
                  </div>
                </div>
                <textarea
                  value={dayNote}
                  onChange={e => setDayNote(e.target.value)}
                  placeholder="Write a note for this day..."
                  rows={3}
                  className={`w-full border rounded-lg p-2.5 text-xs font-mono resize-none focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} placeholder:text-gray-500`}
                />
              </div>
            )}

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedDayTrades.trades.length === 0 ? (
                <div className={`text-center py-8 ${themeClasses.textSub}`}>
                  <p className="text-xs font-mono">No trades logged for this day.</p>
                </div>
              ) : selectedDayTrades.trades.map(t => {
                return (
                  <div 
                    key={t.id}
                    onClick={() => {
                      setSelectedDayTrades(null);
                      navigate(`/trade/${t.id}`);
                    }}
                    className={`border rounded-xl p-4 transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} hover:border-gray-400 dark:hover:border-gray-500`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded leading-none ${t.direction === 'LONG' ? (isDarkMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') : (isDarkMode ? 'bg-rose-950 text-rose-400 border border-rose-900/50' : 'bg-rose-50 text-rose-700 border border-rose-200')}`}>
                            {t.direction}
                          </span>
                          <span className={`text-xs font-black uppercase tracking-tight ${themeClasses.textMain}`}>{t.asset}</span>
                        </div>
                        <p className="text-[9px] font-mono text-gray-500">{getShortTradeId(t.id)}</p>
                      </div>
                      
                      <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase rounded border ${t.status === 'WIN' ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald' : t.status === 'LOSS' ? 'border-brand-rose/40 bg-brand-rose/10 text-brand-rose' : 'border-gray-600 bg-gray-800 text-gray-300'}`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Micro visual indicator of screenshot if present */}
                    {t.screenshotUrl && (
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/[0.04] bg-neutral-950/20 relative my-2">
                        <img 
                          src={getDirectImageUrl(t.screenshotUrl)} 
                          alt="Setup screenshot" 
                          className="w-full h-full object-cover opacity-80" 
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-end border-t border-dashed border-neutral-700/20 pt-2 mt-2">
                      <div>
                        <span className="text-[8px] uppercase tracking-widest font-mono text-gray-500">Net P&L</span>
                        <p className={`font-mono text-sm font-black ${t.netPnl >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                          {t.netPnl >= 0 ? '+' : ''}${t.netPnl.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase tracking-widest font-mono text-gray-500">Realized R</span>
                        <p className={`font-mono text-xs font-semibold ${themeClasses.textMain}`}>{t.realizedR}R</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className={`p-5 border-t bg-neutral-950/10 ${themeClasses.border}`}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 uppercase font-mono text-[9px] tracking-wider">Total Daily Result</span>
                <span className={`font-mono font-bold text-base ${selectedDayTrades.trades.reduce((s, t) => s + t.netPnl, 0) >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                  {selectedDayTrades.trades.reduce((s, t) => s + t.netPnl, 0) >= 0 ? '+' : ''}
                  ${selectedDayTrades.trades.reduce((s, t) => s + t.netPnl, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
