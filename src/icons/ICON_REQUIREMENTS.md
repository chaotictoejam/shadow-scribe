# Icon Requirements for Shadow Scribe

## Overview
This document describes the icon requirements for the Shadow Scribe Firefox extension. The extension requires three icon sizes to be displayed in different contexts within Firefox.

## Required Icons

### 1. icon-16.png (16x16 pixels)
- **Purpose**: Displayed in the Firefox toolbar and extension menu
- **Format**: PNG with transparency
- **Size**: 16x16 pixels
- **Design**: Should be simple and recognizable at small size

### 2. icon-48.png (48x48 pixels)
- **Purpose**: Displayed in the Firefox Add-ons Manager
- **Format**: PNG with transparency
- **Size**: 48x48 pixels
- **Design**: More detailed version of the 16x16 icon

### 3. icon-128.png (128x128 pixels)
- **Purpose**: Displayed on the Firefox Add-ons website (addons.mozilla.org)
- **Format**: PNG with transparency
- **Size**: 128x128 pixels
- **Design**: High-resolution version with full detail

## Design Guidelines

### Theme
The icons should represent the "Shadow Scribe" concept - a dark mode extension for Proton Docs. Consider these design elements:

- **Moon/Night theme**: Crescent moon, stars, or night sky
- **Document theme**: Paper, document, or writing elements
- **Dark mode theme**: Contrast between light and dark
- **Scribe theme**: Pen, quill, or writing implement

### Suggested Design Concepts

1. **Crescent Moon with Document**: A crescent moon overlaying or beside a document icon
2. **Dark Document**: A document icon with a dark/night theme color scheme
3. **Moon and Pen**: Combination of moon and writing implement
4. **Toggle Symbol**: A visual representation of light/dark mode toggle

### Color Palette
Based on the extension's default theme colors:
- Background: #1e1e1e (dark gray)
- Text: #e0e0e0 (light gray)
- Accent: #4a9eff (blue)

Consider using:
- Dark blues and purples for night theme
- Light grays or whites for contrast
- Accent blue (#4a9eff) for highlights

### Technical Requirements

- **File Format**: PNG (Portable Network Graphics)
- **Color Mode**: RGB with alpha channel (transparency)
- **Bit Depth**: 24-bit color + 8-bit alpha (32-bit total)
- **Compression**: PNG compression (lossless)
- **Background**: Transparent (alpha channel)
- **Edges**: Anti-aliased for smooth appearance

## Current Status

The placeholder files currently exist at:
- `src/icons/icon-16.png` - Placeholder text file
- `src/icons/icon-48.png` - Placeholder text file
- `src/icons/icon-128.png` - Placeholder text file

These need to be replaced with actual PNG image files meeting the specifications above.

## Tools for Icon Creation

### Design Tools
- **Adobe Illustrator/Photoshop**: Professional design tools
- **Figma**: Free web-based design tool
- **Inkscape**: Free vector graphics editor
- **GIMP**: Free raster graphics editor
- **Affinity Designer**: Affordable professional tool

### Icon Generators
- **Favicon.io**: Simple icon generator
- **Canva**: Template-based design tool
- **IconKitchen**: Android/web icon generator
- **RealFaviconGenerator**: Multi-platform icon generator

### Export Settings
When exporting from design tools:
1. Set canvas size to exact dimensions (16x16, 48x48, 128x128)
2. Enable transparency/alpha channel
3. Export as PNG format
4. Ensure no compression artifacts
5. Verify file size is reasonable (typically 1-10 KB per icon)

## Verification

After creating the icons, verify:
1. ✓ Files are actual PNG images (not text placeholders)
2. ✓ Files have correct dimensions (16x16, 48x48, 128x128)
3. ✓ Files have transparency (alpha channel)
4. ✓ Icons are visually clear and recognizable
5. ✓ Icons follow the design theme
6. ✓ Icons work well on both light and dark backgrounds
7. ✓ File sizes are reasonable (< 50 KB each)

## Testing

Test the icons by:
1. Loading the extension in Firefox
2. Checking the toolbar icon (16x16)
3. Opening the Add-ons Manager (48x48)
4. Viewing the extension details page (128x128)
5. Testing on different Firefox themes (light/dark)

## References

- [Firefox Extension Icons Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)
- [Icon Design Best Practices](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/User_interface/Browser_styles)
- [Material Design Icons Guidelines](https://material.io/design/iconography)
