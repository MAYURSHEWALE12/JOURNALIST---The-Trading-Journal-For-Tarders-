import type { Trade } from '../types';

export interface JournalistScoreResult {
  score: number;
  winRateScore: number;
  profitFactorScore: number;
  riskManagementScore: number;
  consistencyScore: number;
  disciplineScore: number;
  level: string;
  levelLabel: string;
  insights: string[];
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const sqDiff = values.reduce((s, v) => s + (v - mean) ** 2, 0);
  return Math.sqrt(sqDiff / (values.length - 1));
}

function computeWinRateScore(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.status === 'WIN').length;
  return Math.round((wins / trades.length) * 100);
}

function computeProfitFactorScore(trades: Trade[]): number {
  const grossWins = trades.filter(t => t.netPnl > 0).reduce((s, t) => s + t.netPnl, 0);
  const grossLosses = Math.abs(trades.filter(t => t.netPnl < 0).reduce((s, t) => s + t.netPnl, 0));
  if (grossWins === 0 && grossLosses === 0) return 0;
  if (grossLosses === 0) return 100;
  const pf = grossWins / grossLosses;
  return Math.min(Math.round(pf * 20), 100);
}

function computeRiskManagementScore(trades: Trade[]): number {
  if (trades.length < 2) return 50;

  const validTrades = trades.filter(t => t.plannedR > 0);
  if (validTrades.length === 0) return 50;

  const avgRRatio = validTrades.reduce((s, t) => s + (t.realizedR / t.plannedR), 0) / validTrades.length;
  const rScore = Math.min(Math.round((avgRRatio / 3) * 40), 40);

  const qty = trades.map(t => t.quantity).filter(q => q > 0);
  let sizeScore = 30;
  if (qty.length >= 3) {
    const mean = qty.reduce((s, v) => s + v, 0) / qty.length;
    const cv = stdDev(qty) / mean;
    sizeScore = Math.round(Math.max(0, (1 - cv) * 30));
  }

  const withStop = trades.filter(t => t.plannedR > 0 && Math.abs(t.realizedR) <= Math.abs(t.plannedR) * 2).length;
  const riskRatio = trades.length > 0 ? withStop / trades.length : 0;
  const riskScore = Math.round(riskRatio * 30);

  return Math.min(rScore + sizeScore + riskScore, 100);
}

function computeConsistencyScore(trades: Trade[]): number {
  if (trades.length < 3) return 50;

  const dayMap = new Map<string, number[]>();
  for (const t of trades) {
    const day = t.entryTime.slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(t.netPnl);
  }

  const dailyPnls = Array.from(dayMap.values()).map(pnls => pnls.reduce((s, v) => s + v, 0));

  if (dailyPnls.length < 3) return 50;

  const meanPnl = dailyPnls.reduce((s, v) => s + v, 0) / dailyPnls.length;
  const sd = stdDev(dailyPnls);

  let volScore = 50;
  if (meanPnl !== 0 && sd > 0) {
    const cv = Math.abs(sd / meanPnl);
    volScore = Math.round(Math.max(0, Math.min(50, (1 / (1 + cv)) * 50)));
  }

  const tradeCounts = trades.length;
  const daysWithTrades = dailyPnls.length;
  const freqRatio = daysWithTrades > 0 ? tradeCounts / daysWithTrades : 0;
  const freqScore = Math.min(Math.round((freqRatio / 3) * 30), 30);

  const positiveDays = dailyPnls.filter(p => p > 0).length;
  const dayWinRate = dailyPnls.length > 0 ? positiveDays / dailyPnls.length : 0;
  const dayWrScore = Math.round(dayWinRate * 20);

  return Math.min(volScore + freqScore + dayWrScore, 100);
}

