/**
 * Unit tests for background service worker
 * Task 4.2: Write unit tests for background script
 */

describe('Background Service Worker - getGlobalState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getGlobalState returns default value true when no data saved', async () => {
    browser.storage.local.get.mockResolvedValue({});

    // Import and test the function
    const { getGlobalState } = require('./background.js');
    const result = await getGlobalState();

    expect(browser.storage.local.get).toHaveBeenCalledWith('globalEnabled');
    expect(result).toEqual({ globalEnabled: true });
  });

  test('getGlobalState returns saved value when data exists', async () => {
    browser.storage.local.get.mockResolvedValue({ globalEnabled: false });

    const { getGlobalState } = require('./background.js');
    const result = await getGlobalState();

    expect(browser.storage.local.get).toHaveBeenCalledWith('globalEnabled');
    expect(result).toEqual({ globalEnabled: false });
  });

  test('getGlobalState returns true when explicitly saved as true', async () => {
    browser.storage.local.get.mockResolvedValue({ globalEnabled: true });

    const { getGlobalState } = require('./background.js');
    const result = await getGlobalState();

    expect(result).toEqual({ globalEnabled: true });
  });
});

describe('Background Service Worker - setGlobalState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setGlobalState saves enabled state and broadcasts to tabs', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.tabs.query.mockResolvedValue([
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'https://drive.proton.me/docs/doc2' },
    ]);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    const { setGlobalState } = require('./background.js');
    await setGlobalState(true);

    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: true });
    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, {
      type: 'GLOBAL_STATE_CHANGED',
      enabled: true,
    });
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(2, {
      type: 'GLOBAL_STATE_CHANGED',
      enabled: true,
    });
  });

  test('setGlobalState saves disabled state and broadcasts to tabs', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.tabs.query.mockResolvedValue([
      { id: 5, url: 'https://drive.proton.me/docs/test' },
    ]);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    const { setGlobalState } = require('./background.js');
    await setGlobalState(false);

    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: false });
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(5, {
      type: 'GLOBAL_STATE_CHANGED',
      enabled: false,
    });
  });

  test('setGlobalState handles empty tab list', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.tabs.query.mockResolvedValue([]);

    const { setGlobalState } = require('./background.js');
    await setGlobalState(true);

    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: true });
    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
  });

  test('setGlobalState ignores tabs that fail to receive message', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.tabs.query.mockResolvedValue([
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'about:blank' },
      { id: 3, url: 'https://drive.proton.me/docs/doc3' },
    ]);
    browser.tabs.sendMessage
      .mockResolvedValueOnce(undefined) // Tab 1 succeeds
      .mockRejectedValueOnce(new Error('Could not establish connection')) // Tab 2 fails
      .mockResolvedValueOnce(undefined); // Tab 3 succeeds

    const { setGlobalState } = require('./background.js');
    await setGlobalState(false);

    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: false });
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(3);
  });
});

describe('Background Service Worker - broadcastToAllTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('broadcastToAllTabs sends message to all tabs', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: { backgroundColor: '#000000' } };
    browser.tabs.query.mockResolvedValue([
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'https://drive.proton.me/docs/doc2' },
      { id: 3, url: 'https://drive.proton.me/docs/doc3' },
    ]);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    const { broadcastToAllTabs } = require('./background.js');
    await broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(3);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, testMessage);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(2, testMessage);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(3, testMessage);
  });

  test('broadcastToAllTabs handles empty tab list', async () => {
    const testMessage = { type: 'GLOBAL_STATE_CHANGED', enabled: true };
    browser.tabs.query.mockResolvedValue([]);

    const { broadcastToAllTabs } = require('./background.js');
    await broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
  });

  test('broadcastToAllTabs ignores connection errors', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };
    browser.tabs.query.mockResolvedValue([
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'about:blank' },
    ]);
    browser.tabs.sendMessage
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Could not establish connection. Receiving end does not exist.'));

    const { broadcastToAllTabs } = require('./background.js');
    await broadcastToAllTabs(testMessage);

    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
  });

  test('broadcastToAllTabs throws error if tabs.query fails', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };
    const queryError = new Error('Failed to query tabs');
    browser.tabs.query.mockRejectedValue(queryError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { broadcastToAllTabs } = require('./background.js');
    await expect(broadcastToAllTabs(testMessage)).rejects.toThrow('Failed to query tabs');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to broadcast message to tabs:',
      queryError
    );

    consoleErrorSpy.mockRestore();
  });
});

