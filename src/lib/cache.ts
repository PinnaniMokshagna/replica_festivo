interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Retrieves an item from the cache if it exists and hasn't expired.
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Sets an item in the cache with an optional TTL.
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Fetches data using the provided fetcher function, returning cached data
   * immediately if valid, or fetching fresh data and caching it.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const freshData = await fetcher();
    if (freshData !== null && freshData !== undefined) {
      this.set(key, freshData, ttl);
    }
    return freshData;
  }

  /**
   * Removes a specific key from the cache.
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all items matching a prefix.
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

export const dataCache = new InMemoryCache();
