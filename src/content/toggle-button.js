/**
 * ToggleButton Component
 * Task 6.1: Implement ToggleButton class (content/toggle-button.js)
 * 
 * Creates and manages the in-page toggle button for quick theme switching.
 */

class ToggleButton {
  /**
   * Create a new ToggleButton instance
   * @param {ThemeManager} themeManager - The theme manager instance
   */
  constructor(themeManager) {
    this.themeManager = themeManager;
    this.button = null;
  }

  /**
   * Create and inject toggle button into the page
   */
  create() {
    // Create button element
    this.button = document.createElement('button');
    this.button.id = 'shadow-scribe-toggle';
    this.button.className = 'shadow-scribe-toggle';
    this.button.setAttribute('aria-label', 'Toggle dark mode');
    this.button.setAttribute('title', 'Toggle dark mode');
    this.button.innerHTML = '🌙'; // Moon icon for dark mode (default)
    
    // Add click event listener
    this.button.addEventListener('click', () => this.handleToggle());
    
    // Inject into page
    document.body.appendChild(this.button);
  }

  /**
   * Handle toggle button click
   */
  async handleToggle() {
    try {
      // Get current document ID
      const documentId = this.getDocumentIdFromURL();
      
      // Get current theme state
      const currentState = await window.getDocumentThemeState(documentId);
      const newState = !currentState.enabled;
      
      // Save new state
      await window.setDocumentThemeState(documentId, { enabled: newState });
      
      // Apply or remove theme
      if (newState) {
        const preferences = await window.getPreferences();
        await this.themeManager.applyDarkMode(preferences);
        this.button.innerHTML = '☀️'; // Sun icon for light mode
        this.button.setAttribute('aria-label', 'Switch to light mode');
        this.button.setAttribute('title', 'Switch to light mode');
      } else {
        this.themeManager.removeDarkMode();
        this.button.innerHTML = '🌙'; // Moon icon for dark mode
        this.button.setAttribute('aria-label', 'Switch to dark mode');
        this.button.setAttribute('title', 'Switch to dark mode');
      }
    } catch (error) {
      console.error('Shadow Scribe: Error toggling theme:', error);
    }
  }

  /**
   * Update button appearance based on theme state
   * @param {boolean} isDarkMode - Whether dark mode is currently active
   */
  updateState(isDarkMode) {
    if (!this.button) return;
    
    if (isDarkMode) {
      this.button.innerHTML = '☀️'; // Sun icon when dark mode is active
      this.button.setAttribute('aria-label', 'Switch to light mode');
      this.button.setAttribute('title', 'Switch to light mode');
    } else {
      this.button.innerHTML = '🌙'; // Moon icon when light mode is active
      this.button.setAttribute('aria-label', 'Switch to dark mode');
      this.button.setAttribute('title', 'Switch to dark mode');
    }
  }

  /**
   * Remove button from page
   */
  remove() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }

  /**
   * Extract document ID from URL
   * @returns {string} Document ID or 'default'
   */
  getDocumentIdFromURL() {
    const match = window.location.pathname.match(/\/docs\/([^/]+)/);
    return match ? match[1] : 'default';
  }
}

// Export for ES6 modules
export default ToggleButton;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToggleButton;
}
