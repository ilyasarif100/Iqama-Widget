/**
 * Main Entry Point
 * Initializes and starts the Iqama Widget
 */

import { logger } from './utils/logger.js';
import { getConfig } from './config/config.js';
import { WidgetManager } from './ui/widget.js';

// Global widget manager instance
let widgetManager = null;

/**
 * Initialize the widget when DOM is ready
 */
function initializeWidget() {
    logger.info('Initializing Iqama Widget');
    
    try {
        // Create widget manager
        widgetManager = new WidgetManager();
        
        // Create widget
        widgetManager.createWidget().then(() => {
            logger.success('Iqama Widget initialized successfully');
        }).catch(error => {
            logger.error('Failed to initialize widget', error.message);
        });
        
    } catch (error) {
        logger.error('Widget initialization failed', error.message);
    }
}

/**
 * Global function for backward compatibility
 */
window.createWidget = async function(forceRefresh = false) {
    if (!widgetManager) {
        widgetManager = new WidgetManager();
    } else {
        // Update configuration if widget manager already exists
        widgetManager.updateConfig(getConfig());
    }
    await widgetManager.createWidget(forceRefresh);
    return widgetManager;
};

/**
 * Manual refresh function - forces fresh data fetch
 */
window.refreshWidget = async function() {
    logger.info('Manual refresh requested');
    if (widgetManager) {
        await widgetManager.createWidget(true); // Force refresh
    } else {
        await window.createWidget(true); // Create with force refresh
    }
};


// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
    initializeWidget();
}

// Export for module usage
export { WidgetManager, initializeWidget };