describe('Background Service Worker - Message Handling', () => {
  let messageListener;

  beforeEach(() => {
    jest.clearAllMocks();
    // Capture the message listener when the background script is loaded
    browser.runtime.onMessage.addListener.mockImplementation((listener) => {
      messageListener = listener;
    });
    // Re-require the background script to register the listener
    jest.resetModules();
    require('./background.js');
  });

  test('GET_GLOBAL_STATE message returns global state', async () => {
    browser.storage.local.get.mockResolvedValue({ globalEnabled: true });

    const message = { type: 'GET_GLOBAL_STATE' };
    const sender = {};
    const sendResponse = jest.fn();

    const result = messageListener(message, sender, sendResponse);

    expect(result).toBe(true); // Indicates async response

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(browser.storage.local.get).toHaveBeenCalledWith('globalEnabled');
    expect(sendResponse).toHaveBeenCalledWith({ globalEnabled: true });
  });

  test('GET_GLOBAL_STATE message returns default when no data saved', async () => {
    browser.storage.local.get.mockResolvedValue({});

    const message = { type: 'GET_GLOBAL_STATE' };
    const sender = {};
    const sendResponse = jest.fn();

    const result = messageListener(message, sender, sendResponse);

    expect(result).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sendResponse).toHaveBeenCalledWith({ globalEnabled: true });
  });

  test('SET_GLOBAL_STATE message updates state and broadcasts', async () => {
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.tabs.query.mockResolvedValue([
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
    ]);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    const message = { type: 'SET_GLOBAL_STATE', enabled: false };
    const sender = {};
    const sendResponse = jest.fn();

    const result = messageListener(message, sender, sendResponse);

    expect(result).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: false });
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, {
      type: 'GLOBAL_STATE_CHANGED',
      enabled: false,
    });
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });

  test('SET_GLOBAL_STATE message handles errors', async () => {
    const error = new Error('Storage error');
    browser.storage.local.set.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const message = { type: 'SET_GLOBAL_STATE', enabled: true };
    const sender = {};
    const sendResponse = jest.fn();

    const result = messageListener(message, sender, sendResponse);

    expect(result).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting global state:', error);
    expect(sendResponse).toHaveBeenCalledWith({ success: false, error: 'Storage error' });

    consoleErrorSpy.mockRestore();
  });

  test('PREFERENCES_UPDATED message broadcasts to all tabs', async () => {
    browser.tabs.query.mockResolvedValue([
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'https://drive.proton.me/docs/doc2' },
    ]);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    const preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
      backgroundDarkness: 0.9,
    };

    const message = { type: 'PREFERENCES_UPDATED', preferences };
    const sender = {};
    const sendResponse = jest.fn();

    const result = messageListener(message, sender, sendResponse);

    expect(result).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, {
      type: 'PREFERENCES_UPDATED',
      preferences,
    });
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(2, {
      type: 'PREFERENCES_UPDATED',
      preferences,
    });
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });

  test('PREFERENCES_UPDATED message handles broadcast errors', async () => {
    const error = new Error('Broadcast failed');
    browser.tabs.query.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const message = { type: 'PREFERENCES_UPDATED', preferences: {} };
    const sender = {};
    const sendResponse = jest.fn();

    const result = messageListener(message, sender, sendResponse);

    expect(result).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error broadcasting preferences:', error);
    expect(sendResponse).toHaveBeenCalledWith({ success: false, error: 'Broadcast failed' });

    consoleErrorSpy.mockRestore();
  });

  test('Unknown message type logs warning and returns false', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const message = { type: 'UNKNOWN_MESSAGE_TYPE' };
    const sender = {};
    const sendResponse = jest.fn();

    const result = messageListener(message, sender, sendResponse);

    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown message type:', 'UNKNOWN_MESSAGE_TYPE');
    expect(sendResponse).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  test('Message listener handles multiple message types correctly', async () => {
    // Test GET_GLOBAL_STATE
    browser.storage.local.get.mockResolvedValue({ globalEnabled: true });
    let sendResponse = jest.fn();
    messageListener({ type: 'GET_GLOBAL_STATE' }, {}, sendResponse);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(sendResponse).toHaveBeenCalledWith({ globalEnabled: true });

    // Test SET_GLOBAL_STATE
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.tabs.query.mockResolvedValue([]);
    sendResponse = jest.fn();
    messageListener({ type: 'SET_GLOBAL_STATE', enabled: false }, {}, sendResponse);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(sendResponse).toHaveBeenCalledWith({ success: true });

    // Test PREFERENCES_UPDATED
    browser.tabs.query.mockResolvedValue([]);
    sendResponse = jest.fn();
    messageListener({ type: 'PREFERENCES_UPDATED', preferences: {} }, {}, sendResponse);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });
});

