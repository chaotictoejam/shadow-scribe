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
    
    // Apply dark mode class
    document.body.classList.add('shadow-scribe-dark');
    
    // Apply inline styles directly to body for maximum specificity
    if (document.body.style) {
      document.body.style.backgroundColor = this.preferences.backgroundColor || '#1e1e1e';
      document.body.style.color = this.preferences.textColor || '#e0e0e0';
    }
    
    // Apply styles to iframes (Proton Docs uses iframes for document content)
    this.applyStylesToIframes();
    
    // Apply styles to all text elements directly
    this.applyStylesToElements();
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
    
    // Remove inline styles from body
    if (document.body.style) {
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('color');
    }
    
    // Remove styles from iframes
    this.removeStylesFromIframes();
    
    // Remove styles from elements
    this.removeStylesFromElements();
  }

  /**
   * Internal: Apply dark mode styles directly to all text elements
   * This ensures styles override Proton's inline styles
   */
  applyStylesToElements() {
    const bgColor = this.preferences.backgroundColor || '#1e1e1e';
    const textColor = this.preferences.textColor || '#e0e0e0';
    
    // Apply background to container elements only
    const containers = document.querySelectorAll('div[class*="editor"], div[class*="document"], div[class*="content"], main, article, section');
    containers.forEach((el) => {
      el.style.setProperty('background-color', bgColor, 'important');
    });
    
    // Apply text color to all text elements (but not background)
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, a, td, th, label');
    textElements.forEach((el) => {
      el.style.setProperty('color', textColor, 'important');
    });
    
    // Apply to divs that contain text (but check if they're not containers)
    const divs = document.querySelectorAll('div');
    divs.forEach((el) => {
      // Only apply color, not background, to avoid white boxes
      if (el.textContent && el.textContent.trim().length > 0) {
        el.style.setProperty('color', textColor, 'important');
      }
      // Apply background only to large container divs
      if (el.offsetHeight > 100 || el.offsetWidth > 500) {
        el.style.setProperty('background-color', bgColor, 'important');
      }
    });
  }

  /**
   * Internal: Remove dark mode styles from elements
   */
  removeStylesFromElements() {
    const elements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, li, td, th, a, main, article, section, label');
    elements.forEach((el) => {
      el.style.removeProperty('color');
      el.style.removeProperty('background-color');
    });
  }

  /**
   * Internal: Apply dark mode styles to iframes
   * Proton Docs uses iframes for the document editor content
   */
  applyStylesToIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.body) {
          // Set CSS variables
          const root = iframeDoc.documentElement;
          root.style.setProperty('--dark-bg', this.preferences.backgroundColor || '#1e1e1e');
          root.style.setProperty('--dark-text', this.preferences.textColor || '#e0e0e0');
          root.style.setProperty('--dark-accent', this.preferences.accentColor || '#4a9eff');
          
          // Add dark mode class
          iframeDoc.body.classList.add('shadow-scribe-dark');
          
          // Inject CSS link into iframe
          let styleLink = iframeDoc.getElementById('shadow-scribe-styles');
          if (!styleLink) {
            styleLink = iframeDoc.createElement('link');
            styleLink.id = 'shadow-scribe-styles';
            styleLink.rel = 'stylesheet';
            styleLink.href = browser.runtime.getURL('content/dark-mode.css');
            iframeDoc.head.appendChild(styleLink);
          }
        }
      } catch (error) {
        // Cross-origin iframes will throw errors - ignore them
        console.debug('Shadow Scribe: Cannot access iframe:', error.message);
      }
    });
  }

  /**
   * Internal: Remove dark mode styles from iframes
   */
  removeStylesFromIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.body) {
          const root = iframeDoc.documentElement;
          root.style.removeProperty('--dark-bg');
          root.style.removeProperty('--dark-text');
          root.style.removeProperty('--dark-accent');
          iframeDoc.body.classList.remove('shadow-scribe-dark');
          
          // Remove injected CSS
          const styleLink = iframeDoc.getElementById('shadow-scribe-styles');
          if (styleLink) {
            styleLink.remove();
          }
        }
      } catch (error) {
        // Cross-origin iframes will throw errors - ignore them
        console.debug('Shadow Scribe: Cannot access iframe:', error.message);
      }
    });
  }

  /**
   * Internal: Watch for dynamic content changes
   * Sets up a MutationObserver to handle dynamically loaded content
   * The observer watches for new elements being added to the DOM
   */
  observeDOMChanges() {
    // Guard: Don't observe if document.body doesn't exist
    if (!document.body) {
      return;
    }
    
    let debounceTimer = null;
    
    this.observer = new MutationObserver((mutations) => {
      // Debounce to avoid excessive style applications
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(() => {
        let shouldReapply = false;
        
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IFRAME') {
              this.applyStylesToIframes();
              shouldReapply = true;
            }
            // Check if significant content was added
            if (node.nodeType === 1 && node.textContent && node.textContent.trim().length > 10) {
              shouldReapply = true;
            }
          });
        });
        
        if (shouldReapply) {
          this.applyStylesToElements();
        }
      }, 100); // Wait 100ms before reapplying
    });

    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } catch {
      // Silently fail if observe doesn't work (e.g., in test environments)
    }
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

// Export for ES6 modules
export default ThemeManager;

// Export for use in content script and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
