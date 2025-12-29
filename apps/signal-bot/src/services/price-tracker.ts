import type { TradingSignal, SignalStatus } from '../types/index.js';
import { getCurrentPrice } from './market-data.js';

// In-memory storage for active signals (MVP - no database)
const activeSignals: Map<string, TradingSignal> = new Map();

interface TrackingResult {
  signal: TradingSignal;
  previousStatus: SignalStatus;
  newStatus: SignalStatus;
  hitPrice: number;
  pipsGained: number;
}

/**
 * Add signal to tracking
 */
export function trackSignal(signal: TradingSignal): void {
  activeSignals.set(signal.id, signal);
  console.log(`📍 Tracking signal: ${signal.symbol} ${signal.direction} @ ${signal.entryPrice}`);
}

/**
 * Remove signal from tracking
 */
export function untrackSignal(signalId: string): void {
  activeSignals.delete(signalId);
}

/**
 * Get all active signals
 */
export function getActiveSignals(): TradingSignal[] {
  return Array.from(activeSignals.values()).filter(s => s.status === 'ACTIVE');
}

/**
 * Calculate pips gained/lost
 */
function calculatePips(
  signal: TradingSignal,
  currentPrice: number
): number {
  const isGold = signal.symbol === 'XAU/USD';
  const pipValue = isGold ? 0.01 : 1;

  const priceDiff = signal.direction === 'BUY'
    ? currentPrice - signal.entryPrice
    : signal.entryPrice - currentPrice;

  return Math.round(priceDiff / pipValue);
}

/**
 * Check if price hit SL or TP levels
 */
function checkLevels(
  signal: TradingSignal,
  currentPrice: number
): { status: SignalStatus; hitLevel: string } | null {
  if (signal.direction === 'BUY') {
    // Check Stop Loss
    if (currentPrice <= signal.stopLoss) {
      return { status: 'SL_HIT', hitLevel: 'Stop Loss' };
    }
    // Check Take Profits (in order)
    if (signal.takeProfit3 && currentPrice >= signal.takeProfit3) {
      return { status: 'TP_HIT', hitLevel: 'TP3' };
    }
    if (signal.takeProfit2 && currentPrice >= signal.takeProfit2) {
      return { status: 'TP_HIT', hitLevel: 'TP2' };
    }
    if (currentPrice >= signal.takeProfit1) {
      return { status: 'TP_HIT', hitLevel: 'TP1' };
    }
  } else {
    // SELL direction
    // Check Stop Loss
    if (currentPrice >= signal.stopLoss) {
      return { status: 'SL_HIT', hitLevel: 'Stop Loss' };
    }
    // Check Take Profits (in order)
    if (signal.takeProfit3 && currentPrice <= signal.takeProfit3) {
      return { status: 'TP_HIT', hitLevel: 'TP3' };
    }
    if (signal.takeProfit2 && currentPrice <= signal.takeProfit2) {
      return { status: 'TP_HIT', hitLevel: 'TP2' };
    }
    if (currentPrice <= signal.takeProfit1) {
      return { status: 'TP_HIT', hitLevel: 'TP1' };
    }
  }

  return null;
}

/**
 * Check a single signal for SL/TP hits
 */
export async function checkSignal(signal: TradingSignal): Promise<TrackingResult | null> {
  try {
    const currentPrice = await getCurrentPrice(signal.symbol);
    const levelHit = checkLevels(signal, currentPrice);

    if (levelHit) {
      const pipsGained = calculatePips(signal, currentPrice);

      // Update signal status
      signal.status = levelHit.status;
      signal.closedAt = new Date();
      signal.closePrice = currentPrice;
      signal.pipsGained = pipsGained;

      // Remove from active tracking
      untrackSignal(signal.id);

      console.log(`✅ Signal ${signal.id} closed: ${levelHit.hitLevel} @ ${currentPrice} (${pipsGained} pips)`);

      return {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: levelHit.status,
        hitPrice: currentPrice,
        pipsGained,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to check signal ${signal.id}:`, error);
    return null;
  }
}

/**
 * Check all active signals for SL/TP hits
 */
export async function checkAllSignals(): Promise<TrackingResult[]> {
  const results: TrackingResult[] = [];
  const signals = getActiveSignals();

  console.log(`🔍 Checking ${signals.length} active signals...`);

  for (const signal of signals) {
    const result = await checkSignal(signal);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Format tracking result for Telegram notification
 */
export function formatTrackingUpdate(result: TrackingResult): string {
  const isWin = result.newStatus === 'TP_HIT';
  const emoji = isWin ? '✅' : '❌';
  const statusText = isWin ? 'TAKE PROFIT HIT!' : 'STOP LOSS HIT';
  const symbolEmoji = result.signal.symbol === 'XAU/USD' ? '🥇' : '📊';

  const pipsText = result.pipsGained >= 0
    ? `+${result.pipsGained}`
    : `${result.pipsGained}`;

  return `
${emoji} *${statusText}* ${emoji}
━━━━━━━━━━━━━━━━━━━━

${symbolEmoji} *${result.signal.symbol}*
${result.signal.direction === 'BUY' ? '🟢' : '🔴'} ${result.signal.direction}

📍 Entry: ${result.signal.entryPrice.toFixed(2)}
🎯 Exit: ${result.hitPrice.toFixed(2)}
📊 Result: *${pipsText} pips*

━━━━━━━━━━━━━━━━━━━━
🇿🇦 *Mzansi FX VIP*
`.trim();
}

/**
 * Get trading statistics
 */
export function getStats(): {
  activeCount: number;
  totalTracked: number;
} {
  return {
    activeCount: getActiveSignals().length,
    totalTracked: activeSignals.size,
  };
}

export const priceTracker = {
  trackSignal,
  untrackSignal,
  getActiveSignals,
  checkSignal,
  checkAllSignals,
  formatTrackingUpdate,
  getStats,
};
