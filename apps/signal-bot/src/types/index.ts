// Market data types
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketData {
  symbol: string;
  candles: Candle[];
  currentPrice: number;
  timestamp: number;
}

// Signal types
export type SignalDirection = 'BUY' | 'SELL';
export type SignalStatus = 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'EXPIRED' | 'MANUAL_CLOSE';

export interface TradingSignal {
  id: string;
  symbol: string;
  direction: SignalDirection;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number;
  status: SignalStatus;
  createdAt: Date;
  closedAt?: Date;
  closePrice?: number;
  pipsGained?: number;
  confidence: number; // 0-100
  indicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    ema: { fast: number; slow: number };
  };
}

// FOMO post types
export interface FomoPost {
  id: string;
  profit: number; // In ZAR
  pips: number;
  symbol: string;
  direction: SignalDirection;
  duration: string; // e.g., "2h 15m"
  timestamp: Date;
}

// Indicator types
export interface RSIResult {
  value: number;
  overbought: boolean;
  oversold: boolean;
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  bullish: boolean;
}

export interface EMAResult {
  fast: number;
  slow: number;
  crossover: 'BULLISH' | 'BEARISH' | 'NONE';
}
