# Design Document: Shadow Scribe

## 1. Overview

Shadow Scribe is a Firefox browser extension that applies dark mode styling to Proton Docs documents. The extension uses a content script architecture to inject CSS and JavaScript into Proton Docs pages, transforming the light theme into a comfortable dark theme without modifying the underlying document data.

The design follows a modular approach with separate components for theme application, UI controls, settings management, and state persistence. The extension leverages CSS custom properties for dynamic theming, MutationObserver for handling dynamically loaded content, and Firefox's storage API for preference persistence.

### Key Design Principles

1. **Non-invasive**: Theme changes are purely visual and never modify document data
2. **Performance-first**: Minimal DOM manipulation and efficient CSS application
3. **User control**: Flexible toggle and customization options
4. **Persistence**: Remember user preferences across sessions and documents
5. **Accessibility**: Maintain proper contrast ratios and readability

## 2. Architecture

### 2.1 Extension Structure

```
proton-docs-dark-mode/
├── manifest.json              # Extension configuration
├── background.js              # Background service worker
├── content/
│   ├── content.js            # Main content script entry point
│   ├── theme-manager.js      # Theme application logic
│   ├── toggle-button.js      # In-page toggle UI component
│   └── dark-mode.css         # Dark mode CSS styles
├── options/
│   ├── options.html          # Settings page UI
│   ├── options.js            # Settings page logic
│   └── options.css           # Settings page styling
├── utils/
│   ├── storage.js            # Storage abstraction layer
│   └── messaging.js          # Cross-component messaging
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

### 2.2 Component Interaction

```
┌─────────────────┐
│  Background     │
│  Service Worker │
└────────┬────────┘
         │
         │ Manages global state
         │ Broadcasts updates
         │
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Content    │  │  Content    │  │  Options    │
│  Script     │  │  Script     │  │  Page       │
│  (Tab 1)    │  │  (Tab 2)    │  │             │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Theme       │  │ Theme       │  │ Settings    │
│ Manager     │  │ Manager     │  │ Controls    │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│           Firefox Storage API                   │
└─────────────────────────────────────────────────┘
```

### 2.3 Data Flow

1. **Initialization**: Content script loads → retrieves preferences from storage → applies theme
2. **User Toggle**: Toggle button clicked → update storage → broadcast to all tabs → apply theme
3. **Settings Change**: Options page updated → save to storage → notify background → broadcast to tabs
4. **Tab Sync**: New tab opened → background sends current state → content script applies theme

## 3. Component Design

### 3.1 Manifest Configuration (manifest.json)

Defines extension metadata, permissions, and script injection rules.

**Key Configuration:**

- Manifest version 3 for modern Firefox compatibility
- Content scripts injected into `*://drive.proton.me/*/docs/*`
- Permissions: `storage` for preferences, `activeTab` for current tab access
- Background service worker for state management

**Interface:**

```javascript
{
  "manifest_version": 3,
  "name": "Shadow Scribe",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["*://drive.proton.me/*"],
  "background": { "service_worker": "background.js" },
  "content_scripts": [{
    "matches": ["*://drive.proton.me/*/docs/*"],
    "js": ["utils/storage.js", "utils/messaging.js", "content/theme-manager.js",
           "content/toggle-button.js", "content/content.js"],
    "css": ["content/dark-mode.css"],
    "run_at": "document_start"
  }],
  "options_ui": {
    "page": "options/options.html",
    "open_in_tab": true
  }
}
```

### 3.2 Background Service Worker (background.js)

Manages global extension state and coordinates communication between tabs and the options page.

**Responsibilities:**

- Store and manage global enable/disable state
- Broadcast preference changes to all tabs
- Handle messages from content scripts and options page
- Initialize default settings on installation

**Interface:**

```javascript
// Message handlers
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_GLOBAL_STATE':
      return getGlobalState();
    case 'SET_GLOBAL_STATE':
      return setGlobalState(message.enabled);
    case 'PREFERENCES_UPDATED':
      return broadcastToAllTabs(message.preferences);
  }
});

// State management
async function getGlobalState() {
  const { globalEnabled = true } = await browser.storage.local.get('globalEnabled');
  return { globalEnabled };
}

async function setGlobalState(enabled) {
  await browser.storage.local.set({ globalEnabled: enabled });
  await broadcastToAllTabs({ globalEnabled: enabled });
}
```

