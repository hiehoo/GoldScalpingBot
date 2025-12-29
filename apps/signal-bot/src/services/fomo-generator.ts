import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';
import type { FomoPost, SignalDirection } from '../types/index.js';
import { config } from '../config.js';

// MT5 Mobile dark theme colors
const MT5_COLORS = {
  background: '#1C1C1E',
  cardBg: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  profit: '#34C759',
  loss: '#FF3B30',
  gold: '#FFD700',
  border: '#3A3A3C',
};

interface FomoConfig {
  width: number;
  height: number;
}

const DEFAULT_CONFIG: FomoConfig = {
  width: 400,
  height: 520,
};

/**
 * Generate random ZAR profit amount (R500 - R8500)
 */
function generateRandomProfit(): number {
  const min = 500;
  const max = 8500;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate random pips (15 - 150)
 */
function generateRandomPips(): number {
  const min = 15;
  const max = 150;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate random trade duration
 */
function generateRandomDuration(): string {
  const hours = Math.floor(Math.random() * 6);
  const minutes = Math.floor(Math.random() * 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Generate FOMO post data
 */
export function generateFomoData(): FomoPost {
  const symbols = ['XAU/USD', 'NAS100'];
  const directions: SignalDirection[] = ['BUY', 'SELL'];

  return {
    id: `fomo-${Date.now()}`,
    profit: generateRandomProfit(),
    pips: generateRandomPips(),
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    direction: directions[Math.floor(Math.random() * directions.length)],
    duration: generateRandomDuration(),
    timestamp: new Date(),
  };
}

/**
 * Render MT5-style profit screenshot
 */
export async function renderFomoScreenshot(post: FomoPost): Promise<Buffer> {
  const cfg = DEFAULT_CONFIG;
  const canvas = createCanvas(cfg.width, cfg.height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = MT5_COLORS.background;
  ctx.fillRect(0, 0, cfg.width, cfg.height);

  // Status bar (fake)
  drawStatusBar(ctx, cfg);

  // MT5 header
  drawMT5Header(ctx, cfg);

  // Trade card
  drawTradeCard(ctx, cfg, post);

  // Account summary
  drawAccountSummary(ctx, cfg, post);

  // Branding watermark
  drawWatermark(ctx, cfg);

  return canvas.toBuffer('image/png');
}

function drawStatusBar(ctx: SKRSContext2D, cfg: FomoConfig) {
  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';

  // Time
  const time = new Date().toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Johannesburg',
  });
  ctx.textAlign = 'left';
  ctx.fillText(time, 15, 20);

  // Network + Battery icons (simplified)
  ctx.textAlign = 'right';
  ctx.fillText('📶 🔋 92%', cfg.width - 15, 20);
}

function drawMT5Header(ctx: SKRSContext2D, cfg: FomoConfig) {
  // Header background
  ctx.fillStyle = MT5_COLORS.cardBg;
  ctx.fillRect(0, 35, cfg.width, 50);

  // MT5 logo area
  ctx.fillStyle = '#FF6B00'; // MetaTrader orange
  ctx.font = 'bold 16px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MetaTrader 5', 15, 65);

  // Account label
  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '12px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Real Account', cfg.width - 15, 65);
}

function drawTradeCard(ctx: SKRSContext2D, cfg: FomoConfig, post: FomoPost) {
  const cardY = 100;
  const cardHeight = 200;

  // Card background
  ctx.fillStyle = MT5_COLORS.cardBg;
  roundRect(ctx, 15, cardY, cfg.width - 30, cardHeight, 12);
  ctx.fill();

  // Symbol and direction
  const symbolEmoji = post.symbol === 'XAU/USD' ? '🥇' : '📊';
  const directionColor = post.direction === 'BUY' ? MT5_COLORS.profit : MT5_COLORS.loss;

  ctx.fillStyle = MT5_COLORS.text;
  ctx.font = 'bold 20px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${symbolEmoji} ${post.symbol}`, 30, cardY + 35);

  // Direction badge
  ctx.fillStyle = directionColor;
  ctx.font = 'bold 14px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(post.direction, cfg.width - 30, cardY + 35);

  // Separator line
  ctx.strokeStyle = MT5_COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, cardY + 55);
  ctx.lineTo(cfg.width - 30, cardY + 55);
  ctx.stroke();

  // Profit amount (big)
  ctx.fillStyle = MT5_COLORS.profit;
  ctx.font = 'bold 42px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`+R${post.profit.toLocaleString()}`, cfg.width / 2, cardY + 110);

  // Pips
  ctx.fillStyle = MT5_COLORS.profit;
  ctx.font = '18px -apple-system, sans-serif';
  ctx.fillText(`+${post.pips} pips`, cfg.width / 2, cardY + 140);

  // Trade info row
  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '13px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Duration:', 30, cardY + 175);
  ctx.fillStyle = MT5_COLORS.text;
  ctx.fillText(post.duration, 100, cardY + 175);

  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.textAlign = 'right';
  ctx.fillText('Closed', cfg.width - 30, cardY + 175);
}

