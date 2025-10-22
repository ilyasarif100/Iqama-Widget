/**
 * Data Parser Module
 * Handles parsing CSV data into structured prayer times
 */

import { logger } from '../utils/logger.js';
import { parseCSVLine, isValidValue } from '../utils/utils.js';
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
        logger.info('CSV split into lines', lines.length);

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
                        
                        logger.info(`Parsed Jumuah ${i}`, jumuahTime);
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
                
                if (values.length >= CSV_COLUMNS.JUMAH_END + 1) {
                    // Parse athan times
                    const fajrAthan = values[CSV_COLUMNS.FAJR_ATHAN] || FALLBACK_VALUES.TIME;
                    const dhuhrAthan = values[CSV_COLUMNS.ZUHR_ATHAN] || FALLBACK_VALUES.TIME;
                    const asrAthan = values[CSV_COLUMNS.ASR_ATHAN] || FALLBACK_VALUES.TIME;
                    const maghribAthan = values[CSV_COLUMNS.MAGHRIB_ATHAN] || FALLBACK_VALUES.TIME;
                    const ishaAthan = values[CSV_COLUMNS.ISHA_ATHAN] || FALLBACK_VALUES.TIME;

                    // Parse iqama times
                    let fajrIqama = values[CSV_COLUMNS.FAJR_IQAMA] || FALLBACK_VALUES.TIME;
                    let dhuhrIqama = values[CSV_COLUMNS.ZUHR_IQAMA] || FALLBACK_VALUES.TIME;
                    let asrIqama = values[CSV_COLUMNS.ASR_IQAMA] || FALLBACK_VALUES.TIME;
                    let maghribIqama = values[CSV_COLUMNS.MAGHRIB_IQAMA] || FALLBACK_VALUES.TIME;
                    let ishaIqama = values[CSV_COLUMNS.ISHA_IQAMA] || FALLBACK_VALUES.TIME;

                    // Debug: Log the first row to see what data we're getting
                    if (i === 4) { // First data row
                        logger.info('DEBUG: First row data', {
                            fajrAthan: values[CSV_COLUMNS.FAJR_ATHAN],
                            fajrIqama: values[CSV_COLUMNS.FAJR_IQAMA],
                            dhuhrAthan: values[CSV_COLUMNS.ZUHR_ATHAN],
                            dhuhrIqama: values[CSV_COLUMNS.ZUHR_IQAMA],
                            valuesLength: values.length,
                            allValues: values
                        });
                    }

                    // Apply iqama offset logic if offset is specified
                    const iqamaOffset = values[CSV_COLUMNS.IQAMA_OFFSET];
                    if (iqamaOffset && iqamaOffset.trim() !== '') {
                        const offsetMinutes = parseInt(iqamaOffset);
                        if (!isNaN(offsetMinutes)) {
                            // Apply offset to all prayers
                            fajrIqama = this._addMinutesToTime(fajrAthan, offsetMinutes);
                            dhuhrIqama = this._addMinutesToTime(dhuhrAthan, offsetMinutes);
                            asrIqama = this._addMinutesToTime(asrAthan, offsetMinutes);
                            maghribIqama = this._addMinutesToTime(maghribAthan, offsetMinutes);
                            ishaIqama = this._addMinutesToTime(ishaAthan, offsetMinutes);
                        }
                    }

                    const prayerData = {
                        month: parseInt(values[CSV_COLUMNS.MONTH]),
                        day: parseInt(values[CSV_COLUMNS.DAY]),
                        // Athan times
                        fajrAthan: fajrAthan,
                        dhuhrAthan: dhuhrAthan,
                        asrAthan: asrAthan,
                        maghribAthan: maghribAthan,
                        ishaAthan: ishaAthan,
                        // Iqama times
                        fajrIqama: fajrIqama,
                        dhuhrIqama: dhuhrIqama,
                        asrIqama: asrIqama,
                        maghribIqama: maghribIqama,
                        ishaIqama: ishaIqama,
                        // Backward compatibility (use athan times as default)
                        fajr: fajrAthan,
                        dhuhr: dhuhrAthan,
                        asr: asrAthan,
                        maghrib: maghribAthan,
                        isha: ishaAthan,
                        ...this.jumuahTimes // Add Jumuah times to each day
                    };

                    this.prayerTimesData.push(prayerData);
                }
            }
        }

        logger.success('Daily prayer times parsed', this.prayerTimesData.length);
    }

    /**
     * Add minutes to a time string and return formatted result
     */
    _addMinutesToTime(timeString, minutes) {
        if (!timeString || timeString.includes('--:--')) {
            return FALLBACK_VALUES.TIME;
        }

        try {
            // Parse time string (e.g., "4:25 AM" or "16:25")
            const is12Hour = timeString.includes('AM') || timeString.includes('PM');
            let timePart = timeString.replace(/\s*(AM|PM)/i, '');
            const period = timeString.match(/(AM|PM)/i)?.[0] || '';
            
            const [hours, mins] = timePart.split(':').map(Number);
            
            // Convert to 24-hour format for calculation
            let totalMinutes = hours * 60 + mins + minutes;
            
            // Handle day overflow/underflow
            if (totalMinutes < 0) {
                totalMinutes += 24 * 60; // Add a day
            } else if (totalMinutes >= 24 * 60) {
                totalMinutes -= 24 * 60; // Subtract a day
            }
            
            const newHours = Math.floor(totalMinutes / 60);
            const newMins = totalMinutes % 60;
            
            // Format back to original format
            if (is12Hour) {
                let displayHours = newHours;
                let displayPeriod = period;
                
                if (newHours === 0) {
                    displayHours = 12;
                    displayPeriod = 'AM';
                } else if (newHours < 12) {
                    displayPeriod = 'AM';
                } else if (newHours === 12) {
                    displayPeriod = 'PM';
                } else {
                    displayHours = newHours - 12;
                    displayPeriod = 'PM';
                }
                
                return `${displayHours}:${newMins.toString().padStart(2, '0')} ${displayPeriod}`;
            } else {
                return `${newHours}:${newMins.toString().padStart(2, '0')}`;
            }
        } catch (error) {
            logger.info('Error adding minutes to time', { timeString, minutes, error: error.message });
            return FALLBACK_VALUES.TIME;
        }
    }

    /**
     * Validate parsed data
     */
    validateParsedData() {
        if (!this.prayerTimesData || this.prayerTimesData.length === 0) {
            throw new Error('No prayer times data parsed');
        }

        const firstRow = this.prayerTimesData[0];
        const requiredFields = [
            'month', 'day', 
            'fajrAthan', 'dhuhrAthan', 'asrAthan', 'maghribAthan', 'ishaAthan',
            'fajrIqama', 'dhuhrIqama', 'asrIqama', 'maghribIqama', 'ishaIqama'
        ];
        
        for (let field of requiredFields) {
            if (!isValidValue(firstRow[field])) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        logger.success('Parsed data validation passed');
        return true;
    }
}
