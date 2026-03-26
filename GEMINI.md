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

### 3. Dynamic High-Contrast Color
- **Logic:** The extension analyzes the `window.getComputedStyle` of the page (checking `body` and `documentElement`).
- **Luminance Calculation:** Uses the formula `0.299R + 0.587G + 0.114B` to determine if the page is light or dark.
- **Selection:** Dynamically switches between **Cyan (#00ffff)** for dark pages and **Magenta (#ff00ff)** for light pages to ensure the trail is always visible.

### 4. Options & UI (Material Design 3)
- **Popup UI:** The options page was moved from a tab to a compact 280px popup.
- **Material Design:** Implemented MD3 color palettes, typography, and interactive switches.
- **Space Efficiency:** Feature descriptions are hidden behind hover-over tooltips to keep the popup clean.
- **Chrome Sync:** All settings (Trail toggle, Overlay toggle, Esc-to-Cancel, Dynamic Color, Fixed Color) are persisted across devices via `chrome.storage.sync`.

### 5. Interaction Safety
- **Escape to Cancel:** A specific listener is active *only* during a gesture, allowing the user to press `Esc` to void the action.
- **Autoscroll Blocking:** Standard middle-click autoscroll is suppressed when a gesture is detected.
- **Link Protection:** `auxclick` is prevented if the mouse has moved past the threshold, stopping middle-clicks from accidentally opening links during a gesture.

### 6. Event Handling
- Modernized to use `e.button === 1` for consistent middle-click detection across browsers.
- Uses `mousedown`, `mousemove`, `mouseup`, and `auxclick` with capturing/bubbling priority to ensure gesture reliability even on complex web apps.

---
*Maintained by Gemini CLI*

## Versioning Scheme

- **Base Version:** 2026.0.0
- **Format:** `major.minor.build` (e.g., 2026.0.1)
- **Build Increment:** The `build` number (third digit) increments automatically with every code change.
- **Major/Minor Increment:** `major` and `minor` numbers only get incremented as requested by a human.
- **Storage:** The version string is only stored in the extension manifest.

## Asset Management

- **Infographic Sync:** `assets/infographic.png` must always be updated in tandem with `assets/infographic.svg`.
- **Conversion Command:** Use `sips -s format png assets/infographic.svg --out assets/infographic.png` on macOS to perform the conversion.
- **Icon Source:** `assets/icon.png` is the primary icon for all manifest declarations.
