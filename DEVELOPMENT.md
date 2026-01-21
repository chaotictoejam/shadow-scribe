# Development Guide

This document provides detailed information for developers working on Shadow Scribe.

## Project Structure

The project follows a modular architecture with clear separation of concerns:

- **src/background.js** - Background service worker for global state management
- **src/content/** - Content scripts injected into Proton Docs pages
- **src/options/** - Extension settings page
- **src/utils/** - Shared utility modules
- **src/icons/** - Extension icons

## Build System

The project uses Webpack for bundling and Babel for transpilation.

### Build Configuration

- **Development build**: `npm run dev` (watch mode with source maps)
- **Production build**: `npm run build` (optimized, minified)

The build process:

1. Transpiles ES6+ code to Firefox-compatible JavaScript
2. Bundles modules into separate entry points
3. Copies static assets (HTML, CSS, icons, manifest)
4. Outputs to `dist/` directory

## Testing Strategy

### Unit Tests

- Framework: Jest
- Location: `*.test.js` files
- Run: `npm run test:unit`

### Property-Based Tests

- Framework: fast-check
- Location: `*.pbt.js` files
- Run: `npm run test:pbt`

### Test Coverage

- Run: `npm test -- --coverage`
- Reports generated in `coverage/` directory

## Code Quality

### Linting

- ESLint configuration in `.eslintrc.json`
- Run: `npm run lint`
- Auto-fix: `npm run lint -- --fix`

### Formatting

- Prettier configuration in `.prettierrc.json`
- Run: `npm run format`

## Development Workflow

1. **Make changes** to source files in `src/`
2. **Run tests** to verify functionality
3. **Lint and format** code
4. **Build** the extension
5. **Test in Firefox** using temporary add-on loading

## Debugging

### Console Logging

- Background script logs: Browser Console (Ctrl+Shift+J)
- Content script logs: Web Console (Ctrl+Shift+K) on Proton Docs page
- Options page logs: Web Console on options page

### Firefox DevTools

- Use `about:debugging` to inspect the extension
- Enable "Enable add-on debugging" in Firefox settings
- Use browser DevTools to debug content scripts

## Browser API Mocking

The `jest.setup.js` file provides mocks for WebExtensions APIs:

- `browser.storage.*`
- `browser.runtime.*`
- `browser.tabs.*`

These mocks are automatically available in all tests.

## Common Tasks

### Adding a New Component

1. Create the component file in appropriate directory
2. Add entry point to `webpack.config.js` if needed
3. Write unit tests
4. Update documentation

### Adding a New Dependency

1. Install: `npm install <package>`
2. Update `package.json`
3. Document usage in code

### Updating Manifest

1. Edit `src/manifest.json`
2. Rebuild to copy to `dist/`
3. Reload extension in Firefox

## Performance Considerations

- Keep bundle sizes small
- Minimize DOM manipulation
- Use CSS for styling instead of JavaScript when possible
- Throttle/debounce expensive operations
- Profile with Firefox DevTools Performance tab

## Security Guidelines

- Never use `eval()` or similar dynamic code execution
- Validate all user inputs
- Follow Content Security Policy (CSP) requirements
- Minimize permissions in manifest
- Sanitize any data from web pages

## Release Process

1. Update version in `src/manifest.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build production package
5. Test packaged extension
6. Create git tag
7. Submit to Firefox Add-ons

## Resources

- [WebExtensions API Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [Jest Documentation](https://jestjs.io/)
- [fast-check Documentation](https://fast-check.dev/)
