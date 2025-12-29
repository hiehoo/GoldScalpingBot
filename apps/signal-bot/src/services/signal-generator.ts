import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import type { Candle, TradingSignal, SignalDirection } from '../types/index.js';
import { analyzeIndicators } from './indicators.js';
import { getMarketData } from './market-data.js';

const { signals: signalConfig, symbols } = config;

interface SignalAnalysis {
  direction: SignalDirection | null;
  confidence: number;
  reasons: string[];
}

/**
 * Analyze market conditions and determine signal direction
 */
function analyzeMarket(candles: Candle[]): SignalAnalysis {
  const indicators = analyzeIndicators(candles);
  const reasons: string[] = [];
  let bullishScore = 0;
  let bearishScore = 0;

  // RSI Analysis (weight: 30%)
  if (indicators.rsi.oversold) {
    bullishScore += 30;
    reasons.push('RSI oversold (<30)');
  } else if (indicators.rsi.overbought) {
    bearishScore += 30;
    reasons.push('RSI overbought (>70)');
  } else if (indicators.rsi.value < 45) {
    bullishScore += 15;
    reasons.push('RSI showing bullish momentum');
  } else if (indicators.rsi.value > 55) {
    bearishScore += 15;
    reasons.push('RSI showing bearish momentum');
  }

  // MACD Analysis (weight: 35%)
  if (indicators.macd.bullish && indicators.macd.histogram > 0) {
    bullishScore += 35;
    reasons.push('MACD bullish crossover');
  } else if (!indicators.macd.bullish && indicators.macd.histogram < 0) {
    bearishScore += 35;
    reasons.push('MACD bearish crossover');
  }

  // EMA Crossover Analysis (weight: 35%)
  if (indicators.ema.crossover === 'BULLISH') {
    bullishScore += 35;
    reasons.push('EMA bullish crossover (9 > 21)');
  } else if (indicators.ema.crossover === 'BEARISH') {
    bearishScore += 35;
    reasons.push('EMA bearish crossover (9 < 21)');
  } else if (indicators.ema.fast > indicators.ema.slow) {
    bullishScore += 15;
    reasons.push('Price above EMA');
  } else {
    bearishScore += 15;
    reasons.push('Price below EMA');
  }

  // Determine direction based on score difference
  const scoreDiff = Math.abs(bullishScore - bearishScore);
  const confidence = Math.min(Math.max(scoreDiff, 0), 100);

  // Need at least 50% confidence to generate signal
  if (confidence < 50) {
    return { direction: null, confidence, reasons };
  }

  const direction: SignalDirection = bullishScore > bearishScore ? 'BUY' : 'SELL';
  return { direction, confidence, reasons };
}

/**
 * Calculate stop loss and take profit levels
 */
function calculateLevels(
  entryPrice: number,
  direction: SignalDirection,
  symbol: string
): { stopLoss: number; takeProfit1: number; takeProfit2: number; takeProfit3: number } {
  const isGold = symbol === symbols.gold || symbol === 'XAU/USD';
  const stopLossPips = isGold
    ? signalConfig.defaultStopLossPips.gold
    : signalConfig.defaultStopLossPips.nas100;

  // Convert pips to price movement
  const pipValue = isGold ? 0.01 : 1; // $0.01 for gold, 1 point for NAS100
  const stopLossDistance = stopLossPips * pipValue;
  const takeProfitDistance = stopLossDistance * signalConfig.riskRewardRatio;

  if (direction === 'BUY') {
    return {
      stopLoss: Math.round((entryPrice - stopLossDistance) * 100) / 100,
      takeProfit1: Math.round((entryPrice + takeProfitDistance * 0.5) * 100) / 100,
      takeProfit2: Math.round((entryPrice + takeProfitDistance) * 100) / 100,
      takeProfit3: Math.round((entryPrice + takeProfitDistance * 1.5) * 100) / 100,
    };
  } else {
    return {
      stopLoss: Math.round((entryPrice + stopLossDistance) * 100) / 100,
      takeProfit1: Math.round((entryPrice - takeProfitDistance * 0.5) * 100) / 100,
      takeProfit2: Math.round((entryPrice - takeProfitDistance) * 100) / 100,
      takeProfit3: Math.round((entryPrice - takeProfitDistance * 1.5) * 100) / 100,
    };
  }
}

