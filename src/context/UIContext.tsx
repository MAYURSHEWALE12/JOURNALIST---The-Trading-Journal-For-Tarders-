import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { TickerPrices } from '../types';

interface ThemeClasses {
  bgBase: string;
  bgPanel: string;
  bgCard: string;
  bgHover: string;
  border: string;
  borderActive: string;
  textMain: string;
  textSub: string;
  navActive: string;
}

function computeThemeClasses(isDark: boolean): ThemeClasses {
  return {
    bgBase: isDark ? 'bg-black' : 'bg-[#f1f1f1]',
    bgPanel: isDark ? 'bg-[#0f0f0f]' : 'bg-white',
    bgCard: isDark ? 'bg-[#191919]' : 'bg-white',
    bgHover: isDark ? 'hover:bg-white/10' : 'hover:bg-black/5',
    border: isDark ? 'border-white/[0.06]' : 'border-black/[0.08]',
    borderActive: isDark ? 'border-white/20' : 'border-black/20',
    textMain: isDark ? 'text-white' : 'text-black',
    textSub: isDark ? 'text-gray-500' : 'text-gray-500',
    navActive: isDark ? 'bg-white text-black' : 'bg-black text-white',
  };
}

export interface UIContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  themeClasses: ThemeClasses;
  isCommandOpen: boolean;
  setIsCommandOpen: Dispatch<SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  isExportingPDF: boolean;
  setIsExportingPDF: Dispatch<SetStateAction<boolean>>;
  dataLoading: boolean;
  setDataLoading: Dispatch<SetStateAction<boolean>>;
  selectedDate: string | null;
  setSelectedDate: Dispatch<SetStateAction<string | null>>;
  currentYear: number;
  setCurrentYear: Dispatch<SetStateAction<number>>;
  currentMonth: number;
  setCurrentMonth: Dispatch<SetStateAction<number>>;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  mousePos: { x: number; y: number };
  showCursorFollower: boolean;
  candleHeight: number;
  faqOpen: Record<number, boolean>;
  setFaqOpen: Dispatch<SetStateAction<Record<number, boolean>>>;
  landingMobileMenuOpen: boolean;
  setLandingMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  tickerPrices: TickerPrices;
}

const UIContext = createContext<UIContextValue>(null as unknown as UIContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useUI() {
  return useContext(UIContext);
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('journalist_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  useEffect(() => { localStorage.setItem('journalist_dark_mode', JSON.stringify(isDarkMode)); }, [isDarkMode]);
  const themeClasses = useMemo(() => computeThemeClasses(isDarkMode), [isDarkMode]);

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [dataLoading, setDataLoading] = useState(() => {
    return !!localStorage.getItem('journalist_jwt') && !!localStorage.getItem('journalist_user');
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    const today = new Date();
    const maxYear = today.getFullYear();
    const maxMonth = today.getMonth();

    setCurrentMonth(prev => {
      if (currentYear > maxYear || (currentYear === maxYear && prev >= maxMonth)) {
        return prev;
      }
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, [currentYear]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCursorFollower, setShowCursorFollower] = useState(false);
  const [candleHeight, setCandleHeight] = useState(10);

  useEffect(() => {
    let lastX = 0, lastY = 0, lastTime = Date.now();
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 10) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = dist / dt;
        setCandleHeight(Math.min(22, Math.max(4, Math.round(speed * 12))));
        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = now;
      }
      setMousePos({ x: e.clientX, y: e.clientY });
      setShowCursorFollower(true);
    };
    const handleMouseLeave = () => setShowCursorFollower(false);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [landingMobileMenuOpen, setLandingMobileMenuOpen] = useState(false);

  const [tickerPrices, setTickerPrices] = useState<TickerPrices>({
    BTC: 97892.40, ETH: 3481.10, marginRatio: 1.08542, EURUSD: 1.08542, AAPL: 180.24, NVDA: 131.85,
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPrices(prev => ({
        BTC: +(prev.BTC + (Math.random() - 0.5) * 45).toFixed(2),
        ETH: +(prev.ETH + (Math.random() - 0.5) * 2.5).toFixed(2),
        marginRatio: +(prev.marginRatio + (Math.random() - 0.5) * 0.00015).toFixed(5),
        EURUSD: +(prev.EURUSD + (Math.random() - 0.5) * 0.00015).toFixed(5),
        AAPL: +(prev.AAPL + (Math.random() - 0.5) * 0.25).toFixed(2),
        NVDA: +(prev.NVDA + (Math.random() - 0.5) * 0.40).toFixed(2),
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: UIContextValue = {
    sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen,
    isDarkMode, setIsDarkMode, themeClasses,
    isCommandOpen, setIsCommandOpen,
    isSettingsOpen, setIsSettingsOpen,
    isExportingPDF, setIsExportingPDF,
    dataLoading, setDataLoading,
    selectedDate, setSelectedDate,
    currentYear, setCurrentYear, currentMonth, setCurrentMonth,
    handlePrevMonth, handleNextMonth,
    mousePos, showCursorFollower, candleHeight,
    faqOpen, setFaqOpen, landingMobileMenuOpen, setLandingMobileMenuOpen,
    tickerPrices,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
