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
    ZUHR_ATHAN: 3,
    ASR_ATHAN: 4,
    MAGHRIB_ATHAN: 5,
    ISHA_ATHAN: 6,
    // Iqama Times
    FAJR_IQAMA: 7,
    ZUHR_IQAMA: 8,
    ASR_IQAMA: 9,
    MAGHRIB_IQAMA: 10,
    ISHA_IQAMA: 11,
    // Jumuah (unchanged)
    EMPTY: 12,        // Empty column
    JUMAH_LABEL: 13,  // Jumuah label column
    JUMAH_START: 14,  // Jumuah start time column
    JUMAH_END: 15     // Jumuah end time column
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

