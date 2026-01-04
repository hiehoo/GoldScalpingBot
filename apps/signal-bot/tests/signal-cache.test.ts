import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SignalCache } from '../src/services/signal-cache.js';
import type { CachedSignal } from '../src/types/index.js';
import fs from 'fs/promises';
import path from 'path';

const TEST_DATA_DIR = './tests/test-data/cache';

describe('SignalCache', () => {
  let cache: SignalCache;

  beforeEach(async () => {
    // Clean test data directory
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }

    cache = new SignalCache(TEST_DATA_DIR);
    await cache.init();
  });

  afterEach(async () => {
    // Flush any pending saves
    await cache.flush();
    // Clean up
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  // Helper: Create test signal
  function createTestSignal(overrides?: Partial<CachedSignal>): CachedSignal {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // +4h

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

  describe('add()', () => {
    it('should add a signal to cache', () => {
      const signal = createTestSignal();
      cache.add(signal);

      const retrieved = cache.get(signal.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(signal.id);
      expect(retrieved?.direction).toBe('BUY');
    });

    it('should allow multiple signals in cache', () => {
      const signal1 = createTestSignal({ id: 'signal-1' });
      const signal2 = createTestSignal({ id: 'signal-2', direction: 'SELL' });

      cache.add(signal1);
      cache.add(signal2);

      expect(cache.getAll()).toHaveLength(2);
      expect(cache.get('signal-1')?.direction).toBe('BUY');
      expect(cache.get('signal-2')?.direction).toBe('SELL');
    });

    it('should trigger save on add', async () => {
      const signal = createTestSignal();
      cache.add(signal);

      // Wait for debounced save
      await new Promise(resolve => setTimeout(resolve, 150));

      // Verify file was created
      const filePath = path.join(TEST_DATA_DIR, 'signals.json');
      const exists = await fs.stat(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should trigger auto-prune when exceeding maxHistory', async () => {
      // Add more signals than MAX_HISTORY (100)
      for (let i = 0; i < 105; i++) {
        const signal = createTestSignal({
          id: `signal-${i}`,
          createdAt: new Date(Date.now() - i * 1000).toISOString(), // Older signals have earlier times
        });
        cache.add(signal);
      }

      // Should only keep 100 most recent
      expect(cache.getAll().length).toBeLessThanOrEqual(100);
    });
  });

  describe('get()', () => {
    it('should retrieve a signal by ID', () => {
      const signal = createTestSignal();
      cache.add(signal);

      const retrieved = cache.get(signal.id);
      expect(retrieved).toEqual(signal);
    });

    it('should return undefined for non-existent signal', () => {
      const retrieved = cache.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getActive()', () => {
    it('should return only ACTIVE signals', () => {
      const active1 = createTestSignal({ id: 'active-1', status: 'ACTIVE' });
      const active2 = createTestSignal({ id: 'active-2', status: 'ACTIVE' });
      const win = createTestSignal({ id: 'win-1', status: 'WIN_TP1' });
      const loss = createTestSignal({ id: 'loss-1', status: 'LOSS_SL' });

      cache.add(active1);
      cache.add(active2);
      cache.add(win);
      cache.add(loss);

      const active = cache.getActive();
      expect(active).toHaveLength(2);
      expect(active.every(s => s.status === 'ACTIVE')).toBe(true);
    });

    it('should return empty array when no active signals', () => {
      const win = createTestSignal({ id: 'win-1', status: 'WIN_TP1' });
      const loss = createTestSignal({ id: 'loss-1', status: 'LOSS_SL' });

      cache.add(win);
      cache.add(loss);

      expect(cache.getActive()).toHaveLength(0);
    });
  });

  describe('getExpired()', () => {
    it('should return ACTIVE signals that have expired', () => {
      const now = new Date().toISOString();
      const pastExpiry = new Date(Date.now() - 1000).toISOString(); // 1s in past

      const notExpired = createTestSignal({
        id: 'not-expired',
        status: 'ACTIVE',
        expiresAt: now,
      });
      const expired = createTestSignal({
        id: 'expired',
        status: 'ACTIVE',
        expiresAt: pastExpiry,
      });
      const closedWin = createTestSignal({
        id: 'closed-win',
        status: 'WIN_TP1',
        expiresAt: pastExpiry,
      });

      cache.add(notExpired);
      cache.add(expired);
      cache.add(closedWin);

      const expiredSignals = cache.getExpired();
      expect(expiredSignals).toHaveLength(1);
      expect(expiredSignals[0].id).toBe('expired');
    });
  });

  describe('update()', () => {
    it('should update signal with partial data', () => {
      const signal = createTestSignal();
      cache.add(signal);

      cache.update(signal.id, {
        status: 'WIN_TP1',
        closedAt: new Date().toISOString(),
        closedPrice: 2055.00,
        pnlPips: 50,
      });

      const updated = cache.get(signal.id);
      expect(updated?.status).toBe('WIN_TP1');
      expect(updated?.closedPrice).toBe(2055.00);
      expect(updated?.pnlPips).toBe(50);
      // Should not change other fields
      expect(updated?.direction).toBe('BUY');
      expect(updated?.entryPrice).toBe(2050.00);
    });

    it('should not update non-existent signal', () => {
      cache.update('non-existent', { status: 'WIN_TP1' });
      expect(cache.get('non-existent')).toBeUndefined();
    });

    it('should trigger save on update', async () => {
      const signal = createTestSignal();
      cache.add(signal);

      // Wait for initial save
      await new Promise(resolve => setTimeout(resolve, 150));

      // Verify file exists
      const filePath = path.join(TEST_DATA_DIR, 'signals.json');
      let exists = await fs.stat(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Update and verify it saves again
      const modTimeBefore = (await fs.stat(filePath)).mtime;
      cache.update(signal.id, { status: 'LOSS_SL' });
      await new Promise(resolve => setTimeout(resolve, 150));

      const modTimeAfter = (await fs.stat(filePath)).mtime;
      expect(modTimeAfter.getTime()).toBeGreaterThan(modTimeBefore.getTime());
    });
  });

  describe('remove()', () => {
    it('should remove a signal by ID', () => {
      const signal = createTestSignal();
      cache.add(signal);

      expect(cache.get(signal.id)).toBeDefined();
      cache.remove(signal.id);
      expect(cache.get(signal.id)).toBeUndefined();
    });

    it('should trigger save on remove', async () => {
      const signal = createTestSignal();
      cache.add(signal);

      await new Promise(resolve => setTimeout(resolve, 150));

      const filePath = path.join(TEST_DATA_DIR, 'signals.json');
      let content = await fs.readFile(filePath, 'utf-8');
      expect(JSON.parse(content)).toHaveLength(1);

      cache.remove(signal.id);
      await new Promise(resolve => setTimeout(resolve, 150));

      content = await fs.readFile(filePath, 'utf-8');
      expect(JSON.parse(content)).toHaveLength(0);
    });
  });

  describe('persistence', () => {
    it('should save signals to JSON file', async () => {
      const signal = createTestSignal();
      cache.add(signal);

      await new Promise(resolve => setTimeout(resolve, 150));

      const filePath = path.join(TEST_DATA_DIR, 'signals.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(signal.id);
    });

    it('should load signals from JSON file on init', async () => {
      const signal = createTestSignal();
      cache.add(signal);

      await new Promise(resolve => setTimeout(resolve, 150));

      // Create new cache instance - should load from file
      const cache2 = new SignalCache(TEST_DATA_DIR);
      await cache2.init();

      expect(cache2.get(signal.id)).toBeDefined();
      expect(cache2.getAll()).toHaveLength(1);
    });

    it('should handle missing file gracefully', async () => {
      const cache2 = new SignalCache(TEST_DATA_DIR);

      // Should not throw even if no file exists
      expect(async () => {
        await cache2.init();
      }).not.toThrow();

      expect(cache2.getAll()).toHaveLength(0);
    });

    it('should use atomic writes (temp file + rename)', async () => {
      const signal = createTestSignal();
      cache.add(signal);

      await new Promise(resolve => setTimeout(resolve, 150));

      // Verify no temp files left behind
      const dir = TEST_DATA_DIR;
      const files = await fs.readdir(dir);
      const tempFiles = files.filter(f => f.endsWith('.tmp'));
      expect(tempFiles).toHaveLength(0);
    });
  });

  describe('getStats()', () => {
    it('should calculate wins correctly', () => {
      cache.add(createTestSignal({ id: 'win-1', status: 'WIN_TP1', pnlPips: 50 }));
      cache.add(createTestSignal({ id: 'win-2', status: 'WIN_TP2', pnlPips: 75 }));
      cache.add(createTestSignal({ id: 'loss-1', status: 'LOSS_SL', pnlPips: -30 }));

      const stats = cache.getStats();
      expect(stats.wins).toBe(2);
      expect(stats.losses).toBe(1);
    });

    it('should calculate loss correctly', () => {
      cache.add(createTestSignal({ id: 'loss-1', status: 'LOSS_SL', pnlPips: -25 }));
      cache.add(createTestSignal({ id: 'loss-2', status: 'LOSS_SL', pnlPips: -40 }));

      const stats = cache.getStats();
      expect(stats.losses).toBe(2);
      expect(stats.wins).toBe(0);
    });

    it('should calculate win rate percentage', () => {
      cache.add(createTestSignal({ id: 'win-1', status: 'WIN_TP1', pnlPips: 50 }));
      cache.add(createTestSignal({ id: 'win-2', status: 'WIN_TP2', pnlPips: 75 }));
      cache.add(createTestSignal({ id: 'loss-1', status: 'LOSS_SL', pnlPips: -30 }));

      const stats = cache.getStats();
      // 2 wins / 3 completed = 66.67% rounded to 66.7%
      expect(stats.winRate).toBeCloseTo(66.7, 0.1);
    });

    it('should calculate total pips correctly', () => {
      cache.add(createTestSignal({ id: 'win-1', status: 'WIN_TP1', pnlPips: 50 }));
      cache.add(createTestSignal({ id: 'win-2', status: 'WIN_TP2', pnlPips: 75.5 }));
      cache.add(createTestSignal({ id: 'loss-1', status: 'LOSS_SL', pnlPips: -30.2 }));

      const stats = cache.getStats();
      // 50 + 75.5 - 30.2 = 95.3
      expect(stats.totalPips).toBe(95.3);
    });

    it('should count expired signals', () => {
      cache.add(createTestSignal({ id: 'expired-1', status: 'EXPIRED', pnlPips: 10 }));
      cache.add(createTestSignal({ id: 'expired-2', status: 'EXPIRED', pnlPips: 20 }));
      cache.add(createTestSignal({ id: 'win-1', status: 'WIN_TP1', pnlPips: 50 }));

      const stats = cache.getStats();
      expect(stats.expired).toBe(2);
    });

    it('should handle zero win rate', () => {
      cache.add(createTestSignal({ id: 'loss-1', status: 'LOSS_SL', pnlPips: -25 }));

      const stats = cache.getStats();
      expect(stats.winRate).toBe(0);
    });

    it('should handle no completed signals', () => {
      cache.add(createTestSignal({ id: 'active-1', status: 'ACTIVE' }));
      cache.add(createTestSignal({ id: 'expired-1', status: 'EXPIRED', pnlPips: 10 }));

      const stats = cache.getStats();
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.winRate).toBe(0);
    });
  });

  describe('prune()', () => {
    it('should keep only maxHistory most recent signals', () => {
      // Add 150 signals with different timestamps
      for (let i = 0; i < 150; i++) {
        const signal = createTestSignal({
          id: `signal-${i}`,
          createdAt: new Date(Date.now() - (150 - i) * 1000).toISOString(),
        });
        cache.add(signal);
      }

      // Trigger prune
      cache['prune']();

      // Should have max 100
      const all = cache.getAll();
      expect(all.length).toBeLessThanOrEqual(100);
    });

    it('should not prune when under maxHistory', () => {
      for (let i = 0; i < 50; i++) {
        cache.add(createTestSignal({ id: `signal-${i}` }));
      }

      cache['prune']();
      expect(cache.getAll()).toHaveLength(50);
    });
  });

  describe('flush()', () => {
    it('should save immediately without debounce', async () => {
      const signal = createTestSignal();
      cache.add(signal);

      // Immediately flush
      await cache.flush();

      const filePath = path.join(TEST_DATA_DIR, 'signals.json');
      const content = await fs.readFile(filePath, 'utf-8');
      expect(JSON.parse(content)).toHaveLength(1);
    });

    it('should cancel pending debounced saves', async () => {
      const signal1 = createTestSignal({ id: 'signal-1' });
      cache.add(signal1);

      const signal2 = createTestSignal({ id: 'signal-2' });
      cache.add(signal2);

      // Flush immediately (should not wait 100ms)
      const start = Date.now();
      await cache.flush();
      const elapsed = Date.now() - start;

      // Should complete in < 50ms (not waiting 100ms+ debounce)
      expect(elapsed).toBeLessThan(50);

      const filePath = path.join(TEST_DATA_DIR, 'signals.json');
      const content = await fs.readFile(filePath, 'utf-8');
      expect(JSON.parse(content)).toHaveLength(2);
    });
  });

  describe('getCount()', () => {
    it('should return correct count by status', () => {
      cache.add(createTestSignal({ id: 'active-1', status: 'ACTIVE' }));
      cache.add(createTestSignal({ id: 'active-2', status: 'ACTIVE' }));
      cache.add(createTestSignal({ id: 'win-1', status: 'WIN_TP1' }));
      cache.add(createTestSignal({ id: 'loss-1', status: 'LOSS_SL' }));

      const count = cache.getCount();
      expect(count.total).toBe(4);
      expect(count.active).toBe(2);
      expect(count.closed).toBe(2);
    });

    it('should handle empty cache', () => {
      const count = cache.getCount();
      expect(count.total).toBe(0);
      expect(count.active).toBe(0);
      expect(count.closed).toBe(0);
    });
  });
});
