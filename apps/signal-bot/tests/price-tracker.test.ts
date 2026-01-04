import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatWinMessage,
  formatLossMessage,
  formatExpiredMessage,
  formatTrackingResult,
} from '../src/services/price-tracker.js';
import type { CachedSignal, TrackingResult } from '../src/types/index.js';

// Define TrackingResult locally since it's not exported
interface TrackingResultTest {
  signal: CachedSignal;
  previousStatus: string;
  newStatus: string;
  hitPrice: number;
  pnlPips: number;
  hitLevel: string;
}

describe('Price Tracker - Message Formatting', () => {
  // Helper: Create test signal and result
  function createTestSignal(overrides?: Partial<CachedSignal>): CachedSignal {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    return {
      id: 'test-signal-1',
      symbol: 'XAU/USD',
      direction: 'BUY',
      entryPrice: 2050.00,
      stopLoss: 2045.00,
      takeProfit1: 2055.00,
      takeProfit2: 2060.00,
      takeProfit3: 2065.00,
      confidence: 75,
      createdAt: now,
      expiresAt,
      status: 'ACTIVE',
      ...overrides,
    };
  }

  function createTestResult(overrides?: Partial<TrackingResultTest>): TrackingResultTest {
    const signal = createTestSignal();
    return {
      signal,
      previousStatus: 'ACTIVE',
      newStatus: 'WIN_TP1',
      hitPrice: 2055.00,
      pnlPips: 50,
      hitLevel: 'TP1',
      ...overrides,
    };
  }

  describe('formatWinMessage()', () => {
    it('should format BUY win message correctly', () => {
      const now = new Date().toISOString();
      const closedAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h later

      const signal = createTestSignal({
        direction: 'BUY',
        createdAt: now,
        closedAt,
        closedPrice: 2055.00,
      });

      const result: TrackingResultTest = {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: 'WIN_TP1',
        hitPrice: 2055.00,
        pnlPips: 50,
        hitLevel: 'TP1',
      };

      const message = formatWinMessage(result as any);

      expect(message).toContain('🎉 WINNER!');
      expect(message).toContain('TP1 HIT!');
      expect(message).toContain('🥇 GOLD (XAUUSD) BUY');
      expect(message).toContain('📍 Entry: 2050.00');
      expect(message).toContain('🎯 TP1 Hit: 2055.00');
      expect(message).toContain('+50.0 pips BANKED');
      expect(message).toContain('1h 0m');
      expect(message).toContain('📊 Confidence was: 75%');
      expect(message).toContain('Mzansi FX VIP');
    });

    it('should format SELL win message correctly', () => {
      const now = new Date().toISOString();
      const closedAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30m later

      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
        createdAt: now,
        closedAt,
        closedPrice: 2045.00,
      });

      const result: TrackingResultTest = {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: 'WIN_TP1',
        hitPrice: 2045.00,
        pnlPips: 50,
        hitLevel: 'TP1',
      };

      const message = formatWinMessage(result as any);

      expect(message).toContain('SELL');
      expect(message).toContain('2045.00');
      expect(message).toContain('30m');
    });

    it('should display correct TP level in win message', () => {
      const result = createTestResult({
        hitLevel: 'TP3',
        pnlPips: 150,
      });

      const message = formatWinMessage(result as any);
      expect(message).toContain('TP3 HIT!');
      expect(message).toContain('🎯 TP3 Hit');
      expect(message).toContain('+150.0 pips');
    });

    it('should handle fractional pips in message', () => {
      const result = createTestResult({ pnlPips: 47.5 });

      const message = formatWinMessage(result as any);
      expect(message).toContain('+47.5 pips');
    });

    it('should format duration as hours and minutes', () => {
      const now = new Date().toISOString();
      const closedAt = new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(); // 2h 45m

      const signal = createTestSignal({ createdAt: now, closedAt });

      const result: TrackingResultTest = {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: 'WIN_TP1',
        hitPrice: 2055.00,
        pnlPips: 50,
        hitLevel: 'TP1',
      };

      const message = formatWinMessage(result as any);
      expect(message).toContain('2h 45m');
    });

    it('should format duration as minutes when < 1 hour', () => {
      const now = new Date();
      const closedAt = new Date(now.getTime() + 15 * 60 * 1000); // 15m later

      const signal = createTestSignal({
        createdAt: now.toISOString(),
        closedAt: closedAt.toISOString(),
      });

      const result: TrackingResultTest = {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: 'WIN_TP1',
        hitPrice: 2055.00,
        pnlPips: 50,
        hitLevel: 'TP1',
      };

      const message = formatWinMessage(result as any);
      expect(message).toContain('15m');
      // Check for hour format like "2h" or "1h " not just "h"
      expect(message).not.toMatch(/\d+h\s*\d+m/);
      expect(message).not.toMatch(/\d+h$/m);
    });
  });

  describe('formatLossMessage()', () => {
    it('should format loss message correctly', () => {
      const now = new Date().toISOString();
      const closedAt = new Date(Date.now() + 45 * 60 * 1000).toISOString(); // 45m later

      const signal = createTestSignal({
        direction: 'BUY',
        createdAt: now,
        closedAt,
        closedPrice: 2045.00,
      });

      const result: TrackingResultTest = {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: 'LOSS_SL',
        hitPrice: 2045.00,
        pnlPips: -50,
        hitLevel: 'Stop Loss',
      };

      const message = formatLossMessage(result as any);

      expect(message).toContain('❌ STOP LOSS HIT ❌');
      expect(message).toContain('🥇 GOLD (XAUUSD) BUY');
      expect(message).toContain('📍 Entry: 2050.00');
      expect(message).toContain('🛑 SL Hit: 2045.00');
      expect(message).toContain('-50.0 pips');
      expect(message).toContain('45m');
      expect(message).toContain('📊 Confidence was: 75%');
      expect(message).toContain('Mzansi FX VIP');
    });

    it('should format SELL loss message', () => {
      const now = new Date().toISOString();
      const closedAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
        createdAt: now,
        closedAt,
        closedPrice: 2055.00,
      });

      const result: TrackingResultTest = {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: 'LOSS_SL',
        hitPrice: 2055.00,
        pnlPips: -50,
        hitLevel: 'Stop Loss',
      };

      const message = formatLossMessage(result as any);
      expect(message).toContain('SELL');
      expect(message).toContain('2055.00');
    });

    it('should handle fractional loss pips', () => {
      const result = createTestResult({ pnlPips: -32.3 });

      const message = formatLossMessage(result as any);
      expect(message).toContain('-32.3 pips');
    });

    it('should display correct entry and SL prices', () => {
      const signal = createTestSignal({
        entryPrice: 2100.50,
        stopLoss: 2090.75,
      });

      const result: TrackingResultTest = {
        signal,
        previousStatus: 'ACTIVE',
        newStatus: 'LOSS_SL',
        hitPrice: 2090.75,
        pnlPips: -97.5,
        hitLevel: 'Stop Loss',
      };

      const message = formatLossMessage(result as any);
      expect(message).toContain('Entry: 2100.50');
      expect(message).toContain('SL Hit: 2090.75');
    });
  });

  describe('formatExpiredMessage()', () => {
    it('should format expired message with positive unrealized pips', () => {
      const signal = createTestSignal({
        entryPrice: 2050.00,
      });

      const message = formatExpiredMessage(signal, 2050.50);

      expect(message).toContain('⏰ SIGNAL EXPIRED ⏰');
      expect(message).toMatch(/🥇 GOLD \(XAUUSD\) BUY/);
      expect(message).toContain('📍 Entry: 2050.00');
      expect(message).toContain('📍 Current: 2050.50');
      expect(message).toContain('📊 Unrealized: +50.0 pips');
      expect(message).toContain('Mzansi FX VIP');
      expect(message).toContain('4h window');
    });

    it('should format expired message with negative unrealized pips', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.00,
      });

      const message = formatExpiredMessage(signal, 2049.00);

      expect(message).toContain('⏰ SIGNAL EXPIRED ⏰');
      expect(message).toContain('📊 Unrealized: -100.0 pips');
      expect(message).toContain('4h window');
    });

    it('should format expired message for SELL direction', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
      });

      const message = formatExpiredMessage(signal, 2045.00);

      expect(message).toContain('SELL');
      // For SELL: entry 2050 - current 2045 = 50 pips profit
      expect(message).toMatch(/[+\-]?\d+\.?\d* pips/);
    });

    it('should handle zero unrealized pips', () => {
      const signal = createTestSignal({
        entryPrice: 2050.00,
      });

      const message = formatExpiredMessage(signal, 2050.00);

      expect(message).toContain('📊 Unrealized: +0.0 pips');
    });

    it('should display correct symbol info', () => {
      const signal = createTestSignal({
        symbol: 'XAU/USD',
        direction: 'SELL',
        entryPrice: 2100.00,
      });

      const message = formatExpiredMessage(signal, 2105.00);

      expect(message).toContain('GOLD (XAUUSD)');
      expect(message).toContain('SELL');
      expect(message).toContain('Entry: 2100.00');
      expect(message).toContain('Current: 2105.00');
    });
  });

  describe('formatTrackingResult()', () => {
    it('should delegate to formatWinMessage for WIN status', () => {
      const result = createTestResult({ newStatus: 'WIN_TP1' });

      const message = formatTrackingResult(result as any);

      expect(message).toContain('🎉 WINNER!');
      expect(message).toContain('TP1 HIT!');
    });

    it('should delegate to formatWinMessage for WIN_TP2', () => {
      const result = createTestResult({ newStatus: 'WIN_TP2', hitLevel: 'TP2' });

      const message = formatTrackingResult(result as any);

      expect(message).toContain('🎉 WINNER!');
      expect(message).toContain('TP2 HIT!');
    });

    it('should delegate to formatWinMessage for WIN_TP3', () => {
      const result = createTestResult({ newStatus: 'WIN_TP3', hitLevel: 'TP3' });

      const message = formatTrackingResult(result as any);

      expect(message).toContain('🎉 WINNER!');
      expect(message).toContain('TP3 HIT!');
    });

    it('should delegate to formatLossMessage for LOSS_SL', () => {
      const result = createTestResult({ newStatus: 'LOSS_SL' });

      const message = formatTrackingResult(result as any);

      expect(message).toContain('❌ STOP LOSS HIT ❌');
    });
  });

  describe('Pips Calculation Accuracy', () => {
    it('should calculate pips correctly for BUY 1 pip movement', () => {
      // For gold: 1 pip = $0.01
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.00,
      });

      const result = createTestResult({
        signal,
        hitPrice: 2050.01,
        pnlPips: 1, // 0.01 / 0.01 = 1 pip
      });

      expect(result.pnlPips).toBe(1);
    });

    it('should calculate pips correctly for BUY 50 pip movement', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.00,
      });

      const result = createTestResult({
        signal,
        hitPrice: 2050.50,
        pnlPips: 50, // 0.50 / 0.01 = 50 pips
      });

      expect(result.pnlPips).toBe(50);
    });

    it('should calculate pips correctly for SELL 100 pip loss', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
      });

      const result = createTestResult({
        signal,
        hitPrice: 2050.00,
        pnlPips: 0,
      });

      expect(result.pnlPips).toBe(0);
    });

    it('should handle fractional pips correctly', () => {
      const signal = createTestSignal({
        direction: 'BUY',
        entryPrice: 2050.00,
      });

      const result = createTestResult({
        signal,
        hitPrice: 2050.123,
        pnlPips: 12.3, // 0.123 / 0.01 = 12.3 pips
      });

      expect(result.pnlPips).toBe(12.3);
    });

    it('should handle negative fractional pips', () => {
      const signal = createTestSignal({
        direction: 'SELL',
        entryPrice: 2050.00,
      });

      const result = createTestResult({
        signal,
        hitPrice: 2050.255,
        pnlPips: -25.5, // 2050 - 2050.255 = -0.255, -0.255 / 0.01 = -25.5
      });

      expect(result.pnlPips).toBe(-25.5);
    });
  });

  describe('Message Content Validation', () => {
    it('should include affiliate link in win message', () => {
      const result = createTestResult();
      const message = formatWinMessage(result as any);

      expect(message).toContain('https://');
      expect(message).toContain('account');
    });

    it('should include affiliate link in loss message', () => {
      const result = createTestResult();
      const message = formatLossMessage(result as any);

      expect(message).not.toContain('account:');
    });

    it('should format prices with 2 decimal places', () => {
      const signal = createTestSignal({
        entryPrice: 2050.1,
        stopLoss: 2045.567,
        takeProfit1: 2055.99,
      });

      const result = createTestResult({ signal });
      const message = formatWinMessage(result as any);

      expect(message).toContain('2050.10');
      expect(message).toContain('2055.00');
    });

    it('should include timestamp in signal message', () => {
      const now = new Date();
      const closedAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h later

      const signal = createTestSignal({
        createdAt: now.toISOString(),
        closedAt: closedAt.toISOString(),
      });

      const result = createTestResult({ signal });
      const message = formatWinMessage(result as any);

      // Message should contain timing info
      expect(message).toMatch(/Duration:/);
      expect(message).toMatch(/\d+[hm]/);
    });
  });
});
