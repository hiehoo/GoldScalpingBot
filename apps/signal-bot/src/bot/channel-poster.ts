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
    `
💼 *Ready to trade these signals?*

Open a PU Prime account today:
✅ FSCA regulated (safe for SA traders)
✅ Deposit from R1,500
✅ Local bank deposits (Capitec, FNB, ABSA)
✅ Fast ZAR withdrawals

👉 ${config.affiliateLink}

🇿🇦 *Mzansi FX VIP*
`.trim(),
    `
🔥 *Stop watching from the sidelines!*

Our traders are banking profits daily. You could be next.

Get started with PU Prime:
• Minimum R1,500 deposit
• ZAR account available
• FSCA regulated broker

👉 ${config.affiliateLink}

We eat, you eat! 🍽️
`.trim(),
    `
📈 *Trading tip of the day:*

The best traders don't just watch signals... they ACT on them.

Ready to start? PU Prime makes it easy:
🏦 Deposit via EFT or card
💰 Trade from R1,500
🛡️ FSCA regulated

👉 ${config.affiliateLink}

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
