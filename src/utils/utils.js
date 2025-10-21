/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

import { SHEET_URL_PATTERNS } from '../config/constants.js';
import { logger } from './logger.js';

/**
 * Extract Sheet ID from Google Sheet URL
 */
export function extractSheetId(url) {
    if (!url) {
        logger.error('No URL provided to extractSheetId');
        return null;
    }

    logger.debug('Extracting Sheet ID from URL', url);

    for (let pattern of SHEET_URL_PATTERNS) {
        const match = url.match(pattern);
        if (match) {
            const sheetId = match[1];
            logger.success('Sheet ID extracted', sheetId);
            return sheetId;
        }
    }

    logger.error('Could not extract Sheet ID from URL', url);
    return null;
}

/**
 * Parse CSV line and clean up values
 */
export function parseCSVLine(line) {
    if (!line || !line.trim()) {
        return [];
    }

    return line.split(',').map(value => {
        return value.replace(/^"/, '').replace(/"$/, '').trim();
    });
}


/**
 * Get current date info
 */
export function getCurrentDateInfo() {
    const today = new Date();
    return {
        month: today.getMonth() + 1,
        day: today.getDate(),
        year: today.getFullYear()
    };
}

/**
 * Get tomorrow's date info
 */
export function getTomorrowDateInfo() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
        month: tomorrow.getMonth() + 1,
        day: tomorrow.getDate(),
        year: tomorrow.getFullYear()
    };
}

/**
 * Validate that a value is not empty or undefined
 */
export function isValidValue(value) {
    return value !== null && value !== undefined && value !== '';
}

/**
 * Create a cache key for prayer times
 */
export function createCacheKey(sheetId) {
    return `prayer_times_${sheetId}`;
}

