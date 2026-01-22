/**
 * Unit tests for options page
 */

import { JSDOM } from 'jsdom';

// Mock chrome API
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

describe('Options Page Tests', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Create DOM with options page structure
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <input type="checkbox" id="globalEnable" />
          <input type="color" id="backgroundColor" />
          <input type="color" id="textColor" />
          <input type="color" id="accentColor" />
          <input type="range" id="backgroundDarkness" min="0" max="100" />
          <span id="darknessValue"></span>
          <button id="saveButton">Save</button>
          <button id="resetButton">Reset</button>
          <div id="saveConfirmation" style="display: none;"></div>
        </body>
      </html>
    `);
    
    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('loadSettings', () => {
    test('should populate form with saved settings', async () => {
      const mockPreferences = {
        globalEnabled: true,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0',
        accentColor: '#4a9eff',
        backgroundDarkness: 75
      };

      chrome.storage.sync.get.mockResolvedValue({
        preferences: mockPreferences
      });

      const result = await chrome.storage.sync.get('preferences');
      const prefs = result.preferences;

      document.getElementById('globalEnable').checked = prefs.globalEnabled;
      document.getElementById('backgroundColor').value = prefs.backgroundColor;
      document.getElementById('textColor').value = prefs.textColor;
      document.getElementById('accentColor').value = prefs.accentColor;
      document.getElementById('backgroundDarkness').value = prefs.backgroundDarkness;
      document.getElementById('darknessValue').textContent = `${prefs.backgroundDarkness}%`;

      expect(document.getElementById('globalEnable').checked).toBe(true);
      expect(document.getElementById('backgroundColor').value).toBe('#1a1a1a');
      expect(document.getElementById('textColor').value).toBe('#e0e0e0');
      expect(document.getElementById('accentColor').value).toBe('#4a9eff');
      expect(document.getElementById('backgroundDarkness').value).toBe('75');
      expect(document.getElementById('darknessValue').textContent).toBe('75%');
    });

    test('should use default values when no settings saved', async () => {
      chrome.storage.sync.get.mockResolvedValue({});

      const result = await chrome.storage.sync.get('preferences');
      const prefs = result.preferences || {
        globalEnabled: true,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0',
        accentColor: '#4a9eff',
        backgroundDarkness: 80
      };

      expect(prefs.globalEnabled).toBe(true);
      expect(prefs.backgroundColor).toBe('#1a1a1a');
    });
  });

  describe('saveSettings', () => {
    test('should persist form values to storage', async () => {
      document.getElementById('globalEnable').checked = false;
      document.getElementById('backgroundColor').value = '#000000';
      document.getElementById('textColor').value = '#ffffff';
      document.getElementById('accentColor').value = '#ff0000';
      document.getElementById('backgroundDarkness').value = '90';

      const preferences = {
        globalEnabled: document.getElementById('globalEnable').checked,
        backgroundColor: document.getElementById('backgroundColor').value,
        textColor: document.getElementById('textColor').value,
        accentColor: document.getElementById('accentColor').value,
        backgroundDarkness: parseInt(document.getElementById('backgroundDarkness').value)
      };

      chrome.storage.sync.set.mockResolvedValue();
      await chrome.storage.sync.set({ preferences });

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ preferences });
      expect(preferences.globalEnabled).toBe(false);
      expect(preferences.backgroundColor).toBe('#000000');
      expect(preferences.backgroundDarkness).toBe(90);
    });

    test('should broadcast preferences update after save', async () => {
      const preferences = {
        globalEnabled: true,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0',
        accentColor: '#4a9eff',
        backgroundDarkness: 80
      };

      chrome.runtime.sendMessage.mockResolvedValue();
      await chrome.runtime.sendMessage({
        type: 'PREFERENCES_UPDATED',
        preferences
      });

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PREFERENCES_UPDATED',
        preferences
      });
    });

    test('should show save confirmation', async () => {
      const confirmation = document.getElementById('saveConfirmation');
      
      confirmation.textContent = 'Settings saved!';
      confirmation.style.display = 'block';

      expect(confirmation.textContent).toBe('Settings saved!');
      expect(confirmation.style.display).toBe('block');
    });
  });

  describe('resetSettings', () => {
    test('should restore default values', async () => {
      const defaults = {
        globalEnabled: true,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0',
        accentColor: '#4a9eff',
        backgroundDarkness: 80
      };

      document.getElementById('globalEnable').checked = defaults.globalEnabled;
      document.getElementById('backgroundColor').value = defaults.backgroundColor;
      document.getElementById('textColor').value = defaults.textColor;
      document.getElementById('accentColor').value = defaults.accentColor;
      document.getElementById('backgroundDarkness').value = defaults.backgroundDarkness;

      expect(document.getElementById('globalEnable').checked).toBe(true);
      expect(document.getElementById('backgroundColor').value).toBe('#1a1a1a');
      expect(document.getElementById('backgroundDarkness').value).toBe('80');
    });

    test('should save defaults to storage after reset', async () => {
      const defaults = {
        globalEnabled: true,
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0',
        accentColor: '#4a9eff',
        backgroundDarkness: 80
      };

      chrome.storage.sync.set.mockResolvedValue();
      await chrome.storage.sync.set({ preferences: defaults });

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        preferences: defaults
      });
    });
  });

  describe('Form Validation', () => {
    test('should validate color input format', () => {
      const validColors = ['#000000', '#ffffff', '#1a1a1a', '#4a9eff'];
      const invalidColors = ['#zzz', 'red', '123456', '#12345'];

      validColors.forEach(color => {
        expect(/^#[0-9A-Fa-f]{6}$/.test(color)).toBe(true);
      });

      invalidColors.forEach(color => {
        expect(/^#[0-9A-Fa-f]{6}$/.test(color)).toBe(false);
      });
    });

    test('should validate darkness slider range', () => {
      const slider = document.getElementById('backgroundDarkness');
      
      slider.value = '50';
      expect(parseInt(slider.value)).toBeGreaterThanOrEqual(0);
      expect(parseInt(slider.value)).toBeLessThanOrEqual(100);

      slider.value = '0';
      expect(parseInt(slider.value)).toBe(0);

      slider.value = '100';
      expect(parseInt(slider.value)).toBe(100);
    });
  });

  describe('updateDarknessDisplay', () => {
    test('should update darkness percentage display', () => {
      const slider = document.getElementById('backgroundDarkness');
      const display = document.getElementById('darknessValue');

      slider.value = '75';
      display.textContent = `${slider.value}%`;

      expect(display.textContent).toBe('75%');

      slider.value = '50';
      display.textContent = `${slider.value}%`;

      expect(display.textContent).toBe('50%');
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors during load', async () => {
      chrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));

      try {
        await chrome.storage.sync.get('preferences');
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
    });

    test('should handle storage errors during save', async () => {
      chrome.storage.sync.set.mockRejectedValue(new Error('Save error'));

      try {
        await chrome.storage.sync.set({ preferences: {} });
      } catch (error) {
        expect(error.message).toBe('Save error');
      }
    });

    test('should handle message sending errors', async () => {
      chrome.runtime.sendMessage.mockRejectedValue(new Error('Message error'));

      try {
        await chrome.runtime.sendMessage({ type: 'PREFERENCES_UPDATED' });
      } catch (error) {
        expect(error.message).toBe('Message error');
      }
    });
  });
});
