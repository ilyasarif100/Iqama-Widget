/**
 * Data Validator Module
 * Validates data integrity throughout the application
 */

import { logger } from '../utils/logger.js';
import { isValidValue } from '../utils/utils.js';
import { FALLBACK_VALUES } from '../config/constants.js';

export class DataValidator {
    /**
     * Validate Jumuah times
     */
    validateJumuahTimes(jumuahTimes) {
        logger.info('Validating Jumuah times');
        
        if (!jumuahTimes) {
            logger.error('Jumuah times object is null or undefined');
            return false;
        }

        const required = ['jumuah1', 'jumuah2', 'jumuah3'];
        const missing = required.filter(key => !isValidValue(jumuahTimes[key]));
        
        if (missing.length > 0) {
            logger.error(`Missing Jumuah times: ${missing.join(', ')}`);
            return false;
        }

        // Check if times are in correct format (e.g., "1:00 PM - 1:30 PM")
        for (let key of required) {
            const time = jumuahTimes[key];
            if (time !== FALLBACK_VALUES.JUMAH_TIME && !time.includes(' - ')) {
                logger.error(`Invalid Jumuah time format for ${key}: ${time}`);
                return false;
            }
        }

        logger.success('Jumuah times validation passed');
        return true;
    }

    /**
     * Validate prayer data for a specific day
     */
    validatePrayerData(prayerData) {
        logger.info('Validating prayer data for day', prayerData);
        
        if (!prayerData) {
            logger.error('Prayer data is null or undefined');
            return false;
        }

        const required = ['month', 'day', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const missing = required.filter(key => !isValidValue(prayerData[key]));
        
        if (missing.length > 0) {
            logger.error(`Missing prayer data: ${missing.join(', ')}`);
            return false;
        }

        // Validate month and day are numbers
        if (isNaN(prayerData.month) || isNaN(prayerData.day)) {
            logger.error('Month and day must be numbers');
            return false;
        }

        // Validate month is between 1-12
        if (prayerData.month < 1 || prayerData.month > 12) {
            logger.error(`Invalid month: ${prayerData.month}`);
            return false;
        }

        // Validate day is between 1-31
        if (prayerData.day < 1 || prayerData.day > 31) {
            logger.error(`Invalid day: ${prayerData.day}`);
            return false;
        }

        logger.info('Prayer data validation passed');
        return true;
    }

    /**
     * Validate prayer times array
     */
    validatePrayerTimesArray(prayerTimesData) {
        logger.info('Validating prayer times array');
        
        if (!Array.isArray(prayerTimesData)) {
            logger.error('Prayer times data is not an array');
            return false;
        }

        if (prayerTimesData.length === 0) {
            logger.error('Prayer times array is empty');
            return false;
        }

        // Validate first few entries
        const sampleSize = Math.min(5, prayerTimesData.length);
        for (let i = 0; i < sampleSize; i++) {
            if (!this.validatePrayerData(prayerTimesData[i])) {
                logger.error(`Validation failed for prayer data at index ${i}`);
                return false;
            }
        }

        logger.success('Prayer times array validation passed', {
            totalDays: prayerTimesData.length,
            sampleValidated: sampleSize
        });

        return true;
    }

    /**
     * Validate configuration
     */
    validateConfig(config) {
        logger.info('Validating configuration');
        
        if (!config) {
            logger.error('Configuration is null or undefined');
            return false;
        }

        const required = ['googleSheetUrl', 'title', 'location'];
        const missing = required.filter(key => !isValidValue(config[key]));
        
        if (missing.length > 0) {
            logger.error(`Missing required configuration: ${missing.join(', ')}`);
            return false;
        }

        // Validate Google Sheet URL format
        if (!config.googleSheetUrl.includes('docs.google.com/spreadsheets')) {
            logger.error('Invalid Google Sheet URL format');
            return false;
        }

        // Validate jumuahCount is a number between 1-3
        if (isNaN(config.jumuahCount) || config.jumuahCount < 1 || config.jumuahCount > 3) {
            logger.error(`Invalid jumuahCount: ${config.jumuahCount}`);
            return false;
        }

        logger.success('Configuration validation passed');
        return true;
    }

    /**
     * Validate complete data set
     */
    validateCompleteDataSet(data) {
        logger.info('Validating complete data set');
        
        if (!data) {
            logger.error('Data set is null or undefined');
            return false;
        }

        const { jumuahTimes, prayerTimesData } = data;

        // Validate Jumuah times
        if (!this.validateJumuahTimes(jumuahTimes)) {
            return false;
        }

        // Validate prayer times array
        if (!this.validatePrayerTimesArray(prayerTimesData)) {
            return false;
        }

        logger.success('Complete data set validation passed');
        return true;
    }
}
