/**
 * Unit tests for ToggleButton
 * Task 6.2: Write unit tests for ToggleButton
 */

const ToggleButton = require('./toggle-button.js');

// Mock ThemeManager
class MockThemeManager {
  constructor() {
    this.applyDarkMode = jest.fn();
    this.removeDarkMode = jest.fn();
  }
}

// Mock DOM APIs
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();
document.createElement = jest.fn((tag) => {
  const element = {
    id: '',
    className: '',
    innerHTML: '',
    setAttribute: jest.fn(),
    addEventListener: jest.fn(),
    remove: jest.fn(),
  };
  return element;
});

// Mock window functions
window.getDocumentThemeState = jest.fn();
window.setDocumentThemeState = jest.fn();
window.getPreferences = jest.fn();

// Mock window.location with a configurable pathname
delete window.location;
window.location = { pathname: '/docs/test-doc-123' };

describe('ToggleButton - Constructor', () => {
  test('constructor initializes with theme manager and null button', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    expect(toggleButton.themeManager).toBe(themeManager);
    expect(toggleButton.button).toBeNull();
  });
});

describe('ToggleButton - create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create creates button element with correct properties', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    toggleButton.create();

    expect(document.createElement).toHaveBeenCalledWith('button');
    expect(toggleButton.button).not.toBeNull();
    expect(toggleButton.button.id).toBe('shadow-scribe-toggle');
    expect(toggleButton.button.className).toBe('shadow-scribe-toggle');
    expect(toggleButton.button.innerHTML).toBe('🌙');
  });

  test('create sets accessibility attributes', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    toggleButton.create();

    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('aria-label', 'Toggle dark mode');
    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('title', 'Toggle dark mode');
  });

  test('create adds click event listener', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    toggleButton.create();

    expect(toggleButton.button.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('create injects button into document body', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    toggleButton.create();

    expect(document.body.appendChild).toHaveBeenCalledWith(toggleButton.button);
  });
});

describe('ToggleButton - handleToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.getDocumentThemeState.mockReset();
    window.setDocumentThemeState.mockReset();
    window.getPreferences.mockReset();
  });

  test('handleToggle enables dark mode when currently disabled', async () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    window.getDocumentThemeState.mockResolvedValue({ enabled: false });
    window.setDocumentThemeState.mockResolvedValue(undefined);
    window.getPreferences.mockResolvedValue({
      backgroundColor: '#1e1e1e',
      textColor: '#e0e0e0',
      accentColor: '#4a9eff',
    });

    await toggleButton.handleToggle();

    expect(window.getDocumentThemeState).toHaveBeenCalledWith('test-doc-123');
    expect(window.setDocumentThemeState).toHaveBeenCalledWith('test-doc-123', { enabled: true });
    expect(window.getPreferences).toHaveBeenCalled();
    expect(themeManager.applyDarkMode).toHaveBeenCalled();
    expect(toggleButton.button.innerHTML).toBe('☀️');
  });

  test('handleToggle disables dark mode when currently enabled', async () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    window.getDocumentThemeState.mockResolvedValue({ enabled: true });
    window.setDocumentThemeState.mockResolvedValue(undefined);

    await toggleButton.handleToggle();

    expect(window.getDocumentThemeState).toHaveBeenCalledWith('test-doc-123');
    expect(window.setDocumentThemeState).toHaveBeenCalledWith('test-doc-123', { enabled: false });
    expect(themeManager.removeDarkMode).toHaveBeenCalled();
    expect(toggleButton.button.innerHTML).toBe('🌙');
  });

  test('handleToggle updates accessibility attributes when enabling', async () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    window.getDocumentThemeState.mockResolvedValue({ enabled: false });
    window.setDocumentThemeState.mockResolvedValue(undefined);
    window.getPreferences.mockResolvedValue({});

    await toggleButton.handleToggle();

    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('aria-label', 'Switch to light mode');
    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('title', 'Switch to light mode');
  });

  test('handleToggle updates accessibility attributes when disabling', async () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    window.getDocumentThemeState.mockResolvedValue({ enabled: true });
    window.setDocumentThemeState.mockResolvedValue(undefined);

    await toggleButton.handleToggle();

    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('aria-label', 'Switch to dark mode');
    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('title', 'Switch to dark mode');
  });

  test('handleToggle handles errors gracefully', async () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    const error = new Error('Storage error');
    window.getDocumentThemeState.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await toggleButton.handleToggle();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Shadow Scribe: Error toggling theme:', error);

    consoleErrorSpy.mockRestore();
  });
});

