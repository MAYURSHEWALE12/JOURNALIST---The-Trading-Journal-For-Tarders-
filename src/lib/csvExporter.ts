import type { Trade } from '../types';
import { createTrade } from './api';

// ── Helpers shared by both CSV and Excel ──────────────────

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

// ── Excel export (SpreadsheetML with colors) ─────────────

const EXCEL_HEADERS = [
  { label: 'Asset', width: 90 },
  { label: 'Direction', width: 75 },
  { label: 'Status', width: 80 },
  { label: 'Strategy', width: 110 },
  { label: 'Entry Time', width: 150 },
  { label: 'Exit Time', width: 150 },
  { label: 'Entry Price', width: 90 },
  { label: 'Exit Price', width: 90 },
  { label: 'Qty', width: 60 },
  { label: 'Net P&L', width: 90 },
  { label: 'Planned R', width: 75 },
  { label: 'Realized R', width: 80 },
  { label: 'Tags', width: 130 },
  { label: 'Emotional State', width: 130 },
  { label: 'Notes', width: 200 },
];

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type ExcelRow = {
  cells: string[];
  styleId: string;
};

export function exportTradesToExcel(trades: Trade[]): void {
  const wins = trades.filter(t => t.status === 'WIN');
  const losses = trades.filter(t => t.status === 'LOSS');
  const totalPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  const winRate = trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0;

  const rows: ExcelRow[] = [];

  // Summary rows
  rows.push({ cells: ['Export Date', new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })], styleId: 'summary' });
  rows.push({ cells: ['Total Trades', String(trades.length)], styleId: 'summary' });
  rows.push({ cells: ['Wins', String(wins.length)], styleId: 'summary' });
  rows.push({ cells: ['Losses', String(losses.length)], styleId: 'summary' });
  rows.push({ cells: ['Win Rate', `${winRate}%`], styleId: 'summary' });
  rows.push({ cells: ['Net P&L', formatCurrency(totalPnl)], styleId: 'summary' });
  rows.push({ cells: [], styleId: '' }); // blank row

  // Header row
  rows.push({ cells: EXCEL_HEADERS.map(h => h.label), styleId: 'header' });

  // Data rows
  for (const t of trades) {
    const styleId = t.status === 'WIN' ? 'win' : t.status === 'LOSS' ? 'loss' : 'breakeven';
    const cells = [
      t.asset,
      t.direction,
      t.status,
      t.strategy,
      formatDate(t.entryTime),
      t.exitTime ? formatDate(t.exitTime) : '',
      formatNumber(t.entryPrice),
      formatNumber(t.exitPrice),
      String(t.quantity),
      formatCurrency(t.netPnl),
      t.plannedR.toFixed(2),
      t.realizedR.toFixed(2),
      (t.tags ?? []).join('; '),
      (t.emotionalState ?? []).join('; '),
      t.notes,
    ];
    rows.push({ cells, styleId });
  }

  // Build XML
  const cols = EXCEL_HEADERS.map(h => `    <Column ss:Width="${h.width}"/>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Font ss:FontName="Consolas" ss:Size="10"/>
  </Style>
  <Style ss:ID="header">
   <Font ss:FontName="Consolas" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1f2937" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="summary">
   <Font ss:FontName="Consolas" ss:Size="10" ss:Bold="1" ss:Color="#1f2937"/>
   <Interior ss:Color="#e5e7eb" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="win">
   <Font ss:FontName="Consolas" ss:Size="10" ss:Color="#065f46"/>
   <Interior ss:Color="#d1fae5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="loss">
   <Font ss:FontName="Consolas" ss:Size="10" ss:Color="#991b1b"/>
   <Interior ss:Color="#fee2e2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="breakeven">
   <Font ss:FontName="Consolas" ss:Size="10" ss:Color="#4b5563"/>
   <Interior ss:Color="#f3f4f6" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Trades">
  <Table>
${cols}
${rows.map(r => r.cells.length === 0
  ? '   <Row/>'
  : `   <Row>${r.cells.map(c => `\n     <Cell${r.styleId ? ` ss:StyleID="${r.styleId}"` : ''}><Data ss:Type="String">${escXml(c)}</Data></Cell>`).join('')}\n   </Row>`
).join('\n')}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trades_${new Date().toISOString().split('T')[0]}.xls`;
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
