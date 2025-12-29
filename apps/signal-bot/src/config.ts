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
  // Note: NDX requires paid Twelve Data plan
  // NAS100 uses mock data for MVP (QQQ price scale doesn't match CFD)
  symbols: {
    gold: 'XAU/USD',
    nas100: 'NAS100_MOCK',  // Use mock data - real NAS100 CFD ~21,500 vs QQQ ~520
  },

  // Signal settings
  signals: {
    intervalMinutes: 60, // Generate signals every hour
    riskRewardRatio: 2.5, // 1:2.5 risk-reward
    defaultStopLossPips: {
      gold: 150, // $1.50 for gold
      nas100: 50, // 50 points for NAS100
    },
  },

  // Scheduler settings (cron expressions)
  schedulers: {
    signals: '0 * * * *', // Every hour at :00
    fomo: '0 */4 * * *', // Every 4 hours
    priceTracker: '*/15 * * * *', // Every 15 minutes
    dailyRecap: '0 20 * * *', // 8 PM daily (SAST)
    weeklyRecap: '0 20 * * 0', // Sunday 8 PM (SAST)
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
