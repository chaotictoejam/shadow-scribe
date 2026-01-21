/**
 * Unit tests for ThemeManager
 * Task 5.2: Write unit tests for ThemeManager
 */

const ThemeManager = require('./theme-manager.js');

// Mock DOM APIs
const mockSetProperty = jest.fn();
const mockRemoveProperty = jest.fn();
const mockClassListAdd = jest.fn();
const mockClassListRemove = jest.fn();

Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    style: {
      setProperty: mockSetProperty,
      removeProperty: mockRemoveProperty,
    },
  },
});

Object.defineProperty(document, 'body', {
  writable: true,
  value: {
    classList: {
      add: mockClassListAdd,
      remove: mockClassListRemove,
    },
  },
});

global.MutationObserver = jest.fn(function (callback) {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
  this.callback = callback;
});

describe('ThemeManager - Constructor', () => {
  test('constructor initializes with correct default values', () => {
    const themeManager = new ThemeManager();

    expect(themeManager.isDarkMode).toBe(false);
    expect(themeManager.preferences).toEqual({});
    expect(themeManager.observer).toBeNull();
  });
});

describe('ThemeManager - applyDarkMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('applyDarkMode sets preferences and isDarkMode flag', async () => {
    const themeManager = new ThemeManager();
    const preferences = {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ff0000',
      backgroundDarkness: 0.8,
    };

    await themeManager.applyDarkMode(preferences);

    expect(themeManager.preferences).toEqual(preferences);
    expect(themeManager.isDarkMode).toBe(true);
  });

  test('applyDarkMode calls injectStyles', async () => {
    const themeManager = new ThemeManager();
    const injectStylesSpy = jest.spyOn(themeManager, 'injectStyles');
    const preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };

    await themeManager.applyDarkMode(preferences);

    expect(injectStylesSpy).toHaveBeenCalled();
  });

  test('applyDarkMode calls observeDOMChanges', async () => {
    const themeManager = new ThemeManager();
    const observeSpy = jest.spyOn(themeManager, 'observeDOMChanges');
    const preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };

    await themeManager.applyDarkMode(preferences);

    expect(observeSpy).toHaveBeenCalled();
  });

  test('applyDarkMode applies CSS custom properties', async () => {
    const themeManager = new ThemeManager();
    const preferences = {
      backgroundColor: '#2a2a2a',
      textColor: '#f0f0f0',
      accentColor: '#00aaff',
    };

    await themeManager.applyDarkMode(preferences);

    expect(mockSetProperty).toHaveBeenCalledWith('--dark-bg', '#2a2a2a');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-text', '#f0f0f0');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-accent', '#00aaff');
    expect(mockClassListAdd).toHaveBeenCalledWith('shadow-scribe-dark');
  });
});

describe('ThemeManager - removeDarkMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('removeDarkMode sets isDarkMode to false', () => {
    const themeManager = new ThemeManager();
    themeManager.isDarkMode = true;

    themeManager.removeDarkMode();

    expect(themeManager.isDarkMode).toBe(false);
  });

  test('removeDarkMode calls removeStyles', () => {
    const themeManager = new ThemeManager();
    const removeStylesSpy = jest.spyOn(themeManager, 'removeStyles');
    themeManager.isDarkMode = true;

    themeManager.removeDarkMode();

    expect(removeStylesSpy).toHaveBeenCalled();
  });

  test('removeDarkMode calls disconnectObserver', () => {
    const themeManager = new ThemeManager();
    const disconnectSpy = jest.spyOn(themeManager, 'disconnectObserver');
    themeManager.isDarkMode = true;

    themeManager.removeDarkMode();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  test('removeDarkMode removes all styles', () => {
    const themeManager = new ThemeManager();
    themeManager.isDarkMode = true;

    themeManager.removeDarkMode();

    expect(mockRemoveProperty).toHaveBeenCalledWith('--dark-bg');
    expect(mockRemoveProperty).toHaveBeenCalledWith('--dark-text');
    expect(mockRemoveProperty).toHaveBeenCalledWith('--dark-accent');
    expect(mockClassListRemove).toHaveBeenCalledWith('shadow-scribe-dark');
  });
});

describe('ThemeManager - updatePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('updatePreferences merges new preferences with existing ones', () => {
    const themeManager = new ThemeManager();
    themeManager.preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };

    themeManager.updatePreferences({
      backgroundColor: '#000000',
    });

    expect(themeManager.preferences).toEqual({
      backgroundColor: '#000000',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    });
  });

  test('updatePreferences calls injectStyles when dark mode is active', () => {
    const themeManager = new ThemeManager();
    themeManager.isDarkMode = true;
    themeManager.preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };
    const injectStylesSpy = jest.spyOn(themeManager, 'injectStyles');

    themeManager.updatePreferences({
      backgroundColor: '#2a2a2a',
    });

    expect(injectStylesSpy).toHaveBeenCalled();
  });

  test('updatePreferences does not call injectStyles when dark mode is inactive', () => {
    const themeManager = new ThemeManager();
    themeManager.isDarkMode = false;
    themeManager.preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };
    const injectStylesSpy = jest.spyOn(themeManager, 'injectStyles');

    themeManager.updatePreferences({
      backgroundColor: '#2a2a2a',
    });

    expect(injectStylesSpy).not.toHaveBeenCalled();
  });

  test('updatePreferences updates existing styles when dark mode is active', () => {
    const themeManager = new ThemeManager();
    themeManager.isDarkMode = true;
    themeManager.preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };

    themeManager.updatePreferences({
      textColor: '#ffffff',
      accentColor: '#ff0000',
    });

    expect(mockSetProperty).toHaveBeenCalledWith('--dark-bg', '#1e1e1e');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-text', '#ffffff');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-accent', '#ff0000');
  });
});

