/**
 * Storage abstraction layer for Shadow Scribe extension
 * Provides clean API for preference storage, document-specific settings, and global state
 */

// Default preferences
const DEFAULT_PREFERENCES = {
  backgroundColor: '#1e1e1e',
  textColor: '#e0e0e0',
  accentColor: '#4a9eff',
  backgroundDarkness: 0.9,
};

/**
 * Get user preferences
 * @returns {Promise<Object>} User preferences merged with defaults
 */
async function getPreferences() {
  const { preferences } = await browser.storage.local.get('preferences');
  return { ...DEFAULT_PREFERENCES, ...preferences };
}

/**
 * Save user preferences
 * @param {Object} preferences - Preferences object to save
 * @returns {Promise<void>}
 */
async function setPreferences(preferences) {
  await browser.storage.local.set({ preferences });
  // Notify background script to broadcast update
  await browser.runtime.sendMessage({
    type: 'PREFERENCES_UPDATED',
    preferences,
  });
}

/**
 * Get theme state for specific document
 * @param {string} documentId - Document identifier (defaults to 'default')
 * @returns {Promise<Object>} Theme state object with enabled property
 */
async function getDocumentThemeState(documentId = 'default') {
  const key = `theme_state_${documentId}`;
  const result = await browser.storage.local.get(key);
  return result[key] || { enabled: false };
}

/**
 * Save theme state for specific document
 * @param {string} documentId - Document identifier (defaults to 'default')
 * @param {Object} state - Theme state object with enabled property
 * @returns {Promise<void>}
 */
async function setDocumentThemeState(documentId = 'default', state) {
  const key = `theme_state_${documentId}`;
  await browser.storage.local.set({ [key]: state });
}

/**
 * Get global enable/disable state
 * @returns {Promise<boolean>} Global enabled state
 */
async function getGlobalState() {
  const { globalEnabled = true } = await browser.storage.local.get('globalEnabled');
  return globalEnabled;
}

/**
 * Set global enable/disable state
 * @param {boolean} enabled - Whether extension is globally enabled
 * @returns {Promise<void>}
 */
async function setGlobalState(enabled) {
  await browser.storage.local.set({ globalEnabled: enabled });
  await browser.runtime.sendMessage({
    type: 'SET_GLOBAL_STATE',
    enabled,
  });
}

// Export for ES6 modules
export {
  DEFAULT_PREFERENCES,
  getPreferences,
  setPreferences,
  getDocumentThemeState,
  setDocumentThemeState,
  getGlobalState,
  setGlobalState,
};

// Make functions available globally for content scripts
if (typeof window !== 'undefined') {
  window.DEFAULT_PREFERENCES = DEFAULT_PREFERENCES;
  window.getPreferences = getPreferences;
  window.setPreferences = setPreferences;
  window.getDocumentThemeState = getDocumentThemeState;
  window.setDocumentThemeState = setDocumentThemeState;
  window.getGlobalState = getGlobalState;
  window.setGlobalState = setGlobalState;
}
