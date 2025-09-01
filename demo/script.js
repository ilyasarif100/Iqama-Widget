// Global variables
let currentTimeType = 'athan';
let currentJumuahCount = 1;
let currentBackgroundColor = '#1a1a1a';
let currentAccentColor = '#ffffff';

// Input elements
const inputs = {
    title: document.getElementById('title') || { value: 'Masjid Al-Noor' },
    location: document.getElementById('location') || { value: 'Phoenix, United States' },
    googleSheetUrl: document.getElementById('googleSheetUrl') || { value: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing' }
};

// Widget configuration
window.IqamaWidgetConfig = {
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing',
    title: 'Masjid Al-Noor',
    location: 'Phoenix, United States',
    backgroundColor: '#1a1a1a',
    accentColor: '#ffffff',
    borderRadius: '20px',
    timeType: 'athan',
    jumuahCount: 1
};

// Update widget function
function updateWidget() {
    console.log('🔄 Updating widget...');
    
    // Update configuration
    window.IqamaWidgetConfig.title = inputs.title.value;
    window.IqamaWidgetConfig.location = inputs.location.value;
    window.IqamaWidgetConfig.masjidAddress = inputs.location.value; // Use location as masjid address
    window.IqamaWidgetConfig.googleSheetUrl = inputs.googleSheetUrl.value;
    window.IqamaWidgetConfig.timeType = currentTimeType;
    window.IqamaWidgetConfig.jumuahCount = currentJumuahCount;
    window.IqamaWidgetConfig.backgroundColor = currentBackgroundColor;
    window.IqamaWidgetConfig.accentColor = currentAccentColor;
    
    console.log('📊 Updated config:', window.IqamaWidgetConfig);
    
    // Update generated code
    updateGeneratedCode(window.IqamaWidgetConfig);
    
    // Recreate widget if it exists
    const existingWidget = document.getElementById('iqama-widget');
    if (existingWidget) {
        existingWidget.remove();
    }
    
    // Create new widget and return its promise
    if (window.createWidget) {
        return window.createWidget().then(() => {
            // Move the widget to the preview container if it exists
            const widget = document.getElementById('iqama-widget');
            const previewContainer = document.getElementById('widget-preview');
            if (widget && previewContainer) {
                previewContainer.appendChild(widget);
            }
        });
    }
    return Promise.resolve();
}

/* Smooth color update function */
function updateColorsSmoothly(widget, backgroundColor, accentColor) {
    console.log('🔄 Updating colors smoothly:', backgroundColor, accentColor);
    
    // Determine text color based on background brightness
    const textColor = getContrastingTextColor(backgroundColor);
    
    // Create glassmorphism background
    const glassmorphism = createGlassmorphism(backgroundColor, accentColor);
    
    // Update widget background with glassmorphism
    widget.style.background = glassmorphism;
    widget.style.backdropFilter = 'blur(20px)';
    widget.style.webkitBackdropFilter = 'blur(20px)';
    
    // Update CSS custom properties
    widget.style.setProperty('--background-color', backgroundColor);
    widget.style.setProperty('--accent-color', textColor);
    
    // Update all elements with inline color styles to use white or black
    const allElements = widget.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.style && element.style.color) {
            element.style.color = textColor;
        }
    });
    
    // Update description card styling
    const descriptionCard = widget.querySelector('.prayer-times-description-card');
    if (descriptionCard) {
        const cardColors = getCardColors(backgroundColor);
        descriptionCard.style.background = cardColors.background;
        descriptionCard.style.borderColor = cardColors.border;
    }
    
    // Update Jumuah section styling
    const jumuahSection = widget.querySelector('.jumuah-section');
    if (jumuahSection) {
        const cardColors = getCardColors(backgroundColor);
        jumuahSection.style.background = cardColors.background;
        jumuahSection.style.borderColor = cardColors.border;
        
        // Update individual Jumuah prayer containers
        const jumuahContainers = jumuahSection.querySelectorAll('.jumuah-grid > div');
        jumuahContainers.forEach(container => {
            container.style.background = cardColors.backgroundActive;
            container.style.borderColor = cardColors.borderActive;
        });
    }
    
    // Update the button specifically
    const button = widget.querySelector('a[href*="google.com"]');
    if (button) {
        const buttonTextColor = getContrastingTextColor(accentColor);
        button.style.background = accentColor;
        button.style.color = buttonTextColor;
        button.style.borderColor = accentColor;
        console.log('🔘 Button updated - background:', accentColor, 'text:', buttonTextColor);
    }
    
    // Also update the main widget color
    widget.style.color = textColor;
    
    console.log('✅ Colors updated smoothly - text color:', textColor);
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

// Smooth time type update function
function updateTimeTypeSmoothly(widget, timeType) {
    console.log('🔄 Updating time type smoothly:', timeType);
    
    // Update the prayer times heading
    const prayerTimesHeading = widget.querySelector('.prayer-times-heading');
    if (prayerTimesHeading) {
        prayerTimesHeading.textContent = timeType === 'athan' ? 'Athan Times' : 'Iqama Times';
    }
    
    // Update the prayer times description
    const prayerTimesDescription = widget.querySelector('.prayer-times-description');
    if (prayerTimesDescription) {
        prayerTimesDescription.textContent = timeType === 'athan' ? 
            'Times shown are when the Athan (call to prayer) is announced' : 
            'Times shown are when the Iqama (prayer begins) is called';
    }
    
    // Update the description card styling if it exists
    const descriptionCard = widget.querySelector('.prayer-times-description-card');
    if (descriptionCard) {
        // Update card styling based on current background color
        const currentConfig = window.IqamaWidgetConfig || CONFIG;
        const cardColors = getCardColors(currentConfig.backgroundColor);
        
        descriptionCard.style.background = cardColors.background;
        descriptionCard.style.borderColor = cardColors.border;
        descriptionCard.style.display = 'block';
    }
    
    // Update the time type display (legacy)
    const timeTypeDisplay = widget.querySelector('.time-type-display');
    if (timeTypeDisplay) {
        timeTypeDisplay.textContent = timeType === 'athan' ? '🕌 Athan Times' : '🕌 Iqama Times';
    }
    

    
    console.log('✅ Time type updated smoothly');
}

