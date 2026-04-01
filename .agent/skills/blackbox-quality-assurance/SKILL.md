/* .agent/skills/blackbox-quality-assurance/SKILL.md */
---
name: blackbox-quality-assurance
description: Use when modifying core logic, state machines, or complex UI interactions to ensure no regressions and verify feature correctness via detailed test cases.
---

# Black-box Quality Assurance

## Overview
Ensures system stability by treating the application as a black box and verifying its behavior against a set of dynamically generated test cases after every significant change.

**Core Principle:** No code delivery without a passed regression report.

## When to Use
- After refactoring core data models or state hooks.
- When adjusting game balance or timing logic.
- Before claiming a feature is "done" to a user who expects high reliability.
- When `npm run build` is insufficient to catch logical or interactive bugs.

## The Process

### 1. Change Impact Analysis
Identify which user-facing behaviors might be affected by the code changes.
- **Direct Impact:** The feature being added/fixed.
- **Side Effects:** Related state transitions, UI responsiveness, data persistence.

### 2. Test Case Generation (Output this to the USER)
Generate a list of 3-5 specific scenarios. Each case should have:
- **Scenario:** What the user does.
- **Expected Result:** What the system should do.
- **Pass/Fail Criteria:** Clear observable outcomes.

### 3. Targeted & Regression Execution (MANDATORY BROWSER TEST)
- **Tool Requirement:** MUST use `open_browser_url` and `browser_subagent` OR `read_browser_page`.
- **Browser Actions:** 
    - Open the local dev server (e.g. `http://localhost:5173`).
    - Capture meaningful screenshots or logs of the UI.
    - Verify DOM elements (e.g. `.skewer` count) change after expected actions.
- **Full Session Check (MANDATORY for Core Changes):** 
    - MUST simulate at least 10 correct "Serve" (match-3) actions.
    - MUST monitor the `pending` queue per grill to ensure it never gets stuck if `pending > 0`.
    - Verification of "Play Again" cycle.
- **Main Flow Regression:** 
    - Start -> Normal Action -> Match/Score -> Win/Loss.
    - Verify data persistence (e.g., LocalStorage).
    - Verify error handling (e.g., rapid clicks/drags).

## Common Mistakes
- **Relying on Build Success:** Compiling ≠ Correct logic.
- **Skipping "Boring" Paths:** Only testing the new feature and ignoring the main game loop.
- **Missing Edge Cases:** Not testing what happens when the timer hits zero during an animation.

## Red Flags
- "It should work, I checked the code." (No evidence)
- "The build passed, so it's fine." (False security)
- "I'll test the whole thing at the end." (Delayed discovery of bugs)