function drawAccountSummary(ctx: SKRSContext2D, cfg: FomoConfig, post: FomoPost) {
  const summaryY = 320;

  // Summary card
  ctx.fillStyle = MT5_COLORS.cardBg;
  roundRect(ctx, 15, summaryY, cfg.width - 30, 130, 12);
  ctx.fill();

  // Today's profit
  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '13px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText("Today's Profit", 30, summaryY + 30);

  const todayProfit = post.profit + Math.floor(Math.random() * 3000);
  ctx.fillStyle = MT5_COLORS.profit;
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.fillText(`+R${todayProfit.toLocaleString()}`, 30, summaryY + 60);

  // Win rate
  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '13px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Win Rate', cfg.width - 30, summaryY + 30);

  const winRate = 75 + Math.floor(Math.random() * 15);
  ctx.fillStyle = MT5_COLORS.profit;
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.fillText(`${winRate}%`, cfg.width - 30, summaryY + 60);

  // Separator
  ctx.strokeStyle = MT5_COLORS.border;
  ctx.beginPath();
  ctx.moveTo(30, summaryY + 80);
  ctx.lineTo(cfg.width - 30, summaryY + 80);
  ctx.stroke();

  // This week stats
  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '12px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('This Week:', 30, summaryY + 105);

  const weekProfit = todayProfit * (3 + Math.floor(Math.random() * 4));
  ctx.fillStyle = MT5_COLORS.profit;
  ctx.font = 'bold 14px -apple-system, sans-serif';
  ctx.fillText(`+R${weekProfit.toLocaleString()}`, 110, summaryY + 105);

  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '12px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  const trades = 8 + Math.floor(Math.random() * 12);
  ctx.fillText(`${trades} trades`, cfg.width - 30, summaryY + 105);
}

function drawWatermark(ctx: SKRSContext2D, cfg: FomoConfig) {
  ctx.fillStyle = MT5_COLORS.gold;
  ctx.font = 'bold 14px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🇿🇦 Mzansi FX VIP', cfg.width / 2, cfg.height - 25);

  ctx.fillStyle = MT5_COLORS.textSecondary;
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText('Join @MzansiFxVIP for FREE signals', cfg.width / 2, cfg.height - 8);
}

function roundRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Format FOMO post caption for Telegram
 */
export function formatFomoCaption(post: FomoPost): string {
  const symbolEmoji = post.symbol === 'XAU/USD' ? '🥇' : '📊';
  const directionEmoji = post.direction === 'BUY' ? '🟢' : '🔴';

  return `
💰 *ANOTHER WIN!* 💰

${directionEmoji} ${post.direction} ${symbolEmoji} ${post.symbol}
━━━━━━━━━━━━━━━━━━━━

✅ *+R${post.profit.toLocaleString()}* profit
📈 *+${post.pips} pips* in ${post.duration}

━━━━━━━━━━━━━━━━━━━━

🔥 *Join us and stop missing out!*
👉 Click the link in bio

🇿🇦 *Mzansi FX VIP* - We eat, you eat!
`.trim();
}

export const fomoGenerator = {
  generateFomoData,
  renderFomoScreenshot,
  formatFomoCaption,
};