describe('Background Service Worker - Initialization', () => {
  let installListener;

  beforeEach(() => {
    jest.clearAllMocks();
    // Capture the install listener
    browser.runtime.onInstalled = {
      addListener: jest.fn((listener) => {
        installListener = listener;
      }),
    };
    // Re-require the background script to register the listener
    jest.resetModules();
    require('./background.js');
  });

  test('onInstalled sets default global state on first install', async () => {
    browser.storage.local.get.mockResolvedValue({});
    browser.storage.local.set.mockResolvedValue(undefined);

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await installListener({ reason: 'install' });

    expect(browser.storage.local.get).toHaveBeenCalledWith('globalEnabled');
    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: true });
    expect(consoleLogSpy).toHaveBeenCalledWith('Shadow Scribe: Initialized with default settings');

    consoleLogSpy.mockRestore();
  });

  test('onInstalled does not override existing global state on install', async () => {
    browser.storage.local.get.mockResolvedValue({ globalEnabled: false });

    await installListener({ reason: 'install' });

    expect(browser.storage.local.get).toHaveBeenCalledWith('globalEnabled');
    expect(browser.storage.local.set).not.toHaveBeenCalled();
  });

  test('onInstalled logs message on extension update', async () => {
    browser.runtime.getManifest = jest.fn().mockReturnValue({ version: '1.0.1' });

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await installListener({ reason: 'update' });

    expect(browser.storage.local.get).not.toHaveBeenCalled();
    expect(browser.storage.local.set).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('Shadow Scribe: Extension updated to version', '1.0.1');

    consoleLogSpy.mockRestore();
  });

  test('onInstalled handles other reasons without action', async () => {
    await installListener({ reason: 'browser_update' });

    expect(browser.storage.local.get).not.toHaveBeenCalled();
    expect(browser.storage.local.set).not.toHaveBeenCalled();
  });

  test('onInstalled handles install with globalEnabled explicitly set to true', async () => {
    browser.storage.local.get.mockResolvedValue({ globalEnabled: true });

    await installListener({ reason: 'install' });

    expect(browser.storage.local.get).toHaveBeenCalledWith('globalEnabled');
    expect(browser.storage.local.set).not.toHaveBeenCalled();
  });
});

describe('Background Service Worker - Integration Tests', () => {
  let messageListener;
  let installListener;

  beforeEach(() => {
    jest.clearAllMocks();
    browser.runtime.onMessage.addListener.mockImplementation((listener) => {
      messageListener = listener;
    });
    browser.runtime.onInstalled = {
      addListener: jest.fn((listener) => {
        installListener = listener;
      }),
    };
    jest.resetModules();
    require('./background.js');
  });

  test('Complete flow: install, get state, set state, broadcast preferences', async () => {
    // 1. Install extension
    browser.storage.local.get.mockResolvedValue({});
    browser.storage.local.set.mockResolvedValue(undefined);
    await installListener({ reason: 'install' });
    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: true });

    // 2. Get global state
    browser.storage.local.get.mockResolvedValue({ globalEnabled: true });
    let sendResponse = jest.fn();
    messageListener({ type: 'GET_GLOBAL_STATE' }, {}, sendResponse);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(sendResponse).toHaveBeenCalledWith({ globalEnabled: true });

    // 3. Set global state to false
    jest.clearAllMocks(); // Clear previous calls
    browser.storage.local.set.mockResolvedValue(undefined);
    browser.tabs.query.mockResolvedValue([{ id: 1 }]);
    browser.tabs.sendMessage.mockResolvedValue(undefined);
    sendResponse = jest.fn();
    messageListener({ type: 'SET_GLOBAL_STATE', enabled: false }, {}, sendResponse);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(browser.storage.local.set).toHaveBeenCalledWith({ globalEnabled: false });
    expect(sendResponse).toHaveBeenCalledWith({ success: true });

    // 4. Broadcast preferences
    jest.clearAllMocks(); // Clear previous calls
    browser.tabs.query.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    browser.tabs.sendMessage.mockResolvedValue(undefined);
    sendResponse = jest.fn();
    const preferences = { backgroundColor: '#000000' };
    messageListener({ type: 'PREFERENCES_UPDATED', preferences }, {}, sendResponse);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });

  test('Background script initializes and logs startup message', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    jest.resetModules();
    require('./background.js');

    expect(consoleLogSpy).toHaveBeenCalledWith('Shadow Scribe: Background service worker initialized');

    consoleLogSpy.mockRestore();
  });
});
