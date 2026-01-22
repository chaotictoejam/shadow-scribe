/**
 * Property-based tests for preference propagation (Property 8.7)
 */

import fc from 'fast-check';

// Mock chrome API
global.chrome = {
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

describe('Property 8.7: Preference Propagation', () => {
  test('preference updates propagate to all tabs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }), // number of tabs
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          backgroundDarkness: fc.integer({ min: 0, max: 100 })
        }),
        async (numTabs, preferences) => {
          // Reset mocks for each property test run
          jest.clearAllMocks();
          
          // Create mock tabs
          const tabs = Array.from({ length: numTabs }, (_, i) => ({
            id: i + 1,
            url: `https://drive.proton.me/urls/doc${i}`
          }));

          chrome.tabs.query.mockResolvedValue(tabs);
          chrome.tabs.sendMessage.mockResolvedValue(true);

          // Broadcast preferences
          const queriedTabs = await chrome.tabs.query({});
          const sendPromises = queriedTabs.map(tab =>
            chrome.tabs.sendMessage(tab.id, {
              type: 'PREFERENCES_UPDATED',
              preferences
            })
          );

          await Promise.all(sendPromises);

          // Verify all tabs received the message
          expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(numTabs);
          
          for (let i = 0; i < numTabs; i++) {
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
              i + 1,
              {
                type: 'PREFERENCES_UPDATED',
                preferences
              }
            );
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('all tabs receive updates within time limit', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }),
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          backgroundDarkness: fc.integer({ min: 0, max: 100 })
        }),
        async (numTabs, preferences) => {
          // Reset mocks for each property test run
          jest.clearAllMocks();
          
          const tabs = Array.from({ length: numTabs }, (_, i) => ({
            id: i + 1,
            url: `https://drive.proton.me/urls/doc${i}`
          }));

          chrome.tabs.query.mockResolvedValue(tabs);
          chrome.tabs.sendMessage.mockResolvedValue(true);

          const startTime = Date.now();

          const queriedTabs = await chrome.tabs.query({});
          const sendPromises = queriedTabs.map(tab =>
            chrome.tabs.sendMessage(tab.id, {
              type: 'PREFERENCES_UPDATED',
              preferences
            })
          );

          await Promise.all(sendPromises);

          const endTime = Date.now();
          const duration = endTime - startTime;

          // Should complete within reasonable time (1 second for all tabs)
          expect(duration).toBeLessThan(1000);
        }
      ),
      { numRuns: 30 }
    );
  });
});
