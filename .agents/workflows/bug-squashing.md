---
name: bug-squashing
description: Workflow for investigating, reproducing, and fixing bugs systematically.
---

# Workflow: Bug Squashing

## Objective
To fix a bug permanently by understanding the root cause, reproducing it with a test, applying a robust fix, and ensuring no regressions occur.

## Step 1: Reproduction & TDD
1. **Understand the Report:** Read the bug report or error trace carefully.
2. **Apply `test-driven-development` (The Prove-It Pattern):** DO NOT attempt to write the fix immediately. 
3. **Write a Failing Test:** Write a unit or integration test that reliably reproduces the exact bug described. The test MUST FAIL (Red state).

## Step 2: Investigation
1. **Trace the Data Flow:** Look at where the data enters the system and where it fails. 
2. **Check the Boundaries:** Is this an API contract mismatch? Are we reading a field (`avatar_url`) when the data is written to a different field (`image`)?
3. **Review Logs/Errors:** If applicable, inspect backend logs or browser console errors.

## Step 3: Implementation
1. **Apply the Fix:** Write the minimal amount of code necessary to make the failing test pass.
2. **Verify (Green State):** Run the test suite. The previously failing test must now pass.
3. **Apply `incremental-implementation`:** If the fix requires touching multiple files, do it in small, verifiable slices.

## Step 4: Refactoring & Quality Check
1. **Clean Up:** Now that the test passes, refactor the code for readability.
2. **Apply `code-review-and-quality`:** 
   - Did this fix introduce a security vulnerability?
   - Is it performant?
   - Does it handle null/undefined edge cases?
3. **Finalize:** Summarize the root cause and the fix for the user.
