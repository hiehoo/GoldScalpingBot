import { config } from '../config.js';
import type { Candle, MarketData } from '../types/index.js';

const { twelveData } = config;

// Rate limiter: 8 calls per minute for free tier
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const apiCallTimestamps: number[] = [];

// Cache to reduce API calls
const priceCache: Map<string, { price: number; timestamp: number }> = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache

/**
 * Check if we can make an API call without exceeding rate limit
 */
function canMakeApiCall(): boolean {
  const now = Date.now();
  // Remove timestamps older than rate window
  while (apiCallTimestamps.length > 0 && apiCallTimestamps[0] < now - RATE_WINDOW_MS) {
    apiCallTimestamps.shift();
  }
  return apiCallTimestamps.length < RATE_LIMIT;
}

/**
 * Wait until we can make an API call
 */
async function waitForRateLimit(): Promise<void> {
  while (!canMakeApiCall()) {
    const oldestCall = apiCallTimestamps[0];
    const waitTime = oldestCall + RATE_WINDOW_MS - Date.now() + 100; // +100ms buffer
    console.log(`⏳ Rate limit: waiting ${Math.ceil(waitTime / 1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

/**
 * Record an API call for rate limiting
 */
function recordApiCall(): void {
  apiCallTimestamps.push(Date.now());
}

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

  // Wait for rate limit before making API call
  await waitForRateLimit();

  const url = new URL(`${twelveData.baseUrl}/time_series`);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', outputSize.toString());
  url.searchParams.set('apikey', twelveData.apiKey);

  try {
    recordApiCall();
    console.log(`📡 API call: time_series ${symbol} (${apiCallTimestamps.length}/${RATE_LIMIT} in last min)`);
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
 * Get current price for a symbol (with caching)
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  if (!twelveData.apiKey) {
    console.warn(`⚠️ No API key - using mock price for ${symbol}`);
    return getMockPrice(symbol);
  }

  // Check cache first
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`💾 Using cached price for ${symbol}: ${cached.price.toFixed(2)}`);
    return cached.price;
  }

  // Wait for rate limit before making API call
  await waitForRateLimit();

  const url = new URL(`${twelveData.baseUrl}/price`);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('apikey', twelveData.apiKey);

  try {
    recordApiCall();
    console.log(`📡 API call: price ${symbol} (${apiCallTimestamps.length}/${RATE_LIMIT} in last min)`);
    const response = await fetch(url.toString());
    const data = await response.json() as { price?: string; status?: string; message?: string };

    // Check for API error response
    if (data.status === 'error' || !data.price) {
      console.error(`Twelve Data price error for ${symbol}:`, data.message || 'No price data');
      return getMockPrice(symbol);
    }

    const price = parseFloat(data.price);
    if (isNaN(price)) {
      console.error(`Invalid price for ${symbol}: ${data.price}`);
      return getMockPrice(symbol);
    }

    // Cache the price
    priceCache.set(symbol, { price, timestamp: Date.now() });
    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return getMockPrice(symbol);
  }
}

/**
 * Get full market data for a symbol (sequential to respect rate limits)
 */
export async function getMarketData(symbol: string): Promise<MarketData> {
  // Run sequentially to better manage rate limits
  const candles = await fetchCandles(symbol);
  const currentPrice = await getCurrentPrice(symbol);

  return {
    symbol,
    candles,
    currentPrice,
    timestamp: Date.now(),
  };
}

/**
 * Get API usage stats
 */
export function getApiUsageStats(): { callsInLastMinute: number; limit: number } {
  const now = Date.now();
  const recentCalls = apiCallTimestamps.filter(t => t > now - RATE_WINDOW_MS);
  return {
    callsInLastMinute: recentCalls.length,
    limit: RATE_LIMIT,
  };
}

// Mock data for testing without API key
function getMockPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'XAU/USD': 2650.50,
    'NDX': 21500.00,
    'QQQ': 520.00,
    'NAS100': 21500.00,
    'IXIC': 19800.00,
  };
  const base = basePrices[symbol] || 100;
  // Add some randomness
  const price = base + (Math.random() - 0.5) * base * 0.001;
  console.log(`📊 Mock price for ${symbol}: ${price.toFixed(2)}`);
  return price;
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
  getApiUsageStats,
};
