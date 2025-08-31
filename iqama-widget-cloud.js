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
        borderRadius: '20px'
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
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    // Handle quoted CSV values properly
                    const values = lines[i].split(',').map(value => {
                        // Remove quotes and trim
                        return value.replace(/^"/, '').replace(/"$/, '').trim();
                    });
                    
                    if (values.length >= 8) {
                        prayerTimesData.push({
                            month: parseInt(values[0]),
                            day: parseInt(values[1]),
                            fajr: values[2],
                            dhuhr: values[3],
                            asr: values[4],
                            maghrib: values[5],
                            isha: values[6],
                            jumuah: values[7]
                        });
                    }
                }
            }
            
            console.log('✅ Prayer times loaded successfully:', prayerTimesData.length, 'days');
            if (prayerTimesData.length > 0) {
                console.log('📅 Today\'s prayer times:', getPrayerTimesForToday());
            }
            createWidget();
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            console.log('Using fallback times...');
            
            // Fallback to default times if fetch fails
            prayerTimesData = [{
                month: 1,
                day: 1,
                fajr: "5:30 AM",
                dhuhr: "1:30 PM",
                jumuah: "1:00 PM",
                asr: "4:45 PM",
                maghrib: "7:15 PM",
                isha: "8:45 PM"
            }];
            createWidget();
        }
    }
    
    // Get prayer times for current date and next day if needed
    function getPrayerTimesForToday() {
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
        
        if (todayData) {
            return {
                fajr: todayData.fajr,
                dhuhr: todayData.dhuhr,
                jumuah: todayData.jumuah,
                asr: todayData.asr,
                maghrib: todayData.maghrib,
                isha: todayData.isha,
                tomorrowFajr: tomorrowData?.fajr || todayData.fajr
            };
        }
        
        // Fallback to first row if today not found
        return {
            fajr: prayerTimesData[0]?.fajr || "5:30 AM",
            dhuhr: prayerTimesData[0]?.dhuhr || "1:30 PM",
            jumuah: prayerTimesData[0]?.jumuah || "1:00 PM",
            asr: prayerTimesData[0]?.asr || "4:45 PM",
            maghrib: prayerTimesData[0]?.maghrib || "7:15 PM",
            isha: prayerTimesData[0]?.isha || "8:45 PM",
            tomorrowFajr: prayerTimesData[0]?.fajr || "5:30 AM"
        };
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
            prayerOrder = ['fajr', 'jumuah', 'asr', 'maghrib', 'isha'];
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

    // Create and inject the widget
    function createWidget() {
        const iqamaTimes = getPrayerTimesForToday();
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
                    <style>
                        @keyframes pulse {
                            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.7; }
                            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        }
                        
                        @keyframes float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-3px); }
                        }
                        
                        #iqama-widget {
                            animation: float 6s ease-in-out infinite;
                            position: relative !important;
                            z-index: 9999 !important;
                            margin: 20px auto !important;
                            display: block !important;
                            clear: both !important;
                        }
                        
                        /* Enhanced Visual Hierarchy & Polish */
                        .next-prayer-glow {
                            animation: nextPrayerGlow 2s ease-in-out infinite alternate;
                        }
                        
                        .current-prayer-glow {
                            animation: currentPrayerGlow 1.5s ease-in-out infinite alternate;
                        }
                        
                        @keyframes nextPrayerGlow {
                            0% { 
                                box-shadow: 0 0 20px rgba(229, 231, 235, 0.4),
                                           0 0 40px rgba(229, 231, 235, 0.2),
                                           0 0 60px rgba(229, 231, 235, 0.1);
                            }
                            100% { 
                                box-shadow: 0 0 30px rgba(229, 231, 235, 0.6),
                                           0 0 60px rgba(229, 231, 235, 0.3),
                                           0 0 90px rgba(229, 231, 235, 0.15);
                            }
                        }
                        
                        @keyframes currentPrayerGlow {
                            0% { 
                                box-shadow: 0 0 25px rgba(255, 107, 107, 0.5),
                                           0 0 50px rgba(255, 142, 83, 0.3),
                                           0 0 75px rgba(255, 107, 107, 0.2);
                            }
                            100% { 
                                box-shadow: 0 0 35px rgba(255, 107, 107, 0.7),
                                           0 0 70px rgba(255, 142, 83, 0.4),
                                           0 0 105px rgba(255, 107, 107, 0.25);
                            }
                        }
                        
                        .prayer-item:hover {
                            transform: translateY(-2px);
                            transition: transform 0.3s ease;
                        }
                        
                        .time-circle:hover {
                            transform: scale(1.05);
                            transition: transform 0.3s ease;
                        }
                        
                        .enhanced-shadow {
                            box-shadow: 
                                0 8px 32px rgba(0, 0, 0, 0.3),
                                0 4px 16px rgba(0, 0, 0, 0.2),
                                0 2px 8px rgba(0, 0, 0, 0.1);
                        }
                        
                        /* Minimal Squarespace positioning - preserve design */
                        .sqs-block.code-block .sqs-block-content {
                            position: relative !important;
                            overflow: visible !important;
                        }
                        
                        /* Ensure widget stays in place without breaking design */
                        #iqama-widget {
                            position: relative !important;
                            display: block !important;
                            width: 100% !important;
                            max-width: 450px !important;
                            margin: 20px auto !important;
                        }
                        }
                        
                        /* Override any Squarespace positioning */
                        /* Clean, minimal positioning - preserve design */
                        .sqs-code-block-wrapper {
                            position: relative !important;
                            display: block !important;
                            width: 100% !important;
                            max-width: 450px !important;
                            margin: 20px auto !important;
                        }
                        
                        .refined-border {
                            background-image: 
                                linear-gradient(45deg, ${CONFIG.accentColor} 25%, transparent 25%),
                                linear-gradient(-45deg, ${CONFIG.accentColor} 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, ${CONFIG.accentColor} 75%),
                                linear-gradient(-45deg, transparent 75%, ${CONFIG.accentColor} 75%);
                            background-size: 8px 8px;
                            background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
                        }
                        
                        .section-divider {
                            height: 2px;
                            background: linear-gradient(90deg, transparent, ${CONFIG.accentColor}, transparent);
                            margin: 25px 0;
                            opacity: 0.6;
                        }
                        
                        /* Mobile-first responsive design - consistent spacing and centering */
                        @media (max-width: 480px) {
                            #iqama-widget {
                                max-width: 95vw;
                                margin: 20px auto;
                                border-radius: 15px;
                                text-align: center;
                                padding: 25px 20px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                            }
                            
                            /* Consistent spacing system */
                            .prayer-row {
                                flex-direction: column;
                                gap: 25px;
                                margin-bottom: 25px;
                                align-items: center;
                                width: 100%;
                            }
                            
                            .prayer-item {
                                width: 100%;
                                max-width: 200px;
                                margin: 0 auto 25px auto;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: flex-start;
                                padding: 20px 15px;
                                position: relative;
                                text-align: center;
                                min-height: 120px;
                            }
                            
                            .time-circle {
                                width: 70px;
                                height: 70px;
                                margin: 0 auto 20px auto;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                            }
                            
                            .prayer-name {
                                font-size: 20px;
                                text-align: center;
                                width: 100%;
                                margin-bottom: 15px;
                                line-height: 1.2;
                                display: block;
                                font-weight: 600;
                            }
                            
                            .prayer-time {
                                font-size: 18px;
                                text-align: center;
                                width: 100%;
                                margin: 0;
                                line-height: 1.3;
                                display: block;
                                font-weight: 500;
                            }
                            

                            
                            .jumuah-section {
                                max-width: 90%;
                                padding: 30px 25px;
                                margin: 30px auto;
                                text-align: center;
                                border-radius: 20px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                width: 100%;
                            }
                            
                            .jumuah-time-circle {
                                width: 80px;
                                height: 80px;
                                margin: 0 auto 25px auto;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                            }
                            
                            .header-content {
                                padding: 30px 25px 25px;
                                text-align: center;
                                margin-bottom: 30px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                width: 100%;
                            }
                            
                            .date-display {
                                font-size: 20px;
                                margin-bottom: 20px;
                                text-align: center;
                                width: 100%;
                                line-height: 1.3;
                                display: block;
                                font-weight: 500;
                            }
                            
                            .title-text {
                                font-size: 28px;
                                margin-bottom: 20px;
                                text-align: center;
                                width: 100%;
                                line-height: 1.2;
                                display: block;
                                font-weight: 700;
                            }
                            
                            .location-text {
                                font-size: 22px;
                                margin-bottom: 25px;
                                text-align: center;
                                width: 100%;
                                line-height: 1.3;
                                display: block;
                                font-weight: 500;
                            }
                            

                            
                            /* Prevent overlapping elements */
                            .status-badge {
                                position: absolute;
                                top: 10px;
                                left: 10px;
                                z-index: 5;
                                pointer-events: none;
                                flex-shrink: 0;
                                object-fit: contain;
                                width: auto;
                                height: auto;
                            }
                            
                            /* Consistent section spacing */
                            .section-divider {
                                margin: 30px 0;
                                height: 3px;
                                width: 80%;
                                max-width: 200px;
                            }
                            
                            /* Ensure all elements are centered */
                            #iqama-widget * {
                                box-sizing: border-box;
                            }
                            
                            /* Force center alignment for all text */
                            .prayer-item p,
                            .prayer-item span,
                            .prayer-item div,
                            .prayer-item h3,
                            .prayer-item h4 {
                                text-align: center !important;
                                width: 100% !important;
                                margin-left: auto !important;
                                margin-right: auto !important;
                            }
                            

                            
                            /* Consistent button and interactive element spacing */
                            .prayer-item button,
                            .prayer-item .status-badge {
                                margin: 0 auto;
                                display: block;
                            }
                        }
                        
                        /* Extra small mobile devices (360px-390px) - consistent spacing */
                        @media (max-width: 390px) {
                            #iqama-widget {
                                max-width: 98vw;
                                margin: 15px auto;
                                padding: 20px 15px;
                            }
                            
                            .prayer-item {
                                max-width: 180px;
                                margin-bottom: 40px;
                                padding: 15px 10px;
                                min-height: 140px;
                            }
                            
                            .prayer-row {
                                gap: 20px;
                                margin-bottom: 40px;
                            }
                            
                            .time-circle {
                                width: 60px;
                                height: 60px;
                                margin-bottom: 15px;
                            }
                            
                            .jumuah-time-circle {
                                width: 70px;
                                height: 70px;
                                margin-bottom: 20px;
                            }
                            
                            .title-text {
                                font-size: 24px;
                                margin-bottom: 15px;
                            }
                            
                            .date-display {
                                font-size: 18px;
                                margin-bottom: 15px;
                            }
                            
                            .header-content {
                                padding: 25px 20px 20px;
                                margin-bottom: 25px;
                            }
                            
                            .jumuah-section {
                                padding: 25px 20px;
                                margin: 25px auto;
                            }
                            
                            /* Perfect consistent spacing for all prayer items on mobile */
                            .prayer-item {
                                margin-bottom: 40px !important;
                            }
                            
                            /* Remove extra spacing from prayer rows on mobile */
                            .prayer-row {
                                gap: 0 !important;
                                margin-bottom: 0 !important;
                            }
                            
                            .section-divider {
                                margin: 25px 0;
                            }
                            
                            /* Full Schedule Button Mobile Styling */
                            a[href*='docs.google.com'] {
                                font-size: 16px !important;
                                padding: 12px 24px !important;
                                width: 90% !important;
                                max-width: 300px !important;
                            }
                            
                            .prayer-name {
                                font-size: 18px;
                                margin-bottom: 12px;
                            }
                            
                            .prayer-time {
                                font-size: 16px;
                            }
                        }
                        
                        @media (max-width: 768px) and (min-width: 481px) {
                            #iqama-widget {
                                max-width: 90vw;
                                margin: 15px auto;
                            }
                            
                            .prayer-row {
                                gap: 15px;
                            }
                            
                            .prayer-item {
                                max-width: 120px;
                            }
                        }
                        
                        @media (min-width: 769px) {
                            #iqama-widget {
                                max-width: 450px !important;
                                margin: 20px auto !important;
                            }
                        }
                    </style>
            
            <div id="iqama-widget" class="enhanced-shadow iqama-widget-container" style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 450px;
                margin: 20px auto;
                background: linear-gradient(135deg, var(--background-color, ${CONFIG.backgroundColor}) 0%, #1A5F4A 50%, var(--background-color, ${CONFIG.backgroundColor}) 100%);
                border-radius: ${CONFIG.borderRadius};
                overflow: hidden;
                border: 2px solid var(--accent-color, ${CONFIG.accentColor});
                position: relative;
                --background-color: ${CONFIG.backgroundColor};
                --accent-color: ${CONFIG.accentColor};
            ">
                <div class="refined-border" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    opacity: 0.12;
                    pointer-events: none;
                "></div>
                
                <div class="header-content" style="
                    padding: 25px 20px 20px;
                    text-align: center;
                    position: relative;
                    z-index: 2;
                ">
                    <div class="date-display" style="
                        color: var(--accent-color, ${CONFIG.accentColor});
                        font-size: 22px;
                        font-weight: 500;
                        margin-bottom: 15px;
                        letter-spacing: 1px;
                        opacity: 0.9;
                        text-transform: uppercase;
                    ">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    
                    <div style="
                        color: var(--accent-color, ${CONFIG.accentColor});
                        margin-bottom: 20px;
                    ">
                        <span class="title-text widget-title" style="
                            font-size: 44px;
                            font-weight: 800;
                            font-family: 'Georgia', serif;
                            text-shadow: 0 3px 6px rgba(0,0,0,0.4);
                            letter-spacing: 1px;
                        ">${CONFIG.title}</span>
                    </div>
                    
                    <div class="location-text widget-location" style="
                        color: var(--accent-color, ${CONFIG.accentColor});
                        font-size: 28px;
                        font-weight: 600;
                        margin-bottom: 25px;
                        letter-spacing: 1.5px;
                        opacity: 0.95;
                    ">${CONFIG.location}</div>
                    

                </div>

                <div style="
                    padding: 25px;
                    position: relative;
                    z-index: 2;
                ">
                    <div class="prayer-row" style="
                        display: flex;
                        justify-content: space-around;
                        margin-bottom: 30px;
                        gap: 20px;
                    ">
                        ${['fajr', 'dhuhr', 'asr'].map(prayer => {
                            const isCurrent = prayer === currentPrayer && isCurrentPrayer;
                            const prayerNames = { fajr: 'Fajr', dhuhr: 'Zuhr', asr: 'Asr' };
                            const [time, period] = iqamaTimes[prayer].split(' ');
                            
                            return `
                                <div class="prayer-item" style="
                                    text-align: center;
                                    position: relative;
                                    margin-bottom: 40px;
                                ">
                                    <div style="
                                        color: ${CONFIG.accentColor};
                                        font-size: 28px;
                                        font-weight: 700;
                                        margin-bottom: 20px;
                                        letter-spacing: 0.8px;
                                    ">${prayerNames[prayer]}</div>
                                    
                                    <div class="${isCurrent ? 'current-prayer-glow' : ''}" style="
                                        width: 100px;
                                        height: 100px;
                                        border: 3px solid ${CONFIG.accentColor};
                                        border-radius: 50%;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        align-items: center;
                                        background: ${isCurrent ? `rgba(229, 231, 235, 0.1)` : 'transparent'};
                                        box-shadow: ${isCurrent ? `0 0 20px rgba(229, 231, 235, 0.3)` : 'none'};
                                        position: relative;
                                    ">
                                        <div style="
                                            color: ${CONFIG.accentColor};
                                            font-size: 32px;
                                            font-weight: 800;
                                            font-family: 'Courier New', monospace;
                                            line-height: 1;
                                        ">${time}</div>
                                        <div style="
                                            color: ${CONFIG.accentColor};
                                            font-size: 18px;
                                            font-weight: 600;
                                            text-transform: uppercase;
                                            letter-spacing: 0.8px;
                                            margin-top: 5px;
                                        ">${period.toLowerCase()}</div>
                                        ${isCurrent ? `
                                            <div style="
                                                position: absolute;
                                                top: -8px;
                                                right: -8px;
                                                width: 32px;
                                                height: 20px;
                                                background: linear-gradient(135deg, #FF6B6B, #FF8E53);
                                                border-radius: 10px;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                font-size: 8px;
                                                color: ${CONFIG.backgroundColor};
                                                font-weight: 700;
                                                letter-spacing: 0.5px;
                                                border: 2px solid ${CONFIG.backgroundColor};
                                                box-shadow: 0 0 10px rgba(229, 231, 235, 0.4);
                                            ">NOW</div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="prayer-row" style="
                        display: flex;
                        justify-content: center;
                        gap: 100px;
                        margin-bottom: 30px;
                    ">
                        ${['maghrib', 'isha'].map(prayer => {
                            const isCurrent = prayer === currentPrayer && isCurrentPrayer;
                            const prayerNames = { maghrib: 'Maghrib', isha: 'Isha' };
                            const [time, period] = iqamaTimes[prayer].split(' ');
                            
                            return `
                                <div class="prayer-item" style="
                                    text-align: center;
                                    position: relative;
                                    margin-bottom: 40px;
                                ">
                                    <div style="
                                        color: ${CONFIG.accentColor};
                                        font-size: 28px;
                                        font-weight: 700;
                                        margin-bottom: 20px;
                                        letter-spacing: 0.8px;
                                    ">${prayerNames[prayer]}</div>
                                    
                                    <div class="${isCurrent ? 'current-prayer-glow' : ''}" style="
                                        width: 100px;
                                        height: 100px;
                                        border: 3px solid ${CONFIG.accentColor};
                                        border-radius: 50%;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        align-items: center;
                                        background: ${isCurrent ? `rgba(229, 231, 235, 0.1)` : 'transparent'};
                                        box-shadow: ${isCurrent ? `0 0 20px rgba(229, 231, 235, 0.3)` : 'none'};
                                        position: relative;
                                    ">
                                        <div style="
                                            color: ${CONFIG.accentColor};
                                            font-size: 32px;
                                            font-weight: 800;
                                            font-family: 'Courier New', monospace;
                                            line-height: 1;
                                        ">${time}</div>
                                        <div style="
                                            color: ${CONFIG.accentColor};
                                            font-size: 18px;
                                            font-weight: 600;
                                            text-transform: uppercase;
                                            letter-spacing: 0.8px;
                                            margin-top: 5px;
                                        ">${period.toLowerCase()}</div>
                                        ${isCurrent ? `
                                            <div style="
                                                position: absolute;
                                                top: -8px;
                                                right: -8px;
                                                width: 32px;
                                                height: 20px;
                                                background: linear-gradient(135deg, #FF6B6B, #FF8E53);
                                                border-radius: 10px;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                font-size: 8px;
                                                color: ${CONFIG.backgroundColor};
                                                font-weight: 700;
                                                letter-spacing: 0.5px;
                                                border: 2px solid ${CONFIG.backgroundColor};
                                                box-shadow: 0 0 10px rgba(229, 231, 235, 0.4);
                                            ">NOW</div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="
                        text-align: center;
                        margin: 20px 0;
                        padding: 15px;
                        background: rgba(229, 231, 235, 0.05);
                        border-radius: 10px;
                        border: 1px solid rgba(229, 231, 235, 0.2);
                    ">
                        <div style="
                            color: ${CONFIG.accentColor};
                            font-size: 22px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        ">${statusText}: ${(isCurrentPrayer ? currentPrayer : nextPrayer).charAt(0).toUpperCase() + (isCurrentPrayer ? currentPrayer : nextPrayer).slice(1)} (${nextPrayerTime})${isNextDayFajr ? ` - ${tomorrowFormatted}` : ''}</div>
                    </div>
                
                <div class="section-divider"></div>
                
                    <div class="jumuah-section enhanced-shadow" style="
                        text-align: center;
                        margin-top: 40px;
                        padding: 25px;
                        background: linear-gradient(135deg, rgba(229, 231, 235, 0.08), rgba(229, 231, 235, 0.03));
                        border: 2px solid ${CONFIG.accentColor};
                        border-radius: 18px;
                        max-width: 220px;
                        margin-left: auto;
                        margin-right: auto;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            opacity: 0.1;
                            background-image: 
                                radial-gradient(circle at 20% 20%, ${CONFIG.accentColor} 1px, transparent 1px),
                                radial-gradient(circle at 80% 80%, ${CONFIG.accentColor} 1px, transparent 1px);
                            background-size: 20px 20px;
                            pointer-events: none;
                        "></div>
                        <div style="
                            margin-bottom: 25px;
                            text-align: center;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 32px;
                                font-weight: 800;
                                letter-spacing: 2px;
                                text-transform: uppercase;
                                margin-bottom: 8px;
                                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            ">Jumuah</div>
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 20px;
                                font-weight: 600;
                                letter-spacing: 1px;
                                opacity: 0.9;
                                font-style: italic;
                                text-transform: capitalize;
                            ">Friday Prayer</div>
                        </div>
                        
                        <div class="jumuah-time-circle ${currentPrayer === 'jumuah' && isCurrentPrayer ? 'current-prayer-glow' : ''}" style="
                            width: 120px;
                            height: 120px;
                            border: 3px solid ${CONFIG.accentColor};
                            border-radius: 50%;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            background: ${currentPrayer === 'jumuah' && isCurrentPrayer ? 'rgba(229, 231, 235, 0.2)' : 'rgba(229, 231, 235, 0.08)'};
                            position: relative;
                            margin: 0 auto;
                            transition: all 0.3s ease;
                        ">
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 36px;
                                font-weight: 800;
                                font-family: 'Courier New', monospace;
                                line-height: 1;
                                text-align: center;
                            ">1:00</div>
                            <div style="
                                color: ${CONFIG.accentColor};
                                font-size: 20px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin-top: 8px;
                                text-align: center;
                            ">pm</div>
                            ${currentPrayer === 'jumuah' && isCurrentPrayer ? `
                                <div style="
                                    position: absolute;
                                    top: -12px;
                                    right: -12px;
                                    width: 36px;
                                    height: 24px;
                                    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
                                    border-radius: 12px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 9px;
                                    color: ${CONFIG.backgroundColor};
                                    font-weight: 800;
                                    letter-spacing: 0.5px;
                                    box-shadow: 0 0 20px rgba(229, 231, 235, 0.6);
                                    border: 2px solid ${CONFIG.backgroundColor};
                                ">NOW</div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div style="
                    text-align: center;
                    margin-top: 30px;
                    padding: 20px;
                ">
                    <a href="${CONFIG.googleSheetUrl}" 
                       target="_blank"
                       style="
                            display: inline-block;
                            background: linear-gradient(135deg, ${CONFIG.accentColor}, #B8860B);
                            color: ${CONFIG.backgroundColor};
                            padding: 15px 30px;
                            border-radius: 25px;
                            text-decoration: none;
                            font-size: 18px;
                            font-weight: 700;
                            letter-spacing: 1px;
                            text-transform: uppercase;
                            border: 2px solid ${CONFIG.backgroundColor};
                            box-shadow: 0 4px 15px rgba(229, 231, 235, 0.3);
                            transition: all 0.3s ease;
                       "
                       onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(229, 231, 235, 0.4)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(229, 231, 235, 0.3)'"
                    >
                        View Full Iqama Schedule
                    </a>
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

        // Auto-refresh every minute to update next prayer highlight
        setInterval(() => {
            const widget = document.getElementById('iqama-widget');
            if (widget) {
                widget.remove();
                createWidget();
            }
        }, 60000);
        
        // Daily update at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            setInterval(() => {
                console.log('🔄 Daily update: Refreshing widget for new date');
                const widget = document.getElementById('iqama-widget');
                if (widget) {
                    widget.remove();
                    createWidget();
                }
            }, 86400000);
            
            console.log('🔄 Daily update: Refreshing widget for new date');
            const widget = document.getElementById('iqama-widget');
            if (widget) {
                widget.remove();
                createWidget();
            }
        }, timeUntilMidnight);
    }

    // Initialize the widget by fetching data first
    fetchPrayerTimes();
    
    // Expose functions for interactive demo
    window.refreshWidget = () => {
        const widget = document.getElementById('iqama-widget');
        if (widget) {
            widget.remove();
        }
        createWidget();
    };
    
    window.createWidget = createWidget;
})();
