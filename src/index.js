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
window.createWidget = async function() {
    if (!widgetManager) {
        widgetManager = new WidgetManager();
    } else {
        // Update configuration if widget manager already exists
        widgetManager.updateConfig(getConfig());
    }
    await widgetManager.createWidget();
    return widgetManager;
};


// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
    initializeWidget();
}

// Export for module usage
export { WidgetManager, initializeWidget };
