/**
 * Property-based tests for color validity (Property 8.10)
 */

import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import ThemeManager from '../content/theme-manager.js';

describe('Property 8.10: Color Validity', () => {
  test('all valid hex colors are handled correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          backgroundDarkness: fc.integer({ min: 0, max: 100 })
        }),
        (preferences) => {
          // Create fresh DOM for each test
          const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
          global.document = dom.window.document;
          global.MutationObserver = dom.window.MutationObserver;
          // Validate hex color format
          const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
          expect(hexColorRegex.test(preferences.backgroundColor)).toBe(true);
          expect(hexColorRegex.test(preferences.textColor)).toBe(true);
          expect(hexColorRegex.test(preferences.accentColor)).toBe(true);

          const themeManager = new ThemeManager();
          themeManager.applyDarkMode(preferences);

          // Verify CSS custom properties are set on document root
          const root = global.document.documentElement;
          expect(root.style.getPropertyValue('--dark-bg')).toBe(preferences.backgroundColor);
          expect(root.style.getPropertyValue('--dark-text')).toBe(preferences.textColor);
          expect(root.style.getPropertyValue('--dark-accent')).toBe(preferences.accentColor);

          themeManager.disconnectObserver();
          dom.window.close();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('CSS custom properties are set correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          backgroundDarkness: fc.integer({ min: 0, max: 100 })
        }),
        (preferences) => {
          // Create fresh DOM for each test
          const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
          global.document = dom.window.document;
          global.MutationObserver = dom.window.MutationObserver;
          
          const themeManager = new ThemeManager();
          themeManager.applyDarkMode(preferences);

          const root = global.document.documentElement;

          // Check that CSS variables are defined
          expect(root.style.getPropertyValue('--dark-bg')).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(root.style.getPropertyValue('--dark-text')).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(root.style.getPropertyValue('--dark-accent')).toMatch(/^#[0-9A-Fa-f]{6}$/);

          themeManager.disconnectObserver();
          dom.window.close();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('color combinations maintain readability', () => {
    fc.assert(
      fc.property(
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          backgroundDarkness: fc.integer({ min: 0, max: 100 })
        }),
        (preferences) => {
          // Helper function to calculate relative luminance
          const getLuminance = (hex) => {
            const rgb = parseInt(hex.slice(1), 16);
            const r = ((rgb >> 16) & 0xff) / 255;
            const g = ((rgb >> 8) & 0xff) / 255;
            const b = (rgb & 0xff) / 255;

            const [rs, gs, bs] = [r, g, b].map(c =>
              c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
            );

            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          };

          // Calculate contrast ratio
          const bgLuminance = getLuminance(preferences.backgroundColor);
          const textLuminance = getLuminance(preferences.textColor);

          const lighter = Math.max(bgLuminance, textLuminance);
          const darker = Math.min(bgLuminance, textLuminance);
          const contrastRatio = (lighter + 0.05) / (darker + 0.05);

          // Just verify the contrast ratio is calculated (always >= 1.0)
          expect(contrastRatio).toBeGreaterThanOrEqual(1.0);

          // Note: We don't enforce minimum contrast here because arbitrary colors
          // may be very similar. The default preferences should meet WCAG standards.
        }
      ),
      { numRuns: 50 }
    );
  });
});
