import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  TrendingUp, 
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
  const { themeClasses, isDarkMode, activeTrades } = useApp();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ day: number; trades: Trade[] } | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
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
      <Seo title="Interactive Trading Calendar" path="/calendar" />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-display font-semibold ${themeClasses.textMain}`}>Interactive Trading Calendar</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>Track your daily P&L, trading streaks, and mental checklist consistency on a visual month grid.</p>
        </div>

        {/* Aggregate Mini-stats strip */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`px-4 py-2 border rounded-xl flex items-center gap-3 bg-neutral-900/10 ${themeClasses.border}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${monthlyPnl >= 0 ? 'bg-brand-emerald animate-pulse' : 'bg-brand-rose'}`} />
            <div>
              <p className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Month PNL</p>
              <p className={`text-xs font-mono font-bold ${monthlyPnl >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                {monthlyPnl >= 0 ? '+' : ''}${monthlyPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div className={`px-4 py-2 border rounded-xl flex items-center gap-3 bg-neutral-900/10 ${themeClasses.border}`}>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Win Rate</p>
              <p className={`text-xs font-mono font-bold ${themeClasses.textMain}`}>{monthlyWinRate}%</p>
            </div>
          </div>

          <div className={`px-4 py-2 border rounded-xl flex items-center gap-3 bg-neutral-900/10 ${themeClasses.border}`}>
            <BookOpen className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Total Trades</p>
              <p className={`text-xs font-mono font-bold ${themeClasses.textMain}`}>{monthlyAggregate.length} trades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Navigation Box */}
      <div className={`border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl ${themeClasses.bgPanel} ${themeClasses.border}`}>
        {/* Navigation Toolbar */}
        <div className={`p-4 border-b flex items-center justify-between ${themeClasses.border} bg-neutral-950/20`}>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevMonth}
              className={`p-2 rounded-lg border transition hover:border-gray-500 cursor-pointer ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textMain}`}
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleNextMonth}
              className={`p-2 rounded-lg border transition hover:border-gray-500 cursor-pointer ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textMain}`}
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleToday}
              className={`px-3 py-1.5 text-xs font-bold font-mono border rounded-lg transition hover:border-gray-500 cursor-pointer ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textMain}`}
            >
              Today
            </button>
          </div>

          <h3 className={`font-display text-lg font-extrabold tracking-tight ${themeClasses.textMain}`}>
            {MONTHS[currentMonth]} {currentYear}
          </h3>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-emerald" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className={`grid grid-cols-7 border-b text-center py-3 bg-neutral-900/30 ${themeClasses.border}`}>
          {WEEKDAYS.map(w => (
            <span key={w} className="text-xs uppercase font-mono font-bold tracking-widest text-gray-500">
              {w}
            </span>
          ))}
        </div>

        {/* Grid of Days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.04] border-l border-t border-white/[0.04]">
          {cells.map((cell, index) => {
            const dayTrades = tradesByDate[cell.dateString] || [];
            const dayPnl = dayTrades.reduce((sum, t) => sum + t.netPnl, 0);
            const hasTrades = dayTrades.length > 0;
            
            // Build cell styling
            let cellBg = 'bg-transparent';
            let cellHover = 'hover:bg-neutral-800/20';
            let pnlColor = 'text-gray-500';
            
            if (cell.isCurrentMonth && hasTrades) {
              if (dayPnl > 0) {
                cellBg = isDarkMode ? 'bg-emerald-950/15 border-emerald-500/10' : 'bg-emerald-50 border-emerald-200';
                cellHover = isDarkMode ? 'hover:bg-emerald-950/25 hover:border-emerald-500/20' : 'hover:bg-emerald-100/80';
                pnlColor = isDarkMode ? 'text-brand-emerald' : 'text-emerald-700';
              } else if (dayPnl < 0) {
                cellBg = isDarkMode ? 'bg-rose-950/15 border-rose-500/10' : 'bg-rose-50 border-rose-200';
                cellHover = isDarkMode ? 'hover:bg-rose-950/25 hover:border-rose-500/20' : 'hover:bg-rose-100/80';
                pnlColor = isDarkMode ? 'text-brand-rose' : 'text-rose-700';
              } else {
                cellBg = isDarkMode ? 'bg-neutral-800/10 border-neutral-700/10' : 'bg-gray-50 border-gray-200';
                pnlColor = themeClasses.textSub;
              }
            }

            return (
              <div 
                key={`${cell.dateString}-${index}`}
                onClick={() => hasTrades && setSelectedDayTrades({ day: cell.day, trades: dayTrades })}
                className={`min-h-[90px] md:min-h-[110px] p-2 flex flex-col justify-between transition-all select-none border-b border-r border-white/[0.04] relative ${cell.isCurrentMonth ? '' : 'opacity-25 pointer-events-none'} ${cellBg} ${hasTrades ? 'cursor-pointer' : ''} ${cellHover}`}
              >
                {/* Day label */}
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] md:text-xs font-mono font-bold ${cell.isCurrentMonth ? themeClasses.textMain : 'text-gray-600'}`}>
                    {cell.day}
                  </span>
                  
                  {/* Subtle indicators (notes / screenshots) */}
                  {hasTrades && (
                    <div className="flex items-center gap-1">
                      {dayTrades.some(t => t.notes && t.notes.trim().length > 0) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Has Notes" />
                      )}
                      {dayTrades.some(t => t.screenshotUrl) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" title="Has Screenshots" />
                      )}
                    </div>
                  )}
                </div>

                {/* Day aggregates (PNL & Trades Count) */}
                {hasTrades ? (
                  <div className="space-y-0.5 text-center md:text-right pb-1">
                    <p className={`text-[10px] md:text-xs font-mono font-black ${pnlColor}`}>
                      {dayPnl >= 0 ? '+' : ''}${Math.round(dayPnl).toLocaleString()}
                    </p>
                    <p className={`text-[8px] md:text-[9px] uppercase font-mono tracking-wider ${themeClasses.textSub}`}>
                      {dayTrades.length} {dayTrades.length === 1 ? 'trade' : 'trades'}
                    </p>
                  </div>
                ) : (
                  <div className="h-6" /> // Placeholder spacing
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Side Drawer showing day details */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setSelectedDayTrades(null)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md border-l shadow-2xl flex flex-col justify-between ${themeClasses.bgPanel} ${themeClasses.border}`}>
              
              {/* Drawer Header */}
              <div className={`p-4 border-b flex items-center justify-between bg-neutral-950/20 ${themeClasses.border}`}>
                <div>
                  <h3 className={`font-display text-base font-bold ${themeClasses.textMain}`}>
                    Trades Log &bull; Day {selectedDayTrades.day}
                  </h3>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    {MONTHS[currentMonth]} {currentYear}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDayTrades(null)}
                  className={`p-1.5 rounded-lg border transition hover:border-gray-500 cursor-pointer ${themeClasses.border} ${themeClasses.bgHover} ${themeClasses.textSub}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedDayTrades.trades.map(t => {
                  return (
                    <div 
                      key={t.id}
                      onClick={() => {
                        setSelectedDayTrades(null);
                        navigate(`/trade/${t.id}`);
                      }}
                      className={`border rounded-xl p-4 transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} hover:border-gray-500`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded leading-none ${t.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-rose-950 text-rose-400 border border-rose-900/50'}`}>
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
              <div className={`p-4 border-t bg-neutral-950/20 ${themeClasses.border}`}>
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
        </div>
      )}

    </div>
  );
}
