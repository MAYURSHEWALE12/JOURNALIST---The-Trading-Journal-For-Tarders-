import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Trade, NewTradeData, EditTradeData } from '../types';
import { getShortTradeId } from '../types';
import { INITIAL_TRADES } from '../data/mockTrades';
import { isSupabaseConfigured } from '../lib/supabase';
import * as api from '../lib/api';
import { useAuth } from './AuthContext';
import { useAccounts } from './AccountContext';
import { useUI } from './UIContext';

const generateId = (prefix: string = 'id') => `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

export interface TradeContextValue {
  trades: Trade[];
  activeTrades: Trade[];
  filteredTrades: Trade[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  statusFilter: 'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN';
  setStatusFilter: Dispatch<SetStateAction<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>>;
  tagFilter: string[];
  setTagFilter: Dispatch<SetStateAction<string[]>>;
  allTags: string[];
  dashboardViewMode: 'CARDS' | 'TABLE';
  setDashboardViewMode: Dispatch<SetStateAction<'CARDS' | 'TABLE'>>;
  isNewTradeOpen: boolean;
  setIsNewTradeOpen: Dispatch<SetStateAction<boolean>>;
  newTradeStep: number;
  setNewTradeStep: Dispatch<SetStateAction<number>>;
  newTradeData: NewTradeData;
  setNewTradeData: Dispatch<SetStateAction<NewTradeData>>;
  isEditTradeOpen: boolean;
  setIsEditTradeOpen: Dispatch<SetStateAction<boolean>>;
  editTradeData: EditTradeData | null;
  setEditTradeData: Dispatch<SetStateAction<EditTradeData | null>>;
  deleteConfirmId: string | null;
  setDeleteConfirmId: Dispatch<SetStateAction<string | null>>;
  selectedScreenshot: string | null;
  setSelectedScreenshot: Dispatch<SetStateAction<string | null>>;
  handleAddNewTrade: (e: FormEvent) => Promise<void>;
  handleOpenNewTradeModal: () => void;
  handleOpenEditTrade: (t: Trade) => void;
  handleEditTradeSubmit: (e: FormEvent) => Promise<void>;
  handleDeleteTrade: (id: string) => Promise<void>;
  handleCommandAction: (action: () => void) => void;
  isCreatingTrade: boolean;
  isEditingTrade: boolean;
  isDeletingTrade: boolean;
  loadTradesFromServer: () => Promise<void>;
}

const TradeContext = createContext<TradeContextValue>(null as unknown as TradeContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useTrades() {
  return useContext(TradeContext);
}

export function TradeProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, handleLogOut } = useAuth();
  const { activeAccountId, accounts, setIsAddAccountOpen } = useAccounts();
  const { selectedDate } = useUI();

  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('journalist_sandbox_trades');
    return saved ? JSON.parse(saved) : INITIAL_TRADES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('ALL');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [dashboardViewMode, setDashboardViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [newTradeStep, setNewTradeStep] = useState(1);
  const [newTradeData, setNewTradeData] = useState<NewTradeData>({
    asset: '', direction: 'LONG' as 'LONG' | 'SHORT',
    status: 'WIN' as 'WIN' | 'LOSS' | 'BREAKEVEN',
    entryPrice: '', exitPrice: '', quantity: '', netPnl: '',
    plannedR: '2', realizedR: '2', strategy: '',
    tagsString: '', notes: '', emotions: [] as string[], screenshotUrl: '', screenshotUrls: [] as string[],
    tradeDate: new Date().toISOString().slice(0, 10),
    entryTime: '12:00',
    exitTime: '12:00',
  });
  const [isEditTradeOpen, setIsEditTradeOpen] = useState(false);
  const [editTradeData, setEditTradeData] = useState<EditTradeData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [isEditingTrade, setIsEditingTrade] = useState(false);
  const [isDeletingTrade, setIsDeletingTrade] = useState(false);

  const loadTradesFromServer = useCallback(async () => {
    const token = localStorage.getItem('journalist_jwt');
    if (!token && !isSupabaseConfigured()) return;
    try {
      const data = await api.fetchTrades();
      setTrades(data);
      localStorage.setItem('journalist_sandbox_trades', JSON.stringify(data));
    } catch (err) {
      if ((err as Error).message === 'UNAUTHORIZED') { handleLogOut(); return; }
      const saved = localStorage.getItem('journalist_sandbox_trades');
      if (saved) setTrades(JSON.parse(saved));
    }
  }, [handleLogOut]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrades([]);
      return;
    }
    loadTradesFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeTrades = useMemo(() => {
    return trades.filter(t => t.accountId === activeAccountId);
  }, [trades, activeAccountId]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    activeTrades.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [activeTrades]);

  const filteredTrades = useMemo(() => {
    return activeTrades.filter(t => {
      const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            getShortTradeId(t.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesDate = !selectedDate || t.entryTime.startsWith(selectedDate);
      const matchesTag = tagFilter.length === 0 || tagFilter.some(tag => t.tags.includes(tag));
      return matchesSearch && matchesStatus && matchesDate && matchesTag;
    });
  }, [activeTrades, searchTerm, statusFilter, selectedDate, tagFilter]);

  const handleAddNewTrade = async (e: FormEvent) => {
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
    setNewTradeData({ asset: '', direction: 'LONG', status: 'WIN', entryPrice: '', exitPrice: '', quantity: '', netPnl: '', plannedR: '2', realizedR: '2', strategy: '', tagsString: '', notes: '', emotions: [], screenshotUrl: '', screenshotUrls: [], tradeDate: new Date().toISOString().slice(0, 10), entryTime: '12:00', exitTime: '12:00' });
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

  const handleEditTradeSubmit = async (e: FormEvent) => {
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
      setTrades(prev => {
        const u = prev.map(t => t.id === updated.id ? updated : t);
        localStorage.setItem('journalist_sandbox_trades', JSON.stringify(u));
        return u;
      });
    }
    setIsEditingTrade(false);
    setIsEditTradeOpen(false);
    setEditTradeData(null);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    setIsDeletingTrade(true);
    const updated = trades.filter(t => t.id !== tradeId);
    try {
      await api.deleteTrade(tradeId);
      setTrades(updated);
      localStorage.setItem('journalist_sandbox_trades', JSON.stringify(updated));
      await loadTradesFromServer();
    } catch {
      setTrades(updated);
      localStorage.setItem('journalist_sandbox_trades', JSON.stringify(updated));
    }
    setIsDeletingTrade(false);
    setDeleteConfirmId(null);
    navigate('/timeline');
  };

  const handleCommandAction = (action: () => void) => {
    action();
    setIsNewTradeOpen(false);
  };

  const value: TradeContextValue = {
    trades, activeTrades, filteredTrades,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter, tagFilter, setTagFilter, allTags, dashboardViewMode, setDashboardViewMode,
    isNewTradeOpen, setIsNewTradeOpen, newTradeStep, setNewTradeStep, newTradeData, setNewTradeData,
    isEditTradeOpen, setIsEditTradeOpen, editTradeData, setEditTradeData,
    deleteConfirmId, setDeleteConfirmId, selectedScreenshot, setSelectedScreenshot,
    handleAddNewTrade, handleOpenNewTradeModal, handleOpenEditTrade, handleEditTradeSubmit, handleDeleteTrade, handleCommandAction,
    isCreatingTrade, isEditingTrade, isDeletingTrade, loadTradesFromServer,
  };

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}
