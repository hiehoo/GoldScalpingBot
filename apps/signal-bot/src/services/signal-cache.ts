import fs from 'fs/promises';
import path from 'path';
import type { CachedSignal, SignalStats } from '../types/index.js';

const DEFAULT_DATA_DIR = 'data';
const SIGNALS_FILE = 'signals.json';
const MAX_HISTORY = 100;
const SAVE_DEBOUNCE_MS = 100;

/**
 * SignalCache - In-memory + JSON file persistence for signal tracking
 *
 * Features:
 * - Dual storage: in-memory Map for speed + JSON for persistence
 * - Atomic writes (temp file + rename) to prevent corruption
 * - Auto-load on construction
 * - Debounced saves to prevent excessive I/O
 * - Auto-prune to keep history manageable
 */
class SignalCache {
  private signals: Map<string, CachedSignal> = new Map();
  private filePath: string;
  private maxHistory: number = MAX_HISTORY;
  private saveTimeout: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor(dataDir?: string) {
    const baseDir = dataDir || path.join(process.cwd(), DEFAULT_DATA_DIR);
    this.filePath = path.join(baseDir, SIGNALS_FILE);
  }

  /**
   * Initialize cache by loading from file
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    await this.ensureDataDir();
    await this.load();
    this.initialized = true;
  }

  /**
   * Ensure data directory exists
   */
  private async ensureDataDir(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      // Directory may already exist
    }
  }

  /**
   * Add a new signal to cache
   */
  add(signal: CachedSignal): void {
    this.signals.set(signal.id, signal);
    this.scheduleSave();
    this.prune();
  }

  /**
   * Get a signal by ID
   */
  get(id: string): CachedSignal | undefined {
    return this.signals.get(id);
  }

  /**
   * Get all active signals (status = 'ACTIVE')
   */
  getActive(): CachedSignal[] {
    return Array.from(this.signals.values()).filter(s => s.status === 'ACTIVE');
  }

  /**
   * Get all signals
   */
  getAll(): CachedSignal[] {
    return Array.from(this.signals.values());
  }

  /**
   * Get expired active signals (past expiresAt but still ACTIVE)
   */
  getExpired(): CachedSignal[] {
    const now = new Date().toISOString();
    return this.getActive().filter(s => s.expiresAt < now);
  }

  /**
   * Update a signal with partial data
   */
  update(id: string, updates: Partial<CachedSignal>): void {
    const signal = this.signals.get(id);
    if (signal) {
      this.signals.set(id, { ...signal, ...updates });
      this.scheduleSave();
    }
  }

  /**
   * Remove a signal by ID
   */
  remove(id: string): void {
    this.signals.delete(id);
    this.scheduleSave();
  }

  /**
   * Save signals to JSON file (atomic write)
   */
  async save(): Promise<void> {
    const data = Array.from(this.signals.values());
    const tempPath = `${this.filePath}.tmp`;

    try {
      await this.ensureDataDir();
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.rename(tempPath, this.filePath);
    } catch (err) {
      console.error('[SignalCache] Save error:', err);
      // Try to clean up temp file
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw err;
    }
  }

  /**
   * Load signals from JSON file
   */
  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      const data: CachedSignal[] = JSON.parse(content);

      this.signals.clear();
      for (const signal of data) {
        this.signals.set(signal.id, signal);
      }

      console.log(`[SignalCache] Loaded ${this.signals.size} signals from ${this.filePath}`);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        console.log('[SignalCache] No existing signals file, starting fresh');
      } else {
        console.error('[SignalCache] Load error:', err);
      }
    }
  }

  /**
   * Get statistics for all signals
   */
  getStats(): SignalStats {
    const all = this.getAll();
    const wins = all.filter(s => s.status.startsWith('WIN_')).length;
    const losses = all.filter(s => s.status === 'LOSS_SL').length;
    const expired = all.filter(s => s.status === 'EXPIRED').length;
    const totalPips = all.reduce((sum, s) => sum + (s.pnlPips || 0), 0);

    const completed = wins + losses;
    const winRate = completed > 0 ? (wins / completed) * 100 : 0;

    return {
      wins,
      losses,
      expired,
      winRate: Math.round(winRate * 10) / 10,
      totalPips: Math.round(totalPips * 10) / 10,
    };
  }

  /**
   * Prune old signals to keep history manageable
   * Keeps only the most recent maxHistory signals
   */
  prune(): void {
    if (this.signals.size <= this.maxHistory) return;

    const sorted = this.getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const toRemove = sorted.slice(this.maxHistory);
    for (const signal of toRemove) {
      this.signals.delete(signal.id);
    }

    if (toRemove.length > 0) {
      console.log(`[SignalCache] Pruned ${toRemove.length} old signals`);
      this.scheduleSave();
    }
  }

  /**
   * Schedule a debounced save
   */
  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.save().catch(err => console.error('[SignalCache] Debounced save error:', err));
      this.saveTimeout = null;
    }, SAVE_DEBOUNCE_MS);
  }

  /**
   * Force immediate save (useful before shutdown)
   */
  async flush(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    await this.save();
  }

  /**
   * Get count of signals by status
   */
  getCount(): { total: number; active: number; closed: number } {
    const all = this.getAll();
    const active = all.filter(s => s.status === 'ACTIVE').length;
    return {
      total: all.length,
      active,
      closed: all.length - active,
    };
  }
}

// Singleton instance
export const signalCache = new SignalCache();

export { SignalCache };
