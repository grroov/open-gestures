# Versioning Scheme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a structured versioning scheme (major.minor.build) starting at 2026.0.0 and document the rules in GEMINI.md.

**Architecture:** Update static configuration files (manifest.json) and project documentation (GEMINI.md) to reflect the new scheme.

**Tech Stack:** JSON (manifest), Markdown (documentation).

---

### Task 1: Update manifest.json

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Update the version field**

Update the `version` field in `manifest.json` to `2026.0.0`.

```json
{
   "version": "2026.0.0"
}
```

- [ ] **Step 2: Verify JSON validity**

Run: `cat manifest.json | jq .` (if jq is available) or manually inspect.
Expected: Valid JSON with `"version": "2026.0.0"`.

- [ ] **Step 3: Commit**

```bash
git add manifest.json
git commit -m "chore: implement versioning scheme start at 2026.0.0"
```

---

### Task 2: Update GEMINI.md

**Files:**
- Modify: `GEMINI.md`

- [ ] **Step 1: Add Versioning Scheme section**

Add the following section to the end of `GEMINI.md`:

```markdown
## Versioning Scheme

- **Base Version:** 2026.0.0
- **Format:** `major.minor.build` (e.g., 2026.0.1)
- **Build Increment:** The `build` number (third digit) increments automatically with every code change.
- **Major/Minor Increment:** `major` and `minor` numbers only get incremented as requested by a human.
- **Storage:** The version string is only stored in the extension manifest.
```

- [ ] **Step 2: Verify documentation**

Run: `grep "Versioning Scheme" GEMINI.md`
Expected: Section exists in the file.

- [ ] **Step 3: Commit**

```bash
git add GEMINI.md
git commit -m "docs: document versioning scheme in GEMINI.md"
```
