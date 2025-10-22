/**
 * Data Fetcher Module
 * Handles fetching CSV data from Google Sheets
 */

import { logger } from '../utils/logger.js';
import { extractSheetId } from '../utils/utils.js';

export class DataFetcher {
    constructor() {
        this.sheetId = null;
    }

    /**
     * Set the Google Sheet ID or local file path
     */
    setSheetId(sheetUrl) {
        // Check if it's a local file (no http/https protocol)
        if (!sheetUrl.startsWith('http')) {
            this.sheetId = sheetUrl; // Store as local file path
            logger.info('Using local CSV file', sheetUrl);
            return;
        }
        
        // Extract Google Sheet ID from URL
        this.sheetId = extractSheetId(sheetUrl);
        if (!this.sheetId) {
            throw new Error('Invalid Google Sheet URL');
        }
        logger.success('Sheet ID set', this.sheetId);
    }

    /**
     * Fetch CSV data from Google Sheets or local file
     */
    async fetchCSV() {
        if (!this.sheetId) {
            throw new Error('Sheet ID not set');
        }

        // Check if it's a local file
        if (!this.sheetId.startsWith('http')) {
            logger.info('Fetching CSV data from local file');
            return await this._fetchLocalFile();
        }

        logger.info('Fetching CSV data from Google Sheets');

        let csvText = '';

        try {
            // Method 1: Try Google Visualization API (most reliable)
            csvText = await this._fetchWithGoogleViz();
            logger.success('Successfully fetched data using Google Visualization API');
        } catch (error) {
            logger.warn('Google Visualization API failed, trying direct CSV export', error.message);
            
            try {
                // Method 2: Try direct CSV export
                csvText = await this._fetchWithDirectExport();
                logger.success('Successfully fetched data using direct CSV export');
            } catch (error2) {
                logger.error('Both fetch methods failed', error2.message);
                throw new Error('Could not fetch data from Google Sheets');
            }
        }

        return csvText;
    }

    /**
     * Fetch using Google Visualization API
     */
    async _fetchWithGoogleViz() {
        const url = `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv`;
        
        const response = await fetch(url, {
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.text();
    }

    /**
     * Fetch using direct CSV export
     */
    async _fetchWithDirectExport() {
        const url = `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv`;
        
        const response = await fetch(url, {
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.text();
    }

    /**
     * Fetch CSV data from local file
     */
    async _fetchLocalFile() {
        try {
            const response = await fetch(this.sheetId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const csvText = await response.text();
            logger.success('Successfully fetched local CSV file');
            return csvText;
        } catch (error) {
            logger.error('Failed to fetch local CSV file', error.message);
            throw error;
        }
    }

    /**
     * Validate that the fetched CSV data is valid
     */
    validateCSVData(csvText) {
        if (!csvText || csvText.trim().length === 0) {
            throw new Error('Empty CSV data received');
        }

        const lines = csvText.split('\n');
        if (lines.length < 2) {
            throw new Error('CSV data must have at least 2 lines (header + data)');
        }

        logger.success('CSV data validation passed', {
            lines: lines.length,
            firstLine: lines[0]
        });

        return true;
    }
}
