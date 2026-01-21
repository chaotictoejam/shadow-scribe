/**
 * Unit tests for storage utilities
 * Task 2.2: Write unit tests for storage utilities
 */

// Load the storage module
require('./storage.js');

describe('Storage utilities - getPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getPreferences with no saved data returns defaults', async () => {
    // Mock browser.storage.local.get to return empty object (no saved preferences)
    browser.storage.local.get.mockResolvedValue({});

    const preferences = await window.getPreferences();

    expect(browser.storage.local.get).toHaveBeenCalledWith('preferences');
    expect(preferences).toEqual({
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
      backgroundDarkness: 0.9,
    });
  });

  test('getPreferences merges saved data with defaults', async () => {
    // Mock browser.storage.local.get to return partial preferences
    const savedPreferences = {
      backgroundColor: '#000000',
      textColor: '#ffffff',
    };
    browser.storage.local.get.mockResolvedValue({ preferences: savedPreferences });

    const preferences = await window.getPreferences();

    expect(preferences).toEqual({
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#4a9eff', // from defaults
      backgroundDarkness: 0.9, // from defaults
    });
  });

  test('getPreferences returns complete saved preferences', async () => {
    // Mock browser.storage.local.get to return complete preferences
    const savedPreferences = {
      backgroundColor: '#2a2a2a',
      textColor: '#f0f0f0',
      accentColor: '#ff6b6b',
      backgroundDarkness: 0.8,
    };
    browser.storage.local.get.mockResolvedValue({ preferences: savedPreferences });

    const preferences = await window.getPreferences();

    expect(preferences).toEqual(savedPreferences);
  });
});

describe('Storage utilities - setPreferences and getPreferences round-trip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setPreferences saves data and getPreferences retrieves it', async () => {
    const testPreferences = {
      backgroundColor: '#1a1a1a',
      textColor: '#e5e5e5',
      accentColor: '#00aaff',
      backgroundDarkness: 0.95,
    };

    // Mock setPreferences
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.runtime.sendMessage.mockResolvedValue(undefined);

    await window.setPreferences(testPreferences);

    expect(browser.storage.local.set).toHaveBeenCalledWith({ preferences: testPreferences });
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'PREFERENCES_UPDATED',
      preferences: testPreferences,
    });

    // Mock getPreferences to return what was saved
    browser.storage.local.get.mockResolvedValue({ preferences: testPreferences });

    const retrieved = await window.getPreferences();

    expect(retrieved).toEqual(testPreferences);
  });

  test('setPreferences with partial data and getPreferences merges with defaults', async () => {
    const partialPreferences = {
      backgroundColor: '#333333',
    };

    browser.storage.local.set.mockResolvedValue(undefined);
    browser.runtime.sendMessage.mockResolvedValue(undefined);

    await window.setPreferences(partialPreferences);

    // Mock getPreferences to return what was saved
    browser.storage.local.get.mockResolvedValue({ preferences: partialPreferences });

    const retrieved = await window.getPreferences();

    expect(retrieved).toEqual({
      backgroundColor: '#333333',
      textColor: '#e0e0e0', // from defaults
      accentColor: '#4a9eff', // from defaults
      backgroundDarkness: 0.9, // from defaults
    });
  });
});

describe('Storage utilities - getDocumentThemeState with multiple document IDs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getDocumentThemeState with default ID returns default state when no data saved', async () => {
    browser.storage.local.get.mockResolvedValue({});

    const state = await window.getDocumentThemeState();

    expect(browser.storage.local.get).toHaveBeenCalledWith('theme_state_default');
    expect(state).toEqual({ enabled: false });
  });

  test('getDocumentThemeState with custom ID returns default state when no data saved', async () => {
    browser.storage.local.get.mockResolvedValue({});

    const state = await window.getDocumentThemeState('doc-123');

    expect(browser.storage.local.get).toHaveBeenCalledWith('theme_state_doc-123');
    expect(state).toEqual({ enabled: false });
  });

  test('getDocumentThemeState retrieves saved state for specific document', async () => {
    const savedState = { enabled: true };
    browser.storage.local.get.mockResolvedValue({ theme_state_doc_abc: savedState });

    const state = await window.getDocumentThemeState('doc_abc');

    expect(browser.storage.local.get).toHaveBeenCalledWith('theme_state_doc_abc');
    expect(state).toEqual(savedState);
  });

  test('getDocumentThemeState handles multiple different document IDs independently', async () => {
    // Document 1 - enabled
    browser.storage.local.get.mockResolvedValueOnce({ theme_state_doc1: { enabled: true } });
    const state1 = await window.getDocumentThemeState('doc1');
    expect(state1).toEqual({ enabled: true });

    // Document 2 - disabled
    browser.storage.local.get.mockResolvedValueOnce({ theme_state_doc2: { enabled: false } });
    const state2 = await window.getDocumentThemeState('doc2');
    expect(state2).toEqual({ enabled: false });

    // Document 3 - no saved state
    browser.storage.local.get.mockResolvedValueOnce({});
    const state3 = await window.getDocumentThemeState('doc3');
    expect(state3).toEqual({ enabled: false });

    // Verify each call used the correct key
    expect(browser.storage.local.get).toHaveBeenNthCalledWith(1, 'theme_state_doc1');
    expect(browser.storage.local.get).toHaveBeenNthCalledWith(2, 'theme_state_doc2');
    expect(browser.storage.local.get).toHaveBeenNthCalledWith(3, 'theme_state_doc3');
  });
});

