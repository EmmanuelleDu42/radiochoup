---
title: RadioChoup Overview
summary: Web-based radio player project with custom CSS, JS, and multiple player versions.
tags: []
related: []
keywords: []
createdAt: '2026-05-06T15:07:58.499Z'
updatedAt: '2026-05-06T15:07:58.499Z'
---
## Reason
Initial curation of project structure and components

## Raw Concept
**Task:**
Document RadioChoup project structure

**Files:**
- js/script.js
- config/player_config.js
- css/player_style.css

**Flow:**
User opens index -> player_config loads -> script.js initializes player -> audio streams

**Timestamp:** 2026-05-06

## Narrative
### Structure
The project contains a main player and a "player2" variant. Assets are organized into css/, js/, img/, and fonts/ directories.

### Dependencies
Uses jQuery (implied by jplayer), Bootstrap, and FontAwesome.

### Highlights
Supports multiple radio stations (radio1-6.png), custom volume controls, and social media integration.

## Facts
- **Tech Stack**: The tech stack consists of Next.js 15.2, React 19, TypeScript 5.6, and Tailwind CSS v4.
- **Polling Strategy**: A singleton server-side StreamSource polls Icecast or Shoutcast every 4 seconds.
- **Broadcast Mechanism**: Server-Sent Events (SSE) are used to broadcast the 'now-playing' state to all clients to eliminate redundant polling.
- **State Management**: Song history is managed via an in-memory ring buffer with a 20-entry capacity, replacing the legacy player.log.
- **API Security**: The Vagalume API key is restricted to server-side use through the 'server-only' import.
- **Caching Policy**: iTunes covers are cached for 24 hours, while lyrics are cached for 7 days using unstable_cache or fetch revalidation.
- **PWA**: The PWA implementation uses a manual manifest and a minimal Service Worker without external libraries.
- **Deployment Options**: The project supports standalone output for deployment on VPS with PM2, Docker, or Vercel.
- **Execution Strategy**: The execution strategy is divided into 11 phases, 48 tasks, and 189 atomic steps.
- **Legacy Handling**: Legacy files such as api.php and index.php are retained until Phase 10 of the implementation.
- **Project Structure**: The project structure includes dedicated directories for API routes, UI components, hooks, library logic, and tests.
- **Testing Frameworks**: The testing suite utilizes Vitest for unit tests and Playwright for end-to-end (E2E) testing.
- **Environment Variables**: Environment variables define stream types, URLs, poll intervals, and API keys.
- **Next.js Configuration**: Next.js is configured for standalone output and strict mode, with specific remote patterns for iTunes image hosting.
- **Icecast Parser**: The Icecast parser extracts artist, song title, listener count, and bitrate from the icestats source data.
- **Data Types**: Shared TypeScript interfaces define the structure for NowPlaying, HistoryEntry, and StreamEvent data.
- **Component Architecture**: UI components are organized using Atomic design principles.
- **React Hooks**: Custom hooks like useAudioPlayer and useNowPlaying handle audio logic and SSE consumption respectively.
- **Branching Strategy**: All development work is performed on the refactor/redesign branch.
- **API Security Headers**: API routes include headers for Cache-Control: no-store and X-Content-Type-Options: nosniff.
