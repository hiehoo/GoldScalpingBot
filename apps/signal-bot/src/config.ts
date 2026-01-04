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
  // All times aligned to SAST (South African Standard Time = UTC+2)
  schedulers: {
    // 4H signals at round hours SAST: 12AM, 4AM, 8AM, 12PM, 4PM, 8PM
    // UTC equivalents: 22:00, 02:00, 06:00, 10:00, 14:00, 18:00
    signals: '0 2,6,10,14,18,22 * * *',
    priceTracker: '*/15 * * * *', // Every 15 minutes for TP/SL checks
    // Signal review runs 5 min after each signal time
    signalReview: '5 2,6,10,14,18,22 * * *',
    dailyRecap: '0 18 * * *', // 8 PM SAST = 18:00 UTC
    weeklyRecap: '0 18 * * 0', // Sunday 8 PM SAST = 18:00 UTC
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
