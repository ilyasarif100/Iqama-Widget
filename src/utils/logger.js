/**
 * Centralized Logging System
 * Provides consistent logging throughout the application
 */

import { getConfig } from '../config/config.js';

class Logger {
    constructor() {
        this.config = getConfig();
    }

    /**
     * Log info messages (only if debug is enabled)
     */
    info(message, data = null) {
        // Always log info messages
        console.log(`ℹ️ [INFO] ${message}`, data || '');
    }

    /**
     * Log success messages (only if debug is enabled)
     */
    success(message, data = null) {
        // Always log success messages
        console.log(`✅ [SUCCESS] ${message}`, data || '');
    }

    /**
     * Log warning messages (always shown)
     */
    warn(message, data = null) {
        console.warn(`⚠️ [WARNING] ${message}`, data || '');
    }

    /**
     * Log error messages (always shown)
     */
    error(message, data = null) {
        console.error(`❌ [ERROR] ${message}`, data || '');
    }

    /**
     * Log debug messages (only in verbose mode)
     */
    debug(message, data = null) {
        // Always log debug messages
        console.log(`🔍 [DEBUG] ${message}`, data || '');
    }

}

// Create singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger };
