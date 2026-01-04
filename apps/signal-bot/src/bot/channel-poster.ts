import { bot } from './telegram-bot.js';
import { config } from '../config.js';
import type { TradingSignal } from '../types/index.js';

const { channelId } = config.telegram;

/**
 * Post text message to channel
 */
export async function postToChannel(
  message: string,
  options: { parse_mode?: 'Markdown' | 'HTML'; disable_notification?: boolean } = {}
): Promise<void> {
  try {
    await bot.telegram.sendMessage(channelId, message, {
      parse_mode: options.parse_mode || 'Markdown',
      disable_notification: options.disable_notification || false,
    });
    console.log('✅ Posted to channel');
  } catch (error) {
    console.error('Failed to post to channel:', error);
    throw error;
  }
}

/**
 * Post image with caption to channel
 */
export async function postImageToChannel(
  imageBuffer: Buffer,
  caption: string,
  options: { parse_mode?: 'Markdown' | 'HTML' } = {}
): Promise<void> {
  try {
    await bot.telegram.sendPhoto(
      channelId,
      { source: imageBuffer },
      {
        caption,
        parse_mode: options.parse_mode || 'Markdown',
      }
    );
    console.log('✅ Posted image to channel');
  } catch (error) {
    console.error('Failed to post image to channel:', error);
    throw error;
  }
}

/**
 * Post signal with chart image
 */
export async function postSignalWithChart(
  signal: TradingSignal,
  chartBuffer: Buffer,
  message: string
): Promise<void> {
  await postImageToChannel(chartBuffer, message, { parse_mode: 'Markdown' });
}

/**
 * Post FOMO screenshot
 */
export async function postFomoScreenshot(
  imageBuffer: Buffer,
  caption: string
): Promise<void> {
  await postImageToChannel(imageBuffer, caption, { parse_mode: 'Markdown' });
}

/**
 * Post affiliate CTA (soft sell)
 */
export async function postAffiliateCTA(): Promise<void> {
  const ctaMessages = [
    // FOMO angle
    `
⚠️ *Don't watch profits from the sidelines.*

847 members already trading our signals.
+312 pips banked this week.

You scrolling or earning?

Open MY PU Prime account:
👉 ${config.affiliateLink}

✅ Start with R1,500
✅ FSCA regulated (safe for SA)
✅ ZAR deposits (Capitec, FNB, ABSA)

*Next signal drops soon.* Will you be ready?

🇿🇦 *Mzansi FX VIP*
`.trim(),
    // Loss aversion angle
    `
💸 *Every signal you skip is money left on the table.*

Last signal: +47 pips in 2 hours.
Week-to-date: +312 pips.

How much longer will you wait?

Get started NOW:
👉 ${config.affiliateLink}

✅ R1,500 minimum deposit
✅ Fast ZAR withdrawals
✅ FSCA regulated

The next winner could be yours. Or not.

🇿🇦 We eat, you eat! 🍽️
`.trim(),
    // Social proof angle
    `
🔥 *Real traders. Real profits.*

"Banked +89 pips this week!" - Thabo, Johannesburg
"Finally profitable!" - Zanele, Cape Town
"Best signals in SA" - Sipho, Durban

Join 847+ members trading with us:
👉 ${config.affiliateLink}

✅ FSCA regulated
✅ Trade from R1,500
✅ Local ZAR deposits

Stop watching. Start winning.

🇿🇦 *Mzansi FX VIP*
`.trim(),
  ];

  const randomCTA = ctaMessages[Math.floor(Math.random() * ctaMessages.length)];
  await postToChannel(randomCTA);
}

export const channelPoster = {
  postToChannel,
  postImageToChannel,
  postSignalWithChart,
  postFomoScreenshot,
  postAffiliateCTA,
};
