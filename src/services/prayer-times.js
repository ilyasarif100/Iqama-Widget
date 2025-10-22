/**
 * Prayer Manager Module
 * Core business logic for prayer times management
 */

import { logger } from '../utils/logger.js';
import { getCurrentDateInfo, getTomorrowDateInfo } from '../utils/utils.js';
import { FALLBACK_VALUES } from '../config/constants.js';

export class PrayerManager {
    constructor(dataFetcher, dataParser, dataValidator, cacheManager) {
        this.dataFetcher = dataFetcher;
        this.dataParser = dataParser;
        this.validator = dataValidator;
        this.cacheManager = cacheManager;
        this.prayerTimesData = [];
    }

    /**
     * Fetch and parse prayer times data
     */
    async fetchPrayerTimes(forceRefresh = false) {
        logger.info('Starting prayer times fetch process', { forceRefresh });
        
        try {
            // Check cache first (unless forcing refresh)
            const cached = this.cacheManager.getPrayerTimes(this.dataFetcher.sheetId, forceRefresh);
            if (cached) {
                logger.success('Using cached prayer times data');
                this.prayerTimesData = cached;
                return;
            }

            logger.info('Cache miss, fetching fresh data');

            // Fetch CSV data
            const csvText = await this.dataFetcher.fetchCSV();
            this.dataFetcher.validateCSVData(csvText);

            // Parse CSV data
            const parsedData = this.dataParser.parseCSV(csvText);
            this.validator.validateCompleteDataSet(parsedData);

            // Store parsed data
            this.prayerTimesData = parsedData.prayerTimesData;

            // Cache the data
            this.cacheManager.setPrayerTimes(this.dataFetcher.sheetId, this.prayerTimesData);

            logger.success('Prayer times fetch process completed', {
                totalDays: this.prayerTimesData.length
            });

        } catch (error) {
            logger.error('Failed to fetch prayer times', error.message);
            throw error;
        }
    }

    /**
     * Get prayer times for a specific date
     */
    async getPrayerTimesForDate(date = null, forceRefresh = false) {
        await this.fetchPrayerTimes(forceRefresh);

        const targetDate = date || getCurrentDateInfo();
        logger.info('Getting prayer times for date', targetDate);

        // Find matching prayer times for the target date
        const dateData = this.prayerTimesData.find(row => 
            row.month === targetDate.month && row.day === targetDate.day
        );

        let prayerTimes = {};

        if (dateData) {
            logger.success('Found prayer times for target date');
            prayerTimes = {
                // Athan times
                fajrAthan: dateData.fajrAthan,
                sunrise: dateData.sunrise,
                dhuhrAthan: dateData.dhuhrAthan,
                asrAthan: dateData.asrAthan,
                maghribAthan: dateData.maghribAthan,
                ishaAthan: dateData.ishaAthan,
                // Iqama times
                fajrIqama: dateData.fajrIqama,
                dhuhrIqama: dateData.dhuhrIqama,
                asrIqama: dateData.asrIqama,
                maghribIqama: dateData.maghribIqama,
                ishaIqama: dateData.ishaIqama,
                // Announcement from CSV
                announcement: dateData.announcement || '',
                // Backward compatibility
                fajr: dateData.fajr,
                dhuhr: dateData.dhuhr,
                asr: dateData.asr,
                maghrib: dateData.maghrib,
                isha: dateData.isha,
                // Jumuah times
                jumuah1: dateData.jumuah1,
                jumuah2: dateData.jumuah2,
                jumuah3: dateData.jumuah3,
                tomorrowFajr: this._getTomorrowFajr(targetDate)
            };
        } else {
            logger.warn('No prayer times found for target date, using first row as demo data');
            const demoData = this.prayerTimesData[0];
            
            if (!demoData) {
                logger.error('No prayer data available');
                throw new Error('No prayer data available');
            }

            prayerTimes = {
                // Athan times
                fajrAthan: demoData.fajrAthan || FALLBACK_VALUES.TIME,
                sunrise: demoData.sunrise || FALLBACK_VALUES.TIME,
                dhuhrAthan: demoData.dhuhrAthan || FALLBACK_VALUES.TIME,
                asrAthan: demoData.asrAthan || FALLBACK_VALUES.TIME,
                maghribAthan: demoData.maghribAthan || FALLBACK_VALUES.TIME,
                ishaAthan: demoData.ishaAthan || FALLBACK_VALUES.TIME,
                // Iqama times
                fajrIqama: demoData.fajrIqama || FALLBACK_VALUES.TIME,
                dhuhrIqama: demoData.dhuhrIqama || FALLBACK_VALUES.TIME,
                asrIqama: demoData.asrIqama || FALLBACK_VALUES.TIME,
                maghribIqama: demoData.maghribIqama || FALLBACK_VALUES.TIME,
                ishaIqama: demoData.ishaIqama || FALLBACK_VALUES.TIME,
                // Announcement from CSV
                announcement: demoData.announcement || '',
                // Backward compatibility
                fajr: demoData.fajr || FALLBACK_VALUES.TIME,
                dhuhr: demoData.dhuhr || FALLBACK_VALUES.TIME,
                asr: demoData.asr || FALLBACK_VALUES.TIME,
                maghrib: demoData.maghrib || FALLBACK_VALUES.TIME,
                isha: demoData.isha || FALLBACK_VALUES.TIME,
                jumuah1: demoData.jumuah1 || FALLBACK_VALUES.JUMAH_TIME,
                jumuah2: demoData.jumuah2 || FALLBACK_VALUES.JUMAH_TIME,
                jumuah3: demoData.jumuah3 || FALLBACK_VALUES.JUMAH_TIME,
                tomorrowFajr: demoData.fajr || FALLBACK_VALUES.TIME
            };
        }

        logger.success('Prayer times retrieved', prayerTimes);
        return prayerTimes;
    }

