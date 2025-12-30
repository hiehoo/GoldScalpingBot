import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';
import type { FomoPost, SignalDirection } from '../types/index.js';

// MT5 Mobile exact colors from screenshot
const COLORS = {
  background: '#000000',     // Pure black
  text: '#FFFFFF',           // White
  textSecondary: '#8E8E93',  // Gray
  sell: '#FF4444',           // Red for sell
  buy: '#4A90D9',            // Blue for buy
  profit: '#4CAF50',         // Green for profit
  loss: '#FF4444',           // Red for loss
  tabBg: '#2C2C2E',          // Tab background
  tabSelected: '#3A3A3C',    // Selected tab
  separator: '#333333',      // Line separator
  navIcon: '#8E8E93',        // Navigation icons
  navSelected: '#4A90D9',    // Selected nav (History)
};

// Canvas dimensions (mobile-like aspect ratio)
const WIDTH = 390;
const HEIGHT = 844;

interface TradeRow {
  symbol: string;
  direction: 'buy' | 'sell';
  lotSize: number;
  openPrice: number;
  closePrice: number;
  date: string;
  time: string;
  pnl: number;
}

interface AccountSummary {
  deposit: number;
  withdrawal: number;
  profit: number;
  swap: number;
  commission: number;
  balance: number;
}

/**
 * Generate random trade history for FOMO
 */
function generateTradeHistory(): TradeRow[] {
  const trades: TradeRow[] = [];
  const basePrice = 2620 + Math.random() * 60; // Gold around 2620-2680

  // Generate 10-12 trades
  const numTrades = 10 + Math.floor(Math.random() * 3);
  const now = new Date();

  for (let i = 0; i < numTrades; i++) {
    const direction = Math.random() > 0.5 ? 'buy' : 'sell';
    const lotSize = [0.1, 0.2, 0.3, 0.5, 0.7, 1.0][Math.floor(Math.random() * 6)];
    const priceMove = (Math.random() - 0.3) * 15; // Slight bias towards profit
    const openPrice = basePrice + (Math.random() - 0.5) * 30;
    const closePrice = direction === 'buy'
      ? openPrice + priceMove
      : openPrice - priceMove;

    // Calculate PnL (simplified: $100 per pip per lot for gold)
    const pips = Math.abs(closePrice - openPrice);
    const isWin = (direction === 'buy' && closePrice > openPrice) ||
                  (direction === 'sell' && closePrice < openPrice);
    const pnl = isWin
      ? pips * lotSize * 100
      : -pips * lotSize * 100;

    // Generate date (last few days)
    const tradeDate = new Date(now);
    tradeDate.setDate(tradeDate.getDate() - Math.floor(i / 3));
    tradeDate.setHours(Math.floor(Math.random() * 24));
    tradeDate.setMinutes(Math.floor(Math.random() * 60));

    trades.push({
      symbol: 'XAUUSD',
      direction,
      lotSize,
      openPrice: Math.round(openPrice * 100) / 100,
      closePrice: Math.round(closePrice * 100) / 100,
      date: tradeDate.toISOString().slice(0, 10).replace(/-/g, '.'),
      time: tradeDate.toTimeString().slice(0, 8),
      pnl: Math.round(pnl * 100) / 100,
    });
  }

  return trades;
}

/**
 * Generate account summary based on trades
 */
function generateAccountSummary(trades: TradeRow[]): AccountSummary {
  const totalProfit = trades.reduce((sum, t) => sum + t.pnl, 0);
  const deposit = 5000 + Math.floor(Math.random() * 3000);
  const withdrawal = Math.floor(Math.random() * 500);
  const swap = Math.round((Math.random() * 50) * 100) / 100;

  return {
    deposit,
    withdrawal: -withdrawal,
    profit: Math.round(totalProfit * 100) / 100,
    swap,
    commission: 0,
    balance: Math.round((deposit - withdrawal + totalProfit + swap) * 100) / 100,
  };
}

/**
 * Format number with space as thousand separator (like MT5)
 */
function formatNumber(num: number, decimals = 2): string {
  const fixed = Math.abs(num).toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const result = parts.join('.');
  return num < 0 ? `-${result}` : result;
}

/**
 * Draw status bar (time, signal, battery)
 */
