/**
 * Property-based tests for ToggleButton
 * Task 6.3: Write property-based test for toggle consistency (Property 8.5)
 */

const fc = require('fast-check');
const ToggleButton = require('./toggle-button.js');

// Mock ThemeManager
class MockThemeManager {
  constructor() {
    this.applyDarkMode = jest.fn().mockResolvedValue(undefined);
    this.removeDarkMode = jest.fn();
  }
}

// Mock DOM APIs
document.body.appendChild = jest.fn();
document.createElement = jest.fn((_tag) => ({
  id: '',
  className: '',
  innerHTML: '',
  setAttribute: jest.fn(),
  addEventListener: jest.fn(),
  remove: jest.fn(),
}));

// Mock window functions
window.getDocumentThemeState = jest.fn();
window.setDocumentThemeState = jest.fn();
window.getPreferences = jest.fn();
delete window.location;
window.location = { pathname: '/docs/test-doc-123' };

describe('Property 8.5: Toggle State Consistency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.getDocumentThemeState.mockReset();
    window.setDocumentThemeState.mockReset();
    window.getPreferences.mockReset();
  });

  /**
   * **Validates: Requirements 3.2.2, 3.2.3**
   * 
   * Toggling dark mode an even number of times should return to the original state.
   * Toggling an odd number of times should result in the opposite state.
   */
  test('Even number of toggles returns to original state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 10 }), // number of toggle pairs (0-10 pairs = 0-20 toggles)
        fc.boolean(), // initial state
        async (togglePairs, initialState) => {
          const themeManager = new MockThemeManager();
          const toggleButton = new ToggleButton(themeManager);
          toggleButton.create();

          // Set up initial state
          let currentState = initialState;
          window.getPreferences.mockResolvedValue({
            backgroundColor: '#1e1e1e',
            textColor: '#e0e0e0',
            accentColor: '#4a9eff',
          });

          // Perform even number of toggles (togglePairs * 2)
          for (let i = 0; i < togglePairs * 2; i++) {
            window.getDocumentThemeState.mockResolvedValue({ enabled: currentState });
            window.setDocumentThemeState.mockResolvedValue(undefined);
            
            await toggleButton.handleToggle();
            
            // Update current state
            currentState = !currentState;
          }

          // Property: After even number of toggles, state should match initial state
          return currentState === initialState;
        }
      ),
      {
        numRuns: 50,
      }
    );
  });

  test('Odd number of toggles results in opposite state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 10 }), // number of toggle pairs
        fc.boolean(), // initial state
        async (togglePairs, initialState) => {
          const themeManager = new MockThemeManager();
          const toggleButton = new ToggleButton(themeManager);
          toggleButton.create();

          // Set up initial state
          let currentState = initialState;
          window.getPreferences.mockResolvedValue({
            backgroundColor: '#1e1e1e',
            textColor: '#e0e0e0',
            accentColor: '#4a9eff',
          });

          // Perform odd number of toggles (togglePairs * 2 + 1)
          const numToggles = togglePairs * 2 + 1;
          for (let i = 0; i < numToggles; i++) {
            window.getDocumentThemeState.mockResolvedValue({ enabled: currentState });
            window.setDocumentThemeState.mockResolvedValue(undefined);
            
            await toggleButton.handleToggle();
            
            // Update current state
            currentState = !currentState;
          }

          // Property: After odd number of toggles, state should be opposite of initial
          return currentState === !initialState;
        }
      ),
      {
        numRuns: 50,
      }
    );
  });

  test('Toggle consistency holds regardless of initial state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // initial state
        fc.integer({ min: 1, max: 20 }), // number of toggles
        async (initialState, numToggles) => {
          const themeManager = new MockThemeManager();
          const toggleButton = new ToggleButton(themeManager);
          toggleButton.create();

          let currentState = initialState;
          window.getPreferences.mockResolvedValue({});

          // Perform toggles
          for (let i = 0; i < numToggles; i++) {
            window.getDocumentThemeState.mockResolvedValue({ enabled: currentState });
            window.setDocumentThemeState.mockResolvedValue(undefined);
            
            await toggleButton.handleToggle();
            currentState = !currentState;
          }

          // Property: Final state depends on parity of toggles
          const expectedState = numToggles % 2 === 0 ? initialState : !initialState;
          return currentState === expectedState;
        }
      ),
      {
        numRuns: 50,
      }
    );
  });

  test('Button icon reflects state correctly after multiple toggles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // number of toggles
        async (numToggles) => {
          const themeManager = new MockThemeManager();
          const toggleButton = new ToggleButton(themeManager);
          toggleButton.create();

          let currentState = false; // Start with light mode
          window.getPreferences.mockResolvedValue({});

          // Perform toggles and check icon after each
          for (let i = 0; i < numToggles; i++) {
            window.getDocumentThemeState.mockResolvedValue({ enabled: currentState });
            window.setDocumentThemeState.mockResolvedValue(undefined);
            
            await toggleButton.handleToggle();
            currentState = !currentState;

            // Property: Icon should match current state
            const expectedIcon = currentState ? '☀️' : '🌙';
            if (toggleButton.button.innerHTML !== expectedIcon) {
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 30,
      }
    );
  });

  test('Theme manager methods called correctly during toggle sequence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // number of complete cycles (on->off)
        async (cycles) => {
          const themeManager = new MockThemeManager();
          const toggleButton = new ToggleButton(themeManager);
          toggleButton.create();

          window.getPreferences.mockResolvedValue({});

          // Perform complete cycles
          for (let i = 0; i < cycles; i++) {
            // Toggle on
            window.getDocumentThemeState.mockResolvedValue({ enabled: false });
            window.setDocumentThemeState.mockResolvedValue(undefined);
            await toggleButton.handleToggle();

            // Toggle off
            window.getDocumentThemeState.mockResolvedValue({ enabled: true });
            window.setDocumentThemeState.mockResolvedValue(undefined);
            await toggleButton.handleToggle();
          }

          // Property: applyDarkMode and removeDarkMode should be called equal times
          return (
            themeManager.applyDarkMode.mock.calls.length === cycles &&
            themeManager.removeDarkMode.mock.calls.length === cycles
          );
        }
      ),
      {
        numRuns: 30,
      }
    );
  });
});
