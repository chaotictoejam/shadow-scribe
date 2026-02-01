# Shadow Scribe

A Firefox browser extension that brings dark mode to Proton Docs, providing a comfortable reading and editing experience in low-light environments.

## Features

- **🎨 Customizable Dark Theme** - Adjust colors, darkness levels, and accents to match your preferences
- **⚡ Quick Toggle** - Easily switch between light and dark modes with a floating toggle button
- **💾 Per-Document Memory** - Your theme preference is remembered for each document
- **🌐 Global Control** - Enable or disable the extension across all documents with one click
- **🎯 Non-Invasive** - Only modifies visual styling, never touches your document data
- **♿ Accessible** - Maintains proper contrast ratios and keyboard navigation
- **🚀 Performant** - Lightweight and fast, with minimal impact on page load times

## 📦 Installation

### From Firefox Add-ons (Recommended)
1. Visit the [Shadow Scribe page on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/shadow-scribe/)
2. Click "Add to Firefox"
3. Confirm the installation

### Manual Installation (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/chaotictoejam/shadow-scribe.git
   cd shadow-scribe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Firefox:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the `dist` folder

## 🚀 Usage

### Basic Usage

1. **Open a Proton Docs document** at `drive.proton.me/docs/*`
2. **Click the moon icon (🌙)** in the bottom-right corner to enable dark mode
3. **Click the sun icon (☀️)** to switch back to light mode

### Customization

1. **Open the extension settings**:
   - Click the Shadow Scribe icon in your Firefox toolbar
   - Select "Options" or "Preferences"

2. **Customize your theme**:
   - **Background Color**: Choose your preferred dark background
   - **Text Color**: Adjust text color for optimal readability
   - **Accent Color**: Set the color for links and interactive elements
   - **Background Darkness**: Fine-tune how dark the background appears

3. **Global Control**:
   - Toggle "Enable Shadow Scribe for all documents" to enable/disable globally
   - When disabled, dark mode won't apply to any documents

### Keyboard Shortcuts

- **Ctrl/Cmd + S** (in settings page): Save your preferences

## 🛠️ Development

### Prerequisites

- Node.js 14+ and npm
- Firefox 115+

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
shadow-scribe/
├── src/
│   ├── background.js          # Background service worker
│   ├── manifest.json          # Extension manifest
│   ├── content/
│   │   ├── content.js         # Content script entry point
│   │   ├── theme-manager.js   # Theme application logic
│   │   ├── toggle-button.js   # Toggle button component
│   │   └── dark-mode.css      # Dark mode styles
│   ├── options/
│   │   ├── options.html       # Settings page
│   │   ├── options.js         # Settings logic
│   │   └── options.css        # Settings styles
│   ├── utils/
│   │   ├── storage.js         # Storage abstraction
│   │   └── messaging.js       # Message passing utilities
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── dist/                      # Built extension (generated)
├── tests/                     # Test files
└── package.json
```

### Testing

The project uses Jest for unit testing and fast-check for property-based testing:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/utils/storage.test.js

# Run with coverage
npm run test:coverage

# Run property-based tests
npm test -- --testPathPattern=pbt
```

### Building

```bash
# Production build (minified, no source maps)
npm run build

# Development build (source maps included)
npm run build:dev
```

The built extension will be in the `dist/` folder.

## 🧪 Testing Strategy

Shadow Scribe uses a comprehensive testing approach:

- **Unit Tests**: Test individual components and functions
- **Property-Based Tests**: Verify correctness properties hold for all inputs
- **Integration Tests**: Test component interactions
- **Manual Testing**: Real-world testing on Proton Docs

### Key Properties Tested

1. **Storage Persistence**: Saved preferences are always retrievable
2. **Theme Idempotence**: Applying theme multiple times produces same result
3. **Theme Removal**: Removing theme restores original state
4. **Toggle Consistency**: Even toggles return to original state
5. **Document Preservation**: Dark mode never modifies document data

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linter (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Contribution Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep commits focused and atomic

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the "Docs after Dark" extension for Google Docs
- Built for the Proton community
- Thanks to all contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/shadow-scribe/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/shadow-scribe/discussions)
- **Email**: support@shadowscribe.example.com

## 🗺️ Roadmap

- [ ] Support for additional Proton services
- [ ] Sync settings across devices
- [ ] More theme presets
- [ ] Custom CSS injection
- [ ] Scheduled dark mode (auto-enable at sunset)

## 📊 Browser Compatibility

- **Firefox**: 115+ ✅
- **Chrome**: Not supported (Firefox-only extension)
- **Edge**: Not supported (Firefox-only extension)

## 🔒 Privacy

Shadow Scribe respects your privacy:

- **No data collection**: We don't collect any user data
- **No analytics**: No tracking or analytics
- **Local storage only**: All preferences stored locally in your browser
- **No external requests**: Extension works entirely offline
- **Open source**: Code is fully auditable

## ⚡ Performance

- **Initial load**: < 100ms
- **Toggle transition**: < 200ms
- **Memory usage**: < 50MB per tab
- **CPU usage**: < 1% during idle

## 🐛 Known Issues

- Some dynamically loaded content may briefly flash light mode before dark mode applies
- Custom Proton Docs themes may conflict with dark mode styling

See [ISSUES.md](ISSUES.md) for a complete list of known issues and workarounds.

## 📚 Documentation

- [User Guide](docs/USER_GUIDE.md) - Detailed usage instructions
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Development setup and architecture
- [API Documentation](docs/API.md) - Internal API reference
- [Changelog](CHANGELOG.md) - Version history and changes

## 🎯 Project Goals

1. Provide a comfortable dark mode experience for Proton Docs users
2. Maintain document data integrity (never modify user content)
3. Offer extensive customization options
4. Ensure accessibility compliance
5. Keep the extension lightweight and performant

---

Made with ❤️ for the Proton community

**Star ⭐ this repo if you find it useful!**
