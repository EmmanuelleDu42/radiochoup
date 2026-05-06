---
children_hash: c67858eb20c8e382e0d539c846fe2ef86db39f9b7ee19e358d259a23ff9ed880
compression_ratio: 0.6511627906976745
condensation_order: 1
covers: [context.md, radiochoup_overview.md]
covers_token_total: 860
summary_level: d1
token_count: 560
type: summary
---
# Domain: Project Architecture

## Overview
RadioChoup is a web-based radio player application transitioning from a legacy asset-heavy structure to a modern React-based stack. The architecture emphasizes server-side polling efficiency, real-time client updates via SSE, and a robust caching strategy for external metadata.

## Architectural Decisions & Tech Stack
*   **Core Framework**: Next.js 15.2 (App Router), React 19, TypeScript 5.6, and Tailwind CSS v4.
*   **Legacy Interoperability**: Retains `api.php` and `index.php` until late-stage implementation (Phase 10).
*   **State Management**: In-memory ring buffer (20-entry capacity) for song history, replacing the legacy `player.log` file.
*   **Security**: Server-side restriction of Vagalume API keys via `server-only` imports and standard security headers (`X-Content-Type-Options: nosniff`).

## Data Flow & Stream Management
*   **Polling Strategy**: A singleton `StreamSource` polls Icecast/Shoutcast every 4 seconds.
*   **Broadcast Mechanism**: Server-Sent Events (SSE) distribute 'now-playing' state to clients, eliminating redundant client-side polling.
*   **Parser Logic**: Extracts artist, title, listener count, and bitrate from Icecast source data.
*   **Caching Policy**: 24-hour cache for iTunes covers; 7-day cache for lyrics via `unstable_cache`.

## Component & Implementation Structure
*   **Organization**: UI follows Atomic Design principles; logic is encapsulated in custom hooks (`useAudioPlayer`, `useNowPlaying`).
*   **PWA**: Manual manifest and minimal Service Worker implementation for offline/mobile capabilities.
*   **Testing**: Vitest for unit testing and Playwright for E2E validation.
*   **Workflow**: Development is centralized on the `refactor/redesign` branch, following a structured 11-phase execution strategy.

## Key Files & Entry Points
*   **Initialization**: `js/script.js` (legacy) and `config/player_config.js`.
*   **Styles**: `css/player_style.css` and Tailwind configurations.
*   **Deployment**: Support for standalone output (VPS/PM2), Docker, or Vercel.

---
*For detailed project structure and legacy asset mapping, see **radiochoup_overview.md**. For high-level architectural goals, refer to the **architecture/context.md**.*