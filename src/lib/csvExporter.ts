import type { Trade } from '../types';
import { createTrade } from './api';

const CSV_HEADERS = [
  'asset', 'direction', 'status', 'entryPrice', 'exitPrice', 'quantity',
  'entryTime', 'exitTime', 'netPnl', 'plannedR', 'realizedR',
  'strategy', 'tags', 'notes', 'emotionalState',
  'accountId', 'screenshotUrl',
] as const;

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTradesToCSV(trades: Trade[]): void {
  const rows = [CSV_HEADERS.join(',')];

  for (const t of trades) {
    const row = CSV_HEADERS.map(key => {
      const val = t[key as keyof Trade];
      if (key === 'tags') return escapeCSV((t.tags ?? []).join(';'));
      if (key === 'emotionalState') return escapeCSV((t.emotionalState ?? []).join(';'));
      if (val == null) return '';
      return escapeCSV(String(val));
    });
    rows.push(row.join(','));
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSVToTrades(text: string): Omit<Trade, 'id'>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const trades: Omit<Trade, 'id'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });

    const tags = (row.tags || '').split(';').map(s => s.trim()).filter(Boolean);
    const emotionalState = (row.emotionalstate || '').split(';').map(s => s.trim()).filter(Boolean);

    trades.push({
      asset: row.asset || 'Unknown',
      direction: (row.direction?.toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG') as 'LONG' | 'SHORT',
      status: (row.status?.toUpperCase() === 'LOSS' ? 'LOSS' : row.status?.toUpperCase() === 'BREAKEVEN' ? 'BREAKEVEN' : 'WIN') as 'WIN' | 'LOSS' | 'BREAKEVEN',
      entryPrice: parseFloat(row.entryprice) || 0,
      exitPrice: parseFloat(row.exitprice) || 0,
      quantity: parseFloat(row.quantity) || 0,
      entryTime: row.entrytime || new Date().toISOString(),
      exitTime: row.exittime || new Date().toISOString(),
      netPnl: parseFloat(row.netpnl) || 0,
      plannedR: parseFloat(row.plannedr) || 0,
      realizedR: parseFloat(row.realizedr) || 0,
      strategy: row.strategy || 'Standard',
      tags,
      notes: row.notes || '',
      emotionalState,
      accountId: row.accountid || undefined,
      screenshotUrl: row.screenshoturl || undefined,
    });
  }

  return trades;
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
        screenshotUrl: parsed[i].screenshotUrl,
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
