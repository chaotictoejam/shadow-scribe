/**
 * Messaging abstraction layer for Shadow Scribe extension
 * Provides utilities for cross-component communication between background script,
 * content scripts, and options page
 */

// Message type constants
const MESSAGE_TYPES = {
  GET_GLOBAL_STATE: 'GET_GLOBAL_STATE',
  SET_GLOBAL_STATE: 'SET_GLOBAL_STATE',
  PREFERENCES_UPDATED: 'PREFERENCES_UPDATED',
  GLOBAL_STATE_CHANGED: 'GLOBAL_STATE_CHANGED',
};

/**
 * Send a message to the background script
 * Wrapper function with error handling for disconnected ports
 * @param {Object} message - Message object to send
 * @returns {Promise<any>} Response from the background script
 */
async function sendMessage(message) {
  try {
    const response = await browser.runtime.sendMessage(message);
    return response;
  } catch (error) {
    // Handle disconnected port errors gracefully
    if (error.message && error.message.includes('disconnected')) {
      console.warn('Extension context disconnected:', error.message);
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Broadcast a message to all tabs running the content script
 * Used by background script to notify all tabs of state changes
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

// Make functions and constants available globally
if (typeof window !== 'undefined') {
  window.MESSAGE_TYPES = MESSAGE_TYPES;
  window.sendMessage = sendMessage;
  window.broadcastToAllTabs = broadcastToAllTabs;
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MESSAGE_TYPES,
    sendMessage,
    broadcastToAllTabs,
  };
}
