// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  JOURNALIST — STARK MONOCHROME PDF EXPORT                                  ║
// ║  Pure black & white. Color only where data demands it.                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { jsPDF } from 'jspdf';
import type { Trade, Stats, Account, User, CalendarDay } from '../types';
import { getWeekOfMonth, getShortTradeId } from '../types';

// ─── Tokens ───────────────────────────────────────────────────────────────────
// Monochrome scale — light theme (high contrast)
const M = {
  black:   [255, 255, 255] as const,   // page background (white)
  ink0:    [238, 238, 238] as const,   // panel bg
  ink1:    [244, 244, 244] as const,   // card / row bg
  ink2:    [240, 240, 240] as const,   // subtle card alt
  rule0:   [218, 218, 218] as const,   // hairline rule
  rule1:   [195, 195, 195] as const,   // visible divider
  t4:      [100, 100, 100] as const,   // muted label
  t3:      [70,  70,  70 ] as const,   // secondary text
  t2:      [35,  35,  35 ] as const,   // body text
  t1:      [15,  15,  15 ] as const,   // primary text
  white:   [0,   0,   0  ] as const,   // headings / emphasis (black)
};

// Data colors — ONLY for wins, losses, and P&L numbers
const D = {
  green: [16,  185, 129] as const,   // profit / WIN
  red:   [244,  63,  94] as const,   // loss / LOSS
  amber: [245, 158,  11] as const,   // breakeven
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getBase64FromUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(`/api/screenshot?url=${encodeURIComponent(url)}`);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

function computeExtraStats(trades: Trade[]) {
  const pnls = trades.map(t => t.netPnl);
  const bestTrade   = Math.max(...pnls, 0);
  const worstTrade  = Math.min(...pnls, 0);
  const grossProfit = pnls.filter(p => p > 0).reduce((a, b) => a + b, 0);
  const grossLoss   = pnls.filter(p => p < 0).reduce((a, b) => a + b, 0);
  let streak = 0, best = 0;
  for (const t of trades) {
    if (t.status === 'WIN') { streak++; best = Math.max(best, streak); }
    else { streak = 0; }
  }
  return { bestTrade, worstTrade, longestWinStreak: best, grossProfit, grossLoss };
}

type RGB = readonly [number, number, number];
const sf = (d: jsPDF, c: RGB) => d.setFillColor(c[0], c[1], c[2]);
const sd = (d: jsPDF, c: RGB) => d.setDrawColor(c[0], c[1], c[2]);
const sc = (d: jsPDF, c: RGB) => d.setTextColor(c[0], c[1], c[2]);

function box(d: jsPDF, x: number, y: number, w: number, h: number, fill: RGB, stroke?: RGB) {
  sf(d, fill);
  if (stroke) { sd(d, stroke); d.setLineWidth(0.15); d.rect(x, y, w, h, 'FD'); }
  else d.rect(x, y, w, h, 'F');
}

function hline(d: jsPDF, x: number, y: number, w: number, c: RGB = M.rule0, lw = 0.2) {
  sd(d, c); d.setLineWidth(lw); d.line(x, y, x + w, y);
}

function vline(d: jsPDF, x: number, y1: number, y2: number, c: RGB = M.rule0) {
  sd(d, c); d.setLineWidth(0.15); d.line(x, y1, x, y2);
}

// Dot-grid texture
function dots(d: jsPDF, x: number, y: number, w: number, h: number, sp = 4.5) {
  sf(d, [190, 190, 190]);
  for (let cx = x + sp; cx < x + w; cx += sp)
    for (let cy = y + sp; cy < y + h; cy += sp)
      d.circle(cx, cy, 0.22, 'F');
}

// Monospaced label (caps + tracking)
function label(d: jsPDF, x: number, y: number, text: string, c: RGB = M.t4, size = 5.5) {
  d.setFont('courier', 'normal');
  d.setFontSize(size);
  sc(d, c);
  d.text(text.toUpperCase(), x, y, { charSpace: 0.8 });
}

// Signed P&L string
function pnlStr(n: number): string {
  const s = Math.abs(n).toFixed(2);
  return n >= 0 ? `+$${s}` : `-$${s}`;
}
function pnlColor(n: number): RGB {
  return n > 0 ? D.green : n < 0 ? D.red : M.t3;
}
function statusColor(s: string): RGB {
  return s === 'WIN' ? D.green : s === 'LOSS' ? D.red : D.amber;
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function addFooter(doc: jsPDF) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    box(doc, 0, 286, 210, 11, M.ink0);
    hline(doc, 0, 286, 210, M.rule1, 0.2);
    doc.setFont('courier', 'normal');
    doc.setFontSize(5.5);
    sc(doc, M.t4);
    doc.text('JOURNALIST  ·  STARK TRADING  ·  PERFORMANCE STATEMENT', 20, 292);
    sc(doc, M.t3);
    doc.text(`${i} / ${n}`, 190, 292, { align: 'right' });
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════════
export async function exportTradesToPDF(
  trades: Trade[],
  stats: Stats,
  account: Account | undefined,
  user: User | null,
  calendarDays: CalendarDay[]
) {
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const d     = doc;    // short alias
  const ML    = 20, MR = 190, PW = 210, CW = 170;
  const username    = user?.username ?? 'Trader';
  const accountName = account ? `${account.name}  ·  ${account.type}` : 'All Accounts';
  const extra       = computeExtraStats(trades);
  const dateLong    = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dateISO     = new Date().toISOString().slice(0, 10);

  // ══════════════════════════════════════════════════
  // PAGE 1 — COVER + METRICS + CALENDAR
  // ══════════════════════════════════════════════════

  // Load logo
  let logoData: string | null = null;
  try {
    const logoResp = await fetch('/logo-light.png');
    if (logoResp.ok) {
      const logoBlob = await logoResp.blob();
      logoData = await new Promise<string>(resolve => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(logoBlob);
      });
    }
  } catch { /* ignore */ }

  // Full black base
  box(d, 0, 0, PW, 297, M.black);

  // Dot grid — upper atmosphere only
  dots(d, 0, 0, PW, 60, 5);

  // ── Hero panel ──────────────────────────────────
  box(d, 0, 0, PW, 50, M.ink0);
  hline(d, 0, 50, PW, M.rule1, 0.25);

  // White top edge — structural, not decorative
  box(d, 0, 0, PW, 0.5, M.white);

  // Logo + Wordmark
  if (logoData) {
    d.addImage(logoData, 'PNG', ML, 10, 11, 11);
    d.setFont('helvetica', 'bold');
    d.setFontSize(30);
    sc(d, M.white);
    d.text('JOURNALIST', ML + 16, 22);
    box(d, ML + 16, 25, 38, 0.3, M.rule1);
  } else {
    d.setFont('helvetica', 'bold');
    d.setFontSize(30);
    sc(d, M.white);
    d.text('JOURNALIST', ML, 22);
    box(d, ML, 25, 54, 0.3, M.rule1);
  }

  // Tagline
  d.setFont('helvetica', 'normal');
  d.setFontSize(6.5);
  sc(d, M.t4);
  d.text('TRADING PERFORMANCE STATEMENT', ML, 31, { charSpace: 1.0 });

  // Meta — right column
  const labelX = 142;
  const valX = 148;
  d.setFont('courier', 'normal');
  d.setFontSize(5.5);
  sc(d, M.t4);
  d.text('TRADER:', labelX, 15, { align: 'right', charSpace: 0.5 });
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  sc(d, M.white);
  d.text(username, valX, 15);

  d.setFont('courier', 'normal');
  d.setFontSize(5.5);
  sc(d, M.t4);
  d.text('ACCOUNT:', labelX, 24, { align: 'right', charSpace: 0.5 });
  d.setFont('helvetica', 'normal');
  d.setFontSize(7);
  sc(d, M.t2);
  d.text(accountName, valX, 24);

  d.setFont('courier', 'normal');
  d.setFontSize(5.5);
  sc(d, M.t4);
  d.text('DATE:', labelX, 33, { align: 'right', charSpace: 0.5 });
  d.setFont('courier', 'normal');
  d.setFontSize(6);
  sc(d, M.t2);
  d.text(dateLong.toUpperCase(), valX, 33);

  // ── KPI strip ───────────────────────────────────
  const kpiY = 55;
  const kpis = [
    { label: 'NET P&L',       value: pnlStr(stats.totalPnl),        data: true,  n: stats.totalPnl        },
    { label: 'TRADES',        value: String(trades.length),          data: false, n: 0                     },
    { label: 'WIN RATE',      value: `${stats.winRate}%`,            data: false, n: 0                     },
    { label: 'PROFIT FACTOR', value: String(stats.profitFactor),     data: false, n: 0                     },
    { label: 'AVG P&L',       value: pnlStr(stats.averagePnl),       data: true,  n: stats.averagePnl      },
  ];
  const kW = CW / kpis.length;

  kpis.forEach((k, i) => {
    const x = ML + kW * i;
    // Alternating card shade — monochrome only
    box(d, x, kpiY, kW - 1, 22, i === 0 ? M.ink2 : M.ink1, M.rule0);

    d.setFont('helvetica', 'bold');
    d.setFontSize(i === 0 ? 15 : 13);
    // Color only for data values; white for counts/rates
    sc(d, k.data ? pnlColor(k.n) : M.white);
    d.text(k.value, x + (kW - 1) / 2, kpiY + 11, { align: 'center' });

    label(d, x + 2, kpiY + 19, k.label, M.t4, 5);
  });

  // ── Secondary row ────────────────────────────────
  const s2Y = kpiY + 26;
  const sec = [
    { label: 'BEST TRADE',   value: `+$${extra.bestTrade.toFixed(2)}`,         n: extra.bestTrade   },
    { label: 'WORST TRADE',  value: `-$${Math.abs(extra.worstTrade).toFixed(2)}`, n: extra.worstTrade },
    { label: 'WIN STREAK',   value: String(extra.longestWinStreak),              n: 1                 },
    { label: 'GROSS PROFIT', value: `+$${extra.grossProfit.toFixed(2)}`,         n: extra.grossProfit },
    { label: 'GROSS LOSS',   value: `-$${Math.abs(extra.grossLoss).toFixed(2)}`, n: extra.grossLoss   },
  ];
  const sW = CW / sec.length;
  sec.forEach((s, i) => {
    const cx = ML + sW * i + sW / 2;
    if (i > 0) vline(d, ML + sW * i, s2Y, s2Y + 13, M.rule0);
    d.setFont('courier', 'bold');
    d.setFontSize(8);
    // Best/worst/gross: these are data — use green/red
    const color = (i === 0 || i === 3) ? D.green
                : (i === 1 || i === 4) ? D.red
                : M.t2;
    sc(d, color);
    d.text(s.value, cx, s2Y + 5.5, { align: 'center' });
    label(d, cx - 8, s2Y + 12, s.label, M.t4, 5);
  });

  // ── Calendar ────────────────────────────────────
  let calY = s2Y + 18;
  hline(d, ML, calY, CW, M.rule1, 0.25);
  calY += 5;
  label(d, ML, calY, 'Daily Performance Calendar');
  calY += 5;

  if (calendarDays.length > 0) {
    const days   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const startX = 28, cW = 19.5, cH = 13;

    // Day headers — mono, muted
    d.setFont('courier', 'normal');
    d.setFontSize(5.5);
    sc(d, M.t4);
    days.forEach((dn, i) => {
      d.text(dn, startX + i * cW + cW / 2, calY, { align: 'center' });
    });
    calY += 3;

    calendarDays.forEach((day, idx) => {
      const col = idx % 7, row = Math.floor(idx / 7);
      const x = startX + col * cW, y = calY + row * cH;

      if (day.pnl > 0) {
        // Win cell: very dark green tint — color justified by data
        box(d, x, y, cW - 1, cH - 1, [6, 22, 16] as const, [14, 60, 44] as const);
      } else if (day.pnl < 0) {
        // Loss cell: very dark red tint
        box(d, x, y, cW - 1, cH - 1, [22, 6, 10] as const, [80, 18, 30] as const);
      } else {
        // No trade: flat monochrome
        box(d, x, y, cW - 1, cH - 1, M.ink1, M.rule0);
      }

      d.setFont('courier', 'bold');
      d.setFontSize(7.5);
      // Day number: data color only if traded
      sc(d, day.pnl > 0 ? D.green : day.pnl < 0 ? D.red : M.t4);
      d.text(String(day.day), x + (cW - 1) / 2, y + 5.5, { align: 'center' });

      if (day.pnl !== 0) {
        d.setFont('courier', 'normal');
        d.setFontSize(5);
        d.text(day.pnl > 0 ? `+${Math.round(day.pnl)}` : `${Math.round(day.pnl)}`,
          x + (cW - 1) / 2, y + 10, { align: 'center' });
      }
    });

    const rows   = Math.ceil(calendarDays.length / 7);
    const legY   = calY + rows * cH + 5;
    const legX   = startX;
    const legItems = [
      { label: 'Profit', fill: [6, 22, 16] as const, bd: [14, 60, 44] as const },
      { label: 'Loss',   fill: [22, 6, 10] as const, bd: [80, 18, 30] as const },
      { label: 'No trade', fill: M.ink1,              bd: M.rule0               },
    ];
    legItems.forEach((leg, i) => {
      const lx = legX + i * 30;
      box(d, lx, legY, 5, 3.5, leg.fill, leg.bd);
      d.setFont('courier', 'normal');
      d.setFontSize(5.5);
      sc(d, M.t4);
      d.text(leg.label, lx + 7, legY + 3);
    });
  }

  // ══════════════════════════════════════════════════
  // PAGE 2 — TRANSACTION LEDGER
  // ══════════════════════════════════════════════════
  d.addPage();
  box(d, 0, 0, PW, 297, M.black);
  dots(d, 0, 0, PW, 18, 4.5);

  // Header bar
  box(d, 0, 0, PW, 15, M.ink0);
  hline(d, 0, 15, PW, M.rule1, 0.25);
  d.setFont('helvetica', 'bold');
  d.setFontSize(12);
  sc(d, M.white);
  d.text('Transaction Ledger', ML, 10.5);
  d.setFont('courier', 'normal');
  d.setFontSize(6);
  sc(d, M.t4);
  d.text(`${trades.length} entries`, MR, 10.5, { align: 'right' });

  let cy = 24;

  type Col = { label: string; x: number };
  const cols: Col[] = [
    { label: 'ID',       x: 21  },
    { label: 'Date',     x: 33  },
    { label: 'Wk',       x: 46  },
    { label: 'Asset',    x: 57  },
    { label: 'Dir',      x: 74  },
    { label: 'Result',   x: 87  },
    { label: 'Strategy', x: 100 },
    { label: 'R',        x: 153 },
    { label: 'Net P&L',  x: 166 },
  ];

  const drawHead = (y: number): number => {
    box(d, ML, y, CW, 8, M.ink1);
    hline(d, ML, y + 8, CW, M.rule1, 0.3);
    cols.forEach(c => label(d, c.x, y + 5.5, c.label, M.t4, 5.5));
    return y + 13;
  };

  cy = drawHead(cy);
  const rH = 7;

  trades.forEach((t, idx) => {
    if (cy > 268) {
      d.addPage();
      box(d, 0, 0, PW, 297, M.black);
      dots(d, 0, 0, PW, 15, 4.5);
      box(d, 0, 0, PW, 13, M.ink0);
      hline(d, 0, 13, PW, M.rule1, 0.25);
      d.setFont('helvetica', 'bold');
      d.setFontSize(10);
      sc(d, M.white);
      d.text('Transaction Ledger  —  continued', ML, 9.5);
      cy = drawHead(20);
    }

    if (idx % 2 === 0) box(d, ML, cy - rH + 1, CW, rH, M.ink1);

    const ry = cy - 1.5;

    // ID — mono muted
    d.setFont('courier', 'normal');
    d.setFontSize(5.8);
    sc(d, M.t4);
    d.text(getShortTradeId(t.id).toUpperCase(), cols[0].x, ry);

    // Date
    d.setFont('helvetica', 'normal');
    d.setFontSize(6);
    sc(d, M.t3);
    d.text(new Date(t.entryTime || t.exitTime)
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), cols[1].x, ry);

    // Week
    d.setFont('courier', 'normal');
    d.setFontSize(5.8);
    sc(d, M.t4);
    d.text(getWeekOfMonth(t.entryTime || t.exitTime), cols[2].x, ry);

    // Asset — white bold (structural label, not data)
    d.setFont('helvetica', 'bold');
    d.setFontSize(6.5);
    sc(d, M.white);
    d.text(t.asset, cols[3].x, ry);

    // Direction — data: long=green, short=red
    d.setFont('courier', 'normal');
    d.setFontSize(5.5);
    sc(d, t.direction === 'LONG' ? D.green : D.red);
    d.text(t.direction, cols[4].x, ry);

    // Result — data
    d.setFont('helvetica', 'bold');
    d.setFontSize(6);
    sc(d, statusColor(t.status));
    d.text(t.status, cols[5].x, ry);

    // Strategy
    d.setFont('helvetica', 'normal');
    d.setFontSize(6);
    sc(d, M.t3);
    const strat = t.strategy.length > 20 ? t.strategy.slice(0, 18) + '…' : t.strategy;
    d.text(strat, cols[6].x, ry);

    // R — mono
    d.setFont('courier', 'normal');
    d.setFontSize(6);
    sc(d, M.t3);
    d.text(`${t.realizedR}R`, cols[7].x, ry);

    // P&L — data color
    d.setFont('courier', 'bold');
    d.setFontSize(6.5);
    sc(d, pnlColor(t.netPnl));
    d.text(pnlStr(t.netPnl), cols[8].x, ry);

    hline(d, ML, cy + 1, CW, M.rule0, 0.12);
    cy += rH;
  });

  // Net total footer — aligned with table columns
  cy += 0;
  box(d, ML, cy, CW, 9, M.ink2);
  hline(d, ML, cy, CW, M.rule1, 0.4);
  // Label — spans left columns
  d.setFont('courier', 'normal');
  d.setFontSize(6.5);
  sc(d, M.t4);
  d.text('NET TOTAL', ML + 2, cy + 5.5);
  // P&L — aligned exactly with P&L column (cols[8].x = 166)
  d.setFont('helvetica', 'bold');
  d.setFontSize(8.5);
  sc(d, pnlColor(stats.totalPnl));
  d.text(pnlStr(stats.totalPnl), cols[8].x, cy + 5.5);

  // ══════════════════════════════════════════════════
  // PAGE 3+ — TRADE DETAILS GALLERY
  // ══════════════════════════════════════════════════
  d.addPage();
  box(d, 0, 0, PW, 297, M.black);
  dots(d, 0, 0, PW, 18, 4.5);
  box(d, 0, 0, PW, 15, M.ink0);
  hline(d, 0, 15, PW, M.rule1, 0.25);
  d.setFont('helvetica', 'bold');
  d.setFontSize(12);
  sc(d, M.white);
  d.text('Trade Details & Attachments', ML, 10.5);
  let gy = 20;

  for (const t of trades) {
    const urls: string[] = t.screenshotUrls?.length
      ? t.screenshotUrls
      : t.screenshotUrl ? [t.screenshotUrl] : [];

    const cardH  = 14;
    const imgRows = urls.length > 0 ? Math.ceil(urls.length / 2) : 0;
    const totalH  = cardH + 3 + (imgRows > 0 ? imgRows * 50 + 4 : 0);

    if (gy + totalH > 270) {
      d.addPage();
      box(d, 0, 0, PW, 297, M.black);
      dots(d, 0, 0, PW, 15, 4.5);
      box(d, 0, 0, PW, 13, M.ink0);
      hline(d, 0, 13, PW, M.rule1, 0.25);
      d.setFont('helvetica', 'bold');
      d.setFontSize(10);
      sc(d, M.white);
      d.text('Trade Details & Attachments  —  continued', ML, 9.5);
      gy = 18;
    }

    const sc2 = statusColor(t.status);

    box(d, ML, gy, CW, cardH, M.ink1, M.rule0);
    // Thin status color left bar — justified as data indicator
    box(d, ML, gy, 1.2, cardH, sc2);

    // Asset + direction
    d.setFont('helvetica', 'bold');
    d.setFontSize(8.5);
    sc(d, M.white);
    d.text(`${t.direction === 'LONG' ? '↑' : '↓'} ${t.asset}`, ML + 5, gy + 5.5);

    // Trade ID — mono, muted
    d.setFont('courier', 'normal');
    d.setFontSize(6);
    sc(d, M.t4);
    d.text(`#${getShortTradeId(t.id).toUpperCase()}`, ML + 5, gy + 11);

    // Status + P&L right — data colors
    d.setFont('helvetica', 'bold');
    d.setFontSize(7.5);
    sc(d, sc2);
    d.text(t.status, MR - 2, gy + 5.5, { align: 'right' });
    d.setFont('courier', 'bold');
    d.setFontSize(7);
    sc(d, pnlColor(t.netPnl));
    d.text(pnlStr(t.netPnl), MR - 2, gy + 11, { align: 'right' });

    // Meta centre
    d.setFont('helvetica', 'normal');
    d.setFontSize(5.5);
    sc(d, M.t4);
    const dm = new Date(t.entryTime || t.exitTime)
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    d.text(`${dm}  ·  ${t.strategy}  ·  ${t.realizedR}R`, ML + 30, gy + 8.5);

    gy += cardH + 3;

    if (urls.length > 0) {
      const iW = 80, iH = 44;
      for (let si = 0; si < urls.length; si++) {
        if (gy > 250) {
          d.addPage();
          box(d, 0, 0, PW, 297, M.black);
          gy = 14;
        }
        const b64 = await getBase64FromUrl(urls[si]);
        if (b64) {
          const col = si % 2, px = ML + col * (iW + 4);
          box(d, px, gy, iW, iH, M.ink1, M.rule1);
          d.addImage(b64, 'JPEG', px, gy, iW, iH);
          // White corner tick — structural
          box(d, px, gy, 5, 0.4, M.white);
          box(d, px, gy, 0.4, 5, M.white);
          if (col === 1 || si === urls.length - 1) gy += iH + 5;
        }
      }
    }

    gy += 4;
  }

  addFooter(doc);
  doc.save(`journalist_${dateISO}.pdf`);
}