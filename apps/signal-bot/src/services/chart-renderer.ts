import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';
import type { Candle, TradingSignal } from '../types/index.js';

interface ChartConfig {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  candleWidth: number;
  candleGap: number;
}

const DEFAULT_CONFIG: ChartConfig = {
  width: 800,
  height: 500,
  padding: { top: 40, right: 80, bottom: 60, left: 20 },
  candleWidth: 8,
  candleGap: 3,
};

// Mzansi FX VIP colors
const COLORS = {
  background: '#0D0D0D',
  backgroundSecondary: '#1A1A2E',
  gridLine: '#2A2A3E',
  text: '#E0E0E0',
  textMuted: '#888888',
  bullish: '#00E396',
  bearish: '#FF4444',
  gold: '#FFD700',
  entryLine: '#00E396',
  stopLoss: '#FF4444',
  takeProfit: '#FFD700',
};

/**
 * Render candlestick chart with signal levels
 */
export async function renderSignalChart(
  candles: Candle[],
  signal: TradingSignal,
  config: Partial<ChartConfig> = {}
): Promise<Buffer> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const canvas = createCanvas(cfg.width, cfg.height);
  const ctx = canvas.getContext('2d');

  // Take last 50 candles for display
  const displayCandles = candles.slice(-50);

  // Calculate price range
  const allPrices: number[] = [
    ...displayCandles.flatMap(c => [c.high, c.low]),
    signal.entryPrice,
    signal.stopLoss,
    signal.takeProfit1,
  ];
  if (signal.takeProfit2) allPrices.push(signal.takeProfit2);
  if (signal.takeProfit3) allPrices.push(signal.takeProfit3);
  const minPrice = Math.min(...allPrices) * 0.999;
  const maxPrice = Math.max(...allPrices) * 1.001;

  // Draw background
  drawBackground(ctx, cfg);

  // Draw grid and price axis
  drawGrid(ctx, cfg, minPrice, maxPrice);

  // Draw candles
  drawCandles(ctx, cfg, displayCandles, minPrice, maxPrice);

  // Draw signal levels
  drawSignalLevels(ctx, cfg, signal, minPrice, maxPrice);

  // Draw title and branding
  drawTitle(ctx, cfg, signal);

  return canvas.toBuffer('image/png');
}

function drawBackground(ctx: SKRSContext2D, cfg: ChartConfig) {
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, cfg.height);
  gradient.addColorStop(0, COLORS.background);
  gradient.addColorStop(1, COLORS.backgroundSecondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cfg.width, cfg.height);
}

function drawGrid(
  ctx: SKRSContext2D,
  cfg: ChartConfig,
  minPrice: number,
  maxPrice: number
) {
  const chartHeight = cfg.height - cfg.padding.top - cfg.padding.bottom;
  const chartWidth = cfg.width - cfg.padding.left - cfg.padding.right;
  const priceRange = maxPrice - minPrice;

  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([5, 5]);

  // Horizontal grid lines (5 lines)
  for (let i = 0; i <= 4; i++) {
    const y = cfg.padding.top + (chartHeight * i) / 4;
    const price = maxPrice - (priceRange * i) / 4;

    ctx.beginPath();
    ctx.moveTo(cfg.padding.left, y);
    ctx.lineTo(cfg.width - cfg.padding.right, y);
    ctx.stroke();

    // Price labels
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '12px Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(price.toFixed(2), cfg.width - cfg.padding.right + 5, y + 4);
  }

  ctx.setLineDash([]);
}

function drawCandles(
  ctx: SKRSContext2D,
  cfg: ChartConfig,
  candles: Candle[],
  minPrice: number,
  maxPrice: number
) {
  const chartHeight = cfg.height - cfg.padding.top - cfg.padding.bottom;
  const chartWidth = cfg.width - cfg.padding.left - cfg.padding.right;
  const priceRange = maxPrice - minPrice;
  const candleSpace = cfg.candleWidth + cfg.candleGap;

  candles.forEach((candle, i) => {
    const x = cfg.padding.left + (i * chartWidth) / candles.length + candleSpace / 2;
    const isBullish = candle.close >= candle.open;
    const color = isBullish ? COLORS.bullish : COLORS.bearish;

    // Calculate Y positions
    const openY = cfg.padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
    const closeY = cfg.padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
    const highY = cfg.padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
    const lowY = cfg.padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;

    // Draw wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    // Draw body
    ctx.fillStyle = color;
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
    ctx.fillRect(x - cfg.candleWidth / 2, bodyTop, cfg.candleWidth, bodyHeight);
  });
}

function drawSignalLevels(
  ctx: SKRSContext2D,
  cfg: ChartConfig,
  signal: TradingSignal,
  minPrice: number,
  maxPrice: number
) {
  const chartHeight = cfg.height - cfg.padding.top - cfg.padding.bottom;
  const priceRange = maxPrice - minPrice;

  const drawLevel = (price: number, color: string, label: string) => {
    const y = cfg.padding.top + ((maxPrice - price) / priceRange) * chartHeight;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(cfg.padding.left, y);
    ctx.lineTo(cfg.width - cfg.padding.right, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${label}: ${price.toFixed(2)}`, cfg.width - cfg.padding.right - 5, y - 5);
  };

  // Draw levels
  drawLevel(signal.entryPrice, COLORS.entryLine, 'ENTRY');
  drawLevel(signal.stopLoss, COLORS.stopLoss, 'SL');
  drawLevel(signal.takeProfit1, COLORS.takeProfit, 'TP1');
  if (signal.takeProfit2) drawLevel(signal.takeProfit2, COLORS.takeProfit, 'TP2');
}

function drawTitle(ctx: SKRSContext2D, cfg: ChartConfig, signal: TradingSignal) {
  // Title
  const emoji = signal.direction === 'BUY' ? '🟢' : '🔴';
  const symbolName = signal.symbol === 'XAU/USD' ? 'GOLD' : 'NAS100';

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 18px Montserrat, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${emoji} ${signal.direction} ${symbolName}`, cfg.padding.left, 28);

  // Confidence badge
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 14px Montserrat, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${signal.confidence}% Confidence`, cfg.width - cfg.padding.right, 28);

  // Branding
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 12px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🇿🇦 Mzansi FX VIP', cfg.width / 2, cfg.height - 15);

  // Timestamp
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '10px Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }),
    cfg.width - cfg.padding.right,
    cfg.height - 15
  );
}

/**
 * Generate simple price chart without signal levels
 */
export async function renderPriceChart(
  candles: Candle[],
  symbol: string
): Promise<Buffer> {
  const cfg = DEFAULT_CONFIG;
  const canvas = createCanvas(cfg.width, cfg.height);
  const ctx = canvas.getContext('2d');

  const displayCandles = candles.slice(-50);

  const allPrices = displayCandles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices) * 0.999;
  const maxPrice = Math.max(...allPrices) * 1.001;

  drawBackground(ctx, cfg);
  drawGrid(ctx, cfg, minPrice, maxPrice);
  drawCandles(ctx, cfg, displayCandles, minPrice, maxPrice);

  // Simple title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 18px Montserrat, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(symbol, cfg.padding.left, 28);

  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 12px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🇿🇦 Mzansi FX VIP', cfg.width / 2, cfg.height - 15);

  return canvas.toBuffer('image/png');
}

export const chartRenderer = {
  renderSignalChart,
  renderPriceChart,
};
