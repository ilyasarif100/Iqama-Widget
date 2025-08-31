// Global variables
let currentTimeType = 'athan';
let currentJumuahCount = 1;
let currentBackgroundColor = '#1a1a1a';
let currentAccentColor = '#ffffff';

// Location data
let currentLocationData = {
    city: 'Phoenix',
    state: 'AZ',
    lat: 33.4484,
    lng: -112.0740,
    isValid: true,
    displayName: 'Phoenix, AZ'
};

// Input elements
const inputs = {
    title: document.getElementById('title') || { value: 'Masjid Al-Noor' },
    location: document.getElementById('location') || { value: 'Phoenix, AZ' },
    googleSheetUrl: document.getElementById('googleSheetUrl') || { value: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing' }
};

// Widget configuration
window.IqamaWidgetConfig = {
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing',
    title: 'Masjid Al-Noor',
    location: 'Phoenix, AZ',
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
    
    // Create new widget
    if (window.createWidget) {
        window.createWidget().then(() => {
            // Move the widget to the preview container if it exists
            const widget = document.getElementById('iqama-widget');
            const previewContainer = document.getElementById('widget-preview');
            if (widget && previewContainer) {
                previewContainer.appendChild(widget);
            }
        });
    }
}

/* Smooth color update function */
function updateColorsSmoothly(widget, backgroundColor, accentColor) {
    console.log('🔄 Updating colors smoothly:', backgroundColor, accentColor);
    
     /* Update widget background */
    widget.style.background = backgroundColor;
    
     /* Update CSS custom properties */
    widget.style.setProperty('--background-color', backgroundColor);
    widget.style.setProperty('--accent-color', accentColor);
    
     /* Update all text elements that use the accent color */
    const textElements = widget.querySelectorAll('[style*="color: var(--accent-color"]');
    textElements.forEach(element => {
        element.style.color = accentColor;
    });
    
    // Update borders that use the accent color
    const borderElements = widget.querySelectorAll('[style*="border-color: var(--accent-color"]');
    borderElements.forEach(element => {
        element.style.borderColor = accentColor;
    });
    
    console.log('✅ Colors updated smoothly');
}

// Smooth time type update function
function updateTimeTypeSmoothly(widget, timeType) {
    console.log('🔄 Updating time type smoothly:', timeType);
    
    // Update the time type display
    const timeTypeDisplay = widget.querySelector('.time-type-display');
    if (timeTypeDisplay) {
        timeTypeDisplay.textContent = timeType === 'athan' ? '🕌 Athan Times' : '🕌 Iqama Times';
    }
    
    // Update the explanation text
    const explanationText = widget.querySelector('.time-explanation');
    if (explanationText) {
        explanationText.textContent = timeType === 'athan' ? 
            'Times shown are when the Athan (call to prayer) is announced' : 
            'Times shown are when the Iqama (prayer begins) is called';
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
        jumuah1: '1:31 PM',
        jumuah2: '2:30 PM', 
        jumuah3: '3:30 PM'
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
            ">Jumuah Prayer: ${currentTimes.jumuah1}</div>
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
                        ">${num === 1 ? '1st' : num === 2 ? '2nd' : '3rd'} Jumuah</div>
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
            location: currentLocationData.displayName,
            backgroundColor: '#1a1a1a',
            accentColor: '#ffffff',
            timeType: 'athan',
            jumuahCount: 1,
            webhookUrl: '',
            webhookSecret: '',
            masjidAddress: `${currentLocationData.city}, ${currentLocationData.state}`
        };
    }
    
    const code = `<!-- Prayer Times Widget -->
&lt;script src="iqama-widget-cloud.js"&gt;&lt;/script&gt;
&lt;script&gt;
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
&lt;/script&gt;`;
    
    document.getElementById('generatedCode').textContent = code;
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
// LOCATION VALIDATION & GEOCODING
// ========================================

// Location validation and geocoding
let locationSearchTimeout;
let currentSuggestions = [];
let selectedSuggestionIndex = -1;

// Autocomplete location search
async function searchLocation(query) {
    if (!query || query.length < 2) {
        hideSuggestions();
        return;
    }

    try {
        // Use OpenStreetMap Nominatim API for geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            currentSuggestions = data;
            showSuggestions(data);
        } else {
            hideSuggestions();
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        hideSuggestions();
    }
}

// Show location suggestions
function showSuggestions(locations) {
    const suggestionsElement = document.getElementById('locationSuggestions');
    
    suggestionsElement.innerHTML = locations.map((location, index) => {
        const address = location.address;
        const city = address.city || address.town || address.village || address.county || 'Unknown City';
        const state = address.state || address.province || address.region || 'Unknown State';
        const country = address.country || 'Unknown Country';
        
        return `
            <div class="location-suggestion" data-index="${index}">
                <div class="suggestion-main">${city}, ${state}</div>
                <div class="suggestion-detail">${country}</div>
            </div>
        `;
    }).join('');
    
    suggestionsElement.style.display = 'block';
}

// Hide location suggestions
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

// Select a location from suggestions
function selectLocation(location) {
    const locationInfo = extractLocationInfo(location);
    currentLocationData = locationInfo;
    
    // Update the location input
    document.getElementById('location').value = locationInfo.displayName;
    
    // Add visual feedback
    document.getElementById('location').classList.add('valid');
    document.getElementById('location').classList.remove('invalid');
    
    // Show success message
    const statusElement = document.getElementById('locationStatus');
    statusElement.className = 'location-status success';
    statusElement.textContent = `✅ Location selected: ${locationInfo.displayName}`;
    statusElement.style.display = 'block';
    
    // Update widget
    updateWidget();
    
    // Hide suggestions
    hideSuggestions();
}

// Extract location information from API response
function extractLocationInfo(location) {
    const address = location.address;
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lon);
    
    // For US locations, try to get clean city, state format
    if (address.country_code === 'us') {
        const city = address.city || address.town || address.village || address.county || '';
        const state = address.state || '';
        
        if (city && state) {
            return {
                city: city,
                state: state,
                lat: lat,
                lng: lng,
                isValid: true,
                displayName: `${city}, ${state}`
            };
        }
    }
    
    // For international locations, use city, country format
    const city = address.city || address.town || address.village || address.county || address.state || '';
    const country = address.country || '';
    
    if (city && country) {
        return {
            city: city,
            state: country,
            lat: lat,
            lng: lng,
            isValid: true,
            displayName: `${city}, ${country}`
        };
    }
    
    // Fallback to the display name from the API
    return {
        city: location.display_name.split(',')[0] || 'Unknown',
        state: address.country || 'Unknown',
        lat: lat,
        lng: lng,
        isValid: true,
        displayName: location.display_name
    };
}