### 3.3 Theme Manager (content/theme-manager.js)

Core component responsible for applying and removing dark mode styles.

**Responsibilities:**

- Apply CSS custom properties for dark theme
- Handle dynamic content with MutationObserver
- Preserve images and media appearance
- Ensure UI elements are styled consistently
- Maintain performance during theme transitions

**Interface:**

```javascript
class ThemeManager {
  constructor() {
    this.isDarkMode = false;
    this.preferences = {};
    this.observer = null;
  }

  // Apply dark mode with given preferences
  async applyDarkMode(preferences) {
    this.preferences = preferences;
    this.isDarkMode = true;
    this.injectStyles();
    this.observeDOMChanges();
  }

  // Remove dark mode and restore original appearance
  removeDarkMode() {
    this.isDarkMode = false;
    this.removeStyles();
    this.disconnectObserver();
  }

  // Update theme with new preferences
  updatePreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
    if (this.isDarkMode) {
      this.injectStyles();
    }
  }

  // Internal: Inject CSS custom properties
  injectStyles() {
    const root = document.documentElement;
    root.style.setProperty('--dark-bg', this.preferences.backgroundColor || '#1e1e1e');
    root.style.setProperty('--dark-text', this.preferences.textColor || '#e0e0e0');
    root.style.setProperty('--dark-accent', this.preferences.accentColor || '#4a9eff');
    document.body.classList.add('shadow-scribe-dark');
  }

  // Internal: Remove injected styles
  removeStyles() {
    const root = document.documentElement;
    root.style.removeProperty('--dark-bg');
    root.style.removeProperty('--dark-text');
    root.style.removeProperty('--dark-accent');
    document.body.classList.remove('shadow-scribe-dark');
  }

  // Internal: Watch for dynamic content
  observeDOMChanges() {
    this.observer = new MutationObserver((mutations) => {
      // Re-apply styles to new elements if needed
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
```

### 3.4 Toggle Button (content/toggle-button.js)

Creates and manages the in-page toggle button for quick theme switching.

**Responsibilities:**

- Create toggle button UI element
- Position button to avoid blocking content
- Handle click events and update theme
- Reflect current theme state visually

**Interface:**

```javascript
class ToggleButton {
  constructor(themeManager) {
    this.themeManager = themeManager;
    this.button = null;
  }

  // Create and inject toggle button into page
  create() {
    this.button = document.createElement('button');
    this.button.id = 'shadow-scribe-toggle';
    this.button.className = 'shadow-scribe-toggle';
    this.button.innerHTML = '🌙'; // Moon icon for dark mode
    this.button.addEventListener('click', () => this.handleToggle());
    document.body.appendChild(this.button);
  }

  // Handle toggle button click
  async handleToggle() {
    const currentState = await getDocumentThemeState();
    const newState = !currentState.enabled;
    await setDocumentThemeState({ enabled: newState });

    if (newState) {
      const preferences = await getPreferences();
      this.themeManager.applyDarkMode(preferences);
      this.button.innerHTML = '☀️'; // Sun icon for light mode
    } else {
      this.themeManager.removeDarkMode();
      this.button.innerHTML = '🌙';
    }
  }

  // Update button appearance based on theme state
  updateState(isDarkMode) {
    this.button.innerHTML = isDarkMode ? '☀️' : '🌙';
  }

  // Remove button from page
  remove() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }
}
```

### 3.5 Content Script Entry Point (content/content.js)

Main entry point that initializes the extension on Proton Docs pages.

**Responsibilities:**

- Initialize theme manager and toggle button
- Load saved preferences and apply theme
- Listen for messages from background script
- Handle page navigation and state updates

**Interface:**

