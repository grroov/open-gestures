# Open Gestures - Development History & Logic

This document summarizes the refactoring and feature enhancements performed during the March 2026 development session.

## Core Philosophy
The extension remains "super minimal" but has been upgraded from simple coordinate-based checks to robust radial and angular detection for the 8 basic directions.

## Version 2026 Evolution

### 1. Gesture Detection Logic (Radial & Angular)
- **Problem:** Original logic used "box-based" checks (`dx > 40`), making diagonals harder to trigger.
- **Solution:** Switched to **Radial Thresholds**. A gesture is triggered once the mouse moves 50px away from the start point, regardless of direction.
- **Direction Detection:** Uses `Math.atan2(dy, dx)` to divide the 360° space into eight 45° sectors. This ensures every direction (U, D, L, R, UL, UR, DL, DR) has an equal "slice" of the input space.

### 2. Visual Feedback & Trail
- **SVG Overlay:** A full-screen, pointer-events-none SVG overlay draws the gesture path in real-time.
- **Start Dot:** A small circle (size 3) marks the beginning of the gesture.
- **Anti-Aliasing:** Uses `shape-rendering: geometricPrecision` and rounded stroke-caps to ensure the 1px trail looks smooth on all displays.
- **Action Overlay:** A Material-styled label follows the cursor to show the recognized action (e.g., "Back", "Next Tab") before release.



### 4. Options & UI (Material Design 3)
- **Options Tab:** The options page is rendered as a beautiful, centered options page tab with modern MD3 color palettes, typography, and card-based elevations.
- **Space & Clarity:** Descriptions are presented as clean, minimal inline text snippets below each option instead of being hidden behind tooltips.
- **Chrome Sync:** All settings (Trail toggle, Key-Press Disable toggle, Trail Color, Excluded Domains list) are persisted across devices via `chrome.storage.sync`.

### 5. Interaction Safety
- **Key-Press Disable:** When enabled, pressing any key (including Escape) during a gesture drag will immediately cancel and abort the operation.
- **Autoscroll Blocking:** Standard middle-click autoscroll (when using Middle button) is suppressed when a gesture is detected.
- **Link Protection:** `auxclick` is prevented if the mouse has moved past the threshold, stopping clicks from accidentally opening links during a gesture.

### 6. Event Handling
- Modernized to dynamically check `e.button === settings.mouseButton` for consistent gesture triggering across browsers.
- Uses `mousedown`, `mousemove`, `mouseup`, and `auxclick` with capturing/bubbling priority to ensure gesture reliability even on complex web apps.

### 7. Customizable Mouse Button Trigger (Version 2026.3)
- **Flexibility:** Users can choose between Left, Middle, or Right mouse buttons to trigger gestures.
- **Context Menu Handling:** When Right click is selected, the native context menu is always suppressed to ensure smooth gesture execution. Users can still access the native menu at any time by holding down a modifier key (like Shift) while right-clicking.
- **Excluded Domains:** Easily configure a comma-separated list of domains (e.g. `remotedesktop.google.com, docs.google.com`) to completely disable the extension and restore 100% native control on those sites.

---
*Maintained by Gemini CLI*

## Versioning Scheme

- **Base Version:** 2026.0.0
- **Format:** `major.minor.build` (e.g., 2026.0.1)
- **Build Increment:** The `build` number (third digit) increments automatically with every code change.
- **Major/Minor Increment:** `major` and `minor` numbers only get incremented as requested by a human.
- **Storage:** The version string is only stored in the extension manifest.

## Asset Management

- **Infographic Sync:** `assets/*.png` versions MUST be updated via `sips` whenever `.svg` sources change.
- **Conversion Command:** Use `sips -s format png assets/[file].svg --out assets/[file].png` to perform the conversion.
- **Store Assets:**
  - `promo-tile.png` (440x280): Small tile with pink trail and twinkling stars.
  - `marquee-promo.png` (1400x560): High-res branding with gesture reference grid.
  - `infographic-1280.png` (1280x800): Standard infographic for Chrome Web Store.
  - `description.txt`: Concise one-paragraph description for CWS.

## Store Submission & Packaging

- **Release Package:** `open-gestures-v[version].zip`
- **Included Files:**
  - `manifest.json`
  - `background.js`
  - `gestures.js`
  - `options.html`
  - `options.js`
  - `assets/icon.png` (Only the primary icon is required in the ZIP).
- **Packaging Command:** `zip -r open-gestures-v2026.1.0.zip manifest.json background.js gestures.js options.html options.js assets/icon.png`

## Release & Publishing Constraints

- **No Remote Publishing:** NEVER run `git push` or `gh` commands (such as `gh release create`) that publish commits, tags, or releases to any remote git repository (like GitHub).
- **Local Commits Only:** Git commits and tags may only be made locally on the machine. Publishing/distributing the code or release packages to any remote or public server must be handled manually by the human operator.
