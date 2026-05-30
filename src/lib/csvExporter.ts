import type { Trade } from '../types';
import { createTrade } from './api';

type HeaderDef = {
  key: string;
  label: string;
  format: (t: Trade) => string;
};

const HEADERS: HeaderDef[] = [
  { key: 'asset', label: 'Asset', format: t => t.asset },
  { key: 'direction', label: 'Direction', format: t => t.direction },
  { key: 'status', label: 'Status', format: t => t.status },
  { key: 'strategy', label: 'Strategy', format: t => t.strategy },
  { key: 'entryTime', label: 'Entry Time', format: t => formatDate(t.entryTime) },
  { key: 'exitTime', label: 'Exit Time', format: t => t.exitTime ? formatDate(t.exitTime) : '' },
  { key: 'entryPrice', label: 'Entry Price', format: t => formatNumber(t.entryPrice) },
  { key: 'exitPrice', label: 'Exit Price', format: t => formatNumber(t.exitPrice) },
  { key: 'quantity', label: 'Quantity', format: t => String(t.quantity) },
  { key: 'netPnl', label: 'Net P&L', format: t => formatCurrency(t.netPnl) },
  { key: 'plannedR', label: 'Planned R', format: t => t.plannedR.toFixed(2) },
  { key: 'realizedR', label: 'Realized R', format: t => t.realizedR.toFixed(2) },
  { key: 'tags', label: 'Tags', format: t => escapeCSV((t.tags ?? []).join('; ')) },
  { key: 'emotionalState', label: 'Emotional State', format: t => escapeCSV((t.emotionalState ?? []).join('; ')) },
  { key: 'notes', label: 'Notes', format: t => escapeCSV(t.notes) },
  { key: 'accountId', label: 'Account ID', format: t => t.accountId ?? '' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrency(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTradesToCSV(trades: Trade[]): void {
  const lines: string[] = [];

  // ── Summary block ──────────────────────────────────────
  const wins = trades.filter(t => t.status === 'WIN');
  const losses = trades.filter(t => t.status === 'LOSS');
  const totalPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  lines.push(`"Export Date","${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}"`);
  lines.push(`"Total Trades","${trades.length}"`);
  lines.push(`"Wins","${wins.length}"`);
  lines.push(`"Losses","${losses.length}"`);
  lines.push(`"Win Rate","${trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0}%"`);
  lines.push(`"Net P&L","${formatCurrency(totalPnl)}"`);
  lines.push('');

  // ── Header row ─────────────────────────────────────────
  lines.push(HEADERS.map(h => h.label).join(','));

  // ── Data rows ──────────────────────────────────────────
  for (const t of trades) {
    lines.push(HEADERS.map(h => h.format(t)).join(','));
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import (tolerant of both raw and formatted CSV) ──────

const HEADER_ALIASES: Record<string, string> = {};
for (const h of HEADERS) {
  HEADER_ALIASES[h.label.toLowerCase()] = h.key;
  HEADER_ALIASES[h.key.toLowerCase()] = h.key;
}

export function parseCSVToTrades(text: string): Omit<Trade, 'id'>[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  // Skip any leading lines that don't look like CSV headers (summary block)
  let dataStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^[a-z]/i.test(trimmed) && !trimmed.startsWith('"')) {
      dataStart = i;
      break;
    }
  }

  const rawHeaders = parseCSVLine(lines[dataStart]);
  const keys: (string | null)[] = rawHeaders.map(h => {
    const lower = h.trim().toLowerCase().replace(/[^a-z0-9/& ]/g, '').trim();
    return HEADER_ALIASES[lower] || null;
  });

  const trades: Omit<Trade, 'id'>[] = [];

  for (let i = dataStart + 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    keys.forEach((key, idx) => {
      if (key) row[key] = values[idx] ?? '';
    });

    trades.push({
      asset: row.asset || 'Unknown',
      direction: parseDirection(row.direction),
      status: parseStatus(row.status),
      entryPrice: parseFlexNumber(row.entryprice) || 0,
      exitPrice: parseFlexNumber(row.exitprice) || 0,
      quantity: parseFlexNumber(row.quantity) || 0,
      entryTime: parseFlexDate(row.entrytime) || new Date().toISOString(),
      exitTime: parseFlexDate(row.exittime) || new Date().toISOString(),
      netPnl: parseFlexPnl(row.netpnl) || 0,
      plannedR: parseFlexNumber(row.plannedr) || 0,
      realizedR: parseFlexNumber(row.realizedr) || 0,
      strategy: row.strategy || 'Standard',
      tags: (row.tags || '').split(/[;|]/).map(s => s.trim()).filter(Boolean),
      notes: row.notes || '',
      emotionalState: (row.emotionalstate || '').split(/[;|]/).map(s => s.trim()).filter(Boolean),
      accountId: row.accountid || undefined,
    });
  }

  return trades;
}

function parseDirection(val: string): 'LONG' | 'SHORT' {
  const v = val.trim().toUpperCase();
  return v === 'SHORT' ? 'SHORT' : 'LONG';
}

function parseStatus(val: string): 'WIN' | 'LOSS' | 'BREAKEVEN' {
  const v = val.trim().toUpperCase();
  if (v === 'LOSS' || v === 'LOSE') return 'LOSS';
  if (v === 'BREAKEVEN' || v === 'BE') return 'BREAKEVEN';
  return 'WIN';
}

function parseFlexNumber(val: string): number {
  if (!val) return 0;
  // Remove currency symbols, commas, whitespace
  const cleaned = val.replace(/[$€£¥,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseFlexPnl(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$€£¥,\s]/g, '');
  // Handle explicit + and - signs
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseFlexDate(val: string): string | null {
  if (!val) return null;
  // Try parsing as ISO first
  const iso = new Date(val);
  if (!isNaN(iso.getTime())) return iso.toISOString();
  // Try parsing as formatted (e.g. "Jan 15, 2024 09:30")
  const parsed = Date.parse(val);
  if (!isNaN(parsed)) return new Date(parsed).toISOString();
  return null;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

export async function importTradesFromCSV(file: File, onProgress?: (done: number, total: number) => void): Promise<{ imported: number; errors: string[] }> {
  const text = await file.text();
  const parsed = parseCSVToTrades(text);
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < parsed.length; i++) {
    try {
      const trade: Trade = {
        id: crypto.randomUUID(),
        ...parsed[i],
        tags: parsed[i].tags ?? [],
        emotionalState: parsed[i].emotionalState ?? [],
        accountId: parsed[i].accountId,
      };
      await createTrade(trade);
      imported++;
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    onProgress?.(i + 1, parsed.length);
  }

  return { imported, errors };
}
