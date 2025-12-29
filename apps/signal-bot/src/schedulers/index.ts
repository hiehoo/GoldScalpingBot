import cron from 'node-cron';
import { config } from '../config.js';
import { generateAllSignals, formatSignalMessage } from '../services/signal-generator.js';
import { renderSignalChart } from '../services/chart-renderer.js';
import { generateFomoData, renderFomoScreenshot, formatFomoCaption } from '../services/fomo-generator.js';
import { checkAllSignals, formatTrackingUpdate, trackSignal } from '../services/price-tracker.js';
import { fetchCandles } from '../services/market-data.js';
import { postToChannel, postImageToChannel, postAffiliateCTA } from '../bot/channel-poster.js';
import { generateWeeklyRecap, generateMonthlyRecap, recordSignalResult } from '../bot/recap-generator.js';

const { schedulers } = config;

/**
 * Signal generation task - runs every hour
 */
async function signalTask(): Promise<void> {
  console.log('⏰ Running signal generation task...');

  try {
    const signals = await generateAllSignals();

    for (const signal of signals) {
      // Get candles for chart
      const candles = await fetchCandles(signal.symbol);

      // Render chart
      const chartBuffer = await renderSignalChart(candles, signal);

      // Format message
      const message = formatSignalMessage(signal);

      // Post to channel
      await postImageToChannel(chartBuffer, message);

      // Track signal for SL/TP monitoring
      trackSignal(signal);

      console.log(`📤 Signal posted: ${signal.symbol} ${signal.direction}`);
    }

    if (signals.length === 0) {
      console.log('ℹ️ No signals generated this hour');
    }
  } catch (error) {
    console.error('Signal task error:', error);
  }
}

/**
 * FOMO post task - runs every 4 hours
 */
async function fomoTask(): Promise<void> {
  console.log('⏰ Running FOMO post task...');

  try {
    const fomoData = generateFomoData();
    const screenshot = await renderFomoScreenshot(fomoData);
    const caption = formatFomoCaption(fomoData);

    await postImageToChannel(screenshot, caption);
    console.log('📤 FOMO post sent');
  } catch (error) {
    console.error('FOMO task error:', error);
  }
}

/**
 * Price tracker task - runs every 15 minutes
 */
async function trackerTask(): Promise<void> {
  console.log('⏰ Running price tracker task...');

  try {
    const results = await checkAllSignals();

    for (const result of results) {
      const message = formatTrackingUpdate(result);
      await postToChannel(message);

      // Record for recaps
      recordSignalResult(result.pipsGained, result.newStatus === 'TP_HIT');

      console.log(`📤 Tracking update: ${result.signal.symbol} ${result.newStatus}`);
    }

    if (results.length === 0) {
      console.log('ℹ️ No signals closed this check');
    }
  } catch (error) {
    console.error('Tracker task error:', error);
  }
}

/**
 * Weekly recap task - runs Sunday 8PM SAST
 */
async function weeklyRecapTask(): Promise<void> {
  console.log('⏰ Running weekly recap task...');

  try {
    const recap = generateWeeklyRecap();
    await postToChannel(recap);
    console.log('📤 Weekly recap posted');
  } catch (error) {
    console.error('Weekly recap error:', error);
  }
}

/**
 * Daily recap task - runs 8PM SAST
 */
async function dailyRecapTask(): Promise<void> {
  console.log('⏰ Running daily recap task...');

  try {
    // Post affiliate CTA 2x per week (Tuesday & Thursday)
    const today = new Date().getDay();
    if (today === 2 || today === 4) {
      await postAffiliateCTA();
      console.log('📤 Affiliate CTA posted');
    }
  } catch (error) {
    console.error('Daily recap error:', error);
  }
}

/**
 * Start all schedulers
 */
export function startSchedulers(): void {
  console.log('🕐 Starting schedulers...');

  // Signal generation - every hour at :00
  cron.schedule(schedulers.signals, signalTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  📊 Signals: ${schedulers.signals}`);

  // FOMO posts - every 4 hours
  cron.schedule(schedulers.fomo, fomoTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  🔥 FOMO: ${schedulers.fomo}`);

  // Price tracker - every 15 minutes
  cron.schedule(schedulers.priceTracker, trackerTask, {
    timezone: 'Africa/Johannesburg',
  });
  console.log(`  📍 Tracker: ${schedulers.priceTracker}`);

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

  console.log('✅ All schedulers started');
}

/**
 * Run a one-time signal generation (for testing)
 */
export async function runSignalNow(): Promise<void> {
  await signalTask();
}

/**
 * Run a one-time FOMO post (for testing)
 */
export async function runFomoNow(): Promise<void> {
  await fomoTask();
}

export const scheduler = {
  startSchedulers,
  runSignalNow,
  runFomoNow,
  signalTask,
  fomoTask,
  trackerTask,
};
