/**
 * ThemeManager - Core component responsible for applying and removing dark mode styles
 *
 * This class manages the application of dark mode to Proton Docs by:
 * - Injecting CSS custom properties for dynamic theming
 * - Observing DOM changes to handle dynamically loaded content
 * - Preserving images and media appearance
 * - Ensuring UI elements are styled consistently
 */
class ThemeManager {
  /**
   * Create a new ThemeManager instance
   */
  constructor() {
    this.isDarkMode = false;
    this.preferences = {};
    this.observer = null;
  }

  /**
   * Apply dark mode with given preferences
   * @param {Object} preferences - User preferences for dark mode styling
   * @param {string} preferences.backgroundColor - Hex color for background
   * @param {string} preferences.textColor - Hex color for text
   * @param {string} preferences.accentColor - Hex color for accents
   * @param {number} preferences.backgroundDarkness - Darkness level 0.0-1.0
   */
  async applyDarkMode(preferences) {
    this.preferences = preferences;
    this.isDarkMode = true;
    this.injectStyles();
    this.observeDOMChanges();
  }

  /**
   * Remove dark mode and restore original appearance
   */
  removeDarkMode() {
    this.isDarkMode = false;
    this.removeStyles();
    this.disconnectObserver();
  }

  /**
   * Update theme with new preferences
   * @param {Object} preferences - New preferences to merge with existing ones
   */
  updatePreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
    if (this.isDarkMode) {
      this.injectStyles();
    }
  }

  /**
   * Internal: Inject CSS custom properties for dark theme
   * Sets CSS variables on the document root and adds the dark mode class to body
   */
  injectStyles() {
    const root = document.documentElement;
    root.style.setProperty(
      '--dark-bg',
      this.preferences.backgroundColor || '#1e1e1e'
    );
    root.style.setProperty(
      '--dark-text',
      this.preferences.textColor || '#e0e0e0'
    );
    root.style.setProperty(
      '--dark-accent',
      this.preferences.accentColor || '#4a9eff'
    );
    document.body.classList.add('shadow-scribe-dark');
  }

  /**
   * Internal: Remove injected styles
   * Removes CSS variables from document root and removes the dark mode class from body
   */
  removeStyles() {
    const root = document.documentElement;
    root.style.removeProperty('--dark-bg');
    root.style.removeProperty('--dark-text');
    root.style.removeProperty('--dark-accent');
    document.body.classList.remove('shadow-scribe-dark');
  }

  /**
   * Internal: Watch for dynamic content changes
   * Sets up a MutationObserver to handle dynamically loaded content
   * The observer watches for new elements being added to the DOM
   */
  observeDOMChanges() {
    this.observer = new MutationObserver((mutations) => {
      // Re-apply styles to new elements if needed
      // The CSS cascade handles most cases automatically via the body class
      // This observer is here for future enhancements if specific elements
      // need special handling when dynamically added
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Internal: Disconnect the MutationObserver
   * Stops watching for DOM changes and cleans up the observer
   */
  disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Export for use in content script and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
