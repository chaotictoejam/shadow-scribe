/**
 * Options Page Logic
 * Task 9.3: Implement options page logic (options/options.js)
 */

/**
 * Load current settings and populate form
 */
async function loadSettings() {
  try {
    // Load preferences
    const preferences = await getPreferences();
    
    // Load global state
    const globalEnabled = await getGlobalState();

    // Populate form fields
    document.getElementById('globalEnabled').checked = globalEnabled;
    document.getElementById('backgroundColor').value = preferences.backgroundColor;
    document.getElementById('textColor').value = preferences.textColor;
    document.getElementById('accentColor').value = preferences.accentColor;
    document.getElementById('backgroundDarkness').value = preferences.backgroundDarkness;

    // Update color value displays
    document.getElementById('backgroundColorValue').textContent = preferences.backgroundColor;
    document.getElementById('textColorValue').textContent = preferences.textColor;
    document.getElementById('accentColorValue').textContent = preferences.accentColor;

    // Update darkness display
    updateDarknessDisplay(preferences.backgroundDarkness);

    console.log('Shadow Scribe: Settings loaded');
  } catch (error) {
    console.error('Shadow Scribe: Error loading settings:', error);
    showError('Failed to load settings. Please try again.');
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    // Get form values
    const preferences = {
      backgroundColor: document.getElementById('backgroundColor').value,
      textColor: document.getElementById('textColor').value,
      accentColor: document.getElementById('accentColor').value,
      backgroundDarkness: parseFloat(document.getElementById('backgroundDarkness').value),
    };

    const globalEnabled = document.getElementById('globalEnabled').checked;

    // Save preferences
    await setPreferences(preferences);

    // Save global state
    await setGlobalState(globalEnabled);

    // Show confirmation
    showSaveConfirmation();

    console.log('Shadow Scribe: Settings saved');
  } catch (error) {
    console.error('Shadow Scribe: Error saving settings:', error);
    showError('Failed to save settings. Please try again.');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  try {
    // Confirm with user
    const confirmed = confirm('Are you sure you want to reset all settings to defaults?');
    if (!confirmed) return;

    // Reset to default preferences
    await setPreferences(DEFAULT_PREFERENCES);

    // Reset global state to enabled
    await setGlobalState(true);

    // Reload form
    await loadSettings();

    // Show confirmation
    showSaveConfirmation();

    console.log('Shadow Scribe: Settings reset to defaults');
  } catch (error) {
    console.error('Shadow Scribe: Error resetting settings:', error);
    showError('Failed to reset settings. Please try again.');
  }
}

/**
 * Update darkness display value
 * @param {number} value - Darkness value (0-1)
 */
function updateDarknessDisplay(value) {
  const percentage = Math.round(value * 100);
  document.getElementById('darknessValue').textContent = `${percentage}%`;
}

/**
 * Show save confirmation message
 */
function showSaveConfirmation() {
  const confirmation = document.getElementById('saveConfirmation');
  confirmation.classList.remove('hidden');

  // Hide after 3 seconds
  setTimeout(() => {
    confirmation.classList.add('hidden');
  }, 3000);
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  alert(message);
}

/**
 * Update color value display when color picker changes
 * @param {string} inputId - ID of the color input
 * @param {string} displayId - ID of the display element
 */
function updateColorDisplay(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  
  input.addEventListener('input', () => {
    display.textContent = input.value;
  });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Save button
  document.getElementById('saveButton').addEventListener('click', saveSettings);

  // Reset button
  document.getElementById('resetButton').addEventListener('click', resetSettings);

  // Background darkness slider
  document.getElementById('backgroundDarkness').addEventListener('input', (e) => {
    updateDarknessDisplay(e.target.value);
  });

  // Color picker displays
  updateColorDisplay('backgroundColor', 'backgroundColorValue');
  updateColorDisplay('textColor', 'textColorValue');
  updateColorDisplay('accentColor', 'accentColorValue');

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveSettings();
    }
  });
}

/**
 * Initialize options page
 */
async function initialize() {
  try {
    await loadSettings();
    initializeEventListeners();
    console.log('Shadow Scribe: Options page initialized');
  } catch (error) {
    console.error('Shadow Scribe: Initialization error:', error);
    showError('Failed to initialize settings page. Please refresh.');
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadSettings,
    saveSettings,
    resetSettings,
    updateDarknessDisplay,
    showSaveConfirmation,
  };
}
