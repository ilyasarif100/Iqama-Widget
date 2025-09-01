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
        sheetName: 'Sheet1',
        
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
            console.error('❌ Google Sheet URL is required');
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
                console.log('✅ Sheet ID extracted:', match[1]);
                return match[1];
            }
        }
        
        console.error('❌ Could not extract Sheet ID from URL:', url);
        return null;
    }
    
    // Get the actual Sheet ID
    const SHEET_ID = extractSheetId(CONFIG.googleSheetUrl);
    if (!SHEET_ID) {
        console.error('❌ Invalid Google Sheet URL. Please check your configuration.');
        return;
    }
    
    let prayerTimesData = [];
    
    // ========================================
    // DATA FETCHING FUNCTIONS
    // ========================================
    
    /**
     * Fetches prayer times from Google Sheets
     * Tries multiple endpoints for compatibility
     * @returns {Promise<void>}
     */
    async function fetchPrayerTimes() {
        try {
            // Try multiple approaches to fetch data
            let csvText = '';
            
            // Method 1: Try Google Visualization API (most reliable)
            try {
                const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
                const response = await fetch(url, {
                    mode: 'cors'
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
                        mode: 'cors'
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
                        
                        console.log(`🔍 Row ${i}: Label="${jumuahLabel}", Start="${jumuahStart}", End="${jumuahEnd}"`);
                        console.log(`🔍 All values in row ${i}:`, values);
                        
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
            
            console.log('🕌 Jumuah times extracted:', jumuahTimes);
            
            // If no Jumuah times found in CSV, use fallback times
            if (!jumuahTimes.jumuah1 && !jumuahTimes.jumuah2 && !jumuahTimes.jumuah3) {
                console.log('⚠️ No Jumuah times found in CSV, using fallback times');
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
            
            console.log('✅ Prayer times loaded successfully:', prayerTimesData.length, 'days');
            if (prayerTimesData.length > 0) {
                console.log('📅 Today\'s prayer times:', await getPrayerTimesForToday());
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            console.log('Using fallback times...');
            
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
        
        // Get sunrise time - optimized for speed
        const currentConfigForTimes = window.IqamaWidgetConfig || CONFIG;
        const skipSunriseAPI = currentConfigForTimes.skipSunriseAPI || currentConfigForTimes.skipAllAPIs;
        const useCachedSunrise = currentConfigForTimes.useCachedSunrise;
        
        if (skipSunriseAPI) {
            // Skip API call for speed - use fallback
            prayerTimes.sunrise = currentConfigForTimes.fallbackSunrise || '6:30 AM';
            console.log('⚡ Skipping sunrise API for speed, using fallback:', prayerTimes.sunrise);
        } else if (currentConfigForTimes.location) {
            try {
                // Use cached sunrise if available and configured
                if (useCachedSunrise && currentConfigForTimes.fallbackSunrise) {
                    prayerTimes.sunrise = currentConfigForTimes.fallbackSunrise;
                    console.log('🌅 Using cached sunrise time:', prayerTimes.sunrise);
                } else {
                    // Get coordinates for the location
                    const coords = await getCoordinatesFromAddress(currentConfigForTimes.location);
                    const sunriseTime = await getSunriseTime(coords.lat, coords.lng);
                    prayerTimes.sunrise = sunriseTime;
                    console.log('🌅 Sunrise time from API:', sunriseTime, 'for', currentConfigForTimes.location);
                }
            } catch (error) {
                console.log('Could not fetch sunrise time, using default');
                prayerTimes.sunrise = currentConfigForTimes.fallbackSunrise || '6:30 AM';
            }
        } else {
            prayerTimes.sunrise = currentConfigForTimes.fallbackSunrise || '6:30 AM';
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
            console.error('Invalid time string:', timeStr);
            return 0;
        }
        
        const [time, period] = timeStr.split(' ');
        if (!time || !period) {
            console.error('Invalid time format:', timeStr);
            return 0;
        }
        
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            console.error('Invalid time numbers:', timeStr);
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

    // Get sunrise time from API
    async function getSunriseTime(lat, lng) {
        try {
            // Primary API: Sunrise-Sunset with optimized parameters
            const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0&tzid=auto`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'IqamaWidget/1.0'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.status === 'OK' && data.results.sunrise) {
                const sunriseUTC = new Date(data.results.sunrise);
                
                // Get timezone - optimized for speed
                let timeZoneId;
                const currentConfig = window.IqamaWidgetConfig || CONFIG;
                const skipTimezoneAPI = currentConfig.skipTimezoneAPI || currentConfig.skipAllAPIs;
                
                if (skipTimezoneAPI) {
                    // Skip timezone API for speed - use browser timezone
                    timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    console.log('⚡ Skipping timezone API for speed, using browser timezone:', timeZoneId);
                } else {
                    try {
                        // Method 1: TimeAPI.io (fastest)
                        const tzResp = await fetch(`https://www.timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`, {
                            headers: { 'Accept': 'application/json' }
                        });
                        if (tzResp.ok) {
                            const tzData = await tzResp.json();
                            timeZoneId = tzData && (tzData.timeZone || tzData.timezone || tzData.time_zone);
                        }
                    } catch (e) {
                        console.log('Timezone lookup error:', e);
                    }
                    
                    // Method 2: Browser timezone fallback
                    if (!timeZoneId) {
                        timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    }
                }
                
                const localTime = new Intl.DateTimeFormat('en-US', {
                    timeZone: timeZoneId,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).format(sunriseUTC);
                
                console.log('🌅 Sunrise time:', localTime, 'for coordinates:', lat, lng);
                return localTime;
            }
        } catch (error) {
            console.log('Sunrise API error:', error);
            
            // Fallback: Calculate approximate sunrise
            try {
                const approximateSunrise = calculateApproximateSunrise(lat, lng);
                console.log('🌅 Using approximate sunrise:', approximateSunrise);
                return approximateSunrise;
            } catch (e) {
                console.log('Approximate sunrise calculation failed:', e);
            }
        }
        
        // Final fallback
        return '6:30 AM';
    }

    // Approximate sunrise calculation as backup
    function calculateApproximateSunrise(lat, lng) {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        // Simplified sunrise calculation based on latitude and day of year
        const latRad = lat * Math.PI / 180;
        const declination = 23.45 * Math.sin((284 + dayOfYear) * Math.PI / 180);
        const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declination * Math.PI / 180));
        const sunriseHour = 12 - (hourAngle * 12 / Math.PI);
        
        const hours = Math.floor(sunriseHour);
        const minutes = Math.floor((sunriseHour - hours) * 60);
        
        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Get coordinates from address using geocoding API
    async function getCoordinatesFromAddress(address) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            console.log('Geocoding API error:', error);
        }
        
        // Fallback to default coordinates (Phoenix, AZ)
        return { lat: 33.4484, lng: -112.0740 };
    }

    // ========================================
    // SMART WIDGET UPDATE FUNCTIONS
    // ========================================
    
    // Smart content update function (non-destructive)
    async function updateWidgetContent() {
        const widget = document.getElementById('iqama-widget');
        if (!widget) {
            console.log('⚠️ No widget found for update');
            return;
        }
        
        try {
            // Fetch fresh data
            const newPrayerTimes = await getPrayerTimesForToday();
            const newPrayerStatus = getPrayerStatus(newPrayerTimes);
            
            // Update only the changing elements
            updatePrayerTimes(widget, newPrayerTimes);
            updatePrayerTimesHeading(widget);
            updateCurrentPrayerHighlight(widget, newPrayerStatus);
            updateNextPrayerStatus(widget, newPrayerStatus);
            
            // Check if we're in demo mode and ensure proper placement
            const isDemo = document.getElementById('widget-preview');
            if (isDemo && !isDemo.contains(widget)) {
                isDemo.appendChild(widget);
            }
            
            console.log('✅ Widget content updated successfully');
        } catch (error) {
            console.error('❌ Error updating widget content:', error);
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
    
    // Update current prayer highlight
    function updateCurrentPrayerHighlight(widget, prayerStatus) {
        // Remove old highlights
        widget.querySelectorAll('.prayer-item').forEach(item => {
            item.style.background = 'rgba(255, 255, 255, 0.05)';
            item.style.borderColor = 'transparent';
            
            // Remove live indicator
            const liveIndicator = item.querySelector('[style*="background: #10B981"]');
            if (liveIndicator) {
                liveIndicator.remove();
            }
        });
        
        // Add new highlight
        if (prayerStatus.current) {
            const currentElement = widget.querySelector(`[data-prayer="${prayerStatus.current}"]`);
            if (currentElement) {
                const currentConfig = window.IqamaWidgetConfig || CONFIG;
                currentElement.style.background = 'rgba(255, 255, 255, 0.1)';
                const textColor = getContrastingTextColor(currentConfig.backgroundColor);
                currentElement.style.borderColor = textColor;
                
                // Ensure text styling matches CSS rules exactly
                const textElements = currentElement.querySelectorAll('div');
                textElements.forEach((textElement, index) => {
                    // Remove any inline styles that might override CSS
                    textElement.style.removeProperty('font-size');
                    textElement.style.removeProperty('font-weight');
                    textElement.style.removeProperty('color');
                    textElement.style.removeProperty('opacity');
                });
                
                // Add live indicator
                const liveIndicator = document.createElement('div');
                liveIndicator.style.cssText = `
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 6px;
                    height: 6px;
                    background: #10B981;
                    border-radius: 50%;
                    border: 0.5px solid white;
                    animation: pulse 2s infinite;
                    min-width: 6px;
                    min-height: 6px;
                    max-width: 6px;
                    max-height: 6px;
                `;
                currentElement.appendChild(liveIndicator);
            }
        }
    }
    
    // Update next prayer status
    function updateNextPrayerStatus(widget, prayerStatus) {
        const nextPrayerElement = widget.querySelector('.next-prayer-status');
        if (nextPrayerElement && prayerStatus.next) {
            const nextPrayerTime = prayerStatus.nextTime;
            const isNextDay = prayerStatus.status === 'next-day';
            
            let statusText = '';
            if (isNextDay) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                statusText = `Next Prayer: ${prayerStatus.next} at ${nextPrayerTime} (${tomorrowFormatted})`;
            } else {
                statusText = `Next Prayer: ${prayerStatus.next} at ${nextPrayerTime}`;
            }
            
            nextPrayerElement.textContent = statusText;
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

// Helper function to create glassmorphism background
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
        // Light background: subtle dark transparency
        return `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.85)`;
    } else {
        // Dark background: subtle light transparency
        return `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.9)`;
    }
}

// Helper function to get appropriate card colors based on background
function getCardColors(backgroundColor) {
    const isDark = getContrastingTextColor(backgroundColor) === '#ffffff';
    return {
        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        backgroundActive: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderActive: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
    };
}

    // Create and inject the widget
    async function createWidget() {
        const iqamaTimes = await getPrayerTimesForToday();
        const prayerStatus = getPrayerStatus(iqamaTimes);
        const currentPrayer = prayerStatus.current;
        const nextPrayer = prayerStatus.next;
        const isCurrentPrayer = prayerStatus.status === 'current';
        const statusText = isCurrentPrayer ? 'Current Prayer' : 'Next Prayer';
        const nextPrayerTime = prayerStatus.nextTime;
        
        // Get the current configuration (use window.IqamaWidgetConfig directly)
        const currentConfig = window.IqamaWidgetConfig || CONFIG;
        console.log('🔧 Widget using config:', currentConfig);
        console.log('🔧 Jumuah count in config:', currentConfig.jumuahCount);
        
        // Determine text color based on background brightness
        const textColor = getContrastingTextColor(currentConfig.backgroundColor);
        
        // Get card colors for consistent styling
        const cardColors = getCardColors(currentConfig.backgroundColor);
        
        // Get date info for next-day prayers
        const currentDate = new Date();
        const currentTime = getCurrentTime();
        
        // Check if all of today's prayers have passed
        const isFriday = currentDate.getDay() === 5;
        let prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        if (isFriday) {
            prayerOrder = ['fajr', 'jumuah', 'asr', 'maghrib', 'isha'];
        }
        
        const allPrayersPassed = prayerOrder.every(prayer => {
            const prayerTime = timeToMinutes(iqamaTimes[prayer]);
            return currentTime > (prayerTime + 30);
        });
        
        const isNextDayFajr = !isCurrentPrayer && nextPrayer === 'fajr' && allPrayersPassed;
        
        const tomorrowDate = new Date(currentDate);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowFormatted = tomorrowDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const widgetHTML = `
            <div id="iqama-widget" style="
                background: ${createGlassmorphism(currentConfig.backgroundColor, currentConfig.accentColor)};
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                color: ${textColor};
                border-radius: ${currentConfig.borderRadius};
                padding: 32px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                border: 1px solid ${cardColors.border};
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
                position: relative;
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
                    padding: 32px;
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
                            /* Mobile-first responsive design - One column for all */
                            #iqama-widget {
                                max-width: 100% !important;
                                width: 100% !important;
                                margin: 16px auto !important;
                            }
                            
                            /* Mobile (360px) - Full width with padding */
                            @media (min-width: 360px) {
                                #iqama-widget {
                                    width: calc(100% - 32px) !important;
                                    max-width: 360px !important;
                                    margin: 16px auto !important;
                                }
                            }
                            
                            /* Mobile (390px) - Slightly wider */
                            @media (min-width: 390px) {
                                #iqama-widget {
                                    width: calc(100% - 32px) !important;
                                    max-width: 390px !important;
                                    margin: 18px auto !important;
                                }
                            }
                            
                            /* Tablet (768px) - Good tablet width */
                            @media (min-width: 768px) {
                                #iqama-widget {
                                    width: calc(100% - 48px) !important;
                                    max-width: 480px !important;
                                    margin: 24px auto !important;
                                }
                            }
                            
                            /* Tablet (810px) - Slightly wider tablet */
                            @media (min-width: 810px) {
                                #iqama-widget {
                                    width: calc(100% - 48px) !important;
                                    max-width: 520px !important;
                                    margin: 28px auto !important;
                                }
                            }
                            
                            /* Desktop (1366px) - Comfortable desktop width */
                            @media (min-width: 1366px) {
                                #iqama-widget {
                                    width: calc(100% - 64px) !important;
                                    max-width: 600px !important;
                                    margin: 32px auto !important;
                                }
                            }
                            
                            /* Large Desktop (1920px) - Optimal large screen width */
                            @media (min-width: 1920px) {
                                #iqama-widget {
                                    width: calc(100% - 80px) !important;
                                    max-width: 700px !important;
                                    margin: 40px auto !important;
                                }
                            }
                            

                            
                            /* Mobile (360px, 390px) */

                            

                            

                            

                            
                            /* Desktops/Laptops (1366px, 1920px) */

                            
                            /* Mobile-first responsive design for Jumuah grid */
                            .jumuah-grid {
                                display: flex !important;
                                flex-direction: column !important;
                                gap: 8px !important;
                                margin-top: 12px !important;
                                width: 100% !important;
                                max-width: 100% !important;
                                box-sizing: border-box !important;
                                overflow: hidden !important;
                            }
                            
                            /* All screen sizes - Single column layout */
                            @media (max-width: 767px) {
                                .jumuah-grid {
                                    gap: 8px !important;
                                    padding: 0 4px !important;
                                }
                            }
                            
                            @media (min-width: 768px) and (max-width: 1023px) {
                                .jumuah-grid {
                                    gap: 8px !important;
                                    padding: 0 6px !important;
                                }
                            }
                            
                            @media (min-width: 1024px) and (max-width: 1365px) {
                                .jumuah-grid {
                                    gap: 8px !important;
                                    padding: 0 8px !important;
                                }
                            }
                            
                            @media (min-width: 1366px) {
                                .jumuah-grid {
                                    gap: 8px !important;
                                    padding: 0 10px !important;
                                }
                            }
                            
                            /* Pulse animation for live indicator */
                            @keyframes pulse {
                                0% {
                                    opacity: 1;
                                    transform: scale(1);
                                }
                                50% {
                                    opacity: 0.7;
                                    transform: scale(1.2);
                                }
                                100% {
                                    opacity: 1;
                                    transform: scale(1);
                                }
                            }
                        </style>
                        
                        <div class="prayer-item" role="listitem" data-prayer="fajr" style="
                            background: ${currentPrayer === 'fajr' ? cardColors.backgroundActive : cardColors.background};
                            border: 2px solid ${currentPrayer === 'fajr' ? textColor : cardColors.border};
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
                            
                            ${currentPrayer === 'fajr' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 6px;
                                    height: 6px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                    min-width: 6px;
                                    min-height: 6px;
                                    max-width: 6px;
                                    max-height: 6px;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="sunrise" style="
                            background: ${currentPrayer === 'sunrise' ? cardColors.backgroundActive : cardColors.background};
                            border: 2px solid ${currentPrayer === 'sunrise' ? textColor : cardColors.border};
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
                            ">Sunrise</div>
                            
                            <div style="
                                color: ${textColor};
                                font-size: 22px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                            ">${iqamaTimes.sunrise}</div>
                            
                            ${currentPrayer === 'sunrise' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 6px;
                                    height: 6px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                    min-width: 6px;
                                    min-height: 6px;
                                    max-width: 6px;
                                    max-height: 6px;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="dhuhr" style="
                            background: ${currentPrayer === 'dhuhr' ? cardColors.backgroundActive : cardColors.background};
                            border: 2px solid ${currentPrayer === 'dhuhr' ? textColor : cardColors.border};
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
                            
                            ${currentPrayer === 'dhuhr' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 6px;
                                    height: 6px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                    min-width: 6px;
                                    min-height: 6px;
                                    max-width: 6px;
                                    max-height: 6px;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="asr" style="
                            background: ${currentPrayer === 'asr' ? cardColors.backgroundActive : cardColors.background};
                            border: 2px solid ${currentPrayer === 'asr' ? textColor : cardColors.border};
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
                            
                            ${currentPrayer === 'asr' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 6px;
                                    height: 6px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                    min-width: 6px;
                                    min-height: 6px;
                                    max-width: 6px;
                                    max-height: 6px;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="maghrib" style="
                            background: ${currentPrayer === 'maghrib' ? cardColors.backgroundActive : cardColors.background};
                            border: 2px solid ${currentPrayer === 'maghrib' ? textColor : cardColors.border};
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
                            
                            ${currentPrayer === 'maghrib' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 6px;
                                    height: 6px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                    min-width: 6px;
                                    min-height: 6px;
                                    max-width: 6px;
                                    max-height: 6px;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="isha" style="
                            background: ${currentPrayer === 'isha' ? cardColors.backgroundActive : cardColors.background};
                            border: 2px solid ${currentPrayer === 'isha' ? textColor : cardColors.border};
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
                            
                            ${currentPrayer === 'isha' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 6px;
                                    height: 6px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                    min-width: 6px;
                                    min-height: 6px;
                                    max-width: 6px;
                                    max-height: 6px;
                                "></div>
                            ` : ''}
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
                            console.log('🔧 Creating Jumuah section with count:', currentConfig.jumuahCount);
                            console.log('🔧 Current config in Jumuah section:', currentConfig);
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
                                ${[1, 2, 3].slice(0, (() => {
                                    console.log('🔧 Multiple Jumuah section - count:', currentConfig.jumuahCount);
                                    return currentConfig.jumuahCount;
                                })()).map(num => `
                                    <div style="
                                        padding: 8px 6px;
                                        background: ${cardColors.backgroundActive};
                                        border-radius: 8px;
                                        border: 1px solid ${cardColors.borderActive};
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
            console.log('⚠️ Widget already exists, skipping insertion');
            return;
        }
        
        // Find the script tag that contains this widget
        const scripts = document.querySelectorAll('script');
        let targetScript = null;
        
        for (let script of scripts) {
            if (script.src && script.src.includes('iqama-widget-cloud.js')) {
                targetScript = script;
                break;
            }
        }
        
        if (targetScript) {
            // Insert after the script tag
            targetScript.parentNode.insertBefore(container, targetScript.nextSibling);
            console.log('✅ Widget inserted after script tag');
        } else {
            // Fallback: append to body
            document.body.appendChild(container);
            console.log('⚠️ Widget appended to body');
        }

        // Smart auto-refresh every minute to update next prayer highlight (non-destructive)
        setInterval(async () => {
            try {
                await updateWidgetContent();
                console.log('✅ Widget content updated successfully');
            } catch (error) {
                console.error('❌ Widget update failed:', error);
                // Don't remove the widget on error - just log it
            }
        }, 60000);
        
        // Daily update at midnight (also non-destructive)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            setInterval(async () => {
                try {
                    console.log('🔄 Daily update: Refreshing widget for new date');
                    await updateWidgetContent();
                    console.log('✅ Daily widget update completed');
                } catch (error) {
                    console.error('❌ Daily widget update failed:', error);
                }
            }, 86400000);
            
            // Initial daily update
            updateWidgetContent().then(() => {
                console.log('✅ Initial daily update completed');
            }).catch(error => {
                console.error('❌ Initial daily update failed:', error);
            });
        }, timeUntilMidnight);
    }

    // Initialize the widget with speed optimizations
    async function initializeWidget() {
        try {
            console.log('🔄 Initializing widget with speed optimizations...');
            
            // Check for speed optimization flags
            const skipTimezoneAPI = CONFIG.skipTimezoneAPI || CONFIG.skipAllAPIs;
            const skipSunriseAPI = CONFIG.skipSunriseAPI || CONFIG.skipAllAPIs;
            const useCachedSunrise = CONFIG.useCachedSunrise;
            const parallelAPICalls = CONFIG.parallelAPICalls;
            
            console.log('⚡ Speed optimizations:', {
                skipTimezoneAPI,
                skipSunriseAPI,
                useCachedSunrise,
                parallelAPICalls
            });
            
            // Fetch prayer times (this is the most important data)
            await fetchPrayerTimes();
            console.log('✅ Prayer times fetched successfully');
            
            // Only auto-create widget if not in demo mode
            if (!document.getElementById('widget-preview')) {
                console.log('🚀 Auto-creating widget (not in demo mode)');
                createWidget();
            } else {
                console.log('🎭 Demo mode detected, widget will be created manually');
            }
        } catch (error) {
            console.error('❌ Widget initialization failed:', error);
            // Still try to create widget with fallback data
            if (!document.getElementById('widget-preview')) {
                console.log('🚀 Creating widget with fallback data');
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
            console.log('✅ Widget refreshed successfully');
        } catch (error) {
            console.error('❌ Widget refresh failed:', error);
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
