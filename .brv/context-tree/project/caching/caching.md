---
title: Caching
summary: Technical details for Caching including 1 key facts
tags: []
related: []
keywords: []
createdAt: '2026-05-06T17:50:06.198Z'
updatedAt: '2026-05-06T17:50:06.198Z'
---
## Reason
Curate architectural and technical details from RLM context

## Raw Concept
**Task:**
Document Caching

**Timestamp:** 2026-05-06

## Narrative
### Structure
Overview of Caching based on extracted facts.

### Highlights
Server-side caching uses a Map-based store with expiresAt timestamps, implemented as a singleton on globalThis to survive HMR in development.

## Facts
- **Caching**: Server-side caching uses a Map-based store with expiresAt timestamps, implemented as a singleton on globalThis to survive HMR in development.
