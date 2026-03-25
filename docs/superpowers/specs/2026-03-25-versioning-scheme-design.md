# Design: Versioning Scheme Implementation

## Overview
This design implements a structured versioning scheme for the "Open Gestures" extension to provide better tracking of code changes and formal releases.

## Versioning Rules
1. **Initial Version:** The scheme starts with `2026.0.0`.
2. **Format:** `major.minor.build` (e.g., `2026.0.1`).
3. **Build Increment:** The `build` number (the third digit) MUST be incremented for every code change or feature update.
4. **Major/Minor Increment:** The `major` (first digit) and `minor` (second digit) numbers are ONLY incremented upon explicit request from a human.
5. **Storage:**
   - The current version string is stored exclusively in `manifest.json`.
   - The versioning rules and scheme logic are documented in `GEMINI.md`.

## Changes Required

### 1. `manifest.json`
- Update the `"version"` field to `"2026.0.0"`.

### 2. `GEMINI.md`
- Add a new section titled "Versioning Scheme" explaining the rules defined above.

## Success Criteria
- `manifest.json` correctly reflects the new version format.
- `GEMINI.md` contains the authoritative documentation of the versioning rules.
- The versioning logic is clear and followed in future updates.