describe('Storage utilities - setDocumentThemeState persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setDocumentThemeState saves state with default document ID', async () => {
    const state = { enabled: true };
    browser.storage.local.set.mockResolvedValue(undefined);

    await window.setDocumentThemeState('default', state);

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      theme_state_default: state,
    });
  });

  test('setDocumentThemeState saves state with custom document ID', async () => {
    const state = { enabled: false };
    browser.storage.local.set.mockResolvedValue(undefined);

    await window.setDocumentThemeState('my-doc-456', state);

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      'theme_state_my-doc-456': state,
    });
  });

  test('setDocumentThemeState and getDocumentThemeState round-trip', async () => {
    const documentId = 'test-doc-789';
    const state = { enabled: true };

    // Save state
    browser.storage.local.set.mockResolvedValue(undefined);
    await window.setDocumentThemeState(documentId, state);

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      [`theme_state_${documentId}`]: state,
    });

    // Retrieve state
    browser.storage.local.get.mockResolvedValue({
      [`theme_state_${documentId}`]: state,
    });
    const retrieved = await window.getDocumentThemeState(documentId);

    expect(retrieved).toEqual(state);
  });

  test('setDocumentThemeState can update existing state', async () => {
    const documentId = 'update-test';

    // First save - enabled
    browser.storage.local.set.mockResolvedValue(undefined);
    await window.setDocumentThemeState(documentId, { enabled: true });

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      'theme_state_update-test': { enabled: true },
    });

    // Update - disabled
    await window.setDocumentThemeState(documentId, { enabled: false });

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      'theme_state_update-test': { enabled: false },
    });

    expect(browser.storage.local.set).toHaveBeenCalledTimes(2);
  });
});

describe('Storage utilities - getGlobalState default value', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getGlobalState returns true by default when no data saved', async () => {
    browser.storage.local.get.mockResolvedValue({});

    const globalState = await window.getGlobalState();

    expect(browser.storage.local.get).toHaveBeenCalledWith('globalEnabled');
    expect(globalState).toBe(true);
  });

  test('getGlobalState returns saved value when data exists', async () => {
    browser.storage.local.get.mockResolvedValue({ globalEnabled: false });

    const globalState = await window.getGlobalState();

    expect(globalState).toBe(false);
  });

  test('getGlobalState returns true when explicitly saved as true', async () => {
    browser.storage.local.get.mockResolvedValue({ globalEnabled: true });

    const globalState = await window.getGlobalState();

    expect(globalState).toBe(true);
  });
});

describe('Storage utilities - setGlobalState persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setGlobalState saves enabled state', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.runtime.sendMessage.mockResolvedValue(undefined);

    await window.setGlobalState(true);

    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: true });
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'SET_GLOBAL_STATE',
      enabled: true,
    });
  });

  test('setGlobalState saves disabled state', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.runtime.sendMessage.mockResolvedValue(undefined);

    await window.setGlobalState(false);

    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: false });
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'SET_GLOBAL_STATE',
      enabled: false,
    });
  });

  test('setGlobalState and getGlobalState round-trip with true', async () => {
    // Save state
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.runtime.sendMessage.mockResolvedValue(undefined);
    await window.setGlobalState(true);

    // Retrieve state
    browser.storage.local.get.mockResolvedValue({ globalEnabled: true });
    const retrieved = await window.getGlobalState();

    expect(retrieved).toBe(true);
  });

  test('setGlobalState and getGlobalState round-trip with false', async () => {
    // Save state
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.runtime.sendMessage.mockResolvedValue(undefined);
    await window.setGlobalState(false);

    // Retrieve state
    browser.storage.local.get.mockResolvedValue({ globalEnabled: false });
    const retrieved = await window.getGlobalState();

    expect(retrieved).toBe(false);
  });

  test('setGlobalState can toggle state multiple times', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.runtime.sendMessage.mockResolvedValue(undefined);

    // Enable
    await window.setGlobalState(true);
    expect(browser.storage.local.set).toHaveBeenLastCalledWith({ globalEnabled: true });

    // Disable
    await window.setGlobalState(false);
    expect(browser.storage.local.set).toHaveBeenLastCalledWith({ globalEnabled: false });

    // Enable again
    await window.setGlobalState(true);
    expect(browser.storage.local.set).toHaveBeenLastCalledWith({ globalEnabled: true });

    expect(browser.storage.local.set).toHaveBeenCalledTimes(3);
    expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(3);
  });
});
