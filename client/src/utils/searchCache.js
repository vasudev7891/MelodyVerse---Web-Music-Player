/**
 * Client-Side Search Cache
 * 
 * Lightweight in-memory cache with TTL and LRU eviction.
 * Prevents redundant API calls when users navigate back/forth
 * or search the same query multiple times.
 */

const MAX_ENTRIES = 50;
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

class SearchCache {
    constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = MAX_ENTRIES) {
        this._cache = new Map();
        this._ttl = ttlMs;
        this._maxEntries = maxEntries;
    }

    /**
     * Get a cached value. Returns undefined if not found or expired.
     */
    get(key) {
        const entry = this._cache.get(key);
        if (!entry) return undefined;

        // Check TTL expiration
        if (Date.now() - entry.timestamp > this._ttl) {
            this._cache.delete(key);
            return undefined;
        }

        // Move to end (most recently used) for LRU
        this._cache.delete(key);
        this._cache.set(key, entry);
        return entry.value;
    }

    /**
     * Store a value in the cache.
     */
    set(key, value) {
        // Delete first if exists (to update position in Map)
        if (this._cache.has(key)) {
            this._cache.delete(key);
        }

        // Evict oldest entry if at capacity
        if (this._cache.size >= this._maxEntries) {
            const oldestKey = this._cache.keys().next().value;
            this._cache.delete(oldestKey);
        }

        this._cache.set(key, { value, timestamp: Date.now() });
    }

    /**
     * Check if a key exists and is not expired.
     */
    has(key) {
        return this.get(key) !== undefined;
    }

    /**
     * Clear the entire cache.
     */
    clear() {
        this._cache.clear();
    }

    /**
     * Get current cache size (including potentially expired entries).
     */
    get size() {
        return this._cache.size;
    }
}

// Export singleton instances for different cache purposes
export const searchResultsCache = new SearchCache(10 * 60 * 1000, 50);  // 10 min, 50 entries
export const suggestionsCache = new SearchCache(5 * 60 * 1000, 30);     // 5 min, 30 entries
export const trendingCache = new SearchCache(15 * 60 * 1000, 5);        // 15 min, 5 entries

export default SearchCache;
