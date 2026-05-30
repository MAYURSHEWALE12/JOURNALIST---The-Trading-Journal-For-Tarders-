import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Stats, CalendarDay } from '../types';
import { useTrades } from './TradeContext';
import { useAccounts } from './AccountContext';
import { useUI } from './UIContext';

interface AssetSummaryRow {
  asset: string;
  totalPnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface AnalyticsContextValue {
  computedStats: Stats;
  equityCurveData: Array<{ trial: string; balance: number }>;
  calendarDays: CalendarDay[];
  assetSummary: {
    rows: AssetSummaryRow[];
    best: AssetSummaryRow | null;
    worst: AssetSummaryRow | null;
  };
}

const AnalyticsContext = createContext<AnalyticsContextValue>(null as unknown as AnalyticsContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalytics() {
  return useContext(AnalyticsContext);
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { activeTrades } = useTrades();
  const { accounts, activeAccountId } = useAccounts();
  const { currentYear, currentMonth } = useUI();

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

  const calendarDays = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    const days: CalendarDay[] = [];
    const numDays = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < numDays; i++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(i + 1).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
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

  const value: AnalyticsContextValue = {
    computedStats, equityCurveData, calendarDays, assetSummary,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
