import type { CachedSignal, CachedSignalStatus } from '../types/index.js';
import { getCurrentPrice } from './market-data.js';
import { signalCache } from './signal-cache.js';
import { config } from '../config.js';

interface TrackingResult {
  signal: CachedSignal;
  previousStatus: CachedSignalStatus;
  newStatus: CachedSignalStatus;
  hitPrice: number;
  pnlPips: number;
  hitLevel: string;
}

/**
 * Calculate pips gained/lost for gold (XAU/USD)
 * Gold pip = $0.01, so 1 pip = 0.01 price movement
 */
function calculatePips(
  signal: CachedSignal,
  currentPrice: number
): number {
  const pipValue = 0.01; // Gold pip value

  const priceDiff = signal.direction === 'BUY'
    ? currentPrice - signal.entryPrice
    : signal.entryPrice - currentPrice;

  return Math.round((priceDiff / pipValue) * 10) / 10;
}

/**
 * Check if price hit SL or TP levels
 */
function checkLevels(
  signal: CachedSignal,
  currentPrice: number
): { status: CachedSignalStatus; hitLevel: string } | null {
  if (signal.direction === 'BUY') {
    // Check Stop Loss
    if (currentPrice <= signal.stopLoss) {
      return { status: 'LOSS_SL', hitLevel: 'Stop Loss' };
    }
    // Check Take Profits (in order: TP3 > TP2 > TP1)
    if (signal.takeProfit3 && currentPrice >= signal.takeProfit3) {
      return { status: 'WIN_TP3', hitLevel: 'TP3' };
    }
    if (signal.takeProfit2 && currentPrice >= signal.takeProfit2) {
      return { status: 'WIN_TP2', hitLevel: 'TP2' };
    }
    if (currentPrice >= signal.takeProfit1) {
      return { status: 'WIN_TP1', hitLevel: 'TP1' };
    }
  } else {
    // SELL direction
    // Check Stop Loss
    if (currentPrice >= signal.stopLoss) {
      return { status: 'LOSS_SL', hitLevel: 'Stop Loss' };
    }
    // Check Take Profits (in order: TP3 > TP2 > TP1)
    if (signal.takeProfit3 && currentPrice <= signal.takeProfit3) {
      return { status: 'WIN_TP3', hitLevel: 'TP3' };
    }
    if (signal.takeProfit2 && currentPrice <= signal.takeProfit2) {
      return { status: 'WIN_TP2', hitLevel: 'TP2' };
    }
    if (currentPrice <= signal.takeProfit1) {
      return { status: 'WIN_TP1', hitLevel: 'TP1' };
    }
  }

  return null;
}

/**
 * Calculate duration between two ISO timestamps
 */
