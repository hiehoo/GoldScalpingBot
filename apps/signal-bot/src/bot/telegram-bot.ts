import { Telegraf, Context } from 'telegraf';
import { config } from '../config.js';

const bot: Telegraf<Context> = new Telegraf(config.telegram.botToken);

// Admin user ID (you can get this by sending /myid to @userinfobot)
const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];

/**
 * Initialize bot with handlers
 */
export function initBot(): Telegraf<Context> {
  // Start command - welcome message
  bot.start(async (ctx) => {
    const welcomeMessage = `
🇿🇦 *Welcome to Mzansi FX VIP!* 🇿🇦

${ctx.from?.first_name || 'Trader'}, you're in! 👋

While you were scrolling, our members just banked +47 pips on Gold today.

🔥 *You're now getting:*
• FREE Gold signals (posted live)
• FREE NAS100 signals
• Exact entry + exit levels
• Real-time profit tracking
• Weekly winner spotlights

⚠️ *Don't miss out:* Turn on notifications. Entry windows close fast.

━━━━━━━━━━━━━━━━━━━━

💰 *Ready to trade these signals?*

Open MY PU Prime account now:
${config.affiliateLink}

✅ Start with R1,500
✅ FSCA regulated (safe for SA)
✅ ZAR deposits via local banks

*Next signal drops in 2 hours.* Will you be ready?

━━━━━━━━━━━━━━━━━━━━
🇿🇦 We eat, you eat! 🍽️
`.trim();

    await ctx.replyWithMarkdown(welcomeMessage);
  });

  // Help command
  bot.help(async (ctx) => {
    const helpMessage = `
📚 *Quick Commands*

/start - See what you're missing
/help - This menu
/status - Bot status
/signals - Recent wins

━━━━━━━━━━━━━━━━━━━━

💡 *Pro tip:* Most traders profit within their first week. The only losers? Those who never start.

🔗 *Open MY account:* ${config.affiliateLink}
📢 *Channel:* @MzansiFxVIP

Questions? DM @MzansiFxVIP
`.trim();

    await ctx.replyWithMarkdown(helpMessage);
  });

  // Status command
  bot.command('status', async (ctx) => {
    await ctx.reply('✅ Bot is online and running!');
  });

  // Admin command: Post signal now
  bot.command('postsignal', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId || (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(userId))) {
      await ctx.reply('⛔ Admin only command');
      return;
    }

    await ctx.reply('📊 Generating and posting signal...');
    try {
      // Dynamic import to avoid circular dependency
      const { runSignalNow } = await import('../schedulers/index.js');
      await runSignalNow();
      await ctx.reply('✅ Signal posted to channel!');
    } catch (error) {
      console.error('Post signal error:', error);
      await ctx.reply(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Admin command: Check signals status
  bot.command('trackerstatus', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId || (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(userId))) {
      await ctx.reply('⛔ Admin only command');
      return;
    }

    try {
      const { signalCache } = await import('../services/signal-cache.js');
      const stats = signalCache.getStats();
      const count = signalCache.getCount();

      const message = `
📊 *Signal Cache Status*
━━━━━━━━━━━━━━━━━━━━

📝 Total Signals: ${count.total}
⚡ Active: ${count.active}
✅ Wins: ${stats.wins}
❌ Losses: ${stats.losses}
⏰ Expired: ${stats.expired}
📈 Win Rate: ${stats.winRate}%
💰 Total Pips: ${stats.totalPips}
`.trim();

      await ctx.replyWithMarkdown(message);
    } catch (error) {
      console.error('Tracker status error:', error);
      await ctx.reply(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Get user ID (for admin setup)
  bot.command('myid', async (ctx) => {
    await ctx.reply(`Your user ID: \`${ctx.from?.id}\``, { parse_mode: 'Markdown' });
  });

  // Error handler
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
  });

  return bot;
}

/**
 * Start bot polling
 */
export async function startBot(): Promise<void> {
  try {
    // First validate the token by calling getMe
    console.log('   Validating bot token...');
    const botInfo = await bot.telegram.getMe();
    console.log(`   ✅ Bot validated: @${botInfo.username}`);

    // Delete any existing webhook first
    console.log('   Deleting existing webhook...');
    await bot.telegram.deleteWebhook({ drop_pending_updates: true });

    // Start polling using polling mode (not launch which does extra setup)
    console.log('   Starting long polling...');
    bot.launch().then(() => {
      // This runs in background
    }).catch(err => {
      console.error('   Polling error:', err);
    });

    // Give it a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('🤖 Telegram bot started successfully');

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error: unknown) {
    const err = error as Error & { response?: { description?: string } };
    console.error('❌ Failed to start bot');

    if (err.message?.includes('401')) {
      console.error('   Invalid bot token - get a new token from @BotFather');
    } else if (err.message?.includes('ENOTFOUND') || err.message?.includes('ETIMEDOUT')) {
      console.error('   Network error - check your internet connection');
    } else if (err.response?.description) {
      console.error(`   Telegram API: ${err.response.description}`);
    } else {
      console.error(`   Error: ${err.message}`);
    }

    throw error;
  }
}

/**
 * Stop bot
 */
export async function stopBot(): Promise<void> {
  bot.stop();
}

export { bot };
