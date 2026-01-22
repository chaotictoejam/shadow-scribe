/**
 * Content Script Entry Point
 * Task 8.1: Implement content script (content/content.js)
 * 
 * Main entry point that initializes the extension on Proton Docs pages.
 */

import ThemeManager from './theme-manager.js';
import ToggleButton from './toggle-button.js';
import { getDocumentThemeState, getPreferences } from '../utils/storage.js';

let themeManager;
let toggleButton;

/**
 * Initialize extension on page load
 */
async function initialize() {
  try {
    // Create theme manager and toggle button instances
    themeManager = new ThemeManager();
    toggleButton = new ToggleButton(themeManager);

    // Check global state
    const response = await browser.runtime.sendMessage({ type: 'GET_GLOBAL_STATE' });
    const { globalEnabled } = response;

    if (!globalEnabled) {
      console.log('🪶 Shadow Scribe: Extension is globally disabled');
      return;
    }

    // Extract document ID from URL
    const documentId = getDocumentIdFromURL();

    // Load document-specific theme state
    const state = await getDocumentThemeState(documentId);
    
    console.log('Shadow Scribe: Document state:', state);

    // Apply theme if enabled for this document
    if (state.enabled) {
      const preferences = await getPreferences();
      await themeManager.applyDarkMode(preferences);
      console.log('Shadow Scribe: Dark mode applied on load');
    } else {
      console.log('Shadow Scribe: Dark mode not enabled for this document. Click the toggle button to enable.');
    }

    // Create toggle button
    toggleButton.create();
    toggleButton.updateState(state.enabled);

    console.log('Shadow Scribe: Initialized successfully');
  } catch (error) {
    console.error('Shadow Scribe: Initialization error:', error);
  }
}

/**
 * Handle global state changes from background script
 * @param {boolean} enabled - Whether extension is globally enabled
 */
function handleGlobalStateChange(enabled) {
  if (!enabled) {
    // Global disable - remove all dark mode
    if (themeManager) {
      themeManager.removeDarkMode();
    }
    if (toggleButton) {
      toggleButton.remove();
    }
    console.log('Shadow Scribe: Globally disabled');
  } else {
    // Global enable - reinitialize
    initialize();
    console.log('Shadow Scribe: Globally enabled');
  }
}

/**
 * Handle preference updates from options page
 * @param {Object} preferences - New preference values
 */
function handlePreferencesUpdate(preferences) {
  if (themeManager && themeManager.isDarkMode) {
    themeManager.updatePreferences(preferences);
    console.log('Shadow Scribe: Preferences updated');
  }
}

/**
 * Extract document ID from URL
 * @returns {string} Document ID or 'default'
 */
function getDocumentIdFromURL() {
  const match = window.location.pathname.match(/\/docs\/([^/]+)/);
  return match ? match[1] : 'default';
}

/**
 * Listen for messages from background script
 */
browser.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'GLOBAL_STATE_CHANGED':
      handleGlobalStateChange(message.enabled);
      break;
    case 'PREFERENCES_UPDATED':
      handlePreferencesUpdate(message.preferences);
      break;
    default:
      console.warn('Shadow Scribe: Unknown message type:', message.type);
  }
});

/**
 * Start initialization when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already ready
  initialize();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initialize,
    handleGlobalStateChange,
    handlePreferencesUpdate,
    getDocumentIdFromURL,
  };
}
