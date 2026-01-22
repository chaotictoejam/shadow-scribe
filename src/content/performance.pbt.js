/**
 * Property-based tests for performance bounds (Property 8.9)
 */

import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import ThemeManager from './theme-manager.js';

describe('Property 8.9: Performance Bounds', () => {
  test('theme application completes within 100ms', () => {
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
          
          const themeManager = new ThemeManager(preferences);

          const startTime = performance.now();
          themeManager.applyDarkMode();
          const endTime = performance.now();

          const duration = endTime - startTime;

          // Theme application should complete within 100ms
          expect(duration).toBeLessThan(100);

          themeManager.disconnectObserver();
          dom.window.close();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('toggle completes within 200ms', () => {
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
          
          const themeManager = new ThemeManager(preferences);

          const startTime = performance.now();
          
          // Apply theme
          themeManager.applyDarkMode();
          
          // Remove theme (toggle off)
          themeManager.removeDarkMode();
          
          const endTime = performance.now();
          const duration = endTime - startTime;

          // Complete toggle cycle should complete within 200ms
          expect(duration).toBeLessThan(200);

          themeManager.disconnectObserver();
          dom.window.close();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('performance scales with document size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }), // number of elements
        fc.record({
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          accentColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          backgroundDarkness: fc.integer({ min: 0, max: 100 })
        }),
        (numElements, preferences) => {
          // Create fresh DOM for each test
          const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
          const document = dom.window.document;
          global.document = document;
          global.MutationObserver = dom.window.MutationObserver;
          
          // Create a document with many elements
          for (let i = 0; i < numElements; i++) {
            const div = document.createElement('div');
            div.textContent = `Element ${i}`;
            document.body.appendChild(div);
          }

          const themeManager = new ThemeManager(preferences);

          const startTime = performance.now();
          themeManager.applyDarkMode();
          const endTime = performance.now();

          const duration = endTime - startTime;

          // Should still complete within 100ms even with many elements
          expect(duration).toBeLessThan(100);

          themeManager.disconnectObserver();
          dom.window.close();
        }
      ),
      { numRuns: 30 }
    );
  });
});
