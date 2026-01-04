import cron from 'node-cron';
import { config } from '../config.js';
import { generateAllSignals, formatSignalMessage } from '../services/signal-generator.js';
import { signalCache } from '../services/signal-cache.js';
import { checkAllSignals, formatTrackingResult, reviewExpiredSignals, formatExpiredMessage } from '../services/price-tracker.js';
import { getCurrentPrice } from '../services/market-data.js';
import { postToChannel } from '../bot/channel-poster.js';
import { generateWeeklyRecap, recordSignalResult } from '../bot/recap-generator.js';
import type { CachedSignal } from '../types/index.js';

const { schedulers } = config;

/**
 * Convert TradingSignal to CachedSignal for storage
 */
function toCachedSignal(signal: Awaited<ReturnType<typeof generateAllSignals>>[number]): CachedSignal {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.signals.expiryMinutes * 60 * 1000);

  return {
    id: signal.id,
    symbol: signal.symbol,
    direction: signal.direction,
    entryPrice: signal.entryPrice,
    stopLoss: signal.stopLoss,
    takeProfit1: signal.takeProfit1,
    takeProfit2: signal.takeProfit2,
    takeProfit3: signal.takeProfit3,
    confidence: signal.confidence,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'ACTIVE',
  };
}

/**
 * Signal generation task - runs every 4 hours
 * Posts signal message to Telegram (no chart image)
 */
async function signalTask(): Promise<void> {
  console.log('[Scheduler] Running signal generation task...');

  try {
    const signals = await generateAllSignals();

    for (const signal of signals) {
      // Format message (text only, no chart)
      const message = formatSignalMessage(signal);

      // Post to channel
      await postToChannel(message);

      // Cache signal for tracking
      const cachedSignal = toCachedSignal(signal);
      signalCache.add(cachedSignal);

      console.log(`[Scheduler] Signal posted: ${signal.symbol} ${signal.direction}`);
    }

    if (signals.length === 0) {
      console.log('[Scheduler] No signals generated this cycle');
    }
  } catch (error) {
    console.error('[Scheduler] Signal task error:', error);
  }
}

/**
 * Price tracker task - runs every 15 minutes
 * Checks for TP/SL hits and posts results
 */
async function trackerTask(): Promise<void> {
  console.log('[Scheduler] Running price tracker task...');

  try {
    const results = await checkAllSignals();

    for (const result of results) {
      const message = formatTrackingResult(result);
      await postToChannel(message);

      // Record for recaps
      const isWin = result.newStatus.startsWith('WIN_');
      recordSignalResult(result.pnlPips, isWin);

      console.log(`[Scheduler] Result posted: ${result.signal.symbol} ${result.newStatus}`);
    }

    if (results.length === 0) {
      console.log('[Scheduler] No signals closed this check');
    }
  } catch (error) {
    console.error('[Scheduler] Tracker task error:', error);
  }
}

/**
 * Signal review task - runs 5 minutes after signal generation
 * Marks expired signals and posts summary
 */
async function signalReviewTask(): Promise<void> {
  console.log('[Scheduler] Running signal review task...');

  try {
    const expiredSignals = await reviewExpiredSignals();

    for (const signal of expiredSignals) {
      try {
        const currentPrice = await getCurrentPrice(signal.symbol);
        const message = formatExpiredMessage(signal, currentPrice);
        await postToChannel(message);
        console.log(`[Scheduler] Expired signal posted: ${signal.id}`);
      } catch (error) {
        console.error(`[Scheduler] Failed to post expired signal ${signal.id}:`, error);
      }
    }

    if (expiredSignals.length === 0) {
      console.log('[Scheduler] No expired signals to review');
    }
  } catch (error) {
    console.error('[Scheduler] Signal review task error:', error);
  }
}

/**
 * Weekly recap task - runs Sunday 8PM SAST
 */
async function weeklyRecapTask(): Promise<void> {
  console.log('[Scheduler] Running weekly recap task...');

  try {
    const recap = generateWeeklyRecap();
    await postToChannel(recap);
    console.log('[Scheduler] Weekly recap posted');
  } catch (error) {
    console.error('[Scheduler] Weekly recap error:', error);
  }
}

/**
 * Daily recap task - runs 8PM SAST
 * Posts signal stats summary
 */
async function dailyRecapTask(): Promise<void> {
  console.log('[Scheduler] Running daily recap task...');

  try {
    const stats = signalCache.getStats();

    if (stats.wins + stats.losses + stats.expired === 0) {
      console.log('[Scheduler] No signals to recap today');
      return;
    }

    const message = `
📊 *DAILY STATS* 📊
━━━━━━━━━━━━━━━━━━━━

✅ Wins: ${stats.wins}
❌ Losses: ${stats.losses}
⏰ Expired: ${stats.expired}
📈 Win Rate: ${stats.winRate}%
💰 Total Pips: ${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips}

━━━━━━━━━━━━━━━━━━━━
🇿🇦 Mzansi FX VIP
`.trim();

    await postToChannel(message);
    console.log('[Scheduler] Daily stats posted');
  } catch (error) {
    console.error('[Scheduler] Daily recap error:', error);
  }
}

/**
 * Initialize signal cache before starting schedulers
 */
async function initializeCache(): Promise<void> {
  try {
    await signalCache.init();
    console.log('[Scheduler] Signal cache initialized');
  } catch (error) {
    console.error('[Scheduler] Failed to initialize signal cache:', error);
  }
}

/**
 * Start all schedulers
 */
export async function startSchedulers(): Promise<void> {
  console.log('[Scheduler] Starting schedulers...');

  // Initialize cache first
  await initializeCache();

  // Signal generation - every 4 hours at :00
  cron.schedule(schedulers.signals, signalTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  📊 Signals: ${schedulers.signals}`);

  // Price tracker - every 15 minutes
  cron.schedule(schedulers.priceTracker, trackerTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  📍 Tracker: ${schedulers.priceTracker}`);

  // Signal review - 5 minutes after signal generation
  cron.schedule(schedulers.signalReview, signalReviewTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  🔍 Review: ${schedulers.signalReview}`);

  // Daily recap - 8PM SAST
  cron.schedule(schedulers.dailyRecap, dailyRecapTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  📋 Daily: ${schedulers.dailyRecap}`);

  // Weekly recap - Sunday 8PM SAST
  cron.schedule(schedulers.weeklyRecap, weeklyRecapTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  🏆 Weekly: ${schedulers.weeklyRecap}`);

  console.log('[Scheduler] All schedulers started');
}

/**
 * Run a one-time signal generation (for testing)
 */
export async function runSignalNow(): Promise<void> {
  await initializeCache();
  await signalTask();
}

/**
 * Run a one-time tracker check (for testing)
 */
export async function runTrackerNow(): Promise<void> {
  await initializeCache();
  await trackerTask();
}

export const scheduler = {
  startSchedulers,
  runSignalNow,
  runTrackerNow,
  signalTask,
  trackerTask,
  signalReviewTask,
};
