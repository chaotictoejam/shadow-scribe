# Shadow Scribe

A Firefox browser extension that applies dark mode styling to Proton Docs documents for comfortable reading and editing in low-light environments.

## Project Status

This project is currently under development. The initial project structure has been set up.

## Directory Structure

```
proton-docs-dark-mode/
├── src/
│   ├── background.js              # Background service worker
│   ├── manifest.json              # Extension configuration
│   ├── content/
│   │   ├── content.js            # Main content script entry point
│   │   ├── theme-manager.js      # Theme application logic
│   │   ├── toggle-button.js      # In-page toggle UI component
│   │   └── dark-mode.css         # Dark mode CSS styles
│   ├── options/
│   │   ├── options.html          # Settings page UI
│   │   ├── options.js            # Settings page logic
│   │   └── options.css           # Settings page styling
│   ├── utils/
│   │   ├── storage.js            # Storage abstraction layer
│   │   └── messaging.js          # Cross-component messaging
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── __mocks__/                     # Jest mocks
├── dist/                          # Build output (generated)
├── package.json
├── webpack.config.js
├── jest.config.js
└── README.md
```

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firefox 115 or higher

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

- `npm run dev` - Watch mode for development
- `npm run build` - Production build
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:pbt` - Run property-based tests only
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run package` - Package extension for distribution

### Loading the Extension in Firefox

1. Build the extension: `npm run build`
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to the `dist` folder and select `manifest.json`

## Features (Planned)

- Automatic dark mode application to Proton Docs documents
- Manual toggle control for individual documents
- Customizable appearance (colors, darkness level)
- Document content preservation (no data modification)
- Image and media handling (preserved appearance)
- Consistent UI element styling
- Performance optimized
- State persistence across sessions
- Global enable/disable control

## Testing

The project uses:

- **Jest** for unit testing
- **fast-check** for property-based testing
- **Selenium WebDriver** for integration testing (to be set up)

## License

MIT

## Contributing

This project is currently in initial development. Contribution guidelines will be added later.
