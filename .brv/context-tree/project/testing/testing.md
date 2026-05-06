---
title: Testing
summary: Technical details for Testing including 2 key facts
tags: []
related: []
keywords: []
createdAt: '2026-05-06T17:50:06.180Z'
updatedAt: '2026-05-06T17:50:06.180Z'
---
## Reason
Curate architectural and technical details from RLM context

## Raw Concept
**Task:**
Document Testing

**Timestamp:** 2026-05-06

## Narrative
### Structure
Overview of Testing based on extracted facts.

### Highlights
Unit tests are implemented with Vitest (41 tests) and E2E tests with Playwright (11 tests).
A stub at tests/__stubs__/server-only.ts and a Vitest alias are used to handle 'import server-only' modules during testing.

## Facts
- **Testing**: Unit tests are implemented with Vitest (41 tests) and E2E tests with Playwright (11 tests).
- **Testing**: A stub at tests/__stubs__/server-only.ts and a Vitest alias are used to handle 'import server-only' modules during testing.
