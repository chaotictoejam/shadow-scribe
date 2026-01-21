/**
 * Unit tests for messaging utilities
 * Task 3.2: Write unit tests for messaging utilities
 */

// Load the messaging module
require('./messaging.js');

describe('Messaging utilities - sendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sendMessage successfully sends message and returns response', async () => {
    const testMessage = { type: 'GET_GLOBAL_STATE' };
    const mockResponse = { globalEnabled: true };

    browser.runtime.sendMessage.mockResolvedValue(mockResponse);

    const response = await window.sendMessage(testMessage);

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(testMessage);
    expect(response).toEqual(mockResponse);
  });

  test('sendMessage handles disconnected port error gracefully', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };
    const disconnectError = new Error('Could not establish connection. Receiving end does not exist. The extension context is disconnected.');

    browser.runtime.sendMessage.mockRejectedValue(disconnectError);

    // Should return null instead of throwing
    const response = await window.sendMessage(testMessage);

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(testMessage);
    expect(response).toBeNull();
  });

  test('sendMessage handles disconnected context error gracefully', async () => {
    const testMessage = { type: 'SET_GLOBAL_STATE', enabled: false };
    const disconnectError = new Error('Extension context invalidated. The extension has been disconnected.');

    browser.runtime.sendMessage.mockRejectedValue(disconnectError);

    // Should return null instead of throwing
    const response = await window.sendMessage(testMessage);

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(testMessage);
    expect(response).toBeNull();
  });

  test('sendMessage re-throws non-disconnection errors', async () => {
    const testMessage = { type: 'GET_GLOBAL_STATE' };
    const otherError = new Error('Network error');

    browser.runtime.sendMessage.mockRejectedValue(otherError);

    // Should throw the error
    await expect(window.sendMessage(testMessage)).rejects.toThrow('Network error');
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(testMessage);
  });

  test('sendMessage works with different message types', async () => {
    const messages = [
      { type: 'GET_GLOBAL_STATE' },
      { type: 'SET_GLOBAL_STATE', enabled: true },
      { type: 'PREFERENCES_UPDATED', preferences: { backgroundColor: '#000000' } },
    ];

    for (const message of messages) {
      browser.runtime.sendMessage.mockResolvedValue({ success: true });
      const response = await window.sendMessage(message);
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith(message);
      expect(response).toEqual({ success: true });
      jest.clearAllMocks();
    }
  });
});

describe('Messaging utilities - broadcastToAllTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('broadcastToAllTabs sends message to all tabs', async () => {
    const testMessage = { type: 'GLOBAL_STATE_CHANGED', enabled: false };
    const mockTabs = [
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'https://drive.proton.me/docs/doc2' },
      { id: 3, url: 'https://drive.proton.me/docs/doc3' },
    ];

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(3);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, testMessage);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(2, testMessage);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(3, testMessage);
  });

  test('broadcastToAllTabs handles empty tab list', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };

    browser.tabs.query.mockResolvedValue([]);

    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
  });

  test('broadcastToAllTabs handles single tab', async () => {
    const testMessage = { type: 'GLOBAL_STATE_CHANGED', enabled: true };
    const mockTabs = [{ id: 42, url: 'https://drive.proton.me/docs/test' }];

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(42, testMessage);
  });

  test('broadcastToAllTabs ignores "Could not establish connection" errors', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };
    const mockTabs = [
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'about:blank' }, // This tab will fail
      { id: 3, url: 'https://drive.proton.me/docs/doc3' },
    ];

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage
      .mockResolvedValueOnce(undefined) // Tab 1 succeeds
      .mockRejectedValueOnce(new Error('Could not establish connection. Receiving end does not exist.')) // Tab 2 fails
      .mockResolvedValueOnce(undefined); // Tab 3 succeeds

    // Should not throw despite tab 2 failing
    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(3);
  });

  test('broadcastToAllTabs ignores "Receiving end does not exist" errors', async () => {
    const testMessage = { type: 'GLOBAL_STATE_CHANGED', enabled: false };
    const mockTabs = [
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'chrome://extensions/' }, // This tab will fail
    ];

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage
      .mockResolvedValueOnce(undefined) // Tab 1 succeeds
      .mockRejectedValueOnce(new Error('Receiving end does not exist')); // Tab 2 fails

    // Should not throw despite tab 2 failing
    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
  });

  test('broadcastToAllTabs logs warnings for unexpected errors', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };
    const mockTabs = [
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'https://drive.proton.me/docs/doc2' },
    ];

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage
      .mockResolvedValueOnce(undefined) // Tab 1 succeeds
      .mockRejectedValueOnce(new Error('Unexpected error')); // Tab 2 fails with unexpected error

    // Should not throw but should log warning
    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to send message to tab 2:',
      'Unexpected error'
    );

    consoleWarnSpy.mockRestore();
  });

  test('broadcastToAllTabs handles all tabs failing gracefully', async () => {
    const testMessage = { type: 'GLOBAL_STATE_CHANGED', enabled: true };
    const mockTabs = [
      { id: 1, url: 'about:blank' },
      { id: 2, url: 'chrome://extensions/' },
    ];

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage
      .mockRejectedValueOnce(new Error('Could not establish connection'))
      .mockRejectedValueOnce(new Error('Receiving end does not exist'));

    // Should not throw even if all tabs fail
    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
  });

  test('broadcastToAllTabs throws error if tabs.query fails', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };
    const queryError = new Error('Failed to query tabs');

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    browser.tabs.query.mockRejectedValue(queryError);

    // Should throw the error
    await expect(window.broadcastToAllTabs(testMessage)).rejects.toThrow('Failed to query tabs');
    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to broadcast message to tabs:',
      queryError
    );

    consoleErrorSpy.mockRestore();
  });

  test('broadcastToAllTabs works with many tabs', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: { backgroundColor: '#000000' } };
    const mockTabs = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      url: `https://drive.proton.me/docs/doc${i + 1}`,
    }));

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(10);

    // Verify each tab received the message
    for (let i = 1; i <= 10; i++) {
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(i, testMessage);
    }
  });
});

