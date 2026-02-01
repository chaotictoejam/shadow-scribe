# Known Issues and Workarounds

This document tracks known issues, limitations, and workarounds for Shadow Scribe.

## Current Known Issues

### 🔄 Dynamic Content Flash

**Issue**: When Proton Docs loads new content dynamically, there may be a brief flash of light mode before dark mode is applied.

**Severity**: Minor (cosmetic)

**Workaround**: None currently. The flash is typically less than 100ms and occurs only when new content is loaded.

**Status**: Under investigation. Considering pre-emptive style injection.

---

### 🎨 Custom Proton Docs Themes

**Issue**: If you have custom themes or styling applied to Proton Docs through other extensions or user styles, they may conflict with Shadow Scribe's dark mode.

**Severity**: Minor

**Workaround**: 
- Disable other theme extensions when using Shadow Scribe
- Adjust Shadow Scribe's color settings to complement your custom theme
- Use the global disable toggle when you need your custom theme

**Status**: Working as designed. Shadow Scribe applies its own styling which may override other customizations.

---

### 🖼️ Embedded Content

**Issue**: Some embedded content (iframes from external sources) may not receive dark mode styling.

**Severity**: Minor

**Workaround**: External iframes are outside the extension's control due to browser security policies. Only Proton Docs content within the same origin can be styled.

**Status**: Limitation of browser security model (cannot be fixed).

---

### ⚡ First Load Delay

**Issue**: On the very first page load after installing the extension, there may be a slight delay before the toggle button appears.

**Severity**: Minor

**Workaround**: Refresh the page if the toggle button doesn't appear within 2 seconds.

**Status**: Normal behavior. Extension needs to initialize on first run.

---

## Browser-Specific Issues

### Firefox

#### Print Preview
**Issue**: Dark mode styling may appear in print preview, making documents harder to read when printed.

**Severity**: Minor

**Workaround**: Disable dark mode before printing (click the toggle button to switch to light mode).

**Status**: Planned fix - Auto-detect print mode and temporarily disable dark mode.

---

## Performance Notes

### Large Documents

**Issue**: Very large documents (100+ pages) may take slightly longer to apply dark mode.

**Severity**: Minor

**Impact**: Theme application may take 200-300ms instead of the typical 50-100ms.

**Workaround**: None needed. Performance is still acceptable.

**Status**: Acceptable performance. Further optimization not prioritized.

---

## Limitations

### 📍 Scope

**Limitation**: Shadow Scribe is designed exclusively for Proton Docs documents (`drive.proton.me/docs/*`).

**Reason**: The extension is specifically designed and tested for Proton Docs' unique document structure and styling.

**Note**: This focused approach ensures optimal performance and reliability for Proton Docs users.

---

### 🔒 Permissions

**Limitation**: Extension requires `activeTab` permission and host permission for `drive.proton.me`.

**Reason**: Necessary to inject content scripts and apply styling to Proton Docs pages.

**Note**: These are minimal permissions required for functionality. No additional data is collected or transmitted.

---

### 💾 Storage

**Limitation**: Settings are stored locally and don't sync across devices by default.

**Reason**: Extension uses local storage for privacy and performance.

**Workaround**: If you use Firefox Sync, your extension settings will sync automatically across your Firefox installations.

**Future**: Considering optional cloud sync feature for future releases.

---

## Resolved Issues

### ✅ Toggle Button Positioning (Fixed in v1.0.0)

**Issue**: Toggle button could block content in some layouts.

**Resolution**: Improved positioning algorithm to avoid content overlap. Button now intelligently positions itself in the top-right corner with proper spacing.

---

### ✅ Theme Persistence (Fixed in v1.0.0)

**Issue**: Theme preference wasn't always saved correctly for individual documents.

**Resolution**: Implemented robust storage system with per-document state tracking. Each document now reliably remembers your theme preference.

---

### ✅ Multi-Tab Synchronization (Fixed in v1.0.0)

**Issue**: Changing settings in one tab didn't update other open tabs.

**Resolution**: Implemented message broadcasting system. All tabs now receive preference updates in real-time.

---

## Reporting New Issues

Found a bug or issue not listed here? Please report it!

### Before Reporting

1. **Check this document** to see if it's a known issue
2. **Try the workaround** if one is provided
3. **Update to the latest version** - the issue may already be fixed
4. **Disable other extensions** to rule out conflicts
5. **Test in a clean Firefox profile** to eliminate profile-specific issues

### How to Report

**GitHub Issues**: [https://github.com/chaotictoejam/shadow-scribe/issues](https://github.com/chaotictoejam/shadow-scribe/issues)

**Include the following information**:
- Shadow Scribe version (check in `about:addons`)
- Firefox version (check in `about:support`)
- Operating system (Windows, macOS, Linux)
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots or screen recordings (if applicable)
- Browser console errors (press F12, check Console tab)

### Issue Template

```markdown
**Shadow Scribe Version**: 1.0.0
**Firefox Version**: 115.0
**Operating System**: Windows 11

**Description**:
Brief description of the issue

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error...

**Expected Behavior**:
What you expected to happen

**Actual Behavior**:
What actually happened

**Screenshots**:
If applicable, add screenshots

**Console Errors**:
Any errors from the browser console
```

---

## Feature Requests

Have an idea for a new feature? We'd love to hear it!

**GitHub Discussions**: [https://github.com/chaotictoejam/shadow-scribe/discussions](https://github.com/chaotictoejam/shadow-scribe/discussions)

Check the [Roadmap](README.md#-roadmap) to see what's already planned.

---

## Getting Help

- **Documentation**: Check [README.md](README.md) and [DEVELOPMENT.md](DEVELOPMENT.md)
- **FAQ**: See common questions below
- **Community**: Join discussions on GitHub
- **Email**: support@shadowscribe.example.com

---

## Frequently Asked Questions

### Why doesn't dark mode work on other Proton services?

Shadow Scribe is designed exclusively for Proton Docs. The extension is optimized specifically for the Proton Docs document structure and styling system.

### Can I use Shadow Scribe with other dark mode extensions?

It's not recommended. Multiple dark mode extensions may conflict with each other. Choose one extension for the best experience.

### Why does the page flash light mode briefly?

This is a known issue with dynamically loaded content. The extension applies dark mode as quickly as possible, but there may be a brief flash during initial page load.

### Will my settings sync across devices?

If you use Firefox Sync, your extension settings will automatically sync across your Firefox installations. Otherwise, settings are stored locally on each device.

### Does Shadow Scribe collect any data?

No. Shadow Scribe does not collect, transmit, or store any user data. All preferences are stored locally in your browser.

### Can I customize the colors?

Yes! Open the extension settings (click the Shadow Scribe icon in your toolbar) to customize background color, text color, accent color, and darkness level.

### How do I disable dark mode temporarily?

Click the toggle button (moon/sun icon) in the top-right corner of any Proton Docs document to switch between light and dark modes.

### Can I disable the extension for specific documents?

Yes. Each document remembers its own theme preference. Simply toggle dark mode off for documents where you prefer light mode.

---

**Last Updated**: February 1, 2026  
**Version**: 1.0.0
