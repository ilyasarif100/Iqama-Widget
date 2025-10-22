/**
 * Constants Module
 * Defines all magic numbers and constants used throughout the application
 */

// CSV Column Indexes (0-based)
export const CSV_COLUMNS = {
    MONTH: 0,
    DAY: 1,
    // Athan Times
    FAJR_ATHAN: 2,
    FAJR_IQAMA: 3,
    SUNRISE: 4,
    ZUHR_ATHAN: 5,
    ZUHR_IQAMA: 6,
    ASR_ATHAN: 7,
    ASR_IQAMA: 8,
    MAGHRIB_ATHAN: 9,
    MAGHRIB_IQAMA: 10,
    ISHA_ATHAN: 11,
    ISHA_IQAMA: 12,
    // Additional columns (if any)
    EMPTY: 13,
    PRAYER_NAME: 14,
    IQAMA_OFFSET: 15,
    EMPTY2: 16,
    JUMAH_LABEL: 17,
    JUMAH_START: 18,
    JUMAH_END: 19
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
    IQAMA: 'iqama',
    BOTH: 'athan and iqama'
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

