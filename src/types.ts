export interface Trade {
  id: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  status: 'WIN' | 'LOSS' | 'BREAKEVEN';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: string;
  exitTime: string;
  netPnl: number;
  plannedR: number;
  realizedR: number;
  strategy: string;
  tags: string[];
  notes: string;
  emotionalState: string[];
  screenshotUrl?: string;
  screenshotUrls?: string[];
  accountId?: string;
  user_id?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  accountSize?: number;
  user_id?: string;
}

export type Screen = 'LANDING' | 'AUTH' | 'DASHBOARD' | 'ANALYTICS' | 'TIMELINE' | 'TRADE_DETAIL';

export interface Stats {
  winRate: number;
  profitFactor: number;
  totalPnl: number;
  averagePnl: number;
  wins: number;
  losses: number;
}

export interface TickerPrices {
  BTC: number;
  ETH: number;
  marginRatio: number;
  EURUSD: number;
  AAPL: number;
  NVDA: number;
}

export const STRATEGIES = [
  'ICT Silver Bullet',
  'ORB Breakdown',
  'Gap Fill Reversal',
  'Fair Value Gap Fill',
] as const;

export const ACCOUNT_TYPES = ['Crypto', 'Futures', 'Forex', 'Equities', 'Indices'] as const;

export const EMOTIONAL_STATES = ['Calm', 'FOMO', 'Impulsive', 'Greedy', 'Anxious', 'Confident'] as const;

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface NewAccountData {
  name: string;
  type: string;
  accountSize: string;
}

export interface NewTradeData {
  asset: string;
  direction: 'LONG' | 'SHORT';
  status: 'WIN' | 'LOSS' | 'BREAKEVEN';
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  netPnl: string;
  plannedR: string;
  realizedR: string;
  strategy: string;
  tagsString: string;
  notes: string;
  emotions: string[];
  screenshotUrl: string;
  screenshotUrls: string[];
  tradeDate: string;
  entryTime: string;
  exitTime: string;
}

export interface EditTradeData {
  id: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  status: 'WIN' | 'LOSS' | 'BREAKEVEN';
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  netPnl: string;
  plannedR: string;
  realizedR: string;
  strategy: string;
  tagsString: string;
  notes: string;
  emotions: string[];
  screenshotUrl: string;
  screenshotUrls: string[];
  tradeDate: string;
  entryTime: string;
  exitTime: string;
}

export interface CalendarDay {
  day: number;
  date: string;
  tradesCount: number;
  pnl: number;
}

export function getWeekOfMonth(dateString: string): string {
  const day = new Date(dateString).getDate();
  if (day <= 7) return 'Week 1';
  if (day <= 14) return 'Week 2';
  if (day <= 21) return 'Week 3';
  if (day <= 28) return 'Week 4';
  return 'Week 5';
}

export function getShortTradeId(id: string): string {
  if (!id) return '';
  const parts = id.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[2]}`;
  }
  return id;
}


