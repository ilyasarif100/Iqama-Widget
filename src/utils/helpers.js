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
 * Format time string (adds AM/PM if missing)
 */
export function formatTime(timeString) {
    if (!timeString || timeString === '--:--') {
        return timeString;
    }

    // If already has AM/PM, return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
    }

    // Add AM/PM based on hour
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    
    if (hour === 0) {
        return `12:${minutes} AM`;
    } else if (hour < 12) {
        return `${hour}:${minutes} AM`;
    } else if (hour === 12) {
        return `12:${minutes} PM`;
    } else {
        return `${hour - 12}:${minutes} PM`;
    }
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

/**
 * Debounce function to limit function calls
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