```javascript
let themeManager;
let toggleButton;

// Initialize extension on page load
async function initialize() {
  themeManager = new ThemeManager();
  toggleButton = new ToggleButton(themeManager);

  // Check global state
  const { globalEnabled } = await browser.runtime.sendMessage({ type: 'GET_GLOBAL_STATE' });
  if (!globalEnabled) return;

  // Load document-specific preferences
  const documentId = getDocumentIdFromURL();
  const state = await getDocumentThemeState(documentId);

  if (state.enabled) {
    const preferences = await getPreferences();
    await themeManager.applyDarkMode(preferences);
  }

  toggleButton.create();
  toggleButton.updateState(state.enabled);
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'GLOBAL_STATE_CHANGED') {
    handleGlobalStateChange(message.enabled);
  } else if (message.type === 'PREFERENCES_UPDATED') {
    handlePreferencesUpdate(message.preferences);
  }
});

// Handle global enable/disable
function handleGlobalStateChange(enabled) {
  if (!enabled) {
    themeManager.removeDarkMode();
    toggleButton.remove();
  } else {
    initialize();
  }
}

// Handle preference updates
function handlePreferencesUpdate(preferences) {
  themeManager.updatePreferences(preferences);
}

// Extract document ID from URL
function getDocumentIdFromURL() {
  const match = window.location.pathname.match(/\/docs\/([^/]+)/);
  return match ? match[1] : 'default';
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
```

### 3.6 Storage Utilities (utils/storage.js)

Abstraction layer for browser storage operations.

**Responsibilities:**

- Provide clean API for preference storage
- Handle document-specific and global settings
- Manage default values
- Ensure data consistency

**Interface:**

```javascript
// Default preferences
const DEFAULT_PREFERENCES = {
  backgroundColor: '#1e1e1e',
  textColor: '#e0e0e0',
  accentColor: '#4a9eff',
  backgroundDarkness: 0.9,
};

// Get user preferences
async function getPreferences() {
  const { preferences } = await browser.storage.local.get('preferences');
  return { ...DEFAULT_PREFERENCES, ...preferences };
}

// Save user preferences
async function setPreferences(preferences) {
  await browser.storage.local.set({ preferences });
  // Notify background script to broadcast update
  await browser.runtime.sendMessage({
    type: 'PREFERENCES_UPDATED',
    preferences,
  });
}

// Get theme state for specific document
async function getDocumentThemeState(documentId = 'default') {
  const key = `theme_state_${documentId}`;
  const result = await browser.storage.local.get(key);
  return result[key] || { enabled: false };
}

// Save theme state for specific document
async function setDocumentThemeState(documentId = 'default', state) {
  const key = `theme_state_${documentId}`;
  await browser.storage.local.set({ [key]: state });
}

// Get global enable/disable state
async function getGlobalState() {
  const { globalEnabled = true } = await browser.storage.local.get('globalEnabled');
  return globalEnabled;
}

// Set global enable/disable state
async function setGlobalState(enabled) {
  await browser.storage.local.set({ globalEnabled: enabled });
  await browser.runtime.sendMessage({
    type: 'SET_GLOBAL_STATE',
    enabled,
  });
}
```

### 3.7 Options Page (options/options.html, options.js)

Settings interface for customizing dark mode appearance.

**Responsibilities:**

- Display current preferences
- Allow customization of colors and darkness
- Provide global enable/disable toggle
- Save changes and update all tabs

**HTML Structure:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Shadow Scribe Settings</title>
    <link rel="stylesheet" href="options.css" />
  </head>
  <body>
    <div class="container">
      <h1>Shadow Scribe Settings</h1>

      <section class="setting-group">
        <h2>Global Control</h2>
        <label>
          <input type="checkbox" id="globalEnabled" />
          Enable Shadow Scribe for all documents
        </label>
      </section>

      <section class="setting-group">
        <h2>Appearance</h2>

        <label>
          Background Color
          <input type="color" id="backgroundColor" value="#1e1e1e" />
        </label>

        <label>
          Text Color
          <input type="color" id="textColor" value="#e0e0e0" />
        </label>

        <label>
          Accent Color
          <input type="color" id="accentColor" value="#4a9eff" />
        </label>

        <label>
          Background Darkness
          <input type="range" id="backgroundDarkness" min="0" max="1" step="0.1" value="0.9" />
          <span id="darknessValue">90%</span>
        </label>
      </section>

      <button id="saveButton">Save Settings</button>
      <button id="resetButton">Reset to Defaults</button>
    </div>

    <script src="../utils/storage.js"></script>
    <script src="options.js"></script>
  </body>
