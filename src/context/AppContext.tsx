import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Trade, Account, Stats, TickerPrices, User, NewAccountData, NewTradeData, EditTradeData, CalendarDay } from '../types';
import { getShortTradeId } from '../types';
import { INITIAL_TRADES } from '../data/mockTrades';
import { isSupabaseConfigured } from '../lib/supabase';
import * as api from '../lib/api';

const generateId = (prefix: string = 'id') => `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

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

interface AssetSummaryRow {
  asset: string;
  totalPnl: number;
  trades: number;
  wins: number;
  losses: number;
}

interface AppContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Theme
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  themeClasses: ThemeClasses;

  // User / Auth
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleLogOut: () => void;
  isSignUpMode: boolean;
  setIsSignUpMode: (v: boolean) => void;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPassword: string;
  setAuthPassword: (v: string) => void;
  authUsername: string;
  setAuthUsername: (v: string) => void;
  authError: string;
  setAuthError: (v: string) => void;
  authLoading: boolean;
  setAuthLoading: (v: boolean) => void;
  handleAuthSubmit: (e: React.FormEvent) => Promise<void>;

  // Password reset
  forgotEmail: string;
  setForgotEmail: (v: string) => void;
  forgotLoading: boolean;
  forgotError: string;
  setForgotError: (v: string) => void;
  forgotSent: boolean;
  setForgotSent: (v: boolean) => void;
  forgotResetUrl: string;
  handleForgotPassword: () => Promise<void>;

  resetPassword: string;
  setResetPassword: (v: string) => void;
  resetLoading: boolean;
  resetError: string;
  setResetError: (v: string) => void;
  handleResetPassword: (token: string, email: string) => Promise<void>;

  // Change password
  showChangePassword: boolean;
  setShowChangePassword: (v: boolean) => void;
  changeOldPassword: string;
  setChangeOldPassword: (v: string) => void;
  changeNewPassword: string;
  setChangeNewPassword: (v: string) => void;
  changeLoading: boolean;
  changeError: string;
  changeMessage: string;
  setChangeMessage: (v: string) => void;
  handleChangePassword: () => Promise<void>;

  // Accounts
  accounts: Account[];
  activeAccountId: string;
  setActiveAccountId: React.Dispatch<React.SetStateAction<string>>;
  activeAccount: string;
  isAddAccountOpen: boolean;
  setIsAddAccountOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newAccountData: NewAccountData;
  setNewAccountData: React.Dispatch<React.SetStateAction<NewAccountData>>;
  handleAddNewAccount: (e: React.FormEvent) => Promise<void>;

  // Trades
  trades: Trade[];
  activeTrades: Trade[];
  filteredTrades: Trade[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: 'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN';
  setStatusFilter: React.Dispatch<React.SetStateAction<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>>;
  dashboardViewMode: 'CARDS' | 'TABLE';
  setDashboardViewMode: React.Dispatch<React.SetStateAction<'CARDS' | 'TABLE'>>;

  // Command palette
  isCommandOpen: boolean;
  setIsCommandOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Modals
  isNewTradeOpen: boolean;
  setIsNewTradeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newTradeStep: number;
  setNewTradeStep: React.Dispatch<React.SetStateAction<number>>;
  newTradeData: NewTradeData;
  setNewTradeData: React.Dispatch<React.SetStateAction<NewTradeData>>;
  isEditTradeOpen: boolean;
  setIsEditTradeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editTradeData: EditTradeData | null;
  setEditTradeData: React.Dispatch<React.SetStateAction<EditTradeData | null>>;
  deleteConfirmId: string | null;
  setDeleteConfirmId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedScreenshot: string | null;
  setSelectedScreenshot: React.Dispatch<React.SetStateAction<string | null>>;

  // Core Actions
  handleAddNewTrade: (e: React.FormEvent) => Promise<void>;
  handleOpenNewTradeModal: () => void;
  handleOpenEditTrade: (t: Trade) => void;
  handleEditTradeSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteTrade: (id: string) => Promise<void>;
  handleCommandAction: (action: () => void) => void;
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
  isCreatingTrade: boolean;
  isEditingTrade: boolean;
  isDeletingTrade: boolean;
  isCreatingAccount: boolean;

  // Analytics
  computedStats: Stats;
  equityCurveData: Array<{ trial: string; balance: number }>;
  calendarDays: CalendarDay[];
  assetSummary: {
    rows: AssetSummaryRow[];
    best: AssetSummaryRow | null;
    worst: AssetSummaryRow | null;
  };
  tickerPrices: TickerPrices;

  // Dynamic UI
  mousePos: { x: number; y: number };
  showCursorFollower: boolean;
  candleHeight: number;
  faqOpen: Record<number, boolean>;
  setFaqOpen: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  landingMobileMenuOpen: boolean;
  setLandingMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dataLoading: boolean;
  setDataLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isExportingPDF: boolean;
  setIsExportingPDF: React.Dispatch<React.SetStateAction<boolean>>;
  currentYear: number;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
}

const AppContext = createContext<AppContextValue>(null as unknown as AppContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // === Hoisted Accounts & Trades State ===
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('journalist_sandbox_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    return localStorage.getItem('journalist_active_account_id') || '';
  });
  useEffect(() => {
    if (activeAccountId) localStorage.setItem('journalist_active_account_id', activeAccountId);
  }, [activeAccountId]);

  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('journalist_sandbox_trades');
    return saved ? JSON.parse(saved) : INITIAL_TRADES;
  });

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('journalist_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  useEffect(() => { localStorage.setItem('journalist_dark_mode', JSON.stringify(isDarkMode)); }, [isDarkMode]);
  const themeClasses = useMemo(() => computeThemeClasses(isDarkMode), [isDarkMode]);

  // User / Auth
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('journalist_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(() => {
    return !!localStorage.getItem('journalist_jwt') && !!localStorage.getItem('journalist_user');
  });
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [isEditingTrade, setIsEditingTrade] = useState(false);
  const [isDeletingTrade, setIsDeletingTrade] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Password reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotResetUrl, setForgotResetUrl] = useState('');

  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleForgotPassword = useCallback(async () => {
    if (!forgotEmail) { setForgotError('Enter your email address.'); return; }
    setForgotLoading(true); setForgotError(''); setForgotSent(false); setForgotResetUrl('');
    try {
      const data = await api.authForgotPassword(forgotEmail);
      setForgotSent(true);
      if (data.devMode && data.otp) {
        setForgotResetUrl(data.otp);
      }
    } catch (err) {
      setForgotError((err as Error).message);
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail]);

  const handleResetPassword = useCallback(async (token: string, email: string) => {
    if (!resetPassword || resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    setResetLoading(true); setResetError('');
    try {
      await api.authResetPassword(email, token, resetPassword);
      setResetPassword('');
      navigate('/auth');
    } catch (err) {
      setResetError((err as Error).message);
    } finally {
      setResetLoading(false);
    }
  }, [resetPassword, navigate]);

  // === Change Password ===
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeOldPassword, setChangeOldPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeMessage, setChangeMessage] = useState('');

  const handleChangePassword = useCallback(async () => {
    if (!changeOldPassword || !changeNewPassword) {
      setChangeError('Both fields are required.'); return;
    }
    if (changeNewPassword.length < 6) {
      setChangeError('New password must be at least 6 characters.'); return;
    }
    setChangeLoading(true); setChangeError(''); setChangeMessage('');
    try {
      const data = await api.authChangePassword(changeOldPassword, changeNewPassword);
      setChangeMessage(data.message || 'Password changed.');
      setChangeOldPassword('');
      setChangeNewPassword('');
    } catch (err) {
      setChangeError((err as Error).message);
    } finally {
      setChangeLoading(false);
    }
  }, [changeOldPassword, changeNewPassword]);

  const handleLogOut = useCallback(() => {
    setUser(null);
    setAccounts([]);
    setTrades([]);
    setActiveAccountId('');
    api.authLogout();
    localStorage.removeItem('journalist_user');
    localStorage.removeItem('journalist_jwt');
    localStorage.removeItem('journalist_active_screen');
    localStorage.removeItem('journalist_sandbox_accounts');
    localStorage.removeItem('journalist_sandbox_trades');
    localStorage.removeItem('journalist_active_account_id');
    navigate('/');
  }, [navigate]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const data = isSignUpMode
        ? await api.authRegister({ username: authUsername.trim(), email: authEmail.trim(), password: authPassword })
        : await api.authLogin({ email: authEmail.trim(), password: authPassword });
      localStorage.setItem('journalist_jwt', data.token);
      localStorage.setItem('journalist_user', JSON.stringify(data.user));
      localStorage.setItem('journalist_active_screen', 'DASHBOARD');
      setUser(data.user);
      setAuthLoading(false);
      setDataLoading(true);
      navigate('/dashboard');
      setTimeout(async () => {
        try {
          await Promise.all([loadAccountsFromServer(), loadTradesFromServer()]);
        } finally {
          setDataLoading(false);
        }
      }, 100);
    } catch (err) {
      setAuthError((err as Error).message || 'Cannot connect to server.');
      setAuthLoading(false);
    }
  };

  // === Accounts ===

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState<NewAccountData>({ name: '', type: 'Crypto', accountSize: '' });

  const loadAccountsFromServer = useCallback(async () => {
    const token = localStorage.getItem('journalist_jwt');
    if (!token && !isSupabaseConfigured()) return;
    try {
      const data = await api.fetchAccounts();
      if (data.length > 0) {
        setAccounts(data);
        localStorage.setItem('journalist_sandbox_accounts', JSON.stringify(data));
        setActiveAccountId(prev => {
          const saved = localStorage.getItem('journalist_active_account_id');
          if (saved && data.some((a: Account) => a.id === saved)) return saved;
          if (prev && data.some((a: Account) => a.id === prev)) return prev;
          return data[0].id;
        });
      }
    } catch (err) {
      if ((err as Error).message === 'UNAUTHORIZED') { handleLogOut(); return; }
      const saved = localStorage.getItem('journalist_sandbox_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAccounts(parsed);
        setActiveAccountId(prev => {
          const savedId = localStorage.getItem('journalist_active_account_id');
          if (savedId && parsed.some((a: Account) => a.id === savedId)) return savedId;
          if (prev && parsed.some((a: Account) => a.id === prev)) return prev;
          return parsed.length > 0 ? parsed[0].id : '';
        });
      }
    }
  }, [handleLogOut, setAccounts, setActiveAccountId]);

  // === Trades ===

  const loadTradesFromServer = useCallback(async () => {
    const token = localStorage.getItem('journalist_jwt');
    if (!token && !isSupabaseConfigured()) return;
    try {
      const data = await api.fetchTrades();
      if (data.length > 0) {
        setTrades(data);
        localStorage.setItem('journalist_sandbox_trades', JSON.stringify(data));
      }
    } catch (err) {
      if ((err as Error).message === 'UNAUTHORIZED') { handleLogOut(); return; }
      const saved = localStorage.getItem('journalist_sandbox_trades');
      if (saved) setTrades(JSON.parse(saved));
    }
  }, [handleLogOut, setTrades]);

  // On mount: validate JWT or restore Supabase session
  useEffect(() => {
    const token = localStorage.getItem('journalist_jwt');

    if (token && user) {
      api.authMe()
        .then(async () => {
          await Promise.all([loadAccountsFromServer(), loadTradesFromServer()]);
        })
        .catch(() => { handleLogOut(); })
        .finally(() => { setDataLoading(false); });
      return;
    }

    if (!isSupabaseConfigured()) { setDataLoading(false); return; }

    let cancelled = false;

    (async () => {
      const { getSupabase } = await import('../lib/supabase');
      const supabase = getSupabase();

      const loadData = async () => {
        try {
          const su = await api.authMe();
          if (cancelled) return;
          setUser(su);
          localStorage.setItem('journalist_user', JSON.stringify(su));
          await Promise.all([loadAccountsFromServer(), loadTradesFromServer()]);
        } catch { /* failed */ }
        if (!cancelled) setDataLoading(false);
      };

      // Listen first so we never miss SIGNED_IN
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (session?.access_token) {
          api.setAccessToken(session.access_token);
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadData();
        }
      });

      // Then try to get existing session
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        // Session exists — ensure token is set and load data
        if (data.session.access_token) {
          api.setAccessToken(data.session.access_token);
        }
        await loadData();
      } else {
        // No session — wait for SIGNED_IN from OAuth redirect
        setTimeout(() => {
          if (!cancelled) { setDataLoading(false); subscription?.unsubscribe(); }
        }, 4000);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountData.name.trim()) return;
    setIsCreatingAccount(true);
    const newAcc: Account = {
      id: `acc-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newAccountData.name,
      type: newAccountData.type,
      createdAt: new Date().toISOString(),
      accountSize: parseFloat(newAccountData.accountSize) || 0,
      user_id: user?.id,
    };
    try {
      await api.createAccount(newAcc);
      await loadAccountsFromServer();
      setActiveAccountId(newAcc.id);
    } catch {
      setAccounts(prev => {
        const updated = [...prev, newAcc];
        localStorage.setItem('journalist_sandbox_accounts', JSON.stringify(updated));
        return updated;
      });
      setActiveAccountId(newAcc.id);
    }
    setIsCreatingAccount(false);
    setIsAddAccountOpen(false);
    setNewAccountData({ name: '', type: 'Crypto', accountSize: '' });
  };

  // === Computed values ===
  const activeAccount = useMemo(() => {
    const acc = accounts.find(a => a.id === activeAccountId);
    return acc ? acc.name : 'Crypto Ledger';
  }, [accounts, activeAccountId]);

  const activeTrades = useMemo(() => {
    return trades.filter(t => t.accountId === activeAccountId);
  }, [trades, activeAccountId]);

  const computedStats = useMemo((): Stats => {
    const total = activeTrades.length;
    if (total === 0) return { winRate: 0, profitFactor: 0, totalPnl: 0, averagePnl: 0, wins: 0, losses: 0 };
    const wins = activeTrades.filter(t => t.status === 'WIN');
    const losses = activeTrades.filter(t => t.status === 'LOSS');
    const winRate = Math.round((wins.length / total) * 100);
    const totalPnl = activeTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const averagePnl = totalPnl / total;
    const grossWins = wins.reduce((sum, t) => sum + t.netPnl, 0);
    const grossLosses = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
    const profitFactor = grossLosses > 0 ? +(grossWins / grossLosses).toFixed(2) : grossWins > 0 ? 9.99 : 0;
    return { winRate, profitFactor, totalPnl, averagePnl, wins: wins.length, losses: losses.length };
  }, [activeTrades]);

  const equityCurveData = useMemo(() => {
    const activeAccObj = accounts.find(a => a.id === activeAccountId);
    const startBalance = activeAccObj && activeAccObj.accountSize !== undefined ? activeAccObj.accountSize : 10000;
    
    const curve: Array<{ trial: string; balance: number }> = [];
    let runningBalance = startBalance;
    for (const t of activeTrades) {
      runningBalance = runningBalance + t.netPnl;
      curve.push({ trial: `#${curve.length + 1} (${t.asset})`, balance: runningBalance });
    }
    
    return [{ trial: 'Start', balance: startBalance }, ...curve];
  }, [activeTrades, accounts, activeAccountId]);

  // Filter / Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('ALL');
  const [dashboardViewMode, setDashboardViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

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

  const filteredTrades = useMemo(() => {
    return activeTrades.filter(t => {
      const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            getShortTradeId(t.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesDate = !selectedDate || t.entryTime.startsWith(selectedDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [activeTrades, searchTerm, statusFilter, selectedDate]);

  const calendarDays = useMemo(() => {
    const days = [];
    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 0; i < numDays; i++) {
      const year = currentYear;
      const month = String(currentMonth + 1).padStart(2, '0');
      const day = String(i + 1).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dailyTrades = activeTrades.filter(t => t.entryTime.startsWith(dateStr));
      const dailyPnl = dailyTrades.reduce((sum, t) => sum + t.netPnl, 0);
      days.push({ day: i + 1, date: dateStr, tradesCount: dailyTrades.length, pnl: dailyPnl });
    }
    return days;
  }, [activeTrades, currentYear, currentMonth]);

  const assetSummary = useMemo(() => {
    const map: Record<string, AssetSummaryRow> = {};
    activeTrades.forEach(t => {
      if (!map[t.asset]) map[t.asset] = { asset: t.asset, totalPnl: 0, trades: 0, wins: 0, losses: 0 };
      map[t.asset].totalPnl += t.netPnl;
      map[t.asset].trades += 1;
      if (t.status === 'WIN') map[t.asset].wins += 1;
      if (t.status === 'LOSS') map[t.asset].losses += 1;
    });
    const rows = Object.values(map).sort((a, b) => Math.abs(b.totalPnl) - Math.abs(a.totalPnl));
    const best = rows.reduce((prev, cur) => (cur.totalPnl > prev.totalPnl ? cur : prev), rows[0] || null);
    const worst = rows.reduce((prev, cur) => (cur.totalPnl < prev.totalPnl ? cur : prev), rows[0] || null);
    return { rows, best, worst };
  }, [activeTrades]);

  // === Modal states ===
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [newTradeStep, setNewTradeStep] = useState(1);
  const [newTradeData, setNewTradeData] = useState<NewTradeData>({
    asset: '', direction: 'LONG' as 'LONG' | 'SHORT',
    status: 'WIN' as 'WIN' | 'LOSS' | 'BREAKEVEN',
    entryPrice: '', exitPrice: '', quantity: '', netPnl: '',
    plannedR: '2', realizedR: '2', strategy: 'ICT Silver Bullet',
    tagsString: '', notes: '', emotions: [] as string[], screenshotUrl: '', screenshotUrls: [] as string[],
    tradeDate: new Date().toISOString().slice(0, 10),
    entryTime: '12:00',
    exitTime: '12:00',
  });
  const [isEditTradeOpen, setIsEditTradeOpen] = useState(false);
  const [editTradeData, setEditTradeData] = useState<EditTradeData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const handleAddNewTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTradeData.asset || !newTradeData.entryPrice || !newTradeData.quantity) {
      alert('Please fill out essential fields.');
      return;
    }
    setIsCreatingTrade(true);
    const priceE = parseFloat(newTradeData.entryPrice);
    const priceX = parseFloat(newTradeData.exitPrice || '0');
    const qty = parseFloat(newTradeData.quantity);
    let calcPnl = parseFloat(newTradeData.netPnl);
    if (isNaN(calcPnl)) {
      calcPnl = newTradeData.direction === 'LONG' ? (priceX - priceE) * qty : (priceE - priceX) * qty;
    }

    let autoStatus = newTradeData.status;
    if (calcPnl < 0) {
      autoStatus = 'LOSS';
    } else if (calcPnl > 0) {
      autoStatus = 'WIN';
    } else if (calcPnl === 0) {
      autoStatus = 'BREAKEVEN';
    }

    const dateStr = newTradeData.tradeDate || new Date().toISOString().slice(0, 10);
    const entryTimeStr = newTradeData.entryTime || '12:00';
    const exitTimeStr = newTradeData.exitTime || '12:00';
    const tz = (d: Date) => { const o = -d.getTimezoneOffset(); const p = (n: number) => String(Math.abs(n)).padStart(2, '0'); return `${o >= 0 ? '+' : '-'}${p(Math.floor(o / 60))}:${p(o % 60)}`; };
    const entryDateTime = new Date(`${dateStr}T${entryTimeStr}:00${tz(new Date())}`).toISOString();
    const exitDateTime = new Date(`${dateStr}T${exitTimeStr}:00${tz(new Date())}`).toISOString();
    const newTrade: Trade = {
      id: generateId('TRD'),
      asset: newTradeData.asset.toUpperCase(),
      direction: newTradeData.direction,
      status: autoStatus,
      entryPrice: priceE,
      exitPrice: priceX,
      quantity: qty,
      entryTime: entryDateTime,
      exitTime: exitDateTime,
      netPnl: calcPnl,
      plannedR: parseFloat(newTradeData.plannedR),
      realizedR: parseFloat(newTradeData.realizedR),
      strategy: newTradeData.strategy,
      tags: newTradeData.tagsString.split(',').map(s => s.trim()).filter(Boolean),
      notes: newTradeData.notes || 'No description provided.',
      emotionalState: newTradeData.emotions.length > 0 ? newTradeData.emotions : ['Neutral'],
      accountId: activeAccountId,
      screenshotUrl: newTradeData.screenshotUrls[0] || undefined,
      screenshotUrls: newTradeData.screenshotUrls,
      user_id: user?.id,
    };
    try {
      await api.createTrade(newTrade);
      await loadTradesFromServer();
    } catch {
      setTrades(prev => {
        const updated = [newTrade, ...prev];
        localStorage.setItem('journalist_sandbox_trades', JSON.stringify(updated));
        return updated;
      });
    }
    setIsCreatingTrade(false);
    setIsNewTradeOpen(false);
    setNewTradeStep(1);
    setNewTradeData({ asset: '', direction: 'LONG', status: 'WIN', entryPrice: '', exitPrice: '', quantity: '', netPnl: '', plannedR: '2', realizedR: '2', strategy: 'ICT Silver Bullet', tagsString: '', notes: '', emotions: [], screenshotUrl: '', screenshotUrls: [], tradeDate: new Date().toISOString().slice(0, 10), entryTime: '12:00', exitTime: '12:00' });
  };

  const handleOpenNewTradeModal = () => {
    if (accounts.length === 0 || !activeAccountId) {
      alert('Please scaffold a trading account first before documenting trades!');
      setIsAddAccountOpen(true);
      return;
    }
    setIsNewTradeOpen(true);
  };

  const handleOpenEditTrade = (trade: Trade) => {
    setEditTradeData({
      id: trade.id, asset: trade.asset, direction: trade.direction, status: trade.status,
      entryPrice: String(trade.entryPrice), exitPrice: String(trade.exitPrice),
      quantity: String(trade.quantity), netPnl: String(trade.netPnl),
      plannedR: String(trade.plannedR), realizedR: String(trade.realizedR),
      strategy: trade.strategy, tagsString: trade.tags.join(', '),
      notes: trade.notes, emotions: [...trade.emotionalState],
      screenshotUrl: trade.screenshotUrl || '',
      screenshotUrls: trade.screenshotUrls || [],
      tradeDate: trade.entryTime ? trade.entryTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
      entryTime: trade.entryTime ? trade.entryTime.slice(11, 16) : '12:00',
      exitTime: trade.exitTime ? trade.exitTime.slice(11, 16) : '12:00',
    });
    setIsEditTradeOpen(true);
  };

  const handleEditTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTradeData) return;
    setIsEditingTrade(true);

    const pnlVal = parseFloat(editTradeData.netPnl);
    let autoStatus = editTradeData.status;
    if (!isNaN(pnlVal)) {
      if (pnlVal < 0) {
        autoStatus = 'LOSS';
      } else if (pnlVal > 0) {
        autoStatus = 'WIN';
      } else if (pnlVal === 0) {
        autoStatus = 'BREAKEVEN';
      }
    }

    const dateStr = editTradeData.tradeDate || new Date().toISOString().slice(0, 10);
    const entryTimeStr = editTradeData.entryTime || '12:00';
    const exitTimeStr = editTradeData.exitTime || '12:00';
    const tz = (d: Date) => { const o = -d.getTimezoneOffset(); const p = (n: number) => String(Math.abs(n)).padStart(2, '0'); return `${o >= 0 ? '+' : '-'}${p(Math.floor(o / 60))}:${p(o % 60)}`; };
    const entryDateTime = new Date(`${dateStr}T${entryTimeStr}:00${tz(new Date())}`).toISOString();
    const exitDateTime = new Date(`${dateStr}T${exitTimeStr}:00${tz(new Date())}`).toISOString();
    const updated: Trade = {
      id: editTradeData.id, asset: editTradeData.asset.toUpperCase(),
      direction: editTradeData.direction, status: autoStatus,
      entryPrice: parseFloat(editTradeData.entryPrice), exitPrice: parseFloat(editTradeData.exitPrice),
      quantity: parseFloat(editTradeData.quantity), netPnl: pnlVal,
      plannedR: parseFloat(editTradeData.plannedR), realizedR: parseFloat(editTradeData.realizedR),
      strategy: editTradeData.strategy,
      tags: editTradeData.tagsString.split(',').map((s: string) => s.trim()).filter(Boolean),
      notes: editTradeData.notes || 'No description provided.',
      emotionalState: editTradeData.emotions.length > 0 ? editTradeData.emotions : ['Neutral'],
      entryTime: entryDateTime,
      exitTime: exitDateTime,
      accountId: activeAccountId,
      screenshotUrl: editTradeData.screenshotUrls[0] || undefined,
      screenshotUrls: editTradeData.screenshotUrls || [],
      user_id: user?.id,
    };
    try {
      await api.updateTrade(updated.id, updated);
      await loadTradesFromServer();
    } catch {
      setTrades(prev => prev.map(t => t.id === updated.id ? updated : t));
    }
    setIsEditingTrade(false);
    setIsEditTradeOpen(false);
    setEditTradeData(null);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    setIsDeletingTrade(true);
    try {
      await api.deleteTrade(tradeId);
      await loadTradesFromServer();
    } catch {
      setTrades(prev => prev.filter(t => t.id !== tradeId));
    }
    setIsDeletingTrade(false);
    setDeleteConfirmId(null);
    navigate('/timeline');
  };

  const handleCommandAction = (action: () => void) => {
    action();
    setIsCommandOpen(false);
  };

  // === Ticker ===
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

  // === Keyboard shortcuts ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
        setIsNewTradeOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // === Cursor follower ===
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

  // === Landing page states ===
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [landingMobileMenuOpen, setLandingMobileMenuOpen] = useState(false);



  const value: AppContextValue = {
    sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen,
    isDarkMode, setIsDarkMode, themeClasses,
    user, setUser, handleLogOut,
    isSignUpMode, setIsSignUpMode,
    authEmail, setAuthEmail, authPassword, setAuthPassword,
    authUsername, setAuthUsername, authError, setAuthError, authLoading, setAuthLoading,
    handleAuthSubmit,
    forgotEmail, setForgotEmail, forgotLoading, forgotError, setForgotError, forgotSent, setForgotSent, forgotResetUrl,
    handleForgotPassword,
    resetPassword, setResetPassword, resetLoading, resetError, setResetError,
    handleResetPassword,
    showChangePassword, setShowChangePassword,
    changeOldPassword, setChangeOldPassword, changeNewPassword, setChangeNewPassword,
    changeLoading, changeError, changeMessage, setChangeMessage,
    handleChangePassword,
    accounts, activeAccountId, setActiveAccountId, activeAccount,
    isAddAccountOpen, setIsAddAccountOpen, newAccountData, setNewAccountData, handleAddNewAccount,
    trades, activeTrades, filteredTrades,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter, dashboardViewMode, setDashboardViewMode,
    isCommandOpen, setIsCommandOpen,
    isNewTradeOpen, setIsNewTradeOpen, newTradeStep, setNewTradeStep, newTradeData, setNewTradeData,
    isEditTradeOpen, setIsEditTradeOpen, editTradeData, setEditTradeData,
    deleteConfirmId, setDeleteConfirmId, selectedScreenshot, setSelectedScreenshot,
    handleAddNewTrade, handleOpenNewTradeModal, handleOpenEditTrade, handleEditTradeSubmit, handleDeleteTrade, handleCommandAction,
    computedStats, equityCurveData, calendarDays, assetSummary,
    tickerPrices, mousePos, showCursorFollower, candleHeight,
    faqOpen, setFaqOpen, landingMobileMenuOpen, setLandingMobileMenuOpen,
    dataLoading, setDataLoading, isExportingPDF, setIsExportingPDF,
    currentYear, setCurrentYear, currentMonth, setCurrentMonth,
    handlePrevMonth, handleNextMonth,
    selectedDate, setSelectedDate,
    isCreatingTrade, isEditingTrade, isDeletingTrade, isCreatingAccount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
