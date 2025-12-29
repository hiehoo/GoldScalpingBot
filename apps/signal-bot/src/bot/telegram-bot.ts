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

Hey ${ctx.from?.first_name || 'Trader'}! 👋

You've just joined South Africa's fastest-growing forex signals community.

📊 *What you'll get:*
• FREE Gold (XAUUSD) signals
• FREE NAS100 signals
• Entry, SL & TP levels
• Real-time trade tracking
• Weekly performance recaps

💡 *Quick tip:* Enable notifications so you never miss a signal!

━━━━━━━━━━━━━━━━━━━━

🔗 *Ready to trade?*
Open a PU Prime account (FSCA regulated):
${config.affiliateLink}

💰 Minimum deposit: Just R1,500
🏦 ZAR deposits via local banks

━━━━━━━━━━━━━━━━━━━━
We eat, you eat! 🍽️
`.trim();

    await ctx.replyWithMarkdown(welcomeMessage);
  });

  // Help command
  bot.help(async (ctx) => {
    const helpMessage = `
📚 *Mzansi FX VIP Commands*

/start - Welcome message
/help - Show this help
/status - Check bot status
/signals - View recent signals

━━━━━━━━━━━━━━━━━━━━

📢 *Channel:* @MzansiFxVIP
🔗 *Broker:* ${config.affiliateLink}

Questions? Message @MzansiFxVIP
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

  // Admin command: Post FOMO now
  bot.command('postfomo', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId || (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(userId))) {
      await ctx.reply('⛔ Admin only command');
      return;
    }

    await ctx.reply('🔥 Generating and posting FOMO screenshot...');
    try {
      const { runFomoNow } = await import('../schedulers/index.js');
      await runFomoNow();
      await ctx.reply('✅ FOMO post sent to channel!');
    } catch (error) {
      console.error('Post FOMO error:', error);
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