</html>
```

**JavaScript Logic:**

```javascript
// Load current settings on page load
async function loadSettings() {
  const preferences = await getPreferences();
  const globalEnabled = await getGlobalState();

  document.getElementById('globalEnabled').checked = globalEnabled;
  document.getElementById('backgroundColor').value = preferences.backgroundColor;
  document.getElementById('textColor').value = preferences.textColor;
  document.getElementById('accentColor').value = preferences.accentColor;
  document.getElementById('backgroundDarkness').value = preferences.backgroundDarkness;
  updateDarknessDisplay(preferences.backgroundDarkness);
}

// Save settings
async function saveSettings() {
  const preferences = {
    backgroundColor: document.getElementById('backgroundColor').value,
    textColor: document.getElementById('textColor').value,
    accentColor: document.getElementById('accentColor').value,
    backgroundDarkness: parseFloat(document.getElementById('backgroundDarkness').value),
  };

  const globalEnabled = document.getElementById('globalEnabled').checked;

  await setPreferences(preferences);
  await setGlobalState(globalEnabled);

  showSaveConfirmation();
}

// Reset to defaults
async function resetSettings() {
  await setPreferences(DEFAULT_PREFERENCES);
  await loadSettings();
}

// Event listeners
document.getElementById('saveButton').addEventListener('click', saveSettings);
document.getElementById('resetButton').addEventListener('click', resetSettings);
document.getElementById('backgroundDarkness').addEventListener('input', (e) => {
  updateDarknessDisplay(e.target.value);
});

loadSettings();
```

### 3.8 Dark Mode CSS (content/dark-mode.css)

CSS styles that transform Proton Docs into dark mode.

**Key Styling Strategies:**

- Use CSS custom properties for dynamic theming
- Target Proton Docs specific selectors
- Preserve image and media appearance with filters
- Ensure proper contrast for accessibility
- Style all UI elements consistently

**CSS Structure:**

```css
/* Root variables for dynamic theming */
:root {
  --dark-bg: #1e1e1e;
  --dark-text: #e0e0e0;
  --dark-accent: #4a9eff;
  --dark-border: #3a3a3a;
  --dark-hover: #2a2a2a;
}

/* Main document background and text */
body.shadow-scribe-dark {
  background-color: var(--dark-bg) !important;
  color: var(--dark-text) !important;
}

/* Document canvas/editor area */
body.shadow-scribe-dark [role='textbox'],
body.shadow-scribe-dark .document-canvas,
body.shadow-scribe-dark .editor-content {
  background-color: var(--dark-bg) !important;
  color: var(--dark-text) !important;
}

/* Toolbar and menus */
body.shadow-scribe-dark .toolbar,
body.shadow-scribe-dark .menu,
body.shadow-scribe-dark .dropdown {
  background-color: #252525 !important;
  color: var(--dark-text) !important;
  border-color: var(--dark-border) !important;
}

/* Buttons and controls */
body.shadow-scribe-dark button,
body.shadow-scribe-dark .button {
  background-color: #2a2a2a !important;
  color: var(--dark-text) !important;
  border-color: var(--dark-border) !important;
}

body.shadow-scribe-dark button:hover,
body.shadow-scribe-dark .button:hover {
  background-color: var(--dark-hover) !important;
}

/* Preserve images - don't invert */
body.shadow-scribe-dark img,
body.shadow-scribe-dark video,
body.shadow-scribe-dark canvas {
  filter: none !important;
}

/* Sidebars and panels */
body.shadow-scribe-dark .sidebar,
body.shadow-scribe-dark .panel {
  background-color: #1a1a1a !important;
  color: var(--dark-text) !important;
}

/* Modal dialogs */
body.shadow-scribe-dark .modal,
body.shadow-scribe-dark .dialog {
  background-color: #252525 !important;
  color: var(--dark-text) !important;
}

/* Links and accents */
body.shadow-scribe-dark a {
  color: var(--dark-accent) !important;
}

/* Toggle button styling */
.shadow-scribe-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--dark-accent);
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  transition: transform 0.2s;
}

