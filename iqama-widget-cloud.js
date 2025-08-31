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
                    
                    if (values.length >= 9) {
                        const jumuahLabel = values[7]; // Column 8 (0-indexed)
                        const jumuahTime = values[8];   // Column 9 (0-indexed)
                        
                        if (jumuahLabel === '1st Jumuah') {
                            jumuahTimes.jumuah1 = jumuahTime;
                        } else if (jumuahLabel === '2nd Jumuah') {
                            jumuahTimes.jumuah2 = jumuahTime;
                        } else if (jumuahLabel === '3rd Jumuah') {
                            jumuahTimes.jumuah3 = jumuahTime;
                        }
                    }
                }
            }
            
            console.log('🕌 Jumuah times extracted:', jumuahTimes);
            
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
            await createWidget();
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            console.log('Using fallback times...');
            
            // Fallback to default times if fetch fails
            prayerTimesData = [{
                month: 1,
                day: 1,
                fajr: "5:30 AM",
                dhuhr: "1:30 PM",
                jumuah1: "1:31 PM",
                jumuah2: "2:30 PM",
                jumuah3: "3:30 PM",
                asr: "4:45 PM",
                maghrib: "7:15 PM",
                isha: "8:45 PM"
            }];
            await createWidget();
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
        
        // Get sunrise time from API if we have location data
        if (CONFIG.location && CONFIG.location !== 'Phoenix, AZ') {
            try {
                const coords = await getCoordinatesFromAddress(CONFIG.location);
                const sunriseTime = await getSunriseTime(coords.lat, coords.lng);
                prayerTimes.sunrise = sunriseTime;
                console.log('🌅 Sunrise time from API:', sunriseTime);
            } catch (error) {
                console.log('Could not fetch sunrise time, using default');
                prayerTimes.sunrise = '6:30 AM';
            }
        } else {
            prayerTimes.sunrise = '6:30 AM';
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
            const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`);
            const data = await response.json();
            
            if (data.status === 'OK' && data.results.sunrise) {
                // Convert UTC time to local time
                const sunriseUTC = new Date(data.results.sunrise);
                const localTime = sunriseUTC.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                return localTime;
            }
        } catch (error) {
            console.log('Sunrise API error:', error);
        }
        
        // Fallback to a default sunrise time
        return '6:30 AM';
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
                currentElement.style.background = 'rgba(255, 255, 255, 0.1)';
                currentElement.style.borderColor = CONFIG.accentColor;
                
                // Add live indicator
                const liveIndicator = document.createElement('div');
                liveIndicator.style.cssText = `
                    position: absolute;
                    top: 4px;
                    right: 4px;
                        width: 4px;
                        height: 4px;
                        background: #10B981;
                        border-radius: 50%;
                        border: 0.5px solid white;
                        animation: pulse 2s infinite;
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

    // Create and inject the widget
    async function createWidget() {
        const iqamaTimes = await getPrayerTimesForToday();
        const prayerStatus = getPrayerStatus(iqamaTimes);
        const currentPrayer = prayerStatus.current;
        const nextPrayer = prayerStatus.next;
        const isCurrentPrayer = prayerStatus.status === 'current';
        const statusText = isCurrentPrayer ? 'Current Prayer' : 'Next Prayer';
        const nextPrayerTime = prayerStatus.nextTime;
        
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
                background: ${CONFIG.backgroundColor};
                color: ${CONFIG.accentColor};
                border-radius: ${CONFIG.borderRadius};
                padding: 32px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.1);
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
                position: relative;
                --background-color: ${CONFIG.backgroundColor};
                --accent-color: ${CONFIG.accentColor};
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
                    margin-bottom: 32px;
                ">
                    <div class="widget-title" style="
                        color: ${CONFIG.accentColor};
                        font-size: 24px;
                        font-weight: 700;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        letter-spacing: -0.02em;
                        line-height: 1.2;
                        margin-bottom: 8px;
                    ">${CONFIG.title}</div>
                    <div class="widget-location" style="
                        color: ${CONFIG.accentColor};
                        font-size: 18px;
                        font-weight: 500;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        letter-spacing: -0.01em;
                        line-height: 1.3;
                        opacity: 0.9;
                    ">${CONFIG.location}</div>
                </div>
                
                <div style="
                    padding: 32px;
                    position: relative;
                    z-index: 2;
                ">
                    <div class="prayer-grid" 
                         role="list" 
                         aria-label="Daily Prayer Times"
                         style="
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 12px;
                            margin-bottom: 32px;
                            padding: 0 8px;
                            justify-items: center;
                            align-items: center;
                            text-align: center;
                            width: 100%;
                            max-width: 100%;
                            margin-left: auto;
                            margin-right: auto;
                            justify-content: center;
                        ">
                        <style>
                            /* Mobile-first responsive design */
                            #iqama-widget {
                                max-width: 100% !important;
                                width: 100% !important;
                                margin: 16px auto !important;
                            }
                            
                            /* Mobile (360px, 390px) */
                            @media (min-width: 360px) {
                                #iqama-widget {
                                    width: 100% !important;
                                    max-width: 340px !important;
                                    margin: 16px auto !important;
                                }
                            }
                            
                            @media (min-width: 390px) {
                                #iqama-widget {
                                    width: 100% !important;
                                    max-width: 370px !important;
                                    margin: 18px auto !important;
                                }
                            }
                            
                            /* Tablets (768px, 810px) */
                            @media (min-width: 768px) {
                                #iqama-widget {
                                    width: 100% !important;
                                    max-width: 720px !important;
                                    margin: 24px auto !important;
                                }
                            }
                            
                            @media (min-width: 810px) {
                                #iqama-widget {
                                    width: 100% !important;
                                    max-width: 760px !important;
                                    margin: 28px auto !important;
                                }
                            }
                            
                            /* Desktops/Laptops (1366px, 1920px) */
                            @media (min-width: 1366px) {
                                #iqama-widget {
                                    width: 100% !important;
                                    max-width: 800px !important;
                                    margin: 32px auto !important;
                                }
                            }
                            
                            @media (min-width: 1920px) {
                                #iqama-widget {
                                    width: 100% !important;
                                    max-width: 900px !important;
                                    margin: 40px auto !important;
                                }
                            }
                            
                            /* Mobile-first responsive design */
                            .prayer-grid {
                                display: grid !important;
                                grid-template-columns: repeat(2, 1fr) !important;
                                gap: 10px !important;
                                padding: 0 6px !important;
                                justify-items: center !important;
                                align-items: center !important;
                                text-align: center !important;
                                width: 100% !important;
                                max-width: 100% !important;
                                margin-left: auto !important;
                                margin-right: auto !important;
                                justify-content: center !important;
                            }
                            
                            .prayer-item {
                                padding: 10px 6px !important;
                                min-height: 65px !important;
                                width: 100% !important;
                                max-width: 100% !important;
                                box-sizing: border-box !important;
                                display: flex !important;
                                flex-direction: column !important;
                                justify-content: center !important;
                                align-items: center !important;
                                text-align: center !important;
                            }
                            
                            .prayer-item div:first-child {
                                font-size: 11px !important;
                                margin-bottom: 5px !important;
                                text-align: center !important;
                                width: 100% !important;
                                display: block !important;
                            }
                            
                            .prayer-item div:last-child {
                                font-size: 15px !important;
                                text-align: center !important;
                                width: 100% !important;
                                display: block !important;
                            }
                            
                            /* Mobile (360px, 390px) */
                            @media (min-width: 360px) {
                                .prayer-grid {
                                    gap: 12px !important;
                                    padding: 0 8px !important;
                                    justify-items: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                    justify-content: center !important;
                                    display: grid !important;
                                    grid-template-columns: repeat(2, 1fr) !important;
                                }
                                
                                .prayer-item {
                                    padding: 12px 8px !important;
                                    min-height: 70px !important;
                                    justify-content: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    display: flex !important;
                                    flex-direction: column !important;
                                }
                                
                                .prayer-item div:first-child {
                                    font-size: 12px !important;
                                    text-align: center !important;
                                }
                                
                                .prayer-item div:last-child {
                                    font-size: 16px !important;
                                    text-align: center !important;
                                }
                            }
                            
                            @media (min-width: 390px) {
                                .prayer-grid {
                                    gap: 14px !important;
                                    padding: 0 10px !important;
                                    justify-items: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                    justify-content: center !important;
                                    display: grid !important;
                                    grid-template-columns: repeat(2, 1fr) !important;
                                }
                                
                                .prayer-item {
                                    padding: 14px 10px !important;
                                    min-height: 75px !important;
                                    justify-content: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    display: flex !important;
                                    flex-direction: column !important;
                                }
                                
                                .prayer-item div:first-child {
                                    font-size: 13px !important;
                                    text-align: center !important;
                                }
                                
                                .prayer-item div:last-child {
                                    font-size: 17px !important;
                                    text-align: center !important;
                                }
                            }
                            
                            /* Tablets (768px, 810px) */
                            @media (min-width: 768px) {
                                .prayer-grid {
                                    grid-template-columns: repeat(3, 1fr) !important;
                                    gap: 16px !important;
                                    padding: 0 12px !important;
                                    justify-items: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                    justify-content: center !important;
                                    display: grid !important;
                                }
                                
                                .prayer-item {
                                    padding: 16px 12px !important;
                                    min-height: 80px !important;
                                    justify-content: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    display: flex !important;
                                    flex-direction: column !important;
                                }
                                
                                .prayer-item div:first-child {
                                    font-size: 14px !important;
                                    text-align: center !important;
                                }
                                
                                .prayer-item div:last-child {
                                    font-size: 18px !important;
                                    text-align: center !important;
                                }
                            }
                            
                            @media (min-width: 810px) {
                                .prayer-grid {
                                    gap: 18px !important;
                                    padding: 0 14px !important;
                                    justify-items: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                    justify-content: center !important;
                                    display: grid !important;
                                    grid-template-columns: repeat(3, 1fr) !important;
                                }
                                
                                .prayer-item {
                                    padding: 18px 14px !important;
                                    min-height: 85px !important;
                                    justify-content: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    display: flex !important;
                                    flex-direction: column !important;
                                }
                                
                                .prayer-item div:first-child {
                                    font-size: 15px !important;
                                    text-align: center !important;
                                }
                                
                                .prayer-item div:last-child {
                                    font-size: 19px !important;
                                    text-align: center !important;
                                }
                            }
                            
                            /* Desktops/Laptops (1366px, 1920px) */
                            @media (min-width: 1366px) {
                                .prayer-grid {
                                    gap: 20px !important;
                                    padding: 0 16px !important;
                                    justify-items: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                    justify-content: center !important;
                                    display: grid !important;
                                    grid-template-columns: repeat(3, 1fr) !important;
                                }
                                
                                .prayer-item {
                                    padding: 20px 16px !important;
                                    min-height: 90px !important;
                                    justify-content: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    display: flex !important;
                                    flex-direction: column !important;
                                }
                                
                                .prayer-item div:first-child {
                                    font-size: 16px !important;
                                    text-align: center !important;
                                }
                                
                                .prayer-item div:last-child {
                                    font-size: 20px !important;
                                    text-align: center !important;
                                }
                            }
                            
                            @media (min-width: 1920px) {
                                .prayer-grid {
                                    gap: 24px !important;
                                    padding: 0 20px !important;
                                    justify-items: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                    justify-content: center !important;
                                    display: grid !important;
                                    grid-template-columns: repeat(3, 1fr) !important;
                                }
                                
                                .prayer-item {
                                    padding: 24px 20px !important;
                                    min-height: 100px !important;
                                    justify-content: center !important;
                                    align-items: center !important;
                                    text-align: center !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    display: flex !important;
                                    flex-direction: column !important;
                                }
                                
                                .prayer-item div:first-child {
                                    font-size: 18px !important;
                                    text-align: center !important;
                                }
                                
                                .prayer-item div:last-child {
                                    font-size: 22px !important;
                                    text-align: center !important;
                                }
                            }
                            
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
                        </style>
                        
                        <div class="prayer-item" role="listitem" data-prayer="fajr" style="
                            background: ${currentPrayer === 'fajr' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                            border: 2px solid ${currentPrayer === 'fajr' ? CONFIG.accentColor : 'transparent'};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 14px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                margin-bottom: 5px;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                width: 100%;
                            ">Fajr</div>
                            
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 18px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                                width: 100%;
                            ">${iqamaTimes.fajr}</div>
                            
                            ${currentPrayer === 'fajr' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 4px;
                                    height: 4px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="sunrise" style="
                            background: ${currentPrayer === 'sunrise' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                            border: 2px solid ${currentPrayer === 'sunrise' ? CONFIG.accentColor : 'transparent'};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 14px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                margin-bottom: 5px;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                width: 100%;
                            ">Sunrise</div>
                            
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 18px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                                width: 100%;
                            ">${iqamaTimes.sunrise}</div>
                            
                            ${currentPrayer === 'sunrise' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 4px;
                                    height: 4px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="dhuhr" style="
                            background: ${currentPrayer === 'dhuhr' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                            border: 2px solid ${currentPrayer === 'dhuhr' ? CONFIG.accentColor : 'transparent'};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 14px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                margin-bottom: 5px;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                width: 100%;
                            ">Dhuhr</div>
                            
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 18px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                                width: 100%;
                            ">${iqamaTimes.dhuhr}</div>
                            
                            ${currentPrayer === 'dhuhr' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 4px;
                                    height: 4px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="asr" style="
                            background: ${currentPrayer === 'asr' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                            border: 2px solid ${currentPrayer === 'asr' ? CONFIG.accentColor : 'transparent'};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 14px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                margin-bottom: 5px;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                width: 100%;
                            ">Asr</div>
                            
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 18px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                                width: 100%;
                            ">${iqamaTimes.asr}</div>
                            
                            ${currentPrayer === 'asr' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 4px;
                                    height: 4px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="maghrib" style="
                            background: ${currentPrayer === 'maghrib' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                            border: 2px solid ${currentPrayer === 'maghrib' ? CONFIG.accentColor : 'transparent'};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 14px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                margin-bottom: 5px;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                width: 100%;
                            ">Maghrib</div>
                            
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 18px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                                width: 100%;
                            ">${iqamaTimes.maghrib}</div>
                            
                            ${currentPrayer === 'maghrib' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 4px;
                                    height: 4px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                "></div>
                            ` : ''}
                        </div>
                        
                        <div class="prayer-item" role="listitem" data-prayer="isha" style="
                            background: ${currentPrayer === 'isha' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                            border: 2px solid ${currentPrayer === 'isha' ? CONFIG.accentColor : 'transparent'};
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            position: relative;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 14px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                margin-bottom: 5px;
                                letter-spacing: -0.01em;
                                line-height: 1.2;
                                opacity: 0.9;
                                text-align: center;
                                width: 100%;
                            ">Isha</div>
                            
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 18px;
                                font-weight: 700;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.1;
                                letter-spacing: -0.02em;
                                text-align: center;
                                width: 100%;
                            ">${iqamaTimes.isha}</div>
                            
                            ${currentPrayer === 'isha' ? `
                                <div style="
                                    position: absolute;
                                    top: 4px;
                                    right: 4px;
                                    width: 4px;
                                    height: 4px;
                                    background: #10B981;
                                    border-radius: 50%;
                                    border: 0.5px solid white;
                                    animation: pulse 2s infinite;
                                "></div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="
                        text-align: center;
                        margin: 16px 0;
                        padding: 16px;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <div class="time-explanation" style="
                            color: ${CONFIG.accentColor};
                            font-size: 14px;
                            font-weight: 500;
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            letter-spacing: -0.01em;
                            line-height: 1.4;
                            opacity: 0.8;
                        ">${CONFIG.timeType === 'athan' ? 'Times shown are when the Athan (call to prayer) is announced' : 'Times shown are when the Iqama (prayer begins) is called'}</div>
                    </div>
                    
                    <div class="jumuah-section" style="
                        text-align: center;
                        margin: 16px 0;
                        padding: 16px;
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 16px;
                        border: 2px solid rgba(255, 255, 255, 0.15);
                        overflow: hidden;
                        box-sizing: border-box;
                    ">
                        ${CONFIG.jumuahCount === 1 ? `
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 18px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.4;
                            ">Jumuah Prayer: ${iqamaTimes.jumuah1}</div>
                        ` : `
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 16px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: -0.01em;
                                line-height: 1.4;
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
                                ${[1, 2, 3].slice(0, CONFIG.jumuahCount).map(num => `
                                    <div style="
                                        padding: 8px 6px;
                                        background: rgba(255, 255, 255, 0.1);
                                        border-radius: 8px;
                                        border: 1px solid rgba(255, 255, 255, 0.2);
                                        min-width: 0;
                                        box-sizing: border-box;
                                        overflow: hidden;
                                    ">
                                        <div style="
                                            color: rgba(255, 255, 255, 0.8);
                                            font-size: 12px;
                                            font-weight: 500;
                                            margin-bottom: 6px;
                                        ">${num === 1 ? '1st' : num === 2 ? '2nd' : '3rd'} Jumuah</div>
                                        <div style="
                                            color: ${CONFIG.accentColor};
                                            font-size: 14px;
                                            font-weight: 600;
                                        ">${iqamaTimes[`jumuah${num}`] || '1:30 PM'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    
                    <div style="
                        text-align: center;
                        margin-top: 32px;
                        padding: 24px;
                    ">
                        <a href="${CONFIG.googleSheetUrl}" 
                           target="_blank"
                           style="
                                display: inline-block;
                                background: ${CONFIG.accentColor};
                                color: ${CONFIG.backgroundColor};
                                padding: 16px 24px;
                                border-radius: 16px;
                                text-decoration: none;
                                font-size: 16px;
                                font-weight: 600;
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                letter-spacing: 0.5px;
                                text-transform: uppercase;
                                border: 2px solid ${CONFIG.accentColor};
                                transition: all 0.3s ease;
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

    // Initialize the widget by fetching data first
    fetchPrayerTimes();
    
    // Only auto-create widget if not in demo mode
    if (!document.getElementById('widget-preview')) {
        console.log('🚀 Auto-creating widget (not in demo mode)');
        createWidget();
    } else {
        console.log('🎭 Demo mode detected, widget will be created manually');
    }
    
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
})();
