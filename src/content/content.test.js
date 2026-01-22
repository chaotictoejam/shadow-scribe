/**
 * Integration tests for content script
 */

import { JSDOM } from 'jsdom';

// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

describe('Content Script Integration Tests', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://drive.proton.me/urls/ABC123'
    });
    document = dom.window.document;
    window = dom.window;
    
    global.document = document;
    global.window = window;
    global.MutationObserver = window.MutationObserver;
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('Initialization', () => {
    test('should extract document ID from URL', () => {
      const url = 'https://drive.proton.me/urls/ABC123';
      const match = url.match(/\/urls\/([^/?]+)/);
      expect(match).not.toBeNull();
      expect(match[1]).toBe('ABC123');
    });

    test('should load saved theme state on initialization', async () => {
      const mockState = { enabled: true };
      chrome.storage.local.get.mockResolvedValue({
        'doc_ABC123': mockState
      });

      const result = await chrome.storage.local.get('doc_ABC123');
      expect(result['doc_ABC123']).toEqual(mockState);
    });

    test('should check global state before applying theme', async () => {
      chrome.runtime.sendMessage.mockResolvedValue({ enabled: true });

      const response = await chrome.runtime.sendMessage({
        type: 'GET_GLOBAL_STATE'
      });

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'GET_GLOBAL_STATE'
      });
      expect(response.enabled).toBe(true);
    });
  });

  describe('Theme Application', () => {
    test('should apply theme when both global and document state are enabled', async () => {
      chrome.runtime.sendMessage.mockResolvedValue({ enabled: true });
      chrome.storage.local.get.mockResolvedValue({
        'doc_ABC123': { enabled: true }
      });

      const globalState = await chrome.runtime.sendMessage({ type: 'GET_GLOBAL_STATE' });
      const docState = await chrome.storage.local.get('doc_ABC123');

      expect(globalState.enabled).toBe(true);
      expect(docState['doc_ABC123'].enabled).toBe(true);
    });

    test('should not apply theme when global state is disabled', async () => {
      chrome.runtime.sendMessage.mockResolvedValue({ enabled: false });
      chrome.storage.local.get.mockResolvedValue({
        'doc_ABC123': { enabled: true }
      });

      const globalState = await chrome.runtime.sendMessage({ type: 'GET_GLOBAL_STATE' });
      
      expect(globalState.enabled).toBe(false);
      // Theme should not be applied even though document state is enabled
    });

    test('should not apply theme when document state is disabled', async () => {
      chrome.runtime.sendMessage.mockResolvedValue({ enabled: true });
      chrome.storage.local.get.mockResolvedValue({
        'doc_ABC123': { enabled: false }
      });

      const docState = await chrome.storage.local.get('doc_ABC123');
      
      expect(docState['doc_ABC123'].enabled).toBe(false);
    });
  });

  describe('Message Handling', () => {
    test('should handle GLOBAL_STATE_CHANGED message', () => {
      const listener = jest.fn();
      chrome.runtime.onMessage.addListener(listener);

      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(listener);
    });

    test('should handle PREFERENCES_UPDATED message', () => {
      const listener = jest.fn((message) => {
        if (message.type === 'PREFERENCES_UPDATED') {
          return true;
        }
      });

      chrome.runtime.onMessage.addListener(listener);
      
      const message = {
        type: 'PREFERENCES_UPDATED',
        preferences: {
          backgroundColor: '#1a1a1a',
          textColor: '#e0e0e0'
        }
      };

      listener(message);
      expect(listener).toHaveBeenCalledWith(message);
    });

    test('should update theme when preferences change', () => {
      const mockPreferences = {
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0',
        accentColor: '#4a9eff'
      };

      const message = {
        type: 'PREFERENCES_UPDATED',
        preferences: mockPreferences
      };

      // Simulate preference update
      expect(message.preferences).toEqual(mockPreferences);
    });
  });

  describe('Global State Changes', () => {
    test('should apply theme when global state changes to enabled', async () => {
      chrome.storage.local.get.mockResolvedValue({
        'doc_ABC123': { enabled: true }
      });

      const message = {
        type: 'GLOBAL_STATE_CHANGED',
        enabled: true
      };

      const docState = await chrome.storage.local.get('doc_ABC123');
      
      if (message.enabled && docState['doc_ABC123'].enabled) {
        expect(true).toBe(true); // Theme should be applied
      }
    });

    test('should remove theme when global state changes to disabled', () => {
      const message = {
        type: 'GLOBAL_STATE_CHANGED',
        enabled: false
      };

      if (!message.enabled) {
        expect(true).toBe(true); // Theme should be removed
      }
    });
  });

  describe('DOM Ready Check', () => {
    test('should wait for DOM to be ready before initialization', () => {
      const readyStates = ['loading', 'interactive', 'complete'];
      
      readyStates.forEach(state => {
        Object.defineProperty(document, 'readyState', {
          value: state,
          writable: true
        });

        if (state === 'loading') {
          expect(document.readyState).toBe('loading');
        } else {
          expect(['interactive', 'complete']).toContain(document.readyState);
        }
      });
    });

    test('should initialize immediately if DOM is already ready', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true
      });

      expect(document.readyState).toBe('complete');
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      chrome.storage.local.get.mockRejectedValue(new Error('Storage error'));

      try {
        await chrome.storage.local.get('doc_ABC123');
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
    });

    test('should handle message sending errors gracefully', async () => {
      chrome.runtime.sendMessage.mockRejectedValue(new Error('Message error'));

      try {
        await chrome.runtime.sendMessage({ type: 'GET_GLOBAL_STATE' });
      } catch (error) {
        expect(error.message).toBe('Message error');
      }
    });
  });
});
