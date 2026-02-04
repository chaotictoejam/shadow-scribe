# Build Instructions for Mozilla Reviewers

This extension uses webpack and babel to bundle the source code.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)

## Build Steps

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

This will create the `dist/` directory containing the built extension files.

## Verification

The built extension will be in the `dist/` directory. You can load it in Firefox by:
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file from the `dist/` directory

## Build Tools Used

- **webpack**: Bundles JavaScript modules
- **babel**: Transpiles modern JavaScript to ensure compatibility
- **copy-webpack-plugin**: Copies static assets (manifest, CSS, HTML, icons)

## Source Code Structure

- `src/` - Source code directory
  - `background.js` - Background script
  - `content/` - Content scripts and styles
  - `options/` - Options page
  - `utils/` - Utility modules
  - `manifest.json` - Extension manifest
  - `icons/` - Extension icons

## Output Structure

The build process creates a `dist/` directory with the same structure as `src/`, with JavaScript files bundled and transpiled.