describe('ThemeManager - injectStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('injectStyles sets CSS custom properties with provided values', () => {
    const themeManager = new ThemeManager();
    themeManager.preferences = {
      backgroundColor: '#333333',
      textColor: '#cccccc',
      accentColor: '#0088ff',
    };

    themeManager.injectStyles();

    expect(mockSetProperty).toHaveBeenCalledWith('--dark-bg', '#333333');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-text', '#cccccc');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-accent', '#0088ff');
  });

  test('injectStyles uses default values when preferences are missing', () => {
    const themeManager = new ThemeManager();
    themeManager.preferences = {};

    themeManager.injectStyles();

    expect(mockSetProperty).toHaveBeenCalledWith('--dark-bg', '#1e1e1e');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-text', '#e0e0e0');
    expect(mockSetProperty).toHaveBeenCalledWith('--dark-accent', '#4a9eff');
  });

  test('injectStyles adds shadow-scribe-dark class to body', () => {
    const themeManager = new ThemeManager();
    themeManager.preferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };

    themeManager.injectStyles();

    expect(mockClassListAdd).toHaveBeenCalledWith('shadow-scribe-dark');
  });
});

describe('ThemeManager - removeStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('removeStyles removes all CSS custom properties', () => {
    const themeManager = new ThemeManager();

    themeManager.removeStyles();

    expect(mockRemoveProperty).toHaveBeenCalledWith('--dark-bg');
    expect(mockRemoveProperty).toHaveBeenCalledWith('--dark-text');
    expect(mockRemoveProperty).toHaveBeenCalledWith('--dark-accent');
  });

  test('removeStyles removes shadow-scribe-dark class from body', () => {
    const themeManager = new ThemeManager();

    themeManager.removeStyles();

    expect(mockClassListRemove).toHaveBeenCalledWith('shadow-scribe-dark');
  });
});

describe('ThemeManager - observeDOMChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('observeDOMChanges creates a MutationObserver', () => {
    const themeManager = new ThemeManager();

    themeManager.observeDOMChanges();

    expect(MutationObserver).toHaveBeenCalled();
    expect(themeManager.observer).not.toBeNull();
  });

  test('observeDOMChanges starts observing document.body', () => {
    const themeManager = new ThemeManager();

    themeManager.observeDOMChanges();

    expect(themeManager.observer.observe).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
    });
  });

  test('MutationObserver is initialized with correct options', () => {
    const themeManager = new ThemeManager();

    themeManager.observeDOMChanges();

    expect(themeManager.observer.observe).toHaveBeenCalledWith(
      document.body,
      expect.objectContaining({
        childList: true,
        subtree: true,
      })
    );
  });
});

describe('ThemeManager - disconnectObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('disconnectObserver disconnects the observer when it exists', () => {
    const themeManager = new ThemeManager();
    themeManager.observeDOMChanges();
    const observerInstance = themeManager.observer;

    themeManager.disconnectObserver();

    expect(observerInstance.disconnect).toHaveBeenCalled();
    expect(themeManager.observer).toBeNull();
  });

  test('disconnectObserver does nothing when observer is null', () => {
    const themeManager = new ThemeManager();
    themeManager.observer = null;

    // Should not throw
    expect(() => themeManager.disconnectObserver()).not.toThrow();
    expect(themeManager.observer).toBeNull();
  });

  test('disconnectObserver sets observer to null after disconnecting', () => {
    const themeManager = new ThemeManager();
    themeManager.observeDOMChanges();
    expect(themeManager.observer).not.toBeNull();

    themeManager.disconnectObserver();

    expect(themeManager.observer).toBeNull();
  });
});

describe('ThemeManager - Integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProperty.mockClear();
    mockRemoveProperty.mockClear();
    mockClassListAdd.mockClear();
    mockClassListRemove.mockClear();
  });

  test('complete workflow: apply, update, remove', async () => {
    const themeManager = new ThemeManager();

    // Apply dark mode
    const initialPreferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };
    await themeManager.applyDarkMode(initialPreferences);

    expect(themeManager.isDarkMode).toBe(true);
    expect(mockClassListAdd).toHaveBeenCalledWith('shadow-scribe-dark');
    expect(themeManager.observer).not.toBeNull();

    // Update preferences
    mockSetProperty.mockClear();
    mockClassListAdd.mockClear();
    themeManager.updatePreferences({
      backgroundColor: '#000000',
    });

    expect(mockSetProperty).toHaveBeenCalledWith('--dark-bg', '#000000');

    // Remove dark mode
    mockRemoveProperty.mockClear();
    mockClassListRemove.mockClear();
    themeManager.removeDarkMode();

    expect(themeManager.isDarkMode).toBe(false);
    expect(mockClassListRemove).toHaveBeenCalledWith('shadow-scribe-dark');
    expect(themeManager.observer).toBeNull();
  });

  test('applying dark mode twice updates preferences', async () => {
    const themeManager = new ThemeManager();

    const firstPreferences = {
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    };
    await themeManager.applyDarkMode(firstPreferences);

    const secondPreferences = {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ff0000',
    };
    await themeManager.applyDarkMode(secondPreferences);

    expect(themeManager.preferences).toEqual(secondPreferences);
    expect(themeManager.isDarkMode).toBe(true);
  });

  test('removing dark mode when not applied does not throw', () => {
    const themeManager = new ThemeManager();

    expect(() => themeManager.removeDarkMode()).not.toThrow();
    expect(themeManager.isDarkMode).toBe(false);
  });
});
