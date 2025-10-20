/**
 * Widget Renderer Module
 * Handles rendering the prayer times widget HTML
 */

import { logger } from '../utils/logger.js';
import { PRAYER_TYPES } from '../config/constants.js';

export class WidgetRenderer {
    constructor() {
        this.cardColors = {};
    }

    /**
     * Render the complete widget HTML
     */
    renderWidget(prayerTimes, config) {
        logger.info('Rendering widget HTML');
        
        this.cardColors = this._getCardColors(config.backgroundColor);
        const textColor = config.accentColor;
        
        const widgetHTML = this._generateWidgetHTML(prayerTimes, config, textColor);
        
        logger.success('Widget HTML rendered');
        return widgetHTML;
    }

    /**
     * Generate the main widget HTML
     */
    _generateWidgetHTML(prayerTimes, config, textColor) {
        const title = config.title || 'Prayer Times';
        const location = config.location || 'Location';
        const timeTypeLabel = config.timeType === PRAYER_TYPES.ATHAN ? '🕌 Athan Times' : '🕌 Iqama Times';
        
        return `
            <div id="iqama-widget" style="
                background: ${config.backgroundColor};
                color: ${textColor};
                border-radius: ${config.borderRadius};
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                max-width: 100%;
                box-sizing: border-box;
                margin: 0 auto;
            ">
                <style>
                    #iqama-widget * {
                        box-sizing: border-box;
                    }
                    
                    .prayer-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 16px;
                        margin-bottom: 8px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 8px;
                        transition: all 0.2s ease;
                    }
                    
                    .prayer-item:hover {
                        background: ${this.cardColors.background};
                        border-color: ${this.cardColors.borderActive};
                    }
                    
                    .prayer-name {
                        font-size: 16px;
                        font-weight: 600;
                        color: ${textColor};
                    }
                    
                    .prayer-time {
                        font-size: 18px;
                        font-weight: 700;
                        color: ${textColor};
                    }
                    
                    .jumuah-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        margin-top: 12px;
                    }
                    
                    .jumuah-item {
                        padding: 8px 6px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 8px;
                    }
                    
                    .jumuah-name {
                        font-size: 16px;
                        font-weight: 600;
                        color: ${textColor};
                        margin-bottom: 6px;
                    }
                    
                    .jumuah-time {
                        font-size: 18px;
                        font-weight: 700;
                        color: ${textColor};
                    }
                    
                    .description-card {
                        background: ${this.cardColors.background};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 8px;
                        padding: 12px;
                        margin-top: 16px;
                        text-align: center;
                    }
                    
                    .description-text {
                        font-size: 14px;
                        color: ${textColor};
                        opacity: 0.8;
                    }
                </style>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="
                        margin: 0 0 8px 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: ${textColor};
                    ">${title}</h2>
                    <p style="
                        margin: 0;
                        font-size: 16px;
                        color: ${textColor};
                        opacity: 0.8;
                    ">${location}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="
                        margin: 0 0 16px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: ${textColor};
                    ">${timeTypeLabel}</h3>
                    
                    ${this._renderPrayerTimes(prayerTimes, textColor)}
                </div>
                
                ${this._renderJumuahSection(prayerTimes, config.jumuahCount, textColor)}
                
                <div class="description-card">
                    <p class="description-text">
                        Times shown are when the Athan is announced
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Render prayer times section
     */
    _renderPrayerTimes(prayerTimes, textColor) {
        const prayers = [
            { name: 'Fajr', time: prayerTimes.fajr },
            { name: 'Dhuhr', time: prayerTimes.dhuhr },
            { name: 'Asr', time: prayerTimes.asr },
            { name: 'Maghrib', time: prayerTimes.maghrib },
            { name: 'Isha', time: prayerTimes.isha }
        ];

        return prayers.map(prayer => `
            <div class="prayer-item">
                <span class="prayer-name">${prayer.name}</span>
                <span class="prayer-time">${prayer.time}</span>
            </div>
        `).join('');
    }

    /**
     * Render Jumuah section
     */
    _renderJumuahSection(prayerTimes, jumuahCount, textColor) {
        if (jumuahCount === 0) {
            return '';
        }

        const jumuahTimes = [
            { name: '1st Jumuah Prayer', time: prayerTimes.jumuah1 },
            { name: '2nd Jumuah Prayer', time: prayerTimes.jumuah2 },
            { name: '3rd Jumuah Prayer', time: prayerTimes.jumuah3 }
        ].slice(0, jumuahCount);

        return `
            <div style="margin-bottom: 20px;">
                <h3 style="
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: ${textColor};
                ">Jumuah Prayers</h3>
                
                <div class="jumuah-grid">
                    ${jumuahTimes.map(jumuah => `
                        <div class="jumuah-item">
                            <div class="jumuah-name">${jumuah.name}</div>
                            <div class="jumuah-time">${jumuah.time}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Get card colors based on background color
     */
    _getCardColors(backgroundColor) {
        const isDark = this._isDarkColor(backgroundColor);
        
        return {
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            backgroundActive: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            border: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cccccc',
            borderActive: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)'
        };
    }

    /**
     * Check if a color is dark
     */
    _isDarkColor(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }
}
