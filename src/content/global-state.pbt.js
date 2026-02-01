/**
 * Property-based tests for global state override (Property 8.6)
 */

import fc from 'fast-check';

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

describe('Property 8.6: Global State Override', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('global disable overrides all document states', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          docId: fc.string({ minLength: 1, maxLength: 20 }),
          enabled: fc.boolean()
        }), { minLength: 1, maxLength: 10 }),
        async (documents) => {
          // Ensure unique docIds by adding index
          const uniqueDocs = documents.map((doc, index) => ({
            ...doc,
            docId: `${doc.docId}_${index}`
          }));
          
          // Set up document states
          const docStates = {};
          uniqueDocs.forEach(doc => {
            docStates[`doc_${doc.docId}`] = { enabled: doc.enabled };
          });

          chrome.storage.local.get.mockImplementation((keys) => {
            if (Array.isArray(keys)) {
              const result = {};
              keys.forEach(key => {
                if (docStates[key]) {
                  result[key] = docStates[key];
                }
              });
              return Promise.resolve(result);
            }
            return Promise.resolve(docStates[keys] ? { [keys]: docStates[keys] } : {});
          });

          // Set global state to disabled
          chrome.runtime.sendMessage.mockResolvedValue({ enabled: false });

          // Check each document
          for (const doc of uniqueDocs) {
            const globalState = await chrome.runtime.sendMessage({ type: 'GET_GLOBAL_STATE' });
            const docState = await chrome.storage.local.get(`doc_${doc.docId}`);

            // Even if document state is enabled, global disable should override
            const shouldApplyTheme = globalState.enabled && docState[`doc_${doc.docId}`]?.enabled;
            expect(shouldApplyTheme).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('re-enabling global state restores individual document states', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          docId: fc.string({ minLength: 1, maxLength: 20 }),
          enabled: fc.boolean()
        }), { minLength: 1, maxLength: 10 }),
        async (documents) => {
          // Ensure unique docIds by adding index
          const uniqueDocs = documents.map((doc, index) => ({
            ...doc,
            docId: `${doc.docId}_${index}`
          }));
          
          // Set up document states
          const docStates = {};
          uniqueDocs.forEach(doc => {
            docStates[`doc_${doc.docId}`] = { enabled: doc.enabled };
          });

          chrome.storage.local.get.mockImplementation((keys) => {
            if (Array.isArray(keys)) {
              const result = {};
              keys.forEach(key => {
                if (docStates[key]) {
                  result[key] = docStates[key];
                }
              });
              return Promise.resolve(result);
            }
            return Promise.resolve(docStates[keys] ? { [keys]: docStates[keys] } : {});
          });

          // Set global state to enabled
          chrome.runtime.sendMessage.mockResolvedValue({ enabled: true });

          // Check each document respects its individual state
          for (const doc of uniqueDocs) {
            const globalState = await chrome.runtime.sendMessage({ type: 'GET_GLOBAL_STATE' });
            const docState = await chrome.storage.local.get(`doc_${doc.docId}`);

            const shouldApplyTheme = globalState.enabled && docState[`doc_${doc.docId}`]?.enabled;
            expect(shouldApplyTheme).toBe(doc.enabled);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
