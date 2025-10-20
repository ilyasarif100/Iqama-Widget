/**
 * Data Parser Module
 * Handles parsing CSV data into structured prayer times
 */

import { logger } from '../utils/logger.js';
import { parseCSVLine, isValidValue } from '../utils/helpers.js';
import { CSV_COLUMNS, JUMAH_ROWS, FALLBACK_VALUES } from '../config/constants.js';

export class DataParser {
    constructor() {
        this.jumuahTimes = {};
        this.prayerTimesData = [];
    }

    /**
     * Parse CSV text into structured data
     */
    parseCSV(csvText) {
        logger.info('Starting CSV parsing');
        
        const lines = csvText.split('\n');
        logger.dataFlow('PARSER', 'CSV split into lines', lines.length);

        // First, extract Jumuah times from specific rows
        this._parseJumuahTimes(lines);
        
        // Then parse daily prayer times
        this._parsePrayerTimes(lines);
        
        logger.success('CSV parsing completed', {
            jumuahTimes: this.jumuahTimes,
            prayerDays: this.prayerTimesData.length
        });

        return {
            jumuahTimes: this.jumuahTimes,
            prayerTimesData: this.prayerTimesData
        };
    }

    /**
     * Parse Jumuah times from specific rows
     */
    _parseJumuahTimes(lines) {
        logger.info('Parsing Jumuah times from rows 2-4');
        
        this.jumuahTimes = {
            jumuah1: '',
            jumuah2: '',
            jumuah3: ''
        };

        // Extract from rows 2, 3, 4 (indexes 1, 2, 3)
        for (let i = JUMAH_ROWS.FIRST; i <= JUMAH_ROWS.THIRD; i++) {
            if (lines[i] && lines[i].trim()) {
                const values = parseCSVLine(lines[i]);
                
                if (values.length >= CSV_COLUMNS.JUMAH_END + 1) {
                    const jumuahStart = values[CSV_COLUMNS.JUMAH_START];
                    const jumuahEnd = values[CSV_COLUMNS.JUMAH_END];
                    
                    if (isValidValue(jumuahStart) && isValidValue(jumuahEnd)) {
                        const jumuahTime = `${jumuahStart} - ${jumuahEnd}`;
                        
                        if (i === JUMAH_ROWS.FIRST) {
                            this.jumuahTimes.jumuah1 = jumuahTime;
                        } else if (i === JUMAH_ROWS.SECOND) {
                            this.jumuahTimes.jumuah2 = jumuahTime;
                        } else if (i === JUMAH_ROWS.THIRD) {
                            this.jumuahTimes.jumuah3 = jumuahTime;
                        }
                        
                        logger.debug(`Parsed Jumuah ${i}`, jumuahTime);
                    }
                }
            }
        }

        // Set fallback values if no Jumuah times found
        if (!this.jumuahTimes.jumuah1 && !this.jumuahTimes.jumuah2 && !this.jumuahTimes.jumuah3) {
            logger.warn('No Jumuah times found, using fallback values');
            this.jumuahTimes.jumuah1 = FALLBACK_VALUES.JUMAH_TIME;
            this.jumuahTimes.jumuah2 = FALLBACK_VALUES.JUMAH_TIME;
            this.jumuahTimes.jumuah3 = FALLBACK_VALUES.JUMAH_TIME;
        }
    }

    /**
     * Parse daily prayer times from remaining rows
     */
    _parsePrayerTimes(lines) {
        logger.info('Parsing daily prayer times');
        
        this.prayerTimesData = [];

        // Start from row 5 (index 4) to skip header and Jumuah rows
        for (let i = 4; i < lines.length; i++) {
            if (lines[i] && lines[i].trim()) {
                const values = parseCSVLine(lines[i]);
                
                if (values.length >= CSV_COLUMNS.ISHA + 1) {
                    const prayerData = {
                        month: parseInt(values[CSV_COLUMNS.MONTH]),
                        day: parseInt(values[CSV_COLUMNS.DAY]),
                        fajr: values[CSV_COLUMNS.FAJR] || FALLBACK_VALUES.TIME,
                        dhuhr: values[CSV_COLUMNS.ZUHR] || FALLBACK_VALUES.TIME,
                        asr: values[CSV_COLUMNS.ASR] || FALLBACK_VALUES.TIME,
                        maghrib: values[CSV_COLUMNS.MAGHRIB] || FALLBACK_VALUES.TIME,
                        isha: values[CSV_COLUMNS.ISHA] || FALLBACK_VALUES.TIME,
                        ...this.jumuahTimes // Add Jumuah times to each day
                    };

                    this.prayerTimesData.push(prayerData);
                }
            }
        }

        logger.success('Daily prayer times parsed', this.prayerTimesData.length);
    }

    /**
     * Validate parsed data
     */
    validateParsedData() {
        if (!this.prayerTimesData || this.prayerTimesData.length === 0) {
            throw new Error('No prayer times data parsed');
        }

        const firstRow = this.prayerTimesData[0];
        const requiredFields = ['month', 'day', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        
        for (let field of requiredFields) {
            if (!isValidValue(firstRow[field])) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        logger.success('Parsed data validation passed');
        return true;
    }
}
