/**
 * Simple API response cache with configurable TTL (time-to-live).
 * Prevents repeated API calls within the cache duration.
 */

const cache = new Map();
// In-memory only (clears on refresh). Keep TTLs short to avoid stale UI.
const DEFAULT_TTL = 5000; // 5 seconds

/**
 * Generate a cache key from the request parameters
 * @param {string} endpoint - API endpoint
 * @param {any} params - Request parameters
 * @returns {string} Cache key
 */
const generateKey = (endpoint, params = null) => {
    // Params are stringified so different query objects get different cache entries.
    return params ? `${endpoint}:${JSON.stringify(params)}` : endpoint;
};

/**
 * Get cached data if it exists and is not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired/not found
 */
const get = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
        return null;
    }

    return entry.data;
};

/**
 * Store data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time-to-live in milliseconds
 */
const set = (key, data, ttl = DEFAULT_TTL) => {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
    });
};

/**
 * Clear a specific cache entry
 * @param {string} key - Cache key
 */
const clear = (key) => {
    cache.delete(key);
};

/**
 * Clear all cache entries
 */
const clearAll = () => {
    cache.clear();
};

/**
 * Wrap an API call with caching
 * @param {string} endpoint - API endpoint (used as cache key)
 * @param {Function} apiCall - The API call function that returns a promise
 * @param {any} params - Optional parameters for cache key generation
 * @param {number} ttl - Optional TTL in milliseconds (default: 5000ms)
 * @returns {Promise<any>} Cached or fresh API response
 */
const withCache = async (endpoint, apiCall, params = null, ttl = DEFAULT_TTL) => {
    const key = generateKey(endpoint, params);

    // Note: this is a response cache, not an "in-flight" de-dupe.
    // If multiple callers hit the same endpoint at the exact same time,
    // they may still issue multiple requests before the first one resolves.

    // Check if we have valid cached data
    const cachedData = get(key);
    if (cachedData !== null) {
        return cachedData;
    }

    // Make the API call and cache the result
    const data = await apiCall();
    set(key, data, ttl);
    return data;
};

const apiCache = {
    generateKey,
    get,
    set,
    clear,
    clearAll,
    withCache,
    DEFAULT_TTL,
};

export default apiCache;
