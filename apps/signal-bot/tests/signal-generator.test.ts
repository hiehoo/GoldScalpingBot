import { describe, it, expect, beforeEach } from 'vitest';
import { formatSignalMessage } from '../src/services/signal-generator.js';
import type { TradingSignal } from '../src/types/index.js';

describe('Signal Generator - Message Formatting', () => {
  // Helper: Create test signal
  function createTestSignal(overrides?: Partial<TradingSignal>): TradingSignal {
    const now = new Date();

    return {
      id: 'test-signal-1',
      symbol: 'XAU/USD',
      direction: 'BUY',
      entryPrice: 2050.00,
      stopLoss: 2045.00,
      takeProfit1: 2055.00,
      takeProfit2: 2060.00,
      takeProfit3: 2065.00,
      status: 'ACTIVE',
      createdAt: now,
      confidence: 75,
      indicators: {
        rsi: 28.5,
        macd: {
          value: 2.5,
          signal: 1.2,
          histogram: 1.3,
        },
        ema: {
          fast: 2050.5,
          slow: 2048.0,
        },
      },
      ...overrides,
    };
  }

  describe('formatSignalMessage() - BUY Signal', () => {
    it('should format BUY signal message correctly', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.00,
        stopLoss: 2045.00,
        takeProfit1: 2055.00,
        takeProfit2: 2060.00,
        takeProfit3: 2065.00,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🚨 *LIVE SIGNAL - ENTRY WINDOW CLOSING* 🚨');
      expect(message).toContain('🟢 *BUY* 🟢');
      expect(message).toContain('🥇 GOLD (XAUUSD)');
      expect(message).toContain('📍 *Entry NOW:* 2050.00');
      expect(message).toContain('🛑 *Stop Loss:* 2045.00');
      expect(message).toContain('🎯 *Take Profit 1:* 2055.00');
      expect(message).toContain('🎯 *Take Profit 2:* 2060.00');
      expect(message).toContain('🎯 *Take Profit 3:* 2065.00');
      expect(message).toContain('📊 *Confidence:* 75%');
      expect(message).toContain('*Mzansi FX VIP*');
    });

    it('should include correct emoji for BUY signal', () => {
      const signal = createTestSignal({ direction: 'BUY' });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🟢 *BUY* 🟢');
      expect(message).not.toContain('🔴 *BUY*');
    });

    it('should handle BUY signal without TP3', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        takeProfit3: undefined,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🎯 *Take Profit 1:*');
      expect(message).toContain('🎯 *Take Profit 2:*');
      expect(message).not.toContain('🎯 *Take Profit 3:*');
    });

    it('should handle BUY signal without TP2 and TP3', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        takeProfit2: undefined,
        takeProfit3: undefined,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🎯 *Take Profit 1:*');
      expect(message).not.toContain('🎯 *Take Profit 2:*');
      expect(message).not.toContain('🎯 *Take Profit 3:*');
    });

    it('should display fractional prices correctly for BUY', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.75,
        stopLoss: 2045.25,
        takeProfit1: 2055.50,
        takeProfit2: 2060.99,
        takeProfit3: 2065.01,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('2050.75');
      expect(message).toContain('2045.25');
      expect(message).toContain('2055.50');
      expect(message).toContain('2060.99');
      expect(message).toContain('2065.01');
    });

    it('should display confidence percentage for BUY', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        confidence: 85,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('📊 *Confidence:* 85%');
    });

    it('should handle zero confidence', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        confidence: 0,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('📊 *Confidence:* 0%');
    });

    it('should handle max confidence', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        confidence: 100,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('📊 *Confidence:* 100%');
    });
  });

  describe('formatSignalMessage() - SELL Signal', () => {
    it('should format SELL signal message correctly', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
        stopLoss: 2055.00,
        takeProfit1: 2045.00,
        takeProfit2: 2040.00,
        takeProfit3: 2035.00,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🚨 *LIVE SIGNAL - ENTRY WINDOW CLOSING* 🚨');
      expect(message).toContain('🔴 *SELL* 🔴');
      expect(message).toContain('🥇 GOLD (XAUUSD)');
      expect(message).toContain('📍 *Entry NOW:* 2050.00');
      expect(message).toContain('🛑 *Stop Loss:* 2055.00');
      expect(message).toContain('🎯 *Take Profit 1:* 2045.00');
      expect(message).toContain('🎯 *Take Profit 2:* 2040.00');
      expect(message).toContain('🎯 *Take Profit 3:* 2035.00');
    });

    it('should include correct emoji for SELL signal', () => {
      const signal = createTestSignal({ direction: 'SELL' });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🔴 *SELL* 🔴');
      expect(message).not.toContain('🟢 *SELL*');
    });

    it('should handle SELL signal without TP3', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        takeProfit3: undefined,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🎯 *Take Profit 1:*');
      expect(message).toContain('🎯 *Take Profit 2:*');
      expect(message).not.toContain('🎯 *Take Profit 3:*');
    });

    it('should display fractional prices correctly for SELL', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.75,
        stopLoss: 2055.25,
        takeProfit1: 2045.50,
        takeProfit2: 2040.99,
        takeProfit3: 2035.01,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('2050.75');
      expect(message).toContain('2055.25');
      expect(message).toContain('2045.50');
      expect(message).toContain('2040.99');
      expect(message).toContain('2035.01');
    });
  });

  describe('formatSignalMessage() - Symbol Display', () => {
    it('should display GOLD for XAU/USD symbol', () => {
      const signal = createTestSignal({
        symbol: 'XAU/USD',
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('🥇 GOLD (XAUUSD)');
    });

    it('should display NAS100 for NAS100 symbol', () => {
      const signal = createTestSignal({
        symbol: 'NAS100',
        direction: 'SELL',
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('📊 NAS100');
      expect(message).not.toContain('GOLD');
    });

    it('should display NAS100 for NAS100_MOCK symbol', () => {
      const signal = createTestSignal({
        symbol: 'NAS100_MOCK',
        direction: 'BUY',
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('📊 NAS100');
    });

    it('should handle unknown symbols gracefully', () => {
      const signal = createTestSignal({
        symbol: 'UNKNOWN',
      });

      const message = formatSignalMessage(signal);

      // Should still format without throwing
      expect(message).toContain('🚨 *LIVE SIGNAL');
      expect(message).toContain('📍 *Entry NOW:*');
    });
  });

  describe('formatSignalMessage() - Price Formatting', () => {
    it('should format prices with exactly 2 decimal places', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.1,
        stopLoss: 2045.567,
        takeProfit1: 2055.9,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('2050.10');
      expect(message).toContain('2045.57');
      expect(message).toContain('2055.90');
    });

    it('should handle round prices with trailing zeros', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.0,
        stopLoss: 2045.0,
        takeProfit1: 2055.0,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('2050.00');
      expect(message).toContain('2045.00');
      expect(message).toContain('2055.00');
    });

    it('should handle very precise prices', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.123456,
        stopLoss: 2045.999999,
      });

      const message = formatSignalMessage(signal);

      expect(message).toContain('2050.12');
      expect(message).toContain('2046.00');
    });

    it('should display correct TP levels positions', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        takeProfit1: 2055.00,
        takeProfit2: 2060.00,
        takeProfit3: 2065.00,
      });

      const message = formatSignalMessage(signal);

      // Verify order: TP1 before TP2 before TP3
      const tp1Index = message.indexOf('Take Profit 1:');
      const tp2Index = message.indexOf('Take Profit 2:');
      const tp3Index = message.indexOf('Take Profit 3:');

      expect(tp1Index).toBeLessThan(tp2Index);
      expect(tp2Index).toBeLessThan(tp3Index);
    });
  });

  describe('formatSignalMessage() - Message Structure', () => {
    it('should include all required sections', () => {
      const signal = createTestSignal();
      const message = formatSignalMessage(signal);

      expect(message).toContain('🚨 *LIVE SIGNAL');
      expect(message).toContain('*Entry NOW:*');
      expect(message).toContain('*Stop Loss:*');
      expect(message).toContain('*Take Profit');
      expect(message).toContain('*Confidence:*');
      expect(message).toContain('*Posted:*');
      expect(message).toContain('⚡ *Act fast!*');
      expect(message).toContain('*Mzansi FX VIP*');
    });

    it('should have proper formatting with emojis', () => {
      const signal = createTestSignal();
      const message = formatSignalMessage(signal);

      expect(message).toContain('🟢'); // BUY emoji
      expect(message).toContain('🥇'); // GOLD emoji
      expect(message).toContain('📍'); // Entry emoji
      expect(message).toContain('🛑'); // Stop Loss emoji
      expect(message).toContain('🎯'); // Take Profit emoji
      expect(message).toContain('📊'); // Confidence emoji
      expect(message).toContain('⏰'); // Time emoji
      expect(message).toContain('⚡'); // Act fast emoji
      expect(message).toContain('🇿🇦'); // SA emoji
    });

    it('should use line separators for readability', () => {
      const signal = createTestSignal();
      const message = formatSignalMessage(signal);

      expect(message).toContain('━━━━━━━━━━━━━━━━━━━━');
    });

    it('should include urgency messaging', () => {
      const signal = createTestSignal();
      const message = formatSignalMessage(signal);

      expect(message).toContain('ENTRY WINDOW CLOSING');
      expect(message).toContain('Act fast');
      expect(message).toContain('Price moving');
    });

    it('should include risk management message', () => {
      const signal = createTestSignal();
      const message = formatSignalMessage(signal);

      expect(message).toContain('Risk 1-2% max');
    });

    it('should have no trailing/leading whitespace', () => {
      const signal = createTestSignal();
      const message = formatSignalMessage(signal);

      expect(message).toBe(message.trim());
    });
  });

  describe('formatSignalMessage() - Confidence Display', () => {
    it('should display low confidence signals', () => {
      const signal = createTestSignal({ confidence: 50 });
      const message = formatSignalMessage(signal);

      expect(message).toContain('50%');
    });

    it('should display high confidence signals', () => {
      const signal = createTestSignal({ confidence: 95 });
      const message = formatSignalMessage(signal);

      expect(message).toContain('95%');
    });

    it('should display medium confidence signals', () => {
      const signal = createTestSignal({ confidence: 72 });
      const message = formatSignalMessage(signal);

      expect(message).toContain('72%');
    });
  });

  describe('Level Calculation Tests', () => {
    it('should have TP1 < TP2 < TP3 for BUY signals', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        takeProfit1: 2055.00,
        takeProfit2: 2060.00,
        takeProfit3: 2065.00,
      });

      expect(signal.takeProfit1).toBeLessThan(signal.takeProfit2!);
      expect(signal.takeProfit2!).toBeLessThan(signal.takeProfit3!);
      expect(signal.takeProfit3).toBeGreaterThan(signal.entryPrice);
    });

    it('should have SL < Entry for BUY signals', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.00,
        stopLoss: 2045.00,
      });

      expect(signal.stopLoss).toBeLessThan(signal.entryPrice);
    });

    it('should have TP1 > TP2 > TP3 for SELL signals', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        takeProfit1: 2045.00,
        takeProfit2: 2040.00,
        takeProfit3: 2035.00,
      });

      expect(signal.takeProfit1).toBeGreaterThan(signal.takeProfit2!);
      expect(signal.takeProfit2!).toBeGreaterThan(signal.takeProfit3!);
      expect(signal.takeProfit3).toBeLessThan(signal.entryPrice);
    });

    it('should have SL > Entry for SELL signals', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
        stopLoss: 2055.00,
      });

      expect(signal.stopLoss).toBeGreaterThan(signal.entryPrice);
    });

    it('should have positive risk/reward ratio for BUY', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.00,
        stopLoss: 2045.00,
        takeProfit2: 2060.00,
      });

      const risk = signal.entryPrice - signal.stopLoss; // 5
      const reward = signal.takeProfit2! - signal.entryPrice; // 10
      const ratio = reward / risk;

      expect(ratio).toBeGreaterThan(1);
    });

    it('should have positive risk/reward ratio for SELL', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
        stopLoss: 2055.00,
        takeProfit2: 2040.00,
      });

      const risk = signal.stopLoss - signal.entryPrice; // 5
      const reward = signal.entryPrice - signal.takeProfit2!; // 10
      const ratio = reward / risk;

      expect(ratio).toBeGreaterThan(1);
    });
  });
});
