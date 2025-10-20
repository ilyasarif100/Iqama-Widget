/**
 * Constants Module
 * Defines all magic numbers and constants used throughout the application
 */

// CSV Column Indexes (0-based)
export const CSV_COLUMNS = {
    MONTH: 0,
    DAY: 1,
    FAJR: 2,
    ZUHR: 3,
    ASR: 4,
    MAGHRIB: 5,
    ISHA: 6,
    EMPTY: 7,        // Empty column
    JUMAH_LABEL: 8,  // Jumuah label column
    JUMAH_START: 9,  // Jumuah start time column
    JUMAH_END: 10    // Jumuah end time column
};

// Jumuah Row Indexes (0-based, where 0 is header)
export const JUMAH_ROWS = {
    FIRST: 1,   // Row 2 (0-indexed)
    SECOND: 2,  // Row 3
    THIRD: 3    // Row 4
};

// Prayer Types
export const PRAYER_TYPES = {
    ATHAN: 'athan',
    IQAMA: 'iqama'
};

// Prayer Names
export const PRAYER_NAMES = {
    FAJR: 'fajr',
    ZUHR: 'dhuhr',
    ASR: 'asr',
    MAGHRIB: 'maghrib',
    ISHA: 'isha',
    JUMAH1: 'jumuah1',
    JUMAH2: 'jumuah2',
    JUMAH3: 'jumuah3'
};

// Fallback Values
export const FALLBACK_VALUES = {
    TIME: '--:--',
    JUMAH_TIME: '--:-- - --:--',
    TITLE: 'Prayer Times',
    LOCATION: 'Location'
};

// Google Sheets URL Patterns
export const SHEET_URL_PATTERNS = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/,
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/view/
];

// Cache Keys
export const CACHE_KEYS = {
    PRAYER_TIMES: 'prayer_times'
};
