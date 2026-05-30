import type { Trade } from '../types';

const HEADERS = [
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

export function exportTradesToExcel(trades: Trade[]): void {
  const wins = trades.filter(t => t.status === 'WIN');
  const losses = trades.filter(t => t.status === 'LOSS');
  const totalPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  const winRate = trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0;

  const rows: { cells: string[]; styleId: string }[] = [];

  rows.push({ cells: ['Export Date', new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })], styleId: 'summary' });
  rows.push({ cells: ['Total Trades', String(trades.length)], styleId: 'summary' });
  rows.push({ cells: ['Wins', String(wins.length)], styleId: 'summary' });
  rows.push({ cells: ['Losses', String(losses.length)], styleId: 'summary' });
  rows.push({ cells: ['Win Rate', `${winRate}%`], styleId: 'summary' });
  rows.push({ cells: ['Net P&L', formatCurrency(totalPnl)], styleId: 'summary' });
  rows.push({ cells: [], styleId: '' });

  rows.push({ cells: HEADERS.map(h => h.label), styleId: 'header' });

  for (const t of trades) {
    const styleId = t.status === 'WIN' ? 'win' : t.status === 'LOSS' ? 'loss' : 'breakeven';
    rows.push({
      cells: [
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
      ],
      styleId,
    });
  }

  const cols = HEADERS.map(h => `    <Column ss:Width="${h.width}"/>`).join('\n');
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
