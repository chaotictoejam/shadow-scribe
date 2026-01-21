# Implementation Tasks: Shadow Scribe

## 1. Project Setup and Configuration

- [x] 1.1 Initialize project structure
  - Create directory structure (content/, options/, utils/, icons/)
  - Initialize package.json with dependencies
  - Set up build configuration (webpack/rollup)

- [x] 1.2 Create manifest.json
  - Define extension metadata (name, version, description)
  - Configure permissions (storage, activeTab)
  - Set host permissions for drive.proton.me
  - Configure content scripts injection rules
  - Set up background service worker
  - Configure options page

- [x] 1.3 Set up development environment
  - Install development dependencies (fast-check, Jest, ESLint, Prettier)
  - Configure build scripts (dev, build, test)
  - Set up linting and formatting rules
  - Create .gitignore file

- [x] 1.4 Create placeholder icons
  - Generate or create icon-16.png
  - Generate or create icon-48.png
  - Generate or create icon-128.png

## 2. Core Storage Utilities

- [x] 2.1 Implement storage abstraction layer (utils/storage.js)
  - Define DEFAULT_PREFERENCES constant
  - Implement getPreferences() function
  - Implement setPreferences() function
  - Implement getDocumentThemeState() function
  - Implement setDocumentThemeState() function
  - Implement getGlobalState() function
  - Implement setGlobalState() function

- [x] 2.2 Write unit tests for storage utilities
  - Test getPreferences with no saved data (returns defaults)
  - Test setPreferences and getPreferences round-trip
  - Test getDocumentThemeState with multiple document IDs
  - Test setDocumentThemeState persistence
  - Test getGlobalState default value
  - Test setGlobalState persistence

- [x] 2.3 Write property-based test for storage persistence (Property 8.1)
  - Test theme state persistence for arbitrary document IDs and states
  - Verify saved state is always retrievable

- [x] 2.4 Write property-based test for preference persistence (Property 8.2)
  - Test preference persistence for arbitrary valid preference objects
  - Verify saved preferences are always retrievable

## 3. Messaging Utilities

- [x] 3.1 Implement messaging abstraction (utils/messaging.js)
  - Create sendMessage() wrapper function
  - Create broadcastToAllTabs() function
  - Create message type constants
  - Add error handling for disconnected ports

- [x] 3.2 Write unit tests for messaging utilities
  - Test sendMessage with mock browser.runtime
  - Test broadcastToAllTabs with multiple tabs
  - Test error handling for failed messages

## 4. Background Service Worker

- [x] 4.1 Implement background script (background.js)
  - Set up message listener
  - Implement GET_GLOBAL_STATE handler
  - Implement SET_GLOBAL_STATE handler
  - Implement PREFERENCES_UPDATED handler
  - Implement broadcastToAllTabs() function
  - Add initialization logic for default settings

- [x] 4.2 Write unit tests for background script
  - Test GET_GLOBAL_STATE message handling
  - Test SET_GLOBAL_STATE message handling
  - Test PREFERENCES_UPDATED broadcasting
  - Test initialization on extension install

## 5. Theme Manager Component

- [x] 5.1 Implement ThemeManager class (content/theme-manager.js)
  - Create ThemeManager constructor
  - Implement applyDarkMode() method
  - Implement removeDarkMode() method
  - Implement updatePreferences() method
  - Implement injectStyles() method
  - Implement removeStyles() method
  - Implement observeDOMChanges() method
  - Implement disconnectObserver() method

- [x] 5.2 Write unit tests for ThemeManager
  - Test applyDarkMode applies CSS custom properties
  - Test removeDarkMode removes all styles
  - Test updatePreferences updates existing styles
  - Test MutationObserver initialization
  - Test observer disconnection

- [x] 5.3 Write property-based test for theme idempotence (Property 8.3)
  - Test applying theme multiple times produces same result
  - Verify idempotent behavior for arbitrary preferences

