/**
 * Property-based tests for storage utilities
 * Task 2.3: Write property-based test for storage persistence (Property 8.1)
 * 
 * Uses fast-check for property-based testing to verify correctness properties
 * that must hold for all inputs.
 */

const fc = require('fast-check');

// Load the storage module
require('./storage.js');

describe('Property 8.1: Theme State Persistence', () => {
  /**
   * **Validates: Requirements 3.8.1, 3.8.2, 3.8.4**
   * 
   * For any document ID and theme state (enabled/disabled), if we save the state
   * and then retrieve it, we must get back the exact same state.
   * 
   * This property ensures that:
   * - Theme preferences are correctly stored in browser storage
   * - Saved states can always be retrieved
   * - The storage layer maintains data integrity
   */
  test('Saved theme state is always retrievable for arbitrary document IDs and states', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // documentId - any string
        fc.boolean(), // enabled state - true or false
        async (documentId, enabled) => {
          // Clear any previous mock calls
          jest.clearAllMocks();

          // Mock the storage set operation
          browser.storage.local.set.mockResolvedValue(undefined);

          // Save the theme state
          await window.setDocumentThemeState(documentId, { enabled });

          // Verify the state was saved with the correct key and value
          const expectedKey = `theme_state_${documentId}`;
          expect(browser.storage.local.set).toHaveBeenCalledWith({
            [expectedKey]: { enabled },
          });

          // Mock the storage get operation to return what was saved
          browser.storage.local.get.mockResolvedValue({
            [expectedKey]: { enabled },
          });

          // Retrieve the theme state
          const retrieved = await window.getDocumentThemeState(documentId);

          // Property: Retrieved state must match saved state
          return retrieved.enabled === enabled;
        }
      ),
      {
        // Run 100 test cases with different random inputs
        numRuns: 100,
      }
    );
  });

  test('Theme state persistence works for edge case document IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Test with various edge case strings
        fc.oneof(
          fc.string(), // any string
          fc.constant(''), // empty string
          fc.constant('default'), // default value
          fc.hexaString(), // hex strings
          fc.uuid(), // UUIDs
          fc.string({ minLength: 100, maxLength: 200 }), // long strings
          fc.stringOf(fc.constantFrom('/', '-', '_', '.', ' ')), // special characters
        ),
        fc.boolean(),
        async (documentId, enabled) => {
          jest.clearAllMocks();

          browser.storage.local.set.mockResolvedValue(undefined);
          await window.setDocumentThemeState(documentId, { enabled });

          const expectedKey = `theme_state_${documentId}`;
          browser.storage.local.get.mockResolvedValue({
            [expectedKey]: { enabled },
          });

          const retrieved = await window.getDocumentThemeState(documentId);

          // Property: State must be retrievable even for edge case IDs
          return retrieved.enabled === enabled;
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  test('Multiple document states can be stored and retrieved independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of document ID and state pairs
        fc.array(
          fc.record({
            documentId: fc.string({ minLength: 1 }),
            enabled: fc.boolean(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (documentStates) => {
          jest.clearAllMocks();

          // Save all document states
          for (const { documentId, enabled } of documentStates) {
            browser.storage.local.set.mockResolvedValue(undefined);
            await window.setDocumentThemeState(documentId, { enabled });
          }

          // Retrieve and verify each state independently
          for (const { documentId, enabled } of documentStates) {
            const expectedKey = `theme_state_${documentId}`;
            browser.storage.local.get.mockResolvedValue({
              [expectedKey]: { enabled },
            });

            const retrieved = await window.getDocumentThemeState(documentId);

            // Property: Each document's state must be independently retrievable
            if (retrieved.enabled !== enabled) {
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 50,
      }
    );
  });

  test('Theme state updates correctly overwrite previous values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // documentId
        fc.boolean(), // initial state
        fc.boolean(), // updated state
        async (documentId, initialEnabled, updatedEnabled) => {
          jest.clearAllMocks();

          // Save initial state
          browser.storage.local.set.mockResolvedValue(undefined);
          await window.setDocumentThemeState(documentId, { enabled: initialEnabled });

          // Update to new state
          await window.setDocumentThemeState(documentId, { enabled: updatedEnabled });

          // Mock retrieval to return the updated state
          const expectedKey = `theme_state_${documentId}`;
          browser.storage.local.get.mockResolvedValue({
            [expectedKey]: { enabled: updatedEnabled },
          });

          const retrieved = await window.getDocumentThemeState(documentId);

          // Property: Retrieved state must match the most recent update
          return retrieved.enabled === updatedEnabled;
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  test('Default state is returned for documents with no saved state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // documentId
        async (documentId) => {
          jest.clearAllMocks();

          // Mock storage to return empty (no saved state)
          browser.storage.local.get.mockResolvedValue({});

          const retrieved = await window.getDocumentThemeState(documentId);

          // Property: Default state must be { enabled: false }
          return retrieved.enabled === false;
        }
      ),
      {
        numRuns: 100,
      }
    );
  });
});

describe('Property 8.2: Preference Persistence', () => {
  /**
   * **Validates: Requirements 3.8.3, 3.8.4**
   * 
   * For any valid preference object, if we save it and then retrieve it,
   * we must get back the same preferences.
   * 
   * This property ensures that:
   * - User preferences are correctly stored in browser storage
   * - Saved preferences can always be retrieved
   * - The storage layer maintains preference data integrity
   * - All preference fields (colors and darkness) are persisted correctly
   */
  test('Saved preferences are always retrievable for arbitrary valid preference objects', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate valid hex color strings (7 characters: # + 6 hex digits)
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          // Generate valid darkness values between 0 and 1
          backgroundDarkness: fc.double({ min: 0, max: 1, noNaN: true }),
        }),
        async (preferences) => {
          // Clear any previous mock calls
          jest.clearAllMocks();

          // Mock the storage set operation
          browser.storage.local.set.mockResolvedValue(undefined);
          browser.runtime.sendMessage.mockResolvedValue(undefined);

          // Save the preferences
          await window.setPreferences(preferences);

          // Verify the preferences were saved
          expect(browser.storage.local.set).toHaveBeenCalledWith({ preferences });

          // Mock the storage get operation to return what was saved
          browser.storage.local.get.mockResolvedValue({ preferences });

          // Retrieve the preferences
          const retrieved = await window.getPreferences();

          // Property: Retrieved preferences must match saved preferences
          // Use small epsilon for floating point comparison
          return (
            retrieved.backgroundColor === preferences.backgroundColor &&
            retrieved.textColor === preferences.textColor &&
            retrieved.accentColor === preferences.accentColor &&
            Math.abs(retrieved.backgroundDarkness - preferences.backgroundDarkness) < 0.001
          );
        }
      ),
      {
        // Run 100 test cases with different random inputs
        numRuns: 100,
      }
    );
  });

  test('Preference persistence works with edge case color values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Test various edge case hex colors
          backgroundColor: fc.oneof(
            fc.constant('#000000'), // pure black
            fc.constant('#ffffff'), // pure white
            fc.constant('#ff0000'), // pure red
            fc.constant('#00ff00'), // pure green
            fc.constant('#0000ff'), // pure blue
            fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s), // random
          ),
          textColor: fc.oneof(
            fc.constant('#000000'),
            fc.constant('#ffffff'),
            fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          ),
          accentColor: fc.oneof(
            fc.constant('#000000'),
            fc.constant('#ffffff'),
            fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          ),
          backgroundDarkness: fc.double({ min: 0, max: 1, noNaN: true }),
        }),
        async (preferences) => {
          jest.clearAllMocks();

          browser.storage.local.set.mockResolvedValue(undefined);
          browser.runtime.sendMessage.mockResolvedValue(undefined);
          await window.setPreferences(preferences);

          browser.storage.local.get.mockResolvedValue({ preferences });
          const retrieved = await window.getPreferences();

          // Property: Edge case colors must be persisted correctly
          return (
            retrieved.backgroundColor === preferences.backgroundColor &&
            retrieved.textColor === preferences.textColor &&
            retrieved.accentColor === preferences.accentColor &&
            Math.abs(retrieved.backgroundDarkness - preferences.backgroundDarkness) < 0.001
          );
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  test('Preference persistence works with edge case darkness values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          // Test edge case darkness values
          backgroundDarkness: fc.oneof(
            fc.constant(0.0), // minimum
            fc.constant(1.0), // maximum
            fc.constant(0.5), // middle
            fc.double({ min: 0, max: 1, noNaN: true }), // random
          ),
        }),
        async (preferences) => {
          jest.clearAllMocks();

          browser.storage.local.set.mockResolvedValue(undefined);
          browser.runtime.sendMessage.mockResolvedValue(undefined);
          await window.setPreferences(preferences);

          browser.storage.local.get.mockResolvedValue({ preferences });
          const retrieved = await window.getPreferences();

          // Property: Edge case darkness values must be persisted correctly
          return (
            retrieved.backgroundColor === preferences.backgroundColor &&
            retrieved.textColor === preferences.textColor &&
            retrieved.accentColor === preferences.accentColor &&
            Math.abs(retrieved.backgroundDarkness - preferences.backgroundDarkness) < 0.001
          );
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  test('Preference updates correctly overwrite previous values', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different preference objects
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          backgroundDarkness: fc.double({ min: 0, max: 1, noNaN: true }),
        }),
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          backgroundDarkness: fc.double({ min: 0, max: 1, noNaN: true }),
        }),
        async (initialPreferences, updatedPreferences) => {
          jest.clearAllMocks();

          // Save initial preferences
          browser.storage.local.set.mockResolvedValue(undefined);
          browser.runtime.sendMessage.mockResolvedValue(undefined);
          await window.setPreferences(initialPreferences);

          // Update to new preferences
          await window.setPreferences(updatedPreferences);

          // Mock retrieval to return the updated preferences
          browser.storage.local.get.mockResolvedValue({ preferences: updatedPreferences });
          const retrieved = await window.getPreferences();

          // Property: Retrieved preferences must match the most recent update
          return (
            retrieved.backgroundColor === updatedPreferences.backgroundColor &&
            retrieved.textColor === updatedPreferences.textColor &&
            retrieved.accentColor === updatedPreferences.accentColor &&
            Math.abs(retrieved.backgroundDarkness - updatedPreferences.backgroundDarkness) < 0.001
          );
        }
      ),
      {
        numRuns: 50,
      }
    );
  });

  test('Partial preferences merge with defaults correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate partial preference objects (1-3 fields)
        fc.oneof(
          fc.record({ backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s) }),
          fc.record({ textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s) }),
          fc.record({ accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s) }),
          fc.record({ backgroundDarkness: fc.double({ min: 0, max: 1, noNaN: true }) }),
          fc.record({
            backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
            textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
          }),
        ),
        async (partialPreferences) => {
          jest.clearAllMocks();

          // Save partial preferences
          browser.storage.local.set.mockResolvedValue(undefined);
          browser.runtime.sendMessage.mockResolvedValue(undefined);
          await window.setPreferences(partialPreferences);

          // Mock retrieval to return the partial preferences
          browser.storage.local.get.mockResolvedValue({ preferences: partialPreferences });
          const retrieved = await window.getPreferences();

          // Property: Retrieved preferences must have saved values for specified fields
          // and default values for unspecified fields
          const defaults = window.DEFAULT_PREFERENCES;
          
          return (
            retrieved.backgroundColor === (partialPreferences.backgroundColor || defaults.backgroundColor) &&
            retrieved.textColor === (partialPreferences.textColor || defaults.textColor) &&
            retrieved.accentColor === (partialPreferences.accentColor || defaults.accentColor) &&
            Math.abs(retrieved.backgroundDarkness - (partialPreferences.backgroundDarkness ?? defaults.backgroundDarkness)) < 0.001
          );
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  test('Default preferences are returned when no preferences are saved', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // No preferences saved
        async () => {
          jest.clearAllMocks();

          // Mock storage to return empty (no saved preferences)
          browser.storage.local.get.mockResolvedValue({});

          const retrieved = await window.getPreferences();
          const defaults = window.DEFAULT_PREFERENCES;

          // Property: Default preferences must be returned when nothing is saved
          return (
            retrieved.backgroundColor === defaults.backgroundColor &&
            retrieved.textColor === defaults.textColor &&
            retrieved.accentColor === defaults.accentColor &&
            retrieved.backgroundDarkness === defaults.backgroundDarkness
          );
        }
      ),
      {
        numRuns: 10, // Only need to test this a few times since it's deterministic
      }
    );
  });
});
