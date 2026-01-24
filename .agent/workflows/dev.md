---
description: Follow the development roadmap to build the Boby platform
---

# Development Workflow

This workflow guides you through systematic development of the boby-platform.

## Before Starting Any Session

1. Navigate to the boby-platform directory:
   ```bash
   cd C:\Users\brand\.gemini\antigravity\scratch\boby-platform
   ```

2. Read the current build status:
   ```
   Open: .agent/artifacts/BUILD_STATUS.md
   ```

3. Check the full roadmap for context:
   ```
   Open: .agent/artifacts/DEVELOPMENT_ROADMAP.md
   ```

4. Review the brand style guide before any UI work:
   ```
   Open: .agent/artifacts/BRAND_STYLE_GUIDE.md
   ```

## Development Steps

// turbo
5. Install dependencies if needed:
   ```bash
   pnpm install
   ```

// turbo
6. Build @boby/ui before running apps:
   ```bash
   pnpm --filter @boby/ui build
   ```

// turbo
7. Start the agent-portal dev server:
   ```bash
   npm run dev --prefix apps/agent-portal
   ```

8. Work on tasks from the "Current Focus" section of BUILD_STATUS.md

9. Request UX review for any visual changes

## End of Session

10. Update BUILD_STATUS.md with:
    - Completed tasks
    - Current progress percentages
    - Any blockers encountered
    - Handoff notes for next session

11. Commit changes with descriptive message:
    ```bash
    git add -A
    git commit -m "type: description of changes"
    ```

## Phase Checkpoints

At the end of each phase:
1. Run all tests: `pnpm test`
2. Build all packages: `pnpm build`
3. Review with UX Lead
4. Get sign-off before proceeding

## Quick Reference

| Document | Purpose |
|----------|---------|
| BUILD_STATUS.md | Current state, what to work on |
| DEVELOPMENT_ROADMAP.md | Full plan, phases, timelines |
| BRAND_STYLE_GUIDE.md | Visual standards, NO emojis |

## Current Phase Tasks

Check BUILD_STATUS.md "Current Focus" section for immediate next steps.
