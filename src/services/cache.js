/**
 * Cache Manager Module
 * Handles caching of prayer times data
 */

import { logger } from '../utils/logger.js';
import { createCacheKey } from '../utils/utils.js';

export class CacheManager {
    constructor(cacheDuration = 10 * 60 * 1000) { // 10 minutes default
        this.cache = new Map();
        this.cacheDuration = cacheDuration;
        this.cleanupInterval = null;
        
        // Start cleanup interval
        this._startCleanupInterval();
    }

    /**
     * Get cached data
     */
    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            logger.debug('Cache miss', key);
            return null;
        }

        const isExpired = (Date.now() - cached.timestamp) > this.cacheDuration;
        
        if (isExpired) {
            logger.debug('Cache expired', key);
            this.cache.delete(key);
            return null;
        }

        logger.debug('Cache hit', key);
        return cached.data;
    }

    /**
     * Set cached data
     */
    set(key, data) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now()
        };

        this.cache.set(key, cacheEntry);
        logger.debug('Data cached', key);
    }

    /**
     * Get prayer times from cache
     */
    getPrayerTimes(sheetId) {
        const key = createCacheKey(sheetId);
        return this.get(key);
    }

    /**
     * Set prayer times in cache
     */
    setPrayerTimes(sheetId, data) {
        const key = createCacheKey(sheetId);
        this.set(key, data);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        logger.info('Cache cleared');
    }

    /**
     * Clear expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        for (let [key, value] of this.cache.entries()) {
            if ((now - value.timestamp) > this.cacheDuration) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
        }
    }

    /**
     * Start automatic cleanup interval
     */
    _startCleanupInterval() {
        // Clean up every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Stop cleanup interval
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (let [key, value] of this.cache.entries()) {
            if ((now - value.timestamp) > this.cacheDuration) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            cacheDuration: this.cacheDuration
        };
    }
}
