/**
 * Cache Manager Module
 * Handles caching of prayer times data
 */

import { logger } from '../utils/logger.js';
import { createCacheKey } from '../utils/utils.js';

export class CacheManager {
    constructor(cacheDuration = 24 * 60 * 60 * 1000) { // 24 hours - daily refresh
        this.cache = new Map();
        this.cacheDuration = cacheDuration;
        this.cleanupInterval = null;
        
        // Start cleanup interval
        this._startCleanupInterval();
    }

    /**
     * Get cached data
     */
    get(key, forceRefresh = false) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            logger.info('Cache miss', key);
            return null;
        }

        // Check if data is from today (daily refresh logic)
        const isDataFromToday = this._isDataFromToday(cached.timestamp);
        
        // If forcing refresh or data is not from today, treat as expired
        if (forceRefresh || !isDataFromToday) {
            logger.info(forceRefresh ? 'Force refresh requested' : 'Data not from today', key);
            this.cache.delete(key);
            return null;
        }

        logger.info('Cache hit (daily data)', key);
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
        logger.info('Data cached', key);
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
            logger.info(`Cleaned up ${cleanedCount} expired cache entries`);
        }
    }

    /**
     * Check if cached data is from today
     */
    _isDataFromToday(timestamp) {
        const today = new Date().toDateString();
        const dataDay = new Date(timestamp).toDateString();
        return today === dataDay;
    }

    /**
     * Start automatic cleanup interval
     */
    _startCleanupInterval() {
        // Clean up every hour (less frequent since we're using daily refresh)
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 60 * 1000);
    }

}
