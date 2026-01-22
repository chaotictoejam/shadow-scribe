/**
 * Background Service Worker for Shadow Scribe Extension
 * Manages global extension state and coordinates communication between tabs and options page
 */

/**
 * Get global enable/disable state
 * @returns {Promise<Object>} Object with globalEnabled property
 */
async function getGlobalState() {
  const { globalEnabled = true } = await browser.storage.local.get('globalEnabled');
  return { globalEnabled };
}

/**
 * Set global enable/disable state and broadcast to all tabs
 * @param {boolean} enabled - Whether extension is globally enabled
 * @returns {Promise<void>}
 */
async function setGlobalState(enabled) {
  await browser.storage.local.set({ globalEnabled: enabled });
  await broadcastToAllTabs({ 
    type: 'GLOBAL_STATE_CHANGED', 
    enabled 
  });
}

/**
 * Broadcast a message to all tabs running the content script
 * @param {Object} message - Message object to broadcast
 * @returns {Promise<void>}
 */
async function broadcastToAllTabs(message) {
  try {
    // Query all tabs
    const tabs = await browser.tabs.query({});

    // Send message to each tab, handling errors for individual tabs
    const promises = tabs.map(async (tab) => {
      try {
        await browser.tabs.sendMessage(tab.id, message);
      } catch (error) {
        // Ignore errors for tabs that don't have content script loaded
        // or are not accessible (e.g., about:, chrome:// pages)
        if (
          !error.message.includes('Could not establish connection') &&
          !error.message.includes('Receiving end does not exist')
        ) {
          console.warn(`Failed to send message to tab ${tab.id}:`, error.message);
        }
      }
    });

    // Wait for all messages to be sent
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to broadcast message to tabs:', error);
    throw error;
  }
}

/**
 * Message listener - handles messages from content scripts and options page
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_GLOBAL_STATE':
      // Return global state
      getGlobalState().then(sendResponse);
      return true; // Indicates async response

    case 'SET_GLOBAL_STATE':
      // Update global state and broadcast to all tabs
      setGlobalState(message.enabled).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('Error setting global state:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Indicates async response

    case 'PREFERENCES_UPDATED':
      // Broadcast preference updates to all tabs
      broadcastToAllTabs({
        type: 'PREFERENCES_UPDATED',
        preferences: message.preferences,
      }).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('Error broadcasting preferences:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Indicates async response

    default:
      // Unknown message type
      console.warn('Unknown message type:', message.type);
      return false;
  }
});

/**
 * Initialize default settings on extension installation
 */
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default global state on first install
    const { globalEnabled } = await browser.storage.local.get('globalEnabled');
    if (globalEnabled === undefined) {
      await browser.storage.local.set({ globalEnabled: true });
      console.log('🪶 Shadow Scribe: Initialized with default settings');
    }
  } else if (details.reason === 'update') {
    console.log('🪶 Shadow Scribe: Extension updated to version', browser.runtime.getManifest().version);
  }
});

console.log('Shadow Scribe: Background service worker initialized');

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getGlobalState,
    setGlobalState,
    broadcastToAllTabs,
  };
}