function drawStatusBar(ctx: SKRSContext2D) {
  ctx.fillStyle = COLORS.text;
  ctx.font = '600 17px Roboto, sans-serif';
  ctx.textAlign = 'left';

  // Time
  const time = new Date().toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Johannesburg',
  });
  ctx.fillText(time, 28, 52);

  // Right side icons (simplified)
  ctx.textAlign = 'right';
  ctx.font = '15px Roboto, sans-serif';
  ctx.fillStyle = COLORS.text;
  ctx.fillText('5G', WIDTH - 70, 52);

  // Signal bars (simplified)
  ctx.fillStyle = COLORS.text;
  for (let i = 0; i < 4; i++) {
    const barHeight = 6 + i * 3;
    ctx.fillRect(WIDTH - 55 + i * 5, 52 - barHeight, 3, barHeight);
  }

  // Battery outline
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 1;
  ctx.strokeRect(WIDTH - 32, 40, 22, 11);
  ctx.fillRect(WIDTH - 10, 43, 2, 5);
  // Battery fill
  ctx.fillStyle = COLORS.text;
  ctx.fillRect(WIDTH - 30, 42, 16, 7);
}

/**
 * Draw tab navigation (Positions | Orders | Deals)
 */
function drawTabNavigation(ctx: SKRSContext2D) {
  const tabY = 75;
  const tabHeight = 36;

  // Tab background
  ctx.fillStyle = COLORS.tabBg;
  ctx.beginPath();
  ctx.roundRect(80, tabY, 230, tabHeight, 8);
  ctx.fill();

  // Tabs
  const tabs = ['Positions', 'Orders', 'Deals'];
  const tabWidth = 230 / 3;

  tabs.forEach((tab, i) => {
    const x = 80 + i * tabWidth;

    // Selected state for "Positions"
    if (i === 0) {
      ctx.fillStyle = COLORS.tabSelected;
      ctx.beginPath();
      ctx.roundRect(x + 2, tabY + 2, tabWidth - 4, tabHeight - 4, 6);
      ctx.fill();
      ctx.fillStyle = COLORS.text;
    } else {
      ctx.fillStyle = COLORS.textSecondary;
    }

    ctx.font = '14px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tab, x + tabWidth / 2, tabY + 23);
  });

  // Filter icon (left)
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = '18px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('≡', 35, tabY + 24);

  // Clock icon (right)
  ctx.beginPath();
  ctx.arc(WIDTH - 35, tabY + 18, 10, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.textSecondary;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(WIDTH - 35, tabY + 12);
  ctx.lineTo(WIDTH - 35, tabY + 18);
  ctx.lineTo(WIDTH - 30, tabY + 18);
  ctx.stroke();
}

/**
 * Draw trade row
 */
function drawTradeRow(ctx: SKRSContext2D, trade: TradeRow, y: number) {
  const leftPadding = 15;
  const rightPadding = WIDTH - 15;

  // Left red indicator line for trades
  ctx.fillStyle = COLORS.sell;
  ctx.fillRect(0, y, 3, 60);

  // Symbol + direction + lot
  ctx.font = 'bold 16px Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(trade.symbol, leftPadding, y + 22);

  ctx.fillStyle = trade.direction === 'buy' ? COLORS.buy : COLORS.sell;
  ctx.font = '16px Roboto, sans-serif';
  ctx.fillText(` ${trade.direction} ${trade.lotSize.toFixed(trade.lotSize < 1 ? 2 : 1)}`, leftPadding + 65, y + 22);

  // Price range and date
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = '14px Roboto, sans-serif';
  ctx.fillText(`${trade.openPrice.toFixed(2)} → ${trade.closePrice.toFixed(2)}`, leftPadding, y + 45);

  // Date and time
  ctx.textAlign = 'right';
  ctx.fillText(`${trade.date} ${trade.time}`, rightPadding - 80, y + 45);

  // PnL
  ctx.fillStyle = trade.pnl >= 0 ? COLORS.profit : COLORS.loss;
  ctx.font = 'bold 16px Roboto, sans-serif';
  ctx.fillText(formatNumber(trade.pnl), rightPadding, y + 22);
}

/**
 * Draw account summary section
 */
function drawAccountSummary(ctx: SKRSContext2D, summary: AccountSummary, y: number) {
  const leftPadding = 15;
  const rightPadding = WIDTH - 15;
  const lineHeight = 28;

  // Separator line
  ctx.strokeStyle = COLORS.separator;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(WIDTH, y);
  ctx.stroke();

  const items = [
    { label: 'Deposit', value: summary.deposit, color: COLORS.text },
    { label: 'Withdrawal', value: summary.withdrawal, color: COLORS.text },
    { label: 'Profit', value: summary.profit, color: COLORS.text },
    { label: 'Swap', value: summary.swap, color: COLORS.text },
    { label: 'Commission', value: summary.commission, color: COLORS.text },
    { label: 'Balance', value: summary.balance, color: COLORS.text },
  ];

  items.forEach((item, i) => {
    const itemY = y + 25 + i * lineHeight;

    ctx.fillStyle = COLORS.text;
    ctx.font = '15px Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, leftPadding, itemY);

    ctx.textAlign = 'right';
    ctx.fillText(formatNumber(item.value), rightPadding, itemY);
  });
}

/**
 * Draw bottom navigation bar
 */
function drawBottomNav(ctx: SKRSContext2D) {
  const navY = HEIGHT - 80;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, navY, WIDTH, 80);

  // Separator
  ctx.strokeStyle = COLORS.separator;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, navY);
  ctx.lineTo(WIDTH, navY);
  ctx.stroke();

  const navItems = [
    { icon: '↕', label: 'Quotes', selected: false },
    { icon: '📊', label: 'Chart', selected: false },
    { icon: '📈', label: 'Trade', selected: false },
    { icon: '🕐', label: 'History', selected: true },
    { icon: '⚙', label: 'Settings', selected: false },
  ];

  const itemWidth = WIDTH / navItems.length;

  navItems.forEach((item, i) => {
    const x = i * itemWidth + itemWidth / 2;

    ctx.fillStyle = item.selected ? COLORS.navSelected : COLORS.navIcon;

    // Icon
    ctx.font = '22px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.icon, x, navY + 30);

    // Label
    ctx.font = '10px Roboto, sans-serif';
    ctx.fillText(item.label, x, navY + 50);
  });

  // Home indicator
  ctx.fillStyle = COLORS.text;
  ctx.beginPath();
  ctx.roundRect(WIDTH / 2 - 70, HEIGHT - 8, 140, 5, 3);
  ctx.fill();
}

