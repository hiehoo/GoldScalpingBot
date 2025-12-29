import { config } from './config.js';
import { initBot, startBot } from './bot/telegram-bot.js';
import { startSchedulers } from './schedulers/index.js';

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🇿🇦 MZANSI FX VIP - Signal Bot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

async function main(): Promise<void> {
  try {
    // Validate required config
    if (!config.telegram.botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN is required');
      process.exit(1);
    }

    console.log('📋 Configuration:');
    console.log(`   Channel: ${config.telegram.channelId}`);
    console.log(`   Symbols: ${Object.values(config.symbols).join(', ')}`);
    console.log(`   Twelve Data API: ${config.twelveData.apiKey ? '✅ Set' : '⚠️ Not set (using mock)'}`);

    // Initialize and start bot
    console.log('\n🤖 Initializing bot...');
    initBot();
    await startBot();

    // Start schedulers
    console.log('\n⏰ Starting schedulers...');
    startSchedulers();

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bot is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Signals: Every hour at :00
🔥 FOMO: Every 4 hours
📍 Tracking: Every 15 minutes
📋 Recaps: Sunday 8PM SAST

Press Ctrl+C to stop
`);

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

main();