// Smooth Jumuah section update function
function updateJumuahSectionSmoothly(widget, jumuahCount) {
    console.log('🔄 Updating Jumuah section smoothly for count:', jumuahCount);
    
    const jumuahSection = widget.querySelector('.jumuah-section');
    if (!jumuahSection) {
        console.log('❌ No Jumuah section found, recreating widget');
        // Fallback to full widget recreation
        window.createWidget().then(() => {
            const newWidget = document.getElementById('iqama-widget');
            if (newWidget && document.getElementById('widget-preview')) {
                document.getElementById('widget-preview').innerHTML = '';
                document.getElementById('widget-preview').appendChild(newWidget);
            }
        });
        return;
    }
    
    // Get current accent color from widget
    const accentColor = getComputedStyle(widget).getPropertyValue('--accent-color') || '#E5E7EB';
    
    // Use fallback times for speed
    const currentTimes = {
        jumuah1: '1:30 PM - 2:00 PM',
        jumuah2: '2:30 PM - 3:00 PM', 
        jumuah3: '3:30 PM - 4:00 PM'
    };
    
    // Create new Jumuah HTML based on count
    let newJumuahHTML;
    if (jumuahCount === 1) {
        newJumuahHTML = `
            <div style="
                color: ${accentColor};
                font-size: 18px;
                font-weight: 600;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                letter-spacing: -0.01em;
                line-height: 1.4;
                margin-bottom: 8px;
                                        ">Jumuah Prayer</div>
            <div style="
                color: ${accentColor};
                font-size: 16px;
                font-weight: 500;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                letter-spacing: -0.01em;
                line-height: 1.4;
            ">${currentTimes.jumuah1}</div>
        `;
    } else {
        newJumuahHTML = `
            <div style="
                color: ${accentColor};
                font-size: 16px;
                font-weight: 600;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                letter-spacing: -0.01em;
                line-height: 1.4;
                margin-bottom: 16px;
            ">Jumuah Prayers</div>
            <div class="jumuah-grid" style="
                display: grid;
                grid-template-columns: ${jumuahCount === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'};
                gap: 16px;
                margin-top: 16px;
            ">
                ${[1, 2, 3].slice(0, jumuahCount).map(num => `
                    <div style="
                        padding: 16px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    ">
                        <div style="
                            color: rgba(255, 255, 255, 0.8);
                            font-size: 14px;
                            font-weight: 500;
                            margin-bottom: 8px;
                        ">${num === 1 ? '1st' : num === 2 ? '2nd' : '3rd'} Jumuah Prayer</div>
                        <div style="
                            color: ${accentColor};
                            font-size: 16px;
                            font-weight: 600;
                        ">${currentTimes[`jumuah${num}`] || '1:30 PM'}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Update the Jumuah section content
    jumuahSection.innerHTML = newJumuahHTML;
    
    // Add responsive CSS for the jumuah-grid
    if (jumuahCount > 1) {
        const jumuahGrid = jumuahSection.querySelector('.jumuah-grid');
        if (jumuahGrid) {
            const style = document.createElement('style');
            style.textContent = `
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
            `;
            document.head.appendChild(style);
        }
    }
    
    console.log('✅ Jumuah section updated successfully');
}

// Update generated code display
function updateGeneratedCode(config) {
    // Safety check for undefined config
    if (!config) {
        config = {
            googleSheetUrl: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing',
            title: 'Masjid Al-Noor',
            location: 'Phoenix, United States',
            backgroundColor: '#1a1a1a',
            accentColor: '#ffffff',
            timeType: 'athan',
            jumuahCount: 1,
            webhookUrl: '',
            webhookSecret: '',
            masjidAddress: 'Phoenix, United States'
        };
    }
    
    const code = `<!-- Prayer Times Widget -->
&lt;div id="iqama-widget-container"&gt;&lt;/div&gt;

&lt;script&gt;
// Widget configuration
window.IqamaWidgetConfig = {
    googleSheetUrl: '${config.googleSheetUrl || ''}',
    title: '${config.title || ''}',
    location: '${config.location || ''}',
    masjidAddress: '${config.masjidAddress || ''}',
    backgroundColor: '${config.backgroundColor || '#1a1a1a'}',
    accentColor: '${config.accentColor || '#ffffff'}',
    borderRadius: '20px',
    timeType: '${config.timeType || 'athan'}',
    jumuahCount: ${config.jumuahCount || 1}
};

// Load the widget script
const script = document.createElement('script');
script.src = 'https://ilyasarif.github.io/Iqama-Widget/iqama-widget-cloud.js';
document.head.appendChild(script);
&lt;/script&gt;`;
    
    // Update the DOM element
    const codeElement = document.getElementById('generatedCode');
    if (codeElement) {
        codeElement.textContent = code;
        console.log('📋 Generated code updated:', config);
    }
}

// Copy configuration code
function copyConfig() {
    const codeElement = document.getElementById('generatedCode');
    const textArea = document.createElement('textarea');
    textArea.value = codeElement.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Debounce function to prevent too many rapid updates
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Color scheme selection function
function selectColorScheme(element) {
    console.log('🎨 Color scheme selected:', element.dataset.background);
    
    // Remove active class from all scheme options
    document.querySelectorAll('.scheme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected option
    element.classList.add('active');
    
    // Update color variables
    currentBackgroundColor = element.dataset.background;
    currentAccentColor = element.dataset.accent;
    console.log('📊 Updated colors:', currentBackgroundColor, currentAccentColor);
    
    // Update widget configuration
    window.IqamaWidgetConfig.backgroundColor = currentBackgroundColor;
    window.IqamaWidgetConfig.accentColor = currentAccentColor;
    
    // Update generated code
    updateGeneratedCode(window.IqamaWidgetConfig);
    
    // Update the existing widget smoothly
    const existingWidget = document.getElementById('iqama-widget');
    if (existingWidget) {
        updateColorsSmoothly(existingWidget, currentBackgroundColor, currentAccentColor);
    }
}

// Debounced update function
const debouncedUpdateWidget = debounce(updateWidget, 300);

// Add event listeners to all inputs for live updates
Object.values(inputs).forEach(input => {
    if (input && typeof input.addEventListener === 'function') {
        input.addEventListener('input', debouncedUpdateWidget);
        input.addEventListener('change', updateWidget);
    }
});

// Initialize
updateGeneratedCode(window.IqamaWidgetConfig);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ========================================
// LOCATION SEARCH & SUNRISE API
// ========================================

// Global variables for location handling
let locationSearchTimeout;
let currentSuggestions = [];
let selectedSuggestionIndex = -1;
let currentLocationData = {
    city: 'Phoenix',
    countryCode: 'US',
    lat: 33.4484,
    lng: -112.0740,
    displayName: 'Phoenix, United States',
    isValid: true
};

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cache for city search results
const citySearchCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Abort controller for cancelling previous requests
let currentSearchController = null;

// Performance optimizations
let searchTimeout = null;
let isSearching = false;
let lastSearchQuery = '';

// Popular cities database for instant local search
const POPULAR_CITIES = [
    { name: "New York", state: "NY", country: "United States", lat: 40.7128, lng: -74.0060 },
    { name: "Los Angeles", state: "CA", country: "United States", lat: 34.0522, lng: -118.2437 },
    { name: "Chicago", state: "IL", country: "United States", lat: 41.8781, lng: -87.6298 },
    { name: "Houston", state: "TX", country: "United States", lat: 29.7604, lng: -95.3698 },
    { name: "Phoenix", state: "AZ", country: "United States", lat: 33.4484, lng: -112.0740 },
    { name: "Philadelphia", state: "PA", country: "United States", lat: 39.9526, lng: -75.1652 },
    { name: "San Antonio", state: "TX", country: "United States", lat: 29.4241, lng: -98.4936 },
    { name: "San Diego", state: "CA", country: "United States", lat: 32.7157, lng: -117.1611 },
    { name: "Dallas", state: "TX", country: "United States", lat: 32.7767, lng: -96.7970 },
    { name: "San Jose", state: "CA", country: "United States", lat: 37.3382, lng: -121.8863 },
    { name: "Austin", state: "TX", country: "United States", lat: 30.2672, lng: -97.7431 },
    { name: "Jacksonville", state: "FL", country: "United States", lat: 30.3322, lng: -81.6557 },
    { name: "Fort Worth", state: "TX", country: "United States", lat: 32.7555, lng: -97.3308 },
    { name: "Columbus", state: "OH", country: "United States", lat: 39.9612, lng: -82.9988 },
    { name: "Charlotte", state: "NC", country: "United States", lat: 35.2271, lng: -80.8431 },
    { name: "San Francisco", state: "CA", country: "United States", lat: 37.7749, lng: -122.4194 },
    { name: "Indianapolis", state: "IN", country: "United States", lat: 39.7684, lng: -86.1581 },
    { name: "Seattle", state: "WA", country: "United States", lat: 47.6062, lng: -122.3321 },
    { name: "Denver", state: "CO", country: "United States", lat: 39.7392, lng: -104.9903 },
    { name: "Washington", state: "DC", country: "United States", lat: 38.9072, lng: -77.0369 },
    { name: "Boston", state: "MA", country: "United States", lat: 42.3601, lng: -71.0589 },
    { name: "El Paso", state: "TX", country: "United States", lat: 31.7619, lng: -106.4850 },
    { name: "Nashville", state: "TN", country: "United States", lat: 36.1627, lng: -86.7816 },
    { name: "Detroit", state: "MI", country: "United States", lat: 42.3314, lng: -83.0458 },
    { name: "Oklahoma City", state: "OK", country: "United States", lat: 35.4676, lng: -97.5164 },
    { name: "Portland", state: "OR", country: "United States", lat: 45.5152, lng: -122.6784 },
    { name: "Las Vegas", state: "NV", country: "United States", lat: 36.1699, lng: -115.1398 },
    { name: "Memphis", state: "TN", country: "United States", lat: 35.1495, lng: -90.0490 },
    { name: "Louisville", state: "KY", country: "United States", lat: 38.2527, lng: -85.7585 },
    { name: "Baltimore", state: "MD", country: "United States", lat: 39.2904, lng: -76.6122 },
    { name: "Milwaukee", state: "WI", country: "United States", lat: 43.0389, lng: -87.9065 },
    { name: "Albuquerque", state: "NM", country: "United States", lat: 35.0844, lng: -106.6504 },
    { name: "Tucson", state: "AZ", country: "United States", lat: 32.2226, lng: -110.9747 },
    { name: "Fresno", state: "CA", country: "United States", lat: 36.7378, lng: -119.7871 },
    { name: "Sacramento", state: "CA", country: "United States", lat: 37.7749, lng: -121.4194 },
    { name: "Mesa", state: "AZ", country: "United States", lat: 33.4152, lng: -111.8315 },
    { name: "Kansas City", state: "MO", country: "United States", lat: 39.0997, lng: -94.5786 },
    { name: "Atlanta", state: "GA", country: "United States", lat: 33.7490, lng: -84.3880 },
    { name: "Long Beach", state: "CA", country: "United States", lat: 33.7701, lng: -118.1937 },
    { name: "Colorado Springs", state: "CO", country: "United States", lat: 38.8339, lng: -104.8214 },
    { name: "Raleigh", state: "NC", country: "United States", lat: 35.7796, lng: -78.6382 },
    { name: "Miami", state: "FL", country: "United States", lat: 25.7617, lng: -80.1918 },
    { name: "Virginia Beach", state: "VA", country: "United States", lat: 36.8529, lng: -75.9780 },
    { name: "Omaha", state: "NE", country: "United States", lat: 41.2565, lng: -95.9345 },
    { name: "Oakland", state: "CA", country: "United States", lat: 37.8044, lng: -122.2712 },
    { name: "Minneapolis", state: "MN", country: "United States", lat: 44.9778, lng: -93.2650 },
    { name: "Tulsa", state: "OK", country: "United States", lat: 36.1540, lng: -95.9928 },
    { name: "Arlington", state: "TX", country: "United States", lat: 32.7357, lng: -97.1081 },
    { name: "Tampa", state: "FL", country: "United States", lat: 27.9506, lng: -82.4572 },
    { name: "New Orleans", state: "LA", country: "United States", lat: 29.9511, lng: -90.0715 },
    { name: "Wichita", state: "KS", country: "United States", lat: 37.6872, lng: -97.3301 },
    { name: "Cleveland", state: "OH", country: "United States", lat: 41.4993, lng: -81.6944 },
    { name: "Bakersfield", state: "CA", country: "United States", lat: 35.3733, lng: -119.0187 },
    { name: "Aurora", state: "CO", country: "United States", lat: 39.7294, lng: -104.8319 },
    { name: "Anaheim", state: "CA", country: "United States", lat: 33.8366, lng: -117.9143 },
    { name: "Honolulu", state: "HI", country: "United States", lat: 21.3099, lng: -157.8581 },
    { name: "Santa Ana", state: "CA", country: "United States", lat: 33.7455, lng: -117.8677 },
    { name: "Corpus Christi", state: "TX", country: "United States", lat: 27.8006, lng: -97.3964 },
    { name: "Riverside", state: "CA", country: "United States", lat: 33.9533, lng: -117.3962 },
    { name: "Lexington", state: "KY", country: "United States", lat: 38.0406, lng: -84.5037 },
    { name: "Stockton", state: "CA", country: "United States", lat: 37.9577, lng: -121.2908 },
    { name: "Henderson", state: "NV", country: "United States", lat: 36.0395, lng: -114.9817 },
    { name: "Saint Paul", state: "MN", country: "United States", lat: 44.9537, lng: -93.0900 },
    { name: "St. Louis", state: "MO", country: "United States", lat: 38.6270, lng: -90.1994 },
    { name: "Milwaukee", state: "WI", country: "United States", lat: 43.0389, lng: -87.9065 },
    { name: "London", state: "", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
    { name: "Toronto", state: "ON", country: "Canada", lat: 43.6532, lng: -79.3832 },
    { name: "Vancouver", state: "BC", country: "Canada", lat: 49.2827, lng: -123.1207 },
    { name: "Montreal", state: "QC", country: "Canada", lat: 45.5017, lng: -73.5673 },
    { name: "Calgary", state: "AB", country: "Canada", lat: 51.0447, lng: -114.0719 },
    { name: "Ottawa", state: "ON", country: "Canada", lat: 45.4215, lng: -75.6972 },
    { name: "Edmonton", state: "AB", country: "Canada", lat: 53.5461, lng: -113.4938 },
    { name: "Winnipeg", state: "MB", country: "Canada", lat: 49.8951, lng: -97.1384 },
    { name: "Quebec City", state: "QC", country: "Canada", lat: 46.8139, lng: -71.2080 },
    { name: "Hamilton", state: "ON", country: "Canada", lat: 43.2557, lng: -79.8711 },
    { name: "Sydney", state: "NSW", country: "Australia", lat: -33.8688, lng: 151.2093 },
    { name: "Melbourne", state: "VIC", country: "Australia", lat: -37.8136, lng: 144.9631 },
    { name: "Brisbane", state: "QLD", country: "Australia", lat: -27.4698, lng: 153.0251 },
    { name: "Perth", state: "WA", country: "Australia", lat: -31.9505, lng: 115.8605 },
    { name: "Adelaide", state: "SA", country: "Australia", lat: -34.9285, lng: 138.6007 },
    { name: "Paris", state: "", country: "France", lat: 48.8566, lng: 2.3522 },
    { name: "Berlin", state: "", country: "Germany", lat: 52.5200, lng: 13.4050 },
    { name: "Madrid", state: "", country: "Spain", lat: 40.4168, lng: -3.7038 },
    { name: "Rome", state: "", country: "Italy", lat: 41.9028, lng: 12.4964 },
    { name: "Amsterdam", state: "", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
    { name: "Brussels", state: "", country: "Belgium", lat: 50.8503, lng: 4.3517 },
    { name: "Stockholm", state: "", country: "Sweden", lat: 59.3293, lng: 18.0686 },
    { name: "Oslo", state: "", country: "Norway", lat: 59.9139, lng: 10.7522 },
    { name: "Copenhagen", state: "", country: "Denmark", lat: 55.6761, lng: 12.5683 },
    { name: "Helsinki", state: "", country: "Finland", lat: 60.1699, lng: 24.9384 },
    { name: "Warsaw", state: "", country: "Poland", lat: 52.2297, lng: 21.0122 },
    { name: "Prague", state: "", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
    { name: "Vienna", state: "", country: "Austria", lat: 48.2082, lng: 16.3738 },
    { name: "Zurich", state: "", country: "Switzerland", lat: 47.3769, lng: 8.5417 },
    { name: "Lisbon", state: "", country: "Portugal", lat: 38.7223, lng: -9.1393 },
    { name: "Dublin", state: "", country: "Ireland", lat: 53.3498, lng: -6.2603 },
    { name: "Athens", state: "", country: "Greece", lat: 37.9838, lng: 23.7275 },
    { name: "Budapest", state: "", country: "Hungary", lat: 47.4979, lng: 19.0402 },
    { name: "Bucharest", state: "", country: "Romania", lat: 44.4268, lng: 26.1025 },
    { name: "Sofia", state: "", country: "Bulgaria", lat: 42.6977, lng: 23.3219 },
    { name: "Zagreb", state: "", country: "Croatia", lat: 45.8150, lng: 15.9819 },
    { name: "Ljubljana", state: "", country: "Slovenia", lat: 46.0569, lng: 14.5058 },
    { name: "Bratislava", state: "", country: "Slovakia", lat: 48.1486, lng: 17.1077 },
    { name: "Tallinn", state: "", country: "Estonia", lat: 59.4370, lng: 24.7536 },
    { name: "Riga", state: "", country: "Latvia", lat: 56.9496, lng: 24.1052 },
    { name: "Vilnius", state: "", country: "Lithuania", lat: 54.6872, lng: 25.2797 },
    { name: "Luxembourg", state: "", country: "Luxembourg", lat: 49.6116, lng: 6.1319 },
    { name: "Valletta", state: "", country: "Malta", lat: 35.8989, lng: 14.5146 },
    { name: "Nicosia", state: "", country: "Cyprus", lat: 35.1856, lng: 33.3823 }
];

// Fuzzy search function for intelligent matching
function fuzzySearch(query, cities) {
    const queryLower = query.toLowerCase().trim();
    const results = [];
    
    for (const city of cities) {
        const cityName = city.name.toLowerCase();
        const state = city.state.toLowerCase();
        const country = city.country.toLowerCase();
        const fullName = `${cityName} ${state} ${country}`.trim();
        
        let score = 0;
        
        // Exact match gets highest score
        if (cityName === queryLower) {
            score = 1000;
        }
        // Starts with query
        else if (cityName.startsWith(queryLower)) {
            score = 800;
        }
        // Contains query
        else if (cityName.includes(queryLower)) {
            score = 600;
        }
        // State match
        else if (state.includes(queryLower)) {
            score = 400;
        }
        // Country match
        else if (country.includes(queryLower)) {
            score = 200;
        }
        // Fuzzy match (Levenshtein distance)
        else {
            const distance = levenshteinDistance(queryLower, cityName);
            const maxLength = Math.max(queryLower.length, cityName.length);
            const similarity = (maxLength - distance) / maxLength;
            if (similarity > 0.6) {
                score = Math.floor(similarity * 300);
            }
        }
        
        if (score > 0) {
            results.push({ ...city, score });
        }
    }
    
    return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

// LIGHTNING FAST search with aggressive optimizations
async function searchCities(query) {
    const trimmedQuery = query.trim();
    
    // Early exit for invalid queries
    if (!trimmedQuery || trimmedQuery.length < 2) {
        hideSuggestions();
        return;
    }

    // Instant search for very short queries (2-3 chars) - local only
    if (trimmedQuery.length <= 3) {
        const localResults = fuzzySearch(trimmedQuery.toLowerCase(), POPULAR_CITIES);
        if (localResults.length > 0) {
            const formattedResults = localResults.map(city => ({
                name: city.name,
                lat: city.lat,
                lon: city.lng,
                address: {
                    city: city.name,
                    state: city.state,
                    country: city.country,
                    country_code: city.country === 'United States' ? 'us' : 
                                 city.country === 'Canada' ? 'ca' : 
                                 city.country === 'United Kingdom' ? 'gb' : 'xx'
                }
            }));
            currentSuggestions = formattedResults;
            showSuggestions(formattedResults);
        } else {
            hideSuggestions();
        }
        return; // Skip API for short queries
    }

    // Prevent duplicate searches
    if (trimmedQuery === lastSearchQuery && isSearching) {
        return;
    }

    lastSearchQuery = trimmedQuery;

    // Cancel any pending search
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    if (currentSearchController) {
        currentSearchController.abort();
    }

    // INSTANT LOCAL SEARCH FIRST (0ms response)
    const cacheKey = trimmedQuery.toLowerCase();
    const localResults = fuzzySearch(cacheKey, POPULAR_CITIES);
    
    if (localResults.length > 0) {
        console.log('⚡ Instant local match for:', trimmedQuery);
        const formattedResults = localResults.map(city => ({
            name: city.name,
            lat: city.lat,
            lon: city.lng,
            address: {
                city: city.name,
                state: city.state,
                country: city.country,
                country_code: city.country === 'United States' ? 'us' : 
                             city.country === 'Canada' ? 'ca' : 
                             city.country === 'United Kingdom' ? 'gb' : 'xx'
            }
        }));
        
        currentSuggestions = formattedResults;
        showSuggestions(formattedResults);
        
        // If we have a perfect match, skip API call
        if (localResults[0].score >= 800) {
            return;
        }
    }

    // Check cache for API results
    const cached = citySearchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        console.log('🚀 Using cached API results for:', trimmedQuery);
        currentSuggestions = cached.data;
        if (cached.data && cached.data.length > 0) {
            showSuggestions(cached.data);
        } else {
            showNoResults();
        }
        return;
    }

    // Show loading only if no local results
    if (localResults.length === 0) {
        showLoading();
    }

    // API search with timeout
    isSearching = true;
    currentSearchController = new AbortController();

    try {
        // Optimized API call with minimal payload
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(trimmedQuery)}&featuretype=city&bounded=0&dedupe=1`, {
            signal: currentSearchController.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'IqamaWidget/1.0'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();

        // Cache results immediately with size limit
        citySearchCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        // Aggressive cache cleanup (keep only 20 most recent)
        if (citySearchCache.size > 20) {
            const entries = Array.from(citySearchCache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            citySearchCache.clear();
            entries.slice(0, 20).forEach(([key, value]) => {
                citySearchCache.set(key, value);
            });
        }

        // Merge with local results if any
        let finalResults = data || [];
        if (localResults.length > 0 && data && data.length > 0) {
            // Remove duplicates and merge
            const apiNames = new Set(data.map(item => item.name.toLowerCase()));
            const uniqueLocalResults = localResults.filter(local => 
                !apiNames.has(local.name.toLowerCase())
            );
            
            const formattedLocalResults = uniqueLocalResults.map(city => ({
                name: city.name,
                lat: city.lat,
                lon: city.lng,
                address: {
                    city: city.name,
                    state: city.state,
                    country: city.country,
                    country_code: city.country === 'United States' ? 'us' : 
                                 city.country === 'Canada' ? 'ca' : 
                                 city.country === 'United Kingdom' ? 'gb' : 'xx'
                }
            }));
            
            finalResults = [...formattedLocalResults, ...data].slice(0, 5);
        }

        currentSuggestions = finalResults;
        if (finalResults.length > 0) {
            showSuggestions(finalResults);
        } else {
            showNoResults();
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            return; // Search was cancelled, don't show error
        }
        
        console.error('❌ API search error:', error);
        
        // Only show error if no local results
        if (localResults.length === 0) {
            showError('Search temporarily unavailable');
        }
    } finally {
        isSearching = false;
    }
}

// Show city suggestions (ultra-optimized for speed)
function showSuggestions(cities) {
    const suggestionsElement = document.getElementById('locationSuggestions');
    
    // Use innerHTML for maximum speed (faster than DOM manipulation for small lists)
    const html = cities.map((city, index) => {
        const address = city.address;
        const cityName = address.city || address.town || address.village || city.name || 'Unknown City';
        const state = address.state || address.province || address.region || '';
        const country = address.country || 'Unknown Country';
        const countryCode = address.country_code || 'XX';
        
        const displayName = state ? `${cityName}, ${state}` : cityName;
        
        return `<div class="location-suggestion" data-index="${index}" data-city="${cityName}" data-country="${country}" data-country-code="${countryCode}" data-lat="${city.lat}" data-lng="${city.lon}">
            <div class="suggestion-main">${displayName}</div>
            <div class="suggestion-detail">${country}</div>
        </div>`;
    }).join('');
    
    // Single DOM update for maximum performance
    suggestionsElement.innerHTML = html;
    suggestionsElement.style.display = 'block';
}

// Show loading message
function showLoading() {
    const suggestionsElement = document.getElementById('locationSuggestions');
    suggestionsElement.innerHTML = `
        <div class="location-suggestion" style="color: #6b7280; font-style: italic; display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top: 2px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Loading cities...
        </div>
    `;
    suggestionsElement.style.display = 'block';
}

// Show no results message
function showNoResults() {
    const suggestionsElement = document.getElementById('locationSuggestions');
    suggestionsElement.innerHTML = `
        <div class="location-suggestion" style="color: #6b7280; font-style: italic;">
            No cities found. Try a different search term.
        </div>
    `;
    suggestionsElement.style.display = 'block';
}

// Show error message
function showError(message) {
    const suggestionsElement = document.getElementById('locationSuggestions');
    suggestionsElement.innerHTML = `
        <div class="location-suggestion" style="color: #ef4444; font-style: italic;">
            ${message}
        </div>
    `;
    suggestionsElement.style.display = 'block';
}

// Hide suggestions
function hideSuggestions() {
    const suggestionsElement = document.getElementById('locationSuggestions');
    suggestionsElement.style.display = 'none';
    selectedSuggestionIndex = -1;
}

// Update selected suggestion for keyboard navigation
function updateSelectedSuggestion() {
    const suggestions = document.querySelectorAll('.location-suggestion');
    suggestions.forEach((suggestion, index) => {
        if (index === selectedSuggestionIndex) {
            suggestion.classList.add('selected');
        } else {
            suggestion.classList.remove('selected');
        }
    });
}

// Select a city from suggestions
async function selectCity(cityElement) {
    const city = cityElement.dataset.city;
    const country = cityElement.dataset.country;
    const countryCode = cityElement.dataset.countryCode;
    const lat = parseFloat(cityElement.dataset.lat);
    const lng = parseFloat(cityElement.dataset.lng);
    
    console.log('✅ Selected city:', { city, country, countryCode, lat, lng });
    
    // Update current location data
    currentLocationData = {
        city: city,
        countryCode: countryCode,
        lat: lat,
        lng: lng,
        displayName: `${city}, ${country}`,
        isValid: true
    };
    
    // Update the location input
    document.getElementById('location').value = currentLocationData.displayName;
    
    // Hide suggestions
    hideSuggestions();
    
    // Clear any error messages
    const errorDiv = document.getElementById('locationError');
    errorDiv.style.display = 'none';
    
    // Update widget configuration and recreate widget first
    window.IqamaWidgetConfig.location = currentLocationData.displayName;
    window.IqamaWidgetConfig.masjidAddress = currentLocationData.displayName;
    await updateWidget();
    
    // Fetch sunrise time for the selected city and update UI
    await fetchSunriseTime(lat, lng);
}

// Fetch timezone by coordinates (no API key)
async function getTimeZoneByCoordinates(lat, lng) {
    try {
        const resp = await fetch(`https://www.timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`);
        const data = await resp.json();
        // timeapi.io returns e.g. { timeZone: "Africa/Mogadishu", ... }
        if (data && (data.timeZone || data.timezone || data.time_zone)) {
            return data.timeZone || data.timezone || data.time_zone;
        }
    } catch (e) {
        console.error('Timezone lookup error:', e);
    }
    return undefined;
}

// Fetch sunrise time from weather API
async function fetchSunriseTime(lat, lng) {
    try {
        console.log('🌅 Fetching sunrise time for:', lat, lng);
        
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
            const sunriseUTC = new Date(data.results.sunrise); // UTC ISO string
            
            // Get timezone with fallback methods
            let timeZoneId;
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
            
            const localTime = new Intl.DateTimeFormat('en-US', {
                timeZone: timeZoneId,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(sunriseUTC);
            
            console.log('✅ Sunrise time (city local):', localTime, 'TZ:', timeZoneId);
            updateSunriseInWidget(localTime);
            return localTime;
        } else {
            console.log('⚠️ No sunrise data available');
            updateSunriseInWidget('N/A');
            return 'N/A';
        }
    } catch (error) {
        console.error('❌ Sunrise API error:', error);
        
        // Fallback: Calculate approximate sunrise
        try {
            const approximateSunrise = calculateApproximateSunrise(lat, lng);
            console.log('🌅 Using approximate sunrise:', approximateSunrise);
            updateSunriseInWidget(approximateSunrise);
            return approximateSunrise;
        } catch (e) {
            console.log('Approximate sunrise calculation failed:', e);
            updateSunriseInWidget('N/A');
            return 'N/A';
        }
    }
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

// Update sunrise time in the widget
function updateSunriseInWidget(sunriseTime) {
    const widget = document.getElementById('iqama-widget');
    if (widget) {
        const sunriseElement = widget.querySelector('[data-prayer="sunrise"]');
        if (sunriseElement) {
            const timeElement = sunriseElement.querySelector('div:last-child');
            if (timeElement) {
                timeElement.textContent = sunriseTime;
                console.log('✅ Updated sunrise time in widget:', sunriseTime);
            }
        }
    }
}

// Initialize location search functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing location search...');
    
    const locationInput = document.getElementById('location');
    
    if (locationInput) {
        // Add event listeners for city search
        locationInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            console.log('🔍 Input query:', query);
            
            // Clear any error messages
            const errorDiv = document.getElementById('locationError');
            errorDiv.style.display = 'none';
            
            // Search for cities with optimized debounce
            searchCities(query);
        }, 100));
        
        // Keyboard navigation
        locationInput.addEventListener('keydown', (e) => {
            const suggestions = document.querySelectorAll('.location-suggestion');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
                updateSelectedSuggestion();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSelectedSuggestion();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                    selectCity(suggestions[selectedSuggestionIndex]);
                } else if (suggestions.length > 0) {
                    // Select first suggestion by default
                    selectCity(suggestions[0]);
                }
            } else if (e.key === 'Escape') {
                hideSuggestions();
            }
        });
        
        // Require selection from suggestions on blur
        locationInput.addEventListener('blur', () => {
            setTimeout(() => {
                // If suggestions are visible, force selection
                const suggestionsVisible = document.getElementById('locationSuggestions').style.display === 'block';
                if (suggestionsVisible) {
                    const suggestions = document.querySelectorAll('.location-suggestion');
                    if (suggestions.length > 0) {
                        selectCity(suggestions[0]);
                    }
                } else {
                    // Validate that input matches last selected
                    if (locationInput.value.trim() !== currentLocationData.displayName) {
                        const errorDiv = document.getElementById('locationError');
                        errorDiv.textContent = 'Please select a city from the list.';
                        errorDiv.style.display = 'block';
                        // Revert to last valid
                        locationInput.value = currentLocationData.displayName;
                    }
                }
            }, 150);
        });

        // Focus event
        locationInput.addEventListener('focus', () => {
            const query = locationInput.value.trim();
            if (query.length >= 2) {
                searchCities(query);
            }
        });
        
        // Handle suggestion clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.location-suggestion')) {
                const suggestion = e.target.closest('.location-suggestion');
                selectCity(suggestion);
            } else if (!e.target.closest('.location-search-container')) {
                hideSuggestions();
            }
        });
        
        // Initialize with default location
        setTimeout(async () => {
            console.log('📍 Initializing with default location:', currentLocationData);
            await fetchSunriseTime(currentLocationData.lat, currentLocationData.lng);
        }, 1000);
    }
});

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing demo...');
    
    // Initialize configuration from active buttons
    const activeTimeButton = document.querySelector('.time-button.active');
    const activeJumuahButton = document.querySelector('.jumuah-button.active');
    const activeColorScheme = document.querySelector('.scheme-option.active');
    
    if (activeTimeButton) {
        currentTimeType = activeTimeButton.dataset.time;
        window.IqamaWidgetConfig.timeType = currentTimeType;
        console.log('⏰ Time type initialized from active button:', currentTimeType);
    }
    
    if (activeJumuahButton) {
        currentJumuahCount = parseInt(activeJumuahButton.dataset.count);
        window.IqamaWidgetConfig.jumuahCount = currentJumuahCount;
        console.log('🕌 Jumuah count initialized from active button:', currentJumuahCount);
        console.log('🕌 Active Jumuah button found:', activeJumuahButton);
        console.log('🕌 Button data-count:', activeJumuahButton.dataset.count);
    } else {
        console.log('❌ No active Jumuah button found!');
        // Fallback: set to 1 if no active button found
        currentJumuahCount = 1;
        window.IqamaWidgetConfig.jumuahCount = 1;
        console.log('🔄 Fallback: Set Jumuah count to 1');
    }
    
    if (activeColorScheme) {
        currentBackgroundColor = activeColorScheme.dataset.background;
        currentAccentColor = activeColorScheme.dataset.accent;
        window.IqamaWidgetConfig.backgroundColor = currentBackgroundColor;
        window.IqamaWidgetConfig.accentColor = currentAccentColor;
        console.log('🎨 Colors initialized from active scheme:', currentBackgroundColor, currentAccentColor);
    }
    
    // Ensure masjidAddress is set to location
    window.IqamaWidgetConfig.masjidAddress = window.IqamaWidgetConfig.location;
    
    console.log('📊 Final config before widget creation:', window.IqamaWidgetConfig);
    
    // Initialize the widget
    if (window.createWidget) {
        // Clear the preview container first
        const previewContainer = document.getElementById('widget-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
        // Small delay to ensure configuration is fully set
        setTimeout(() => {
            console.log('🔧 Creating widget with config:', window.IqamaWidgetConfig);
            console.log('🔧 Jumuah count in config:', window.IqamaWidgetConfig.jumuahCount);
            
            // Double-check that Jumuah count is set
            if (!window.IqamaWidgetConfig.jumuahCount) {
                console.log('⚠️ Jumuah count not set, forcing to 1');
                window.IqamaWidgetConfig.jumuahCount = 1;
            }
            
            // Force update the global variable as well
            currentJumuahCount = window.IqamaWidgetConfig.jumuahCount;
            console.log('🔧 Final check - currentJumuahCount:', currentJumuahCount);
            
            // Create the widget with fresh data
            if (window.fetchPrayerTimes) {
                // Force fresh fetch before creating widget
                window.fetchPrayerTimes().then(() => {
                    window.createWidget().then(() => {
                        // Move the widget to the preview container if it exists
                        const widget = document.getElementById('iqama-widget');
                        if (widget && previewContainer) {
                            previewContainer.appendChild(widget);
                            console.log('✅ Widget moved to preview container');
                        }
                    });
                });
            } else {
                // Fallback to regular widget creation
                window.createWidget().then(() => {
                    // Move the widget to the preview container if it exists
                    const widget = document.getElementById('iqama-widget');
                    if (widget && previewContainer) {
                        previewContainer.appendChild(widget);
                        console.log('✅ Widget moved to preview container');
                    }
                });
            }
        }, 100); // Small delay to ensure config is set
    }
    
    // Update generated code
    updateGeneratedCode(window.IqamaWidgetConfig);
    
    // Add event listeners to time buttons
    const timeButtons = document.querySelectorAll('.time-button');
    console.log('🔍 Found time buttons:', timeButtons.length);
    if (timeButtons.length > 0) {
        timeButtons.forEach((button, index) => {
            console.log(`🔍 Time button ${index}:`, button.dataset.time);
            button.addEventListener('click', debounce(() => {
                console.log('🎯 Time button clicked:', button.dataset.time);
                
                // Remove active class from all time buttons
                timeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update the global variable
                currentTimeType = button.dataset.time;
                console.log('📊 Updated currentTimeType:', currentTimeType);
                
                // Update widget configuration
                window.IqamaWidgetConfig.timeType = currentTimeType;
                console.log('🔧 Updated IqamaWidgetConfig:', window.IqamaWidgetConfig);
                
                // Update generated code
                updateGeneratedCode(window.IqamaWidgetConfig);
                
                // Update the existing widget smoothly
                const existingWidget = document.getElementById('iqama-widget');
                if (existingWidget) {
                    console.log('🔄 Updating widget with time type:', currentTimeType);
                    updateTimeTypeSmoothly(existingWidget, currentTimeType);
                } else {
                    console.log('❌ No widget found to update');
                }
            }, 100));
        });
    } else {
        console.log('❌ No time buttons found');
    }

    // Add event listeners to Jumuah buttons
    const jumuahButtons = document.querySelectorAll('.jumuah-button');
    console.log('🔍 Found Jumuah buttons:', jumuahButtons.length);
    if (jumuahButtons.length > 0) {
        jumuahButtons.forEach((button, index) => {
            console.log(`🔍 Jumuah button ${index}:`, button.dataset.count);
            button.addEventListener('click', debounce(() => {
                console.log('🎯 Jumuah button clicked:', button.dataset.count);
                
                // Remove active class from all Jumuah buttons
                jumuahButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update the global variable
                currentJumuahCount = parseInt(button.dataset.count);
                console.log('📊 Updated currentJumuahCount:', currentJumuahCount);
                
                // Update widget configuration
                window.IqamaWidgetConfig.jumuahCount = currentJumuahCount;
                console.log('🔧 Updated IqamaWidgetConfig:', window.IqamaWidgetConfig);
                
                // Update generated code
                updateGeneratedCode(window.IqamaWidgetConfig);
                
                // Update the existing widget smoothly
                const existingWidget = document.getElementById('iqama-widget');
                if (existingWidget) {
                    console.log('🔄 Updating widget with Jumuah count:', currentJumuahCount);
                    updateJumuahSectionSmoothly(existingWidget, currentJumuahCount);
                } else {
                    console.log('❌ No widget found to update');
                }
            }, 100));
        });
    } else {
        console.log('❌ No Jumuah buttons found');
    }
    
    console.log('✅ Demo initialized');
    
    // Test location validation on page load
    const locationInput = document.getElementById('location');
    if (locationInput) {
        console.log('🔍 Found location input, testing validation...');
        // Trigger validation for the current value
        setTimeout(async () => {
            const location = locationInput.value.trim();
            console.log('📍 Testing initial location:', location);
            
            if (location.length >= 2) {
                const validation = await validateLocation(location);
                console.log('✅ Initial validation result:', validation);
                
                if (validation.isValid) {
                    locationInput.classList.remove('invalid');
                    locationInput.classList.add('valid');
                    document.getElementById('locationError').style.display = 'none';
                } else {
                    locationInput.classList.remove('valid');
                    locationInput.classList.add('invalid');
                    document.getElementById('locationError').textContent = validation.message;
                    document.getElementById('locationError').style.display = 'block';
                }
            }
        }, 1000);
    }
});