// Initialize with current location data
document.getElementById('location').value = currentLocationData.displayName;

// Add event listeners for autocomplete
const locationInput = document.getElementById('location');

if (locationInput) {
    locationInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        
        // Reset input styling
        e.target.classList.remove('valid', 'invalid');
        
        // Hide status messages
        const statusElement = document.getElementById('locationStatus');
        statusElement.style.display = 'none';
        
        // Search for locations
        searchLocation(query);
    }, 300));
    
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
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
    
    locationInput.addEventListener('focus', () => {
        const query = locationInput.value.trim();
        if (query.length >= 2) {
            searchLocation(query);
        }
    });
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    const container = document.querySelector('.location-input-container');
    if (!container.contains(e.target)) {
        hideSuggestions();
    }
});

// Handle suggestion clicks
document.addEventListener('click', (e) => {
    if (e.target.closest('.location-suggestion')) {
        const suggestion = e.target.closest('.location-suggestion');
        const index = parseInt(suggestion.dataset.index);
        const location = currentSuggestions[index];
        
        if (location) {
            selectLocation(location);
        }
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
    }
    
    if (activeColorScheme) {
        currentBackgroundColor = activeColorScheme.dataset.background;
        currentAccentColor = activeColorScheme.dataset.accent;
        window.IqamaWidgetConfig.backgroundColor = currentBackgroundColor;
        window.IqamaWidgetConfig.accentColor = currentAccentColor;
        console.log('🎨 Colors initialized from active scheme:', currentBackgroundColor, currentAccentColor);
    }
    
    console.log('📊 Final config before widget creation:', window.IqamaWidgetConfig);
    
    // Initialize the widget
    if (window.createWidget) {
        // Clear the preview container first
        const previewContainer = document.getElementById('widget-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
        // Create the widget
        window.createWidget().then(() => {
            // Move the widget to the preview container if it exists
            const widget = document.getElementById('iqama-widget');
            if (widget && previewContainer) {
                previewContainer.appendChild(widget);
            }
        });
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
});
