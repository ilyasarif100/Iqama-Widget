/**
 * Widget Manager Module
 * Coordinates widget creation and management
 */

import { logger } from '../utils/logger.js';
import { getConfig, validateConfig } from '../config/config.js';
import { DataFetcher } from '../data/sheet-fetcher.js';
import { DataParser } from '../data/csv-parser.js';
import { DataValidator } from '../data/data-validator.js';
import { CacheManager } from '../services/cache.js';
import { PrayerManager } from '../services/prayer-times.js';
import { WidgetRenderer } from './renderer.js';

export class WidgetManager {
    constructor() {
        this.config = null;
        this.dataFetcher = null;
        this.dataParser = null;
        this.validator = null;
        this.cacheManager = null;
        this.prayerManager = null;
        this.renderer = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the widget manager
     */
    async initialize() {
        logger.info('Initializing widget manager');
        
        try {
            // Get and validate configuration
            this.config = getConfig();
            validateConfig(this.config);
            
            // Initialize components
            this.dataFetcher = new DataFetcher();
            this.dataParser = new DataParser();
            this.validator = new DataValidator();
            this.cacheManager = new CacheManager(this.config.cacheDuration);
            this.renderer = new WidgetRenderer();
            
            // Set up data fetcher
            this.dataFetcher.setSheetId(this.config.googleSheetUrl);
            
            // Initialize prayer manager
            this.prayerManager = new PrayerManager(
                this.dataFetcher,
                this.dataParser,
                this.validator,
                this.cacheManager
            );
            
            this.isInitialized = true;
            logger.success('Widget manager initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize widget manager', error.message);
            throw error;
        }
    }

    /**
     * Create and inject the widget
     */
    async createWidget() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        logger.info('Creating widget');
        
        try {
            // Get prayer times
            const prayerTimes = await this.prayerManager.getPrayerTimesForToday();
            
            // Render widget HTML
            const widgetHTML = this.renderer.renderWidget(prayerTimes, this.config);
            
            // Inject widget into DOM
            this._injectWidget(widgetHTML);
            
            // Set up auto-refresh
            this._setupAutoRefresh();
            
            logger.success('Widget created and injected successfully');
            
        } catch (error) {
            logger.error('Failed to create widget', error.message);
            this._injectErrorWidget(error.message);
        }
    }

    /**
     * Inject widget HTML into the DOM
     */
    _injectWidget(widgetHTML) {
        // Try to find existing widget container
        let container = document.getElementById('iqama-widget-container');
        
        if (container) {
            logger.info('Found existing widget container');
            container.innerHTML = widgetHTML;
        } else {
            logger.info('No container found, creating new widget');
            
            // Create widget element
            const widgetElement = document.createElement('div');
            widgetElement.innerHTML = widgetHTML;
            
            // Try to insert after script tag
            const scripts = document.querySelectorAll('script[src*="iqama-widget-cloud.js"]');
            if (scripts.length > 0) {
                const script = scripts[scripts.length - 1];
                script.parentNode.insertBefore(widgetElement.firstElementChild, script.nextSibling);
            } else {
                // Fallback: append to body
                document.body.appendChild(widgetElement.firstElementChild);
            }
        }
    }

    /**
     * Inject error widget
     */
    _injectErrorWidget(errorMessage) {
        const errorHTML = `
            <div id="iqama-widget" style="
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                text-align: center;
            ">
                <h3 style="margin: 0 0 8px 0;">⚠️ Widget Error</h3>
                <p style="margin: 0; font-size: 14px;">${errorMessage}</p>
            </div>
        `;
        
        this._injectWidget(errorHTML);
    }

    /**
     * Set up auto-refresh
     */
    _setupAutoRefresh() {
        if (this.config.pollingInterval > 0) {
            logger.info('Setting up auto-refresh', this.config.pollingInterval);
            
            setInterval(async () => {
                try {
                    logger.info('Auto-refreshing widget data');
                    await this.prayerManager.refreshData();
                    await this.createWidget();
                } catch (error) {
                    logger.error('Auto-refresh failed', error.message);
                }
            }, this.config.pollingInterval);
        }
    }

    /**
     * Update widget configuration
     */
    updateConfig(newConfig) {
        logger.info('Updating widget configuration');
        
        this.config = {
            ...this.config,
            ...newConfig
        };
        
        validateConfig(this.config);
        
        // Reinitialize if Google Sheet URL changed
        if (newConfig.googleSheetUrl && newConfig.googleSheetUrl !== this.dataFetcher.sheetId) {
            this.dataFetcher.setSheetId(newConfig.googleSheetUrl);
        }
    }

    /**
     * Refresh widget data
     */
    async refreshWidget() {
        logger.info('Manually refreshing widget');
        
        try {
            await this.prayerManager.refreshData();
            await this.createWidget();
        } catch (error) {
            logger.error('Widget refresh failed', error.message);
            throw error;
        }
    }

    /**
     * Destroy widget and cleanup
     */
    destroy() {
        logger.info('Destroying widget manager');
        
        if (this.cacheManager) {
            this.cacheManager.destroy();
        }
        
        // Remove widget from DOM
        const widget = document.getElementById('iqama-widget');
        if (widget) {
            widget.remove();
        }
        
        this.isInitialized = false;
        logger.info('Widget manager destroyed');
    }
}

// Global function for backward compatibility
export async function createWidget() {
    const manager = new WidgetManager();
    await manager.createWidget();
    return manager;
}
