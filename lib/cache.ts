interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// Single instance per Node process. In dev, attached to globalThis to survive HMR module reloads.
const globalForCache = globalThis as unknown as { __memoryCache?: MemoryCache };

export const cache = globalForCache.__memoryCache ?? new MemoryCache();
if (process.env.NODE_ENV !== "production") {
  globalForCache.__memoryCache = cache;
}
