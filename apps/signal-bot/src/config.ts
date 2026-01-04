import 'dotenv/config';

// Validate required environment variables
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHANNEL_ID',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Missing ${envVar} - bot will not function properly`);
  }
}

export const config = {
  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@Mzansifxvip',
  },

  // Market Data API
  twelveData: {
    apiKey: process.env.TWELVE_DATA_API_KEY || '',
    baseUrl: 'https://api.twelvedata.com',
  },

  // Trading pairs
  // Note: NAS100/NDX requires paid Twelve Data plan - Gold only for MVP
  symbols: {
    gold: 'XAU/USD',
  },

  // Signal settings
  signals: {
    intervalMinutes: 240, // Generate signals every 4 hours
    expiryMinutes: 240, // Signals expire after 4 hours
    riskRewardRatio: 2.5, // 1:2.5 risk-reward
    defaultStopLossPips: {
      gold: 150, // $1.50 for gold
      nas100: 50, // 50 points for NAS100
    },
  },

  // Scheduler settings (cron expressions)
  schedulers: {
    signals: '0 */4 * * *', // Every 4 hours at :00 (0, 4, 8, 12, 16, 20)
    priceTracker: '*/15 * * * *', // Every 15 minutes for TP/SL checks
    signalReview: '5 */4 * * *', // 5 min after signal gen for cleanup
    dailyRecap: '0 20 * * *', // 8 PM daily (SAST)
    weeklyRecap: '0 20 * * 0', // Sunday 8 PM (SAST)
    // FOMO scheduler removed - no longer generating FOMO posts
  },

  // Affiliate
  affiliateLink: process.env.AFFILIATE_LINK || 'https://www.puprime.net/campaign?cs=mzansifxvip&track=direct',

  // Branding
  branding: {
    name: 'Mzansi FX VIP',
    emoji: '🇿🇦',
  },
} as const;

export type Config = typeof config;