.shadow-scribe-toggle:hover {
  transform: scale(1.1);
}
```

## 4. Data Models

### 4.1 Preferences Object

```javascript
{
  backgroundColor: string,      // Hex color for background (e.g., "#1e1e1e")
  textColor: string,            // Hex color for text (e.g., "#e0e0e0")
  accentColor: string,          // Hex color for accents (e.g., "#4a9eff")
  backgroundDarkness: number    // Darkness level 0.0-1.0 (e.g., 0.9)
}
```

### 4.2 Theme State Object

```javascript
{
  enabled: boolean,             // Whether dark mode is enabled for this document
  documentId: string            // Unique identifier for the document
}
```

### 4.3 Global State Object

```javascript
{
  globalEnabled: boolean; // Whether extension is globally enabled
}
```

### 4.4 Message Types

```javascript
// Get global state
{ type: 'GET_GLOBAL_STATE' }

// Set global state
{ type: 'SET_GLOBAL_STATE', enabled: boolean }

// Preferences updated
{ type: 'PREFERENCES_UPDATED', preferences: PreferencesObject }

// Global state changed
{ type: 'GLOBAL_STATE_CHANGED', enabled: boolean }
```

## 5. Key Algorithms

### 5.1 Theme Application Algorithm

```
1. Check if global state is enabled
   - If disabled, exit
2. Extract document ID from URL
3. Load document-specific theme state from storage
4. If theme state is enabled:
   a. Load user preferences from storage
   b. Inject CSS custom properties with preference values
   c. Add 'shadow-scribe-dark' class to body
   d. Initialize MutationObserver for dynamic content
5. Create and position toggle button
6. Update toggle button to reflect current state
```

### 5.2 Toggle Handling Algorithm

```
1. User clicks toggle button
2. Retrieve current theme state for document
3. Invert the enabled state (true → false or false → true)
4. Save new state to storage
5. If enabling dark mode:
   a. Load preferences
   b. Apply dark mode with preferences
   c. Update button icon to sun (☀️)
6. If disabling dark mode:
   a. Remove dark mode styles
   b. Update button icon to moon (🌙)
```

### 5.3 Preference Update Propagation Algorithm

```
1. User changes preferences in options page
2. Save new preferences to storage
3. Send message to background script with new preferences
4. Background script broadcasts message to all tabs
5. Each content script receives message
6. Each content script updates theme manager with new preferences
7. Theme manager re-applies styles with new values
```

### 5.4 Dynamic Content Handling Algorithm

```
1. MutationObserver detects DOM changes
2. For each added node:
   a. Check if node needs dark mode styling
   b. If yes, apply appropriate CSS classes or inline styles
