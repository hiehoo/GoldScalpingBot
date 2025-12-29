import type { Candle, RSIResult, MACDResult, EMAResult } from '../types/index.js';

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA for first value
  let sum = 0;
  for (let i = 0; i < period && i < prices.length; i++) {
    sum += prices[i];
  }
  ema.push(sum / Math.min(period, prices.length));

  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    const value = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(value);
  }

  return ema;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(candles: Candle[], period: number = 14): RSIResult {
  if (candles.length < period + 1) {
    return { value: 50, overbought: false, oversold: false };
  }

  const closes = candles.map(c => c.close);
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate average gains and losses
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Smooth with subsequent values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return {
    value: Math.round(rsi * 100) / 100,
    overbought: rsi >= 70,
    oversold: rsi <= 30,
  };
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const closes = candles.map(c => c.close);

  if (closes.length < slowPeriod) {
    return { macd: 0, signal: 0, histogram: 0, bullish: false };
  }

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // MACD line = Fast EMA - Slow EMA
  const macdLine: number[] = [];
  const offset = slowPeriod - fastPeriod;

  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i]);
  }

  // Signal line = 9-period EMA of MACD
  const signalLine = calculateEMA(macdLine, signalPeriod);

  const macd = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  const histogram = macd - signal;

  return {
    macd: Math.round(macd * 10000) / 10000,
    signal: Math.round(signal * 10000) / 10000,
    histogram: Math.round(histogram * 10000) / 10000,
    bullish: histogram > 0,
  };
}

/**
 * Calculate EMA crossover
 */
export function calculateEMACrossover(
  candles: Candle[],
  fastPeriod: number = 9,
  slowPeriod: number = 21
): EMAResult {
  const closes = candles.map(c => c.close);

  if (closes.length < slowPeriod + 2) {
    return { fast: 0, slow: 0, crossover: 'NONE' };
  }

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const offset = slowPeriod - fastPeriod;
  const currentFast = fastEMA[fastEMA.length - 1];
  const currentSlow = slowEMA[slowEMA.length - 1];
  const prevFast = fastEMA[fastEMA.length - 2];
  const prevSlow = slowEMA[slowEMA.length - 2];

  let crossover: 'BULLISH' | 'BEARISH' | 'NONE' = 'NONE';

  // Bullish crossover: fast crosses above slow
  if (prevFast <= prevSlow && currentFast > currentSlow) {
    crossover = 'BULLISH';
  }
  // Bearish crossover: fast crosses below slow
  else if (prevFast >= prevSlow && currentFast < currentSlow) {
    crossover = 'BEARISH';
  }

  return {
    fast: Math.round(currentFast * 100) / 100,
    slow: Math.round(currentSlow * 100) / 100,
    crossover,
  };
}

/**
 * Get all indicators for analysis
 */
export function analyzeIndicators(candles: Candle[]) {
  return {
    rsi: calculateRSI(candles),
    macd: calculateMACD(candles),
    ema: calculateEMACrossover(candles),
  };
}

export const indicators = {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateEMACrossover,
  analyzeIndicators,
};
