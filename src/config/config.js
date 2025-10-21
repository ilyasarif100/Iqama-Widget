/**
 * Configuration Management Module
 * Centralizes all configuration settings and constants
 */

// Default configuration - users can override via window.IqamaWidgetConfig
export const DEFAULT_CONFIG = {
    // Google Sheets Configuration
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing',
    
    // Display Configuration
    title: 'Prayer Times',
    location: 'ICCP AZ',
    
    // Styling Configuration
    backgroundColor: '#1F2937',
    accentColor: '#E5E7EB',
    borderRadius: '20px',
    
    // Widget Configuration
    timeType: 'athan',
    jumuahCount: 1,
    
    // Performance Configuration
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours (daily refresh)
    pollingInterval: 24 * 60 * 60 * 1000, // 24 hours (daily refresh)
    
    // Debug Configuration
    debug: false,
    logLevel: 'normal' // 'minimal', 'normal', 'verbose'
};

// Get the current configuration (user config overrides defaults)
export function getConfig() {
    return {
        ...DEFAULT_CONFIG,
        ...(window.IqamaWidgetConfig || {})
    };
}

// Configuration validation
export function validateConfig(config) {
    const required = ['googleSheetUrl', 'title', 'location'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    return true;
}