3. Throttle observer callbacks to avoid performance issues
4. Use requestAnimationFrame for smooth updates
```

## 6. Performance Considerations

### 6.1 Optimization Strategies

1. **CSS-First Approach**: Use CSS classes and custom properties instead of inline styles
2. **Lazy Initialization**: Only initialize components when needed
3. **Debounced Updates**: Throttle MutationObserver callbacks to 100ms
4. **Efficient Selectors**: Use specific CSS selectors to minimize reflow
5. **Memory Management**: Disconnect observers when dark mode is disabled

### 6.2 Performance Targets

- Initial theme application: < 100ms
- Toggle transition: < 200ms
- Memory usage per tab: < 50MB
- CPU usage during idle: < 1%
- MutationObserver callback frequency: Max 10 per second

## 7. Testing Strategy

### 7.1 Testing Framework

**Property-Based Testing**: fast-check (JavaScript property-based testing library)
**Unit Testing**: Jest or Mocha
**Integration Testing**: Selenium WebDriver with Firefox
**Manual Testing**: Real Proton Docs documents

### 7.2 Unit Tests

- Theme manager style injection and removal
- Storage utility functions (get/set preferences)
- Toggle button creation and event handling
- Message passing between components
- URL parsing for document ID extraction

### 7.3 Integration Tests

- End-to-end theme application on real pages
- Multi-tab synchronization
- Options page updates propagating to content scripts
- Global enable/disable affecting all tabs
- Browser restart persistence

### 7.4 Property-Based Tests

Property-based tests will verify correctness properties that must hold for all inputs. Each property is linked to specific requirements.

## 8. Correctness Properties

### Property 8.1: Theme State Persistence

**Validates: Requirements 3.8.1, 3.8.2, 3.8.4**

For any document ID and theme state (enabled/disabled), if we save the state and then retrieve it, we must get back the exact same state.

```javascript
// Property: Saved theme state is always retrievable
fc.assert(
  fc.asyncProperty(
    fc.string(), // documentId
    fc.boolean(), // enabled state
    async (documentId, enabled) => {
      await setDocumentThemeState(documentId, { enabled });
      const retrieved = await getDocumentThemeState(documentId);
      return retrieved.enabled === enabled;
    }
  )
);
```

### Property 8.2: Preference Persistence

**Validates: Requirements 3.8.3, 3.8.4**

For any valid preference object, if we save it and then retrieve it, we must get back the same preferences.

```javascript
// Property: Saved preferences are always retrievable
fc.assert(
  fc.asyncProperty(
    fc.record({
      backgroundColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      textColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      accentColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      backgroundDarkness: fc.double({ min: 0, max: 1 }),
    }),
    async (preferences) => {
      await setPreferences(preferences);
      const retrieved = await getPreferences();
      return (
        retrieved.backgroundColor === preferences.backgroundColor &&
        retrieved.textColor === preferences.textColor &&
        retrieved.accentColor === preferences.accentColor &&
        Math.abs(retrieved.backgroundDarkness - preferences.backgroundDarkness) < 0.001
      );
    }
  )
);
```

### Property 8.3: Theme Application Idempotence

**Validates: Requirements 3.1.1, 3.1.2, 3.1.3**

Applying dark mode multiple times with the same preferences should result in the same visual state. The operation is idempotent.

```javascript
// Property: Applying theme multiple times produces same result
fc.assert(
  fc.property(
    fc.record({
      backgroundColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      textColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      accentColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      backgroundDarkness: fc.double({ min: 0, max: 1 }),
    }),
    (preferences) => {
      const themeManager = new ThemeManager();

      themeManager.applyDarkMode(preferences);
      const state1 = captureThemeState();

      themeManager.applyDarkMode(preferences);
      const state2 = captureThemeState();

      return deepEqual(state1, state2);
    }
  )
);
```

### Property 8.4: Theme Removal Completeness

**Validates: Requirements 3.4.4, 3.4.5**

After applying and then removing dark mode, the document should return to its original state with no dark mode artifacts remaining.

```javascript
// Property: Theme removal restores original state
fc.assert(
  fc.property(
    fc.record({
      backgroundColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      textColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      accentColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      backgroundDarkness: fc.double({ min: 0, max: 1 }),
    }),
    (preferences) => {
      const themeManager = new ThemeManager();
      const originalState = captureThemeState();

      themeManager.applyDarkMode(preferences);
      themeManager.removeDarkMode();

      const finalState = captureThemeState();
      return deepEqual(originalState, finalState);
    }
  )
);
```

### Property 8.5: Toggle State Consistency

**Validates: Requirements 3.2.2, 3.2.3**

Toggling dark mode an even number of times should return to the original state. Toggling an odd number of times should result in the opposite state.

```javascript
// Property: Even toggles return to original state
fc.assert(
  fc.asyncProperty(
    fc.nat({ max: 10 }), // number of toggle pairs
    fc.string(), // documentId
    async (togglePairs, documentId) => {
      const initialState = await getDocumentThemeState(documentId);

      // Toggle even number of times (togglePairs * 2)
      for (let i = 0; i < togglePairs * 2; i++) {
        await toggleTheme(documentId);
      }

      const finalState = await getDocumentThemeState(documentId);
      return finalState.enabled === initialState.enabled;
    }
  )
);
```

### Property 8.6: Global State Override

**Validates: Requirements 3.9.2, 3.9.3, 3.9.4**

When global state is disabled, no document should have dark mode applied, regardless of individual document settings. When re-enabled, documents should restore their individual states.

```javascript
// Property: Global disable overrides all document states
fc.assert(
  fc.asyncProperty(
    fc.array(
      fc.record({
        documentId: fc.string(),
        enabled: fc.boolean(),
      }),
      { minLength: 1, maxLength: 5 }
    ),
    async (documentStates) => {
      // Set up document states
      for (const state of documentStates) {
        await setDocumentThemeState(state.documentId, { enabled: state.enabled });
      }

      // Disable globally
      await setGlobalState(false);
      const allDisabled = await checkAllDocumentsDisabled(documentStates.map((s) => s.documentId));

      // Re-enable globally
      await setGlobalState(true);
      const statesRestored = await checkDocumentStatesMatch(documentStates);

      return allDisabled && statesRestored;
    }
  )
);
```

### Property 8.7: Preference Update Propagation

**Validates: Requirements 3.3.5**

When preferences are updated, all open tabs should receive and apply the new preferences within a reasonable time frame.

```javascript
// Property: Preference updates propagate to all tabs
fc.assert(
  fc.asyncProperty(
    fc.record({
      backgroundColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      textColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      accentColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      backgroundDarkness: fc.double({ min: 0, max: 1 }),
    }),
    fc.nat({ min: 1, max: 5 }), // number of tabs
    async (newPreferences, tabCount) => {
      // Simulate multiple tabs
      const tabs = Array.from({ length: tabCount }, () => createMockTab());

      // Update preferences
      await setPreferences(newPreferences);

      // Wait for propagation (max 1 second)
      await sleep(1000);

      // Check all tabs received update
      const allUpdated = tabs.every((tab) =>
        deepEqual(tab.getCurrentPreferences(), newPreferences)
      );

      return allUpdated;
    }
  )
);
```

### Property 8.8: Document Data Preservation

**Validates: Requirements 3.4.1, 3.4.2, 3.4.3, 3.4.5**

Applying dark mode should never modify the underlying document data. The document content, structure, and formatting must remain unchanged.

```javascript
// Property: Dark mode never modifies document data
fc.assert(
  fc.property(
    fc.record({
      backgroundColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      textColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      accentColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      backgroundDarkness: fc.double({ min: 0, max: 1 }),
    }),
    (preferences) => {
      const themeManager = new ThemeManager();
      const originalContent = captureDocumentContent();

      themeManager.applyDarkMode(preferences);
      const contentAfterApply = captureDocumentContent();

      themeManager.removeDarkMode();
      const contentAfterRemove = captureDocumentContent();

      return (
        deepEqual(originalContent, contentAfterApply) &&
        deepEqual(originalContent, contentAfterRemove)
      );
    }
  )
);
```

### Property 8.9: Performance Bounds

**Validates: Requirements 3.7.1, 3.7.2, 3.7.4**

Theme operations must complete within specified time bounds and memory limits.

```javascript
// Property: Theme application completes within time limit
fc.assert(
  fc.asyncProperty(
    fc.record({
      backgroundColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      textColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      accentColor: fc.hexaString({ minLength: 7, maxLength: 7 }),
      backgroundDarkness: fc.double({ min: 0, max: 1 }),
    }),
    async (preferences) => {
      const themeManager = new ThemeManager();

      const startTime = performance.now();
      await themeManager.applyDarkMode(preferences);
      const applyTime = performance.now() - startTime;

      const toggleStart = performance.now();
      themeManager.removeDarkMode();
      await themeManager.applyDarkMode(preferences);
      const toggleTime = performance.now() - toggleStart;

      return applyTime < 100 && toggleTime < 200;
    }
  )
);
```

### Property 8.10: Color Validity

**Validates: Requirements 3.3.3, 3.3.4**

All color values in preferences must be valid hex colors, and the extension should handle any valid hex color correctly.

```javascript
// Property: All valid hex colors are handled correctly
fc.assert(
  fc.property(
    fc.hexaString({ minLength: 7, maxLength: 7 }).map((s) => '#' + s),
    fc.hexaString({ minLength: 7, maxLength: 7 }).map((s) => '#' + s),
    fc.hexaString({ minLength: 7, maxLength: 7 }).map((s) => '#' + s),
    (bgColor, textColor, accentColor) => {
      const preferences = {
        backgroundColor: bgColor,
        textColor: textColor,
        accentColor: accentColor,
        backgroundDarkness: 0.9,
      };

      const themeManager = new ThemeManager();
      themeManager.applyDarkMode(preferences);

      const appliedBg = getComputedStyle(document.documentElement)
        .getPropertyValue('--dark-bg')
        .trim();
      const appliedText = getComputedStyle(document.documentElement)
        .getPropertyValue('--dark-text')
        .trim();
      const appliedAccent = getComputedStyle(document.documentElement)
        .getPropertyValue('--dark-accent')
        .trim();

      return appliedBg === bgColor && appliedText === textColor && appliedAccent === accentColor;
    }
  )
);
```

## 9. Security Considerations

### 9.1 Content Security Policy

- Extension must comply with Firefox's CSP requirements
- No inline script execution
- All scripts loaded from extension package
- No eval() or similar dynamic code execution

### 9.2 Data Privacy

- All preferences stored locally in browser storage
- No data transmitted to external servers
- No tracking or analytics
- Document content never accessed or modified

### 9.3 Permission Minimization

- Request only necessary permissions (storage, activeTab)
- Host permissions limited to drive.proton.me domain
- No access to other websites or browser data

### 9.4 Injection Safety

- CSS injection uses safe custom properties
- No user-provided CSS executed
- DOM manipulation limited to theme application
- No modification of document data or structure

## 10. Error Handling

### 10.1 Storage Errors

- Gracefully handle storage quota exceeded
- Provide fallback to default preferences
- Log errors for debugging
- Notify user if preferences cannot be saved

### 10.2 DOM Manipulation Errors

- Catch and log errors during theme application
- Fallback to safe state if injection fails
- Prevent extension from breaking page functionality
- Retry mechanism for transient failures

### 10.3 Message Passing Errors

- Handle disconnected ports gracefully
- Timeout for message responses
- Retry failed broadcasts
- Log communication errors

### 10.4 Browser Compatibility Errors

- Detect unsupported Firefox versions
- Provide user-friendly error messages
- Graceful degradation for missing APIs
- Version checking on installation

## 11. Future Enhancements

### 11.1 Potential Features

1. **Auto Dark Mode**: Automatically enable dark mode based on system theme or time of day
2. **Custom Themes**: Allow users to create and save multiple theme presets
3. **Sync Across Devices**: Use Firefox Sync to synchronize preferences across devices
4. **Keyboard Shortcuts**: Add keyboard shortcuts for quick theme toggling
5. **Per-Document Preferences**: Allow different color schemes for different documents
6. **Export/Import Settings**: Enable sharing theme configurations
7. **Advanced Selectors**: Allow power users to customize CSS selectors
8. **Contrast Checker**: Built-in accessibility contrast ratio checker

### 11.2 Scalability Considerations

- Design supports adding new theme properties without breaking changes
- Modular architecture allows easy addition of new components
- Message passing system can handle additional message types
- Storage schema versioning for future migrations

## 12. Development Workflow

### 12.1 Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Build extension: `npm run build`
4. Load in Firefox: about:debugging → Load Temporary Add-on

### 12.2 Development Commands

- `npm run dev`: Watch mode for development
- `npm run build`: Production build
- `npm run test`: Run all tests
- `npm run test:unit`: Run unit tests only
- `npm run test:pbt`: Run property-based tests only
- `npm run lint`: Lint code
- `npm run format`: Format code with Prettier

### 12.3 Testing Workflow

1. Write unit tests for new components
2. Write property-based tests for correctness properties
3. Run tests locally before committing
4. Manual testing on real Proton Docs pages
5. Test across different Firefox versions

### 12.4 Release Process

1. Update version in manifest.json
2. Run full test suite
3. Build production package
4. Test packaged extension
5. Submit to Firefox Add-ons store
6. Tag release in version control

## 13. Dependencies

### 13.1 Runtime Dependencies

- Firefox 115+ (WebExtensions API)
- No external JavaScript libraries required

### 13.2 Development Dependencies

- Node.js 18+
- npm or yarn
- fast-check (property-based testing)
- Jest or Mocha (unit testing)
- Selenium WebDriver (integration testing)
- ESLint (linting)
- Prettier (code formatting)

### 13.3 Build Tools

- Webpack or Rollup for bundling
- Babel for transpilation (if needed)
- web-ext for Firefox extension development

## 14. Conclusion

This design provides a comprehensive architecture for Shadow Scribe, a Firefox extension that applies dark mode to Proton Docs. The modular design ensures maintainability, the property-based testing approach ensures correctness, and the performance considerations ensure a smooth user experience.

The extension follows Firefox best practices, respects user privacy, and provides a flexible, customizable dark mode experience while preserving document integrity and functionality.