- [x] 5.4 Write property-based test for theme removal (Property 8.4)
  - Test theme removal restores original state
  - Verify no dark mode artifacts remain after removal

- [x] 5.5 Write property-based test for document preservation (Property 8.8)
  - Test dark mode never modifies document data
  - Verify document content, structure, and formatting unchanged

## 6. Toggle Button Component

- [x] 6.1 Implement ToggleButton class (content/toggle-button.js)
  - Create ToggleButton constructor
  - Implement create() method
  - Implement handleToggle() method
  - Implement updateState() method
  - Implement remove() method
  - Add button positioning logic

- [x] 6.2 Write unit tests for ToggleButton
  - Test button creation and DOM injection
  - Test click event handling
  - Test state updates (icon changes)
  - Test button removal
  - Test positioning to avoid content blocking

- [x] 6.3 Write property-based test for toggle consistency (Property 8.5)
  - Test even number of toggles returns to original state
  - Test odd number of toggles results in opposite state

## 7. Dark Mode CSS Styles

- [x] 7.1 Create dark mode stylesheet (content/dark-mode.css)
  - Define CSS custom properties (--dark-bg, --dark-text, --dark-accent)
  - Style body and main document areas
  - Style toolbar and menus
  - Style buttons and controls
  - Style sidebars and panels
  - Style modal dialogs
  - Style links and accents
  - Preserve images and media (no filter inversion)
  - Style toggle button

- [ ] 7.2 Test CSS styles on mock Proton Docs structure
  - Create test HTML with Proton Docs-like structure
  - Verify all elements are styled correctly
  - Test contrast ratios for accessibility
  - Verify images are not inverted

## 8. Content Script Entry Point

- [x] 8.1 Implement content script (content/content.js)
  - Create initialize() function
  - Implement global state check
  - Implement document ID extraction from URL
  - Load and apply saved theme state
  - Create toggle button
  - Set up message listeners
  - Implement handleGlobalStateChange()
  - Implement handlePreferencesUpdate()
  - Add DOM ready check

- [ ] 8.2 Write integration tests for content script
  - Test initialization on page load
  - Test theme application based on saved state
  - Test message handling from background script
  - Test global state changes
  - Test preference updates

## 9. Options Page UI

- [x] 9.1 Create options page HTML (options/options.html)
  - Create page structure with container
  - Add global enable/disable checkbox
  - Add background color picker
  - Add text color picker
  - Add accent color picker
  - Add background darkness slider
  - Add save button
  - Add reset button
  - Link CSS and JavaScript files

- [x] 9.2 Create options page styles (options/options.css)
  - Style container and layout
  - Style setting groups
  - Style form controls (checkboxes, color pickers, sliders)
  - Style buttons
  - Add responsive design
  - Add visual feedback for interactions

- [x] 9.3 Implement options page logic (options/options.js)
  - Implement loadSettings() function
  - Implement saveSettings() function
  - Implement resetSettings() function
  - Implement updateDarknessDisplay() function
  - Add event listeners for all controls
  - Add save confirmation feedback
  - Handle errors gracefully

- [ ] 9.4 Write tests for options page
  - Test loadSettings populates form correctly
  - Test saveSettings persists changes
  - Test resetSettings restores defaults
  - Test form validation
  - Test save confirmation display

## 10. Property-Based Tests for Advanced Properties

- [ ] 10.1 Write property-based test for global state override (Property 8.6)
  - Test global disable overrides all document states
  - Test re-enabling restores individual document states
  - Verify behavior with multiple documents

- [ ] 10.2 Write property-based test for preference propagation (Property 8.7)
  - Test preference updates propagate to all tabs
  - Verify all tabs receive updates within time limit
  - Test with varying number of tabs

- [ ] 10.3 Write property-based test for performance bounds (Property 8.9)
  - Test theme application completes within 100ms
  - Test toggle completes within 200ms
  - Verify performance with arbitrary preferences