describe('ToggleButton - updateState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updateState sets sun icon when dark mode is active', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    toggleButton.updateState(true);

    expect(toggleButton.button.innerHTML).toBe('☀️');
    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('aria-label', 'Switch to light mode');
    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('title', 'Switch to light mode');
  });

  test('updateState sets moon icon when dark mode is inactive', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    toggleButton.updateState(false);

    expect(toggleButton.button.innerHTML).toBe('🌙');
    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('aria-label', 'Switch to dark mode');
    expect(toggleButton.button.setAttribute).toHaveBeenCalledWith('title', 'Switch to dark mode');
  });

  test('updateState does nothing when button is null', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    // Don't create button
    expect(() => toggleButton.updateState(true)).not.toThrow();
  });
});

describe('ToggleButton - remove', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('remove removes button from DOM', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();
    
    const buttonRemoveSpy = toggleButton.button.remove;

    toggleButton.remove();

    expect(buttonRemoveSpy).toHaveBeenCalled();
    expect(toggleButton.button).toBeNull();
  });

  test('remove does nothing when button is already null', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    expect(() => toggleButton.remove()).not.toThrow();
    expect(toggleButton.button).toBeNull();
  });

  test('remove can be called multiple times safely', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    toggleButton.remove();
    toggleButton.remove();
    toggleButton.remove();

    expect(toggleButton.button).toBeNull();
  });
});

describe('ToggleButton - getDocumentIdFromURL', () => {
  test('getDocumentIdFromURL extracts document ID from URL', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    window.location.pathname = '/docs/abc123';
    expect(toggleButton.getDocumentIdFromURL()).toBe('abc123');

    window.location.pathname = '/docs/my-document-456';
    expect(toggleButton.getDocumentIdFromURL()).toBe('my-document-456');
  });

  test('getDocumentIdFromURL returns default when no match', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    window.location.pathname = '/other-page';
    expect(toggleButton.getDocumentIdFromURL()).toBe('default');

    window.location.pathname = '/';
    expect(toggleButton.getDocumentIdFromURL()).toBe('default');
  });

  test('getDocumentIdFromURL handles complex URLs', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    window.location.pathname = '/u/0/docs/document-123/edit';
    expect(toggleButton.getDocumentIdFromURL()).toBe('document-123');
  });
});

describe('ToggleButton - Integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.getDocumentThemeState.mockReset();
    window.setDocumentThemeState.mockReset();
    window.getPreferences.mockReset();
  });

  test('complete workflow: create, toggle on, toggle off, remove', async () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);

    // Create button
    toggleButton.create();
    expect(toggleButton.button).not.toBeNull();
    expect(toggleButton.button.innerHTML).toBe('🌙');

    // Toggle on
    window.getDocumentThemeState.mockResolvedValue({ enabled: false });
    window.setDocumentThemeState.mockResolvedValue(undefined);
    window.getPreferences.mockResolvedValue({});
    await toggleButton.handleToggle();
    expect(themeManager.applyDarkMode).toHaveBeenCalled();
    expect(toggleButton.button.innerHTML).toBe('☀️');

    // Toggle off
    window.getDocumentThemeState.mockResolvedValue({ enabled: true });
    await toggleButton.handleToggle();
    expect(themeManager.removeDarkMode).toHaveBeenCalled();
    expect(toggleButton.button.innerHTML).toBe('🌙');

    // Remove
    toggleButton.remove();
    expect(toggleButton.button).toBeNull();
  });

  test('updateState reflects current theme state correctly', () => {
    const themeManager = new MockThemeManager();
    const toggleButton = new ToggleButton(themeManager);
    toggleButton.create();

    // Start with light mode
    toggleButton.updateState(false);
    expect(toggleButton.button.innerHTML).toBe('🌙');

    // Switch to dark mode
    toggleButton.updateState(true);
    expect(toggleButton.button.innerHTML).toBe('☀️');

    // Switch back to light mode
    toggleButton.updateState(false);
    expect(toggleButton.button.innerHTML).toBe('🌙');
  });
});