describe('Messaging utilities - MESSAGE_TYPES constants', () => {
  test('MESSAGE_TYPES contains all expected constants', () => {
    expect(window.MESSAGE_TYPES).toBeDefined();
    expect(window.MESSAGE_TYPES.GET_GLOBAL_STATE).toBe('GET_GLOBAL_STATE');
    expect(window.MESSAGE_TYPES.SET_GLOBAL_STATE).toBe('SET_GLOBAL_STATE');
    expect(window.MESSAGE_TYPES.PREFERENCES_UPDATED).toBe('PREFERENCES_UPDATED');
    expect(window.MESSAGE_TYPES.GLOBAL_STATE_CHANGED).toBe('GLOBAL_STATE_CHANGED');
  });

  test('MESSAGE_TYPES values are strings', () => {
    const types = Object.values(window.MESSAGE_TYPES);
    types.forEach((type) => {
      expect(typeof type).toBe('string');
    });
  });

  test('MESSAGE_TYPES has no duplicate values', () => {
    const types = Object.values(window.MESSAGE_TYPES);
    const uniqueTypes = new Set(types);
    expect(uniqueTypes.size).toBe(types.length);
  });
});

describe('Messaging utilities - error handling edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sendMessage handles error with no message property', async () => {
    const testMessage = { type: 'GET_GLOBAL_STATE' };
    const errorWithoutMessage = new Error();
    delete errorWithoutMessage.message;

    browser.runtime.sendMessage.mockRejectedValue(errorWithoutMessage);

    // Should throw since it's not a disconnection error
    await expect(window.sendMessage(testMessage)).rejects.toThrow();
  });

  test('broadcastToAllTabs handles mixed success and failure', async () => {
    const testMessage = { type: 'PREFERENCES_UPDATED', preferences: {} };
    const mockTabs = [
      { id: 1, url: 'https://drive.proton.me/docs/doc1' },
      { id: 2, url: 'https://drive.proton.me/docs/doc2' },
      { id: 3, url: 'about:blank' },
      { id: 4, url: 'https://drive.proton.me/docs/doc4' },
      { id: 5, url: 'chrome://extensions/' },
    ];

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage
      .mockResolvedValueOnce(undefined) // Tab 1 succeeds
      .mockResolvedValueOnce(undefined) // Tab 2 succeeds
      .mockRejectedValueOnce(new Error('Could not establish connection')) // Tab 3 fails (ignored)
      .mockResolvedValueOnce(undefined) // Tab 4 succeeds
      .mockRejectedValueOnce(new Error('Receiving end does not exist')); // Tab 5 fails (ignored)

    await window.broadcastToAllTabs(testMessage);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(5);
  });

  test('sendMessage with undefined message', async () => {
    browser.runtime.sendMessage.mockResolvedValue({ success: true });

    const response = await window.sendMessage(undefined);

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(undefined);
    expect(response).toEqual({ success: true });
  });

  test('broadcastToAllTabs with undefined message', async () => {
    const mockTabs = [{ id: 1, url: 'https://drive.proton.me/docs/doc1' }];

    browser.tabs.query.mockResolvedValue(mockTabs);
    browser.tabs.sendMessage.mockResolvedValue(undefined);

    await window.broadcastToAllTabs(undefined);

    expect(browser.tabs.query).toHaveBeenCalledWith({});
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, undefined);
  });
});
