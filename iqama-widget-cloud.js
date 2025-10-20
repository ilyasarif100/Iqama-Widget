(function() {
    // ========================================
    // CLOUD-HOSTED IQAMA WIDGET
    // ========================================
    // Super simple embed - just paste one script tag!
    // Automatically extracts Sheet ID from Google Sheet URL
    // ========================================
    
    // Configuration - users can modify these values
    const CONFIG = window.IqamaWidgetConfig || {
        // Google Sheets Configuration
        googleSheetUrl: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing',
        
        // Display Configuration
        title: 'Prayer Times',
        location: 'ICCP AZ',
        
        // Styling Configuration
        backgroundColor: '#1F2937',
        accentColor: '#E5E7EB',
        borderRadius: '20px',
        
        // Widget Configuration
        timeType: 'athan',
        jumuahCount: 1
    };
    
    // Extract Sheet ID from Google Sheet URL
    function extractSheetId(url) {
        if (!url) {
            return null;
        }
        
        // Handle different Google Sheets URL formats
        const patterns = [
            /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
            /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/,
            /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/view/
        ];
        
        for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
    
    // Get the actual Sheet ID
    const SHEET_ID = extractSheetId(CONFIG.googleSheetUrl);
    if (!SHEET_ID) {
        return;
    }
    
    let prayerTimesData = [];
    
    // ========================================
    // PERFORMANCE OPTIMIZATION CACHE
    // ========================================
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
    const prayerTimesCache = new Map();
    
    // Cache cleanup function
    function cleanupCache(cache) {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                cache.delete(key);
            }
        }
    }
    
    // ========================================
    // DATA FETCHING FUNCTIONS
    // ========================================
    
    /**
     * Fetches prayer times from Google Sheets with caching
     * Tries multiple endpoints for compatibility
     * @returns {Promise<void>}
     */
    async function fetchPrayerTimes() {
        try {
            // Check cache first
            const cacheKey = `prayer_times_${SHEET_ID}`;
            const cached = prayerTimesCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
                prayerTimesData = cached.data;
                return;
            }
            
            // Try multiple approaches to fetch data
            let csvText = '';
            
            // Method 1: Try Google Visualization API (most reliable)
            try {
                const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
                const response = await fetch(url, {
                    mode: 'cors',
                    cache: 'no-cache' // Force fresh data
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                csvText = await response.text();
            } catch (e) {
                // Method 2: Try direct CSV export
                try {
                    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
                    const response = await fetch(url, {
                        mode: 'cors',
                        cache: 'no-cache'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    csvText = await response.text();
                } catch (e2) {
                    throw new Error('Both methods failed');
                }
            }
            
            // Parse CSV data
            const lines = csvText.split('\n');
            
            prayerTimesData = [];
            let jumuahTimes = {
                jumuah1: '',
                jumuah2: '',
                jumuah3: ''
            };
            
            // First, extract Jumuah times from the first few rows
            for (let i = 1; i <= 3; i++) {
                if (lines[i] && lines[i].trim()) {
                    const values = lines[i].split(',').map(value => {
                        return value.replace(/^"/, '').replace(/"$/, '').trim();
                    });
                    
                    if (values.length >= 10) {
                        const jumuahLabel = values[7];  // Column H (0-indexed)
                        const jumuahStart = values[8];  // Column I (0-indexed) - Starts
                        const jumuahEnd = values[9];    // Column J (0-indexed) - Ends
                        
                        if (jumuahLabel === '1st Jumuah') {
                            jumuahTimes.jumuah1 = `${jumuahStart} - ${jumuahEnd}`;
                        } else if (jumuahLabel === '2nd Jumuah') {
                            jumuahTimes.jumuah2 = `${jumuahStart} - ${jumuahEnd}`;
                        } else if (jumuahLabel === '3rd Jumuah') {
                            jumuahTimes.jumuah3 = `${jumuahStart} - ${jumuahEnd}`;
                        }
                    }
                }
            }
            
            // If no Jumuah times found in CSV, use fallback times
            if (!jumuahTimes.jumuah1 && !jumuahTimes.jumuah2 && !jumuahTimes.jumuah3) {
                jumuahTimes.jumuah1 = '1:30 PM - 2:00 PM';
                jumuahTimes.jumuah2 = '2:30 PM - 3:00 PM';
                jumuahTimes.jumuah3 = '3:30 PM - 4:00 PM';
            }
            
            // Then parse daily prayer times (skip the first 3 rows which contain Jumuah data)
            for (let i = 4; i < lines.length; i++) {
                if (lines[i].trim()) {
                    // Handle quoted CSV values properly
                    const values = lines[i].split(',').map(value => {
                        // Remove quotes and trim
                        return value.replace(/^"/, '').replace(/"$/, '').trim();
                    });
                    
                    if (values.length >= 7) {
                        prayerTimesData.push({
                            month: parseInt(values[0]),
                            day: parseInt(values[1]),
                            fajr: values[2],
                            dhuhr: values[3],
                            asr: values[4],
                            maghrib: values[5],
                            isha: values[6],
                            ...jumuahTimes // Add Jumuah times to each day
                        });
                    }
                }
            }
            
            // Cache the data
            prayerTimesCache.set(cacheKey, {
                data: prayerTimesData,
                timestamp: Date.now()
            });
            
            // Cleanup old cache entries
            cleanupCache(prayerTimesCache);
            
            if (prayerTimesData.length > 0) {
                await getPrayerTimesForToday();
            }
        } catch (error) {
            // Fallback to default times if fetch fails
            prayerTimesData = [{
                month: 1,
                day: 1,
                fajr: "5:30 AM",
                dhuhr: "1:30 PM",
                jumuah1: "1:30 PM - 2:00 PM",
                jumuah2: "2:30 PM - 3:00 PM",
                jumuah3: "3:30 PM - 4:00 PM",
                asr: "4:45 PM",
                maghrib: "7:15 PM",
                isha: "8:45 PM"
            }];
        }
    }
    
    // Get prayer times for current date and next day if needed
    async function getPrayerTimesForToday() {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        // Find matching prayer times for today
        const todayData = prayerTimesData.find(row => 
            row.month === currentMonth && row.day === currentDay
        );
        
        // Find matching prayer times for tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowMonth = tomorrow.getMonth() + 1;
        const tomorrowDay = tomorrow.getDate();
        
        const tomorrowData = prayerTimesData.find(row => 
            row.month === tomorrowMonth && row.day === tomorrowDay
        );
        
        let prayerTimes = {};
        
        if (todayData) {
            prayerTimes = {
                fajr: todayData.fajr,
                dhuhr: todayData.dhuhr,
                jumuah1: todayData.jumuah1,
                jumuah2: todayData.jumuah2,
                jumuah3: todayData.jumuah3,
                asr: todayData.asr,
                maghrib: todayData.maghrib,
                isha: todayData.isha,
                tomorrowFajr: tomorrowData?.fajr || todayData.fajr
            };
        } else {
            // Fallback to first row if today not found
            prayerTimes = {
                fajr: prayerTimesData[0]?.fajr || "5:30 AM",
                dhuhr: prayerTimesData[0]?.dhuhr || "1:30 PM",
                jumuah1: prayerTimesData[0]?.jumuah1 || "1:31 PM",
                jumuah2: prayerTimesData[0]?.jumuah2 || "2:30 PM",
                jumuah3: prayerTimesData[0]?.jumuah3 || "3:30 PM",
                asr: prayerTimesData[0]?.asr || "4:45 PM",
                maghrib: prayerTimesData[0]?.maghrib || "7:15 PM",
                isha: prayerTimesData[0]?.isha || "8:45 PM",
                tomorrowFajr: prayerTimesData[0]?.fajr || "5:30 AM"
            };
        }
        
        return prayerTimes;
    }

    // Get current time to determine next prayer
    function getCurrentTime() {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }

    function timeToMinutes(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') {
            return 0;
        }
        
        const [time, period] = timeStr.split(' ');
        if (!time || !period) {
            return 0;
        }
        
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            return 0;
        }
        
        let totalMinutes = hours * 60 + minutes;
        
        if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
        if (period === 'AM' && hours === 12) totalMinutes = minutes;
        
        return totalMinutes;
    }

    /**
     * Determines current and next prayer status based on current time
     * Implements 30-minute window for "current prayer" and Friday logic
     * @param {Object} iqamaTimes - Object containing prayer times
     * @returns {Object} Status object with current, next, status, and nextTime
     */
    function getPrayerStatus(iqamaTimes) {
        if (!iqamaTimes || typeof iqamaTimes !== 'object') {
            return { current: null, next: 'fajr', status: 'next', nextTime: '5:30 AM' };
        }
        
        const currentTime = getCurrentTime();
        const now = new Date();
        const isFriday = now.getDay() === 5;
        
        // Define prayer order - on Friday, replace Dhuhr with Jumuah
        let prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        if (isFriday) {
            // Use the first Jumuah time for Friday prayer order
            prayerOrder = ['fajr', 'jumuah1', 'asr', 'maghrib', 'isha'];
        }
        const prayerTimes = {};
        
        // Convert all prayer times to minutes for comparison
        for (let [prayer, time] of Object.entries(iqamaTimes)) {
            if (prayerOrder.includes(prayer)) {
                prayerTimes[prayer] = timeToMinutes(time);
            }
        }
        
        // Check for current prayer (within 30-minute window)
        let currentPrayer = null;
        for (let prayer of prayerOrder) {
            const prayerTime = prayerTimes[prayer];
            if (currentTime >= prayerTime && currentTime <= (prayerTime + 30)) {
                currentPrayer = prayer;
                break;
            }
        }
        
        // If we have a current prayer, show it
        if (currentPrayer) {
            return {
                current: currentPrayer,
                next: currentPrayer,
                status: 'current',
                nextTime: iqamaTimes[currentPrayer]
            };
        }
        
        // Find next prayer (closest upcoming)
        let nextPrayer = null;
        let shortestTimeDiff = Infinity;
        let nextTime = '';
        
        for (let prayer of prayerOrder) {
            const prayerTime = prayerTimes[prayer];
            let timeDiff = prayerTime - currentTime;
            
            if (timeDiff > 0 && timeDiff < shortestTimeDiff) {
                shortestTimeDiff = timeDiff;
                nextPrayer = prayer;
                nextTime = iqamaTimes[prayer];
            }
        }
        
        // If no next prayer found today, next is Fajr (tomorrow)
        if (!nextPrayer) {
            nextPrayer = 'fajr';
            nextTime = iqamaTimes.tomorrowFajr || iqamaTimes.fajr;
        }
        
        return {
            current: null,
            next: nextPrayer,
            status: 'next',
            nextTime: nextTime
        };
    }


    // ========================================
    // SMART WIDGET UPDATE FUNCTIONS
    // ========================================
    
    // Smart content update function (non-destructive)
    async function updateWidgetContent() {
        const widget = document.getElementById('iqama-widget');
        if (!widget) {
            return;
        }
        
        try {
            // Fetch fresh data
            const newPrayerTimes = await getPrayerTimesForToday();
            const newPrayerStatus = getPrayerStatus(newPrayerTimes);
            
            // Update only the changing elements
            updatePrayerTimes(widget, newPrayerTimes);
            updatePrayerTimesHeading(widget);
            
        } catch (error) {
            throw error;
        }
    }
    
    // Update individual prayer times
    function updatePrayerTimes(widget, prayerTimes) {
        const prayerElements = widget.querySelectorAll('.prayer-item');
        prayerElements.forEach(element => {
            const prayerName = element.dataset.prayer;
            const timeElement = element.querySelector('div:last-child');
            if (timeElement && prayerTimes[prayerName]) {
                timeElement.textContent = prayerTimes[prayerName];
            }
        });
    }
    
    // Update prayer times heading and description
    function updatePrayerTimesHeading(widget) {
        const currentConfig = window.IqamaWidgetConfig || CONFIG;
        const heading = widget.querySelector('.prayer-times-heading');
        const description = widget.querySelector('.prayer-times-description');
        
        if (heading) {
            heading.textContent = currentConfig.timeType === 'athan' ? 'Athan Times' : 'Iqama Times';
        }
        
        if (description) {
            description.textContent = currentConfig.timeType === 'athan' ? 'Times shown are when the Athan (call to prayer) is announced' : 'Times shown are when the Iqama (prayer begins) is called';
        }
    }
    
    // Helper function to determine if text should be white or black based on background
function getContrastingTextColor(backgroundColor) {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness using luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white for dark backgrounds, black for light backgrounds
    return brightness < 128 ? '#ffffff' : '#000000';
}

// Helper function to create glassmorphism background with true inverse
function createGlassmorphism(backgroundColor, accentColor) {
    // Convert hex to RGB for transparency
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    const bgRgb = hexToRgb(backgroundColor);
    if (!bgRgb) return backgroundColor;
    
    // Determine if background is light or dark for appropriate transparency
    const brightness = (bgRgb.r * 299 + bgRgb.g * 587 + bgRgb.b * 114) / 1000;
    const isLight = brightness > 128;
    
    // Create glassmorphism effect with backdrop blur and transparency
    if (isLight) {
        // Light background: darker transparency for true inverse
        return `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.95)`;
    } else {
        // Dark background: lighter transparency
        return `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.9)`;
    }
}

// Helper function to get appropriate card colors based on background
function getCardColors(backgroundColor) {
    const isDark = getContrastingTextColor(backgroundColor) === '#ffffff';
    return {
        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        backgroundActive: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        border: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cccccc',
        borderActive: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)'
    };
}

    // Create and inject the widget
    async function createWidget() {
        const iqamaTimes = await getPrayerTimesForToday();
        const prayerStatus = getPrayerStatus(iqamaTimes);
        
        // Get the current configuration (use window.IqamaWidgetConfig directly)
        const currentConfig = window.IqamaWidgetConfig || CONFIG;
        
        // Determine text color based on background brightness
        const textColor = getContrastingTextColor(currentConfig.backgroundColor);
        
        // Get card colors for consistent styling
        const cardColors = getCardColors(currentConfig.backgroundColor);
        
        const widgetHTML = `
            <div id="iqama-widget" style="
                background: ${createGlassmorphism(currentConfig.backgroundColor, currentConfig.accentColor)};
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                color: ${textColor};
                border-radius: ${currentConfig.borderRadius};
                padding: 24px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                border: 1px solid ${cardColors.border};
                width: 100%;
                max-width: 100%;
                margin: 0;
                position: relative;
                box-sizing: border-box;
                --background-color: ${currentConfig.backgroundColor};
                --accent-color: ${textColor};
                --space-xs: 4px;
                --space-sm: 8px;
                --space-md: 16px;
                --space-lg: 24px;
                --space-xl: 32px;
                --text-xs: 12px;
                --text-sm: 14px;
                --text-base: 16px;
                --text-lg: 18px;
                --text-xl: 20px;
                --text-2xl: 24px;
                --text-3xl: 32px;
            ">
                <div style="
                    text-align: center;
                    margin-bottom: 24px;
                ">
                    <div class="widget-title" style="
                        color: ${textColor};
                        font-size: 24px;
                        font-weight: 700;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        letter-spacing: -0.02em;
                        line-height: 1.2;
                        margin-bottom: 8px;
                    ">${currentConfig.title}</div>
                    <div class="widget-location" style="
                        color: ${textColor};
                        font-size: 18px;
                        font-weight: 500;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        letter-spacing: -0.01em;
                        line-height: 1.3;
                        opacity: 0.9;
                    ">${currentConfig.location}</div>
                </div>
                
                <div style="
                    padding: 16px;
                    position: relative;
                    z-index: 2;
                ">
                    <!-- Dynamic Prayer Times Heading -->
                    <div style="
                        text-align: center;
                        margin-bottom: 24px;
                    ">
                        <h2 class="prayer-times-heading" style="
                            color: ${textColor};
                            font-size: 20px;
                            font-weight: 600;
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            letter-spacing: -0.01em;
                            line-height: 1.3;
                            margin-bottom: 12px;
                        ">${currentConfig.timeType === 'athan' ? 'Athan Times' : 'Iqama Times'}</h2>
                        
                        <!-- Description Card -->
                        <div class="prayer-times-description-card" style="
                            background: ${cardColors.background};
                            border: 1px solid ${cardColors.border};
                            border-radius: 12px;
                            padding: 12px 16px;
                            margin: 0 auto;
                            max-width: 400px;
                        ">
                            <p class="prayer-times-description" style="
                                color: ${textColor};
                                font-size: 14px;
                                font-weight: 400;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.4;
                                opacity: 0.9;
                                margin: 0;
                                text-align: center;
                            ">${currentConfig.timeType === 'athan' ? 'Times shown are when the Athan (call to prayer) is announced' : 'Times shown are when the Iqama (prayer begins) is called'}</p>
                        </div>
                    </div>
                    
                    <div class="prayer-list" 
                         role="list" 
                         aria-label="Daily Prayer Times"
                         style="
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            margin-bottom: 24px;
                            padding: 0 4px;
                            width: 100%;
                            max-width: 100%;
                            margin-left: auto;
                            margin-right: auto;
                        ">
                        <style>
                            /* Simple responsive design - adapts to current screen */
                            #iqama-widget {
                                width: 100% !important;
                                max-width: 100% !important;
                                margin: 0 !important;
                                box-sizing: border-box !important;
                            }
                            
                            /* Jumuah grid - simple single column */
                            .jumuah-grid {
                                display: flex !important;
                                flex-direction: column !important;
                                gap: 8px !important;
                                margin-top: 12px !important;
                                width: 100% !important;
                                max-width: 100% !important;
                                box-sizing: border-box !important;
                            }
                        </style>
                        
                        <div class="prayer-item" role="listitem" data-prayer="fajr" style="
                            background: ${cardColors.backgroundActive};
                            border: 1px solid ${cardColors.border};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                            padding: 20px 24px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            min-height: 80px;
                            text-align: center;
                        ">
                            <div style="
                                color: ${textColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                margin-bottom: 8px;
                            ">Fajr</div>
                            
                            <div style="
                                color: ${textColor};
                                font-size: 22px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                            ">${iqamaTimes.fajr}</div>
                            
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="dhuhr" style="
                            background: ${cardColors.backgroundActive};
                            border: 1px solid ${cardColors.border};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                            padding: 20px 24px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            min-height: 80px;
                            text-align: center;
                        ">
                            <div style="
                                color: ${textColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                margin-bottom: 8px;
                            ">Dhuhr</div>
                            
                            <div style="
                                color: ${textColor};
                                font-size: 22px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                            ">${iqamaTimes.dhuhr}</div>
                            
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="asr" style="
                            background: ${cardColors.backgroundActive};
                            border: 1px solid ${cardColors.border};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                            padding: 20px 24px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            min-height: 80px;
                            text-align: center;
                        ">
                            <div style="
                                color: ${textColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                margin-bottom: 8px;
                            ">Asr</div>
                            
                            <div style="
                                color: ${textColor};
                                font-size: 22px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                            ">${iqamaTimes.asr}</div>
                            
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="maghrib" style="
                            background: ${cardColors.backgroundActive};
                            border: 1px solid ${cardColors.border};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                            padding: 20px 24px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            min-height: 80px;
                            text-align: center;
                        ">
                            <div style="
                                color: ${textColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                margin-bottom: 8px;
                            ">Maghrib</div>
                            
                            <div style="
                                color: ${textColor};
                                font-size: 22px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                            ">${iqamaTimes.maghrib}</div>
                            
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="isha" style="
                            background: ${cardColors.backgroundActive};
                            border: 1px solid ${cardColors.border};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                            padding: 20px 24px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            min-height: 80px;
                            text-align: center;
                        ">
                            <div style="
                                color: ${textColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                margin-bottom: 8px;
                            ">Isha</div>
                            
                            <div style="
                                color: ${textColor};
                                font-size: 22px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                            ">${iqamaTimes.isha}</div>
                            
                        </div>
                    </div>

                    
                    <div class="jumuah-section" style="
                        text-align: center;
                        margin: 24px 0;
                        padding: 16px;
                        background: ${cardColors.background};
                        border-radius: 16px;
                        border: 2px solid ${cardColors.border};
                        overflow: hidden;
                        box-sizing: border-box;
                    ">
                        ${(() => {
                            return currentConfig.jumuahCount === 1;
                        })() ? `
                            <div style="
                                color: ${textColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                margin-bottom: 8px;
                            ">Jumuah Prayer</div>
                            <div style="
                                color: ${textColor};
                                font-size: 22px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                            ">${iqamaTimes.jumuah1}</div>
                        ` : `
                            <div style="
                                color: ${textColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                margin-bottom: 16px;
                            ">Jumuah Prayers</div>
                            <div class="jumuah-grid" style="
                                display: flex;
                                flex-direction: column;
                                gap: 8px;
                                margin-top: 12px;
                                width: 100%;
                                max-width: 100%;
                                box-sizing: border-box;
                                overflow: hidden;
                            ">
                                ${[1, 2, 3].slice(0, currentConfig.jumuahCount).map(num => `
                                    <div style="
                                        padding: 8px 6px;
                                        background: ${cardColors.backgroundActive};
                                        border: 1px solid ${cardColors.border};
                                        border-radius: 8px;
                                        min-width: 0;
                                        box-sizing: border-box;
                                        overflow: hidden;
                                    ">
                                        <div style="
                                            color: ${textColor};
                                            font-size: 16px;
                                            font-weight: 600;
                                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                            letter-spacing: -0.01em;
                                            line-height: 1.2;
                                            margin-bottom: 6px;
                                        ">${num === 1 ? '1st' : num === 2 ? '2nd' : '3rd'} Jumuah Prayer</div>
                                        <div style="
                                            color: ${textColor};
                                            font-size: 18px;
                                            font-weight: 700;
                                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                            line-height: 1.1;
                                            letter-spacing: -0.02em;
                                        ">${iqamaTimes[`jumuah${num}`] || '1:30 PM'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    
                    <div style="
                        text-align: center;
                        margin-top: 24px;
                        padding: 0 8px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    ">
                        <a href="${currentConfig.googleSheetUrl}" 
                           target="_blank"
                           style="
                                display: inline-block;
                                background: ${currentConfig.accentColor};
                                color: ${getContrastingTextColor(currentConfig.accentColor)};
                                padding: 16px 24px;
                                border-radius: 16px;
                                text-decoration: none;
                                font-size: 16px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: 0.5px;
                                text-transform: uppercase;
                                border: 2px solid ${currentConfig.accentColor};
                                transition: all 0.3s ease;
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                                text-align: center;
                           "
                           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.25)'"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'"
                        >
                            View Full Schedule
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Create a container div and inject the widget
        const container = document.createElement('div');
        container.innerHTML = widgetHTML;
        
        // Check if widget already exists to prevent multiple insertions
        if (document.getElementById('iqama-widget')) {
            return;
        }
        
        // Try to find the widget container first
        const widgetContainer = document.getElementById('iqama-widget-container');
        
        if (widgetContainer) {
            // Insert into the designated container
            widgetContainer.appendChild(container);
        } else {
            // Fallback: append to body
            document.body.appendChild(container);
        }

        // Smart auto-refresh every 30 minutes to update prayer times (non-destructive)
        setInterval(async () => {
            try {
                await updateWidgetContent();
            } catch (error) {
                // Don't remove the widget on error - just log it
            }
        }, 30 * 60 * 1000); // 30 minutes
        
        // Daily update at midnight (also non-destructive)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            setInterval(async () => {
                try {
                    await updateWidgetContent();
                } catch (error) {
                    // Error handling
                }
            }, 86400000);
            
            // Initial daily update
            updateWidgetContent().then(() => {
                // Update completed
            }).catch(error => {
                // Update failed
            });
        }, timeUntilMidnight);
    }

    // Initialize the widget with speed optimizations
    async function initializeWidget() {
        try {
            // Create widget immediately with fallback data for instant display
            if (!document.getElementById('widget-preview')) {
                createWidget();
            }
            
            // Fetch prayer times in background (non-blocking)
            fetchPrayerTimes().then(() => {
                // Update widget with fresh data
                updateWidgetContent().catch(error => {
                    // Error updating widget with fresh data
                });
            }).catch(error => {
                // Error fetching prayer times
                // Widget already created with fallback data, so it's still functional
            });
            
        } catch (error) {
            // Widget initialization failed
            // Still try to create widget with fallback data
            if (!document.getElementById('widget-preview')) {
                createWidget();
            }
        }
    }
    
    // Start initialization
    initializeWidget();
    
    // Expose functions for interactive demo
    window.refreshWidget = async () => {
        try {
            await updateWidgetContent();
        } catch (error) {
            // Fallback to full recreation if smart update fails
            const widget = document.getElementById('iqama-widget');
            if (widget) {
                widget.remove();
            }
            createWidget();
        }
    };
    
    window.createWidget = createWidget;
    window.fetchPrayerTimes = fetchPrayerTimes;
})();