// Responsive Testing Functionality
document.addEventListener('DOMContentLoaded', function() {
    const screenButtons = document.querySelectorAll('.screen-btn');
    const widgetPreview = document.getElementById('widget-preview');
    
    screenButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            screenButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the width from data attribute
            const width = this.getAttribute('data-width');
            const label = this.getAttribute('data-label');
            
            // Apply the width to the widget preview
            if (width === '100') {
                // Full width
                widgetPreview.style.maxWidth = '100%';
                widgetPreview.style.width = '100%';
                widgetPreview.style.margin = '0 auto';
            } else {
                // Specific width
                widgetPreview.style.maxWidth = width + 'px';
                widgetPreview.style.width = width + 'px';
                widgetPreview.style.margin = '0 auto';
            }
            
            // Add a visual indicator
            widgetPreview.style.border = '2px solid #3b82f6';
            widgetPreview.style.borderRadius = '8px';
            widgetPreview.style.padding = '10px';
            widgetPreview.style.backgroundColor = '#f8fafc';
            
            // Add a label above the widget
            let labelElement = widgetPreview.querySelector('.screen-size-label');
            if (!labelElement) {
                labelElement = document.createElement('div');
                labelElement.className = 'screen-size-label';
                labelElement.style.cssText = `
                    font-size: 12px;
                    font-weight: 600;
                    color: #3b82f6;
                    text-align: center;
                    margin-bottom: 8px;
                    padding: 4px 8px;
                    background: #dbeafe;
                    border-radius: 4px;
                    display: inline-block;
                `;
                widgetPreview.insertBefore(labelElement, widgetPreview.firstChild);
            }
            labelElement.textContent = `Testing: ${label}`;
            
            console.log(`📱 Testing widget at ${label} (${width}px)`);
        });
    });
    
    // Initialize with 360px (mobile) as default
    const defaultButton = document.querySelector('.screen-btn[data-width="360"]');
    if (defaultButton) {
        defaultButton.click();
    }
});