- [ ] 10.4 Write property-based test for color validity (Property 8.10)
  - Test all valid hex colors are handled correctly
  - Verify CSS custom properties are set correctly
  - Test with arbitrary valid hex color combinations

## 11. Integration and End-to-End Testing

- [ ] 11.1 Set up Selenium WebDriver test environment
  - Install Selenium and Firefox WebDriver
  - Create test utilities for loading extension
  - Create helper functions for interacting with Proton Docs

- [ ] 11.2 Write end-to-end tests
  - Test complete theme application flow on real page
  - Test toggle button functionality
  - Test multi-tab synchronization
  - Test options page updates propagating to content scripts
  - Test global enable/disable affecting all tabs
  - Test persistence across browser restart (manual test)

- [ ] 11.3 Write performance tests
  - Measure initial theme application time
  - Measure toggle transition time
  - Measure memory usage per tab
  - Verify performance targets are met

## 12. Error Handling and Edge Cases

- [ ] 12.1 Implement error handling for storage operations
  - Handle storage quota exceeded
  - Provide fallback to default preferences
  - Add error logging
  - Display user-friendly error messages

- [ ] 12.2 Implement error handling for DOM manipulation
  - Catch errors during theme application
  - Implement fallback to safe state
  - Add retry mechanism for transient failures
  - Prevent extension from breaking page

- [ ] 12.3 Implement error handling for message passing
  - Handle disconnected ports
  - Add timeout for message responses
  - Implement retry for failed broadcasts
  - Log communication errors

- [ ] 12.4 Test error scenarios
  - Test behavior when storage is full
  - Test behavior when DOM manipulation fails
  - Test behavior when messages fail to send
  - Test graceful degradation

## 13. Browser Compatibility and Security

- [ ] 13.1 Implement Firefox version detection
  - Check for Firefox 115+ on installation
  - Display error message for unsupported versions
  - Test on multiple Firefox versions

- [ ] 13.2 Security audit
  - Verify no inline scripts
  - Verify CSP compliance
  - Verify permission minimization
  - Verify no data leakage
  - Test injection safety

- [ ] 13.3 Accessibility testing
  - Verify contrast ratios meet WCAG standards
  - Test with screen readers
  - Test keyboard navigation
  - Verify focus indicators

## 14. Documentation and Polish

- [x] 14.1 Create README.md
  - Add project description
  - Add installation instructions
  - Add usage guide
  - Add development setup instructions
  - Add contribution guidelines

- [ ] 14.2 Create user documentation
  - Write user guide for extension features
  - Create screenshots of extension in action
  - Document customization options
  - Add troubleshooting section

- [ ] 14.3 Code documentation
  - Add JSDoc comments to all functions
  - Document complex algorithms
  - Add inline comments for clarity
  - Create architecture diagram

- [ ] 14.4 Final polish
  - Run full test suite and fix any failures
  - Run linter and fix all issues
  - Format all code with Prettier
  - Optimize bundle size
  - Test on real Proton Docs documents

## 15. Packaging and Release

- [x] 15.1 Prepare for release
  - Update version number in manifest.json
  - Create CHANGELOG.md
  - Review and update all documentation
  - Create release notes

- [x] 15.2 Build production package
  - Run production build
  - Test packaged extension thoroughly
  - Verify all features work in packaged version
  - Check bundle size

- [ ] 15.3 Firefox Add-ons submission
  - Create Firefox Add-ons developer account (if needed)
  - Prepare submission materials (screenshots, description)
  - Submit extension for review
  - Respond to reviewer feedback

- [ ] 15.4 Post-release
  - Tag release in version control
  - Monitor for user feedback
  - Plan for future enhancements
  - Set up issue tracking

## Notes

- Tasks should be completed in order within each section
- Property-based tests (PBT) are marked and should use fast-check
- Integration tests require Selenium WebDriver setup
- Manual testing on real Proton Docs is required before release
- All tests must pass before moving to packaging phase
