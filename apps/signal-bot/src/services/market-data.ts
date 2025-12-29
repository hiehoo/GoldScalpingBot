import { config } from '../config.js';
import type { Candle, MarketData } from '../types/index.js';

const { twelveData } = config;

interface TwelveDataCandle {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

interface TwelveDataResponse {
  values?: TwelveDataCandle[];
  status?: string;
  message?: string;
}

/**
 * Fetch candle data from Twelve Data API
 */
export async function fetchCandles(
  symbol: string,
  interval: string = '1h',
  outputSize: number = 100
): Promise<Candle[]> {
  if (!twelveData.apiKey) {
    console.warn('⚠️ Twelve Data API key not set - using mock data');
    return generateMockCandles(symbol, outputSize);
  }

  const url = new URL(`${twelveData.baseUrl}/time_series`);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', outputSize.toString());
  url.searchParams.set('apikey', twelveData.apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json() as TwelveDataResponse;

    if (data.status === 'error') {
      console.error('Twelve Data API error:', data.message);
      return generateMockCandles(symbol, outputSize);
    }

    if (!data.values || data.values.length === 0) {
      console.warn('No candle data received');
      return generateMockCandles(symbol, outputSize);
    }

    return data.values.map((candle) => ({
      timestamp: new Date(candle.datetime).getTime(),
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: candle.volume ? parseFloat(candle.volume) : undefined,
    })).reverse(); // Oldest first
  } catch (error) {
    console.error('Failed to fetch candles:', error);
    return generateMockCandles(symbol, outputSize);
  }
}

/**
 * Get current price for a symbol
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  if (!twelveData.apiKey) {
    return getMockPrice(symbol);
  }

  const url = new URL(`${twelveData.baseUrl}/price`);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('apikey', twelveData.apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json() as { price: string };
    return parseFloat(data.price);
  } catch (error) {
    console.error('Failed to fetch price:', error);
    return getMockPrice(symbol);
  }
}

/**
 * Get full market data for a symbol
 */
export async function getMarketData(symbol: string): Promise<MarketData> {
  const [candles, currentPrice] = await Promise.all([
    fetchCandles(symbol),
    getCurrentPrice(symbol),
  ]);

  return {
    symbol,
    candles,
    currentPrice,
    timestamp: Date.now(),
  };
}

// Mock data for testing without API key
function getMockPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'XAU/USD': 2650.50,
    'NDX': 21500.00,
  };
  const base = basePrices[symbol] || 100;
  // Add some randomness
  return base + (Math.random() - 0.5) * base * 0.001;
}

function generateMockCandles(symbol: string, count: number): Candle[] {
  const candles: Candle[] = [];
  let price = getMockPrice(symbol);
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  for (let i = count - 1; i >= 0; i--) {
    const change = (Math.random() - 0.5) * price * 0.002;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * Math.abs(change);
    const low = Math.min(open, close) - Math.random() * Math.abs(change);

    candles.push({
      timestamp: now - i * hourMs,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000),
    });

    price = close;
  }

  return candles;
}

export const marketData = {
  fetchCandles,
  getCurrentPrice,
  getMarketData,
};