/**
 * Generate a trading signal for a symbol
 */
export async function generateSignal(symbol: string): Promise<TradingSignal | null> {
  try {
    const marketData = await getMarketData(symbol);
    const analysis = analyzeMarket(marketData.candles);

    if (!analysis.direction) {
      console.log(`No clear signal for ${symbol} (confidence: ${analysis.confidence}%)`);
      return null;
    }

    const indicators = analyzeIndicators(marketData.candles);
    const levels = calculateLevels(marketData.currentPrice, analysis.direction, symbol);

    const signal: TradingSignal = {
      id: uuidv4(),
      symbol,
      direction: analysis.direction,
      entryPrice: marketData.currentPrice,
      stopLoss: levels.stopLoss,
      takeProfit1: levels.takeProfit1,
      takeProfit2: levels.takeProfit2,
      takeProfit3: levels.takeProfit3,
      status: 'ACTIVE',
      createdAt: new Date(),
      confidence: analysis.confidence,
      indicators: {
        rsi: indicators.rsi.value,
        macd: {
          value: indicators.macd.macd,
          signal: indicators.macd.signal,
          histogram: indicators.macd.histogram,
        },
        ema: {
          fast: indicators.ema.fast,
          slow: indicators.ema.slow,
        },
      },
    };

    console.log(`✅ Signal generated: ${symbol} ${analysis.direction} @ ${marketData.currentPrice}`);
    console.log(`   Reasons: ${analysis.reasons.join(', ')}`);

    return signal;
  } catch (error) {
    console.error(`Failed to generate signal for ${symbol}:`, error);
    return null;
  }
}

/**
 * Generate signals for all configured symbols
 */
export async function generateAllSignals(): Promise<TradingSignal[]> {
  const signals: TradingSignal[] = [];

  for (const symbol of Object.values(symbols)) {
    const signal = await generateSignal(symbol);
    if (signal) {
      signals.push(signal);
    }
  }

  return signals;
}

/**
 * Format signal for Telegram message
 */
export function formatSignalMessage(signal: TradingSignal): string {
  const emoji = signal.direction === 'BUY' ? '🟢' : '🔴';
  const directionText = signal.direction === 'BUY' ? 'BUY' : 'SELL';
  // Display clean symbol names (NAS100_MOCK -> NAS100)
  const isGold = signal.symbol === 'XAU/USD';
  const symbolDisplay = isGold ? '🥇 GOLD (XAUUSD)' : '📊 NAS100';

  return `
${emoji} *${directionText} SIGNAL* ${emoji}
━━━━━━━━━━━━━━━━━━━━

${symbolDisplay}

📍 *Entry:* ${signal.entryPrice.toFixed(2)}
🛑 *Stop Loss:* ${signal.stopLoss.toFixed(2)}

🎯 *Take Profit 1:* ${signal.takeProfit1.toFixed(2)}
${signal.takeProfit2 ? `🎯 *Take Profit 2:* ${signal.takeProfit2.toFixed(2)}` : ''}
${signal.takeProfit3 ? `🎯 *Take Profit 3:* ${signal.takeProfit3.toFixed(2)}` : ''}

📊 *Confidence:* ${signal.confidence}%
⏰ *Time:* ${new Date().toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST

━━━━━━━━━━━━━━━━━━━━
🇿🇦 *Mzansi FX VIP* | Risk 1-2% per trade
`.trim();
}

export const signalGenerator = {
  generateSignal,
  generateAllSignals,
  formatSignalMessage,
  analyzeMarket,
};
