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
        
        // Debug announcement values
        console.log('🔍 Announcement Debug:', {
            prayerTimesAnnouncement: `"${prayerTimes.announcement}"`,
            configAnnouncement: `"${config.announcement}"`,
            finalAnnouncement: `"${prayerTimes.announcement || config.announcement || 'Default Hadith'}"`
        });
        
        this.cardColors = this._getCardColors(config.backgroundColor);
        const textColor = this._getContrastingTextColor(config.backgroundColor);
        
        const widgetHTML = this._generateWidgetHTML(prayerTimes, config, textColor);
        
        // Calculate dynamic scroll duration based on text length
        setTimeout(() => {
            const textElement = document.querySelector('.description-text');
            const containerElement = document.querySelector('.description-card');
            if (textElement && containerElement) {
                const textWidth = textElement.offsetWidth;
                const containerWidth = containerElement.offsetWidth;
                
                // Calculate total distance: text width + container width for seamless loop
                const totalDistance = textWidth + containerWidth;
                
                // Based on your perfect example:
                // Text: "Masjid will be closed 11/7 from Isha to 11/8 Asr " (35 seconds)
                // Calculate proportional duration for any text length
                
                // Estimate character count (rough approximation)
                const estimatedChars = Math.max(20, textWidth / 8); // ~8px per character
                
                // Scale duration based on character count
                // Your example: ~50 chars = 35 seconds, but make it 75% faster
                // Formula: (chars / 50) * 35 * 0.25 (75% faster = 25% of original time)
                // Add 1 second to ensure complete scroll-off
                const baseChars = 50;
                const baseDuration = 35;
                const speedMultiplier = 0.25; // 75% faster
                const scaledDuration = (estimatedChars / baseChars) * baseDuration * speedMultiplier + 1;
                
                // Apply reasonable bounds
                const finalDuration = Math.max(20, Math.min(80, scaledDuration));
                
                // Apply the calculated duration
                textElement.style.animationDuration = finalDuration + 's';
            }
        }, 100);
        
        logger.success('Widget HTML rendered');
        return widgetHTML;
    }

    /**
     * Generate the main widget HTML
     */
    _generateWidgetHTML(prayerTimes, config, textColor) {
        const title = config.title || 'Prayer Times';
        const location = config.location || 'Location';
        
        // Determine time type label based on configuration
        let timeTypeLabel;
        if (config.timeType === PRAYER_TYPES.ATHAN) {
            timeTypeLabel = 'Athan Times';
        } else if (config.timeType === PRAYER_TYPES.IQAMA) {
            timeTypeLabel = 'Iqama Times';
        } else if (config.timeType === PRAYER_TYPES.BOTH) {
            timeTypeLabel = 'Prayer Times';
        } else {
            timeTypeLabel = 'Prayer Times'; // Default fallback
        }
        
        return `
            <div id="iqama-widget" style="
                background: ${config.backgroundColor};
                color: ${textColor};
                border-radius: ${config.borderRadius};
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                width: 100%;
                box-sizing: border-box;
                margin: 0 auto;
                transform-origin: center top;
                zoom: 1;
            ">
                <style>
                    #iqama-widget * {
                        box-sizing: border-box;
                    }
                    
                    /* Handle browser zoom better and uniform mobile-style layout */
                    #iqama-widget {
                        min-width: 280px;
                        max-width: 600px;
                        width: 100%;
                        padding: 16px;
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        box-sizing: border-box;
                        margin: 0 auto;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    .prayer-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 14px 16px;
                        margin-bottom: 8px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 12px;
                        transition: all 0.2s ease;
                        min-height: 56px;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                        cursor: pointer;
                        user-select: none;
                    }
                    
                    .prayer-item:hover,
                    .prayer-item:active {
                        background: ${this.cardColors.background};
                        border-color: ${this.cardColors.borderActive};
                        transform: scale(0.98);
                    }
                    
                    .prayer-item:active {
                        transform: scale(0.95);
                    }
                    
                    .prayer-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .prayer-icon {
                        font-size: 18px;
                    }
                    
                    .prayer-name {
                        font-size: 15px;
                        font-weight: 600;
                        color: ${textColor};
                        flex-shrink: 0;
                    }
                    
                    .prayer-time {
                        font-size: 17px;
                        font-weight: 700;
                        color: ${textColor};
                        text-align: right;
                        flex-grow: 1;
                        margin-left: 10px;
                    }
                    
                    .jumuah-timeline {
                        display: flex;
                        gap: 10px;
                        margin-top: 16px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    
                    .jumuah-slot {
                        flex: 1;
                        min-width: 140px;
                        min-height: 70px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        padding: 12px 10px;
                        background: ${this.cardColors.backgroundActive};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 12px;
                        transition: all 0.2s ease;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                        cursor: pointer;
                        user-select: none;
                    }
                    
                    .jumuah-slot:hover,
                    .jumuah-slot:active {
                        background: ${this.cardColors.background};
                        border-color: ${this.cardColors.borderActive};
                        transform: scale(0.98);
                    }
                    
                    .jumuah-slot:active {
                        transform: scale(0.95);
                    }
                    
                    .jumuah-label {
                        font-size: 13px;
                        font-weight: 500;
                        color: ${textColor};
                        margin-bottom: 6px;
                        line-height: 1.2;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%;
                    }
                    
                    .jumuah-time {
                        font-size: 17px;
                        font-weight: 700;
                        color: ${textColor};
                        line-height: 1.1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%;
                    }
                    
                    @media (max-width: 480px) {
                        .jumuah-timeline {
                            flex-direction: column;
                            gap: 8px;
                        }
                        
                        .jumuah-slot {
                            min-width: auto;
                            min-height: 60px;
                            padding: 12px 8px;
                        }
                        
                        .jumuah-label {
                            font-size: 12px;
                            margin-bottom: 4px;
                        }
                        
                        .jumuah-time {
                            font-size: 16px;
                        }
                        
                        .prayer-item {
                            padding: 16px 14px;
                            min-height: 60px;
                        }
                        
                        /* Mobile responsive for dual display */
                        .prayer-header {
                            padding: 10px 12px;
                            font-size: 11px;
                        }
                        
                        .time-headers {
                            gap: 15px;
                        }
                        
                        .time-header {
                            min-width: 50px;
                        }
                        
                        .prayer-row {
                            padding: 12px 14px;
                        }
                        
                        .prayer-times {
                            gap: 15px;
                        }
                        
                        .time-value {
                            min-width: 50px;
                            font-size: 14px;
                        }
                    }
                    
                    @media (max-width: 360px) {
                        .jumuah-timeline {
                            gap: 6px;
                        }
                        
                        .jumuah-slot {
                            min-height: 55px;
                            padding: 10px 6px;
                        }
                        
                        .jumuah-label {
                            font-size: 11px;
                        }
                        
                        .jumuah-time {
                            font-size: 15px;
                        }
                        
                        .prayer-item {
                            padding: 14px 12px;
                            min-height: 55px;
                        }
                        
                        /* Mobile responsive for dual display - smaller screens */
                        .prayer-header {
                            padding: 8px 10px;
                            font-size: 10px;
                        }
                        
                        .time-headers {
                            gap: 12px;
                        }
                        
                        .time-header {
                            min-width: 45px;
                        }
                        
                        .prayer-row {
                            padding: 10px 12px;
                        }
                        
                        .prayer-times {
                            gap: 12px;
                        }
                        
                        .time-value {
                            min-width: 45px;
                            font-size: 13px;
                        }
                    }
                    
                    .description-card {
                        background: ${this.cardColors.background};
                        border: 1px solid ${this.cardColors.border};
                        border-radius: 12px;
                        padding: 16px;
                        margin-top: 20px;
                        text-align: center;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                        overflow: hidden;
                        position: relative;
                    }
                    
                    .description-text {
                        font-size: 14px;
                        color: ${textColor};
                        opacity: 0.8;
                        margin: 0;
                        white-space: nowrap;
                        display: inline-block;
                        animation: scrollText 15s linear infinite;
                    }
                    
                    @keyframes scrollText {
                        0% {
                            transform: translateX(0%);
                        }
                        100% {
                            transform: translateX(-100%);
                        }
                    }
                    
                    .description-text:hover {
                        animation-play-state: paused;
                    }
                    
                    /* Dual time display styles */
                    .prayer-times-table {
                        width: 100%;
                    }
                    
                    .prayer-header {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        margin-bottom: 8px;
                        font-weight: 600;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .time-headers {
                        display: flex;
                        gap: 20px;
                    }
                    
                    .time-header {
                        min-width: 60px;
                        text-align: center;
                    }
                    
                    .prayer-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 14px 16px;
                        margin-bottom: 6px;
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 8px;
                        transition: all 0.2s ease;
                    }
                    
                    .prayer-row:hover {
                        background: rgba(255, 255, 255, 0.12);
                    }
                    
                    .prayer-times {
                        display: flex;
                        gap: 20px;
                    }
                    
                    .time-value {
                        min-width: 60px;
                        text-align: center;
                        font-size: 15px;
                        font-weight: 500;
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
                    
                    ${this._renderPrayerTimes(prayerTimes, textColor, config)}
                </div>
                
                ${this._renderJumuahSection(prayerTimes, config.jumuahCount, textColor)}
                
                ${this._renderAstronomicalSection(prayerTimes, textColor)}
                
                <div class="description-card">
                    <p class="description-text" data-text="${prayerTimes.announcement || config.announcement || 'The Prophet صلى الله عليه وسلم said: "Prayer in congregation is twenty-seven times more rewarding than prayer prayed alone." — Sahih al-Bukhari 645, Sahih Muslim 650'}">
                        ${prayerTimes.announcement || config.announcement || 'The Prophet صلى الله عليه وسلم said: "Prayer in congregation is twenty-seven times more rewarding than prayer prayed alone." — Sahih al-Bukhari 645, Sahih Muslim 650'}
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Render prayer times section
     */
        _renderPrayerTimes(prayerTimes, textColor, config) {
            const prayers = [
                { name: 'Fajr', icon: '' },
                { name: 'Dhuhr', icon: '' },
                { name: 'Asr', icon: '' },
                { name: 'Maghrib', icon: '' },
                { name: 'Isha', icon: '' }
            ];

        // Check if we have dual time data (athan and iqama)
        const hasDualTimes = config.timeType === PRAYER_TYPES.BOTH;

        if (hasDualTimes) {
            // Render dual time display with column headers
            return `
                <div class="prayer-times-table">
                    <div class="prayer-header">
                        <div class="prayer-name-header">Prayer</div>
                        <div class="time-headers">
                            <div class="time-header">Athan</div>
                            <div class="time-header">Iqama</div>
                        </div>
                    </div>
                    ${prayers.map(prayer => {
                        const prayerKey = prayer.name.toLowerCase();
                        const athanTime = prayerTimes[`${prayerKey}Athan`] || prayerTimes[prayerKey] || '--:--';
                        const iqamaTime = prayerTimes[`${prayerKey}Iqama`] || '--:--';
                        
                        return `
                            <div class="prayer-row">
                                <div class="prayer-info">
                                    <span class="prayer-icon">${prayer.icon}</span>
                                    <span class="prayer-name">${prayer.name}</span>
                                </div>
                                <div class="prayer-times">
                                    <div class="time-value">${athanTime}</div>
                                    <div class="time-value">${iqamaTime}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            // Render single time display (current behavior)
            return prayers.map(prayer => {
                const prayerKey = prayer.name.toLowerCase();
                let time;
                
                if (config.timeType === PRAYER_TYPES.IQAMA) {
                    time = prayerTimes[`${prayerKey}Iqama`] || '--:--';
                } else {
                    time = prayerTimes[`${prayerKey}Athan`] || prayerTimes[prayerKey] || '--:--';
                }
                
                return `
                    <div class="prayer-item">
                        <div class="prayer-info">
                            <span class="prayer-icon">${prayer.icon}</span>
                            <span class="prayer-name">${prayer.name}</span>
                        </div>
                        <span class="prayer-time">${time}</span>
                    </div>
                `;
            }).join('');
        }
    }

    /**
     * Format Jumuah time range to compact format
     */
    _formatJumuahTime(timeString) {
        if (!timeString || timeString.includes('--:--')) {
            return timeString;
        }
        
        // Handle format like "1:01 PM - 1:30 PM"
        const parts = timeString.split(' - ');
        if (parts.length === 2) {
            const startTime = parts[0];
            const endTime = parts[1];
            
            // Extract AM/PM from end time
            const period = endTime.includes('AM') ? 'AM' : 'PM';
            
            // Remove AM/PM from start time
            const startClean = startTime.replace(/\s*(AM|PM)/, '');
            
            return `${startClean}-${endTime}`;
        }
        
        return timeString; // Fallback to original
    }

    /**
     * Render Jumuah section
     */
    _renderJumuahSection(prayerTimes, jumuahCount, textColor) {
        if (jumuahCount === 0) {
            return '';
        }

        const jumuahTimes = [
            { name: jumuahCount === 1 ? 'Jumuah Prayer' : '1st Jumuah', time: prayerTimes.jumuah1 },
            { name: '2nd Jumuah', time: prayerTimes.jumuah2 },
            { name: '3rd Jumuah', time: prayerTimes.jumuah3 }
        ].slice(0, jumuahCount);

        return `
            <div style="margin-bottom: 20px;">
                <h3 style="
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: ${textColor};
                ">Jumuah Prayers</h3>
                
                <div class="jumuah-timeline">
                    ${jumuahTimes.map(jumuah => `
                        <div class="jumuah-slot">
                            <div class="jumuah-label">${jumuah.name}</div>
                            <div class="jumuah-time">${this._formatJumuahTime(jumuah.time)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render astronomical section (Sunrise and Sunset) - exactly like Jumuah
     */
    _renderAstronomicalSection(prayerTimes, textColor) {
        const sunrise = prayerTimes.sunrise || '--:--';
        const sunset = prayerTimes.maghribAthan || prayerTimes.maghrib || '--:--';

        const astronomicalTimes = [
            { name: 'Sunrise', time: sunrise },
            { name: 'Sunset', time: sunset }
        ];

        return `
            <div style="margin-bottom: 20px;">
                <h3 style="
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: ${textColor};
                ">Sun Times</h3>
                
                <div class="jumuah-timeline">
                    ${astronomicalTimes.map(astro => `
                        <div class="jumuah-slot">
                            <div class="jumuah-label">${astro.name}</div>
                            <div class="jumuah-time">${astro.time}</div>
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
     * Get contrasting text color (white for dark backgrounds, black for light backgrounds)
     */
    _getContrastingTextColor(backgroundColor) {
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128 ? '#ffffff' : '#000000';
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