function computeDisciplineScore(trades: Trade[]): number {
  if (trades.length === 0) return 0;

  let score = 0;

  const withStrategy = trades.filter(t => t.strategy && t.strategy.trim().length > 0).length;
  score += (withStrategy / trades.length) * 25;

  const withEmotions = trades.filter(t => t.emotionalState && t.emotionalState.length > 0).length;
  score += (withEmotions / trades.length) * 25;

  const withNotes = trades.filter(t => t.notes && t.notes.trim().length > 5).length;
  score += (withNotes / trades.length) * 25;

  const withTags = trades.filter(t => t.tags && t.tags.length > 0).length;
  score += (withTags / trades.length) * 25;

  return Math.round(Math.min(score, 100));
}

const LEVELS = [
  { min: 95, key: 'institutional', label: 'Institutional Level' },
  { min: 90, key: 'elite', label: 'Elite Trader' },
  { min: 80, key: 'advanced', label: 'Advanced Trader' },
  { min: 70, key: 'consistent', label: 'Consistent Trader' },
  { min: 60, key: 'developing', label: 'Developing Trader' },
  { min: 0, key: 'needsImprovement', label: 'Needs Improvement' },
] as const;

function getLevel(score: number): { key: string; label: string } {
  for (const l of LEVELS) {
    if (score >= l.min) return { key: l.key, label: l.label };
  }
  return { key: 'needsImprovement', label: 'Needs Improvement' };
}

function generateInsights(
  winRateScore: number,
  profitFactorScore: number,
  riskScore: number,
  consistencyScore: number,
  disciplineScore: number,
  trades: Trade[],
): string[] {
  const insights: string[] = [];
  const metrics = [
    { name: 'Win Rate', score: winRateScore },
    { name: 'Profit Factor', score: profitFactorScore },
    { name: 'Risk Management', score: riskScore },
    { name: 'Consistency', score: consistencyScore },
    { name: 'Discipline', score: disciplineScore },
  ];

  metrics.sort((a, b) => b.score - a.score);
  const best = metrics[0];
  const worst = metrics[metrics.length - 1];

  if (best.score > 70) {
    insights.push(`Your strongest area is ${best.name}.`);
  }

  if (worst.score < 60) {
    insights.push(`${worst.name} needs improvement.`);
  } else if (worst.score < 75) {
    insights.push(`Consider focusing on ${worst.name.toLowerCase()} to level up.`);
  }

  if (trades.length < 5) {
    insights.push('Add more trades to get more accurate scoring.');
  } else {
    const recent = trades.slice(-5);
    const recentWins = recent.filter(t => t.status === 'WIN').length;
    if (recentWins >= 4) {
      insights.push('Strong recent performance — keep the momentum going.');
    } else if (recentWins <= 1) {
      insights.push('Recent results are soft. Review your strategy and entries.');
    }
  }

  const wins = trades.filter(t => t.status === 'WIN').length;
  if (trades.length >= 10 && wins > 0) {
    const avgWin = trades.filter(t => t.status === 'WIN').reduce((s, t) => s + t.netPnl, 0) / wins;
    if (avgWin > 0) {
      insights.push(`Your average winner is +$${avgWin.toFixed(0)}.`);
    }
  }

  return insights.slice(0, 5);
}

export function computeJournalistScore(trades: Trade[]): JournalistScoreResult {
  const wrScore = computeWinRateScore(trades);
  const pfScore = computeProfitFactorScore(trades);
  const rmScore = computeRiskManagementScore(trades);
  const conScore = computeConsistencyScore(trades);
  const discScore = computeDisciplineScore(trades);

  const rawScore =
    wrScore * 0.25 +
    pfScore * 0.25 +
    rmScore * 0.20 +
    conScore * 0.15 +
    discScore * 0.15;

  const score = Math.round(Math.min(Math.max(rawScore, 0), 100));
  const level = getLevel(score);
  const insights = generateInsights(wrScore, pfScore, rmScore, conScore, discScore, trades);

  return {
    score,
    winRateScore: wrScore,
    profitFactorScore: pfScore,
    riskManagementScore: rmScore,
    consistencyScore: conScore,
    disciplineScore: discScore,
    level: level.key,
    levelLabel: level.label,
    insights,
  };
}