    /**
     * Get prayer times for today
     */
    async getPrayerTimesForToday() {
        return await this.getPrayerTimesForDate();
    }

    /**
     * Get tomorrow's Fajr time
     */
    _getTomorrowFajr(currentDate) {
        const tomorrowDate = getTomorrowDateInfo();
        
        const tomorrowData = this.prayerTimesData.find(row => 
            row.month === tomorrowDate.month && row.day === tomorrowDate.day
        );

        if (tomorrowData) {
            return tomorrowData.fajr;
        }

        // Fallback to current day's Fajr
        const todayData = this.prayerTimesData.find(row => 
            row.month === currentDate.month && row.day === currentDate.day
        );

        return todayData ? todayData.fajr : FALLBACK_VALUES.TIME;
    }

    /**
     * Get prayer status (current/next prayer)
     */
    getPrayerStatus(prayerTimes) {
        logger.info('Calculating prayer status');
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayers = [
            { name: 'fajr', time: this._timeToMinutes(prayerTimes.fajr) },
            { name: 'dhuhr', time: this._timeToMinutes(prayerTimes.dhuhr) },
            { name: 'asr', time: this._timeToMinutes(prayerTimes.asr) },
            { name: 'maghrib', time: this._timeToMinutes(prayerTimes.maghrib) },
            { name: 'isha', time: this._timeToMinutes(prayerTimes.isha) }
        ];

        // Sort prayers by time
        prayers.sort((a, b) => a.time - b.time);

        // Find current and next prayer
        let currentPrayer = null;
        let nextPrayer = null;

        for (let i = 0; i < prayers.length; i++) {
            if (currentTime >= prayers[i].time) {
                currentPrayer = prayers[i];
                nextPrayer = prayers[(i + 1) % prayers.length];
            }
        }

        // If no current prayer found, next prayer is Fajr
        if (!currentPrayer) {
            nextPrayer = prayers[0];
        }

        const status = {
            currentPrayer: currentPrayer?.name || null,
            nextPrayer: nextPrayer?.name || 'fajr',
            nextPrayerTime: nextPrayer?.time || prayers[0].time
        };

        logger.info('Prayer status calculated', status);
        return status;
    }

    /**
     * Convert time string to minutes
     */
    _timeToMinutes(timeString) {
        if (!timeString || timeString === FALLBACK_VALUES.TIME) {
            return 0;
        }

        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        
        let totalMinutes = hours * 60 + minutes;
        
        if (period === 'PM' && hours !== 12) {
            totalMinutes += 12 * 60;
        } else if (period === 'AM' && hours === 12) {
            totalMinutes -= 12 * 60;
        }
        
        return totalMinutes;
    }

    /**
     * Clear cache and force fresh data fetch
     */
    async refreshData() {
        logger.info('Refreshing prayer times data');
        this.cacheManager.clear();
        await this.fetchPrayerTimes();
    }
}