/**
 * Generate FOMO post data
 */
export function generateFomoData(): FomoPost {
  const directions: SignalDirection[] = ['BUY', 'SELL'];
  const trades = generateTradeHistory();
  const summary = generateAccountSummary(trades);

  // Calculate total profit from winning trades
  const profit = Math.max(
    trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0),
    500
  );

  return {
    id: `fomo-${Date.now()}`,
    profit: Math.round(profit),
    pips: Math.floor(profit / 50), // Rough conversion
    symbol: 'XAU/USD',
    direction: directions[Math.floor(Math.random() * directions.length)],
    duration: `${Math.floor(Math.random() * 4) + 1}h ${Math.floor(Math.random() * 60)}m`,
    timestamp: new Date(),
  };
}

/**
 * Render MT5-style history screenshot (matching exact design)
 */
export async function renderFomoScreenshot(_post: FomoPost): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Generate data
  const trades = generateTradeHistory();
  const summary = generateAccountSummary(trades);

  // Draw components
  drawStatusBar(ctx);
  drawTabNavigation(ctx);

  // Draw trade rows (limit to fit summary section)
  let currentY = 125;
  const maxTrades = Math.min(trades.length, 7); // Fit 7 trades + summary

  for (let i = 0; i < maxTrades; i++) {
    drawTradeRow(ctx, trades[i], currentY);
    currentY += 55;
  }

  // Draw account summary
  drawAccountSummary(ctx, summary, currentY + 5);

  // Draw bottom navigation
  drawBottomNav(ctx);

  return canvas.toBuffer('image/png');
}

/**
 * Format FOMO post caption for Telegram
 */
export function formatFomoCaption(post: FomoPost): string {
  return `
💰 *LOOK AT THESE RESULTS!* 💰

🥇 *GOLD (XAUUSD)* Trades
━━━━━━━━━━━━━━━━━━━━

✅ *+R${post.profit.toLocaleString()}* profit today!
📈 Multiple winning trades

━━━━━━━━━━━━━━━━━━━━

🔥 *Stop watching from the sidelines!*
👉 Join @MzansiFxVIP for FREE signals

🇿🇦 *Mzansi FX VIP* - We eat, you eat!
`.trim();
}

export const fomoGenerator = {
  generateFomoData,
  renderFomoScreenshot,
  formatFomoCaption,
};
