---
title: Environment Variables
summary: Technical details for Environment Variables including 1 key facts
tags: []
related: []
keywords: []
createdAt: '2026-05-06T17:50:06.177Z'
updatedAt: '2026-05-06T17:50:06.177Z'
---
## Reason
Curate architectural and technical details from RLM context

## Raw Concept
**Task:**
Document Environment Variables

**Timestamp:** 2026-05-06

## Narrative
### Structure
Overview of Environment Variables based on extracted facts.

### Highlights
Environment variables are split into env.server.ts (using server-only imports and lazy loading) and env.client.ts to prevent sensitive data leakage.

## Facts
- **Environment Variables**: Environment variables are split into env.server.ts (using server-only imports and lazy loading) and env.client.ts to prevent sensitive data leakage.