function calculateDuration(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const diffMs = end - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Check a single signal for SL/TP hits
 */
export async function checkSignal(signal: CachedSignal): Promise<TrackingResult | null> {
  try {
    const currentPrice = await getCurrentPrice(signal.symbol);
    const levelHit = checkLevels(signal, currentPrice);

    if (levelHit) {
      const pnlPips = calculatePips(signal, currentPrice);
      const closedAt = new Date().toISOString();

      // Update signal in cache
      signalCache.update(signal.id, {
        status: levelHit.status,
        closedAt,
        closedPrice: currentPrice,
        pnlPips,
      });

      console.log(`[PriceTracker] Signal ${signal.id} closed: ${levelHit.hitLevel} @ ${currentPrice} (${pnlPips} pips)`);

      return {
        signal: { ...signal, status: levelHit.status, closedAt, closedPrice: currentPrice, pnlPips },
        previousStatus: 'ACTIVE',
        newStatus: levelHit.status,
        hitPrice: currentPrice,
        pnlPips,
        hitLevel: levelHit.hitLevel,
      };
    }

    return null;
  } catch (error) {
    console.error(`[PriceTracker] Failed to check signal ${signal.id}:`, error);
    return null;
  }
}

/**
 * Check all active signals for SL/TP hits
 */
export async function checkAllSignals(): Promise<TrackingResult[]> {
  const results: TrackingResult[] = [];
  const activeSignals = signalCache.getActive();

  if (activeSignals.length === 0) {
    console.log('[PriceTracker] No active signals to check');
    return results;
  }

  console.log(`[PriceTracker] Checking ${activeSignals.length} active signals...`);

  for (const signal of activeSignals) {
    const result = await checkSignal(signal);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Format WIN result message for Telegram
 */
export function formatWinMessage(result: TrackingResult): string {
  const signal = result.signal;
  const duration = calculateDuration(signal.createdAt, signal.closedAt!);
  const tpHit = result.hitLevel;

  return `
🎉 WINNER! ${tpHit} HIT! 🎉
━━━━━━━━━━━━━━━━━━━━

🥇 GOLD (XAUUSD) ${signal.direction}

📍 Entry: ${signal.entryPrice.toFixed(2)}
🎯 ${tpHit} Hit: ${result.hitPrice.toFixed(2)}
💰 +${result.pnlPips.toFixed(1)} pips BANKED

⏱️ Duration: ${duration}
📊 Confidence was: ${signal.confidence}%

━━━━━━━━━━━━━━━━━━━━

🔥 *Our traders just cashed in.* Did you?

If not, don't miss the next one. Get started:
👉 Open MY account: ${config.affiliateLink}

🇿🇦 Mzansi FX VIP - We eat, you eat!
`.trim();
}

/**
 * Format LOSS result message for Telegram
 */
export function formatLossMessage(result: TrackingResult): string {
  const signal = result.signal;
  const duration = calculateDuration(signal.createdAt, signal.closedAt!);

  return `
❌ STOP LOSS HIT ❌
━━━━━━━━━━━━━━━━━━━━

🥇 GOLD (XAUUSD) ${signal.direction}

📍 Entry: ${signal.entryPrice.toFixed(2)}
🛑 SL Hit: ${result.hitPrice.toFixed(2)}
💸 ${result.pnlPips.toFixed(1)} pips

⏱️ Duration: ${duration}
📊 Confidence was: ${signal.confidence}%

━━━━━━━━━━━━━━━━━━━━

📚 *Losses are part of trading.* Pros manage risk.

Protected your capital? That's a win. Next signal incoming.

🇿🇦 Mzansi FX VIP - Stay disciplined!
`.trim();
}

/**
 * Format EXPIRED result message for Telegram
 */
export function formatExpiredMessage(signal: CachedSignal, currentPrice: number): string {
  const pnlPips = calculatePips(signal, currentPrice);
  const pnlText = pnlPips >= 0 ? `+${pnlPips.toFixed(1)}` : `${pnlPips.toFixed(1)}`;

  return `
⏰ SIGNAL EXPIRED ⏰
━━━━━━━━━━━━━━━━━━━━

🥇 GOLD (XAUUSD) ${signal.direction}

📍 Entry: ${signal.entryPrice.toFixed(2)}
📍 Current: ${currentPrice.toFixed(2)}
📊 Unrealized: ${pnlText} pips

Neither TP nor SL hit within 4h window.

💡 *Still in the trade?* Consider closing manually.

━━━━━━━━━━━━━━━━━━━━
🇿🇦 Mzansi FX VIP
`.trim();
}

/**
 * Format tracking result for Telegram (auto-detects win/loss)
 */
export function formatTrackingResult(result: TrackingResult): string {
  if (result.newStatus.startsWith('WIN_')) {
    return formatWinMessage(result);
  } else {
    return formatLossMessage(result);
  }
}

/**
 * Review expired signals and mark them
 */
export async function reviewExpiredSignals(): Promise<CachedSignal[]> {
  const expired = signalCache.getExpired();

  if (expired.length === 0) {
    console.log('[PriceTracker] No expired signals to review');
    return [];
  }

  console.log(`[PriceTracker] Reviewing ${expired.length} expired signals...`);

  for (const signal of expired) {
    try {
      const currentPrice = await getCurrentPrice(signal.symbol);
      const pnlPips = calculatePips(signal, currentPrice);
      const closedAt = new Date().toISOString();

      signalCache.update(signal.id, {
        status: 'EXPIRED',
        closedAt,
        closedPrice: currentPrice,
        pnlPips,
      });

      console.log(`[PriceTracker] Signal ${signal.id} marked EXPIRED @ ${currentPrice} (${pnlPips} pips unrealized)`);
    } catch (error) {
      console.error(`[PriceTracker] Failed to review expired signal ${signal.id}:`, error);
    }
  }

  return expired;
}

/**
 * Get tracking statistics from cache
 */
export function getStats() {
  return signalCache.getStats();
}

export const priceTracker = {
  checkSignal,
  checkAllSignals,
  reviewExpiredSignals,
  formatTrackingResult,
  formatWinMessage,
  formatLossMessage,
  formatExpiredMessage,
  getStats,
};
